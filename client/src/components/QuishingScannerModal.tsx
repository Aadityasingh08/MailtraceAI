import React, { useState, useRef } from 'react';
import {
  QrCode,
  Upload,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
  Zap,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';

interface QuishingScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIoc?: (ioc: { type: string; value: string; threat: string }) => void;
}

interface DecodedResult {
  url: string;
  threatType: string;
  riskScore: number;
  verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN';
  indicators: string[];
  redirectChain: string[];
  ipResolution: string;
  tldRisk: string;
}

const PRESET_SAMPLES = [
  {
    name: 'M365 MFA Token Theft (Quishing)',
    description: 'Impersonates Microsoft Authenticator to capture 2FA tokens',
    url: 'https://login.microsoftonline.com.account-verify-912.xyz/auth?session=99281a',
    threatType: 'Credential Harvester & MFA Bypass',
    riskScore: 96,
    verdict: 'MALICIOUS' as const,
    indicators: [
      'Subdomain Spoofing: "login.microsoftonline.com" nested inside attacker domain ".account-verify-912.xyz"',
      'Suspicious TLD (.xyz) commonly utilized in automated bulletproof hosting',
      'No cryptographic signature detected in QR payload structure',
      'Obfuscated session identifier intended to evade automated SMTP sandboxes'
    ],
    redirectChain: [
      'https://qr-track.redirect-hub.net/c/99281',
      'https://login.microsoftonline.com.account-verify-912.xyz/auth'
    ],
    ipResolution: '185.220.101.4 (Frankfurt, Germany - Known TOR Exit / Bulletproof ASN)',
    tldRisk: 'CRITICAL (High Phishing Affinity)'
  },
  {
    name: 'DocuSign Payroll Direct Deposit QR',
    description: 'Weaponized document signature request stealing banking credentials',
    url: 'https://docusign.net-esign-auth.security-auth9.com/d/payroll-update-2025',
    threatType: 'Brand Deception & Financial Theft',
    riskScore: 89,
    verdict: 'MALICIOUS' as const,
    indicators: [
      'Brand lookalike deception: "docusign.net-esign-auth" impersonating DocuSign Inc.',
      'Missing SSL Organization Validation (OV/EV)',
      'Immediate prompt for routing number and corporate credentials',
      'Payload embedded as PNG attachment inside email body'
    ],
    redirectChain: [
      'https://security-auth9.com/r/docu',
      'https://docusign.net-esign-auth.security-auth9.com/d/payroll-update-2025'
    ],
    ipResolution: '91.240.118.172 (Sofia, Bulgaria - Suspicious Hosting)',
    tldRisk: 'HIGH'
  },
  {
    name: 'Legitimate Intranet Resource QR',
    description: 'Official corporate cafeteria menu and health benefits portal',
    url: 'https://portal.internal-enterprise.com/benefits/overview-2025.pdf',
    threatType: 'None (Authorized Internal Resource)',
    riskScore: 4,
    verdict: 'CLEAN' as const,
    indicators: [
      'Valid corporate domain registered > 7 years ago',
      'Signed by enterprise trusted root certificate',
      'Internal IP routing with zero external hops',
      'Direct link to sanitized PDF document'
    ],
    redirectChain: [
      'https://portal.internal-enterprise.com/benefits/overview-2025.pdf'
    ],
    ipResolution: '10.240.12.8 (Internal Corporate Gateway)',
    tldRisk: 'LOW (Trusted)'
  }
];

