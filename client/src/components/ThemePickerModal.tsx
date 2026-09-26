import React from 'react';
import { X, Check, Sparkles, Moon, Sun, Layers, Paintbrush } from 'lucide-react';
import { useTheme, THEME_OPTIONS, BACKGROUND_OPTIONS, BackgroundStyle } from '../context/ThemeContext';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, setTheme, bgStyle, setBgStyle, colorTheme, setColorTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-soc-card border border-soc-border shadow-2xl p-6 relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px -5px var(--soc-border-glow)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-soc-border">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2.5 rounded-xl border border-soc-border flex items-center justify-center shadow-inner"
              style={{ background: 'var(--soc-secondary)' }}
            >
              <Sparkles className="w-5 h-5 text-soc-accent animate-pulse" style={{ color: 'var(--soc-accent)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-soc-text flex items-center gap-2">
                Display & Background Appearance
              </h2>
              <p className="text-xs text-soc-muted">
                Customize your background atmosphere and accent palette for maximum visibility and eye comfort.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-soc-muted hover:text-soc-text hover:bg-soc-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Quick Light / Dark Mode Toggle */}
        <div className="my-5 p-4 rounded-xl border border-soc-border bg-soc-secondary/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-soc-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              1. Theme Mode (Dark or Light)
            </span>
            <span className="text-[11px] font-mono font-bold text-soc-muted">
              Current: <span className="text-soc-accent uppercase">{theme}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl border font-bold text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-soc-card border-soc-accent text-white shadow-lg ring-1 ring-soc-accent'
                  : 'bg-soc-card/50 border-soc-border text-soc-muted hover:text-soc-text hover:border-soc-borderStrong'
              }`}
            >
              <Moon className="w-4 h-4 text-amber-400" />
              <span>🌙 Dark Mode (Eye Comfort)</span>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-soc-accent ml-auto" />}
            </button>

            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center space-x-2.5 py-3 px-4 rounded-xl border font-bold text-xs transition-all ${
                theme === 'light'
                  ? 'bg-white border-sky-500 text-slate-900 shadow-lg ring-1 ring-sky-500'
                  : 'bg-soc-card/50 border-soc-border text-soc-muted hover:text-soc-text hover:border-soc-borderStrong'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>☀️ Light Mode (Clean Sunlight)</span>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-sky-600 ml-auto" />}
            </button>
          </div>
        </div>

        {/* Section 2: Background Atmosphere Options */}
        <div className="my-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-soc-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-soc-accent" />
              2. Background Atmosphere Color
            </span>
            <span className="text-[10px] text-soc-muted font-mono">
              6 Options
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {BACKGROUND_OPTIONS.map((bg) => {
              const isSelected = bgStyle === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => setBgStyle(bg.id)}
                  className={`relative p-3 rounded-xl border text-left transition-all group ${
                    isSelected
                      ? 'border-soc-accent ring-2 ring-soc-accent/40 shadow-md'
                      : 'border-soc-border hover:border-soc-borderStrong'
                  }`}
                  style={{
                    backgroundColor: bg.bgHex,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: bg.cardHex }}
                      />
                      <span className={`text-xs font-bold ${bg.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {bg.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${bg.isDark ? 'text-amber-400' : 'text-sky-600'}`} />
                    )}
                  </div>
                  <p className={`text-[10px] line-clamp-1 ${bg.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {bg.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Accent Color Palettes */}
        <div className="my-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-soc-text uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Paintbrush className="w-4 h-4 text-soc-accent" />
              3. Accent Color Palette
            </span>
            <span className="text-[10px] text-soc-muted font-mono">
              5 Styles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {THEME_OPTIONS.filter(o => o.id !== 'arctic-light').map((opt) => {
              const isSelected = colorTheme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setColorTheme(opt.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-soc-accent bg-soc-secondary ring-1 ring-soc-accent'
                      : 'border-soc-border bg-soc-secondary/50 hover:bg-soc-secondary'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: opt.accentColor }} 
                    />
                    <span className="text-xs font-bold text-soc-text truncate">
                      {opt.name.split(' ')[0]}
                    </span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${opt.gradientClass}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-soc-border flex items-center justify-between text-xs text-soc-muted">
          <span>Changes apply instantly & save to your browser</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--soc-accent) 0%, #2563EB 100%)',
            }}
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
