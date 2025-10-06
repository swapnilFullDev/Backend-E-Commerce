const CategoryModel = require('../models/categoryModel');
const { successResponse, errorResponse } = require('../utils/response');

class CategoryController {
  static async create(req, res, next) {
    try {
      const category = await CategoryModel.create(req.body);

      return successResponse(res, category, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      return successResponse(res, category, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status, parent_id } = req.query;

      const filters = { status };

      if (parent_id !== undefined) {
        filters.parent_id = parent_id === 'null' ? null : parent_id;
      }

      const categories = await CategoryModel.getAll(filters);

      return successResponse(res, categories, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getWithSubcategories(req, res, next) {
    try {
      const categories = await CategoryModel.getWithSubcategories();

      return successResponse(res, categories, 'Categories with subcategories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.update(id, req.body);

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      return successResponse(res, category, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const category = await CategoryModel.updateStatus(id, status);

      if (!category) {
        return errorResponse(res, 'Category not found', 404);
      }

      return successResponse(res, category, 'Category status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await CategoryModel.delete(id);

      return successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
