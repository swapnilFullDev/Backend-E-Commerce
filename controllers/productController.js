const ProductModel = require('../models/productModel');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

class ProductController {
  static async create(req, res, next) {
    try {
      const product = await ProductModel.create(req.body);

      return successResponse(res, product, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);

      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      return successResponse(res, product, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getByStoreId(req, res, next) {
    try {
      const { storeId } = req.params;
      const { status, category_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        status,
        category_id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const products = await ProductModel.findByStoreId(storeId, filters);

      return successResponse(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status, store_id, category_id, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const filters = {
        status,
        store_id,
        category_id,
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      const products = await ProductModel.getAll(filters);

      return successResponse(res, products, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.update(id, req.body);

      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      return successResponse(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const product = await ProductModel.updateStatus(id, status);

      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      return successResponse(res, product, 'Product status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const product = await ProductModel.updateStock(id, quantity);

      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      return successResponse(res, product, 'Product stock updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ProductModel.delete(id);

      return successResponse(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
