"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../models/db");
const env_1 = require("../config/env");
class AuthService {
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        return bcryptjs_1.default.hash(password, salt);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    static generateToken(user) {
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, env_1.config.jwtSecret, { expiresIn: '7d' });
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        }
        catch {
            return null;
        }
    }
    static async register(name, email, password, role) {
        const db = (0, db_1.getDatabase)();
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        if (existing) {
            throw new Error('A user with this email address already exists.');
        }
        // Check if this is the first user; if so, make them ADMIN
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const assignedRole = role || ((userCount?.count || 0) === 0 ? 'ADMIN' : 'ANALYST');
        const passwordHash = await this.hashPassword(password);
        const userId = crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : `usr_${Date.now()}`;
        const now = new Date().toISOString();
        await db.run('INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [userId, normalizedEmail, passwordHash, name.trim(), assignedRole, now, now]);
        const user = {
            id: userId,
            email: normalizedEmail,
            name: name.trim(),
            role: assignedRole,
            created_at: now,
            updated_at: now,
        };
        const token = this.generateToken(user);
        return { user, token };
    }
    static async login(email, password) {
        const db = (0, db_1.getDatabase)();
        const normalizedEmail = email.toLowerCase().trim();
        const userRecord = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        if (!userRecord) {
            throw new Error('Invalid email or password.');
        }
        const isValid = await this.comparePassword(password, userRecord.password_hash);
        if (!isValid) {
            throw new Error('Invalid email or password.');
        }
        const user = {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
            created_at: userRecord.created_at,
            updated_at: userRecord.updated_at,
        };
        const token = this.generateToken(user);
        return { user, token };
    }
    static async getUserById(id) {
        const db = (0, db_1.getDatabase)();
        const userRecord = await db.get('SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?', [id]);
        return userRecord || null;
    }
    static async getAllUsers() {
        const db = (0, db_1.getDatabase)();
        return db.query('SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    }
    static async updateUserRole(userId, newRole) {
        const db = (0, db_1.getDatabase)();
        await db.run('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [newRole, new Date().toISOString(), userId]);
    }
}
exports.AuthService = AuthService;
