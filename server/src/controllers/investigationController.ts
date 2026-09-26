import { Request, Response } from 'express';
import crypto from 'crypto';
import { getDatabase } from '../models/db';
import { parseEmailBuffer, parseRawEmailFallback } from '../parsers/emailParser';
import { extractIOCs } from '../intelligence/iocExtractor';
import { analyzeHeaders } from '../intelligence/headerForensics';
import { parseReceivedHeaders } from '../intelligence/receivedChainAnalyzer';
import { ReputationService, IPGeoResult } from '../intelligence/reputationService';
import { runThreatAnalysis } from '../ai/threatDetectionEngine';
import { buildInvestigationGraph } from '../graph/graphBuilder';
import { logAudit } from '../middleware/auditLogger';
import { DEMO_SAMPLE_EMAILS } from '../demo/sampleEmails';

export async function processEmailAndSaveInvestigation(
  rawContent: Buffer | string,
  user: { id: string; name: string },
  caseId?: string,
  titleOverride?: string
): Promise<string> {
  const db = getDatabase();

  // 1. Parse Email
  const parsed = await parseEmailBuffer(rawContent);

  // 2. Extract IOCs
  const iocs = extractIOCs(parsed.bodyText, parsed.rawHeaders, parsed.attachments);

  // 3. Header Forensics
  const headerForensics = analyzeHeaders(
    parsed.headerMap,
    parsed.fromAddress,
    parsed.fromName,
    parsed.replyTo,
    parsed.returnPath
  );

  // 4. Received Hops
  const receivedHops = parseReceivedHeaders(parsed.receivedHeaders);

  // 5. Geolocation & Threat Intel for public IPs
  const ipGeoMap: Record<string, IPGeoResult> = {};
  const ipIocs = iocs.filter(i => i.type === 'IPV4');

  for (const item of ipIocs) {
    const geo = await ReputationService.getIPGeolocation(item.indicator);
    ipGeoMap[item.indicator] = geo;

    // Cache into ip_intelligence
    await db.run(
      `INSERT INTO ip_intelligence 
       (id, ip, country, country_code, region, city, latitude, longitude, asn, isp, org, timezone, threat_score, is_known_proxy, is_known_tor, is_known_vpn, is_datacenter, reputation, provider, last_checked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(ip) DO UPDATE SET
       threat_score = excluded.threat_score, reputation = excluded.reputation, last_checked = excluded.last_checked`,
      [
        crypto.randomUUID ? crypto.randomUUID() : `ip_${Date.now()}`,
        geo.ip,
        geo.country,
        geo.countryCode,
        geo.region,
        geo.city,
        geo.latitude,
        geo.longitude,
        geo.asn,
        geo.isp,
        geo.org,
        geo.timezone,
        geo.threatScore,
        geo.isKnownProxy ? 1 : 0,
        geo.isKnownTor ? 1 : 0,
        geo.isKnownVpn ? 1 : 0,
        geo.isDatacenter ? 1 : 0,
        geo.reputation,
        geo.provider,
        geo.lastChecked,
      ]
    );
  }

  // 6. Threat Analysis & AI Engine
  const aiOutput = runThreatAnalysis(
    parsed.subject,
    parsed.bodyText,
    parsed.fromAddress,
    parsed.fromName,
    parsed.replyTo,
    headerForensics,
    iocs,
    parsed.attachments
  );

  const investigationId = crypto.randomUUID ? crypto.randomUUID() : `inv_${Date.now()}`;
  const now = new Date().toISOString();
  const investigationTitle = titleOverride || parsed.subject || 'Suspicious Email Investigation';

  // 7. Save Investigation Record
  await db.run(
    `INSERT INTO investigations 
     (id, title, case_id, created_by, status, threat_type, risk_score, confidence, severity, recommended_action, storyline, score_breakdown, confidence_matrix, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      investigationId,
      investigationTitle,
      caseId || null,
      user.id,
      'COMPLETED',
      aiOutput.threatType,
      aiOutput.riskScore,
      aiOutput.confidence,
      aiOutput.severity,
      aiOutput.recommendations[0] || 'Quarantine and review email infrastructure.',
      aiOutput.storyline,
      JSON.stringify(aiOutput.scoreBreakdown),
      JSON.stringify(aiOutput.confidenceMatrix),
      now,
      now,
    ]
  );

  // 8. Save Email Record
  const emailId = crypto.randomUUID ? crypto.randomUUID() : `eml_${Date.now()}`;
  await db.run(
    `INSERT INTO emails 
     (id, investigation_id, message_id, subject, from_address, from_name, to_addresses, cc_addresses, reply_to, return_path, date, body_text, body_html_sanitized, raw_headers, raw_eml_sha256, has_attachments, attachments_meta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      emailId,
      investigationId,
      parsed.messageId,
      parsed.subject,
      parsed.fromAddress,
      parsed.fromName,
      JSON.stringify(parsed.toAddresses),
      JSON.stringify(parsed.ccAddresses),
      parsed.replyTo,
      parsed.returnPath,
      parsed.date,
      parsed.bodyText,
      parsed.bodyHtmlSanitized,
      parsed.rawHeaders,
      parsed.rawSha256,
      parsed.attachments.length > 0 ? 1 : 0,
      JSON.stringify(parsed.attachments),
      now,
    ]
  );

  // 9. Save Headers
  for (const header of headerForensics.headers) {
    const hId = crypto.randomUUID ? crypto.randomUUID() : `hdr_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO email_headers (id, investigation_id, name, value, status, explanation, risk_contribution)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [hId, investigationId, header.name, header.value, header.status, header.explanation, header.riskContribution]
    );
  }

  // 10. Save Authentication Results
  const auth = headerForensics.authResults;
  const authId = crypto.randomUUID ? crypto.randomUUID() : `auth_${Date.now()}`;
  await db.run(
    `INSERT INTO authentication_results (id, investigation_id, spf_status, spf_details, dkim_status, dkim_details, dmarc_status, dmarc_details, arc_status, overall_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      authId,
      investigationId,
      auth.spfStatus,
      auth.spfDetails,
      auth.dkimStatus,
      auth.dkimDetails,
      auth.dmarcStatus,
      auth.dmarcDetails,
      auth.arcStatus,
      auth.overallScore,
    ]
  );

  // 11. Save IOCs
  for (const ioc of iocs) {
    const iocId = crypto.randomUUID ? crypto.randomUUID() : `ioc_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO iocs (id, investigation_id, type, indicator, risk_level, source, status, context)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [iocId, investigationId, ioc.type, ioc.indicator, ioc.riskLevel, ioc.source, ioc.status, ioc.context]
    );
  }

  // 12. Save Received Hops
  for (const hop of receivedHops) {
    const hopId = crypto.randomUUID ? crypto.randomUUID() : `hop_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO received_hops (id, investigation_id, hop_index, from_host, by_host, ip, timestamp, protocol, delay_seconds, is_suspicious, suspicion_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hopId,
        investigationId,
        hop.hopIndex,
        hop.fromHost,
        hop.byHost,
        hop.ip,
        hop.timestamp,
        hop.protocol,
        hop.delaySeconds,
        hop.isSuspicious ? 1 : 0,
        hop.suspicionReason,
      ]
    );
  }

  // 13. Build & Save Investigation Graph
  const graph = buildInvestigationGraph(
    investigationId,
    parsed.subject,
    parsed.fromAddress,
    parsed.replyTo,
    iocs,
    ipGeoMap,
    parsed.attachments
  );

  for (const node of graph.nodes) {
    const nId = crypto.randomUUID ? crypto.randomUUID() : `node_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO investigation_nodes (id, investigation_id, node_id, node_type, label, risk_level, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nId, investigationId, node.id, node.type, node.label, node.riskLevel, JSON.stringify(node.metadata)]
    );
  }

  for (const edge of graph.edges) {
    const eId = crypto.randomUUID ? crypto.randomUUID() : `edge_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO investigation_edges (id, investigation_id, source_id, target_id, relation_type, label)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eId, investigationId, edge.source, edge.target, edge.type, edge.label]
    );
  }

  // 14. Save Timeline Events
  const events = [
    {
      timestamp: parsed.date,
      eventType: 'EMAIL_RECEIVED',
      title: 'Email Ingested by Relay',
      description: `Message submitted with Message-ID ${parsed.messageId}`,
      severity: 'LOW',
      source: 'MTA GATEWAY',
    },
    {
      timestamp: new Date(Date.now() - 4000).toISOString(),
      eventType: 'SPF_EVALUATION',
      title: `SPF Evaluation (${auth.spfStatus})`,
      description: auth.spfDetails,
      severity: auth.spfStatus === 'FAIL' ? 'HIGH' : 'LOW',
      source: 'AUTH ENGINE',
    },
    {
      timestamp: new Date(Date.now() - 3000).toISOString(),
      eventType: 'DKIM_EVALUATION',
      title: `DKIM Verification (${auth.dkimStatus})`,
      description: auth.dkimDetails,
      severity: auth.dkimStatus === 'FAIL' ? 'HIGH' : 'LOW',
      source: 'AUTH ENGINE',
    },
    {
      timestamp: new Date(Date.now() - 2000).toISOString(),
      eventType: 'IOC_EXTRACTION',
      title: `IOC Telemetry Extracted (${iocs.length} Indicators)`,
      description: `Extracted ${iocs.filter(i => i.type === 'IPV4').length} IPs, ${iocs.filter(i => i.type === 'URL').length} URLs, and ${iocs.filter(i => i.type === 'DOMAIN').length} domains`,
      severity: iocs.some(i => i.riskLevel === 'CRITICAL') ? 'CRITICAL' : 'LOW',
      source: 'IOC ENGINE',
    },
    {
      timestamp: new Date(Date.now() - 1000).toISOString(),
      eventType: 'AI_DETECTION',
      title: `Threat Classification Complete: ${aiOutput.threatType}`,
      description: `Risk score assessed at ${aiOutput.riskScore}/100 with ${aiOutput.confidence}% confidence`,
      severity: aiOutput.severity,
      source: 'AI ENGINE',
    },
    {
      timestamp: now,
      eventType: 'INVESTIGATION_OPENED',
      title: 'Forensic Case Cataloged',
      description: `Investigation initialized by analyst ${user.name}`,
      severity: 'LOW',
      source: 'SOC CONSOLE',
    },
  ];

  for (const evt of events) {
    const evtId = crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random()}`;
    await db.run(
      `INSERT INTO timeline_events (id, investigation_id, timestamp, event_type, title, description, severity, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [evtId, investigationId, evt.timestamp, evt.eventType, evt.title, evt.description, evt.severity, evt.source]
    );
  }

  // 15. Catalog Evidence Vault with cryptographic SHA-256 hashes
  const evidenceItems = [
    {
      type: 'ORIGINAL_EML',
      source: 'USER_UPLOAD',
      sha256: parsed.rawSha256,
      desc: 'Raw ingested MIME message buffer',
      content: { length: rawContent.length, sha256: parsed.rawSha256 },
    },
    {
      type: 'EXTRACTED_HEADERS',
      source: 'HEADER_PARSER',
      sha256: crypto.createHash('sha256').update(parsed.rawHeaders).digest('hex'),
      desc: 'RFC 5322 Ingestion Headers',
      content: headerForensics.headers,
    },
    {
      type: 'IOC_COLLECTION',
      source: 'IOC_ENGINE',
      sha256: crypto.createHash('sha256').update(JSON.stringify(iocs)).digest('hex'),
      desc: `Structured IOC catalog (${iocs.length} indicators)`,
      content: iocs,
    },
    {
      type: 'AI_ANALYSIS_PAYLOAD',
      source: 'AI_MODEL',
      sha256: crypto.createHash('sha256').update(JSON.stringify(aiOutput)).digest('hex'),
      desc: 'Explainable threat score and classification snapshot',
      content: aiOutput,
    },
  ];

  for (const item of evidenceItems) {
    const eId = crypto.randomUUID ? crypto.randomUUID() : `ev_${Date.now()}_${Math.random()}`;
    const evidenceCode = `EVD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    await db.run(
      `INSERT INTO evidence_vault (id, investigation_id, evidence_id, type, source, sha256_hash, description, content_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eId, investigationId, evidenceCode, item.type, item.source, item.sha256, item.desc, JSON.stringify(item.content), now]
    );
  }

  // 16. Audit Log
  await logAudit({
    userId: user.id,
    userName: user.name,
    action: 'INVESTIGATION_CREATED',
    resource: `investigation:${investigationId}`,
    result: 'SUCCESS',
    details: { subject: parsed.subject, threatType: aiOutput.threatType, riskScore: aiOutput.riskScore },
  });

  return investigationId;
}

