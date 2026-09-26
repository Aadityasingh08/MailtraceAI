import React, { useState } from 'react';
import { Crosshair, Copy, Check, ExternalLink, PlusCircle, Search, AlertTriangle } from 'lucide-react';
import { ExtractedIOC } from '../types';
import { api } from '../services/api';

interface IocTableProps {
  iocs: ExtractedIOC[];
  investigationId?: string;
  onAddToCase?: (ioc: ExtractedIOC) => void;
}

export const IocTable: React.FC<IocTableProps> = ({ iocs, onAddToCase }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIocs = iocs.filter(ioc => {
    const matchesType = filterType === 'ALL' || ioc.type === filterType;
    const matchesSearch =
      ioc.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ioc.context && ioc.context.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-soc-danger/10 text-soc-danger border-soc-danger/40';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-soc-warning/10 text-soc-warning border-soc-warning/40';
      default:
        return 'bg-soc-success/10 text-soc-success border-soc-success/40';
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soc-border pb-3">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase font-mono">
            Extracted Indicators of Compromise (IOCs)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
            {iocs.length} Total Indicators
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search IOCs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Types</option>
            <option value="IPV4">IPv4</option>
            <option value="URL">URLs</option>
            <option value="DOMAIN">Domains</option>
            <option value="EMAIL">Emails</option>
            <option value="HASH_SHA256">Hashes</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Indicator</th>
              <th className="py-2.5 px-3">Assessed Risk</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">Context</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIocs.map((ioc, idx) => {
              const uniqueKey = `${ioc.type}_${ioc.indicator}_${idx}`;
              const isCopied = copiedId === uniqueKey;

              return (
                <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-emerald-800 border border-slate-200 font-semibold text-[10px]">
                      {ioc.type}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-900 font-semibold max-w-xs truncate" title={ioc.indicator}>
                    {ioc.indicator}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(ioc.risk_level)}`}>
                      {ioc.risk_level}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {ioc.source}
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-sans text-xs max-w-sm">
                    {ioc.context}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => copyToClipboard(ioc.indicator, uniqueKey)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                        title="Copy IOC to clipboard"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {onAddToCase && (
                        <button
                          onClick={() => onAddToCase(ioc)}
                          className="p-1.5 rounded hover:bg-soc-card text-soc-muted hover:text-soc-cyan transition-colors"
                          title="Add indicator to incident case"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredIocs.length === 0 && (
          <div className="py-8 text-center text-xs text-soc-muted font-mono">
            No indicators match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
