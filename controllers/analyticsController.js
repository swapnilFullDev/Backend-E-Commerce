const AnalyticsModel = require('../models/analyticsModel');
const { successResponse, errorResponse } = require('../utils/response');

class AnalyticsController {
  static async getSalesReport(req, res, next) {
    try {
      const { storeId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, 'Start date and end date are required', 400);
      }

      const report = await AnalyticsModel.getSalesReport(storeId, startDate, endDate);

      return successResponse(res, report, 'Sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTopProducts(req, res, next) {
    try {
      const { storeId } = req.params;
      const { limit = 10 } = req.query;

      const products = await AnalyticsModel.getTopProducts(storeId, parseInt(limit));

      return successResponse(res, products, 'Top products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerGrowth(req, res, next) {
    try {
      const { storeId } = req.params;
      const { period = 'monthly' } = req.query;

      const growth = await AnalyticsModel.getCustomerGrowth(storeId, period);

      return successResponse(res, growth, 'Customer growth retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueByCategory(req, res, next) {
    try {
      const { storeId } = req.params;

      const revenue = await AnalyticsModel.getRevenueByCategory(storeId);

      return successResponse(res, revenue, 'Revenue by category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getStoreSummary(req, res, next) {
    try {
      const { storeId } = req.params;

      const summary = await AnalyticsModel.getStoreSummary(storeId);

      return successResponse(res, summary, 'Store summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getOverallSummary(req, res, next) {
    try {
      const summary = await AnalyticsModel.getOverallSummary();

      return successResponse(res, summary, 'Overall summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
