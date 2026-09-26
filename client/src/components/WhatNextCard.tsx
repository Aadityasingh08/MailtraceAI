import React, { useState } from 'react';
import { ListChecks, CheckSquare, Square, Shield, ExternalLink, HelpCircle } from 'lucide-react';

interface WhatNextCardProps {
  severity: string;
  threatType: string;
}

export const WhatNextCard: React.FC<WhatNextCardProps> = ({ severity, threatType }) => {
  const isHighRisk = severity === 'CRITICAL' || severity === 'HIGH';

  const defaultTasks = isHighRisk
    ? [
        { id: 't1', title: 'Quarantine Email Globally', desc: 'Execute tenant-wide search and purge across all recipient mailboxes to prevent user interaction.' },
        { id: 't2', title: 'Perimeter Domain & IP Block', desc: 'Add deceptive sender domains and originating IPs to gateway firewall and email perimeter drop-lists.' },
        { id: 't3', title: 'Web Proxy & DNS Log Telemetry Audit', desc: 'Inspect proxy access logs to confirm whether any internal users clicked or resolved embedded URLs.' },
        { id: 't4', title: 'Credential Revocation & Session Terminate', desc: 'Initiate forced password reset and revoke active SSO tokens for targeted employees.' },
        { id: 't5', title: 'Lookalike Brand Registration Search', desc: 'Query WHOIS/RDAP to identify other recently registered lookalike domains sharing identical name-servers.' },
      ]
    : [
        { id: 't1', title: 'Deliver with Security Warning Banner', desc: 'Append a security awareness tag advising user caution regarding external senders.' },
        { id: 't2', title: 'Monitor Sender Infrastructure', desc: 'Add sender domain to low-priority watchlist to track recurring volume fluctuations.' },
        { id: 't3', title: 'Standard Archival', desc: 'Log investigation metadata to SOC ticket repository without blocking transmission.' },
      ];

  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggleTask = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <ListChecks className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            SOC Remediation Playbook: What To Do Next
          </h3>
        </div>

        <span className="text-xs font-mono text-slate-500 font-medium">
          Progress: <strong className="text-emerald-700">{completed.size}/{defaultTasks.length} Completed</strong>
        </span>
      </div>

      <p className="text-xs text-slate-600">
        Recommended incident response actions prioritized for <strong className="text-slate-900 font-bold">{threatType}</strong> at <strong className="text-slate-900 font-bold">{severity}</strong> severity:
      </p>

      <div className="space-y-2">
        {defaultTasks.map(task => {
          const isDone = completed.has(task.id);
          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                isDone
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
              }`}
            >
              <button className="mt-0.5 text-emerald-600 hover:text-emerald-800 transition-colors shrink-0">
                {isDone ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-400" />}
              </button>
              <div className="flex-1">
                <h5 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.title}
                </h5>
                <p className="text-[11px] text-slate-600 mt-0.5">{task.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
        <strong className="text-slate-900 font-bold">Note:</strong> Recommendations are analyst guidance for SOC standard operating procedures, requiring human verification prior to policy enforcement.
      </div>
    </div>
  );
};
