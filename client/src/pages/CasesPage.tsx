import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Filter, AlertTriangle, CheckCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { CaseItem } from '../types';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Case Form
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('HIGH');
  const [assignedTo, setAssignedTo] = useState('Lead SOC Analyst');

  useEffect(() => {
    loadCases();
  }, [statusFilter, priorityFilter]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const res = await api.listCases({ status: statusFilter || undefined, priority: priorityFilter || undefined });
      setCases(res.cases || []);
    } catch (err: any) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.createCase({
        title: newTitle.trim(),
        priority: newPriority,
        assignedTo,
      });
      setShowCreateModal(false);
      setNewTitle('');
      loadCases();
    } catch (err: any) {
      alert(`Failed to create case: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      await api.updateCase(caseId, { status: newStatus });
      setCases(prev => prev.map(c => (c.id === caseId ? { ...c, status: newStatus as any } : c)));
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 text-red-700 border-red-300';
      case 'INVESTIGATING': return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'CONTAINED': return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default: return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Incident Case Management</h1>
          </div>
          <p className="text-xs text-soc-muted font-mono mt-1">
            Track, assign, contain, and remediate email security incidents
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Incident Case</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-xl border border-soc-border shadow-socCard flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-soc-muted uppercase">Filter:</span>
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded bg-white border border-soc-border text-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="CONTAINED">Contained</option>
          <option value="RESOLVED">Resolved</option>
          <option value="FALSE_POSITIVE">False Positive</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded bg-white border border-soc-border text-slate-800 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Cases Table */}
      <div className="glass-panel rounded-xl p-5 border border-soc-border shadow-socCard overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-soc-border text-soc-muted text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Case ID</th>
              <th className="py-2.5 px-3">Title & Classification</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Assigned Lead</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Attached Investigations</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border/60">
            {cases.map(c => (
              <tr key={c.id} className="hover:bg-emerald-50/50 transition-colors">
                <td className="py-3.5 px-3 text-emerald-700 font-bold whitespace-nowrap">
                  {c.case_number}
                </td>

                <td className="py-3.5 px-3">
                  <div className="font-bold text-slate-800 max-w-sm">{c.title}</div>
                  <div className="text-[10px] text-soc-muted mt-0.5">
                    Threat: <span className="text-emerald-700 font-semibold">{c.threat_type || 'SUSPICIOUS'}</span> · Risk: {c.risk_score}/100
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    c.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                    c.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                    'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {c.priority}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-slate-700 font-medium">
                  {c.assigned_to || 'Unassigned'}
                </td>

                <td className="py-3.5 px-3">
                  <select
                    value={c.status}
                    onChange={e => handleUpdateStatus(c.id, e.target.value)}
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border focus:outline-none ${getStatusBadge(c.status)}`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="CONTAINED">CONTAINED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                  </select>
                </td>

                <td className="py-3.5 px-3">
                  {c.investigations && c.investigations.length > 0 ? (
                    <div className="space-y-1">
                      {c.investigations.map(inv => (
                        <Link
                          key={inv.id}
                          to={`/investigate/${inv.id}`}
                          className="flex items-center space-x-1 text-soc-cyan hover:underline text-[11px] truncate max-w-xs block"
                        >
                          <ChevronRight className="w-3 h-3 shrink-0" />
                          <span className="truncate">{inv.title}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <span className="text-soc-muted text-[11px]">None attached</span>
                  )}
                </td>

                <td className="py-3.5 px-3 text-right">
                  <span className="text-[10px] text-soc-muted">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cases.length === 0 && !loading && (
          <div className="py-8 text-center text-xs text-soc-muted font-mono">
            No incident cases found matching current filters.
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 uppercase text-sm">Create Security Incident Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Active Credential Phishing Against Finance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Assigned Analyst</label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25 transition-all"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
