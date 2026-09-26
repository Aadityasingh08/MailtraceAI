import React, { useState } from 'react';
import { Search, AlertOctagon, AlertTriangle, CheckCircle, FileText, Code2, Copy, Check, Table } from 'lucide-react';
import { HeaderAnalysisItem } from '../types';

interface HeaderForensicsTableProps {
  headers: HeaderAnalysisItem[];
}

export const HeaderForensicsTable: React.FC<HeaderForensicsTableProps> = ({ headers }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');
  const [copiedRaw, setCopiedRaw] = useState(false);

  const filteredHeaders = headers.filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(filter.toLowerCase()) ||
      h.value.toLowerCase().includes(filter.toLowerCase()) ||
      (h.explanation && h.explanation.toLowerCase().includes(filter.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const rawHeaderText = headers.map(h => `${h.name}: ${h.value}`).join('\n');

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawHeaderText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase font-mono">
            Email Header Forensics & RFC 5322 Inspector
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
            {headers.length} Headers
          </span>
        </div>

        {/* View Switcher & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Structured vs Raw Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setViewMode('structured')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
                viewMode === 'structured'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Diff</span>
            </button>
          </div>

          {viewMode === 'structured' && (
            <>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter headers..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="MALICIOUS">Malicious</option>
                <option value="SUSPICIOUS">Suspicious</option>
                <option value="NORMAL">Normal</option>
              </select>
            </>
          )}

          {viewMode === 'raw' && (
            <button
              onClick={handleCopyRaw}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold transition-colors"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'Copied!' : 'Copy Raw MIME'}</span>
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: Structured Table */}
      {viewMode === 'structured' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-soc-border/80 text-soc-muted font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Header</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Risk Contribution</th>
                <th className="py-2.5 px-3">Value</th>
                <th className="py-2.5 px-3">Forensic Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/40 font-mono">
              {filteredHeaders.map((header, idx) => {
                const isMalicious = header.status === 'MALICIOUS';
                const isSuspicious = header.status === 'SUSPICIOUS';

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-soc-cardHover/50 transition-colors ${
                      isMalicious ? 'bg-red-50/20 dark:bg-red-950/20' : isSuspicious ? 'bg-amber-50/20 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {header.name}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isMalicious
                            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                            : isSuspicious
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {isMalicious ? (
                          <AlertOctagon className="w-3 h-3" />
                        ) : isSuspicious ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <span>{header.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {header.risk_contribution > 0 ? (
                        <span className="font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-800">
                          +{header.risk_contribution} pts
                        </span>
                      ) : (
                        <span className="text-slate-400">0 pts</span>
                      )}
                    </td>

                    <td className="py-3 px-3 max-w-xs truncate text-slate-800 dark:text-slate-200 font-mono text-[11px]" title={header.value}>
                      {header.value}
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-sans text-xs max-w-sm">
                      {header.explanation || 'Header inspected and conforms to standard MIME transport specification.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredHeaders.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No headers match your search criteria.
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Raw Syntax Anomaly Highlighter */}
      {viewMode === 'raw' && (
        <div className="space-y-3 font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto max-h-96 overflow-y-auto text-xs space-y-1">
            {headers.map((h, i) => {
              const isMal = h.status === 'MALICIOUS';
              const isSusp = h.status === 'SUSPICIOUS';

              return (
                <div
                  key={i}
                  className={`flex items-start space-x-3 px-2 py-1 rounded transition-colors ${
                    isMal
                      ? 'bg-red-950/50 border-l-2 border-red-500 text-red-200'
                      : isSusp
                      ? 'bg-amber-950/50 border-l-2 border-amber-500 text-amber-200'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-slate-600 select-none w-6 text-right shrink-0">{i + 1}</span>
                  <div className="flex-1 break-all">
                    <span className="font-bold text-emerald-400">{h.name}: </span>
                    <span className="text-slate-200">{h.value}</span>
                    {(isMal || isSusp) && (
                      <span className={`ml-2 text-[10px] font-sans px-1.5 py-0.5 rounded font-bold uppercase inline-block ${
                        isMal ? 'bg-red-900/80 text-red-200' : 'bg-amber-900/80 text-amber-200'
                      }`}>
                        ⚠️ {h.status}: {h.explanation}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>RFC 5322 Syntax Stream · {headers.filter(h => h.status !== 'NORMAL').length} anomalies highlighted</span>
            <span className="text-emerald-600 font-bold">Standard UTF-8 ESMTP Encoding</span>
          </div>
        </div>
      )}
    </div>
  );
};
