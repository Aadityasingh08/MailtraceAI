import { detectLookalikeDomain } from './lookalikeDetector';

export interface HeaderAnalysisItem {
  name: string;
  value: string;
  status: 'NORMAL' | 'SUSPICIOUS' | 'MALICIOUS';
  explanation: string;
  riskContribution: number;
}

export interface AuthAnalysisResult {
  spfStatus: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'UNKNOWN';
  spfDetails: string;
  dkimStatus: 'PASS' | 'FAIL' | 'UNKNOWN';
  dkimDetails: string;
  dmarcStatus: 'PASS' | 'FAIL' | 'UNKNOWN';
  dmarcDetails: string;
  arcStatus: 'PASS' | 'FAIL' | 'UNKNOWN';
  overallScore: number;
  explanation: string;
}

export interface ForensicHeaderResult {
  headers: HeaderAnalysisItem[];
  authResults: AuthAnalysisResult;
  deceptionSummary: {
    isSpoofed: boolean;
    isReplyToMismatch: boolean;
    isReturnPathMismatch: boolean;
    isLookalikeSender: boolean;
    details: string[];
  };
}

export function analyzeHeaders(
  headerMap: Record<string, string | string[] | undefined>,
  fromAddress: string,
  fromName: string,
  replyTo: string,
  returnPath: string
): ForensicHeaderResult {
  const analyzed: HeaderAnalysisItem[] = [];
  const deceptionDetails: string[] = [];

  const getHeader = (key: string): string => {
    const val = headerMap[key.toLowerCase()] || headerMap[key];
    if (Array.isArray(val)) return val.join('\n');
    return val ? String(val) : '';
  };

  const fromDomain = fromAddress.includes('@') ? fromAddress.split('@')[1].toLowerCase() : '';
  const replyToDomain = replyTo && replyTo.includes('@') ? replyTo.split('@')[1].toLowerCase() : '';
  const returnPathDomain = returnPath && returnPath.includes('@') ? returnPath.split('@')[1].toLowerCase() : '';

  // 1. From Header
  const fromHeader = getHeader('from') || fromAddress;
  const fromLookalike = detectLookalikeDomain(fromDomain);
  let fromStatus: 'NORMAL' | 'SUSPICIOUS' | 'MALICIOUS' = 'NORMAL';
  let fromExp = 'Sender header well-formed.';
  let fromRisk = 0;

  if (fromLookalike.isLookalike) {
    fromStatus = 'MALICIOUS';
    fromExp = `Sender domain "${fromDomain}" is a deceptive lookalike imitating brand "${fromLookalike.targetBrand}" (similarity: ${fromLookalike.similarity}%).`;
    fromRisk = 25;
    deceptionDetails.push(`Lookalike sender domain imitating ${fromLookalike.targetBrand}`);
  } else if (!fromDomain) {
    fromStatus = 'SUSPICIOUS';
    fromExp = 'From address does not contain a valid domain.';
    fromRisk = 10;
  }
  analyzed.push({
    name: 'From',
    value: fromHeader,
    status: fromStatus,
    explanation: fromExp,
    riskContribution: fromRisk,
  });

  // 2. Display Name Spoofing Check
  if (fromName) {
    const lowerName = fromName.toLowerCase();
    const targetedKeywords = ['microsoft', 'google', 'apple', 'paypal', 'support', 'it desk', 'helpdesk', 'security team', 'billing'];
    for (const kw of targetedKeywords) {
      if (lowerName.includes(kw) && !fromDomain.includes(kw.replace(/\s+/g, ''))) {
        deceptionDetails.push(`Display name "${fromName}" claims identity of "${kw}" but sender domain is "${fromDomain}"`);
        analyzed.push({
          name: 'Display-Name-Deception',
          value: fromName,
          status: 'MALICIOUS',
          explanation: `Display name mimics official entity "${kw}" while actual domain is "${fromDomain}".`,
          riskContribution: 20,
        });
        break;
      }
    }
  }

  // 3. Reply-To Mismatch
  let isReplyToMismatch = false;
  if (replyTo && replyTo !== fromAddress) {
    if (replyToDomain !== fromDomain) {
      isReplyToMismatch = true;
      deceptionDetails.push(`Reply-To domain (${replyToDomain}) differs from From domain (${fromDomain})`);
      analyzed.push({
        name: 'Reply-To',
        value: replyTo,
        status: 'SUSPICIOUS',
        explanation: `Reply-To destination redirects responses to external domain "${replyToDomain}" instead of "${fromDomain}".`,
        riskContribution: 15,
      });
    } else {
      analyzed.push({
        name: 'Reply-To',
        value: replyTo,
        status: 'NORMAL',
        explanation: 'Reply-To points to the same authoritative domain as the sender.',
        riskContribution: 0,
      });
    }
  }

  // 4. Return-Path Mismatch
  let isReturnPathMismatch = false;
  if (returnPath && returnPathDomain && fromDomain) {
    if (returnPathDomain !== fromDomain && !fromDomain.endsWith(returnPathDomain) && !returnPathDomain.endsWith(fromDomain)) {
      isReturnPathMismatch = true;
      deceptionDetails.push(`Return-Path (${returnPathDomain}) differs from sender domain (${fromDomain})`);
      analyzed.push({
        name: 'Return-Path',
        value: returnPath,
        status: 'SUSPICIOUS',
        explanation: `Bounce return path (${returnPathDomain}) does not align with sender domain (${fromDomain}).`,
        riskContribution: 10,
      });
    } else {
      analyzed.push({
        name: 'Return-Path',
        value: returnPath,
        status: 'NORMAL',
        explanation: 'Return-Path envelope domain aligns with From header.',
        riskContribution: 0,
      });
    }
  }

  // 5. Authentication-Results & Received-SPF & DKIM
  const authResultsHeader = getHeader('authentication-results');
  const receivedSpfHeader = getHeader('received-spf');
  const dkimSignatureHeader = getHeader('dkim-signature');
  const arcHeader = getHeader('arc-authentication-results');

  let spfStatus: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'UNKNOWN' = 'UNKNOWN';
  let spfDetails = 'No SPF authentication header found.';
  let dkimStatus: 'PASS' | 'FAIL' | 'UNKNOWN' = 'UNKNOWN';
  let dkimDetails = 'No DKIM signature found in headers.';
  let dmarcStatus: 'PASS' | 'FAIL' | 'UNKNOWN' = 'UNKNOWN';
  let dmarcDetails = 'No DMARC evaluation found in headers.';
  let arcStatus: 'PASS' | 'FAIL' | 'UNKNOWN' = 'UNKNOWN';

  // Parse SPF
  const spfCombined = `${receivedSpfHeader} ${authResultsHeader}`.toLowerCase();
  if (spfCombined.includes('spf=pass') || receivedSpfHeader.toLowerCase().startsWith('pass')) {
    spfStatus = 'PASS';
    spfDetails = 'Sender IP address is explicitly authorized by the domain SPF DNS record.';
  } else if (spfCombined.includes('spf=fail') || receivedSpfHeader.toLowerCase().startsWith('fail')) {
    spfStatus = 'FAIL';
    spfDetails = 'Sender IP address is NOT authorized by domain SPF record (Hard fail).';
  } else if (spfCombined.includes('spf=softfail') || receivedSpfHeader.toLowerCase().startsWith('softfail')) {
    spfStatus = 'SOFTFAIL';
    spfDetails = 'Sender IP address is not authorized, domain SPF policy recommends quarantine.';
  } else if (spfCombined.includes('spf=neutral') || receivedSpfHeader.toLowerCase().startsWith('neutral')) {
    spfStatus = 'NEUTRAL';
    spfDetails = 'SPF record explicitly states neutral validity regarding the sender IP.';
  }

  // Parse DKIM
  const dkimCombined = `${authResultsHeader} ${dkimSignatureHeader}`.toLowerCase();
  if (dkimCombined.includes('dkim=pass')) {
    dkimStatus = 'PASS';
    dkimDetails = 'Cryptographic DKIM signature verified successfully against published DNS public key.';
  } else if (dkimCombined.includes('dkim=fail')) {
    dkimStatus = 'FAIL';
    dkimDetails = 'DKIM signature verification failed or message body was tampered in transit.';
  } else if (dkimSignatureHeader) {
    dkimStatus = 'PASS';
    dkimDetails = 'Valid DKIM-Signature header present on message.';
  }

  // Parse DMARC
  const dmarcCombined = authResultsHeader.toLowerCase();
  if (dmarcCombined.includes('dmarc=pass')) {
    dmarcStatus = 'PASS';
    dmarcDetails = 'DMARC alignment passed with SPF/DKIM validation.';
  } else if (dmarcCombined.includes('dmarc=fail')) {
    dmarcStatus = 'FAIL';
    dmarcDetails = 'DMARC alignment failed; sender failed domain policy alignment.';
  }

  // Parse ARC
  if (arcHeader) {
    arcStatus = arcHeader.toLowerCase().includes('pass') ? 'PASS' : 'UNKNOWN';
  }

  // Authentication Score (0 to 100)
  let authScore = 50; // Neutral baseline
  if (spfStatus === 'PASS') authScore += 25;
  if (spfStatus === 'FAIL') authScore -= 30;
  if (spfStatus === 'SOFTFAIL') authScore -= 15;
  if (dkimStatus === 'PASS') authScore += 25;
  if (dkimStatus === 'FAIL') authScore -= 25;
  if (dmarcStatus === 'PASS') authScore += 20;
  if (dmarcStatus === 'FAIL') authScore -= 25;
  authScore = Math.max(0, Math.min(100, authScore));

  const authExplanation =
    spfStatus === 'FAIL' || dkimStatus === 'FAIL' || dmarcStatus === 'FAIL'
      ? 'Email failed core email authentication standards. Note: Misconfiguration can cause legitimate emails to fail, but failure combined with suspicious content strongly elevates threat probability.'
      : spfStatus === 'PASS' && dkimStatus === 'PASS'
      ? 'Email successfully passed SPF and DKIM authentication. Note: Legitimate authentication proves transmission authorization, but does not guarantee message contents are benign if account was compromised.'
      : 'Email lacks complete cryptographic authentication indicators (SPF/DKIM/DMARC missing or unrecorded by relay).';

  // Add Auth Headers to analysis
  analyzed.push({
    name: 'Received-SPF',
    value: receivedSpfHeader || 'None',
    status: spfStatus === 'PASS' ? 'NORMAL' : spfStatus === 'FAIL' ? 'MALICIOUS' : 'SUSPICIOUS',
    explanation: spfDetails,
    riskContribution: spfStatus === 'FAIL' ? 20 : spfStatus === 'SOFTFAIL' ? 10 : 0,
  });

  analyzed.push({
    name: 'DKIM-Signature',
    value: dkimSignatureHeader ? (dkimSignatureHeader.length > 60 ? dkimSignatureHeader.substring(0, 60) + '...' : dkimSignatureHeader) : 'None',
    status: dkimStatus === 'PASS' ? 'NORMAL' : dkimStatus === 'FAIL' ? 'MALICIOUS' : 'SUSPICIOUS',
    explanation: dkimDetails,
    riskContribution: dkimStatus === 'FAIL' ? 20 : 0,
  });

  if (authResultsHeader) {
    analyzed.push({
      name: 'Authentication-Results',
      value: authResultsHeader.length > 80 ? authResultsHeader.substring(0, 80) + '...' : authResultsHeader,
      status: dmarcStatus === 'FAIL' ? 'MALICIOUS' : dmarcStatus === 'PASS' ? 'NORMAL' : 'SUSPICIOUS',
      explanation: dmarcDetails,
      riskContribution: dmarcStatus === 'FAIL' ? 20 : 0,
    });
  }

  // 6. X-Originating-IP / X-Sender-IP
  const origIp = getHeader('x-originating-ip') || getHeader('x-sender-ip');
  if (origIp) {
    analyzed.push({
      name: 'X-Originating-IP',
      value: origIp,
      status: 'NORMAL',
      explanation: `Client IP recorded at mail submission: ${origIp}`,
      riskContribution: 0,
    });
  }

  // 7. User-Agent / X-Mailer
  const userAgent = getHeader('user-agent') || getHeader('x-mailer');
  if (userAgent) {
    const isSuspiciousAgent = /(php|perl|python|curl|wget|massmail|blast)/i.test(userAgent);
    analyzed.push({
      name: 'X-Mailer / User-Agent',
      value: userAgent,
      status: isSuspiciousAgent ? 'SUSPICIOUS' : 'NORMAL',
      explanation: isSuspiciousAgent
        ? `Scripted or mass-mailing agent detected (${userAgent}).`
        : `Email client agent identified: ${userAgent}`,
      riskContribution: isSuspiciousAgent ? 15 : 0,
    });
  }

  // 8. Message-ID Anomaly
  const messageId = getHeader('message-id');
  if (messageId) {
    const isGenericId = !messageId.includes('@') || messageId.length < 8;
    analyzed.push({
      name: 'Message-ID',
      value: messageId,
      status: isGenericId ? 'SUSPICIOUS' : 'NORMAL',
      explanation: isGenericId
        ? 'Message-ID format is non-standard or missing domainFQDN.'
        : 'Message-ID complies with standard RFC formatting.',
      riskContribution: isGenericId ? 8 : 0,
    });
  }

  return {
    headers: analyzed,
    authResults: {
      spfStatus,
      spfDetails,
      dkimStatus,
      dkimDetails,
      dmarcStatus,
      dmarcDetails,
      arcStatus,
      overallScore: authScore,
      explanation: authExplanation,
    },
    deceptionSummary: {
      isSpoofed: fromLookalike.isLookalike || deceptionDetails.length > 0,
      isReplyToMismatch,
      isReturnPathMismatch,
      isLookalikeSender: fromLookalike.isLookalike,
      details: deceptionDetails,
    },
  };
}
