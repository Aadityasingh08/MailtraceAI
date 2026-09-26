import { Request, Response } from 'express';
import { ReputationService } from '../intelligence/reputationService';
import { detectLookalikeDomain } from '../intelligence/lookalikeDetector';
import { getDatabase } from '../models/db';
import { config } from '../config/env';

export async function checkIpIntelligence(req: Request, res: Response): Promise<void> {
  try {
    const { ip } = req.body;
    if (!ip) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'IP address is required.' } });
      return;
    }

    const geo = await ReputationService.getIPGeolocation(ip);
    const abuse = await ReputationService.checkAbuseIPDB(ip);
    const vt = await ReputationService.checkVirusTotal(ip, 'IP');

    res.json({
      success: true,
      data: {
        geolocation: geo,
        abuseIpDb: abuse,
        virusTotal: vt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function checkDomainIntelligence(req: Request, res: Response): Promise<void> {
  try {
    const { domain } = req.body;
    if (!domain) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Domain is required.' } });
      return;
    }

    const lookalike = detectLookalikeDomain(domain);
    const vt = await ReputationService.checkVirusTotal(domain, 'DOMAIN');

    res.json({
      success: true,
      data: {
        domain,
        lookalike,
        virusTotal: vt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function checkUrlIntelligence(req: Request, res: Response): Promise<void> {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'URL is required.' } });
      return;
    }

    const vt = await ReputationService.checkVirusTotal(url, 'URL');
    const domainPart = url.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
    const lookalike = detectLookalikeDomain(domainPart);

    res.json({
      success: true,
      data: {
        url,
        domainPart,
        lookalike,
        virusTotal: vt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getSystemSettings(req: Request, res: Response): Promise<void> {
  try {
    res.json({
      success: true,
      data: {
        nodeEnv: config.nodeEnv,
        port: config.port,
        databaseType: config.databaseUrl ? 'PostgreSQL' : 'SQLite',
        hasVirustotalKey: Boolean(config.virustotalApiKey),
        hasAbuseIpDbKey: Boolean(config.abuseipdbApiKey),
        hasGeolocationKey: Boolean(config.geolocationApiKey),
        hasAiKey: Boolean(config.aiApiKey),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function updateSystemSettings(req: Request, res: Response): Promise<void> {
  try {
    const { virustotalApiKey, abuseipdbApiKey, geolocationApiKey, aiApiKey } = req.body;

    if (virustotalApiKey !== undefined) config.virustotalApiKey = virustotalApiKey;
    if (abuseipdbApiKey !== undefined) config.abuseipdbApiKey = abuseipdbApiKey;
    if (geolocationApiKey !== undefined) config.geolocationApiKey = geolocationApiKey;
    if (aiApiKey !== undefined) config.aiApiKey = aiApiKey;

    res.json({
      success: true,
      data: {
        message: 'Threat intelligence API settings updated successfully.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const db = getDatabase();
    const logs = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');

    res.json({
      success: true,
      data: { logs },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}
