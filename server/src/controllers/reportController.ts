import { Request, Response } from 'express';
import { getFullInvestigationReportData, generatePdfReport, generateCsvIocs } from '../reports/reportGenerator';
import { logAudit } from '../middleware/auditLogger';

export async function getReportData(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const report = await getFullInvestigationReportData(id);

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
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function downloadReportPdf(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const report = await getFullInvestigationReportData(id);

    if (!report) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Investigation report not found.' },
      });
      return;
    }

    const pdfBuffer = await generatePdfReport(report);

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'REPORT_PDF_EXPORTED',
      resource: `investigation:${id}`,
      result: 'SUCCESS',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="MailTrace-Report-${id.slice(0, 8)}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'PDF_GENERATION_FAILED', message: err.message },
    });
  }
}

export async function downloadIocsCsv(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const report = await getFullInvestigationReportData(id);

    if (!report) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Investigation report not found.' },
      });
      return;
    }

    const csvContent = generateCsvIocs(report);

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'IOCS_CSV_EXPORTED',
      resource: `investigation:${id}`,
      result: 'SUCCESS',
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="MailTrace-IOCs-${id.slice(0, 8)}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'CSV_GENERATION_FAILED', message: err.message },
    });
  }
}
