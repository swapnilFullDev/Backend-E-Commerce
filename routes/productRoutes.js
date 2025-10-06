const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ProductController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('store_id').notEmpty().withMessage('Store ID is required'),
    body('category_id').notEmpty().withMessage('Category ID is required'),
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    validate
  ],
  ProductController.create
);

router.get('/', authMiddleware, ProductController.getAll);

router.get('/store/:storeId', authMiddleware, ProductController.getByStoreId);

router.get('/:id', authMiddleware, ProductController.getById);

router.put('/:id', authMiddleware, ProductController.update);

router.patch('/:id/status', authMiddleware, ProductController.updateStatus);

router.patch('/:id/stock', authMiddleware, ProductController.updateStock);

router.delete('/:id', authMiddleware, ProductController.delete);

module.exports = router;
