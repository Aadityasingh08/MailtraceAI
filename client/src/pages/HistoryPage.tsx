import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Trash2, ChevronLeft, ChevronRight, Eye, AlertOctagon } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [threatType, setThreatType] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page, threatType, severity]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.listInvestigations({
        page,
        limit: 15,
        search: search || undefined,
        threatType: threatType || undefined,
        severity: severity || undefined,
      });
      setInvestigations(res.investigations || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('Failed to load investigation history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Permanently delete investigation ${id}? This action is audited.`)) return;

    try {
      await api.deleteInvestigation(id);
      setInvestigations(prev => prev.filter(inv => inv.id !== id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Investigation Archive & Dossier History</h1>
          </div>
          <p className="text-xs text-soc-muted font-mono mt-1">
            Searchable historical archive of investigated email threats and cryptographic evidence
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel p-4 rounded-xl border border-soc-border shadow-socCard flex flex-col sm:flex-row items-center gap-3 text-xs font-mono">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center relative">
          <Search className="w-4 h-4 text-soc-muted absolute left-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, sender, indicators, or storyline..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-xs text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={threatType}
            onChange={e => { setThreatType(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-white border border-soc-border text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Threat Types</option>
            <option value="PHISHING">Phishing</option>
            <option value="BUSINESS EMAIL COMPROMISE">BEC</option>
            <option value="CREDENTIAL HARVESTING">Credential Harvesting</option>
            <option value="MALWARE DELIVERY">Malware Delivery</option>
            <option value="BENIGN">Benign</option>
          </select>

          <select
            value={severity}
            onChange={e => { setSeverity(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg bg-white border border-soc-border text-slate-800 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Archive Table */}
      <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-soc-border text-soc-muted text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Subject & Dossier</th>
              <th className="py-2.5 px-3">Threat Classification</th>
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Date Logged</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border/60">
            {investigations.map(inv => (
              <tr key={inv.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-3.5 px-3">
                  <div className="font-bold text-slate-800 max-w-sm truncate">{inv.title}</div>
                  <div className="text-[10px] text-soc-muted mt-0.5 font-mono">ID: {inv.id}</div>
                </td>

                <td className="py-3.5 px-3 font-bold text-emerald-700">
                  {inv.threat_type}
                </td>

                <td className="py-3.5 px-3">
                  <span className="font-extrabold text-slate-900">{inv.risk_score}</span> / 100
                </td>

                <td className="py-3.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    inv.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                    inv.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                    inv.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                    'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}>
                    {inv.severity}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-soc-muted">
                  {new Date(inv.created_at).toLocaleString()}
                </td>

                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      to={`/investigate/${inv.id}`}
                      className="p-1.5 rounded hover:bg-soc-card text-soc-cyan transition-colors"
                      title="Inspect Investigation Dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded hover:bg-soc-card text-soc-muted hover:text-soc-danger transition-colors"
                        title="Delete record (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {investigations.length === 0 && !loading && (
          <div className="py-8 text-center text-xs text-soc-muted font-mono">
            No archived investigations found matching query.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-soc-border/60 text-xs font-mono text-soc-muted">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-soc-card border border-soc-border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-soc-card border border-soc-border disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
