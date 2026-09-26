"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCase = createCase;
exports.listCases = listCases;
exports.getCaseById = getCaseById;
exports.updateCase = updateCase;
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../models/db");
const auditLogger_1 = require("../middleware/auditLogger");
async function createCase(req, res) {
    try {
        const { title, priority, assignedTo, threatType, riskScore, investigationId } = req.body;
        const user = req.user || { id: 'usr_analyst', name: 'Analyst' };
        if (!title || !title.trim()) {
            res.status(400).json({
                success: false,
                error: { code: 'INVALID_INPUT', message: 'Case title is required.' },
            });
            return;
        }
        const db = (0, db_1.getDatabase)();
        const caseId = crypto_1.default.randomUUID ? crypto_1.default.randomUUID() : `case_${Date.now()}`;
        const caseNumber = `CASE-${Date.now().toString().slice(-6)}`;
        const now = new Date().toISOString();
        await db.run(`INSERT INTO cases (id, case_number, title, priority, status, assigned_to, created_by, threat_type, risk_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            caseId,
            caseNumber,
            title.trim(),
            priority || 'MEDIUM',
            'OPEN',
            assignedTo || user.name,
            user.id,
            threatType || 'SUSPICIOUS',
            riskScore || 50,
            now,
            now,
        ]);
        // If an investigation ID was passed, link it
        if (investigationId) {
            await db.run('UPDATE investigations SET case_id = ? WHERE id = ?', [caseId, investigationId]);
        }
        await (0, auditLogger_1.logAudit)({
            userId: user.id,
            userName: user.name,
            action: 'CASE_CREATED',
            resource: `case:${caseId}`,
            result: 'SUCCESS',
            details: { caseNumber, title: title.trim(), priority },
        });
        res.status(201).json({
            success: true,
            data: {
                case: {
                    id: caseId,
                    case_number: caseNumber,
                    title: title.trim(),
                    priority: priority || 'MEDIUM',
                    status: 'OPEN',
                    assigned_to: assignedTo || user.name,
                    threat_type: threatType || 'SUSPICIOUS',
                    risk_score: riskScore || 50,
                    created_at: now,
                    updated_at: now,
                },
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
async function listCases(req, res) {
    try {
        const db = (0, db_1.getDatabase)();
        const status = req.query.status;
        const priority = req.query.priority;
        let query = 'SELECT * FROM cases WHERE 1=1';
        const params = [];
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (priority) {
            query += ' AND priority = ?';
            params.push(priority);
        }
        query += ' ORDER BY created_at DESC';
        const cases = await db.query(query, params);
        // Include count of attached investigations
        const enrichedCases = await Promise.all(cases.map(async (c) => {
            const invs = await db.query('SELECT id, title, threat_type, risk_score, severity FROM investigations WHERE case_id = ?', [c.id]);
            return {
                ...c,
                investigations: invs,
            };
        }));
        res.json({
            success: true,
            data: { cases: enrichedCases },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
async function getCaseById(req, res) {
    try {
        const { id } = req.params;
        const db = (0, db_1.getDatabase)();
        const caseItem = await db.get('SELECT * FROM cases WHERE id = ?', [id]);
        if (!caseItem) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Case not found.' },
            });
            return;
        }
        const investigations = await db.query('SELECT * FROM investigations WHERE case_id = ?', [id]);
        res.json({
            success: true,
            data: {
                case: caseItem,
                investigations,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
async function updateCase(req, res) {
    try {
        const { id } = req.params;
        const { title, status, priority, assignedTo } = req.body;
        const db = (0, db_1.getDatabase)();
        const existing = await db.get('SELECT * FROM cases WHERE id = ?', [id]);
        if (!existing) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Case not found.' },
            });
            return;
        }
        const newTitle = title || existing.title;
        const newStatus = status || existing.status;
        const newPriority = priority || existing.priority;
        const newAssignedTo = assignedTo !== undefined ? assignedTo : existing.assigned_to;
        const now = new Date().toISOString();
        await db.run('UPDATE cases SET title = ?, status = ?, priority = ?, assigned_to = ?, updated_at = ? WHERE id = ?', [newTitle, newStatus, newPriority, newAssignedTo, now, id]);
        await (0, auditLogger_1.logAudit)({
            userId: req.user?.id,
            userName: req.user?.name,
            action: 'CASE_STATUS_CHANGED',
            resource: `case:${id}`,
            result: 'SUCCESS',
            details: { oldStatus: existing.status, newStatus },
        });
        res.json({
            success: true,
            data: {
                case: {
                    ...existing,
                    title: newTitle,
                    status: newStatus,
                    priority: newPriority,
                    assigned_to: newAssignedTo,
                    updated_at: now,
                },
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
