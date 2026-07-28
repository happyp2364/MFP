import React, { useState } from 'react';
import {
  Sparkles,
  CloudSun,
  Volume2,
  VolumeX,
  Gauge,
  Calendar,
  Layers,
  Palette,
  CloudRain,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Moon,
  Sun,
  Flame,
  Gift,
  Zap,
  Smartphone,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { MoodType } from '../../types';

export const WebsiteMoodManagerView: React.FC = () => {
  const {
    moodConfig,
    updateMoodConfig,
    activeMood,
    weatherInfo,
    refreshWeather,
    localOverrideMood,
    setLocalOverrideMood,
  } = useTheme();

  // Local settings state
  const [isDynamicMoodEnabled, setIsDynamicMoodEnabled] = useState(moodConfig.isDynamicMoodEnabled);
  const [overrideMode, setOverrideMode] = useState(moodConfig.overrideMode);
  const [activeFestival, setActiveFestival] = useState(moodConfig.activeFestival);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState(moodConfig.customBackgroundUrl);
  const [customAnimationType, setCustomAnimationType] = useState(moodConfig.customAnimationType);
  const [customSoundUrl, setCustomSoundUrl] = useState(moodConfig.customSoundUrl);
  
  // Schedule state
  const [scheduleEnabled, setScheduleEnabled] = useState(moodConfig.scheduledTheme?.enabled ?? false);
  const [scheduleStart, setScheduleStart] = useState(moodConfig.scheduledTheme?.startDate ?? '');
  const [scheduleEnd, setScheduleEnd] = useState(moodConfig.scheduledTheme?.endDate ?? '');
  const [scheduleTheme, setScheduleTheme] = useState(moodConfig.scheduledTheme?.theme ?? 'afternoon');

  // Performance & sound settings
  const [enableAudio, setEnableAudio] = useState(moodConfig.enableAudio);
  const [audioVolume, setAudioVolume] = useState(moodConfig.audioVolume);
  const [lowEndReduction, setLowEndReduction] = useState(moodConfig.lowEndReduction);
  const [particleDensity, setParticleDensity] = useState(moodConfig.particleDensity ?? 1.0);

  // Status/feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const success = await updateMoodConfig({
      isDynamicMoodEnabled,
      overrideMode,
      activeFestival,
      customBackgroundUrl: customBackgroundUrl.trim(),
      customAnimationType,
      customSoundUrl: customSoundUrl.trim(),
      scheduledTheme: {
        enabled: scheduleEnabled,
        startDate: scheduleStart,
        endDate: scheduleEnd,
        theme: scheduleTheme,
      },
      enableAudio,
      audioVolume,
      lowEndReduction,
      particleDensity,
    });

    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save mood settings to Firestore database.');
    }
  };

  const handleScanWeather = async () => {
    setIsRefreshingWeather(true);
    await refreshWeather();
    setTimeout(() => setIsRefreshingWeather(false), 1000);
  };

  const PRESET_WALLPAPERS = [
    { name: 'Aurora Velvet', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Sunrise Pastel', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Muted Slate', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Golden Festive', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. Header description */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Dynamic Website Mood Engine
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automatically transition website color schemes, particle canvases, lighting grids, and soundscapes based on environmental factors.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">
              Live Atmosphere:{' '}
              <strong className="text-amber-700 capitalize">{activeMood}</strong>
            </span>
            {localOverrideMood !== 'none' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-red-100 text-red-700 rounded-full animate-pulse">
                Preview Mode Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Quick Preview Matrix */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-600" />
            Interactive Atmosphere Test Matrix (Local Previews)
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Click any capsule to preview how that aesthetic looks and sounds on your device immediately. Preview is local and won't affect other visitors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {/* Reset Preview Button */}
          <button
            onClick={() => setLocalOverrideMood('none')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all text-center ${
              localOverrideMood === 'none'
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            🔄 Sync Auto
          </button>

          {/* Morning */}
          <button
            onClick={() => setLocalOverrideMood('morning')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'morning'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'bg-amber-50/50 text-amber-800 hover:bg-amber-100/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            Sunrise
          </button>

          {/* Afternoon */}
          <button
            onClick={() => setLocalOverrideMood('afternoon')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'afternoon'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'bg-emerald-50/50 text-emerald-800 hover:bg-emerald-100/50'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            Noon Forest
          </button>

          {/* Evening */}
          <button
            onClick={() => setLocalOverrideMood('evening')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'evening'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                : 'bg-rose-50/50 text-rose-800 hover:bg-rose-100/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Twilight
          </button>

          {/* Night */}
          <button
            onClick={() => setLocalOverrideMood('night')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'night'
                ? 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-blue-950 text-white shadow-md'
                : 'bg-neutral-800/10 text-neutral-800 hover:bg-neutral-800/20'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            Midnight
          </button>

          {/* Rain */}
          <button
            onClick={() => setLocalOverrideMood('rain')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'rain'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'bg-cyan-50/50 text-cyan-800 hover:bg-cyan-100/50'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            Rainfall
          </button>

          {/* Diwali */}
          <button
            onClick={() => setLocalOverrideMood('diwali')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'diwali'
                ? 'bg-gradient-to-r from-[#EA580C] to-red-600 text-white shadow-md shadow-orange-500/10'
                : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Diwali
          </button>

          {/* Christmas */}
          <button
            onClick={() => setLocalOverrideMood('christmas')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'christmas'
                ? 'bg-gradient-to-r from-red-600 to-emerald-600 text-white shadow-md'
                : 'bg-red-50 text-red-800 hover:bg-red-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-emerald-600" />
            Christmas
          </button>

          {/* Holi */}
          <button
            onClick={() => setLocalOverrideMood('holi')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'holi'
                ? 'bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 text-white shadow-md'
                : 'bg-pink-50 text-pink-800 hover:bg-pink-100'
            }`}
          >
            🎨 Holi
          </button>

          {/* New Year */}
          <button
            onClick={() => setLocalOverrideMood('new_year')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'new_year'
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white shadow-md'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            ✨ New Year
          </button>

          {/* Independence Day */}
          <button
            onClick={() => setLocalOverrideMood('independence_day')}
            className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              localOverrideMood === 'independence_day'
                ? 'bg-gradient-to-r from-orange-500 via-white to-emerald-600 text-neutral-900 border border-neutral-200 shadow-md'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            🇮🇳 National
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* 3. Global Configuration Panel */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              Engine Core Controller
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Control manual overrides and auto-trigger behavior globally for all shoppers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toggle Switches */}
            <div className="space-y-4">
              <label className="flex items-start justify-between p-3.5 bg-neutral-50 rounded-2xl cursor-pointer hover:bg-neutral-100/70 transition-colors">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-bold text-neutral-800 block">
                    Enable Automatic Environments
                  </span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">
                    Shifts automatically between Morning, Afternoon, Evening, Night and weather/festivals.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isDynamicMoodEnabled}
                  onChange={(e) => setIsDynamicMoodEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#0B8F63] focus:ring-[#0B8F63] border-neutral-300 rounded cursor-pointer mt-1"
                />
              </label>

              {/* Force Override Select */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-800">
                  Global Override Mode
                </span>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Forcibly lock all website users into a specific aesthetic, bypassing clock and weather sensors.
                </p>
                <select
                  value={overrideMode}
                  onChange={(e) => setOverrideMode(e.target.value as MoodType | 'none')}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  <option value="none">None (Sensor Controlled)</option>
                  <option value="morning">Morning Horizon</option>
                  <option value="afternoon">Afternoon Forest (Default)</option>
                  <option value="evening">Sunset Twilight</option>
                  <option value="night">Midnight Navy</option>
                  <option value="rain">Forced Rainfall</option>
                  <option value="diwali">Festive Diwali</option>
                  <option value="christmas">Christmas Holiday</option>
                  <option value="holi">Playful Holi</option>
                  <option value="new_year">New Year Eve</option>
                  <option value="independence_day">National / Independence Day</option>
                  <option value="custom">Custom Canvas Theme</option>
                </select>
              </div>
            </div>

            {/* Weather / Sensors Diagnostics */}
            <div className="space-y-4">
              {/* Festival Fallback Select */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-800">
                  Active Festival Mode
                </span>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Manually trigger a festival scene if auto-calendar dates don't match.
                </p>
                <select
                  value={activeFestival}
                  onChange={(e) => setActiveFestival(e.target.value as any)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  <option value="none">No Holiday</option>
                  <option value="diwali">Diwali (Lights, Diyas & Bells)</option>
                  <option value="christmas">Christmas (Winter snowfall & windchimes)</option>
                  <option value="holi">Holi (Colors & Beats)</option>
                  <option value="new_year">New Year (Confetti & Sparks)</option>
                  <option value="independence_day">Independence Day (Tricolor Balloons)</option>
                </select>
              </div>

              {/* Live Location Diagnostics */}
              <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                  Location Sensor & Weather Diagnosis
                </span>
                
                {weatherInfo ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Coordinates:</span>
                      <span className="font-semibold text-neutral-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" />
                        {weatherInfo.city || 'Acquired'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Local Temp:</span>
                      <span className="font-semibold text-neutral-800">
                        {weatherInfo.temp !== undefined ? `${weatherInfo.temp}°C` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Atmosphere Mapped:</span>
                      <span className="font-bold text-amber-800 capitalize flex items-center gap-1">
                        {weatherInfo.condition === 'Rain' && <CloudRain className="w-3.5 h-3.5 text-cyan-600 animate-bounce" />}
                        {weatherInfo.condition || 'Clear'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-neutral-500 italic">
                    Location permission is required to retrieve real-time weather details. Falling back to local system hours.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleScanWeather}
                  disabled={isRefreshingWeather}
                  className="w-full mt-2 py-1.5 border border-amber-500/30 text-amber-800 hover:bg-amber-50 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
                  {isRefreshingWeather ? 'Querying Sensors...' : 'Locate & Refresh Weather'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Event Scheduling Calendar Card */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Event Scheduler (Automated Marketing Campaigns)
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Automatically schedule special discount atmospheres (e.g., Big Christmas Sale) to run during specific date limits.
            </p>
          </div>

          <label className="flex items-center gap-2.5 p-3.5 bg-neutral-50 rounded-2xl cursor-pointer hover:bg-neutral-100/50 transition-colors">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="w-4 h-4 text-[#0B8F63] focus:ring-[#0B8F63] border-neutral-300 rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-neutral-800">
              Enable Scheduled Theme Campaigns
            </span>
          </label>

          {scheduleEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-emerald-500/10 bg-emerald-500/[0.01] rounded-2xl animate-in fade-in slide-in-from-top-1">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  Campaign Starts On
                </span>
                <input
                  type="date"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  Campaign Ends On
                </span>
                <input
                  type="date"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">
                  Scheduled Atmospheric Theme
                </span>
                <select
                  value={scheduleTheme}
                  onChange={(e) => setScheduleTheme(e.target.value as MoodType)}
                  className="w-full text-xs border border-neutral-200 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="morning">Morning Horizon</option>
                  <option value="afternoon">Afternoon Forest (Default)</option>
                  <option value="evening">Sunset Twilight</option>
                  <option value="night">Midnight Navy</option>
                  <option value="rain">Rainfall</option>
                  <option value="diwali">Festive Diwali</option>
                  <option value="christmas">Christmas Holiday</option>
                  <option value="holi">Playful Holi</option>
                  <option value="new_year">New Year Eve</option>
                  <option value="independence_day">National / Independence Day</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 5. Custom Theme Canvas Designer */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              Creative Zone (Custom Canvas Designer)
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Personalize background wallpapers and canvas particle animations for unique store marketing setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Wallpaper link */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-800 block">
                  Custom Wallpaper Background URL
                </span>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Paste any hosted image URL to apply a premium full-width overlay under glass cards.
                </p>
                <input
                  type="url"
                  placeholder="https://example.com/wallpaper.jpg"
                  value={customBackgroundUrl}
                  onChange={(e) => setCustomBackgroundUrl(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>

              {/* Wallpaper presets */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
                  High-Quality Quick Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_WALLPAPERS.map((wp) => (
                    <button
                      key={wp.name}
                      type="button"
                      onClick={() => setCustomBackgroundUrl(wp.url)}
                      className="p-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/50 rounded-xl text-[10px] font-bold text-neutral-700 transition-all text-left truncate"
                    >
                      🖼️ {wp.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Particle Animation Override */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-800 block">
                  Custom Canvas Particles Style
                </span>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  Choose the mechanical render physics of the particle generator.
                </p>
                <select
                  value={customAnimationType}
                  onChange={(e) => setCustomAnimationType(e.target.value as any)}
                  className="w-full text-xs font-medium border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="none">Disabled (No floating assets)</option>
                  <option value="dust">Golden Dust Particles</option>
                  <option value="stars">Twinkling Midnight Stars</option>
                  <option value="rain">Vertical Rainfall Streaks</option>
                  <option value="snow">Winter Falling Snowflakes</option>
                  <option value="diyas">Floating Oil Lamps (Diyas)</option>
                  <option value="confetti">Rotating Fluttering Confetti</option>
                  <option value="colors">Joyous Holi Powder Circles</option>
                  <option value="balloons">Patriotic Rising Balloons</option>
                </select>
              </div>

              {/* Backup custom sound path */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-800 block">
                  Custom Ambient Sound URL (Optional override)
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/sound.mp3"
                  value={customSoundUrl}
                  onChange={(e) => setCustomSoundUrl(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Sound & Performance Physics Controls */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[#0B8F63] flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Sound, Volumetrics & Performance Controls
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Synthesize natural background audios and manage physical particle counts to save mobile battery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sound controls */}
            <div className="space-y-4">
              <label className="flex items-start justify-between p-3.5 bg-neutral-50 border border-neutral-200/50 rounded-2xl cursor-pointer hover:bg-neutral-100/50 transition-colors">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    {enableAudio ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-400" />}
                    Enable Ambient Soundscape Loops
                  </span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">
                    Generate procedurally synthesized organic morning birds, dusk wind, or holiday chimes in real-time.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAudio}
                  onChange={(e) => setEnableAudio(e.target.checked)}
                  className="w-4 h-4 text-[#0B8F63] focus:ring-[#0B8F63] border-neutral-300 rounded cursor-pointer mt-1"
                />
              </label>

              {enableAudio && (
                <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-2xl animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700">Master Ambient Volume</span>
                    <span className="text-[10px] font-extrabold text-emerald-700">{audioVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Performance and physics controls */}
            <div className="space-y-4">
              <label className="flex items-start justify-between p-3.5 bg-neutral-50 border border-neutral-200/50 rounded-2xl cursor-pointer hover:bg-neutral-100/50 transition-colors">
                <div className="space-y-0.5 max-w-[80%]">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    Low-End Mobile Device Safe Mode
                  </span>
                  <span className="text-[10px] text-neutral-500 block leading-tight">
                    Reduces canvas particle loads by 75% for legacy browsers and mobile batteries.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={lowEndReduction}
                  onChange={(e) => setLowEndReduction(e.target.checked)}
                  className="w-4 h-4 text-[#0B8F63] focus:ring-[#0B8F63] border-neutral-300 rounded cursor-pointer mt-1"
                />
              </label>

              <div className="space-y-1.5 p-3.5 bg-neutral-50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-700">Canvas Particle Density</span>
                  <span className="text-[10px] font-extrabold text-emerald-700">{Math.round(particleDensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.1"
                  value={particleDensity}
                  onChange={(e) => setParticleDensity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-neutral-200 rounded-lg cursor-pointer focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Error & Action Feedback Bar */}
        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{saveError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Atmosphere Config Synced to Cloud!</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#0B8F63] text-white hover:bg-[#097a54] disabled:opacity-60 rounded-2xl text-xs font-extrabold shadow-md shadow-[#0B8F63]/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Saving Changes...' : 'Save Global Atmosphere'}
          </button>
        </div>

      </form>
    </div>
  );
};
