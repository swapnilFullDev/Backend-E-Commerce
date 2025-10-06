const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

const checkStoreOwner = async (req, res, next) => {
  try {
    const storeId = req.params.storeId || req.body.storeId;

    if (!storeId) {
      return errorResponse(res, 'Store ID is required', 400);
    }

    req.storeId = storeId;
    next();
  } catch (error) {
    return errorResponse(res, 'Error verifying store ownership', 500);
  }
};

module.exports = {
  authMiddleware,
  checkRole,
  checkStoreOwner
};
