import React, { createContext, useContext, useEffect, useState } from 'react';

export type ColorTheme = 'onyx-amber' | 'linear-mono' | 'nordic-sage' | 'cyber-cyan' | 'matrix-emerald' | 'arctic-light';
export type ThemeMode = 'light' | 'dark';

export interface ThemeOption {
  id: ColorTheme;
  name: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  gradientClass: string;
  isDark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'onyx-amber',
    name: 'Onyx Amber',
    subtitle: 'Warm Solar Amber & Titanium Matte (Linear & Palantir style)',
    badge: 'Bespoke / Unique',
    accentColor: '#F59E0B',
    gradientClass: 'from-amber-400 via-orange-400 to-amber-600',
    isDark: true,
  },
  {
    id: 'linear-mono',
    name: 'Linear Titanium',
    subtitle: 'Ultra-Crisp Swiss Carbon & Platinum Slate',
    badge: 'Minimalist',
    accentColor: '#E2E8F0',
    gradientClass: 'from-slate-200 via-zinc-400 to-slate-600',
    isDark: true,
  },
  {
    id: 'nordic-sage',
    name: 'Nordic Sage & Cedar',
    subtitle: 'Organic Eucalyptus Mist & Deep Earth Timber',
    badge: 'Organic',
    accentColor: '#14B8A6',
    gradientClass: 'from-teal-400 via-emerald-500 to-teal-700',
    isDark: true,
  },
  {
    id: 'cyber-cyan',
    name: 'Cyber Cyan',
    subtitle: 'Electric Cyan & Cosmic Void Space',
    badge: 'High-Tech',
    accentColor: '#06B6D4',
    gradientClass: 'from-cyan-500 via-teal-400 to-blue-600',
    isDark: true,
  },
  {
    id: 'matrix-emerald',
    name: 'Matrix Emerald',
    subtitle: 'Classic SOC Phosphor Green',
    badge: 'Classic',
    accentColor: '#10B981',
    gradientClass: 'from-emerald-500 via-green-400 to-teal-600',
    isDark: true,
  },
  {
    id: 'arctic-light',
    name: 'Swiss Studio Daylight',
    subtitle: 'Architectural Paper White & Deep Ink Charcoal',
    badge: 'Daylight',
    accentColor: '#0284C7',
    gradientClass: 'from-sky-500 via-blue-500 to-indigo-600',
    isDark: false,
  },
];

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  theme: ThemeMode; // 'light' | 'dark' for backward compatibility
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('mailtrace_color_theme') as ColorTheme | null;
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved;
    }
    // Default to the handcrafted Onyx Amber theme (Unique, no AI clichés)
    return 'onyx-amber';
  });

  const currentOption = THEME_OPTIONS.find(t => t.id === colorTheme) || THEME_OPTIONS[0];
  const themeMode: ThemeMode = currentOption.isDark ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    // Remove all previous theme classes
    THEME_OPTIONS.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
    });
    
    // Add current theme class
    root.classList.add(`theme-${colorTheme}`);

    if (currentOption.isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('mailtrace_color_theme', colorTheme);
    localStorage.setItem('mailtrace_theme', themeMode);
  }, [colorTheme, currentOption.isDark, themeMode]);

  const toggleTheme = () => {
    setColorThemeState(prev => (prev === 'arctic-light' ? 'onyx-amber' : 'arctic-light'));
  };

  const setTheme = (mode: ThemeMode) => {
    if (mode === 'light') {
      setColorThemeState('arctic-light');
    } else {
      setColorThemeState(prev => (prev === 'arctic-light' ? 'onyx-amber' : prev));
    }
  };

  const setColorTheme = (t: ColorTheme) => {
    setColorThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme, theme: themeMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
