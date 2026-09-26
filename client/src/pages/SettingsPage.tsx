import React, { useState, useEffect } from 'react';
import { Settings, Key, Users, Shield, Save, CheckCircle, Database, Palette, Sparkles, Check, Moon, Sun, Layers } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEME_OPTIONS, BACKGROUND_OPTIONS } from '../context/ThemeContext';
import { User } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme, bgStyle, setBgStyle, colorTheme, setColorTheme } = useTheme();
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

      {/* Theme & Visual Appearance Selection Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-soc-accent" style={{ color: 'var(--soc-accent)' }} />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono uppercase">
                Visual Appearance & Background Atmosphere
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Customize your background atmosphere and color accents so all content is clearly visible.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                theme === 'light' ? 'bg-white text-slate-900 border-sky-500 shadow-sm' : 'border-soc-border text-soc-muted'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                theme === 'dark' ? 'bg-soc-secondary text-white border-soc-accent shadow-sm' : 'border-soc-border text-soc-muted'
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        {/* Background Atmosphere Options */}
        <div>
          <h4 className="text-xs font-bold text-soc-text uppercase font-mono mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-soc-accent" />
            Background Color Profiles (Pick what looks best to your eyes)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {BACKGROUND_OPTIONS.map((bg) => {
              const isSelected = bgStyle === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => setBgStyle(bg.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected ? 'border-soc-accent ring-2 ring-soc-accent/40 shadow-md' : 'border-soc-border'
                  }`}
                  style={{ backgroundColor: bg.bgHex }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: bg.cardHex }} />
                    {isSelected && <Check className={`w-3.5 h-3.5 ${bg.isDark ? 'text-amber-400' : 'text-sky-600'}`} />}
                  </div>
                  <div className={`text-xs font-bold truncate ${bg.isDark ? 'text-white' : 'text-slate-900'}`}>
                    {bg.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Styles */}
        <div className="pt-2 border-t border-soc-border/50">
          <h4 className="text-xs font-bold text-soc-text uppercase font-mono mb-2 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-soc-accent" />
            Accent Themes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = colorTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setColorTheme(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'ring-2 shadow-sm border-transparent'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                  style={{
                    borderColor: isSelected ? opt.accentColor : undefined,
                  }}
                >
                  <div className="flex items-center space-x-1.5 mb-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.accentColor }} />
                    <span className="font-bold text-xs text-soc-text truncate">{opt.name.split(' ')[0]}</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${opt.gradientClass}`} />
                </button>
              );
            })}
          </div>
        </div>
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
