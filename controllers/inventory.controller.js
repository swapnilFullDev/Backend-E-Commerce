const InventoryModel = require('../models/inventoryModel');

// Get all inventory items by business_id
exports.getInventoryByBusiness = async (req, res) => {
  const businessId = Number(req.user.businessId);
  if (!businessId) {
    return res.status(400).json({ error: 'Business ID is missing or invalid.' });
  }

  try {
    const inventory = await InventoryModel.getInventoryByBusiness(businessId);
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory', details: err.message });
  }
};

// Create a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const newItem = { ...req.body, Business_id: Number(req.user.businessId) };
    const result = await InventoryModel.createInventoryItem(newItem);
    res.status(201).json({ message: 'Inventory item created successfully', insertedId: result.ID });
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// Update an existing inventory item by ID
exports.updateInventoryItem = async (req, res) => {
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
};

// Delete an inventory item by ID
exports.deleteInventoryItem = async (req, res) => {
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
};

// Toggle 'Available on Rent', 'Status', 'Available Online'
exports.toggleInventoryField = async (req, res) => {
  const id = Number(req.params.id);
  const { field } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Invalid inventory item ID' });
  }

  if (!field || !['Rent', 'Status', 'Online'].includes(field)) {
    return res.status(400).json({ error: "Field must be one of: 'Rent', 'Status', 'Online'" });
  }

  try {
    const item = await InventoryModel.getById(id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await InventoryModel.updateInventoryToggle(id, field);
    res.json({ message: `${field} toggled successfully` });
  } catch (err) {
    console.error('Error toggling field:', err);
    res.status(500).json({ error: 'Toggle failed', details: err.message });
  }
};