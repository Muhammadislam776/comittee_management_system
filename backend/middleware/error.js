const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || 'Server Error';

  if (statusCode >= 500) {
    console.log(`\n❌ ERROR at ${req.method} ${req.path}`);
    console.log(`📝 Message: ${err.message}`);
    if (err.stack) console.log(`📍 Stack: ${err.stack}\n`);
    console.log(`📤 Response Status: ${statusCode}`);
    console.log(`📤 Response Message: ${errorMessage}\n`);
  } else {
    console.warn(`⚠️ ${req.method} ${req.path} -> ${statusCode} ${errorMessage}`);
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
