import React from 'react';
import { Volume2, VolumeX, X, Music, Check, Play } from 'lucide-react';
import { CustomerSoundSettings, SoundType } from '../../types';
import { playSound } from '../../utils/audio';
import { useStore } from '../../context/StoreContext';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: CustomerSoundSettings;
  onUpdateSettings?: (newSettings: CustomerSoundSettings) => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  settings: propSettings,
  onUpdateSettings: propOnUpdateSettings,
}) => {
  const store = useStore();
  
  if (!isOpen) return null;

  const activeSettings: CustomerSoundSettings = propSettings || store.customerSoundSettings || {
    muted: false,
    volume: 80,
    enabledTypes: {},
  };

  const handleUpdate = propOnUpdateSettings || store.updateCustomerSoundSettings;

  const handleToggleMute = () => {
    const isMuted = !!activeSettings.muted;
    handleUpdate?.({ ...activeSettings, muted: !isMuted });
    if (isMuted) {
      playSound('click');
    }
  };

  const handleVolumeChange = (vol: number) => {
    handleUpdate?.({ ...activeSettings, volume: vol, muted: vol === 0 });
  };

  const handleTest = (type: SoundType) => {
    playSound(type);
  };

  const isMuted = !!activeSettings.muted;
  const currentVolume = activeSettings.volume ?? 80;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Website Sound Settings</h3>
              <p className="text-xs text-neutral-500">Customize your audio experience</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mute Switch */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
          <div className="flex items-center gap-3">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-emerald-600" />
            )}
            <div>
              <span className="text-sm font-bold text-neutral-800">Website Sounds</span>
              <p className="text-[11px] text-neutral-500">
                {isMuted ? 'All website sounds are currently muted' : 'Audio effects enabled'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!isMuted}
              onChange={handleToggleMute}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
          </label>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" /> Sound Volume
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              {isMuted ? 0 : currentVolume}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            disabled={isMuted}
            value={isMuted ? 0 : currentVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-40"
          />
        </div>

        {/* Sound Previews */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-neutral-700">Test Sound Feedback:</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTest('click')}
              className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-200 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-3 h-3 text-emerald-600" /> Click
            </button>
            <button
              onClick={() => handleTest('addToCart')}
              className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-200 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-3 h-3 text-amber-600" /> Cart
            </button>
            <button
              onClick={() => handleTest('orderSuccess')}
              className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-emerald-50 hover:border-emerald-200 text-neutral-800 text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Play className="w-3 h-3 text-emerald-600" /> Bell
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
