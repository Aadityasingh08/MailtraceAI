"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../models/db");
async function logAudit(entry) {
    try {
        const db = (0, db_1.getDatabase)();
        const id = crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : `aud_${Date.now()}`;
        const timestamp = new Date().toISOString();
        const detailsStr = typeof entry.details === 'object' ? JSON.stringify(entry.details) : entry.details || '';
        await db.run('INSERT INTO audit_logs (id, user_id, user_name, action, resource, ip, result, timestamp, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            id,
            entry.userId || 'anonymous',
            entry.userName || 'Anonymous',
            entry.action,
            entry.resource,
            entry.ip || '127.0.0.1',
            entry.result,
            timestamp,
            detailsStr,
        ]);
    }
    catch (err) {
        console.error('[AuditLog] Failed to record audit log:', err);
    }
}
