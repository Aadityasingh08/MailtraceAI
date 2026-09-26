"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullInvestigationReportData = getFullInvestigationReportData;
exports.generateCsvIocs = generateCsvIocs;
exports.generatePdfReport = generatePdfReport;
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = require("../models/db");
async function getFullInvestigationReportData(investigationId) {
    const db = (0, db_1.getDatabase)();
    const investigation = await db.get('SELECT * FROM investigations WHERE id = ?', [investigationId]);
    if (!investigation)
        return null;
    const email = await db.get('SELECT * FROM emails WHERE investigation_id = ?', [investigationId]);
    const headers = await db.query('SELECT * FROM email_headers WHERE investigation_id = ?', [investigationId]);
    const authResults = await db.get('SELECT * FROM authentication_results WHERE investigation_id = ?', [investigationId]);
    const iocs = await db.query('SELECT * FROM iocs WHERE investigation_id = ?', [investigationId]);
    const receivedHops = await db.query('SELECT * FROM received_hops WHERE investigation_id = ? ORDER BY hop_index ASC', [investigationId]);
    const timeline = await db.query('SELECT * FROM timeline_events WHERE investigation_id = ? ORDER BY timestamp ASC', [investigationId]);
    const evidence = await db.query('SELECT * FROM evidence_vault WHERE investigation_id = ? ORDER BY created_at ASC', [investigationId]);
    const notes = await db.query('SELECT * FROM analyst_notes WHERE investigation_id = ? ORDER BY created_at ASC', [investigationId]);
    const nodes = await db.query('SELECT * FROM investigation_nodes WHERE investigation_id = ?', [investigationId]);
    const edges = await db.query('SELECT * FROM investigation_edges WHERE investigation_id = ?', [investigationId]);
    const highRiskNodes = nodes.filter((n) => n.risk_level === 'CRITICAL' || n.risk_level === 'HIGH').length;
    // Retrieve IP Geo intelligence for extracted IPs
    const ipGeoMap = {};
    const ipIocs = iocs.filter((i) => i.type === 'IPV4' || i.type === 'IPV6');
    for (const item of ipIocs) {
        const geo = await db.get('SELECT * FROM ip_intelligence WHERE ip = ?', [item.indicator]);
        if (geo) {
            ipGeoMap[item.indicator] = geo;
        }
    }
    return {
        investigation: {
            ...investigation,
            score_breakdown: investigation.score_breakdown ? JSON.parse(investigation.score_breakdown) : [],
            confidence_matrix: investigation.confidence_matrix ? JSON.parse(investigation.confidence_matrix) : [],
        },
        email: {
            ...email,
            to_addresses: email?.to_addresses ? JSON.parse(email.to_addresses) : [],
            cc_addresses: email?.cc_addresses ? JSON.parse(email.cc_addresses) : [],
            attachments_meta: email?.attachments_meta ? JSON.parse(email.attachments_meta) : [],
        },
        headers,
        authResults,
        iocs,
        receivedHops,
        ipGeoMap,
        timeline,
        evidence,
        notes,
        graphSummary: {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            highRiskNodes,
        },
    };
}
function generateCsvIocs(report) {
    const headers = ['Type', 'Indicator', 'Risk Level', 'Source', 'Status', 'Context'];
    const rows = report.iocs.map(ioc => [
        `"${ioc.type}"`,
        `"${ioc.indicator.replace(/"/g, '""')}"`,
        `"${ioc.risk_level}"`,
        `"${ioc.source}"`,
        `"${ioc.status}"`,
        `"${(ioc.context || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
function generatePdfReport(report) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
            const inv = report.investigation;
            const em = report.email;
            // Header Banner
            doc.rect(40, 40, 515, 60).fill('#0D1B2A');
            doc.fillColor('#00D9FF').fontSize(18).text('MAILTRACE AI — FORENSIC INTELLIGENCE REPORT', 55, 52);
            doc.fillColor('#8191A5').fontSize(9).text('AI-Powered Email Threat Detection & Forensic Investigation Platform', 55, 75);
            doc.fillColor('#E8F1F8').fontSize(9).text(`Report Date: ${new Date().toISOString()}`, 380, 75);
            doc.moveDown(4);
            // Section 1: Executive Summary
            doc.fillColor('#07111F').fontSize(14).text('1. Executive Summary', 40, 120);
            doc.fontSize(10).fillColor('#334155');
            doc.text(inv.storyline || 'No storyline summary recorded.', 40, 140, { width: 515, align: 'justify' });
            // Threat Classification & Score Box
            const scoreY = 190;
            doc.rect(40, scoreY, 515, 65).fill('#F8FAFC').stroke('#CBD5E1');
            doc.fillColor('#0F172A').fontSize(10).text(`Threat Classification: `, 55, scoreY + 12);
            doc.fillColor(inv.severity === 'CRITICAL' ? '#DC2626' : inv.severity === 'HIGH' ? '#EA580C' : '#059669')
                .fontSize(11).text(`${inv.threat_type} (${inv.severity})`, 180, scoreY + 12);
            doc.fillColor('#0F172A').fontSize(10).text(`Assessed Risk Score: `, 55, scoreY + 28);
            doc.fillColor('#0284C7').fontSize(11).text(`${inv.risk_score} / 100  (Confidence: ${inv.confidence}%)`, 180, scoreY + 28);
            doc.fillColor('#0F172A').fontSize(10).text(`Recommended Action: `, 55, scoreY + 44);
            doc.fillColor('#334155').fontSize(10).text(inv.recommended_action || 'Quarantine and review sender infrastructure.', 180, scoreY + 44, { width: 360 });
            // Section 2 & 3: Email Overview
            let curY = scoreY + 80;
            doc.fillColor('#07111F').fontSize(14).text('2. Email Overview', 40, curY);
            curY += 20;
            const emailProps = [
                ['Subject', em.subject || 'N/A'],
                ['From', `${em.from_name ? `"${em.from_name}" ` : ''}<${em.from_address || 'N/A'}>`],
                ['Reply-To', em.reply_to || 'N/A'],
                ['Return-Path', em.return_path || 'N/A'],
                ['Date Transmitted', em.date || 'N/A'],
                ['Message-ID', em.message_id || 'N/A'],
                ['SHA-256 Digest', em.raw_eml_sha256 || 'N/A'],
            ];
            doc.fontSize(9);
            emailProps.forEach(([label, val]) => {
                doc.fillColor('#64748B').text(label, 40, curY, { width: 110 });
                doc.fillColor('#0F172A').text(val, 155, curY, { width: 400 });
                curY += 16;
            });
            // Section 4: Authentication Results
            curY += 10;
            doc.fillColor('#07111F').fontSize(14).text('3. Email Authentication (SPF / DKIM / DMARC)', 40, curY);
            curY += 20;
            const auth = report.authResults || {};
            const authProps = [
                ['SPF Status', auth.spf_status || 'UNKNOWN', auth.spf_details || 'N/A'],
                ['DKIM Status', auth.dkim_status || 'UNKNOWN', auth.dkim_details || 'N/A'],
                ['DMARC Status', auth.dmarc_status || 'UNKNOWN', auth.dmarc_details || 'N/A'],
            ];
            authProps.forEach(([name, status, details]) => {
                doc.fillColor('#0F172A').fontSize(10).text(`${name}: `, 40, curY);
                doc.fillColor(status === 'PASS' ? '#059669' : status === 'FAIL' ? '#DC2626' : '#D97706')
                    .text(status, 130, curY);
                doc.fillColor('#475569').fontSize(9).text(details, 200, curY, { width: 355 });
                curY += 20;
            });
            // Add a page for IOCs and Forensics
            doc.addPage();
            curY = 40;
            doc.fillColor('#07111F').fontSize(14).text('4. Extracted Indicators of Compromise (IOCs)', 40, curY);
            curY += 25;
            // Table Header
            doc.rect(40, curY, 515, 20).fill('#0D1B2A');
            doc.fillColor('#E8F1F8').fontSize(9);
            doc.text('Type', 45, curY + 5);
            doc.text('Indicator', 110, curY + 5);
            doc.text('Risk', 340, curY + 5);
            doc.text('Source', 400, curY + 5);
            curY += 22;
            report.iocs.slice(0, 15).forEach((ioc, idx) => {
                if (idx % 2 === 1) {
                    doc.rect(40, curY, 515, 18).fill('#F1F5F9');
                }
                doc.fillColor('#0F172A').fontSize(8);
                doc.text(ioc.type, 45, curY + 4);
                doc.text(ioc.indicator.length > 45 ? ioc.indicator.substring(0, 45) + '...' : ioc.indicator, 110, curY + 4);
                doc.fillColor(ioc.risk_level === 'CRITICAL' ? '#DC2626' : ioc.risk_level === 'HIGH' ? '#EA580C' : '#059669');
                doc.text(ioc.risk_level, 340, curY + 4);
                doc.fillColor('#475569');
                doc.text(ioc.source, 400, curY + 4);
                curY += 18;
            });
            // Section 5: Actionable Recommendations
            curY += 20;
            doc.fillColor('#07111F').fontSize(14).text('5. SOC Analyst Remediation Guidance', 40, curY);
            curY += 20;
            const recs = inv.score_breakdown ? inv.recommendations || [] : [];
            if (recs.length === 0) {
                recs.push('Quarantine message and purge from affected mailboxes.');
                recs.push('Block sender domain at perimeter mail gateway.');
                recs.push('Search server mail logs for lookalike domain infrastructure.');
            }
            recs.forEach((rec) => {
                doc.fillColor('#DC2626').text('•', 45, curY);
                doc.fillColor('#1E293B').fontSize(9).text(rec, 60, curY, { width: 495 });
                curY += 16;
            });
            // Section 6: Disclaimer
            curY += 30;
            doc.rect(40, curY, 515, 55).fill('#F8FAFC').stroke('#E2E8F0');
            doc.fillColor('#64748B').fontSize(8).text('FORENSIC DISCLAIMER & EVIDENTIARY INTEGRITY NOTICE', 50, curY + 8);
            doc.fillColor('#475569').fontSize(8).text('IP geolocation represents an approximate network location and does not establish the physical location or identity of an individual. All cryptographic hashes and forensic markers recorded in this report were verified at ingestion time. AI classification findings represent structured algorithmic inference and should be validated by a certified SOC analyst.', 50, curY + 22, { width: 495, align: 'justify' });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
}
