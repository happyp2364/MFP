import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { HomepagePreset, HomepageConfig } from '../../../types';
import { HomepageRenderer } from '../../Customer/HomepageRenderer';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: HomepagePreset | null;
  onApply: (config: Partial<HomepageConfig>) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  preset,
  onApply,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | 'auto'>('auto');

  if (!isOpen || !preset) return null;

  const configToRender: HomepageConfig = {
    id: preset.id || 'preview_config',
    name: preset.name,
    presetName: preset.name,
    themeMode:
      themeOverride === 'auto'
        ? preset.config.themeMode || 'light'
        : themeOverride === 'dark'
        ? 'dark'
        : 'light',
    sections: (preset.config.sections || []) as any,
    updatedAt: new Date().toISOString(),
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] min-h-[667px]';
      case 'tablet':
        return 'w-[768px] min-h-[800px]';
      case 'desktop':
      default:
        return 'w-full max-w-6xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
              style={{ backgroundColor: preset.previewColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">{preset.name}</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-extrabold rounded-md border border-amber-500/30 uppercase">
                  {preset.badge || 'PRESET'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">{preset.description}</p>
            </div>
          </div>

          {/* Controls: Device & Theme */}
          <div className="flex items-center gap-3">
            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  device === 'desktop'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Desktop 1440px"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  device === 'tablet'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Tablet 768px"
              >
                <Tablet className="w-4 h-4" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  device === 'mobile'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Mobile 375px"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setThemeOverride('light')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  themeOverride === 'light'
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setThemeOverride('dark')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  themeOverride === 'dark'
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={() => {
                onApply(preset.config);
                onClose();
              }}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Zap className="w-4 h-4 fill-current" /> Apply Template
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="flex-1 bg-neutral-950/60 p-4 overflow-y-auto flex justify-center items-start">
          <div
            className={`${getDeviceWidth()} transition-all duration-300 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden my-auto min-h-[500px]`}
          >
            {/* Top Frame bar */}
            <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-neutral-500 font-sans font-bold">
                Live Simulator ({device.toUpperCase()})
              </span>
              <span className="text-amber-400 font-bold">{preset.name}</span>
            </div>

            {/* Homepage Content Stream */}
            <div className="p-2 sm:p-4">
              <HomepageRenderer previewConfig={configToRender} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
