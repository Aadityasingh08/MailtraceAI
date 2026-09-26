"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIpIntelligence = checkIpIntelligence;
exports.checkDomainIntelligence = checkDomainIntelligence;
exports.checkUrlIntelligence = checkUrlIntelligence;
exports.getSystemSettings = getSystemSettings;
exports.updateSystemSettings = updateSystemSettings;
exports.getAuditLogs = getAuditLogs;
const reputationService_1 = require("../intelligence/reputationService");
const lookalikeDetector_1 = require("../intelligence/lookalikeDetector");
const db_1 = require("../models/db");
const env_1 = require("../config/env");
async function checkIpIntelligence(req, res) {
    try {
        const { ip } = req.body;
        if (!ip) {
            res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'IP address is required.' } });
            return;
        }
        const geo = await reputationService_1.ReputationService.getIPGeolocation(ip);
        const abuse = await reputationService_1.ReputationService.checkAbuseIPDB(ip);
        const vt = await reputationService_1.ReputationService.checkVirusTotal(ip, 'IP');
        res.json({
            success: true,
            data: {
                geolocation: geo,
                abuseIpDb: abuse,
                virusTotal: vt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function checkDomainIntelligence(req, res) {
    try {
        const { domain } = req.body;
        if (!domain) {
            res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Domain is required.' } });
            return;
        }
        const lookalike = (0, lookalikeDetector_1.detectLookalikeDomain)(domain);
        const vt = await reputationService_1.ReputationService.checkVirusTotal(domain, 'DOMAIN');
        res.json({
            success: true,
            data: {
                domain,
                lookalike,
                virusTotal: vt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function checkUrlIntelligence(req, res) {
    try {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'URL is required.' } });
            return;
        }
        const vt = await reputationService_1.ReputationService.checkVirusTotal(url, 'URL');
        const domainPart = url.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
        const lookalike = (0, lookalikeDetector_1.detectLookalikeDomain)(domainPart);
        res.json({
            success: true,
            data: {
                url,
                domainPart,
                lookalike,
                virusTotal: vt,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function getSystemSettings(req, res) {
    try {
        res.json({
            success: true,
            data: {
                nodeEnv: env_1.config.nodeEnv,
                port: env_1.config.port,
                databaseType: env_1.config.databaseUrl ? 'PostgreSQL' : 'SQLite',
                hasVirustotalKey: Boolean(env_1.config.virustotalApiKey),
                hasAbuseIpDbKey: Boolean(env_1.config.abuseipdbApiKey),
                hasGeolocationKey: Boolean(env_1.config.geolocationApiKey),
                hasAiKey: Boolean(env_1.config.aiApiKey),
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function updateSystemSettings(req, res) {
    try {
        const { virustotalApiKey, abuseipdbApiKey, geolocationApiKey, aiApiKey } = req.body;
        if (virustotalApiKey !== undefined)
            env_1.config.virustotalApiKey = virustotalApiKey;
        if (abuseipdbApiKey !== undefined)
            env_1.config.abuseipdbApiKey = abuseipdbApiKey;
        if (geolocationApiKey !== undefined)
            env_1.config.geolocationApiKey = geolocationApiKey;
        if (aiApiKey !== undefined)
            env_1.config.aiApiKey = aiApiKey;
        res.json({
            success: true,
            data: {
                message: 'Threat intelligence API settings updated successfully.',
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
async function getAuditLogs(req, res) {
    try {
        const db = (0, db_1.getDatabase)();
        const logs = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
        res.json({
            success: true,
            data: { logs },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
}
