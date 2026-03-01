import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettings } from './SettingsContext';

type Theme = 'light' | 'dark';

interface ThemeColors {
  bg: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
  primary: string;
  primaryLight: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const accentColors = {
  indigo: {
    primary: '#6366f1',
    primaryLight: 'rgba(99, 102, 241, 0.1)',
  },
  emerald: {
    primary: '#10b981',
    primaryLight: 'rgba(16, 185, 129, 0.1)',
  },
  rose: {
    primary: '#f43f5e',
    primaryLight: 'rgba(244, 63, 94, 0.1)',
  },
};

const basePalette = {
  dark: {
    bg: '#050505',
    card: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    inputBg: 'rgba(255,255,255,0.05)',
  },
  light: {
    bg: '#FAFAFA',
    card: '#FFFFFF',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    inputBg: 'rgba(0,0,0,0.05)',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { accentColor } = useSettings();
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.setProperty('--primary', accentColors[accentColor].primary);
    root.style.setProperty('--primary-light', accentColors[accentColor].primaryLight);
    localStorage.setItem('theme', theme);
  }, [theme, accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const base = isDark ? basePalette.dark : basePalette.light;
  const accent = accentColors[accentColor];

  const colors: ThemeColors = {
    ...base,
    primary: accent.primary,
    primaryLight: accent.primaryLight,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
