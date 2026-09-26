import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  History, 
  Globe, 
  Settings, 
  LogOut, 
  User as UserIcon, 
  Play, 
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { CommandPaletteModal } from './CommandPaletteModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/investigate', label: 'Investigate', icon: Search },
    { to: '/cases', label: 'Cases', icon: Briefcase },
    { to: '/history', label: 'History', icon: History },
    { to: '/intelligence', label: 'Threat Intel', icon: Globe },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLoadDemo = async (sampleId: string) => {
    setDemoMenuOpen(false);
    setLoadingDemo(true);
    try {
      const res = await api.loadDemo(sampleId);
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      alert(`Failed to load demo: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              <div className="relative p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 group-hover:border-emerald-500 transition-colors">
                <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-white">MAILTRACE</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide uppercase font-mono hidden sm:block font-medium">
                  Forensic Intelligence Platform
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center space-x-2">
              
              {/* Command Palette Trigger */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400 transition-colors"
                title="Open Command Palette (Ctrl + K)"
              >
                <Command className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden xl:inline">Search</span>
                <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600">
                  Ctrl K
                </kbd>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Dark and Light theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-700 animate-in spin-in-90" />
                )}
              </button>

              {/* Live SOC Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-bold tracking-wider">
                  SOC ONLINE
                </span>
              </div>

              {/* Quick Demo Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  disabled={loadingDemo}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm"
                  title="Load safe sample email for inspection"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-emerald-700 dark:text-emerald-400" />
                  <span className="hidden md:inline">{loadingDemo ? 'Loading...' : 'Demo Samples'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                        Select Demo Forensic Corpus
                      </span>
                    </div>
                    <button
                      onClick={() => handleLoadDemo('demo-phishing-m365')}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-red-50 dark:hover:bg-red-950/40 flex items-start space-x-2.5 transition-colors group"
                    >
                      <span className="text-base leading-none mt-0.5">⚠️</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-700 dark:group-hover:text-red-400">
                          Phishing (M365 Harvester)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Display name spoofing, lookalike domain</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleLoadDemo('demo-bec-wire-transfer')}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-start space-x-2.5 transition-colors group"
                    >
                      <span className="text-base leading-none mt-0.5">💼</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          BEC (Wire Transfer Fraud)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Executive impersonation & reply divert</p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleLoadDemo('demo-benign-meeting')}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-start space-x-2.5 transition-colors group"
                    >
                      <span className="text-base leading-none mt-0.5">✅</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          Benign (Calendar Invite)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Legitimate Google meeting invitation</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Profile / Auth */}
              {user ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">{user.name}</p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                      user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                      user.role === 'ANALYST' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile / Tablet Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile / Tablet Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Command Palette Modal */}
      <CommandPaletteModal 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />
    </>
  );
};
