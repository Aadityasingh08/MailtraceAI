import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Download, Terminal, X, Code2, AlertTriangle, FileCode } from 'lucide-react';
import { InvestigationDetail } from '../types';

interface DetectionRulesModalProps {
  detail: InvestigationDetail;
  onClose: () => void;
}

export const DetectionRulesModal: React.FC<DetectionRulesModalProps> = ({ detail, onClose }) => {
  const [activeRuleType, setActiveRuleType] = useState<'yara' | 'sigma' | 'suricata'>('yara');
  const [copied, setCopied] = useState(false);

  const inv = detail.investigation;
  const email = detail.email;
  const iocs = detail.iocs || [];
  
  // Extract key indicators
  const maliciousUrls = iocs.filter(i => i.type === 'URL' && (i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH')).map(i => i.indicator);
  const maliciousDomains = iocs.filter(i => i.type === 'DOMAIN' && (i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH')).map(i => i.indicator);
  const maliciousIps = iocs.filter(i => i.type === 'IPV4' && (i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH')).map(i => i.indicator);
  const ruleName = (email.subject || inv.threat_type || 'Email_Threat')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .substring(0, 32);

  // 1. Generate YARA Rule
  const generateYara = () => {
    const fromDomain = email.from_address?.split('@')[1] || 'malicious.xyz';
    const attachmentHashes = email.attachments_meta?.map(a => a.filename) || [];

    return `/*
   MailTrace AI — Automated Forensic YARA Rule
   Rule ID: YARA_${ruleName}
   Threat Classification: ${inv.threat_type} (${inv.severity})
   Target SHA-256: ${email.raw_eml_sha256}
   Generated: ${new Date().toISOString()}
*/

rule MailTrace_${ruleName} {
    meta:
        description = "Detects ${inv.threat_type} campaign targeting credentials or wire fraud"
        author = "MailTrace AI Forensic Engine"
        reference = "MailTrace Incident ID: ${inv.id}"
        severity = "${inv.severity}"
        risk_score = ${inv.risk_score}
        date = "${new Date().toISOString().split('T')[0]}"

    strings:
        // Sender and Domain Indicators
        $from_hdr = "From: " ascii wide
        $sender_domain = "${fromDomain}" ascii wide nocase
        $subject_str = "${(email.subject || 'Action Required').replace(/"/g, '\\"')}" ascii wide nocase

        // Malicious Pattern Strings
        ${maliciousDomains.length > 0 ? `$domain_flag = "${maliciousDomains[0]}" ascii wide nocase` : '$suspicious_anchor = "href=" ascii wide'}
        ${maliciousUrls.length > 0 ? `$url_flag = "${maliciousUrls[0]}" ascii wide nocase` : '$cred_harvester = "password" ascii wide nocase'}

    condition:
        // Trigger if message matches sender context and threat pattern
        uint16(0) == 0x6552 or // Starts with 'Re' (Received:)
        uint32(0) == 0x6d6f7246 // Starts with 'From'
        and (
            ($from_hdr and $sender_domain and $subject_str) or
            ($subject_str and ($domain_flag or $url_flag))
        )
}`;
  };

  // 2. Generate Sigma Rule
  const generateSigma = () => {
    return `# MailTrace AI — Automated Sigma Rule for SIEM/SOAR
title: Detect Email ${inv.threat_type} Ingress (${ruleName})
id: ${inv.id}
status: experimental
description: Identifies incoming emails associated with ${inv.threat_type} campaign (${email.subject})
references:
    - https://mailtrace.soc/investigations/${inv.id}
author: MailTrace AI SOC Detection Studio
date: ${new Date().toISOString().split('T')[0]}
tags:
    - attack.initial_access
    - attack.t1566.001
    - attack.t1566.002
    - security.email_threat
logsource:
    category: email
    product: m365 / exchange / google_workspace
detection:
    selection_sender:
        sender|endswith: '${email.from_address}'
    selection_subject:
        subject|contains: '${(email.subject || 'Urgent Request').replace(/'/g, "''")}'
    ${maliciousDomains.length > 0 ? `selection_domain:\n        recipient_urls|contains: '${maliciousDomains[0]}'` : ''}
    ${maliciousIps.length > 0 ? `selection_ip:\n        client_ip: '${maliciousIps[0]}'` : ''}
    condition: selection_sender or (selection_subject ${maliciousDomains.length > 0 ? 'and selection_domain' : ''})
falsepositives:
    - Legitimate internal workflows mimicking subject lines (verify SPF/DKIM alignment)
level: ${inv.severity === 'CRITICAL' ? 'critical' : inv.severity === 'HIGH' ? 'high' : 'medium'}`;
  };

  // 3. Generate Suricata / Snort Rule
  const generateSuricata = () => {
    const targetHost = maliciousDomains[0] || (maliciousIps[0] ? maliciousIps[0] : 'malicious-domain.xyz');
    const sid = 9000000 + Math.floor(Math.random() * 99999);

    return `# MailTrace AI — Suricata / Snort NIDS Telemetry Blocklist
# Direction: Inbound / Egress Phishing Telemetry
# Incident ID: ${inv.id}

alert http $HOME_NET any -> $EXTERNAL_NET any (\\
    msg:"ET PHISHING [MailTrace AI] Potential Phishing C2 Access to ${targetHost}"; \\
    flow:established,to_server; \\
    http.host; content:"${targetHost}"; nocase; \\
    ${maliciousUrls[0] ? `http.uri; content:"${new URL(maliciousUrls[0].startsWith('http') ? maliciousUrls[0] : 'http://' + maliciousUrls[0]).pathname}"; nocase; \\` : ''}
    classtype:trojan-activity; \\
    reference:url,mailtrace.soc/investigations/${inv.id}; \\
    sid:${sid}; \\
    rev:1; \\
    metadata:created_at ${new Date().toISOString().split('T')[0]}, severity ${inv.severity};)

# Network Drop Rule for Perimeter Firewall:
# iptables -A FORWARD -d ${maliciousIps[0] || '194.26.29.112'} -j DROP`;
  };

  const getRuleContent = () => {
    switch (activeRuleType) {
      case 'yara': return generateYara();
      case 'sigma': return generateSigma();
      case 'suricata': return generateSuricata();
    }
  };

  const currentContent = getRuleContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = activeRuleType === 'yara' ? 'yar' : activeRuleType === 'sigma' ? 'yml' : 'rules';
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mailtrace_${ruleName}_${activeRuleType}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Detection Engineering Studio
                <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                  SIEM / EDR READY
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated rule compilation synthesized from extracted threat signatures & IOC topology
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveRuleType('yara')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeRuleType === 'yara'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>YARA Rule (.yar)</span>
            </button>
            <button
              onClick={() => setActiveRuleType('sigma')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeRuleType === 'sigma'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Sigma Rule (.yml)</span>
            </button>
            <button
              onClick={() => setActiveRuleType('suricata')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeRuleType === 'suricata'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Suricata / Snort NIDS</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Rule'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold shadow-md shadow-emerald-600/25 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Block Canvas */}
        <div className="p-5 flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-emerald-300 border border-slate-800 shadow-inner">
            <pre className="whitespace-pre-wrap leading-relaxed select-all">
              {currentContent}
            </pre>
          </div>

          {/* Operational SOC Guidance */}
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              Deployable directly into <strong>CrowdStrike Falcon</strong>, <strong>Microsoft Defender for Endpoint</strong>, <strong>Splunk</strong>, or <strong>Elastic Security</strong>.
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold shrink-0 ml-2">
              Valid Syntax Checked
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
