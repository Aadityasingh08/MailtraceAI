import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type BackgroundStyle = 'obsidian' | 'midnight-navy' | 'pure-black' | 'warm-charcoal' | 'clean-slate' | 'crisp-white';
export type ColorTheme = 'onyx-amber' | 'linear-mono' | 'nordic-sage' | 'cyber-cyan' | 'matrix-emerald' | 'arctic-light';

export interface BackgroundOption {
  id: BackgroundStyle;
  name: string;
  subtitle: string;
  bgHex: string;
  cardHex: string;
  isDark: boolean;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'obsidian',
    name: 'Obsidian Velvet',
    subtitle: 'Deep Matte Dark — High Contrast & Maximum Readability',
    bgHex: '#0B0D13',
    cardHex: '#131822',
    isDark: true,
  },
  {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    subtitle: 'Rich Oceanic Blue — Executive SOC Ambiance',
    bgHex: '#0A1020',
    cardHex: '#101C38',
    isDark: true,
  },
  {
    id: 'pure-black',
    name: 'Pure OLED Black',
    subtitle: 'Absolute Pitch Black — Ultra Sharp Elements',
    bgHex: '#000000',
    cardHex: '#0E0E12',
    isDark: true,
  },
  {
    id: 'warm-charcoal',
    name: 'Warm Charcoal',
    subtitle: 'Earthy Matte Gray — Soft on the Eyes',
    bgHex: '#121316',
    cardHex: '#1B1C22',
    isDark: true,
  },
  {
    id: 'clean-slate',
    name: 'Daylight Slate (Light)',
    subtitle: 'Soft Clean Light — Crystal Clear Sunlight Visibility',
    bgHex: '#F1F5F9',
    cardHex: '#FFFFFF',
    isDark: false,
  },
  {
    id: 'crisp-white',
    name: 'Crisp Studio White (Light)',
    subtitle: 'Pure Clean Paper White — Maximum Brightness',
    bgHex: '#FFFFFF',
    cardHex: '#F8FAFC',
    isDark: false,
  },
];

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
  theme: ThemeMode; // 'dark' | 'light'
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  
  bgStyle: BackgroundStyle;
  setBgStyle: (bg: BackgroundStyle) => void;

  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Mode: dark or light
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('mailtrace_mode') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  // Background Style
  const [bgStyle, setBgStyleState] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem('mailtrace_bg') as BackgroundStyle | null;
    if (saved && BACKGROUND_OPTIONS.some(b => b.id === saved)) return saved;
    return 'obsidian';
  });

  // Accent Color Theme
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('mailtrace_color_theme') as ColorTheme | null;
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) return saved;
    return 'onyx-amber';
  });

  // Sync with document element and localStorage
  useEffect(() => {
    const root = document.documentElement;

    // 1. Dark/Light class & colorScheme
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // 2. Background data attribute
    root.setAttribute('data-bg', bgStyle);

    // 3. Accent theme class
    THEME_OPTIONS.forEach(t => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${colorTheme}`);

    // Persist
    localStorage.setItem('mailtrace_mode', theme);
    localStorage.setItem('mailtrace_theme', theme);
    localStorage.setItem('mailtrace_bg', bgStyle);
    localStorage.setItem('mailtrace_color_theme', colorTheme);
  }, [theme, bgStyle, colorTheme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'light') {
        setBgStyleState('clean-slate');
      } else {
        setBgStyleState('obsidian');
      }
      return next;
    });
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (mode === 'light') {
      setBgStyleState('clean-slate');
    } else {
      setBgStyleState('obsidian');
    }
  };

  const setBgStyle = (bg: BackgroundStyle) => {
    setBgStyleState(bg);
    const opt = BACKGROUND_OPTIONS.find(b => b.id === bg);
    if (opt) {
      setThemeState(opt.isDark ? 'dark' : 'light');
    }
  };

  const setColorTheme = (t: ColorTheme) => {
    setColorThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme, 
      bgStyle, 
      setBgStyle, 
      colorTheme, 
      setColorTheme 
    }}>
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
