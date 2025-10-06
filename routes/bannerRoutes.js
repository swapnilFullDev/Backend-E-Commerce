const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const BannerController = require('../controllers/bannerController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  [
    authMiddleware,
    body('title').notEmpty().withMessage('Banner title is required'),
    body('image').notEmpty().withMessage('Banner image is required'),
    validate
  ],
  BannerController.create
);

router.get('/', authMiddleware, BannerController.getAll);

router.get('/:id', authMiddleware, BannerController.getById);

router.put('/:id', authMiddleware, BannerController.update);

router.patch('/:id/status', authMiddleware, BannerController.updateStatus);

router.delete('/:id', authMiddleware, BannerController.delete);

module.exports = router;