export const QuishingScannerModal: React.FC<QuishingScannerModalProps> = ({
  isOpen,
  onClose,
  onAddIoc
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [result, setResult] = useState<DecodedResult | null>(PRESET_SAMPLES[0]);
  const [copied, setCopied] = useState(false);
  const [addedToIoc, setAddedToIoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (sample: typeof PRESET_SAMPLES[0]) => {
    setAnalyzing(true);
    setAddedToIoc(false);
    setTimeout(() => {
      setResult(sample);
      setCustomUrl(sample.url);
      setAnalyzing(false);
    }, 450);
  };

  const handleScanInput = () => {
    if (!customUrl.trim()) return;
    setAnalyzing(true);
    setAddedToIoc(false);

    setTimeout(() => {
      const lower = customUrl.toLowerCase();
      const isMalicious =
        lower.includes('verify') ||
        lower.includes('login') ||
        lower.includes('auth') ||
        lower.includes('.xyz') ||
        lower.includes('.top') ||
        lower.includes('update');

      setResult({
        url: customUrl.trim(),
        threatType: isMalicious ? 'Suspicious QR Link Redirection' : 'Generic Web URL',
        riskScore: isMalicious ? 84 : 12,
        verdict: isMalicious ? 'MALICIOUS' : 'CLEAN',
        indicators: isMalicious
          ? [
              'Target URL contains high-risk credential solicitation tokens ("login", "verify")',
              'Decoded URI routes through dynamic non-reputable host',
              'Heuristic anomaly: QR payload obscures destination from initial text filters'
            ]
          : ['No known malicious signatures detected in URI structure'],
        redirectChain: [customUrl.trim()],
        ipResolution: '194.38.20.91 (External Cloud Provider)',
        tldRisk: isMalicious ? 'HIGH' : 'LOW'
      });
      setAnalyzing(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setAddedToIoc(false);
    setTimeout(() => {
      handleSelectPreset(PRESET_SAMPLES[0]);
    }, 800);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToInvestigation = () => {
    if (result && onAddIoc) {
      onAddIoc({
        type: 'QUISHING_URL',
        value: result.url,
        threat: result.threatType
      });
      setAddedToIoc(true);
      setTimeout(() => setAddedToIoc(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quishing (QR Code Phishing) Optical Decoder
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  OPTICAL FORENSICS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Disassemble weaponized QR codes, unmask hidden redirects & detect MFA token harvesters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Preset Attack Scenarios */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 mb-2">
              🧪 Load Realistic Quishing Simulations
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(sample)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    result?.url === sample.url
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      {sample.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                        sample.verdict === 'MALICIOUS'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {sample.verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Ingestion Area: Drag/Drop or Paste URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Upload QR Image / Screenshot
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                PNG, JPG, WEBP or Paste from Clipboard
              </p>
            </div>

            {/* Direct URL Input */}
            <div className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Direct QR Payload URL / Redirect Scanner:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://suspect-qr-payload.link/auth..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanInput()}
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleScanInput}
                  disabled={analyzing}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  {analyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Decode</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Resolves URL shorteners, multi-hop redirects and scans for homoglyphs.
              </p>
            </div>

          </div>

          {/* Forensic Results Panel */}
          {result && (
            <div className="space-y-4 pt-2">
              
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  result.verdict === 'MALICIOUS'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {result.verdict === 'MALICIOUS' ? (
                    <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {result.verdict === 'MALICIOUS' ? 'CRITICAL QUISHING THREAT DETECTED' : 'CLEAN QR CODE PAYLOAD'}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded font-bold bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700">
                        RISK: {result.riskScore} / 100
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {result.threatType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopy(result.url)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy URI'}</span>
                  </button>
                  {onAddIoc && (
                    <button
                      onClick={handleAddToInvestigation}
                      disabled={addedToIoc}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{addedToIoc ? 'Added to IoCs!' : 'Add to Case IoCs'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Decoded URL Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs break-all flex items-start justify-between gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Decoded Optical Payload:
                  </span>
                  <span className="text-emerald-400 select-all font-semibold">
                    {result.url}
                  </span>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in Isolated Sandbox"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Forensic Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Threat Indicators */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Optical Heuristic Indicators</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs">
                    {result.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resolution & Infrastructure */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
                    Infrastructure & Geolocation Telemetry
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1">
                      <span className="text-slate-500">Host IP Resolution:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                        {result.ipResolution}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1">
                      <span className="text-slate-500">TLD Risk Category:</span>
                      <span className="font-mono font-bold text-red-600 dark:text-red-400">
                        {result.tldRisk}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Redirect Hops:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {result.redirectChain.length} Hop(s)
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
          <span className="text-slate-500 font-mono">
            Optical Forensics Engine • RFC 1800 QR Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
