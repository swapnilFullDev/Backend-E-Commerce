const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');

// ✅ Get all top-level categories with pagination & search
router.get('/', authenticateToken, categoryController.getAllCategories);

// ✅ Create category or subcategory
router.post('/', authenticateToken, categoryController.createCategory);

// ✅ Get subcategories by parent ID
router.get('/:parentId/subcategories', authenticateToken, categoryController.getSubcategories);

// ✅ Get full category hierarchy path (for breadcrumbs)
router.get('/:id/path', authenticateToken, categoryController.getCategoryPath);

// ✅ Get all descendants (sub-sub-categories, etc.)
router.get('/:id/descendants', authenticateToken, categoryController.getAllDescendants);

// ✅ Get single category by ID
router.get('/:id', authenticateToken, categoryController.getCategoryById);

// ✅ Update category
router.put('/:id', authenticateToken, categoryController.updateCategory);

// ✅ Delete category safely
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;