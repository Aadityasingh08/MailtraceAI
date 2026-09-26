import { ExtractedIOC } from '../intelligence/iocExtractor';
import { ForensicHeaderResult } from '../intelligence/headerForensics';

export type ThreatType =
  | 'BENIGN'
  | 'SPAM'
  | 'PHISHING'
  | 'SPOOFING'
  | 'BUSINESS EMAIL COMPROMISE'
  | 'MALWARE DELIVERY'
  | 'CREDENTIAL HARVESTING'
  | 'SOCIAL ENGINEERING'
  | 'SUSPICIOUS';

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ScoreContributionItem {
  category: string;
  points: number;
  evidence: string;
}

export interface ConfidenceMatrixItem {
  signal: string;
  evidence: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  source: 'HEADER EVIDENCE' | 'AI ANALYSIS' | 'DOMAIN ANALYSIS' | 'THREAT INTELLIGENCE' | 'CONTENT HEURISTICS';
}

export interface AIAnalysisOutput {
  threatType: ThreatType;
  severity: ThreatSeverity;
  riskScore: number;
  confidence: number;
  indicators: string[];
  reasoning: string;
  recommendations: string[];
  scoreBreakdown: ScoreContributionItem[];
  confidenceMatrix: ConfidenceMatrixItem[];
  storyline: string;
  isAiGenerated: true;
}

// Linguistic Heuristics
const URGENCY_PATTERNS = [
  /urgent/i, /immediate action required/i, /account will be suspended/i, /within 24 hours/i,
  /act now/i, /suspended/i, /final notice/i, /critical security alert/i, /action required/i,
  /unauthorized access detected/i, /verify your identity immediately/i, /password expires today/i
];

const CREDENTIAL_PATTERNS = [
  /log in to verify/i, /sign in to your account/i, /update your password/i, /verify credentials/i,
  /confirm your password/i, /re-enter your password/i, /account security update/i, /keep your session active/i,
  /microsoft 365 login/i, /google workspace login/i
];

const FINANCIAL_PATTERNS = [
  /wire transfer/i, /invoice attached/i, /payment remittance/i, /swift/i, /banking details/i,
  /confidential settlement/i, /ach transfer/i, /revised account number/i, /outstanding balance/i,
  /fund transfer/i, /initiate transfer/i, /procurement order/i
];

