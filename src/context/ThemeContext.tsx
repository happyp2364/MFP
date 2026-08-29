import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activePeriod: TimePeriod;
  isDark: boolean;
  backgroundGradientClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mfp_theme_mode_pref';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
    return 'auto';
  });

  const [activePeriod, setActivePeriod] = useState<TimePeriod>('afternoon');

  // Calculate local time period
  const calculateTimePeriod = (): TimePeriod => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  useEffect(() => {
    const period = calculateTimePeriod();
    setActivePeriod(period);

    // Update time period every 2 minutes
    const interval = setInterval(() => {
      setActivePeriod(calculateTimePeriod());
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
  };

  // Determine if effectively dark theme
  const isDark =
    themeMode === 'dark' || (themeMode === 'auto' && activePeriod === 'night');

  // Sync dark class on root document element for Tailwind & accessibility selectors
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Compute dynamic background gradient based on period and theme override
  let backgroundGradientClass = 'bg-[#FAFAFA] text-neutral-900';

  if (isDark) {
    backgroundGradientClass =
      'bg-gradient-to-br from-[#0B132B] via-[#0D1B2A] to-[#1C2541] text-neutral-100';
  } else if (themeMode === 'auto') {
    switch (activePeriod) {
      case 'morning':
        // Soft Sky Blue, Warm White, Gentle Emerald Light
        backgroundGradientClass =
          'bg-gradient-to-br from-[#F0F7FF] via-[#FBF9F5] to-[#E8F5E9] text-neutral-900';
        break;
      case 'afternoon':
        // Crisp White, Forest Green, Soft Grey
        backgroundGradientClass =
          'bg-gradient-to-br from-[#FAFAFA] via-[#F4F8F5] to-[#EFEFEF] text-neutral-900';
        break;
      case 'evening':
        // Warm Orange/Amber twilight, Warm Grey, Soft Dusk Blue
        backgroundGradientClass =
          'bg-gradient-to-br from-[#FFF7ED] via-[#FAF5EE] to-[#EEF2FF] text-neutral-900';
        break;
      case 'night':
        // Deep Navy, Dark Forest Green, Charcoal
        backgroundGradientClass =
          'bg-gradient-to-br from-[#0B132B] via-[#0D1B2A] to-[#1C2541] text-neutral-100';
        break;
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        activePeriod,
        isDark,
        backgroundGradientClass,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
