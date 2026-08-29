import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Save,
  Check,
  Upload,
  Sparkles,
  MousePointer,
  ShoppingBag,
  Heart,
  CheckCircle2,
  Bell,
  AlertCircle,
  LogIn,
  LogOut,
  Sliders,
  Music,
} from 'lucide-react';
import { SoundConfig, SoundType } from '../../types';
import { playSound, DEFAULT_SOUND_CONFIG } from '../../utils/audio';

interface SoundSettingsViewProps {
  config: SoundConfig;
  onSave: (updatedConfig: SoundConfig) => void;
  isSaving?: boolean;
}

const SOUND_TYPE_INFO: {
  type: SoundType;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'click',
    title: 'Button Click',
    description: 'Soft luxury tactile UI click on buttons, categories, and menus',
    icon: <MousePointer className="w-4 h-4 text-emerald-600" />,
  },
  {
    type: 'hover',
    title: 'Desktop Hover',
    description: 'Whisper-soft 20ms micro-tick when hovering over cards (Desktop only)',
    icon: <Sliders className="w-4 h-4 text-cyan-600" />,
  },
  {
    type: 'addToCart',
    title: 'Add to Cart',
    description: 'Soft luxury dual-tone confirmation chime when adding items',
    icon: <ShoppingBag className="w-4 h-4 text-amber-600" />,
  },
  {
    type: 'wishlist',
    title: 'Wishlist Toggle',
    description: 'Sweet sparkle tone when adding or removing wishlist favorites',
    icon: <Heart className="w-4 h-4 text-rose-600" />,
  },
  {
    type: 'paymentSuccess',
    title: 'Payment Success',
    description: 'Premium success chime after verified payment authorization',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  {
    type: 'orderSuccess',
    title: 'Order Success',
    description: 'Calm, elegant grand bell chime after successful order placement',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
  },
  {
    type: 'notification',
    title: 'Notification Alert',
    description: 'Subtle double-chime for offers, updates, and order alerts',
    icon: <Bell className="w-4 h-4 text-blue-600" />,
  },
  {
    type: 'error',
    title: 'Gentle Error',
    description: 'Soft low-frequency warm tone for failed inputs or validation errors',
    icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
  },
  {
    type: 'login',
    title: 'Admin / User Login',
    description: 'Uplifting ascending chime upon successful login',
    icon: <LogIn className="w-4 h-4 text-indigo-600" />,
  },
  {
    type: 'logout',
    title: 'Account Logout',
    description: 'Gentle descending tone upon logging out',
    icon: <LogOut className="w-4 h-4 text-neutral-600" />,
  },
];

export const SoundSettingsView: React.FC<SoundSettingsViewProps> = ({
  config,
  onSave,
  isSaving = false,
}) => {
  const [localConfig, setLocalConfig] = useState<SoundConfig>({
    ...DEFAULT_SOUND_CONFIG,
    ...config,
    customSoundUrls: { ...(config?.customSoundUrls || {}) },
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingType, setTestingType] = useState<SoundType | null>(null);

  const handleToggleGlobal = (enabled: boolean) => {
    setLocalConfig((prev) => ({ ...prev, enabled }));
  };

  const handleVolumeChange = (vol: number) => {
    setLocalConfig((prev) => ({ ...prev, masterVolume: vol }));
  };

  const handleCustomUrlChange = (type: SoundType, url: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      customSoundUrls: {
        ...prev.customSoundUrls,
        [type]: url,
      },
    }));
  };

  const handleFileUpload = (type: SoundType, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        handleCustomUrlChange(type, dataUri);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestSound = (type: SoundType) => {
    setTestingType(type);
    playSound(type);
    setTimeout(() => {
      setTestingType(null);
    }, 400);
  };

  const handleResetDefaults = () => {
    setLocalConfig({ ...DEFAULT_SOUND_CONFIG });
  };

  const handleSave = () => {
    onSave(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-neutral-900 to-black text-white p-6 rounded-2xl border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Music className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Website Sound Experience Engine
              </h2>
            </div>
            <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
              Configure luxury sound feedback across all interactive controls, buttons, orders, and payment steps. All sounds are non-intrusive, zero-latency, and customizable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition border border-white/10 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Global Controls Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${localConfig.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {localConfig.enabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Global Website Sound Master Switch</h3>
              <p className="text-xs text-neutral-500">Enable or mute all automated audio feedback for all customers and admins</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleToggleGlobal(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* Master Volume Slider & Category Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Master Volume */}
          <div className="space-y-2 bg-neutral-50/80 p-4 rounded-xl border border-neutral-200/60">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" /> Master Audio Volume
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {localConfig.masterVolume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={localConfig.masterVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>Muted (0%)</span>
              <span>Soft (50%)</span>
              <span>Maximum (100%)</span>
            </div>
          </div>

          {/* Quick Sub-Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 transition">
              <input
                type="checkbox"
                checked={localConfig.enableButtonClicks}
                onChange={(e) => setLocalConfig((prev) => ({ ...prev, enableButtonClicks: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-medium text-neutral-800">Button Click Sound</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 transition">
              <input
                type="checkbox"
                checked={localConfig.enableHoverSounds}
                onChange={(e) => setLocalConfig((prev) => ({ ...prev, enableHoverSounds: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-medium text-neutral-800">Desktop Hover Sound</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 transition">
              <input
                type="checkbox"
                checked={localConfig.enableAddToCartSounds}
                onChange={(e) => setLocalConfig((prev) => ({ ...prev, enableAddToCartSounds: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-medium text-neutral-800">Add to Cart Sound</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 cursor-pointer hover:bg-neutral-100/50 transition">
              <input
                type="checkbox"
                checked={localConfig.enableOrderSuccessSounds}
                onChange={(e) => setLocalConfig((prev) => ({ ...prev, enableOrderSuccessSounds: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-medium text-neutral-800">Order Success Bell</span>
            </label>
          </div>
        </div>
      </div>

      {/* Sound Types Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Music className="w-4 h-4 text-emerald-600" /> Configure & Test Individual Sound Effects
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOUND_TYPE_INFO.map((item) => {
            const customUrl = localConfig.customSoundUrls?.[item.type] || '';
            const isTesting = testingType === item.type;

            return (
              <div
                key={item.type}
                className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm hover:border-emerald-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{item.title}</h4>
                      <p className="text-[11px] text-neutral-500 leading-snug">{item.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestSound(item.type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                      isTesting
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                    title="Test play this sound effect"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} /> Test
                  </button>
                </div>

                {/* Custom Sound File or URL */}
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600">
                    <span>Custom Audio File / URL (Optional)</span>
                    {customUrl && (
                      <button
                        onClick={() => handleCustomUrlChange(item.type, '')}
                        className="text-rose-600 hover:underline text-[10px]"
                      >
                        Remove Custom Audio
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://... audio URL or default synth"
                      value={customUrl}
                      onChange={(e) => handleCustomUrlChange(item.type, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <input
                      id={`sound_file_${item.type}`}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(item.type, e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                      className="sr-only hidden"
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`sound_file_${item.type}`)?.click()}
                      className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer border border-neutral-300 flex items-center gap-1 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
