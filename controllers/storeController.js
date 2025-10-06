const StoreModel = require('../models/storeModel');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

class StoreController {
  static async create(req, res, next) {
    try {
      const storeData = {
        ...req.body,
        owner_id: req.user.id
      };

      const store = await StoreModel.create(storeData);

      return successResponse(res, store, 'Store created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const store = await StoreModel.findById(id);

      if (!store) {
        return errorResponse(res, 'Store not found', 404);
      }

      return successResponse(res, store, 'Store retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyStores(req, res, next) {
    try {
      const stores = await StoreModel.findByOwnerId(req.user.id);

      return successResponse(res, stores, 'Stores retrieved successfully');
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

      const stores = await StoreModel.getAll(filters);
      const total = await StoreModel.getCount(filters);

      return paginatedResponse(
        res,
        stores,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        },
        'Stores retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const store = await StoreModel.findById(id);

      if (!store) {
        return errorResponse(res, 'Store not found', 404);
      }

      if (store.owner_id !== req.user.id) {
        return errorResponse(res, 'Unauthorized', 403);
      }

      const updatedStore = await StoreModel.update(id, req.body);

      return successResponse(res, updatedStore, 'Store updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const store = await StoreModel.updateStatus(id, status);

      if (!store) {
        return errorResponse(res, 'Store not found', 404);
      }

      return successResponse(res, store, 'Store status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const store = await StoreModel.findById(id);

      if (!store) {
        return errorResponse(res, 'Store not found', 404);
      }

      if (store.owner_id !== req.user.id) {
        return errorResponse(res, 'Unauthorized', 403);
      }

      await StoreModel.delete(id);

      return successResponse(res, null, 'Store deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StoreController;
