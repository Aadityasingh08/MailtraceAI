"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authController_1 = require("../controllers/authController");
const investigationController_1 = require("../controllers/investigationController");
const caseController_1 = require("../controllers/caseController");
const reportController_1 = require("../controllers/reportController");
const intelligenceController_1 = require("../controllers/intelligenceController");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../auth/authMiddleware");
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Never allow executable files to be uploaded as email buffers
        if (/\.(exe|bat|cmd|sh|ps1|dll|so|msi)$/i.test(file.originalname)) {
            cb(new Error('Executable file uploads are strictly prohibited.'));
        }
        else {
            cb(null, true);
        }
    },
});
exports.apiRouter = (0, express_1.Router)();
// ================= AUTH ROUTES =================
exports.apiRouter.post('/auth/register', authController_1.register);
exports.apiRouter.post('/auth/login', authController_1.login);
exports.apiRouter.post('/auth/logout', authMiddleware_1.optionalAuth, authController_1.logout);
exports.apiRouter.get('/auth/me', authMiddleware_1.authenticateToken, authController_1.getCurrentUser);
exports.apiRouter.get('/auth/users', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)('ADMIN'), authController_1.listUsers);
exports.apiRouter.patch('/auth/users/:id/role', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)('ADMIN'), authController_1.updateUserRole);
// ================= INVESTIGATIONS =================
exports.apiRouter.post('/investigations', authMiddleware_1.optionalAuth, investigationController_1.createInvestigation);
exports.apiRouter.get('/investigations', investigationController_1.listInvestigations);
exports.apiRouter.get('/investigations/:id', investigationController_1.getInvestigationById);
exports.apiRouter.delete('/investigations/:id', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)('ADMIN'), investigationController_1.deleteInvestigation);
exports.apiRouter.post('/investigations/:id/notes', authMiddleware_1.optionalAuth, investigationController_1.addAnalystNote);
exports.apiRouter.post('/investigations/demo', authMiddleware_1.optionalAuth, investigationController_1.loadDemoSample);
// ================= EMAIL UPLOAD & ANALYZE =================
exports.apiRouter.post('/email/upload', authMiddleware_1.optionalAuth, upload.single('emailFile'), investigationController_1.uploadEmlFile);
exports.apiRouter.post('/email/analyze', authMiddleware_1.optionalAuth, investigationController_1.createInvestigation);
exports.apiRouter.get('/email/:id', investigationController_1.getInvestigationById);
// ================= CASES =================
exports.apiRouter.post('/cases', authMiddleware_1.optionalAuth, caseController_1.createCase);
exports.apiRouter.get('/cases', caseController_1.listCases);
exports.apiRouter.get('/cases/:id', caseController_1.getCaseById);
exports.apiRouter.patch('/cases/:id', authMiddleware_1.optionalAuth, caseController_1.updateCase);
// ================= REPORTS =================
exports.apiRouter.get('/reports/:id', reportController_1.getReportData);
exports.apiRouter.get('/reports/:id/pdf', reportController_1.downloadReportPdf);
exports.apiRouter.get('/reports/:id/csv', reportController_1.downloadIocsCsv);
// ================= INTELLIGENCE ENRICHMENT =================
exports.apiRouter.post('/intelligence/ip', intelligenceController_1.checkIpIntelligence);
exports.apiRouter.post('/intelligence/domain', intelligenceController_1.checkDomainIntelligence);
exports.apiRouter.post('/intelligence/url', intelligenceController_1.checkUrlIntelligence);
// ================= DASHBOARD METRICS =================
exports.apiRouter.get('/dashboard/metrics', dashboardController_1.getDashboardMetrics);
// ================= SYSTEM & AUDIT =================
exports.apiRouter.get('/system/settings', intelligenceController_1.getSystemSettings);
exports.apiRouter.post('/system/settings', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)('ADMIN'), intelligenceController_1.updateSystemSettings);
exports.apiRouter.get('/system/audit-logs', authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)('ADMIN'), intelligenceController_1.getAuditLogs);
