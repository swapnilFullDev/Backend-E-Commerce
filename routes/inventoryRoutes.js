const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const inventoryController = require('../controllers/inventory.controller');

// Get all inventory items
router.get('/', authenticateToken, inventoryController.getInventoryByBusiness);

// Create new inventory item
router.post('/', authenticateToken, inventoryController.createInventoryItem);

// Update inventory item
router.put('/:id', authenticateToken, inventoryController.updateInventoryItem);

// Delete inventory item
router.delete('/:id', authenticateToken, inventoryController.deleteInventoryItem);

// Toggle fields (Rent, Status, Online)
router.patch('/toggle/:id', authenticateToken, inventoryController.toggleInventoryField);

module.exports = router;
