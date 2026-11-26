import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1. Internal microservice-to-microservice call with x-service-key (e.g. from Payment Service)
  const serviceKey = req.headers['x-service-key'];
  const expectedKey = process.env.SERVICE_API_KEY || 'change_me_internal_service_key';
  if (serviceKey && serviceKey === expectedKey) {
    req.user = { 
      id: req.headers['x-calling-service'] || 'internal-service', 
      role: 'Service' 
    };
    return next();
  }

  // 2. Normal customer/admin JWT Bearer token
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'drivesync_jwt_secret_key_2026_secure');

      req.user = decoded.user || decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
