"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const db_1 = require("./models/db");
const authService_1 = require("./auth/authService");
const investigationController_1 = require("./controllers/investigationController");
const sampleEmails_1 = require("./demo/sampleEmails");
const auditLogger_1 = require("./middleware/auditLogger");
async function seed() {
    console.log('[Seed] Starting MailTrace AI database initialization and seeding...');
    await (0, db_1.initDatabase)();
    const db = (0, db_1.getDatabase)();
    // 1. Create Default Users if not exist
    const adminEmail = 'admin@mailtrace.soc';
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
    let adminUser;
    if (!existingAdmin) {
        const adminRes = await authService_1.AuthService.register('SOC Security Administrator', adminEmail, 'Admin@MailTrace2025!', 'ADMIN');
        adminUser = adminRes.user;
        console.log('[Seed] Created default ADMIN: admin@mailtrace.soc (Pass: Admin@MailTrace2025!)');
    }
    else {
        adminUser = await authService_1.AuthService.getUserById(existingAdmin.id);
    }
    const analystEmail = 'analyst@mailtrace.soc';
    const existingAnalyst = await db.get('SELECT id FROM users WHERE email = ?', [analystEmail]);
    if (!existingAnalyst) {
        await authService_1.AuthService.register('Lead SOC Analyst', analystEmail, 'Analyst@MailTrace2025!', 'ANALYST');
        console.log('[Seed] Created default ANALYST: analyst@mailtrace.soc (Pass: Analyst@MailTrace2025!)');
    }
    const viewerEmail = 'viewer@mailtrace.soc';
    const existingViewer = await db.get('SELECT id FROM users WHERE email = ?', [viewerEmail]);
    if (!existingViewer) {
        await authService_1.AuthService.register('Executive Auditor', viewerEmail, 'Viewer@MailTrace2025!', 'VIEWER');
        console.log('[Seed] Created default VIEWER: viewer@mailtrace.soc (Pass: Viewer@MailTrace2025!)');
    }
    // 2. Ingest Demo Forensic Emails
    const invCount = await db.get('SELECT COUNT(*) as count FROM investigations');
    if ((invCount?.count || 0) === 0) {
        console.log('[Seed] Ingesting demo forensic email corpus...');
        for (const sample of sampleEmails_1.DEMO_SAMPLE_EMAILS) {
            const invId = await (0, investigationController_1.processEmailAndSaveInvestigation)(sample.emlRaw, adminUser || { id: 'usr_admin', name: 'SOC Security Administrator' }, undefined, `[DEMO DATA] ${sample.name}`);
            console.log(`[Seed] Ingested "${sample.name}" -> Investigation ID: ${invId}`);
        }
        // 3. Create Demo Cases
        const now = new Date().toISOString();
        const phishingInv = await db.get("SELECT id FROM investigations WHERE threat_type IN ('PHISHING', 'CREDENTIAL HARVESTING') LIMIT 1");
        const becInv = await db.get("SELECT id FROM investigations WHERE threat_type = 'BUSINESS EMAIL COMPROMISE' LIMIT 1");
        await db.run(`INSERT INTO cases (id, case_number, title, priority, status, assigned_to, created_by, threat_type, risk_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            'case_demo_phish_01',
            'CASE-2025-001',
            '[DEMO DATA] Targeted M365 Credential Harvester Campaign',
            'CRITICAL',
            'INVESTIGATING',
            'Lead SOC Analyst',
            adminUser?.id || 'usr_admin',
            'CREDENTIAL HARVESTING',
            88,
            now,
            now,
        ]);
        if (phishingInv?.id) {
            await db.run('UPDATE investigations SET case_id = ? WHERE id = ?', ['case_demo_phish_01', phishingInv.id]);
        }
        await db.run(`INSERT INTO cases (id, case_number, title, priority, status, assigned_to, created_by, threat_type, risk_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            'case_demo_bec_02',
            'CASE-2025-002',
            '[DEMO DATA] Executive Impersonation & Wire Divert Attempt',
            'HIGH',
            'OPEN',
            'Lead SOC Analyst',
            adminUser?.id || 'usr_admin',
            'BUSINESS EMAIL COMPROMISE',
            92,
            now,
            now,
        ]);
        if (becInv?.id) {
            await db.run('UPDATE investigations SET case_id = ? WHERE id = ?', ['case_demo_bec_02', becInv.id]);
        }
        await (0, auditLogger_1.logAudit)({
            userId: adminUser?.id,
            userName: adminUser?.name || 'Administrator',
            action: 'DATABASE_SEEDED',
            resource: 'system:database',
            result: 'SUCCESS',
            details: 'Initialized demo investigations, cases, and credentials',
        });
        console.log('[Seed] Seed data created successfully!');
    }
    else {
        console.log(`[Seed] Database already has ${invCount?.count} investigations, skipping sample insertion.`);
    }
    console.log('[Seed] Database seeding completed successfully.');
}
if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(err => {
        console.error('[Seed Error]:', err);
        process.exit(1);
    });
}
