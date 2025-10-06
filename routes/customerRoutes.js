const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const CustomerController = require('../controllers/customerController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('name').notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate
  ],
  CustomerController.create
);

router.get('/', authMiddleware, CustomerController.getAll);

router.get('/:id', authMiddleware, CustomerController.getById);

router.put('/:id', authMiddleware, CustomerController.update);

router.patch('/:id/status', authMiddleware, CustomerController.updateStatus);

module.exports = router;
