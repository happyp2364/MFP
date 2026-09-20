import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface GlobalThemeToggleProps {
  variant?: 'pill' | 'segmented' | 'icon-only';
  className?: string;
}

export const GlobalThemeToggle: React.FC<GlobalThemeToggleProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { themeMode, setThemeMode, isDark, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/90 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-inner ${className}`}
        role="group"
        aria-label="Theme mode switcher"
      >
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            themeMode === 'light'
              ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Switch to Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            themeMode === 'dark'
              ? 'bg-neutral-900 text-white shadow-sm border border-neutral-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Switch to Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setThemeMode('auto')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            themeMode === 'auto'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/60 dark:border-neutral-700'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          title="Follow System / Time"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 sm:p-2.5 rounded-full border transition-all active:scale-95 flex items-center justify-center ${
          isDark
            ? 'bg-neutral-800/90 hover:bg-neutral-700 text-amber-400 border-neutral-700 shadow-sm'
            : 'bg-white/90 hover:bg-neutral-100 text-neutral-700 border-neutral-200 shadow-sm'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-700" />
        )}
      </button>
    );
  }

  // Default 'pill' variant: compact, highly polished 1-click toggle with icon and text
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs ${
        isDark
          ? 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-100 border-neutral-700'
          : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200/90'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold tracking-wide">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-[11px] font-semibold tracking-wide">Dark Mode</span>
        </>
      )}
    </button>
  );
};
