const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CategoryController = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('name').notEmpty().withMessage('Category name is required'),
    validate
  ],
  CategoryController.create
);

router.get('/', authMiddleware, CategoryController.getAll);

router.get('/with-subcategories', authMiddleware, CategoryController.getWithSubcategories);

router.get('/:id', authMiddleware, CategoryController.getById);

router.put('/:id', authMiddleware, CategoryController.update);

router.patch('/:id/status', authMiddleware, CategoryController.updateStatus);

router.delete('/:id', authMiddleware, CategoryController.delete);

module.exports = router;
