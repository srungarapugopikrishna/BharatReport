const express = require('express');
const { Op } = require('sequelize');
const { Issue, Category, Subcategory, Official } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate, categoryId, status } = req.query;
    
    const where = {};
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    // Total issues count
    const totalIssues = await Issue.count({ where });

    // Issues by status
    const issuesByStatus = await Issue.findAll({
      attributes: [
        'status',
        [Issue.sequelize.fn('COUNT', Issue.sequelize.col('id')), 'count']
      ],
      where,
      group: ['status']
    });

    // Issues by category
    const issuesByCategory = await Issue.findAll({
      attributes: [
        [Issue.sequelize.fn('COUNT', Issue.sequelize.col('Issue.id')), 'count']
      ],
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon']
        }
      ],
      where,
      group: ['Category.id', 'Category.name', 'Category.nameHindi', 'Category.nameTelugu', 'Category.color', 'Category.icon']
    });

    // Issues by priority
    const issuesByPriority = await Issue.findAll({
      attributes: [
        'priority',
        [Issue.sequelize.fn('COUNT', Issue.sequelize.col('id')), 'count']
      ],
      where,
      group: ['priority']
    });

    // Resolution time analytics (simplified for now)
    const resolvedIssues = [];

    // Most responsive officials
    const responsiveOfficials = await Official.findAll({
      attributes: [
        'id',
        'name',
        'designation',
        'department',
        'responseTime',
        'resolutionRate'
      ],
      where: { isActive: true },
      order: [['resolutionRate', 'DESC'], ['responseTime', 'ASC']],
      limit: 10
    });

    // Recent issues (last 7 days)
    const recentIssues = await Issue.findAll({
      where: {
        ...where,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color'] },
        { model: Subcategory, attributes: ['id', 'name', 'nameHindi', 'nameTelugu'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Heatmap data (issues by location)
    const heatmapData = await Issue.findAll({
      attributes: [
        'location',
        [Issue.sequelize.fn('COUNT', Issue.sequelize.col('id')), 'count']
      ],
      where: {
        ...where,
        location: { [Op.ne]: null }
      },
      group: ['location']
    });

    res.json({
      overview: {
        totalIssues,
        issuesByStatus: issuesByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        issuesByPriority: issuesByPriority.reduce((acc, item) => {
          acc[item.priority] = parseInt(item.dataValues.count);
          return acc;
        }, {}),
        resolutionRate: totalIssues > 0 ? 
          ((issuesByStatus.find(s => s.status === 'resolved')?.dataValues.count || 0) / totalIssues * 100).toFixed(2) : 0
      },
      categories: issuesByCategory.map(item => ({
        category: item.Category,
        count: parseInt(item.dataValues.count)
      })),
      resolutionTime: resolvedIssues.map(item => ({
        category: item.Category,
        avgResolutionTime: Math.round(item.dataValues.avgResolutionTime / 3600 * 100) / 100 // Convert to hours
      })),
      responsiveOfficials,
      recentIssues,
      heatmapData: heatmapData.map(item => ({
        location: item.location,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { categoryId, status, startDate, endDate } = req.query;
    
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const issues = await Issue.findAll({
      attributes: ['id', 'location', 'status', 'priority', 'createdAt'],
      where: {
        ...where,
        location: { [Op.ne]: null }
      },
      include: [
        { model: Category, attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color'] }
      ]
    });

    res.json(issues);
  } catch (error) {
    console.error('Get heatmap data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get category analytics
router.get('/categories', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };

    const categoryStats = await Issue.findAll({
      attributes: [
        [Issue.sequelize.fn('COUNT', Issue.sequelize.col('Issue.id')), 'totalIssues'],
        [Issue.sequelize.fn('COUNT', 
          Issue.sequelize.literal('CASE WHEN status IN (\'resolved\', \'verified\', \'closed\') THEN 1 END')
        ), 'resolvedIssues'],
        [Issue.sequelize.literal('0'), 'avgResolutionTime']
      ],
      include: [
        {
          model: Category,
          attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'color', 'icon']
        }
      ],
      where,
      group: ['Category.id', 'Category.name', 'Category.nameHindi', 'Category.nameTelugu', 'Category.color', 'Category.icon']
    });

    res.json(categoryStats.map(stat => ({
      category: stat.Category,
      totalIssues: parseInt(stat.dataValues.totalIssues),
      resolvedIssues: parseInt(stat.dataValues.resolvedIssues),
      resolutionRate: stat.dataValues.totalIssues > 0 ? 
        (stat.dataValues.resolvedIssues / stat.dataValues.totalIssues * 100).toFixed(2) : 0,
      avgResolutionTime: stat.dataValues.avgResolutionTime ? 
        Math.round(stat.dataValues.avgResolutionTime / 3600 * 100) / 100 : null
    })));
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get official performance analytics
router.get('/officials', async (req, res) => {
  try {
    const officials = await Official.findAll({
      attributes: [
        'id',
        'name',
        'designation',
        'department',
        'responseTime',
        'resolutionRate'
      ],
      where: { isActive: true },
      order: [['resolutionRate', 'DESC']]
    });

    // Get detailed stats for each official
    const detailedStats = await Promise.all(
      officials.map(async (official) => {
        const totalIssues = await Issue.count({
          where: {
            assignedOfficials: {
              [Op.contains]: [official.id]
            }
          }
        });

        const resolvedIssues = await Issue.count({
          where: {
            assignedOfficials: {
              [Op.contains]: [official.id]
            },
            status: ['resolved', 'verified', 'closed']
          }
        });

        return {
          ...official.toJSON(),
          totalIssues,
          resolvedIssues,
          actualResolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(2) : 0
        };
      })
    );

    res.json(detailedStats);
  } catch (error) {
    console.error('Get official analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
