"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportData = getReportData;
exports.downloadReportPdf = downloadReportPdf;
exports.downloadIocsCsv = downloadIocsCsv;
const reportGenerator_1 = require("../reports/reportGenerator");
const auditLogger_1 = require("../middleware/auditLogger");
async function getReportData(req, res) {
    try {
        const { id } = req.params;
        const report = await (0, reportGenerator_1.getFullInvestigationReportData)(id);
        if (!report) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Investigation report not found.' },
            });
            return;
        }
        res.json({
            success: true,
            data: report,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
async function downloadReportPdf(req, res) {
    try {
        const { id } = req.params;
        const report = await (0, reportGenerator_1.getFullInvestigationReportData)(id);
        if (!report) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Investigation report not found.' },
            });
            return;
        }
        const pdfBuffer = await (0, reportGenerator_1.generatePdfReport)(report);
        await (0, auditLogger_1.logAudit)({
            userId: req.user?.id,
            userName: req.user?.name,
            action: 'REPORT_PDF_EXPORTED',
            resource: `investigation:${id}`,
            result: 'SUCCESS',
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="MailTrace-Report-${id.slice(0, 8)}.pdf"`);
        res.send(pdfBuffer);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'PDF_GENERATION_FAILED', message: err.message },
        });
    }
}
async function downloadIocsCsv(req, res) {
    try {
        const { id } = req.params;
        const report = await (0, reportGenerator_1.getFullInvestigationReportData)(id);
        if (!report) {
            res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Investigation report not found.' },
            });
            return;
        }
        const csvContent = (0, reportGenerator_1.generateCsvIocs)(report);
        await (0, auditLogger_1.logAudit)({
            userId: req.user?.id,
            userName: req.user?.name,
            action: 'IOCS_CSV_EXPORTED',
            resource: `investigation:${id}`,
            result: 'SUCCESS',
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="MailTrace-IOCs-${id.slice(0, 8)}.csv"`);
        res.send(csvContent);
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'CSV_GENERATION_FAILED', message: err.message },
        });
    }
}
