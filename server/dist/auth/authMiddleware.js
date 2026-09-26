"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.optionalAuth = optionalAuth;
exports.requireRole = requireRole;
const authService_1 = require("./authService");
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Access denied. Authentication token missing.',
            },
        });
        return;
    }
    const payload = authService_1.AuthService.verifyToken(token);
    if (!payload) {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired session token.',
            },
        });
        return;
    }
    req.user = payload;
    next();
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
        const payload = authService_1.AuthService.verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required.',
                },
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Forbidden. Action requires one of: ${allowedRoles.join(', ')} (your role: ${req.user.role})`,
                },
            });
            return;
        }
        next();
    };
}
