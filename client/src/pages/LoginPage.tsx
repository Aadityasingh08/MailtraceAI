import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, UserCheck, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'analyst' | 'viewer') => {
    setError(null);
    setSubmitting(true);
    try {
      await loginAsDemo(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-soc-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel-glow p-8 rounded-2xl border border-soc-border shadow-2xl relative z-10 space-y-6">
        
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-600 shadow-sm">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">MailTrace AI SOC Portal</h2>
          <p className="text-xs text-soc-muted font-mono">Authenticate to access forensic telemetry and incident cases</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-700 uppercase mb-1 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-soc-muted absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@mailtrace.soc"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 uppercase font-semibold">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-soc-muted absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>
        </form>

        {/* 1-Click Demo Credentials Strip */}
        <div className="pt-2 border-t border-soc-border space-y-2">
          <p className="text-[11px] font-mono text-soc-muted text-center uppercase tracking-wider font-semibold">
            Quick 1-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={submitting}
              className="p-2 rounded bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 font-bold text-center transition-colors shadow-sm"
            >
              ADMIN
            </button>
            <button
              onClick={() => handleDemoLogin('analyst')}
              disabled={submitting}
              className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-center transition-colors shadow-sm"
            >
              ANALYST
            </button>
            <button
              onClick={() => handleDemoLogin('viewer')}
              disabled={submitting}
              className="p-2 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-center transition-colors shadow-sm"
            >
              VIEWER
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs text-soc-muted font-mono">
          <span>Need an account? </span>
          <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
            Register Here
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-soc-border rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl font-mono text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-soc-border pb-2">
              <span className="font-bold text-slate-900 uppercase">Password Recovery</span>
              <button onClick={() => setShowForgotModal(false)} className="text-soc-muted hover:text-slate-900 font-bold">✕</button>
            </div>
            <p className="text-soc-muted">
              For security compliance in this local SOC environment, you can use the pre-configured credentials:
            </p>
            <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded space-y-1 text-[11px] text-emerald-800 font-semibold">
              <p>• Admin: <code>Admin@MailTrace2025!</code></p>
              <p>• Analyst: <code>Analyst@MailTrace2025!</code></p>
              <p>• Viewer: <code>Viewer@MailTrace2025!</code></p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
