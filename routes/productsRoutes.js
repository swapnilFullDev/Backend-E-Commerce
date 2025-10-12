const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ProductsModel = require('../models/ProductsModel');

const router = express.Router();

// Get product by ID
router.get('/:id', authenticateToken,async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    const product = await ProductsModel.getProductById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get products by status
router.get('/status/:status', authenticateToken,async (req, res) => {
  const status = req.params.status;
  const validStatuses = ['pending','approved','rejected','blocked'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const products = await ProductsModel.getProductsByStatus(status);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get products by business
router.get('/business/:businessId', authenticateToken,async (req, res) => {
  const businessId = Number(req.params.businessId);
  if (isNaN(businessId)) return res.status(400).json({ error: 'Invalid Business ID' });

  try {
    const products = await ProductsModel.getProductsByBusiness(businessId);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create product
router.post('/', authenticateToken,async (req, res) => {
  try {
    const product = await ProductsModel.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Update product
router.put('/:id', authenticateToken,async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  try {
    await ProductsModel.updateProduct(productId, req.body);
    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Admin: update product status
router.patch('/:id/status', authenticateToken,async (req, res) => {
  const productId = Number(req.params.id);
  if (isNaN(productId)) return res.status(400).json({ error: 'Invalid Product ID' });

  const newStatus = req.body.Status;
  const validStatuses = ['approved','rejected','blocked'];
  if (!validStatuses.includes(newStatus)) return res.status(400).json({ error: 'Invalid status' });

  try {
    await ProductsModel.updateProductStatus(productId, newStatus);
    res.json({ message: `Product status updated to ${newStatus}` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;