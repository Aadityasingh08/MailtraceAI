import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Fish,
  Bug,
  Globe,
  Network,
  Briefcase,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await api.getDashboardMetrics();
        setData(res);
      } catch (err: any) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-soc-bg flex items-center justify-center font-mono text-soc-cyan">
        <Activity className="w-6 h-6 animate-spin mr-2" />
        <span>Loading SOC Telemetry Stream...</span>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const systemStatus = data?.systemStatus || [];
  const recentInvs = data?.recentInvestigations || [];

  const kpis = [
    { title: 'Total Ingested', value: summary.totalInvestigations || 0, icon: Activity, color: 'text-soc-cyan', border: 'border-soc-cyan/30' },
    { title: 'Critical Threats', value: summary.criticalThreats || 0, icon: Flame, color: 'text-soc-danger', border: 'border-soc-danger/30' },
    { title: 'High-Risk Emails', value: summary.highRiskEmails || 0, icon: AlertTriangle, color: 'text-orange-400', border: 'border-orange-500/30' },
    { title: 'Phishing Identified', value: summary.phishingDetected || 0, icon: Fish, color: 'text-soc-warning', border: 'border-soc-warning/30' },
    { title: 'Malware Payloads', value: summary.malwareIndicators || 0, icon: Bug, color: 'text-red-400', border: 'border-red-500/30' },
    { title: 'Suspicious Domains', value: summary.suspiciousDomains || 0, icon: Globe, color: 'text-purple-400', border: 'border-purple-500/30' },
    { title: 'Suspicious IPs', value: summary.suspiciousIPs || 0, icon: Network, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { title: 'Active Cases', value: summary.openCases || 0, icon: Briefcase, color: 'text-soc-success', border: 'border-soc-success/30' },
    { title: 'Investigated Today', value: summary.investigationsToday || 0, icon: Clock, color: 'text-soc-text', border: 'border-soc-border' },
  ];

  return (
    <div className="min-h-screen bg-soc-bg p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soc-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Operations Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold">
              SOC LIVE
            </span>
          </div>
          <p className="text-xs text-soc-muted font-mono mt-1">
            Autonomous threat detection telemetry & forensic surveillance feed
          </p>
        </div>

        <Link
          to="/investigate"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          <span>New Investigation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl bg-soc-card/90 border ${kpi.border} flex flex-col justify-between space-y-2 shadow-socCard`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-soc-muted font-bold truncate">{kpi.title}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className={`text-xl font-mono font-extrabold tracking-tight ${kpi.color}`}>
                {kpi.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* System Status Panel (Real status without fake data) */}
      <div className="glass-panel p-4 rounded-xl border border-soc-border shadow-socCard">
        <div className="flex items-center space-x-2 mb-3">
          <Server className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            Engine Health & Subsystem Status Panel
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {systemStatus.map((sys: any, idx: number) => {
            const isOnline = sys.status.includes('ONLINE');
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-soc-bg border border-soc-border text-xs font-mono">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-800 font-bold text-[11px]">{sys.name}</span>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <div className={`text-[10px] font-bold ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {sys.status}
                </div>
                <p className="text-[9px] text-soc-muted truncate mt-0.5" title={sys.details}>{sys.details}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6 SOC Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Threat Severity Distribution */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            1. Threat Severity Distribution
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.severityDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.severityDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-3 text-[10px] font-mono text-soc-muted">
            {(charts.severityDistribution || []).map((s: any, i: number) => (
              <span key={i} className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}: {s.value}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Threat Types */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            2. Threat Classification Types
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.threatTypes || []} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={9} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }} />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Investigations Over Time */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            3. Investigations Trend (Last 7 Days)
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.investigationsOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} name="Total Ingested" />
                <Line type="monotone" dataKey="highRisk" stroke="#DC2626" strokeWidth={2} name="High Risk" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Suspicious Domains */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            4. Top Suspicious Domains
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts.topSuspiciousDomains || []} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={10} allowDecimals={false} />
                <YAxis type="category" dataKey="domain" stroke="#64748B" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }} />
                <Bar dataKey="detections" fill="#D97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Top Source Countries */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            5. Top Source Routing Countries
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topSourceCountries || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="country" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: IOC Statistics */}
        <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
            6. IOC Telemetry Statistics
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.iocStatistics || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="type" stroke="#64748B" fontSize={9} />
                <YAxis stroke="#64748B" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', color: '#0F172A', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }} />
                <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Investigations Table */}
      <div className="glass-panel p-5 rounded-xl border border-soc-border shadow-socCard space-y-4">
        <div className="flex items-center justify-between border-b border-soc-border pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 font-mono uppercase tracking-wide">
              Recent SOC Investigations Feed
            </h3>
          </div>
          <Link to="/history" className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-mono font-bold">
            View All History →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-soc-border text-soc-muted text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Subject / Dossier</th>
                <th className="py-2.5 px-3">Threat Classification</th>
                <th className="py-2.5 px-3">Assessed Risk</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/60">
              {recentInvs.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800 max-w-xs truncate">
                    {inv.title}
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">
                    {inv.threat_type}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900">{inv.risk_score}</span> / 100
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      inv.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                      inv.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                      inv.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                      'bg-emerald-50 text-emerald-700 border-emerald-300'
                    }`}>
                      {inv.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-soc-muted">
                    {new Date(inv.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/investigate/${inv.id}`}
                      className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 transition-colors font-bold"
                    >
                      Investigate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
