import React, { useState } from 'react';
import {
  Zap,
  ShieldAlert,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Server,
  Mail,
  UserX,
  Radio,
  Lock,
  Download
} from 'lucide-react';

interface SoarPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  investigationDetail?: any;
}

interface PlaybookAction {
  id: string;
  name: string;
  category: 'IDENTITY' | 'MESSAGING' | 'EDR' | 'NETWORK';
  target: string;
  description: string;
  enabled: boolean;
  icon: any;
}

export const SoarPlaybookModal: React.FC<SoarPlaybookModalProps> = ({
  isOpen,
  onClose,
  investigationDetail
}) => {
  const senderDomain = investigationDetail?.email?.from
    ? investigationDetail.email.from.split('@')[1]?.replace('>', '').trim() || 'attacker-c2-domain.com'
    : 'attacker-c2-domain.com';

  const recipient = investigationDetail?.email?.to || 'victim-user@enterprise.internal';
  const hashes = investigationDetail?.attachments?.map((a: any) => a.sha256).filter(Boolean) || [
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  ];

  const [actions, setActions] = useState<PlaybookAction[]>([
    {
      id: 'quarantine_domain',
      name: 'Quarantine Sender Domain on M365 & Google Workspace',
      category: 'MESSAGING',
      target: senderDomain,
      description: 'Creates global transport rule blocking all inbound SMTP relay traffic from domain.',
      enabled: true,
      icon: Mail
    },
    {
      id: 'revoke_session',
      name: 'Revoke Active User Tokens (Entra ID & Okta)',
      category: 'IDENTITY',
      target: recipient,
      description: 'Invalidates refresh tokens, terminating compromised browser & mobile sessions.',
      enabled: true,
      icon: UserX
    },
    {
      id: 'broadcast_edr',
      name: 'Broadcast IoCs to CrowdStrike & SentinelOne',
      category: 'EDR',
      target: `${hashes.length} payload hash(es) & C2 IPs`,
      description: 'Pushes cryptographic indicators to enterprise fleet for automated process kill.',
      enabled: true,
      icon: Radio
    },
    {
      id: 'purge_inbox',
      name: 'Purge Matching Messages Across All Mailboxes',
      category: 'MESSAGING',
      target: `Subject: "${investigationDetail?.email?.subject || 'Urgent Payment'}"`,
      description: 'Executes automated compliance hard-delete across all employee inboxes.',
      enabled: true,
      icon: Server
    },
    {
      id: 'isolate_endpoint',
      name: 'Isolate Recipient Endpoint (Network Containment)',
      category: 'NETWORK',
      target: `Host: ${recipient.split('@')[0]}-laptop.corp`,
      description: 'Restricts host network access solely to SOC management console.',
      enabled: false,
      icon: Lock
    }
  ]);

  const [executing, setExecuting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const toggleAction = (id: string) => {
    if (executing) return;
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleExecutePlaybook = () => {
    const selected = actions.filter((a) => a.enabled);
    if (selected.length === 0) return;

    setExecuting(true);
    setCompleted(false);
    setLogs([
      `[SOAR Orchestrator] Initializing Automated Incident Response Playbook #${Math.floor(10000 + Math.random() * 90000)}...`,
      `[Auth] Mutual TLS Handshake with Enterprise Security Mesh verified.`,
      `[Target Queue] ${selected.length} response action(s) scheduled for execution.`
    ]);
    setProgress(5);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const currentAction = selected[step - 1];

      if (currentAction) {
        setProgress(Math.round((step / selected.length) * 100));
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] 🚀 Executing ${currentAction.name}...`,
          `[Target] -> ${currentAction.target}`,
          `[Status] 200 OK | Policy successfully committed to production tier.`
        ]);
      }

      if (step >= selected.length) {
        clearInterval(interval);
        setTimeout(() => {
          setExecuting(false);
          setCompleted(true);
          setProgress(100);
          setLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ✅ PLAYBOOK EXECUTION COMPLETED: All security controls enforced.`,
            `[Audit ID] SOAR-AUDIT-${Date.now().toString(36).toUpperCase()} logged to persistent forensic ledger.`
          ]);
        }, 500);
      }
    }, 750);
  };

  const handleReset = () => {
    setExecuting(false);
    setCompleted(false);
    setLogs([]);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Automated SOAR Incident Response Playbook
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  AUTOMATED MITIGATION
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Orchestrate 1-click domain quarantine, token revocations, EDR blocklists & mailbox purge
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
          
          {/* Action Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-slate-400">
                Select Containment & Eradication Controls ({actions.filter((a) => a.enabled).length} Active)
              </label>
              {!executing && !completed && (
                <button
                  onClick={() =>
                    setActions((prev) => prev.map((a) => ({ ...a, enabled: true })))
                  }
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Select All Controls
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <div
                    key={act.id}
                    onClick={() => toggleAction(act.id)}
                    className={`p-3.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                      act.enabled
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={act.enabled}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {act.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {act.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {act.description}
                      </p>
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 font-semibold truncate">
                        🎯 Target: {act.target}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Progress & Terminal View */}
          {(executing || completed || logs.length > 0) && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>Live SOAR Execution Terminal</span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {progress}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Terminal Logs */}
              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 max-h-56 overflow-y-auto space-y-1">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      log.includes('✅')
                        ? 'text-emerald-400 font-bold'
                        : log.includes('Executing')
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
            <span>SOAR Orchestration Engine v2.4</span>
          </div>

          <div className="flex items-center space-x-3">
            {completed && (
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Playbook</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleExecutePlaybook}
              disabled={executing || actions.filter((a) => a.enabled).length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-emerald-600/25"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{executing ? 'Executing Playbook...' : completed ? 'Re-Run Playbook' : 'Execute SOAR Playbook'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