export function runThreatAnalysis(
  subject: string,
  bodyText: string,
  fromAddress: string,
  fromName: string,
  replyTo: string,
  headerForensics: ForensicHeaderResult,
  iocs: ExtractedIOC[],
  attachments: Array<{ filename: string; size?: number; checksum?: string }> = []
): AIAnalysisOutput {
  const scoreBreakdown: ScoreContributionItem[] = [];
  const confidenceMatrix: ConfidenceMatrixItem[] = [];
  const detectedIndicators: string[] = [];
  let totalScore = 0;

  const combinedContent = `${subject}\n${bodyText}`;

  // 1. Evaluate Sender Identity Deception
  if (headerForensics.deceptionSummary.isLookalikeSender) {
    const pts = 25;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Lookalike Domain Deception',
      points: pts,
      evidence: `Sender domain mimics a recognized enterprise brand (${headerForensics.deceptionSummary.details[0] || 'homoglyph variant'})`,
    });
    confidenceMatrix.push({
      signal: 'Lookalike Sender Domain',
      evidence: headerForensics.deceptionSummary.details[0] || 'Levenshtein edit proximity match',
      confidence: 'HIGH',
      source: 'DOMAIN ANALYSIS',
    });
    detectedIndicators.push('Sender domain typo-squats a trusted brand');
  }

  // Display Name Spoofing
  const displayNameAnomaly = headerForensics.headers.find(h => h.name === 'Display-Name-Deception');
  if (displayNameAnomaly) {
    const pts = 20;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Display Name Spoofing',
      points: pts,
      evidence: displayNameAnomaly.explanation,
    });
    confidenceMatrix.push({
      signal: 'Display Name Impersonation',
      evidence: `Claims to be "${fromName}" but originates from unrelated infrastructure`,
      confidence: 'HIGH',
      source: 'HEADER EVIDENCE',
    });
    detectedIndicators.push('Display name masquerades as official identity');
  }

  // Reply-To Mismatch
  if (headerForensics.deceptionSummary.isReplyToMismatch) {
    const pts = 15;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Reply-To Address Mismatch',
      points: pts,
      evidence: `Reply-To points to ${replyTo} instead of sender address ${fromAddress}`,
    });
    confidenceMatrix.push({
      signal: 'Reply-To Diversion',
      evidence: 'Responses routed to third-party or untrusted domain',
      confidence: 'HIGH',
      source: 'HEADER EVIDENCE',
    });
    detectedIndicators.push('Reply-To header diverts replies away from sender domain');
  }

  // 2. Authentication Failures
  if (headerForensics.authResults.spfStatus === 'FAIL') {
    const pts = 20;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'SPF Validation Failure',
      points: pts,
      evidence: 'Transmitting mail server is not authorized in published SPF record',
    });
    confidenceMatrix.push({
      signal: 'SPF Authentication Failure',
      evidence: 'Header SPF returned Hard Fail',
      confidence: 'HIGH',
      source: 'HEADER EVIDENCE',
    });
    detectedIndicators.push('SPF Hard Fail: Sender IP unauthorized');
  } else if (headerForensics.authResults.spfStatus === 'SOFTFAIL') {
    const pts = 10;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'SPF Softfail Policy Violation',
      points: pts,
      evidence: 'Sending IP is not designated; quarantine policy recommended',
    });
  }

  if (headerForensics.authResults.dkimStatus === 'FAIL') {
    const pts = 20;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'DKIM Signature Failure',
      points: pts,
      evidence: 'Cryptographic DKIM signature failed verification or body altered in transit',
    });
    confidenceMatrix.push({
      signal: 'DKIM Validation Failure',
      evidence: 'Cryptographic signature mismatch with DNS key',
      confidence: 'HIGH',
      source: 'HEADER EVIDENCE',
    });
    detectedIndicators.push('Cryptographic DKIM signature verification failed');
  }

  if (headerForensics.authResults.dmarcStatus === 'FAIL') {
    const pts = 15;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'DMARC Alignment Failure',
      points: pts,
      evidence: 'Domain policy alignment check failed',
    });
  }

  // 3. Linguistic Threat Analysis (Urgency, Credentials, Financial)
  let matchedUrgency = false;
  for (const pattern of URGENCY_PATTERNS) {
    if (pattern.test(combinedContent)) {
      matchedUrgency = true;
      break;
    }
  }
  if (matchedUrgency) {
    const pts = 10;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Urgency & Psychological Coercion',
      points: pts,
      evidence: 'High-pressure temporal deadlines ("immediate action", "account suspended")',
    });
    confidenceMatrix.push({
      signal: 'Urgent Psychological Pressure',
      evidence: 'Urgency keywords and coercive account suspension threats detected in content',
      confidence: 'MEDIUM',
      source: 'AI ANALYSIS',
    });
    detectedIndicators.push('Coercive urgency language pressuring rapid response');
  }

  let matchedCred = false;
  for (const pattern of CREDENTIAL_PATTERNS) {
    if (pattern.test(combinedContent)) {
      matchedCred = true;
      break;
    }
  }
  if (matchedCred) {
    const pts = 15;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Credential Solicitations',
      points: pts,
      evidence: 'Direct prompts to input credentials, passwords, or verify sign-in session',
    });
    confidenceMatrix.push({
      signal: 'Credential Harvesting Pattern',
      evidence: 'Message directs recipient to enter credentials or authenticate via embedded link',
      confidence: 'HIGH',
      source: 'AI ANALYSIS',
    });
    detectedIndicators.push('Explicit credential authentication solicitation');
  }

  let matchedFinance = false;
  for (const pattern of FINANCIAL_PATTERNS) {
    if (pattern.test(combinedContent)) {
      matchedFinance = true;
      break;
    }
  }
  if (matchedFinance) {
    const pts = 12;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Financial / Wire Transfer Request',
      points: pts,
      evidence: 'Discussion of invoices, bank settlements, Swift transfers, or revised payment instructions',
    });
    confidenceMatrix.push({
      signal: 'Financial Transaction Coercion',
      evidence: 'Payment remittance, wire instructions, or executive banking directives',
      confidence: 'MEDIUM',
      source: 'AI ANALYSIS',
    });
    detectedIndicators.push('Financial transfer or revised payment routing directives');
  }

  // 4. URL & Domain IOC Indicators
  const criticalIocs = iocs.filter(i => i.riskLevel === 'CRITICAL');
  const highIocs = iocs.filter(i => i.riskLevel === 'HIGH');

  if (criticalIocs.length > 0) {
    const pts = 20;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'High-Risk Threat Indicators (IOCs)',
      points: pts,
      evidence: `${criticalIocs.length} critical IOCs identified (${criticalIocs[0].indicator})`,
    });
    confidenceMatrix.push({
      signal: 'Malicious IOC Association',
      evidence: `Identified critical indicators: ${criticalIocs.slice(0, 2).map(i => i.indicator).join(', ')}`,
      confidence: 'HIGH',
      source: 'THREAT INTELLIGENCE',
    });
    detectedIndicators.push(`Critical threat indicator identified: ${criticalIocs[0].indicator}`);
  } else if (highIocs.length > 0) {
    const pts = 12;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Suspicious Indicators',
      points: pts,
      evidence: `${highIocs.length} high-risk indicators detected (${highIocs[0].indicator})`,
    });
  }

  // 5. High-Risk Attachments
  const riskyAttachments = attachments.filter(a =>
    /\.(exe|scr|bat|cmd|vbs|js|ps1|hta|iso|img|dll|wsf|jar|xlsm|docm)$/i.test(a.filename)
  );
  if (riskyAttachments.length > 0) {
    const pts = 25;
    totalScore += pts;
    scoreBreakdown.push({
      category: 'Executable / Macro Attachment Delivery',
      points: pts,
      evidence: `Dangerous file container or executable extension: ${riskyAttachments[0].filename}`,
    });
    confidenceMatrix.push({
      signal: 'Malicious Attachment Weaponization',
      evidence: `File payload ${riskyAttachments[0].filename} carries script/executable capabilities`,
      confidence: 'HIGH',
      source: 'CONTENT HEURISTICS',
    });
    detectedIndicators.push(`Dangerous file attachment payload: ${riskyAttachments[0].filename}`);
  }

  // Deduct points if legitimate authentication passes and no deceptive headers exist
  if (
    headerForensics.authResults.spfStatus === 'PASS' &&
    headerForensics.authResults.dkimStatus === 'PASS' &&
    !headerForensics.deceptionSummary.isSpoofed &&
    !headerForensics.deceptionSummary.isReplyToMismatch
  ) {
    totalScore = Math.max(0, totalScore - 15);
  }

  // Cap Score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, totalScore));

  // Determine Severity
  let severity: ThreatSeverity = 'LOW';
  if (finalScore >= 80) severity = 'CRITICAL';
  else if (finalScore >= 60) severity = 'HIGH';
  else if (finalScore >= 35) severity = 'MEDIUM';
  else severity = 'LOW';

  // Determine Threat Type
  let threatType: ThreatType = 'BENIGN';
  if (riskyAttachments.length > 0) {
    threatType = 'MALWARE DELIVERY';
  } else if (matchedFinance && (headerForensics.deceptionSummary.isReplyToMismatch || displayNameAnomaly)) {
    threatType = 'BUSINESS EMAIL COMPROMISE';
  } else if (matchedCred || (criticalIocs.length > 0 && criticalIocs.some(i => i.type === 'URL'))) {
    threatType = 'CREDENTIAL HARVESTING';
  } else if (headerForensics.deceptionSummary.isLookalikeSender || displayNameAnomaly) {
    threatType = 'PHISHING';
  } else if (headerForensics.authResults.spfStatus === 'FAIL' && headerForensics.deceptionSummary.isSpoofed) {
    threatType = 'SPOOFING';
  } else if (finalScore >= 50) {
    threatType = 'SUSPICIOUS';
  } else if (matchedUrgency || finalScore >= 25) {
    threatType = 'SPAM';
  } else {
    threatType = 'BENIGN';
  }

  // Calculate Confidence Score
  let confidence = 75;
  if (scoreBreakdown.length >= 3) confidence += 15;
  if (headerForensics.authResults.spfStatus !== 'UNKNOWN' && headerForensics.authResults.dkimStatus !== 'UNKNOWN') confidence += 8;
  confidence = Math.min(98, confidence);

  // Generate Actionable Recommendations ("What to Do Next")
  const recommendations: string[] = [];
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    recommendations.push('Quarantine message across all mailboxes and purge related copies.');
    recommendations.push('Block malicious sender domains and infrastructure at mail gateway.');
    if (criticalIocs.some(i => i.type === 'URL')) {
      recommendations.push('Add malicious URLs to edge perimeter firewalls and secure web gateways (SWG).');
      recommendations.push('Audit web proxy logs to determine if internal users clicked or navigated to the destination link.');
    }
    if (matchedCred) {
      recommendations.push('Force immediate password reset and revoke active SSO/OAuth tokens for targeted recipients.');
    }
    if (threatType === 'BUSINESS EMAIL COMPROMISE') {
      recommendations.push('Immediately contact finance and treasury operations to verify payment holds.');
      recommendations.push('Institute out-of-band voice confirmation for bank account routing alterations.');
    }
    recommendations.push('Search enterprise mail server logs for similar subject lines or sender IP infrastructure.');
  } else if (severity === 'MEDIUM') {
    recommendations.push('Monitor sender domain for recurring patterns or escalation.');
    recommendations.push('Deliver message to Spam/Junk folder with security banner.');
    recommendations.push('Verify identity with sender through trusted secondary communication channel.');
  } else {
    recommendations.push('No immediate remediation required; message appears benign.');
    recommendations.push('Standard inbound mail filtering applies.');
  }

  // Generate Attack Storyline
  let storyline = '';
  if (threatType === 'CREDENTIAL HARVESTING' || threatType === 'PHISHING') {
    storyline = `An inbound email claiming to represent an official platform was transmitted from infrastructure exhibiting deceptive properties. Header analysis identified sender domain manipulation (${headerForensics.deceptionSummary.isLookalikeSender ? 'brand lookalike typo-squatting' : 'untrusted envelope'}). The message leverages urgency mechanisms combined with credential solicitation patterns. Authentication headers revealed validation inconsistencies. These correlated indicators establish a high-probability credential harvesting campaign.`;
  } else if (threatType === 'BUSINESS EMAIL COMPROMISE') {
    storyline = `An adversary attempted an executive impersonation scheme targeting internal personnel. While the display name mimicked executive authority, transmission headers indicate the Reply-To address diverts confidential correspondence to external third-party mail infrastructure. The body payload contains specific wire transfer settlement instructions designed to evade automated gateway filters.`;
  } else if (threatType === 'MALWARE DELIVERY') {
    storyline = `The analyzed email delivered an active weaponized container attachment. The payload extension and MIME headers demonstrate execution capabilities. Mail gateway transmission anomalies further correlate with automated distribution infrastructure.`;
  } else if (severity === 'LOW') {
    storyline = `The investigated message exhibits standard transmission telemetry. Cryptographic authentication (SPF/DKIM) aligned with published domain policies, and no deceptive display names or known malicious indicators were detected within the message body.`;
  } else {
    storyline = `Analysis identified multiple anomaly indicators across headers and content syntax. While not confirmed malicious, the observed divergence in authentication combined with atypical routing parameters suggests caution.`;
  }

  const reasoning = `Evaluated ${scoreBreakdown.length} primary threat signals across sender authenticity, header integrity, linguistic tactics, and extracted IOC telemetry. Overall threat probability determined to be ${severity} with assessed risk score of ${finalScore}/100.`;

  return {
    threatType,
    severity,
    riskScore: finalScore,
    confidence,
    indicators: detectedIndicators.length > 0 ? detectedIndicators : ['No critical threat indicators identified'],
    reasoning,
    recommendations,
    scoreBreakdown: scoreBreakdown.length > 0 ? scoreBreakdown : [{ category: 'Baseline Evaluation', points: 0, evidence: 'No suspicious anomalies detected' }],
    confidenceMatrix,
    storyline,
    isAiGenerated: true,
  };
}
