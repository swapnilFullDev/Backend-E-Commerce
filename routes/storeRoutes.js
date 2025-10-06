const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const StoreController = require('../controllers/storeController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('store_name').notEmpty().withMessage('Store name is required'),
    body('store_address').notEmpty().withMessage('Store address is required'),
    body('contact_number').notEmpty().withMessage('Contact number is required'),
    validate
  ],
  StoreController.create
);

router.get('/', authMiddleware, StoreController.getAll);

router.get('/my-stores', authMiddleware, StoreController.getMyStores);

router.get('/:id', authMiddleware, StoreController.getById);

router.put('/:id', authMiddleware, StoreController.update);

router.patch('/:id/status', authMiddleware, StoreController.updateStatus);

router.delete('/:id', authMiddleware, StoreController.delete);

module.exports = router;
