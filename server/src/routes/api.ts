import { Router } from 'express';
import multer from 'multer';
import {
  register,
  login,
  logout,
  getCurrentUser,
  listUsers,
  updateUserRole,
} from '../controllers/authController';
import {
  createInvestigation,
  uploadEmlFile,
  getInvestigationById,
  listInvestigations,
  deleteInvestigation,
  addAnalystNote,
  loadDemoSample,
} from '../controllers/investigationController';
import {
  createCase,
  listCases,
  getCaseById,
  updateCase,
} from '../controllers/caseController';
import {
  getReportData,
  downloadReportPdf,
  downloadIocsCsv,
} from '../controllers/reportController';
import {
  checkIpIntelligence,
  checkDomainIntelligence,
  checkUrlIntelligence,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
} from '../controllers/intelligenceController';
import { getDashboardMetrics } from '../controllers/dashboardController';
import { authenticateToken, requireRole, optionalAuth } from '../auth/authMiddleware';

const upload = multer({
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Never allow executable files to be uploaded as email buffers
    if (/\.(exe|bat|cmd|sh|ps1|dll|so|msi)$/i.test(file.originalname)) {
      cb(new Error('Executable file uploads are strictly prohibited.'));
    } else {
      cb(null, true);
    }
  },
});

export const apiRouter = Router();

// ================= AUTH ROUTES =================
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/logout', optionalAuth, logout);
apiRouter.get('/auth/me', authenticateToken, getCurrentUser);
apiRouter.get('/auth/users', authenticateToken, requireRole('ADMIN'), listUsers);
apiRouter.patch('/auth/users/:id/role', authenticateToken, requireRole('ADMIN'), updateUserRole);

// ================= INVESTIGATIONS =================
apiRouter.post('/investigations', optionalAuth, createInvestigation);
apiRouter.get('/investigations', listInvestigations);
apiRouter.get('/investigations/:id', getInvestigationById);
apiRouter.delete('/investigations/:id', authenticateToken, requireRole('ADMIN'), deleteInvestigation);
apiRouter.post('/investigations/:id/notes', optionalAuth, addAnalystNote);
apiRouter.post('/investigations/demo', optionalAuth, loadDemoSample);

// ================= EMAIL UPLOAD & ANALYZE =================
apiRouter.post('/email/upload', optionalAuth, upload.single('emailFile'), uploadEmlFile);
apiRouter.post('/email/analyze', optionalAuth, createInvestigation);
apiRouter.get('/email/:id', getInvestigationById);

// ================= CASES =================
apiRouter.post('/cases', optionalAuth, createCase);
apiRouter.get('/cases', listCases);
apiRouter.get('/cases/:id', getCaseById);
apiRouter.patch('/cases/:id', optionalAuth, updateCase);

// ================= REPORTS =================
apiRouter.get('/reports/:id', getReportData);
apiRouter.get('/reports/:id/pdf', downloadReportPdf);
apiRouter.get('/reports/:id/csv', downloadIocsCsv);

// ================= INTELLIGENCE ENRICHMENT =================
apiRouter.post('/intelligence/ip', checkIpIntelligence);
apiRouter.post('/intelligence/domain', checkDomainIntelligence);
apiRouter.post('/intelligence/url', checkUrlIntelligence);

// ================= DASHBOARD METRICS =================
apiRouter.get('/dashboard/metrics', getDashboardMetrics);

// ================= SYSTEM & AUDIT =================
apiRouter.get('/system/settings', getSystemSettings);
apiRouter.post('/system/settings', authenticateToken, requireRole('ADMIN'), updateSystemSettings);
apiRouter.get('/system/audit-logs', authenticateToken, requireRole('ADMIN'), getAuditLogs);
