import React from 'react';
import { X, Check, Sparkles, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ColorTheme } from '../context/ThemeContext';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ isOpen, onClose }) => {
  const { colorTheme, setColorTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl rounded-2xl bg-soc-card border border-soc-border shadow-2xl p-6 relative overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px -5px var(--soc-border-glow)'
        }}
      >
        {/* Glow ambient background accent */}
        <div 
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'var(--soc-accent)' }}
        />

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
                Interface Color Themes
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-soc-border text-soc-muted">
                  5 Styles
                </span>
              </h2>
              <p className="text-xs text-soc-muted">
                Select your preferred visual atmosphere, contrast ratio, and SOC accent palette.
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

        {/* Theme Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {THEME_OPTIONS.map((opt) => {
            const isSelected = colorTheme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setColorTheme(opt.id)}
                className={`relative flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 group ${
                  isSelected
                    ? 'border-transparent ring-2 shadow-lg'
                    : 'border-soc-border hover:border-soc-borderStrong bg-soc-secondary/60 hover:bg-soc-secondary'
                }`}
                style={{
                  background: isSelected ? 'var(--soc-cardHover)' : undefined,
                  boxShadow: isSelected ? `0 0 20px -3px ${opt.accentColor}40` : undefined,
                  borderColor: isSelected ? opt.accentColor : undefined,
                }}
              >
                {/* Header row with color circles & badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white/20 transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: opt.accentColor }} 
                    />
                    <span className="font-semibold text-sm text-soc-text">
                      {opt.name}
                    </span>
                  </div>

                  {opt.isDark ? (
                    <Moon className="w-3.5 h-3.5 text-soc-muted" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>

                <p className="text-xs text-soc-muted mb-3">
                  {opt.subtitle}
                </p>

                {/* Color gradient preview strip */}
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-soc-border/50">
                  <div className="flex items-center space-x-1.5">
                    <div className={`h-2.5 w-16 rounded-full bg-gradient-to-r ${opt.gradientClass}`} />
                    <span className="text-[10px] font-mono text-soc-muted">
                      {opt.badge}
                    </span>
                  </div>

                  {isSelected && (
                    <span 
                      className="flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ 
                        color: opt.accentColor, 
                        backgroundColor: `${opt.accentColor}18`,
                        border: `1px solid ${opt.accentColor}40` 
                      }}
                    >
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info & close */}
        <div className="pt-3 border-t border-soc-border flex items-center justify-between text-xs text-soc-muted">
          <div className="flex items-center space-x-2">
            <Monitor className="w-3.5 h-3.5" />
            <span>Theme auto-saves to your local browser profile</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white font-medium text-xs transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, var(--soc-accent) 0%, #2563EB 100%)',
              boxShadow: '0 4px 15px -3px var(--soc-accent-glow)'
            }}
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
