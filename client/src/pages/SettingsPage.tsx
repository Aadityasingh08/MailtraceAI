import React, { useState, useEffect } from 'react';
import { Settings, Key, Users, Shield, Save, CheckCircle, Database } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // System settings state
  const [settings, setSettings] = useState<any>(null);
  const [vtKey, setVtKey] = useState('');
  const [abuseKey, setAbuseKey] = useState('');
  const [geoKey, setGeoKey] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // User Management
  const [userList, setUserList] = useState<User[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    if (isAdmin) {
      loadUsers();
      loadAuditLogs();
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUserList(res.users || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings({
        virustotalApiKey: vtKey || undefined,
        abuseipdbApiKey: abuseKey || undefined,
        geolocationApiKey: geoKey || undefined,
        aiApiKey: aiKey || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadSettings();
    } catch (err: any) {
      alert(`Failed to update settings: ${err.message}`);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUserList(prev => prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u)));
    } catch (err: any) {
      alert(`Failed to update user role: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Administration</h1>
        </div>
        <p className="text-xs text-slate-600 font-mono mt-1 font-medium">
          Manage threat intelligence provider connectors, RBAC user permissions, and security audit logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* API Keys Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                Threat Intelligence Provider Connectors
              </h3>
            </div>
            {saveSuccess && (
              <span className="flex items-center space-x-1 text-xs text-emerald-700 font-mono font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveApiKeys} className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold uppercase">VirusTotal API Key</label>
                <span className={`text-[10px] ${settings?.hasVirustotalKey ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {settings?.hasVirustotalKey ? '● Configured' : '○ Not Configured'}
                </span>
              </div>
              <input
                type="password"
                value={vtKey}
                onChange={e => setVtKey(e.target.value)}
                placeholder={settings?.hasVirustotalKey ? '••••••••••••••••' : 'Enter VIRUSTOTAL_API_KEY'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold uppercase">AbuseIPDB API Key</label>
                <span className={`text-[10px] ${settings?.hasAbuseIpDbKey ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {settings?.hasAbuseIpDbKey ? '● Configured' : '○ Not Configured'}
                </span>
              </div>
              <input
                type="password"
                value={abuseKey}
                onChange={e => setAbuseKey(e.target.value)}
                placeholder={settings?.hasAbuseIpDbKey ? '••••••••••••••••' : 'Enter ABUSEIPDB_API_KEY'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold uppercase">IP Geolocation Provider</label>
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
                  ● Free Live Registry Active (No Key Required)
                </span>
              </div>
              <input
                type="password"
                value={geoKey}
                onChange={e => setGeoKey(e.target.value)}
                placeholder={settings?.hasGeolocationKey ? '••••••••••••••••' : 'Optional: Enter custom ipinfo token (Free by default)'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-bold uppercase">AI Engine Model Key</label>
                <span className={`text-[10px] ${settings?.hasAiKey ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                  {settings?.hasAiKey ? '● Configured' : '○ Heuristic Default Active'}
                </span>
              </div>
              <input
                type="password"
                value={aiKey}
                onChange={e => setAiKey(e.target.value)}
                placeholder={settings?.hasAiKey ? '••••••••••••••••' : 'Enter AI_API_KEY'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Connectors</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Database & Environment Info */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">Database & Environment</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Active Database Engine</span>
                <span className="text-slate-900 font-bold">{settings?.databaseType || 'Local SQLite'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Node Environment</span>
                <span className="text-emerald-700 font-bold">{settings?.nodeEnv || 'development'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Service Port</span>
                <span className="text-slate-900 font-bold">{settings?.port || 5000}</span>
              </div>

              <div className="p-3 rounded bg-soc-secondary/50 border border-soc-border">
                <span className="text-[10px] text-soc-muted uppercase block">Role-Based Access</span>
                <span className="text-soc-success font-semibold">Active & Enforced</span>
              </div>
            </div>
          </div>

          {/* User Management (Admin Only) */}
          {isAdmin && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                  User Management & RBAC Permissions
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {userList.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-900 font-bold">{u.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={u.role}
                            onChange={e => handleUpdateRole(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-emerald-500"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* System Audit Logs (Admin Only) */}
      {isAdmin && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
              System Audit Logs & Evidentiary Events
            </h3>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource Target</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">
                      {log.user_name}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs" title={log.resource}>
                      {log.resource}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-700 bg-red-50 border border-red-200'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
