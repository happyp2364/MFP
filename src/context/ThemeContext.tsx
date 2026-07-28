export type ThemeMode = 'light' | 'dark' | 'auto';
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MoodConfig, MoodType } from '../types';
import { playProceduralAmbience, stopProceduralAmbience } from '../utils/moodAudioProcedural';

export interface WeatherInfo {
  temp?: number;
  code?: number;
  condition?: string;
  city?: string;
  lastUpdated?: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activePeriod: TimePeriod;
  isDark: boolean;
  backgroundGradientClass: string;
  
  // Mood Engine Extensions
  activeMood: MoodType;
  moodConfig: MoodConfig;
  updateMoodConfig: (config: Partial<MoodConfig>) => Promise<boolean>;
  weatherInfo: WeatherInfo | null;
  refreshWeather: () => Promise<void>;
  localOverrideMood: MoodType | 'none';
  setLocalOverrideMood: (mood: MoodType | 'none') => void;
  
  // Computed Premium Styling bindings for easy component access
  cardBgClass: string;
  accentColorClass: string;
  buttonStyleClass: string;
  badgeStyleClass: string;
  glowShadowClass: string;
  mottoStyleClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mfp_theme_mode_pref';

const DEFAULT_MOOD_CONFIG: MoodConfig = {
  isDynamicMoodEnabled: true,
  overrideMode: 'none',
  activeFestival: 'none',
  customBackgroundUrl: '',
  customAnimationType: 'none',
  customSoundUrl: '',
  scheduledTheme: {
    enabled: false,
    startDate: '',
    endDate: '',
    theme: 'afternoon',
  },
  audioVolume: 35,
  enableAudio: false,
  lowEndReduction: false,
  particleDensity: 1.0,
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') {
      return saved;
    }
    return 'auto';
  });

  const [activePeriod, setActivePeriod] = useState<TimePeriod>('afternoon');
  const [moodConfig, setMoodConfig] = useState<MoodConfig>(DEFAULT_MOOD_CONFIG);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [localOverrideMood, setLocalOverrideMood] = useState<MoodType | 'none'>('none');
  
  // Cache to prevent infinite weather loops
  const weatherFetchingRef = useRef<boolean>(false);

  // 1. Calculate time period
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

    const interval = setInterval(() => {
      setActivePeriod(calculateTimePeriod());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 2. Real-time Firebase Sync for Mood Engine Configurations
  useEffect(() => {
    const docRef = doc(db, 'settings', 'mood_config');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMoodConfig({
            ...DEFAULT_MOOD_CONFIG,
            ...snapshot.data(),
          } as MoodConfig);
        } else {
          // Setup defaults if not exists
          setDoc(docRef, DEFAULT_MOOD_CONFIG).catch(() => {});
        }
      },
      (error) => {
        console.warn('Mood config Firestore snapshot warning (falling back to offline defaults):', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Client Weather Detection Engine
  const refreshWeather = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation || weatherFetchingRef.current) return;
    
    // Quick session check to throttle API requests
    try {
      const cached = sessionStorage.getItem('mfp_weather_cache');
      if (cached) {
        const { info, timestamp } = JSON.parse(cached);
        // If cached within last 30 minutes, restore
        if (Date.now() - timestamp < 1800000) {
          setWeatherInfo(info);
          return;
        }
      }
    } catch (e) {}

    weatherFetchingRef.current = true;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          if (!res.ok) throw new Error('Weather API error');
          const data = await res.json();
          
          if (data.current_weather) {
            const code = data.current_weather.weathercode;
            const temp = data.current_weather.temperature;
            
            // Map WMO codes to friendly conditions
            let condition = 'Sunny';
            if (code >= 1 && code <= 3) condition = 'Cloudy';
            else if (code === 45 || code === 48) condition = 'Fog';
            else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) condition = 'Rain';
            else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) condition = 'Snow';

            // Extract reverse city coordinate name (optional simplified)
            const info: WeatherInfo = {
              temp,
              code,
              condition,
              city: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setWeatherInfo(info);
            sessionStorage.setItem('mfp_weather_cache', JSON.stringify({ info, timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('Failed to parse weather from Open-Meteo:', err);
        } finally {
          weatherFetchingRef.current = false;
        }
      },
      (error) => {
        // Console note only, fallback to local clock
        weatherFetchingRef.current = false;
      },
      { timeout: 10000 }
    );
  };

  // Trigger weather scan on boot if dynamic mode is active
  useEffect(() => {
    if (moodConfig.isDynamicMoodEnabled) {
      refreshWeather();
    }
  }, [moodConfig.isDynamicMoodEnabled]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
  };

  // 4. Update Global Mood Config in Firestore
  const updateMoodConfig = async (newConfig: Partial<MoodConfig>): Promise<boolean> => {
    try {
      const docRef = doc(db, 'settings', 'mood_config');
      
      // Compute flat first-level diff
      const diff: any = {};
      let hasChanges = false;
      const original = moodConfig;
      
      const allKeys = new Set([...Object.keys(original), ...Object.keys(newConfig)]);
      for (const key of allKeys) {
        const valOrig = (original as any)[key];
        const valCurr = (newConfig as any)[key];

        if (JSON.stringify(valOrig) !== JSON.stringify(valCurr)) {
          diff[key] = valCurr;
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        console.log('No mood config changes detected. Skipping Firestore write.');
        return true;
      }

      const startTime = Date.now();
      const writePromise = setDoc(docRef, diff, { merge: true });
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 800));

      await Promise.race([writePromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      console.log(`Mood Config saved in ${elapsed}ms. Diff:`, diff);
      
      return true;
    } catch (err) {
      console.error('Error saving mood config in Firestore:', err);
      return false;
    }
  };

  // 5. Compute Active Mood with Priority Hierarchies
  const computeActiveMood = (): MoodType => {
    // Priority 1: Local Session Preview Override (Admin slider testing)
    if (localOverrideMood !== 'none') {
      return localOverrideMood;
    }

    // Priority 2: Admin Dashboard Global Forced Override
    if (moodConfig.overrideMode !== 'none') {
      return moodConfig.overrideMode;
    }

    // Priority 3: Scheduled Event Theme (e.g. Sales, Festivals dates)
    if (moodConfig.scheduledTheme?.enabled && moodConfig.scheduledTheme.startDate && moodConfig.scheduledTheme.endDate) {
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (todayStr >= moodConfig.scheduledTheme.startDate && todayStr <= moodConfig.scheduledTheme.endDate) {
        return moodConfig.scheduledTheme.theme;
      }
    }

    // Priority 4: Dynamic Interactive Mode
    if (moodConfig.isDynamicMoodEnabled) {
      // 4A: Active Festival Choice
      if (moodConfig.activeFestival !== 'none') {
        return moodConfig.activeFestival as MoodType;
      }

      // 4B: Live Weather triggers
      if (weatherInfo) {
        if (weatherInfo.condition === 'Rain') return 'rain';
        if (weatherInfo.condition === 'Snow') return 'christmas';
      }

      // 4C: Automatic Festival Date fallbacks (Built-in)
      const date = new Date();
      const month = date.getMonth(); // 0-indexed
      const day = date.getDate();

      if (month === 11 && day >= 22 && day <= 26) return 'christmas'; // Dec 22 - 26
      if (month === 0 && day === 1) return 'new_year'; // Jan 1
      if (month === 7 && day === 15) return 'independence_day'; // Aug 15

      // 4D: Base Time of Day atmospheres
      return activePeriod;
    }

    // Fallback to active clock period
    return activePeriod;
  };

  const activeMood = computeActiveMood();

  // Determine if background or UI elements should render dark layout
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'auto' && (activeMood === 'night' || activeMood === 'diwali' || activeMood === 'christmas' || activeMood === 'new_year'));

  // 6. Sound Synthesizer loop integration
  useEffect(() => {
    if (moodConfig.enableAudio) {
      playProceduralAmbience(activeMood, moodConfig.audioVolume);
    } else {
      stopProceduralAmbience();
    }
    return () => stopProceduralAmbience();
  }, [activeMood, moodConfig.enableAudio, moodConfig.audioVolume]);

  // 7. Compute styling tokens based on active mood and light/dark theme
  const getStylingTokens = () => {
    switch (activeMood) {
      case 'morning':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#EBF5FB] text-neutral-900',
          cardBgClass: 'bg-white/80 border border-amber-200/40 shadow-sm backdrop-blur-md',
          accentColorClass: 'text-amber-700 bg-amber-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-orange-100 text-orange-800 border border-orange-200',
          glowShadowClass: 'shadow-orange-500/5',
          mottoStyleClass: 'text-amber-700 font-bold',
        };

      case 'evening':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#FFF9F2] via-[#FBF2E9] to-[#E8EAFF] text-neutral-900',
          cardBgClass: 'bg-white/85 border border-rose-200/40 shadow-md backdrop-blur-md',
          accentColorClass: 'text-rose-700 bg-rose-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-rose-100 text-rose-800 border border-rose-200',
          glowShadowClass: 'shadow-rose-500/5',
          mottoStyleClass: 'text-rose-600 font-bold',
        };

      case 'night':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#020713] via-[#081123] to-[#121E36] text-neutral-100',
          cardBgClass: 'bg-[#081123]/80 border border-white/10 shadow-xl shadow-black/30 backdrop-blur-lg',
          accentColorClass: 'text-amber-400 bg-amber-400/10',
          buttonStyleClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-neutral-950 font-bold hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
          glowShadowClass: 'shadow-amber-500/10',
          mottoStyleClass: 'text-amber-400 font-bold',
        };

      case 'rain':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#ECEFF1] via-[#E5ECEC] to-[#CFD8DC] text-neutral-900',
          cardBgClass: 'bg-white/70 border border-cyan-200/40 shadow-md backdrop-blur-xl',
          accentColorClass: 'text-cyan-700 bg-cyan-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
          glowShadowClass: 'shadow-cyan-500/5',
          mottoStyleClass: 'text-cyan-600 font-bold',
        };

      case 'diwali':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#1C0808] via-[#2A0E0E] to-[#3B1919] text-[#FFF4E0]',
          cardBgClass: 'bg-[#2A0E0E]/80 border border-amber-500/20 shadow-xl backdrop-blur-md',
          accentColorClass: 'text-amber-300 bg-amber-500/20',
          buttonStyleClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 border border-amber-400/25 active:scale-95 transition-all',
          badgeStyleClass: 'bg-amber-500/30 text-amber-300 border border-amber-500/50 animate-pulse',
          glowShadowClass: 'shadow-amber-500/20',
          mottoStyleClass: 'text-amber-300 font-serif font-bold tracking-wider',
        };

      case 'christmas':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#061E10] via-[#0E2E19] to-[#171717] text-neutral-100',
          cardBgClass: 'bg-[#0E2E19]/80 border border-red-500/15 shadow-xl backdrop-blur-md',
          accentColorClass: 'text-red-400 bg-red-500/20',
          buttonStyleClass: 'bg-gradient-to-r from-red-600 via-red-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-red-600/25 active:scale-95 transition-all',
          badgeStyleClass: 'bg-red-500/20 text-red-300 border border-red-500/40',
          glowShadowClass: 'shadow-red-600/10',
          mottoStyleClass: 'text-red-500 font-bold',
        };

      case 'holi':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#FFF5FA] via-[#FFF9F2] to-[#F2FAFF] text-neutral-900',
          cardBgClass: 'bg-white/80 border border-pink-200/40 shadow-md backdrop-blur-md',
          accentColorClass: 'text-pink-600 bg-pink-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-500 text-white font-bold hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-pink-100 text-pink-700 border border-pink-200',
          glowShadowClass: 'shadow-pink-500/10',
          mottoStyleClass: 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-500 to-blue-500 font-extrabold',
        };

      case 'new_year':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#080811] via-[#101026] to-[#1C173B] text-[#FCFCFF]',
          cardBgClass: 'bg-[#101026]/80 border border-purple-500/20 shadow-xl backdrop-blur-lg',
          accentColorClass: 'text-purple-300 bg-purple-500/20',
          buttonStyleClass: 'bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-purple-500/25 text-purple-300 border border-purple-500/40',
          glowShadowClass: 'shadow-purple-500/15',
          mottoStyleClass: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-extrabold',
        };

      case 'independence_day':
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#FFF9F5] via-[#FCFCFD] to-[#F1FAF2] text-neutral-900',
          cardBgClass: 'bg-white/80 border border-blue-200/30 shadow-md backdrop-blur-md',
          accentColorClass: 'text-blue-700 bg-blue-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-[#FF9933] via-white to-[#128807] text-neutral-900 font-extrabold border border-neutral-200 shadow hover:shadow-lg active:scale-95 transition-all',
          badgeStyleClass: 'bg-blue-50 text-blue-800 border border-blue-200',
          glowShadowClass: 'shadow-blue-500/5',
          mottoStyleClass: 'text-blue-800 font-bold',
        };

      case 'afternoon':
      default:
        return {
          backgroundGradientClass: 'bg-gradient-to-br from-[#FAFAFA] via-[#F4F8F5] to-[#EFEFEF] text-neutral-900',
          cardBgClass: 'bg-white/90 border border-neutral-200/40 shadow-sm backdrop-blur-md',
          accentColorClass: 'text-emerald-700 bg-emerald-500/10',
          buttonStyleClass: 'bg-gradient-to-r from-[#0B8F63] to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-600/20 active:scale-95 transition-all',
          badgeStyleClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
          glowShadowClass: 'shadow-emerald-600/5',
          mottoStyleClass: 'text-emerald-600 font-bold',
        };
    }
  };

  const activeStyles = getStylingTokens();

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        activePeriod,
        isDark,
        backgroundGradientClass: activeStyles.backgroundGradientClass,
        
        // Mood Engine Extensions
        activeMood,
        moodConfig,
        updateMoodConfig,
        weatherInfo,
        refreshWeather,
        localOverrideMood,
        setLocalOverrideMood,
        
        // Extracted Premium bindings for fast mapping
        cardBgClass: activeStyles.cardBgClass,
        accentColorClass: activeStyles.accentColorClass,
        buttonStyleClass: activeStyles.buttonStyleClass,
        badgeStyleClass: activeStyles.badgeStyleClass,
        glowShadowClass: activeStyles.glowShadowClass,
        mottoStyleClass: activeStyles.mottoStyleClass,
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
