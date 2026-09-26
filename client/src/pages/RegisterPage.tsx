import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ANALYST' | 'VIEWER'>('ANALYST');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-soc-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel-glow p-8 rounded-2xl border border-soc-border shadow-2xl relative z-10 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-600 shadow-sm">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create SOC Analyst Profile</h2>
          <p className="text-xs text-soc-muted font-mono">Join the MailTrace AI threat intelligence and forensics platform</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-700 uppercase mb-1 font-semibold">Full Name / Call-Sign</label>
            <div className="relative">
              <User className="w-4 h-4 text-soc-muted absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Senior SOC Analyst"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 uppercase mb-1 font-semibold">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-soc-muted absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@enterprise-soc.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 uppercase mb-1 font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-soc-muted absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 placeholder-soc-muted focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 uppercase mb-1 font-semibold">Requested Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-white border border-soc-border text-slate-900 focus:outline-none focus:border-emerald-500 font-mono shadow-sm"
            >
              <option value="ANALYST">ANALYST (Full forensic investigations & reports)</option>
              <option value="VIEWER">VIEWER (Read-only dossier auditing)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all"
          >
            {submitting ? 'Registering...' : 'Register Profile'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-soc-muted font-mono">
          <span>Already registered? </span>
          <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};
