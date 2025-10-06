const RentalModel = require('../models/rentalModel');
const { successResponse, errorResponse } = require('../utils/response');

class RentalController {
  static async create(req, res, next) {
    try {
      const rental = await RentalModel.create(req.body);

      return successResponse(res, rental, 'Rental created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await RentalModel.findById(id);

      if (!rental) {
        return errorResponse(res, 'Rental not found', 404);
      }

      return successResponse(res, rental, 'Rental retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByStoreId(req, res, next) {
    try {
      const { storeId } = req.params;
      const { return_status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        return_status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const rentals = await RentalModel.findByStoreId(storeId, filters);

      return successResponse(res, rentals, 'Rentals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { store_id, return_status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        store_id,
        return_status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const rentals = await RentalModel.getAll(filters);

      return successResponse(res, rentals, 'Rentals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await RentalModel.update(id, req.body);

      if (!rental) {
        return errorResponse(res, 'Rental not found', 404);
      }

      return successResponse(res, rental, 'Rental updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateReturnStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { return_status, penalty } = req.body;

      const rental = await RentalModel.updateReturnStatus(id, return_status, penalty);

      if (!rental) {
        return errorResponse(res, 'Rental not found', 404);
      }

      return successResponse(res, rental, 'Rental return status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RentalController;
