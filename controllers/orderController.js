const OrderModel = require('../models/orderModel');
const CustomerModel = require('../models/customerModel');
const { successResponse, errorResponse } = require('../utils/response');

class OrderController {
  static async create(req, res, next) {
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        ...req.body,
        order_number: orderNumber
      };

      const order = await OrderModel.create(orderData);

      if (order.customer_id) {
        await CustomerModel.updateOrderStats(order.customer_id, order.total_amount);
      }

      return successResponse(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderModel.findById(id);

      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      return successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByOrderNumber(req, res, next) {
    try {
      const { orderNumber } = req.params;
      const order = await OrderModel.findByOrderNumber(orderNumber);

      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      return successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByStoreId(req, res, next) {
    try {
      const { storeId } = req.params;
      const { order_status, payment_status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        order_status,
        payment_status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const orders = await OrderModel.findByStoreId(storeId, filters);

      return successResponse(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { order_status, store_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        order_status,
        store_id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const orders = await OrderModel.getAll(filters);

      return successResponse(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderModel.update(id, req.body);

      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      return successResponse(res, order, 'Order updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await OrderModel.updateStatus(id, status);

      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      return successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
