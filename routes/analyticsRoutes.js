const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/overall-summary', authMiddleware, AnalyticsController.getOverallSummary);

router.get('/store/:storeId/summary', authMiddleware, AnalyticsController.getStoreSummary);

router.get('/store/:storeId/sales-report', authMiddleware, AnalyticsController.getSalesReport);

router.get('/store/:storeId/top-products', authMiddleware, AnalyticsController.getTopProducts);

router.get('/store/:storeId/customer-growth', authMiddleware, AnalyticsController.getCustomerGrowth);

router.get('/store/:storeId/revenue-by-category', authMiddleware, AnalyticsController.getRevenueByCategory);

module.exports = router;
