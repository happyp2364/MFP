import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, Clock, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeToggleWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { themeMode, setThemeMode, activePeriod, isDark, activeMood } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPeriodLabel = () => {
    switch (activeMood) {
      case 'morning':
        return 'Morning Horizon';
      case 'afternoon':
        return 'Afternoon Forest';
      case 'evening':
        return 'Sunset Twilight';
      case 'night':
        return 'Midnight Navy';
      case 'rain':
        return 'Rainy Atmosphere';
      case 'diwali':
        return 'Festive Diwali';
      case 'christmas':
        return 'Christmas Snowy Vibe';
      case 'holi':
        return 'Playful Holi Colors';
      case 'new_year':
        return 'New Year Gala';
      case 'independence_day':
        return 'National Pride Theme';
      default:
        return 'Custom Canvas';
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${themeMode} (${getPeriodLabel()})`}
        className={`flex items-center space-x-1.5 rounded-full backdrop-blur-md transition-all duration-300 border ${
          isDark
            ? 'bg-neutral-900/80 border-amber-500/30 text-amber-200 hover:bg-neutral-800'
            : 'bg-white/80 border-amber-200/80 text-amber-900 hover:bg-amber-50/80'
        } ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow'}`}
      >
        {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />}
        {themeMode === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        {themeMode === 'auto' && <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}

        {!compact && (
          <span className="capitalize font-semibold text-[11px] tracking-wide">
            {themeMode === 'auto' ? `Auto • ${activeMood}` : themeMode}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 rounded-2xl p-2 shadow-2xl border backdrop-blur-2xl transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isDark
              ? 'bg-neutral-900/95 border-amber-500/20 text-neutral-100 shadow-black/80'
              : 'bg-white/95 border-amber-200/80 text-neutral-900 shadow-amber-900/10'
          }`}
        >
          <div className="px-3 py-2 border-b border-amber-500/10 mb-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
              Appearance & Time Sync
            </p>
            <p className="text-xs font-medium text-neutral-500">
              Active: <strong className="capitalize text-amber-800">{getPeriodLabel()}</strong>
            </p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setThemeMode('auto');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                themeMode === 'auto'
                  ? 'bg-amber-500/15 text-amber-700 font-bold'
                  : 'hover:bg-amber-500/10 text-neutral-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="leading-tight">Auto (Time-based)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Syncs with local device time
                  </div>
                </div>
              </div>
              {themeMode === 'auto' && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            <button
              onClick={() => {
                setThemeMode('light');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                themeMode === 'light'
                  ? 'bg-amber-500/15 text-amber-700 font-bold'
                  : 'hover:bg-amber-500/10 text-neutral-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Luxury</span>
              </div>
              {themeMode === 'light' && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            <button
              onClick={() => {
                setThemeMode('dark');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors ${
                themeMode === 'dark'
                  ? 'bg-amber-500/15 text-amber-700 font-bold'
                  : 'hover:bg-amber-500/10 text-neutral-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Midnight Dark</span>
              </div>
              {themeMode === 'dark' && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
