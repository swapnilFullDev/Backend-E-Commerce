const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const businessController = require('../controllers/business.controller');

// ✅ Create a new business
router.post('/', businessController.createBusiness);

// ✅ Get all businesses with pagination and search
router.get('/', authenticateToken, businessController.getAllBusinesses);

// ✅ Get all unverified businesses
router.get('/unverified', authenticateToken, businessController.getUnverifiedBusinesses);

// ✅ Get business by ID
router.get('/:id', authenticateToken, businessController.getBusinessById);

// ✅ Update business by ID
router.put('/:id', authenticateToken, businessController.updateBusiness);

// ✅ Delete business by ID
router.delete('/:id', authenticateToken, businessController.deleteBusiness);

module.exports = router;
