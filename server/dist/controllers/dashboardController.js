"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardMetrics = getDashboardMetrics;
const db_1 = require("../models/db");
const env_1 = require("../config/env");
async function getDashboardMetrics(req, res) {
    try {
        const db = (0, db_1.getDatabase)();
        // 1. Core metric counters
        const totalInvRow = await db.get('SELECT COUNT(*) as count FROM investigations');
        const totalInvestigations = totalInvRow?.count || 0;
        const criticalRow = await db.get("SELECT COUNT(*) as count FROM investigations WHERE severity = 'CRITICAL'");
        const criticalThreats = criticalRow?.count || 0;
        const highRiskRow = await db.get("SELECT COUNT(*) as count FROM investigations WHERE severity IN ('CRITICAL', 'HIGH')");
        const highRiskEmails = highRiskRow?.count || 0;
        const phishingRow = await db.get("SELECT COUNT(*) as count FROM investigations WHERE threat_type IN ('PHISHING', 'CREDENTIAL HARVESTING')");
        const phishingDetected = phishingRow?.count || 0;
        const malwareRow = await db.get("SELECT COUNT(*) as count FROM investigations WHERE threat_type = 'MALWARE DELIVERY'");
        const malwareIndicators = malwareRow?.count || 0;
        const suspDomainsRow = await db.get("SELECT COUNT(DISTINCT indicator) as count FROM iocs WHERE type = 'DOMAIN' AND risk_level IN ('HIGH', 'CRITICAL')");
        const suspiciousDomains = suspDomainsRow?.count || 0;
        const suspIpsRow = await db.get("SELECT COUNT(DISTINCT indicator) as count FROM iocs WHERE type = 'IPV4' AND risk_level IN ('HIGH', 'CRITICAL')");
        const suspiciousIPs = suspIpsRow?.count || 0;
        const openCasesRow = await db.get("SELECT COUNT(*) as count FROM cases WHERE status IN ('OPEN', 'INVESTIGATING')");
        const openCases = openCasesRow?.count || 0;
        // Today's count
        const todayPrefix = new Date().toISOString().slice(0, 10);
        const todayRow = await db.get('SELECT COUNT(*) as count FROM investigations WHERE created_at LIKE ?', [`${todayPrefix}%`]);
        const investigationsToday = todayRow?.count || 0;
        // 2. Chart 1: Threat Severity Distribution
        const severityRows = await db.query('SELECT severity, COUNT(*) as count FROM investigations GROUP BY severity');
        const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        severityRows.forEach(r => {
            severityMap[r.severity] = r.count;
        });
        const severityDistribution = [
            { name: 'Critical', value: severityMap.CRITICAL, color: '#FF3B5C' },
            { name: 'High', value: severityMap.HIGH, color: '#FF8A00' },
            { name: 'Medium', value: severityMap.MEDIUM, color: '#FFB020' },
            { name: 'Low / Benign', value: severityMap.LOW, color: '#20D68A' },
        ];
        // 3. Chart 2: Threat Types
        const threatTypeRows = await db.query('SELECT threat_type, COUNT(*) as count FROM investigations GROUP BY threat_type ORDER BY count DESC');
        const threatTypes = threatTypeRows.map(r => ({
            name: r.threat_type,
            count: r.count,
        }));
        // 4. Chart 3: Investigations Over Time (Last 7 Days)
        const investigationsOverTime = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const totalForDay = await db.get('SELECT COUNT(*) as count FROM investigations WHERE created_at LIKE ?', [`${dateStr}%`]);
            const highRiskForDay = await db.get("SELECT COUNT(*) as count FROM investigations WHERE created_at LIKE ? AND severity IN ('CRITICAL', 'HIGH')", [`${dateStr}%`]);
            investigationsOverTime.push({
                date: dateStr.slice(5), // MM-DD
                total: totalForDay?.count || 0,
                highRisk: highRiskForDay?.count || 0,
            });
        }
        // 5. Chart 4: Top Suspicious Domains
        const topDomainsRows = await db.query(`SELECT indicator, COUNT(*) as count FROM iocs 
       WHERE type = 'DOMAIN' AND risk_level IN ('HIGH', 'CRITICAL') 
       GROUP BY indicator ORDER BY count DESC LIMIT 6`);
        const topSuspiciousDomains = topDomainsRows.map(r => ({
            domain: r.indicator,
            detections: r.count,
        }));
        // 6. Chart 5: Top Source Countries
        const topCountriesRows = await db.query(`SELECT country, COUNT(*) as count FROM ip_intelligence 
       WHERE country != 'Internal Network' AND country != 'Unknown' 
       GROUP BY country ORDER BY count DESC LIMIT 6`);
        const topSourceCountries = topCountriesRows.map(r => ({
            country: r.country,
            count: r.count,
        }));
        // 7. Chart 6: IOC Statistics by Type
        const iocTypeRows = await db.query('SELECT type, COUNT(*) as count FROM iocs GROUP BY type ORDER BY count DESC');
        const iocStatistics = iocTypeRows.map(r => ({
            type: r.type,
            count: r.count,
        }));
        // 8. Live System Status Panel
        const systemStatus = [
            { name: 'EMAIL PARSER', status: 'ONLINE', details: 'RFC 5322 MIME Engine Active' },
            { name: 'AI ENGINE', status: 'ONLINE', details: 'Heuristic & Explainable Threat Scorer Active' },
            {
                name: 'THREAT INTEL',
                status: env_1.config.virustotalApiKey || env_1.config.abuseipdbApiKey ? 'ONLINE' : 'NOT CONFIGURED',
                details: env_1.config.virustotalApiKey || env_1.config.abuseipdbApiKey ? 'Connected to External Feeds' : 'API Key Not Configured (Using Offline Threat DB)',
            },
            {
                name: 'GEOLOCATION',
                status: env_1.config.geolocationApiKey ? 'ONLINE' : 'ONLINE (FALLBACK)',
                details: env_1.config.geolocationApiKey ? 'External Geo Provider Active' : 'Autonomous Network Route Forensics Active',
            },
            { name: 'DATABASE', status: 'ONLINE', details: env_1.config.databaseUrl ? 'PostgreSQL Active' : 'High-Performance Local SQLite Active' },
            { name: 'REPORT ENGINE', status: 'ONLINE', details: 'PDF / JSON / CSV Generators Active' },
        ];
        // Recent investigations
        const recentInvestigations = await db.query('SELECT id, title, threat_type, risk_score, severity, created_at FROM investigations ORDER BY created_at DESC LIMIT 6');
        res.json({
            success: true,
            data: {
                summary: {
                    totalInvestigations,
                    highRiskEmails,
                    criticalThreats,
                    phishingDetected,
                    malwareIndicators,
                    suspiciousDomains,
                    suspiciousIPs,
                    openCases,
                    investigationsToday,
                },
                charts: {
                    severityDistribution,
                    threatTypes,
                    investigationsOverTime,
                    topSuspiciousDomains,
                    topSourceCountries,
                    iocStatistics,
                },
                systemStatus,
                recentInvestigations,
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: err.message },
        });
    }
}
