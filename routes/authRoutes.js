const express = require('express');
const router = express.Router();
const userController = require('../controllers/auth.controller');

// ✅ User Login
router.post('/login', userController.loginUser);

// ✅ Reset Password
router.post('/reset', userController.resetPassword);

module.exports = router;