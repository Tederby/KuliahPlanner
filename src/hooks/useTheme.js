import { useState, useEffect, useCallback } from 'react';

export const COLOR_PRESETS = [
  { id: 'indigo', name: 'Ungu / Indigo', hex: '#6366f1' },
  { id: 'amber', name: 'Oranye', hex: '#f97316' },
  { id: 'emerald', name: 'Hijau', hex: '#10b981' },
  { id: 'rose', name: 'Merah', hex: '#ef4444' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4' },
  { id: 'violet', name: 'Violet', hex: '#8b5cf6' },
  { id: 'monochrome', name: 'Monochrome', hex: '#71717a' },
];

const THEME_MODE_KEY = 'kuliahplanner_theme_mode';
const ACCENT_COLOR_KEY = 'kuliahplanner_accent_color';
const MONOCHROME_KEY = 'kuliahplanner_is_monochrome';

// Helper to convert HEX to HSL
export function hexToHsl(hex) {
  if (!hex || hex.length < 7) return { h: 244, s: 79, l: 59 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h = h * 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Helper to determine text contrast based on background hex
export function getContrastColor(hex) {
  if (!hex || hex.length < 7) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 165 ? '#0f172a' : '#ffffff';
}

// Compute full palette dictionary given hex, monochrome flag, and dark mode state
export function generateThemePalette(hex, isMono, isDark) {
  if (isMono) {
    if (isDark) {
      return {
        '--theme-bg': '#09090b',
        '--theme-surface': '#121215',
        '--theme-surface-subtle': '#1a1a1f',
        '--theme-border': '#2a2a32',
        '--theme-border-subtle': '#1e1e24',
        '--theme-text': '#f4f4f5',
        '--theme-muted': '#90909c',
        '--accent-primary': '#e4e4e7',
        '--accent-hover': '#f4f4f5',
        '--accent-text': '#e4e4e7',
        '--accent-subtle': 'rgba(244, 244, 245, 0.10)',
        '--accent-border': 'rgba(244, 244, 245, 0.20)',
        '--accent-contrast': '#09090b',
      };
    }
    return {
      '--theme-bg': '#f1f1f4',
      '--theme-surface': '#fafafc',
      '--theme-surface-subtle': '#e2e2e7',
      '--theme-border': '#c6c6cf',
      '--theme-border-subtle': '#d8d8de',
      '--theme-text': '#121215',
      '--theme-muted': '#62626e',
      '--accent-primary': '#18181b',
      '--accent-hover': '#27272a',
      '--accent-text': '#18181b',
      '--accent-subtle': 'rgba(24, 24, 27, 0.08)',
      '--accent-border': 'rgba(24, 24, 27, 0.20)',
      '--accent-contrast': '#ffffff',
    };
  }

  const { h } = hexToHsl(hex);
  const contrast = getContrastColor(hex);

  if (isDark) {
    return {
      '--theme-bg': `hsl(${h}, 35%, 6.5%)`,
      '--theme-surface': `hsl(${h}, 28%, 11.5%)`,
      '--theme-surface-subtle': `hsl(${h}, 24%, 17%)`,
      '--theme-border': `hsl(${h}, 18%, 26%)`,
      '--theme-border-subtle': `hsl(${h}, 20%, 18%)`,
      '--theme-text': `hsl(${h}, 15%, 95%)`,
      '--theme-muted': `hsl(${h}, 15%, 65%)`,
      '--accent-primary': hex,
      '--accent-hover': `color-mix(in srgb, ${hex} 85%, white)`,
      '--accent-text': `hsl(${h}, 85%, 68%)`,
      '--accent-subtle': `color-mix(in srgb, ${hex} 14%, transparent)`,
      '--accent-border': `color-mix(in srgb, ${hex} 28%, transparent)`,
      '--accent-contrast': contrast,
    };
  }

  return {
    '--theme-bg': `hsl(${h}, 25%, 96%)`,
    '--theme-surface': `hsl(${h}, 20%, 99%)`,
    '--theme-surface-subtle': `hsl(${h}, 22%, 92%)`,
    '--theme-border': `hsl(${h}, 18%, 84%)`,
    '--theme-border-subtle': `hsl(${h}, 15%, 89%)`,
    '--theme-text': `hsl(${h}, 30%, 12%)`,
    '--theme-muted': `hsl(${h}, 15%, 45%)`,
    '--accent-primary': hex,
    '--accent-hover': `color-mix(in srgb, ${hex} 85%, black)`,
    '--accent-text': `hsl(${h}, 80%, 35%)`,
    '--accent-subtle': `color-mix(in srgb, ${hex} 12%, transparent)`,
    '--accent-border': `color-mix(in srgb, ${hex} 28%, transparent)`,
    '--accent-contrast': contrast,
  };
}

export function useTheme() {
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem(THEME_MODE_KEY) || 'system';
  });

  const [accentColor, setAccentColorState] = useState(() => {
    return localStorage.getItem(ACCENT_COLOR_KEY) || '#6366f1';
  });

  const [isMonochrome, setIsMonochromeState] = useState(() => {
    return localStorage.getItem(MONOCHROME_KEY) === 'true';
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(THEME_MODE_KEY) || 'system';
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Calculate and apply CSS variables and dark class
  const applyTheme = useCallback((mode, hex, mono, darkActive) => {
    const root = document.documentElement;

    // Apply dark class
    if (darkActive) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Generate and inject full palette
    const palette = generateThemePalette(hex, mono, darkActive);
    Object.entries(palette).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Ensure root and body background match to prevent overscroll rubber-band white flashes
    root.style.backgroundColor = palette['--theme-bg'];
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.backgroundColor = palette['--theme-bg'];
      document.body.style.color = palette['--theme-text'];
    }
  }, []);

  // Sync state whenever settings change
  useEffect(() => {
    let activeDark = isDark;
    if (themeMode === 'dark') {
      activeDark = true;
    } else if (themeMode === 'light') {
      activeDark = false;
    } else {
      activeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(activeDark);
    applyTheme(themeMode, accentColor, isMonochrome, activeDark);
  }, [themeMode, accentColor, isMonochrome, applyTheme, isDark]);

  // System media query listener
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (themeMode === 'system') {
        const sysDark = e.matches;
        setIsDark(sysDark);
        applyTheme('system', accentColor, isMonochrome, sysDark);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [themeMode, accentColor, isMonochrome, applyTheme]);

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_MODE_KEY, mode);
  };

  const setAccentColor = (hex) => {
    setIsMonochromeState(false);
    setAccentColorState(hex);
    localStorage.setItem(MONOCHROME_KEY, 'false');
    localStorage.setItem(ACCENT_COLOR_KEY, hex);
  };

  const setMonochrome = () => {
    setIsMonochromeState(true);
    localStorage.setItem(MONOCHROME_KEY, 'true');
  };

  return {
    themeMode,
    isDark,
    accentColor,
    isMonochrome,
    setThemeMode,
    setAccentColor,
    setMonochrome,
    COLOR_PRESETS,
  };
}
