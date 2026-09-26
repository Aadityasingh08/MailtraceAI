import React from 'react';
import { KeyRound, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { AuthResults } from '../types';

interface AuthResultsCardProps {
  auth: AuthResults;
}

export const AuthResultsCard: React.FC<AuthResultsCardProps> = ({ auth }) => {
  const getBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return {
          icon: CheckCircle2,
          color: 'text-soc-success bg-soc-success/10 border-soc-success/30',
          label: 'PASS',
        };
      case 'FAIL':
        return {
          icon: XCircle,
          color: 'text-soc-danger bg-soc-danger/10 border-soc-danger/30',
          label: 'FAIL',
        };
      case 'SOFTFAIL':
      case 'NEUTRAL':
        return {
          icon: AlertCircle,
          color: 'text-soc-warning bg-soc-warning/10 border-soc-warning/30',
          label: status,
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-soc-muted bg-soc-secondary border-soc-border',
          label: 'UNKNOWN / MISSING',
        };
    }
  };

  const protocols = [
    {
      name: 'SPF (Sender Policy Framework)',
      status: auth.spf_status,
      details: auth.spf_details || 'Validates whether transmitting IP is authorized in DNS SPF record.',
      badge: getBadge(auth.spf_status),
    },
    {
      name: 'DKIM (DomainKeys Identified Mail)',
      status: auth.dkim_status,
      details: auth.dkim_details || 'Cryptographically verifies message authenticity and body integrity.',
      badge: getBadge(auth.dkim_status),
    },
    {
      name: 'DMARC (Domain-based Message Authentication)',
      status: auth.dmarc_status,
      details: auth.dmarc_details || 'Determines domain alignment and enforcement policy (reject/quarantine).',
      badge: getBadge(auth.dmarc_status),
    },
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <KeyRound className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Cryptographic Authentication (SPF / DKIM / DMARC)
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-600 font-medium">Auth Integrity Score:</span>
          <span className="text-xs font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-sm">
            {auth.overall_score || 0}/100
          </span>
        </div>
      </div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {protocols.map((proto, idx) => {
          const BadgeIcon = proto.badge.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">{proto.name.split(' ')[0]}</span>
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${proto.badge.color}`}>
                  <BadgeIcon className="w-3 h-3" />
                  <span>{proto.badge.label}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{proto.details}</p>
            </div>
          );
        })}
      </div>

      {/* Mandatory SOC Forensic Guidance Alert */}
      <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start space-x-2.5 shadow-sm">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-900 font-bold">Analyst Caution:</strong> Do not conclude an email is malicious solely because SPF, DKIM, or DMARC records are missing or neutral. Many legitimate small-business domains have incomplete authentication configurations. Conversely, compromised authentic email accounts will still pass SPF and DKIM validation.
        </p>
      </div>
    </div>
  );
};
