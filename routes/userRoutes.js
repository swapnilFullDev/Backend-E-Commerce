const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');

// Public
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected
router.get('/', authenticateToken, UserController.getAll);
router.get('/:id', authenticateToken, UserController.getById);
router.put('/:id', authenticateToken, UserController.update);
router.delete('/soft/:id', authenticateToken, UserController.softDelete);
router.delete('/hard/:id', authenticateToken, UserController.hardDelete);

module.exports = router;
