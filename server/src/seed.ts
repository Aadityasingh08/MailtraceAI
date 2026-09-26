import { initDatabase, getDatabase } from './models/db';
import { AuthService } from './auth/authService';
import { processEmailAndSaveInvestigation } from './controllers/investigationController';
import { DEMO_SAMPLE_EMAILS } from './demo/sampleEmails';
import { logAudit } from './middleware/auditLogger';

async function seed(): Promise<void> {
  console.log('[Seed] Starting MailTrace AI database initialization and seeding...');
  await initDatabase();
  const db = getDatabase();

  // 1. Create Default Users if not exist
  const adminEmail = 'admin@mailtrace.soc';
  const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);

  let adminUser: any;
  if (!existingAdmin) {
    const adminRes = await AuthService.register('SOC Security Administrator', adminEmail, 'Admin@MailTrace2025!', 'ADMIN');
    adminUser = adminRes.user;
    console.log('[Seed] Created default ADMIN: admin@mailtrace.soc (Pass: Admin@MailTrace2025!)');
  } else {
    adminUser = await AuthService.getUserById(existingAdmin.id);
  }

  const analystEmail = 'analyst@mailtrace.soc';
  const existingAnalyst = await db.get('SELECT id FROM users WHERE email = ?', [analystEmail]);
  if (!existingAnalyst) {
    await AuthService.register('Lead SOC Analyst', analystEmail, 'Analyst@MailTrace2025!', 'ANALYST');
    console.log('[Seed] Created default ANALYST: analyst@mailtrace.soc (Pass: Analyst@MailTrace2025!)');
  }

  const viewerEmail = 'viewer@mailtrace.soc';
  const existingViewer = await db.get('SELECT id FROM users WHERE email = ?', [viewerEmail]);
  if (!existingViewer) {
    await AuthService.register('Executive Auditor', viewerEmail, 'Viewer@MailTrace2025!', 'VIEWER');
    console.log('[Seed] Created default VIEWER: viewer@mailtrace.soc (Pass: Viewer@MailTrace2025!)');
  }

  // 2. Ingest Demo Forensic Emails
  const invCount = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM investigations');
  if ((invCount?.count || 0) === 0) {
    console.log('[Seed] Ingesting demo forensic email corpus...');

    for (const sample of DEMO_SAMPLE_EMAILS) {
      const invId = await processEmailAndSaveInvestigation(
        sample.emlRaw,
        adminUser || { id: 'usr_admin', name: 'SOC Security Administrator' },
        undefined,
        `[DEMO DATA] ${sample.name}`
      );
      console.log(`[Seed] Ingested "${sample.name}" -> Investigation ID: ${invId}`);
    }

    // 3. Create Demo Cases
    const now = new Date().toISOString();
    const phishingInv = await db.get<{ id: string }>("SELECT id FROM investigations WHERE threat_type IN ('PHISHING', 'CREDENTIAL HARVESTING') LIMIT 1");
    const becInv = await db.get<{ id: string }>("SELECT id FROM investigations WHERE threat_type = 'BUSINESS EMAIL COMPROMISE' LIMIT 1");

    await db.run(
      `INSERT INTO cases (id, case_number, title, priority, status, assigned_to, created_by, threat_type, risk_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    if (phishingInv?.id) {
      await db.run('UPDATE investigations SET case_id = ? WHERE id = ?', ['case_demo_phish_01', phishingInv.id]);
    }

    await db.run(
      `INSERT INTO cases (id, case_number, title, priority, status, assigned_to, created_by, threat_type, risk_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    if (becInv?.id) {
      await db.run('UPDATE investigations SET case_id = ? WHERE id = ?', ['case_demo_bec_02', becInv.id]);
    }

    await logAudit({
      userId: adminUser?.id,
      userName: adminUser?.name || 'Administrator',
      action: 'DATABASE_SEEDED',
      resource: 'system:database',
      result: 'SUCCESS',
      details: 'Initialized demo investigations, cases, and credentials',
    });

    console.log('[Seed] Seed data created successfully!');
  } else {
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

export { seed };
