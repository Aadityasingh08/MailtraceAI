import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertCircle, HelpCircle } from 'lucide-react';
import { ScoreContributionItem } from '../types';

interface ThreatMeterProps {
  score: number;
  threatType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  recommendedAction: string;
  breakdown: ScoreContributionItem[];
}

export const ThreatMeter: React.FC<ThreatMeterProps> = ({
  score,
  threatType,
  severity,
  confidence,
  recommendedAction,
  breakdown,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // SVG circular properties
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#DC2626'; // Critical
    if (score >= 60) return '#EA580C'; // High
    if (score >= 35) return '#D97706'; // Medium
    return '#059669';                  // Low
  };

  const getSeverityBg = () => {
    if (severity === 'CRITICAL') return 'bg-red-50 text-red-700 border-red-300';
    if (severity === 'HIGH') return 'bg-orange-50 text-orange-700 border-orange-300';
    if (severity === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-300';
    return 'bg-emerald-50 text-emerald-700 border-emerald-300';
  };

  const primaryColor = getColor();

  return (
    <div className="glass-panel rounded-xl p-6 border border-soc-border shadow-socCard">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Circular SVG Gauge */}
        <div className="relative flex flex-col items-center justify-center shrink-0">
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={primaryColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 8px ${primaryColor}66)` }}
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-mono tracking-tighter" style={{ color: primaryColor }}>
              {score}
            </span>
            <span className="text-[10px] font-mono uppercase text-soc-muted tracking-widest font-bold">
              / 100 RISK
            </span>
          </div>

          <div className="mt-3 flex items-center space-x-1.5 text-xs text-soc-muted">
            <span>Confidence:</span>
            <span className="font-mono font-bold text-slate-800">{confidence}%</span>
          </div>
        </div>

        {/* Threat Summary Content */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-soc-muted font-bold">Threat Classification</span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {threatType}
              </h2>
            </div>
            <div className={`px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${getSeverityBg()}`}>
              {severity} SEVERITY
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">Recommended Action</p>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{recommendedAction}</p>
              </div>
            </div>
          </div>

          {/* Explainable Threat Score Trigger */}
          <div className="pt-1">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center space-x-2 text-xs text-soc-cyan hover:text-soc-cyan/80 font-mono font-medium transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Why this score? Explainable Threat Score Model</span>
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Expandable Evidence Breakdown */}
      {showExplanation && (
        <div className="mt-6 pt-5 border-t border-soc-border animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-soc-muted font-bold">
              Transparent Risk Contribution Breakdown
            </h4>
            <span className="text-xs font-mono text-soc-muted">
              Cumulative Total: <strong className="text-slate-900 font-bold">{score} pts</strong>
            </span>
          </div>

          <div className="space-y-2">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 text-xs transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    +{item.points}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{item.category}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5">{item.evidence}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-md bg-soc-secondary/30 border border-soc-border text-[11px] text-soc-muted flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-soc-cyan shrink-0 mt-0.5" />
            <p>
              MailTrace AI uses a multi-factor deterministic and semantic scoring model. Every contribution is verified against forensic signals from MIME headers, cryptographic proofs, and extracted telemetry to eliminate black-box ambiguity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
