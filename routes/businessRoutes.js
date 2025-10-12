const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const BusinessModel = require('../models/businessModel');

// Create a new business
router.post('/', async (req, res) => {
  try {
    const newId = await BusinessModel.create(req.body);
    res.status(201).json({ message: 'Created successfully', insertedId: newId });
  } catch (err) {
    console.error('Error creating business:', err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
});

// Get all businesses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allBusinesses = await BusinessModel.getAll();
    res.json(allBusinesses);
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Get unverified businesses
router.get('/unverified', authenticateToken, async (req, res) => {
  try {
    const unverifiedBusinesses = await BusinessModel.getUnverified();
    res.json(unverifiedBusinesses);
  } catch (err) {
    console.error('Error fetching unverified businesses:', err);
    res.status(500).json({ error: 'Failed to fetch unverified businesses', details: err.message });
  }
});

// Get business by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const business = await BusinessModel.getById(id);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (err) {
    console.error('Error fetching business:', err);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
  }
});

// Update business by ID
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await BusinessModel.update(id, req.body);
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    console.error('Error updating business:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// Delete business by ID
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await BusinessModel.delete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting business:', err);
    res.status(500).json({ error: 'Delete failed', details: err.message });
  }
});

module.exports = router;