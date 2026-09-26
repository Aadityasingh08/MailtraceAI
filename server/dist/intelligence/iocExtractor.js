"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrivateIP = isPrivateIP;
exports.extractIOCs = extractIOCs;
const lookalikeDetector_1 = require("./lookalikeDetector");
const SUSPICIOUS_TLDS = new Set([
    'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz', 'rest', 'icu', 'work', 'vip',
    'click', 'link', 'country', 'stream', 'download', 'racing', 'win', 'accountant',
    'bid', 'loan', 'date', 'faith', 'cricket', 'party', 'review', 'science', 'trade', 'kim'
]);
const URL_SHORTENERS = new Set([
    'bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'ow.ly', 'rebrand.ly',
    'buff.ly', 'shorturl.at', 'rb.gy', 'v.gd', 'soo.gd', 's.id'
]);
function isPrivateIP(ip) {
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1')
        return true;
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4)
        return false;
    // 10.0.0.0/8
    if (parts[0] === 10)
        return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
        return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168)
        return true;
    // 169.254.0.0/16
    if (parts[0] === 169 && parts[1] === 254)
        return true;
    return false;
}
function extractIOCs(bodyText, rawHeaders, attachments = []) {
    const iocs = [];
    const seen = new Set();
    const combinedContent = `${rawHeaders}\n\n${bodyText}`;
    // 1. IPv4 Regex
    const ipv4Regex = /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    let match;
    while ((match = ipv4Regex.exec(combinedContent)) !== null) {
        const ip = match[0];
        const key = `IPV4:${ip}`;
        if (!seen.has(key)) {
            seen.add(key);
            const isPriv = isPrivateIP(ip);
            const isHeader = rawHeaders.includes(ip);
            iocs.push({
                type: 'IPV4',
                indicator: ip,
                riskLevel: isPriv ? 'LOW' : 'MEDIUM',
                source: isHeader ? 'HEADER' : 'BODY',
                status: isPriv ? 'ACTIVE' : 'SUSPICIOUS',
                context: isPriv ? 'Internal / RFC 1918 Private Address' : 'Public IPv4 network address in transmission path or body',
            });
        }
    }
    // 2. URLs (including defanged hxxp://)
    const urlRegex = /\b(?:https?|hxxps?|ftp):\/\/[^\s<>"'{}|\\^`]+|\bwww\.[^\s<>"'{}|\\^`]+/gi;
    while ((match = urlRegex.exec(bodyText)) !== null) {
        let url = match[0].replace(/[.,;:)]$/, '');
        // normalize defanged
        url = url.replace(/^hxxp/i, 'http');
        const key = `URL:${url}`;
        if (!seen.has(key)) {
            seen.add(key);
            let risk = 'MEDIUM';
            const parsedHost = url.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
            const tld = parsedHost.split('.').pop() || '';
            const isShortener = URL_SHORTENERS.has(parsedHost);
            const isSuspiciousTLD = SUSPICIOUS_TLDS.has(tld);
            const lookalike = (0, lookalikeDetector_1.detectLookalikeDomain)(parsedHost);
            if (lookalike.isLookalike || isShortener || isSuspiciousTLD) {
                risk = lookalike.isLookalike ? 'CRITICAL' : 'HIGH';
            }
            iocs.push({
                type: 'URL',
                indicator: url,
                riskLevel: risk,
                source: 'BODY',
                status: risk === 'CRITICAL' || risk === 'HIGH' ? 'SUSPICIOUS' : 'ACTIVE',
                context: isShortener
                    ? 'URL shortener obscuring final destination'
                    : lookalike.isLookalike
                        ? `Host resembles brand "${lookalike.targetBrand}"`
                        : isSuspiciousTLD
                            ? `High-abuse Top-Level Domain (.${tld})`
                            : 'Embedded hyperlink extracted from email body',
            });
        }
    }
    // 3. Email Addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    while ((match = emailRegex.exec(combinedContent)) !== null) {
        const email = match[0].toLowerCase();
        const key = `EMAIL:${email}`;
        if (!seen.has(key)) {
            seen.add(key);
            const domain = email.split('@')[1];
            const lookalike = (0, lookalikeDetector_1.detectLookalikeDomain)(domain);
            const isHeader = rawHeaders.toLowerCase().includes(email);
            const risk = lookalike.isLookalike ? 'HIGH' : 'LOW';
            iocs.push({
                type: 'EMAIL',
                indicator: email,
                riskLevel: risk,
                source: isHeader ? 'HEADER' : 'BODY',
                status: lookalike.isLookalike ? 'SUSPICIOUS' : 'ACTIVE',
                context: lookalike.isLookalike
                    ? `Sender domain lookalike detected for brand "${lookalike.targetBrand}"`
                    : 'Email identity extracted from headers or content',
            });
        }
    }
    // 4. Domains (derived from URLs, emails, and header hosts)
    for (const item of Array.from(seen)) {
        let domainCandidate = '';
        if (item.startsWith('URL:')) {
            const u = item.substring(4);
            domainCandidate = u.replace(/^[a-z]+:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
        }
        else if (item.startsWith('EMAIL:')) {
            domainCandidate = item.substring(6).split('@')[1];
        }
        if (domainCandidate && !domainCandidate.includes(' ') && domainCandidate.includes('.')) {
            const key = `DOMAIN:${domainCandidate}`;
            if (!seen.has(key)) {
                seen.add(key);
                const tld = domainCandidate.split('.').pop() || '';
                const lookalike = (0, lookalikeDetector_1.detectLookalikeDomain)(domainCandidate);
                const isSuspiciousTLD = SUSPICIOUS_TLDS.has(tld);
                const isPunycode = domainCandidate.startsWith('xn--') || domainCandidate.includes('.xn--');
                let risk = 'LOW';
                let context = 'Identified domain infrastructure';
                if (lookalike.isLookalike) {
                    risk = 'CRITICAL';
                    context = `Lookalike deception imitating "${lookalike.targetBrand}" (${lookalike.similarity}% match)`;
                }
                else if (isPunycode) {
                    risk = 'HIGH';
                    context = 'Internationalized Domain Name (Punycode / Homograph candidate)';
                }
                else if (isSuspiciousTLD) {
                    risk = 'MEDIUM';
                    context = `High-abuse TLD registered domain (.${tld})`;
                }
                iocs.push({
                    type: 'DOMAIN',
                    indicator: domainCandidate,
                    riskLevel: risk,
                    source: 'BODY',
                    status: risk === 'CRITICAL' || risk === 'HIGH' ? 'SUSPICIOUS' : 'ACTIVE',
                    context,
                });
            }
        }
    }
    // 5. File Hashes (MD5: 32 hex, SHA1: 40 hex, SHA256: 64 hex)
    const sha256Regex = /\b[a-fA-F0-9]{64}\b/g;
    while ((match = sha256Regex.exec(combinedContent)) !== null) {
        const hash = match[0].toLowerCase();
        const key = `HASH_SHA256:${hash}`;
        if (!seen.has(key)) {
            seen.add(key);
            iocs.push({
                type: 'HASH_SHA256',
                indicator: hash,
                riskLevel: 'MEDIUM',
                source: 'BODY',
                status: 'ACTIVE',
                context: 'SHA-256 cryptographic hash string identified in message',
            });
        }
    }
    const md5Regex = /\b[a-fA-F0-9]{32}\b/g;
    while ((match = md5Regex.exec(combinedContent)) !== null) {
        const hash = match[0].toLowerCase();
        const key = `HASH_MD5:${hash}`;
        if (!seen.has(key)) {
            seen.add(key);
            iocs.push({
                type: 'HASH_MD5',
                indicator: hash,
                riskLevel: 'LOW',
                source: 'BODY',
                status: 'ACTIVE',
                context: 'MD5 hash identified in content payload',
            });
        }
    }
    // 6. Attachment IOCs
    for (const att of attachments) {
        if (att.checksum) {
            const key = `HASH_SHA256:${att.checksum}`;
            if (!seen.has(key)) {
                seen.add(key);
                const isMaliciousExt = /\.(exe|scr|bat|cmd|vbs|js|ps1|hta|iso|img|dll|wsf|jar|xlsm|docm)$/i.test(att.filename);
                iocs.push({
                    type: 'HASH_SHA256',
                    indicator: att.checksum,
                    riskLevel: isMaliciousExt ? 'CRITICAL' : 'MEDIUM',
                    source: 'ATTACHMENT',
                    status: isMaliciousExt ? 'SUSPICIOUS' : 'ACTIVE',
                    context: `SHA-256 hash of attachment: ${att.filename}${isMaliciousExt ? ' (High-risk executable/macro container)' : ''}`,
                });
            }
        }
    }
    return iocs;
}