// Controller Endpoints
export async function createInvestigation(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user || { id: 'usr_guest', name: 'Analyst' };
    const { rawEml, rawHeaders, body, subject, caseId, title } = req.body;

    let contentToAnalyze = '';
    if (rawEml) {
      contentToAnalyze = rawEml;
    } else if (rawHeaders || body) {
      contentToAnalyze = `${rawHeaders || ''}\n\n${body || ''}`;
    } else {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Please provide either a raw .eml buffer or raw headers/body text.' },
      });
      return;
    }

    const investigationId = await processEmailAndSaveInvestigation(contentToAnalyze, user as any, caseId, title);

    res.status(201).json({
      success: true,
      data: {
        investigationId,
        message: 'Investigation created and analyzed successfully.',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: err.message || 'Failed to process email investigation.' },
    });
  }
}

export async function uploadEmlFile(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user || { id: 'usr_guest', name: 'Analyst' };
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE_UPLOADED', message: 'No file received in upload request.' },
      });
      return;
    }

    const investigationId = await processEmailAndSaveInvestigation(file.buffer, user as any, undefined, file.originalname);

    res.status(201).json({
      success: true,
      data: {
        investigationId,
        filename: file.originalname,
        message: 'Email file parsed and investigated successfully.',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: err.message || 'Failed to upload and analyze .eml file.' },
    });
  }
}

