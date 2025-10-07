const express = require('express');
const { Category, Subcategory } = require('../models');
const { authenticateToken, requireRole, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Subcategory,
          where: { isActive: true },
          required: false,
          attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'description', 'authorityTypes']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Subcategory,
          where: { isActive: true },
          required: false,
          attributes: ['id', 'name', 'nameHindi', 'nameTelugu', 'description', 'authorityTypes']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, nameHindi, nameTelugu, description, icon, color } = req.body;

    const category = await Category.create({
      name,
      nameHindi,
      nameTelugu,
      description,
      icon,
      color
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, nameHindi, nameTelugu, description, icon, color, isActive } = req.body;
    
    await category.update({
      name,
      nameHindi,
      nameTelugu,
      description,
      icon,
      color,
      isActive
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.update({ isActive: false });
    res.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subcategories by category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.findAll({
      where: {
        categoryId: req.params.categoryId,
        isActive: true
      },
      order: [['name', 'ASC']]
    });

    res.json(subcategories);
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subcategory (admin only)
router.post('/:categoryId/subcategories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, nameHindi, nameTelugu, description, authorityTypes, isActive } = req.body;

    const subcategory = await Subcategory.create({
      name,
      nameHindi,
      nameTelugu,
      description,
      authorityTypes,
      isActive,
      categoryId: req.params.categoryId
    });

    res.status(201).json(subcategory);
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subcategory (admin only)
router.put('/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const { name, nameHindi, nameTelugu, description, isActive, authorityTypes } = req.body;
    
    await subcategory.update({
      name,
      nameHindi,
      nameTelugu,
      description,
      authorityTypes,
      isActive
    });

    res.json(subcategory);
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subcategory (admin only)
router.delete('/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subcategory = await Subcategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    await subcategory.update({ isActive: false });
    res.json({ message: 'Subcategory deactivated successfully' });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
