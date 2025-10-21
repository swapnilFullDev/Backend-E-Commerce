const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CategoryModel = require('../models/categoryModel');

// GET all top-level categories with pagination & search
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.q || '';

  try {
    const categories = await CategoryModel.getCategories(page, limit, search);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create category or subcategory
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, image, icon, parentId, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const categoryId = await CategoryModel.createCategory({ name, image, icon, parentId, status });

    res.status(201).json({
      message: parentId ? 'Subcategory created successfully.' : 'Category created successfully.',
      categoryId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET subcategories by parent ID
router.get('/:parentId/subcategories', authenticateToken, async (req, res) => {
  try {
    const parentId = parseInt(req.params.parentId);
    if (isNaN(parentId)) {
      return res.status(400).json({ error: 'Invalid parent ID' });
    }

    const subcategories = await CategoryModel.getSubcategories(parentId);
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE category safely
router.delete('/:id', authenticateToken, async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) {
    return res.status(200).json({ success: false, message: 'Invalid category ID.' });
  }

  try {
    await CategoryModel.deleteCategory(categoryId);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    if (err.code === 'HAS_SUBCATEGORIES') {
      return res.status(200).json({ success: false, message: 'Cannot delete category: it has subcategories.' });
    }
    if (err.code === 'HAS_PRODUCTS') {
      return res.status(200).json({ success: false, message: 'Cannot delete category: it has linked products.' });
    }
    res.status(200).json({ success: false, message: 'Failed to delete category.', details: err.message });
  }
});

module.exports = router;
