const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const productsController = require('../controllers/products.controller');

// Product routes
router.get('/all', authenticateToken, productsController.getAllProducts);
router.get('/:id', authenticateToken, productsController.getProductById);
router.get('/status/:status', authenticateToken, productsController.getProductsByStatus);
router.get('/business/:businessId', authenticateToken, productsController.getProductsByBusiness);

router.post('/', authenticateToken, productsController.createProduct);
router.put('/:id', authenticateToken, productsController.updateProduct);
router.patch('/:id/status', authenticateToken, productsController.updateProductStatus);
router.delete('/:id', authenticateToken, productsController.deleteProduct);

module.exports = router;
