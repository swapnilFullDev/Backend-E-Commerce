const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// ✅ Approve or unverify a business and create login
router.put('/approve/:id', authenticateToken, adminController.approveBusinessAndCreateLogin);

// ✅ Create Super Admin
router.post('/super', adminController.createSuperAdmin);

module.exports = router;