import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'drivesync_jwt_secret_key_2026_secure');

            req.user = decoded.user;
            return next();
        } catch (error) {
            return res.status(401).json({ success: false, message: "Not authorized, token failed or expired." });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided." });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
};

export const requireRole = (allowedRoles = []) => (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
        return next();
    }
    return res.status(403).json({ 
        success: false, 
        message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` 
    });
};