export async function getInvestigationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const inv = await db.get('SELECT * FROM investigations WHERE id = ?', [id]);
    if (!inv) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Investigation with ID "${id}" was not found.` },
      });
      return;
    }

    const email = await db.get('SELECT * FROM emails WHERE investigation_id = ?', [id]);
    const headers = await db.query('SELECT * FROM email_headers WHERE investigation_id = ?', [id]);
    const authResults = await db.get('SELECT * FROM authentication_results WHERE investigation_id = ?', [id]);
    const iocs = await db.query('SELECT * FROM iocs WHERE investigation_id = ?', [id]);
    const receivedHops = await db.query('SELECT * FROM received_hops WHERE investigation_id = ? ORDER BY hop_index ASC', [id]);
    const timeline = await db.query('SELECT * FROM timeline_events WHERE investigation_id = ? ORDER BY timestamp ASC', [id]);
    const evidence = await db.query('SELECT * FROM evidence_vault WHERE investigation_id = ? ORDER BY created_at ASC', [id]);
    const notes = await db.query('SELECT * FROM analyst_notes WHERE investigation_id = ? ORDER BY created_at DESC', [id]);
    const nodes = await db.query('SELECT * FROM investigation_nodes WHERE investigation_id = ?', [id]);
    const edges = await db.query('SELECT * FROM investigation_edges WHERE investigation_id = ?', [id]);

    // Build IP Geo Map
    const ipGeoMap: Record<string, any> = {};
    const ipList = iocs.filter((i: any) => i.type === 'IPV4');
    for (const ipItem of ipList) {
      const geo = await db.get('SELECT * FROM ip_intelligence WHERE ip = ?', [ipItem.indicator]);
      if (geo) {
        ipGeoMap[ipItem.indicator] = geo;
      }
    }

    res.json({
      success: true,
      data: {
        investigation: {
          ...inv,
          score_breakdown: inv.score_breakdown ? JSON.parse(inv.score_breakdown) : [],
          confidence_matrix: inv.confidence_matrix ? JSON.parse(inv.confidence_matrix) : [],
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
        evidence: evidence.map((e: any) => ({
          ...e,
          content_json: e.content_json ? JSON.parse(e.content_json) : null,
        })),
        notes,
        graph: {
          nodes: nodes.map((n: any) => ({
            id: n.node_id,
            type: n.node_type,
            label: n.label,
            riskLevel: n.risk_level,
            metadata: n.meta_json ? JSON.parse(n.meta_json) : {},
          })),
          edges: edges.map((e: any) => ({
            id: e.id,
            source: e.source_id,
            target: e.target_id,
            type: e.relation_type,
            label: e.label,
          })),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function listInvestigations(req: Request, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = (page - 1) * limit;

    const threatType = req.query.threatType as string;
    const severity = req.query.severity as string;
    const search = req.query.search as string;

    let query = 'SELECT * FROM investigations WHERE 1=1';
    const params: any[] = [];

    if (threatType) {
      query += ' AND threat_type = ?';
      params.push(threatType);
    }
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }
    if (search) {
      query += ' AND (title LIKE ? OR storyline LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const items = await db.query(query, params);
    const totalCountRow = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM investigations');

    res.json({
      success: true,
      data: {
        investigations: items.map(inv => ({
          ...inv,
          score_breakdown: inv.score_breakdown ? JSON.parse(inv.score_breakdown) : [],
        })),
        pagination: {
          page,
          limit,
          total: totalCountRow?.count || 0,
          totalPages: Math.ceil((totalCountRow?.count || 0) / limit),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function deleteInvestigation(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const db = getDatabase();

    await db.run('DELETE FROM investigations WHERE id = ?', [id]);

    await logAudit({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'INVESTIGATION_DELETED',
      resource: `investigation:${id}`,
      result: 'SUCCESS',
    });

    res.json({
      success: true,
      data: { message: `Investigation ${id} deleted successfully.` },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function addAnalystNote(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user || { id: 'usr_guest', name: 'Analyst' };

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Note content cannot be empty.' },
      });
      return;
    }

    const db = getDatabase();
    const noteId = crypto.randomUUID ? crypto.randomUUID() : `note_${Date.now()}`;
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO analyst_notes (id, investigation_id, author_id, author_name, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [noteId, id, user.id, user.name, content.trim(), now, now]
    );

    // Also add to timeline
    const evtId = crypto.randomUUID ? crypto.randomUUID() : `evt_${Date.now()}`;
    await db.run(
      'INSERT INTO timeline_events (id, investigation_id, timestamp, event_type, title, description, severity, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [evtId, id, now, 'ANALYST_NOTE', `Analyst Note Added by ${user.name}`, content.trim(), 'LOW', 'ANALYST']
    );

    res.status(201).json({
      success: true,
      data: {
        note: {
          id: noteId,
          investigation_id: id,
          author_id: user.id,
          author_name: user.name,
          content: content.trim(),
          created_at: now,
          updated_at: now,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
}

export async function loadDemoSample(req: Request, res: Response): Promise<void> {
  try {
    const { sampleId } = req.body;
    const user = req.user || { id: 'usr_analyst', name: 'SOC Analyst' };

    const sample = DEMO_SAMPLE_EMAILS.find(s => s.id === sampleId) || DEMO_SAMPLE_EMAILS[1]; // default to phishing demo

    const investigationId = await processEmailAndSaveInvestigation(
      sample.emlRaw,
      user as any,
      undefined,
      `[DEMO DATA] ${sample.name}`
    );

    res.status(201).json({
      success: true,
      data: {
        investigationId,
        sampleName: sample.name,
        isDemo: true,
        message: 'Safe demo email loaded and analyzed into SOC workspace.',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: { code: 'DEMO_LOAD_FAILED', message: err.message },
    });
  }
}
