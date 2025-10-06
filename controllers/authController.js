const bcrypt = require('bcrypt');
const AdminModel = require('../models/adminModel');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, personal_phone, full_name, profile_image } = req.body;

      const existingAdmin = await AdminModel.findByEmail(email);
      if (existingAdmin) {
        return errorResponse(res, 'Email already registered', 409);
      }

      const password_hash = await bcrypt.hash(password, 10);

      const admin = await AdminModel.create({
        email,
        password_hash,
        personal_phone,
        full_name,
        profile_image
      });

      const token = generateToken({ id: admin.id, email: admin.email });
      const refreshToken = generateRefreshToken({ id: admin.id });

      return successResponse(
        res,
        {
          admin: {
            id: admin.id,
            email: admin.email,
            full_name: admin.full_name,
            profile_image: admin.profile_image
          },
          token,
          refreshToken
        },
        'Registration successful',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const admin = await AdminModel.findByEmail(email);
      if (!admin) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      if (admin.status === 'blocked') {
        return errorResponse(res, 'Account is blocked', 403);
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return errorResponse(res, 'Invalid credentials', 401);
      }

      const token = generateToken({ id: admin.id, email: admin.email });
      const refreshToken = generateRefreshToken({ id: admin.id });

      return successResponse(res, {
        admin: {
          id: admin.id,
          email: admin.email,
          full_name: admin.full_name,
          profile_image: admin.profile_image,
          status: admin.status
        },
        token,
        refreshToken
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const admin = await AdminModel.findById(req.user.id);

      if (!admin) {
        return errorResponse(res, 'Admin not found', 404);
      }

      return successResponse(res, admin, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { personal_phone, full_name, profile_image } = req.body;

      const updates = {};
      if (personal_phone) updates.personal_phone = personal_phone;
      if (full_name) updates.full_name = full_name;
      if (profile_image) updates.profile_image = profile_image;

      const admin = await AdminModel.update(req.user.id, updates);

      return successResponse(res, admin, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const admin = await AdminModel.findById(req.user.id);

      const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isValidPassword) {
        return errorResponse(res, 'Current password is incorrect', 400);
      }

      const password_hash = await bcrypt.hash(newPassword, 10);
      await AdminModel.update(req.user.id, { password_hash });

      return successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
