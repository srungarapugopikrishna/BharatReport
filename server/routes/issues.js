const express = require('express');
const { Op } = require('sequelize');
const { Issue, Category, Subcategory, User, Comment, Upvote, Official, Authority, sequelize } = require('../models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateIssue, validateComment } = require('../middleware/validation');

const router = express.Router();

// Generate issue ID
const generateIssueId = async () => {
  const year = new Date().getFullYear();
  const count = await Issue.count();
  return `JR-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Get all issues with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      categoryId,
      subcategoryId,
      priority,
      lat,
      lng,
      radius = 10, // km
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (priority) where.priority = priority;

    // Location-based filtering
    if (lat && lng) {
      where.location = {
        [Op.and]: [
          sequelize.where(
            sequelize.fn(
              'ST_DWithin',
              sequelize.col('location'),
              sequelize.fn('ST_Point', lng, lat),
              radius * 1000 // Convert km to meters
            ),
            true
          )
        ]
      };
    }

    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] },
        { model: User, attributes: ['id', 'name'], required: false },
        { model: Authority, attributes: ['id', 'name', 'level', 'designation', 'department'], required: false }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      issues,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single issue
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] },
        { model: User, attributes: ['id', 'name'], required: false },
        { model: Authority, attributes: ['id', 'name', 'level', 'designation', 'department', 'email', 'phone'], required: false },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['id', 'name'], required: false },
            { model: Official, attributes: ['id', 'name', 'designation'], required: false }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Debug: log media data
    console.log('Issue media data:', issue.media);
    if (issue.media) {
      issue.media.forEach((media, index) => {
        console.log(`Media ${index}:`, media, 'Type:', typeof media, 'Length:', media?.length);
      });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new issue
router.post('/', authenticateToken, validateIssue, async (req, res) => {
  try {
    // Debug: log the received media data
    console.log('Received media data:', req.body.media);
    if (req.body.media) {
      req.body.media.forEach((media, index) => {
        console.log(`Received media ${index}:`, media, 'Type:', typeof media, 'Length:', media?.length);
      });
    }
    
    const issueId = await generateIssueId();
    
    const issue = await Issue.create({
      issueId,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      media: req.body.media || [],
      isAnonymous: req.body.isAnonymous || false,
      userId: req.user.isAnonymous ? null : req.user.id,
      categoryId: req.body.categoryId,
      subcategoryId: req.body.subcategoryId,
      assignedOfficials: req.body.assignedOfficials || []
    });

    // Auto-assign officials based on location and category
    if (!req.body.assignedOfficials || req.body.assignedOfficials.length === 0) {
      const officials = await Official.findAll({
        where: {
          isActive: true,
          categories: {
            [Op.contains]: [req.body.categoryId]
          }
        }
      });

      if (officials.length > 0) {
        await issue.update({
          assignedOfficials: officials.slice(0, 3).map(o => o.id)
        });
      }
    }

    const createdIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] },
        { model: User, attributes: ['id', 'name'], required: false }
      ]
    });

    res.status(201).json(createdIssue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue (for issue reporters)
router.put('/:id', authenticateToken, validateIssue, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check if user can update this issue
    const canUpdate = req.user.role === 'admin' || 
                     (issue.userId && issue.userId === req.user.id) ||
                     (issue.isAnonymous && req.user.isAnonymous && req.user.name === issue.User?.name);

    if (!canUpdate) {
      return res.status(403).json({ error: 'You can only update your own issues' });
    }

    // Update issue
    await issue.update({
      title: req.body.title,
      description: req.body.description,
      categoryId: req.body.categoryId,
      subcategoryId: req.body.subcategoryId,
      priority: req.body.priority,
      location: req.body.location,
      media: req.body.media || []
    });

    // Fetch updated issue with associations
    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] },
        { model: User, attributes: ['id', 'name'], required: false }
      ]
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue status (for officials and issue reporters)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, resolutionNotes, resolutionMedia } = req.body;
    
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // For citizen accountability platform, all authenticated users can update status
    // This allows citizens to track and pressure officials for better governance
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'official' || 
                     req.user.isAnonymous || 
                     (issue.userId && issue.userId === req.user.id);

    if (!canUpdate) {
      return res.status(403).json({ error: 'Authentication required to update issue status' });
    }

    const updates = { status };
    
    if (status === 'resolved') {
      updates.resolvedAt = new Date();
      if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
      if (resolutionMedia) updates.resolutionMedia = resolutionMedia;
    }

    await issue.update(updates);

    // Fetch updated issue with associations
    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] },
        { model: User, attributes: ['id', 'name'], required: false },
        {
          model: Comment,
          include: [
            { model: User, attributes: ['id', 'name'], required: false },
            { model: Official, attributes: ['id', 'name', 'designation'], required: false }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, validateComment, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const comment = await Comment.create({
      content: req.body.content,
      issueId: req.params.id,
      userId: req.user.isAnonymous ? null : req.user.id,
      isOfficial: req.user.role === 'official',
      isInternal: req.body.isInternal || false
    });

    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        { model: User, attributes: ['id', 'name'], required: false },
        { model: Official, attributes: ['id', 'name', 'designation'], required: false }
      ]
    });

    res.status(201).json(createdComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upvote issue
router.post('/:id/upvote', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const whereClause = { issueId: req.params.id };
    if (req.user) {
      whereClause.userId = req.user.id;
    } else {
      whereClause.ipAddress = req.ip;
    }

    const existingUpvote = await Upvote.findOne({ where: whereClause });
    
    if (existingUpvote) {
      return res.status(400).json({ error: 'Already upvoted' });
    }

    await Upvote.create(whereClause);
    
    // Update issue upvote count
    const upvoteCount = await Upvote.count({ where: { issueId: req.params.id } });
    await issue.update({ upvotes: upvoteCount });

    res.json({ message: 'Issue upvoted successfully', upvotes: upvoteCount });
  } catch (error) {
    console.error('Upvote issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's issues
router.get('/user/my-issues', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      issues,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
