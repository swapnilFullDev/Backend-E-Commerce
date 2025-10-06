const BannerModel = require('../models/bannerModel');
const { successResponse, errorResponse } = require('../utils/response');

class BannerController {
  static async create(req, res, next) {
    try {
      const banner = await BannerModel.create(req.body);

      return successResponse(res, banner, 'Banner created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await BannerModel.findById(id);

      if (!banner) {
        return errorResponse(res, 'Banner not found', 404);
      }

      return successResponse(res, banner, 'Banner retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { status } = req.query;

      const filters = { status };
      const banners = await BannerModel.getAll(filters);

      return successResponse(res, banners, 'Banners retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await BannerModel.update(id, req.body);

      if (!banner) {
        return errorResponse(res, 'Banner not found', 404);
      }

      return successResponse(res, banner, 'Banner updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const banner = await BannerModel.updateStatus(id, status);

      if (!banner) {
        return errorResponse(res, 'Banner not found', 404);
      }

      return successResponse(res, banner, 'Banner status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await BannerModel.delete(id);

      return successResponse(res, null, 'Banner deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BannerController;
