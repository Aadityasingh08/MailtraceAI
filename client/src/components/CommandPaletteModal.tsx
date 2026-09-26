import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  ShieldAlert, 
  Briefcase, 
  History, 
  Globe, 
  Settings, 
  Moon, 
  Sun, 
  Play, 
  ArrowRight, 
  X,
  Terminal,
  Command,
  QrCode,
  Skull,
  Zap,
  Palette
} from 'lucide-react';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext';
import { api } from '../services/api';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loadingDemo, setLoadingDemo] = useState(false);
  const navigate = useNavigate();
  const { theme, colorTheme, setColorTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLoadDemo = async (sampleId: string) => {
    setLoadingDemo(true);
    try {
      const res = await api.loadDemo(sampleId);
      onClose();
      navigate(`/investigate/${res.investigationId}`);
    } catch (err: any) {
      alert(`Failed to load demo: ${err.message}`);
    } finally {
      setLoadingDemo(false);
    }
  };

  const actions = [
    { id: 'investigate', title: 'New Threat Investigation', category: 'Navigation', icon: ShieldAlert, action: () => handleNavigate('/investigate') },
    { id: 'dashboard', title: 'SOC Telemetry Dashboard', category: 'Navigation', icon: LayoutDashboard, action: () => handleNavigate('/dashboard') },
    { id: 'cases', title: 'Incident Case Management', category: 'Navigation', icon: Briefcase, action: () => handleNavigate('/cases') },
    { id: 'history', title: 'Historical Threat Archive', category: 'Navigation', icon: History, action: () => handleNavigate('/history') },
    { id: 'intel', title: 'Threat Intelligence & IP Reputation', category: 'Navigation', icon: Globe, action: () => handleNavigate('/intelligence') },
    { id: 'settings', title: 'System & API Settings', category: 'Navigation', icon: Settings, action: () => handleNavigate('/settings') },
    { id: 'tool-quishing', title: 'Quishing (QR Code) Forensic Scanner', category: 'Forensic Tools', icon: QrCode, action: () => handleNavigate('/investigate') },
    { id: 'tool-apt', title: 'Threat Actor Attribution (Lazarus, FIN7, APT29)', category: 'Forensic Tools', icon: Skull, action: () => handleNavigate('/investigate') },
    { id: 'tool-soar', title: 'Automated SOAR Incident Playbook', category: 'Forensic Tools', icon: Zap, action: () => handleNavigate('/investigate') },
    { 
      id: 'theme', 
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, 
      category: 'Preferences', 
      icon: theme === 'dark' ? Sun : Moon, 
      action: () => { toggleTheme(); onClose(); } 
    },
    ...THEME_OPTIONS.map(opt => ({
      id: `theme-${opt.id}`,
      title: `Theme: ${opt.name} (${opt.subtitle})`,
      category: 'Themes & Visuals',
      icon: Palette,
      action: () => { setColorTheme(opt.id); onClose(); }
    })),
    { id: 'demo-phishing', title: 'Simulate Phishing (M365 Harvester)', category: 'Quick Demo', icon: Play, action: () => handleLoadDemo('demo-phishing-m365') },
    { id: 'demo-bec', title: 'Simulate BEC (Wire Transfer Fraud)', category: 'Quick Demo', icon: Play, action: () => handleLoadDemo('demo-bec-wire-transfer') },
    { id: 'demo-benign', title: 'Simulate Benign (Meeting Invite)', category: 'Quick Demo', icon: Play, action: () => handleLoadDemo('demo-benign-meeting') },
  ];

  const filteredActions = actions.filter(a => 
    a.title.toLowerCase().includes(query.toLowerCase()) || 
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 transition-colors">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, page name, or forensic action..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 ? (
            filteredActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 text-slate-600 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                        {action.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {action.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No matching commands or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center space-x-2">
            <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↑↓</kbd></span>
            <span>Select: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↵</kbd></span>
          </div>
          <span>MailTrace Command Palette</span>
        </div>

      </div>
    </div>
  );
};
