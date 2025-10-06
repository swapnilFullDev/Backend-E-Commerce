const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const OrderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('customer_id').notEmpty().withMessage('Customer ID is required'),
    body('store_id').notEmpty().withMessage('Store ID is required'),
    body('total_amount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    validate
  ],
  OrderController.create
);

router.get('/', authMiddleware, OrderController.getAll);

router.get('/store/:storeId', authMiddleware, OrderController.getByStoreId);

router.get('/:id', authMiddleware, OrderController.getById);

router.get('/number/:orderNumber', authMiddleware, OrderController.getByOrderNumber);

router.put('/:id', authMiddleware, OrderController.update);

router.patch('/:id/status', authMiddleware, OrderController.updateStatus);

module.exports = router;
