import React, { useState } from 'react';
import {
  PartyPopper,
  Save,
  Check,
  Smartphone,
  Monitor,
  Volume2,
  Sliders,
  Play,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderCelebrationConfig } from '../../types';

export const OrderCelebrationSettingsView: React.FC = () => {
  const { orderCelebrationConfig, updateOrderCelebrationConfig, triggerGlobalCelebration } = useStore();

  const [config, setConfig] = useState<OrderCelebrationConfig>({ ...orderCelebrationConfig });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    const success = await updateOrderCelebrationConfig(config);
    setIsSaving(false);
  };

  const handleToggle = (field: keyof Omit<OrderCelebrationConfig, 'duration' | 'speed'>) => {
    setConfig((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      // Mutual exclusion for mobileOnly / desktopOnly
      if (field === 'mobileOnly' && next.mobileOnly) {
        next.desktopOnly = false;
      } else if (field === 'desktopOnly' && next.desktopOnly) {
        next.mobileOnly = false;
      }
      return next;
    });
  };

  const handleSelectSpeed = (speed: 'slow' | 'medium' | 'fast') => {
    setConfig((prev) => ({ ...prev, speed }));
  };

  const handleDurationChange = (duration: number) => {
    setConfig((prev) => ({ ...prev, duration: Math.max(1, duration) }));
  };

  const handleTestCelebration = () => {
    // Temp save active config to store for testing, then fire
    updateOrderCelebrationConfig(config).then(() => {
      triggerGlobalCelebration();
    });
  };

  return (
    <div className="space-y-6" id="celebration-settings-root">
      {/* Overview and Main Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <PartyPopper className="w-5 h-5" />
            </div>
            <h3 className="font-serif-heading font-bold text-lg text-neutral-800">Order Success Celebration</h3>
          </div>
          <p className="text-xs text-neutral-500">
            A premium full-screen reward experience post-checkout to delight customers and enhance brand satisfaction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggle('enabled')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.enabled ? 'bg-indigo-600' : 'bg-neutral-300'
            }`}
            id="celebration-toggle-btn"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <button
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0"
            id="celebration-save-btn"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Effect Toggles & Custom Testing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Effects Toggles */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
              <PartyPopper className="w-4 h-4 text-indigo-600" />
              Active Animation Effects
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.confetti}
                  onChange={() => handleToggle('confetti')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Dynamic Confetti Rain</p>
                  <p className="text-[10px] text-neutral-500">Multi-colored burst rain from the top corners</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.sparkles}
                  onChange={() => handleToggle('sparkles')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Interactive Sparkles</p>
                  <p className="text-[10px] text-neutral-500">Golden shimmering sparkles centered on the order id</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.balloons}
                  onChange={() => handleToggle('balloons')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Floating Balloons</p>
                  <p className="text-[10px] text-neutral-500">Colorful floating balloons ascending from the bottom</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.successAnimation}
                  onChange={() => handleToggle('successAnimation')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Checkmark Animation</p>
                  <p className="text-[10px] text-neutral-500">Smooth circular success mark entrance scale</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:bg-neutral-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.sound}
                  onChange={() => handleToggle('sound')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-neutral-800">Celebration sound effect</p>
                  <p className="text-[10px] text-neutral-500">Auditory sound cue matching the screen transition</p>
                </div>
              </label>
            </div>
          </div>

          {/* Test Live Sandbox */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-indigo-900">Live Calibration Sandbox</h5>
              <p className="text-[11px] text-indigo-700 leading-normal">
                Want to see how your customized celebration looks? Save and trigger the active sandbox canvas immediately.
              </p>
            </div>

            <button
              onClick={handleTestCelebration}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all shrink-0 self-start sm:self-center"
              id="celebration-test-btn"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Preview Effects</span>
            </button>
          </div>
        </div>

        {/* Right Column: Speed, Duration, Device constraints */}
        <div className="space-y-6">
          {/* Controls & Constraints */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-5">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Speed & Duration
            </h4>

            {/* Duration */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-neutral-700">
                <span>Animation Duration</span>
                <span>{config.duration} seconds</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={config.duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full accent-indigo-600 bg-neutral-100 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Speed selection */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-neutral-600">Animation Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {(['slow', 'medium', 'fast'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSelectSpeed(spd)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold border capitalize transition-all ${
                      config.speed === spd
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Device constraint filtering */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-neutral-800 uppercase tracking-wider pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Device Targeting
            </h4>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs text-neutral-700">Mobile Devices Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.mobileOnly}
                  onChange={() => handleToggle('mobileOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 hover:bg-neutral-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs text-neutral-700">Desktop Screens Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.desktopOnly}
                  onChange={() => handleToggle('desktopOnly')}
                  className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
