// =============================================================
//  Runs after the express-validator rules of a route.
//  If any rule failed -> respond 400 with a clear list of problems.
// =============================================================
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

export const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((err) => ({ field: err.path, message: err.msg }));
  return next(new AppError('Validation failed', 400, errors));
};
