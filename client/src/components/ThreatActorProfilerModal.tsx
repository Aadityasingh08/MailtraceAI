import React, { useState } from 'react';
import {
  Skull,
  ShieldAlert,
  Globe,
  Crosshair,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Building,
  Terminal,
  Activity,
  Award
} from 'lucide-react';

interface ThreatActorProfilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigationDetail?: any;
}

interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: string;
  sophistication: string;
  confidenceScore: number;
  targetedSectors: string[];
  signatureLures: string[];
  mitreTechniques: { id: string; name: string }[];
  knownMalware: string[];
  tacticsSummary: string;
  activeCampaigns: string;
}

const THREAT_ACTORS: ThreatActor[] = [
  {
    id: 'fin7',
    name: 'FIN7 (Sangria Tempest / Carbanak)',
    aliases: ['Carbanak', 'Navigator Group', 'ELBRUS', 'ITG14'],
    origin: 'Eastern Europe / Russia',
    motivation: 'Financial Theft & Wire Fraud (>$1 Billion Stolen)',
    sophistication: 'High (Custom droppers & Corporate Deception)',
    confidenceScore: 94,
    targetedSectors: ['Financial Services', 'Retail & Hospitality', 'Executive Payroll', 'Logistics'],
    signatureLures: [
      'Fake SEC compliance filings',
      'Urgent wire transfer invoice demands (CEO BEC)',
      'Vendor payment routing updates with weaponized VBS/macro attachments'
    ],
    mitreTechniques: [
      { id: 'T1566.001', name: 'Spearphishing Attachment' },
      { id: 'T1566.002', name: 'Spearphishing Link' },
      { id: 'T1204.002', name: 'User Execution: Malicious File' },
      { id: 'T1059.005', name: 'Visual Basic Command Interpreter' }
    ],
    knownMalware: ['Carbanak Backdoor', 'GRIFFON', 'Lizar / Tirion', 'Bateleur VBScript'],
    tacticsSummary:
      'Impersonates corporate executives, board members, and external legal counsel using sophisticated domain lookalikes and urgency manipulation to trigger fraudulent payments.',
    activeCampaigns: 'Operation DeepWire: Targeting corporate treasury departments with high-priority wire instructions.'
  },
  {
    id: 'apt29',
    name: 'APT29 (Cozy Bear / Midnight Blizzard)',
    aliases: ['NOBELIUM', 'The Dukes', 'CozyCar', 'YTTRIUM'],
    origin: 'Russian Federation (SVR)',
    motivation: 'State Espionage & Intelligence Interception',
    sophistication: 'Nation-State / Elite',
    confidenceScore: 88,
    targetedSectors: ['Government & Diplomatic', 'Defense Ministries', 'Cloud / IT Providers', 'NGOs'],
    signatureLures: [
      'Microsoft 365 OAuth application grant requests',
      'Diplomatic conference invites and diplomatic courier notifications',
      'Forged cloud verification tokens and MFA re-authentication links'
    ],
    mitreTechniques: [
      { id: 'T1566.002', name: 'Spearphishing Link' },
      { id: 'T1528', name: 'Steal Application Access Token' },
      { id: 'T1078.004', name: 'Cloud Accounts Impersonation' },
      { id: 'T1114.002', name: 'Remote Email Collection' }
    ],
    knownMalware: ['Duke Toolkit', 'EnvyScout', 'GoldFinder', 'WellMess'],
    tacticsSummary:
      'Harvests credentials through hyper-realistic Microsoft 365 and Google Workspace lookalike portals, pivoting to cloud token forgery.',
    activeCampaigns: 'Midnight Embassy: Intercepting diplomatic communications across EU/NATO foreign ministries.'
  },
  {
    id: 'lazarus',
    name: 'Lazarus Group (Hidden Cobra / Diamond Sleet)',
    aliases: ['Zinc', 'Labyrinth Chollima', 'AppleJeus', 'Guardians of Peace'],
    origin: 'Democratic People\'s Republic of Korea (RGB)',
    motivation: 'Cryptocurrency Theft & Strategic Espionage',
    sophistication: 'High / Adaptive',
    confidenceScore: 79,
    targetedSectors: ['Crypto & Web3 Platforms', 'Defense Aerospace', 'Nuclear Energy', 'FinTech'],
    signatureLures: [
      'Executive job offer PDFs with embedded malicious macros',
      'Freelance contractor agreement documents',
      'Salary benchmarking spreadsheets requiring macro enablement'
    ],
    mitreTechniques: [
      { id: 'T1566.001', name: 'Spearphishing Attachment' },
      { id: 'T1027', name: 'Obfuscated Files or Information' },
      { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder' },
      { id: 'T1071.001', name: 'Web Protocols C2' }
    ],
    knownMalware: ['AppleJeus', 'BLINDINGCAN', 'HOPLIGHT', 'Manuscrypt'],
    tacticsSummary:
      'Leverages personalized social engineering lures via LinkedIn and spear phishing emails offering high-paying executive or engineering roles.',
    activeCampaigns: 'Operation CryptoHeist: Systematic targeting of decentralized exchange administrators.'
  },
  {
    id: 'scattered_spider',
    name: 'Scattered Spider (UNC3944 / Octo Tempest)',
    aliases: ['Muddled Libra', '0ktapus', 'Scatter Swine'],
    origin: 'Decentralized / English-Speaking Syndicate',
    motivation: 'Extortion, Ransomware & Identity Theft',
    sophistication: 'Advanced Social Engineering & Identity Abuse',
    confidenceScore: 84,
    targetedSectors: ['Telecommunications', 'BPO & Call Centers', 'Hospitality & Gaming', 'Identity Providers'],
    signatureLures: [
      'Urgent IT Helpdesk password reset notifications',
      'MFA push fatigue and corporate Okta verification portals',
      'SIM swap notifications followed by password resets'
    ],
    mitreTechniques: [
      { id: 'T1621', name: 'Multi-Factor Authentication Request Generation' },
      { id: 'T1566.002', name: 'Spearphishing Link' },
      { id: 'T1078.004', name: 'Valid Cloud Accounts' },
      { id: 'T1484.002', name: 'Domain Trust Discovery' }
    ],
    knownMalware: ['ALPHV / BlackCat', 'Custom Reverse Proxies', 'AnyDesk Abuse'],
    tacticsSummary:
      'Aggressive identity provider targeting using SMS quishing, fake corporate login pages, and voice social engineering targeting IT service desks.',
    activeCampaigns: 'SpiderMesh: Compromising enterprise single sign-on (SSO) infrastructure.'
  }
];

export const ThreatActorProfilerModal: React.FC<ThreatActorProfilerModalProps> = ({
  isOpen,
  onClose,
  investigationDetail
}) => {
  const [selectedActor, setSelectedActor] = useState<ThreatActor>(THREAT_ACTORS[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyActorDossier = () => {
    const text = `=== THREAT ACTOR INTELLIGENCE DOSSIER ===
Actor: ${selectedActor.name}
Aliases: ${selectedActor.aliases.join(', ')}
Origin: ${selectedActor.origin}
Motivation: ${selectedActor.motivation}
Confidence: ${selectedActor.confidenceScore}% Correlation
Active Campaign: ${selectedActor.activeCampaigns}
Tactics: ${selectedActor.tacticsSummary}
Known MITRE TTPs: ${selectedActor.mitreTechniques.map((t) => `${t.id} (${t.name})`).join(', ')}
Known Payloads: ${selectedActor.knownMalware.join(', ')}
Generated by MailTrace AI Enterprise SOC Intelligence Engine`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Threat Actor Attribution & APT Intelligence Profiler
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-700">
                  TI ATTRIBUTION
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Correlate email TTPs, header indicators & payload signatures against state-sponsored and cybercrime syndicates
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

        {/* Content Body: Sidebar + Main Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1">
          
          {/* Left Column: Actor Selection List */}
          <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                Correlated Threat Groups
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                MATCHED BY TTPS
              </span>
            </div>

            {THREAT_ACTORS.map((actor) => {
              const isSelected = selectedActor.id === actor.id;
              return (
                <button
                  key={actor.id}
                  onClick={() => setSelectedActor(actor)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {actor.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        actor.confidenceScore >= 90
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {actor.confidenceScore}% Match
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <Globe className="w-3 h-3 shrink-0" />
                    <span>{actor.origin}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {actor.tacticsSummary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Threat Actor Dossier */}
          <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6">
            
            {/* Actor Header Card */}
            <div className="p-5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {selectedActor.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Aliases:</span>
                    {selectedActor.aliases.map((alias, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleCopyActorDossier}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Dossier Copied' : 'Copy Briefing'}</span>
                  </button>
                </div>
              </div>

              {/* Attribution KPI Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-red-200/60 dark:border-red-900/40">
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Attribution Match</span>
                  <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">{selectedActor.confidenceScore}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Sponsor / Origin</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{selectedActor.origin}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Sophistication</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mt-0.5">{selectedActor.sophistication}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Primary Intent</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{selectedActor.motivation.split('(')[0]}</span>
                </div>
              </div>
            </div>

            {/* Active Operations & Campaigns */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span>Active Threat Campaign & Behavioral Signature</span>
              </h4>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedActor.activeCampaigns}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedActor.tacticsSummary}
              </p>
            </div>

            {/* Signature Email Lures & Payloads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  <span>Signature Email Social Engineering Lures</span>
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {selectedActor.signatureLures.map((lure, i) => (
                    <li key={i} className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{lure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Known Malware Tooling & Backdoors</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedActor.knownMalware.map((mal, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      {mal}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* MITRE ATT&CK Alignment */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
                <Crosshair className="w-3.5 h-3.5 text-indigo-500" />
                <span>Correlated MITRE ATT&CK Matrix Techniques</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedActor.mitreTechniques.map((tech) => (
                  <div
                    key={tech.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tech.name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0 font-bold">
                      {tech.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs">
          <span className="text-slate-500 font-mono">
            MITRE ATT&CK Framework Enterprise v14 • Threat Intelligence Feed
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold transition-colors"
          >
            Close Profiler
          </button>
        </div>

      </div>
    </div>
  );
};
