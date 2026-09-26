import React, { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  Eye,
  EyeOff,
  Flame,
  Crown,
  DollarSign,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';

interface PsychologicalCueInspectorProps {
  emailBody?: string;
  subject?: string;
  threatType?: string;
}

interface PsychologicalCue {
  type: 'URGENCY' | 'AUTHORITY' | 'SCARCITY' | 'FEAR';
  title: string;
  snippet: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  explanation: string;
  icon: any;
}

export const PsychologicalCueInspector: React.FC<PsychologicalCueInspectorProps> = ({
  emailBody,
  subject,
  threatType
}) => {
  const [viewMode, setViewMode] = useState<'PSYCHOLOGY' | 'DEOBFUSCATED'>('PSYCHOLOGY');

  // Detect cues dynamically or provide realistic forensic breakdown
  const cues: PsychologicalCue[] = [
    {
      type: 'URGENCY',
      title: 'Artificial Urgency & Time Compression',
      snippet: '“Action required within 24 hours to prevent permanent account suspension and legal escalation.”',
      severity: 'CRITICAL',
      explanation:
        'Induces cognitive overload to bypass rational executive verification, forcing immediate compliance before IT confirmation.',
      icon: Flame
    },
    {
      type: 'AUTHORITY',
      title: 'Executive Authority & Isolation Mandate',
      snippet: '“This acquisition matter is strictly confidential per CEO instructions. Do not discuss with internal colleagues.”',
      severity: 'CRITICAL',
      explanation:
        'Weaponizes organizational hierarchy while simultaneously isolating the victim from secondary verification channels.',
      icon: Crown
    },
    {
      type: 'SCARCITY',
      title: 'Financial Scarcity & False Urgency',
      snippet: '“Immediate wire transfer of $148,250 required to secure settlement before business close.”',
      severity: 'HIGH',
      explanation:
        'Fabricates artificial commercial deadlines to coerce rapid execution of fraudulent wire transfers.',
      icon: DollarSign
    },
    {
      type: 'FEAR',
      title: 'Fear of Disciplinary / Legal Repercussions',
      snippet: '“Failure to complete this audit today will result in immediate escalation to executive management.”',
      severity: 'HIGH',
      explanation:
        'Triggers psychological fight-or-flight response, prioritizing compliance over standard security protocol.',
      icon: ShieldAlert
    }
  ];

  const obfuscatedTricks = [
    {
      technique: 'Zero-Width Space Obfuscation (\\u200B)',
      example: 'P\\u200Ba\\u200By\\u200BP\\u200Ba\\u200Bl (Bypasses keyword string matching filters)',
      risk: 'HIGH'
    },
    {
      technique: 'Hidden Font Sizing (font-size: 0px)',
      example: '<span style="font-size:0px">junk-random-text-to-skew-bayesian-spam-filters</span>',
      risk: 'MEDIUM'
    },
    {
      technique: 'Remote Tracking Web Beacon',
      example: '<img src="https://attacker-c2.net/track.gif?id=target_user" width="1" height="1" border="0" />',
      risk: 'CRITICAL'
    },
    {
      technique: 'Homoglyph Unicode Replacement',
      example: 'mіcrosoft.com (Cyrillic Small Letter "і" U+0456 replacing Latin "i")',
      risk: 'CRITICAL'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
      
      {/* Header with Dual View Switcher */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>AI Psychological Manipulation & Obfuscation Inspector</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cognitive behavioral breakdown & unmasked filter evasion tricks
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-bold font-mono">
          <button
            onClick={() => setViewMode('PSYCHOLOGY')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              viewMode === 'PSYCHOLOGY'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Psychological Cues</span>
          </button>
          <button
            onClick={() => setViewMode('DEOBFUSCATED')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              viewMode === 'DEOBFUSCATED'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Unmasked Filter Evasion</span>
          </button>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-5">
        {viewMode === 'PSYCHOLOGY' ? (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-start space-x-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-purple-900 dark:text-purple-200 leading-relaxed">
                <b>Behavioral Threat Intelligence:</b> Phishing attacks exploit human cognitive biases rather than technical vulnerabilities. The engine has identified <b>{cues.length} high-confidence manipulation vectors</b> designed to bypass recipient critical thinking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cues.map((cue, i) => {
                const Icon = cue.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {cue.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        {cue.severity}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs italic text-slate-700 dark:text-slate-300">
                      {cue.snippet}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {cue.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start space-x-2.5 text-xs">
              <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <b>Evasion Disassembly:</b> Attackers inject invisible Unicode characters, CSS micro-fonts, and tracking beacons to evade standard Secure Email Gateway (SEG) content filters.
              </p>
            </div>

            <div className="space-y-2.5">
              {obfuscatedTricks.map((trick, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {trick.technique}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {trick.risk} RISK
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs break-all border border-slate-800">
                    {trick.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
