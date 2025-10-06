const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const RentalController = require('../controllers/rentalController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('store_id').notEmpty().withMessage('Store ID is required'),
    body('customer_id').notEmpty().withMessage('Customer ID is required'),
    body('product_id').notEmpty().withMessage('Product ID is required'),
    body('rental_start_date').notEmpty().withMessage('Rental start date is required'),
    body('rental_end_date').notEmpty().withMessage('Rental end date is required'),
    validate
  ],
  RentalController.create
);

router.get('/', authMiddleware, RentalController.getAll);

router.get('/store/:storeId', authMiddleware, RentalController.getByStoreId);

router.get('/:id', authMiddleware, RentalController.getById);

router.put('/:id', authMiddleware, RentalController.update);

router.patch('/:id/return-status', authMiddleware, RentalController.updateReturnStatus);

module.exports = router;
