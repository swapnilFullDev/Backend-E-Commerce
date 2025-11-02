const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const DeliveryRiderModel = require('../models/deliveryRiderModel');

// Create a new delivery rider
router.post('/', async (req, res) => {
  try {
    const newId = await DeliveryRiderModel.create(req.body);
    res.status(201).json({ message: 'Created successfully', insertedId: newId });
  } catch (err) {
    console.error('Error creating delivery rider:', err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

// Get all delivery riders with pagination and search
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.q || '';

  try {
    const riders = await DeliveryRiderModel.getAll(page, limit, search);
    res.json(riders);
  } catch (err) {
    console.error('Error fetching delivery riders:', err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Get delivery rider by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const rider = await DeliveryRiderModel.getById(id);
    if (!rider) return res.status(404).json({ error: 'Delivery rider not found' });
    res.json(rider);
  } catch (err) {
    console.error('Error fetching delivery rider:', err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Update delivery rider by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await DeliveryRiderModel.update(id, req.body);
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Error updating delivery rider:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// Delete delivery rider by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await DeliveryRiderModel.delete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting delivery rider:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

module.exports = router;