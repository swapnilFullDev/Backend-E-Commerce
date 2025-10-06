const CustomerModel = require('../models/customerModel');
const { successResponse, errorResponse } = require('../utils/response');

class CustomerController {
  static async create(req, res, next) {
    try {
      const { email } = req.body;

      const existingCustomer = await CustomerModel.findByEmail(email);
      if (existingCustomer) {
        return errorResponse(res, 'Customer with this email already exists', 409);
      }

      const customer = await CustomerModel.create(req.body);

      return successResponse(res, customer, 'Customer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.findById(id);

      if (!customer) {
        return errorResponse(res, 'Customer not found', 404);
      }

      return successResponse(res, customer, 'Customer retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const customers = await CustomerModel.getAll(filters);

      return successResponse(res, customers, 'Customers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.update(id, req.body);

      if (!customer) {
        return errorResponse(res, 'Customer not found', 404);
      }

      return successResponse(res, customer, 'Customer updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const customer = await CustomerModel.updateStatus(id, status);

      if (!customer) {
        return errorResponse(res, 'Customer not found', 404);
      }

      return successResponse(res, customer, 'Customer status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CustomerController;
