const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, 'Validation Error', 400, err.details);
  }

  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, 'Unauthorized', 401);
  }

  if (err.code === '23505') {
    return errorResponse(res, 'Duplicate entry', 409);
  }

  if (err.code === '23503') {
    return errorResponse(res, 'Referenced record not found', 404);
  }

  return errorResponse(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

const notFound = (req, res) => {
  errorResponse(res, 'Route not found', 404);
};

module.exports = {
  errorHandler,
  notFound
};
