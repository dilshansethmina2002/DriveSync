// =============================================================
//  Centralised error handling
//  Every error in the app ends up here, so all error responses
//  have the same JSON shape:
//    { success: false, message: "...", errors?: [...] }
//
//  Express 5 automatically forwards errors thrown inside async
//  route handlers to this middleware (no try/catch needed).
// =============================================================
import config from '../config/env.js';

// 404 for URLs that do not match any route
export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.details;

  // Mongoose schema validation failed (e.g. invalid condition)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Invalid ObjectId or wrong data type in a query
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Unique index violation (e.g. same registration number twice)
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ')}`;
  }

  // Broken JSON in the request body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body contains invalid JSON';
  }

  // Unexpected bugs: log them, but do not leak internals to the client in production
  if (statusCode >= 500) {
    console.error(err);
    if (config.nodeEnv === 'production') message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};
