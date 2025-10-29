const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const InventoryModel = require('../models/inventoryModel');

// Get all inventory items by business_id
router.get('/', authenticateToken, async (req, res) => {
  const businessId = Number(req.query.business_id);
  if (!businessId) {
    return res.status(400).json({ error: 'business_id query parameter is required' });
  }
  try {
    const inventory = await InventoryModel.getInventoryByBusiness(businessId);
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
});

// Add a new inventory item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newItem = req.body;
    const result = await InventoryModel.createInventoryItem(newItem);
    res.status(201).json({ message: 'Inventory item created successfully', insertedId: result.ID });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

// Edit an existing inventory item by ID
router.put('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid inventory item ID' });
  }
  try {
    await InventoryModel.updateInventoryItem(id, req.body);
    res.json({ message: 'Inventory item updated successfully' });
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// Delete an inventory item by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid inventory item ID' });
  }
  try {
    await InventoryModel.deleteInventoryItem(id);
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

module.exports = router;