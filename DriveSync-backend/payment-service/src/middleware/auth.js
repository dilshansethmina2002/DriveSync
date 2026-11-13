// =============================================================
//  Authentication & authorisation middleware
//
//  JWT CONTRACT with the Auth Service (Member 1):
//    - Header:  Authorization: Bearer <token>
//    - Signed with the shared JWT_SECRET (HS256)
//    - Payload: { user: { id: "<mongo user id>", role: "Customer" | "Admin" }, iat, exp }
//
//  We do NOT call the Auth Service on every request. Because we share
//  the secret, we can verify the token's signature locally (fast and
//  the Auth Service does not become a bottleneck).
//
//  Internal service-to-service calls (e.g. Booking Service -> Payment)
//  may instead send:  x-service-key: <SERVICE_API_KEY>
// =============================================================
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';

// Compare secrets in constant time (prevents "timing attacks")
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const authenticate = (req, _res, next) => {
  // 1) Internal call from another microservice?
  const serviceKey = req.headers['x-service-key'];
  if (serviceKey && config.serviceApiKey && safeEqual(serviceKey, config.serviceApiKey)) {
    req.user = { id: req.headers['x-calling-service'] || 'internal-service', role: 'Service' };
    return next();
  }

  // 2) Normal user request with a JWT
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(new AppError('Not authorized: no token provided', 401));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    // Auth Service puts the user inside "user". Fall back to the root just in case.
    const user = decoded.user || decoded;
    if (!user.id) {
      return next(new AppError('Not authorized: token has no user id', 401));
    }
    req.user = { id: String(user.id), role: user.role || 'Customer' };
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired, please log in again' : 'Not authorized: invalid token';
    return next(new AppError(message, 401));
  }
};

/**
 * Allow only some roles.  Usage:  authorize('Admin', 'Service')
 * Role names are compared case-insensitively ("admin" == "Admin").
 */
export const authorize = (...roles) => {
  const allowed = roles.map((role) => role.toLowerCase());
  return (req, _res, next) => {
    if (!req.user || !allowed.includes(String(req.user.role).toLowerCase())) {
      return next(new AppError('Forbidden: you do not have permission for this action', 403));
    }
    return next();
  };
};
