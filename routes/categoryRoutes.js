const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const CategoryModel = require('../models/categoryModel');

// GET get all top-level categories
router.get('/', authenticateToken,async (req, res) => {
    try {
      const categories = await CategoryModel.getCategories();
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // GET get subcategories by parent ID
  router.get('/:parentId/subcategories', authenticateToken,async (req, res) => {
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
  
  module.exports = router;