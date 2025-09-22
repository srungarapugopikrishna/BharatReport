const express = require('express');
const { Authority, Category } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateAuthority = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('level').isIn(['MP', 'MLA', 'Mayor', 'Corporator', 'Ward Member', 'Engineer', 'Contractor', 'Supervisor', 'Other']).withMessage('Valid authority level required'),
  body('designation').trim().isLength({ min: 2, max: 100 }).withMessage('Designation must be between 2 and 100 characters'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  body('jurisdiction').isObject().withMessage('Jurisdiction information required'),
  body('categories').isArray().withMessage('Categories must be an array'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Get all authorities
router.get('/', async (req, res) => {
  try {
    const { categoryId, level, isActive = true } = req.query;
    
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (level) where.level = level;
    
    const authorities = await Authority.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'Categories',
          through: { attributes: [] },
          where: categoryId ? { id: categoryId } : undefined,
          required: categoryId ? true : false
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ data: authorities });
  } catch (error) {
    console.error('Error fetching authorities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get authority by ID
router.get('/:id', async (req, res) => {
  try {
    const authority = await Authority.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'Categories',
          through: { attributes: [] }
        }
      ]
    });

    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }

    res.json({ data: authority });
  } catch (error) {
    console.error('Error fetching authority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new authority (Admin only)
router.post('/', authenticateToken, requireAdmin, validateAuthority, async (req, res) => {
  try {
    const { categories, ...authorityData } = req.body;
    
    const authority = await Authority.create(authorityData);
    
    // Associate with categories
    if (categories && categories.length > 0) {
      await authority.setCategories(categories);
    }

    // Fetch with categories
    const authorityWithCategories = await Authority.findByPk(authority.id, {
      include: [
        {
          model: Category,
          as: 'Categories',
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({ data: authorityWithCategories });
  } catch (error) {
    console.error('Error creating authority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update authority (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validateAuthority, async (req, res) => {
  try {
    const { categories, ...authorityData } = req.body;
    
    const authority = await Authority.findByPk(req.params.id);
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }

    await authority.update(authorityData);
    
    // Update category associations
    if (categories !== undefined) {
      await authority.setCategories(categories);
    }

    // Fetch with categories
    const updatedAuthority = await Authority.findByPk(authority.id, {
      include: [
        {
          model: Category,
          as: 'Categories',
          through: { attributes: [] }
        }
      ]
    });

    res.json({ data: updatedAuthority });
  } catch (error) {
    console.error('Error updating authority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete authority (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const authority = await Authority.findByPk(req.params.id);
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }

    await authority.destroy();
    res.json({ message: 'Authority deleted successfully' });
  } catch (error) {
    console.error('Error deleting authority:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get authorities by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const authorities = await Authority.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'Categories',
          through: { attributes: [] },
          where: { id: req.params.categoryId }
        }
      ],
      order: [['level', 'ASC'], ['name', 'ASC']]
    });

    res.json({ data: authorities });
  } catch (error) {
    console.error('Error fetching authorities by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
