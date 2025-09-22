const express = require('express');
const { Op } = require('sequelize');
const { Official, Issue, Category } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all officials
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, department, categoryId, lat, lng, radius = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { isActive: true };
    
    if (department) where.department = department;
    if (categoryId) where.categories = { [Op.contains]: [categoryId] };

    const officials = await Official.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      officials: officials.rows,
      pagination: {
        total: officials.count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(officials.count / limit)
      }
    });
  } catch (error) {
    console.error('Get officials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get officials by location and category
router.get('/suggest', async (req, res) => {
  try {
    const { lat, lng, categoryId, limit = 5 } = req.query;

    if (!lat || !lng || !categoryId) {
      return res.status(400).json({ error: 'Latitude, longitude, and category ID are required' });
    }

    // For now, return all officials for the category
    // In a real implementation, you would use geospatial queries
    const officials = await Official.findAll({
      where: {
        isActive: true,
        categories: {
          [Op.contains]: [categoryId]
        }
      },
      limit: parseInt(limit),
      order: [['responseTime', 'ASC'], ['resolutionRate', 'DESC']]
    });

    res.json(officials);
  } catch (error) {
    console.error('Get suggested officials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single official
router.get('/:id', async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'nameHindi', 'nameTelugu'],
          as: 'categories'
        }
      ]
    });

    if (!official) {
      return res.status(404).json({ error: 'Official not found' });
    }

    res.json(official);
  } catch (error) {
    console.error('Get official error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create official (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      designation,
      department,
      email,
      phone,
      jurisdiction,
      categories
    } = req.body;

    const official = await Official.create({
      name,
      designation,
      department,
      email,
      phone,
      jurisdiction,
      categories: categories || []
    });

    res.status(201).json(official);
  } catch (error) {
    console.error('Create official error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update official (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) {
      return res.status(404).json({ error: 'Official not found' });
    }

    const {
      name,
      designation,
      department,
      email,
      phone,
      jurisdiction,
      categories,
      isActive
    } = req.body;

    await official.update({
      name,
      designation,
      department,
      email,
      phone,
      jurisdiction,
      categories: categories || official.categories,
      isActive
    });

    res.json(official);
  } catch (error) {
    console.error('Update official error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete official (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) {
      return res.status(404).json({ error: 'Official not found' });
    }

    await official.update({ isActive: false });
    res.json({ message: 'Official deactivated successfully' });
  } catch (error) {
    console.error('Delete official error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get official's assigned issues
router.get('/:id/issues', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {
      assignedOfficials: {
        [Op.contains]: [req.params.id]
      }
    };
    
    if (status) where.status = status;

    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon'] },
        { model: User, attributes: ['id', 'name'], required: false }
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
    console.error('Get official issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get official statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const official = await Official.findByPk(req.params.id);
    if (!official) {
      return res.status(404).json({ error: 'Official not found' });
    }

    const totalIssues = await Issue.count({
      where: {
        assignedOfficials: {
          [Op.contains]: [req.params.id]
        }
      }
    });

    const resolvedIssues = await Issue.count({
      where: {
        assignedOfficials: {
          [Op.contains]: [req.params.id]
        },
        status: ['resolved', 'verified', 'closed']
      }
    });

    const inProgressIssues = await Issue.count({
      where: {
        assignedOfficials: {
          [Op.contains]: [req.params.id]
        },
        status: 'in_progress'
      }
    });

    const openIssues = await Issue.count({
      where: {
        assignedOfficials: {
          [Op.contains]: [req.params.id]
        },
        status: 'open'
      }
    });

    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

    res.json({
      totalIssues,
      resolvedIssues,
      inProgressIssues,
      openIssues,
      resolutionRate: Math.round(resolutionRate * 100) / 100,
      responseTime: official.responseTime,
      resolutionRate: official.resolutionRate
    });
  } catch (error) {
    console.error('Get official stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
