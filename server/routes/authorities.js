const express = require('express');
const { Authority, Category, Subcategory } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Normalize payload then validate
const validateAuthority = [
  // Normalize incoming fields to `level` only
  (req, _res, next) => {
    req.body.level = (req.body.level || req.body.authorityLevel || req.body.name || '').toString().trim();
    if (!Array.isArray(req.body.categories) && req.body.categoryId) {
      req.body.categories = [req.body.categoryId];
    }
    if (!Array.isArray(req.body.subcategories) && req.body.subcategoryId) {
      req.body.subcategories = [req.body.subcategoryId];
    }
    next();
  },
  // Ensure one of authorityLevel/level/name is provided and valid
  body('level').custom((lvl) => {
    if (!lvl || lvl.length < 2 || lvl.length > 100) {
      throw new Error('Authority level must be 2-100 characters');
    }
    return true;
  }),
  // Either categories (array) or categoryId (single) must be provided
  body(['categories', 'categoryId']).custom((value, { req }) => {
    const categories = Array.isArray(req.body.categories) ? req.body.categories : [];
    if (!categories || categories.length === 0) {
      throw new Error('Category is required');
    }
    return true;
  }),
  body('subcategories')
    .optional()
    .isArray()
    .withMessage('Subcategories must be an array'),
  body(['description', 'notes'])
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be a string of reasonable length'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Authority validation failed:', {
        body: req.body,
        errors: errors.array()
      });
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
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
        },
        {
          model: Subcategory,
          as: 'Subcategories',
          through: { attributes: [] },
          required: false
        }
      ],
      attributes: { include: [] },
      order: [['level', 'ASC']]
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
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Normalize
    const level = (req.body.level || req.body.authorityLevel || req.body.name || '').toString().trim();
    const description = req.body.description || req.body.notes || '';
    const categories = Array.isArray(req.body.categories)
      ? req.body.categories
      : (req.body.categoryId ? [req.body.categoryId] : []);
    const subcategories = Array.isArray(req.body.subcategories)
      ? req.body.subcategories
      : (req.body.subcategoryId ? [req.body.subcategoryId] : []);

    if (!level || level.length < 2 || level.length > 100) {
      return res.status(400).json({ error: 'Validation failed', details: [{ path: 'level', msg: 'Authority level must be 2-100 characters' }] });
    }
    if (!categories || categories.length === 0) {
      return res.status(400).json({ error: 'Validation failed', details: [{ path: 'categories', msg: 'Category is required' }] });
    }

    const authority = await Authority.create({
      level,
      description,
      isActive: true
    });
    
    // Associate with categories
    if (categories && categories.length > 0) await authority.setCategories(categories);
    if (subcategories && subcategories.length > 0) await authority.setSubcategories(subcategories);

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
    console.error('Error creating authority:', error, 'Body:', req.body);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Update authority (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const level = (req.body.level || req.body.authorityLevel || req.body.name || '').toString().trim();
    const description = req.body.description || req.body.notes || '';
    const categories = Array.isArray(req.body.categories)
      ? req.body.categories
      : (req.body.categoryId ? [req.body.categoryId] : undefined);
    const subcategories = Array.isArray(req.body.subcategories)
      ? req.body.subcategories
      : (req.body.subcategoryId ? [req.body.subcategoryId] : undefined);

    if (!level || level.length < 2 || level.length > 100) {
      return res.status(400).json({ error: 'Validation failed', details: [{ path: 'level', msg: 'Authority level must be 2-100 characters' }] });
    }
    
    const authority = await Authority.findByPk(req.params.id);
    if (!authority) {
      return res.status(404).json({ error: 'Authority not found' });
    }

    await authority.update({
      level,
      description,
      isActive: authority.isActive !== undefined ? authority.isActive : true
    });
    
    // Update associations
    if (categories !== undefined) await authority.setCategories(categories);
    if (subcategories !== undefined) await authority.setSubcategories(subcategories);

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
      order: [['level', 'ASC']]
    });

    res.json({ data: authorities });
  } catch (error) {
    console.error('Error fetching authorities by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get authorities by subcategory
router.get('/subcategory/:subcategoryId', async (req, res) => {
  try {
    const authorities = await Authority.findAll({
      where: { isActive: true },
      include: [
        {
          model: Subcategory,
          as: 'Subcategories',
          through: { attributes: [] },
          where: { id: req.params.subcategoryId }
        }
      ],
      order: [['level', 'ASC']]
    });

    res.json({ data: authorities });
  } catch (error) {
    console.error('Error fetching authorities by subcategory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
