import React from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface DeceptionAnalyzerProps {
  fromName: string;
  fromAddress: string;
  replyTo: string;
  returnPath: string;
  isLookalike: boolean;
  isReplyToMismatch: boolean;
  deceptionDetails: string[];
}

export const DeceptionAnalyzer: React.FC<DeceptionAnalyzerProps> = ({
  fromName,
  fromAddress,
  replyTo,
  returnPath,
  isLookalike,
  isReplyToMismatch,
  deceptionDetails,
}) => {
  const fromDomain = fromAddress.includes('@') ? fromAddress.split('@')[1] : '';
  const replyDomain = replyTo && replyTo.includes('@') ? replyTo.split('@')[1] : '';
  const returnDomain = returnPath && returnPath.includes('@') ? returnPath.split('@')[1] : '';

  const hasDeception = isLookalike || isReplyToMismatch || deceptionDetails.length > 0;

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex items-center justify-between border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Sender Identity Deception Analyzer
          </h3>
        </div>
        <div className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider border ${
          hasDeception ? 'bg-red-50 text-red-700 border-red-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
        }`}>
          {hasDeception ? 'Deception Detected' : 'Identity Verified'}
        </div>
      </div>

      {/* Grid of Identity Vectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        
        {/* Display Name vs From Address */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold">Display Name vs From Address</span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 truncate max-w-[160px]">{fromName || '(No Display Name)'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1" />
            <span className="font-mono text-emerald-700 font-bold truncate max-w-[160px]">{fromAddress}</span>
          </div>
          {isLookalike ? (
            <div className="flex items-center space-x-1 text-red-600 text-[11px] font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Domain typo-squats recognized brand</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-emerald-700 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>No direct brand collision detected</span>
            </div>
          )}
        </div>

        {/* From Domain vs Reply-To Domain */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold">From vs Reply-To Route</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-slate-900 font-bold truncate max-w-[160px]">{fromDomain || 'None'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-1" />
            <span className={`font-mono truncate max-w-[160px] ${isReplyToMismatch ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}`}>
              {replyDomain || fromDomain}
            </span>
          </div>
          {isReplyToMismatch ? (
            <div className="flex items-center space-x-1 text-red-600 text-[11px] font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Reply-To diverts replies to external domain</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-emerald-700 text-[11px] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Reply destination aligned with sender domain</span>
            </div>
          )}
        </div>

        {/* Envelope Return-Path */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold">Return-Path Envelope Alignment</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-slate-900 font-bold truncate">{returnDomain || fromDomain}</span>
            {returnDomain && returnDomain !== fromDomain ? (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-bold">
                Bounce Mismatch
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
                Aligned
              </span>
            )}
          </div>
        </div>

        {/* Deception Flags */}
        <div className="p-3 rounded-lg bg-soc-secondary/50 border border-soc-border space-y-1.5">
          <span className="text-[11px] font-mono text-soc-muted uppercase tracking-wider">Deception Status</span>
          <div className="flex items-center space-x-2">
            {hasDeception ? (
              <div className="text-soc-danger flex items-center space-x-1.5 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Active Deception Indicators Identified</span>
              </div>
            ) : (
              <div className="text-soc-success flex items-center space-x-1.5 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>MIME Sender Topology Aligned</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Deception Findings Callout List */}
      {deceptionDetails.length > 0 && (
        <div className="p-3 rounded-lg bg-soc-danger/10 border border-soc-danger/30 space-y-1 text-xs">
          <p className="font-mono font-bold text-soc-danger text-[11px] uppercase tracking-wider">
            Critical Identity Divergence Flags:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-soc-text text-[11px]">
            {deceptionDetails.map((detail, idx) => (
              <li key={idx}>{detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
