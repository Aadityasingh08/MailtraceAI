"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
const authService_1 = require("../auth/authService");
const auditLogger_1 = require("../middleware/auditLogger");
async function register(req, res) {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Name, email, and password are required.' },
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' },
            });
            return;
        }
        const result = await authService_1.AuthService.register(name, email, password, role);
        await (0, auditLogger_1.logAudit)({
            userId: result.user.id,
            userName: result.user.name,
            action: 'USER_REGISTERED',
            resource: `user:${result.user.id}`,
            result: 'SUCCESS',
        });
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({
            success: false,
            error: { code: 'REGISTRATION_FAILED', message: err.message },
        });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
            });
            return;
        }
        const result = await authService_1.AuthService.login(email, password);
        await (0, auditLogger_1.logAudit)({
            userId: result.user.id,
            userName: result.user.name,
            action: 'USER_LOGIN',
            resource: `user:${result.user.id}`,
            result: 'SUCCESS',
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        res.status(401).json({
            success: false,
            error: { code: 'AUTHENTICATION_FAILED', message: err.message || 'Invalid credentials' },
        });
    }
}
async function logout(req, res) {
    if (req.user) {
        await (0, auditLogger_1.logAudit)({
            userId: req.user.id,
            userName: req.user.name,
            action: 'USER_LOGOUT',
            resource: `user:${req.user.id}`,
            result: 'SUCCESS',
        });
    }
    res.json({
        success: true,
        data: { message: 'Logged out successfully.' },
    });
}
async function getCurrentUser(req, res) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' },
        });
        return;
    }
    const user = await authService_1.AuthService.getUserById(req.user.id);
    if (!user) {
        res.status(404).json({
            success: false,
            error: { code: 'USER_NOT_FOUND', message: 'User record not found.' },
        });
        return;
    }
    res.json({
        success: true,
        data: { user },
    });
}
async function listUsers(req, res) {
    try {
        const users = await authService_1.AuthService.getAllUsers();
        res.json({
            success: true,
            data: { users },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['ADMIN', 'ANALYST', 'VIEWER'].includes(role)) {
            res.status(400).json({
                success: false,
                error: { code: 'INVALID_ROLE', message: 'Role must be ADMIN, ANALYST, or VIEWER.' },
            });
            return;
        }
        await authService_1.AuthService.updateUserRole(id, role);
        await (0, auditLogger_1.logAudit)({
            userId: req.user?.id,
            userName: req.user?.name,
            action: 'USER_ROLE_UPDATED',
            resource: `user:${id}`,
            result: 'SUCCESS',
            details: { newRole: role },
        });
        res.json({
            success: true,
            data: { message: `User role updated to ${role}.` },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
