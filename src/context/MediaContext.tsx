import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  InstagramConfig,
  SocialMediaCenterConfig,
  SocialAnalyticsLog,
} from '../types';
import { DEFAULT_INSTAGRAM_CONFIG, DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG, DEFAULT_SOCIAL_ANALYTICS } from '../data/mockData';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface MediaContextType {
  instagramConfig: InstagramConfig;
  updateInstagramConfig: (config: Partial<InstagramConfig>) => Promise<void>;
  socialMediaConfig: SocialMediaCenterConfig;
  updateSocialMediaConfig: (config: Partial<SocialMediaCenterConfig>) => Promise<void>;
  socialAnalytics: SocialAnalyticsLog;
  recordSocialClick: (platform: string) => void;
}

const STORAGE_KEYS = {
  INSTAGRAM_CONFIG: 'mfp_instagram_config_live',
  SOCIAL_MEDIA_CONFIG: 'mfp_social_media_config_live_v2',
  SOCIAL_ANALYTICS: 'mfp_social_analytics_live_v2',
};

const normalizeSocialConfig = (raw: any): SocialMediaCenterConfig => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
  }
  return {
    ...DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG,
    ...raw,
    platforms: Array.isArray(raw.platforms) && raw.platforms.length > 0 
      ? raw.platforms 
      : DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.platforms,
    instagramHighlights: Array.isArray(raw.instagramHighlights) 
      ? raw.instagramHighlights 
      : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.instagramHighlights || []),
    instagramMedia: Array.isArray(raw.instagramMedia) 
      ? raw.instagramMedia 
      : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.instagramMedia || []),
    youtubeVideos: Array.isArray(raw.youtubeVideos) 
      ? raw.youtubeVideos 
      : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubeVideos || []),
    youtubeShorts: Array.isArray(raw.youtubeShorts) 
      ? raw.youtubeShorts 
      : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubeShorts || []),
    youtubePlaylists: Array.isArray(raw.youtubePlaylists) 
      ? raw.youtubePlaylists 
      : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubePlaylists || []),
  };
};

const normalizeSocialAnalytics = (raw: any): SocialAnalyticsLog => {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_SOCIAL_ANALYTICS;
  }
  return {
    ...DEFAULT_SOCIAL_ANALYTICS,
    ...raw,
    clickCount: raw.clickCount && typeof raw.clickCount === 'object' ? raw.clickCount : DEFAULT_SOCIAL_ANALYTICS.clickCount,
    lastClickTimestamp: raw.lastClickTimestamp && typeof raw.lastClickTimestamp === 'object' ? raw.lastClickTimestamp : DEFAULT_SOCIAL_ANALYTICS.lastClickTimestamp,
    dailyClicks: raw.dailyClicks && typeof raw.dailyClicks === 'object' ? raw.dailyClicks : DEFAULT_SOCIAL_ANALYTICS.dailyClicks,
    weeklyClicks: raw.weeklyClicks && typeof raw.weeklyClicks === 'object' ? raw.weeklyClicks : DEFAULT_SOCIAL_ANALYTICS.weeklyClicks,
    monthlyClicks: raw.monthlyClicks && typeof raw.monthlyClicks === 'object' ? raw.monthlyClicks : DEFAULT_SOCIAL_ANALYTICS.monthlyClicks,
  };
};

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [instagramConfig, setInstagramConfig] = useState<InstagramConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSTAGRAM_CONFIG);
      return saved ? { ...DEFAULT_INSTAGRAM_CONFIG, ...JSON.parse(saved) } : DEFAULT_INSTAGRAM_CONFIG;
    } catch {
      return DEFAULT_INSTAGRAM_CONFIG;
    }
  });

  const [socialMediaConfig, setSocialMediaConfig] = useState<SocialMediaCenterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG);
      return saved ? normalizeSocialConfig(JSON.parse(saved)) : DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
    } catch {
      return DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
    }
  });

  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalyticsLog>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_ANALYTICS);
      return saved ? normalizeSocialAnalytics(JSON.parse(saved)) : DEFAULT_SOCIAL_ANALYTICS;
    } catch {
      return DEFAULT_SOCIAL_ANALYTICS;
    }
  });

  useEffect(() => {
    const unsubInsta = onSnapshot(doc(db, 'settings', 'instagram_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setInstagramConfig((prev) => ({
          ...DEFAULT_INSTAGRAM_CONFIG,
          ...(prev || {}),
          ...(data || {}),
        }));
      }
    }, () => {});

    const unsubSocial = onSnapshot(doc(db, 'settings', 'social_media'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSocialMediaConfig((prev) => {
          const merged = normalizeSocialConfig({
            ...(prev || {}),
            ...data,
          });
          try {
            localStorage.setItem(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }, () => {});

    return () => {
      unsubInsta();
      unsubSocial();
    };
  }, []);

  const updateInstagramConfig = async (config: Partial<InstagramConfig>) => {
    let mergedConfig: InstagramConfig = DEFAULT_INSTAGRAM_CONFIG;
    setInstagramConfig((prev) => {
      mergedConfig = {
        ...DEFAULT_INSTAGRAM_CONFIG,
        ...(prev || {}),
        ...config,
      };
      try {
        localStorage.setItem(STORAGE_KEYS.INSTAGRAM_CONFIG, JSON.stringify(mergedConfig));
      } catch {}
      return mergedConfig;
    });
    try {
      await setDoc(doc(db, 'settings', 'instagram_config'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore instagram config sync failed', e);
    }
  };

  const updateSocialMediaConfig = async (config: Partial<SocialMediaCenterConfig>) => {
    setSocialMediaConfig((prev) => {
      const base = prev || DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
      const merged: SocialMediaCenterConfig = {
        ...DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG,
        ...base,
        ...config,
        platforms: Array.isArray(config.platforms) 
          ? config.platforms 
          : (Array.isArray(base.platforms) ? base.platforms : DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.platforms),
        instagramHighlights: Array.isArray(config.instagramHighlights) 
          ? config.instagramHighlights 
          : (Array.isArray(base.instagramHighlights) ? base.instagramHighlights : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.instagramHighlights || [])),
        instagramMedia: Array.isArray(config.instagramMedia) 
          ? config.instagramMedia 
          : (Array.isArray(base.instagramMedia) ? base.instagramMedia : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.instagramMedia || [])),
        youtubeVideos: Array.isArray(config.youtubeVideos) 
          ? config.youtubeVideos 
          : (Array.isArray(base.youtubeVideos) ? base.youtubeVideos : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubeVideos || [])),
        youtubeShorts: Array.isArray(config.youtubeShorts) 
          ? config.youtubeShorts 
          : (Array.isArray(base.youtubeShorts) ? base.youtubeShorts : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubeShorts || [])),
        youtubePlaylists: Array.isArray(config.youtubePlaylists) 
          ? config.youtubePlaylists 
          : (Array.isArray(base.youtubePlaylists) ? base.youtubePlaylists : (DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG.youtubePlaylists || [])),
      };
      try {
        localStorage.setItem(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG, JSON.stringify(merged));
      } catch (err) {
        console.warn('LocalStorage save failed for socialMediaConfig', err);
      }
      return merged;
    });

    try {
      await setDoc(doc(db, 'settings', 'social_media'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore social media config sync failed', e);
    }
  };

  const recordSocialClick = (platform: string) => {
    setSocialAnalytics((prev) => {
      const current = normalizeSocialAnalytics(prev);
      const updated: SocialAnalyticsLog = {
        ...current,
        totalClicks: (current.totalClicks || 0) + 1,
        clickCount: {
          ...current.clickCount,
          [platform]: ((current.clickCount && current.clickCount[platform]) || 0) + 1,
        },
        clicksByPlatform: {
          ...current.clicksByPlatform,
          [platform]: ((current.clicksByPlatform && current.clicksByPlatform[platform]) || 0) + 1,
        },
        lastClickTimestamp: {
          ...current.lastClickTimestamp,
          [platform]: new Date().toISOString(),
        }
      };
      try {
        localStorage.setItem(STORAGE_KEYS.SOCIAL_ANALYTICS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <MediaContext.Provider
      value={{
        instagramConfig,
        updateInstagramConfig,
        socialMediaConfig,
        updateSocialMediaConfig,
        socialAnalytics,
        recordSocialClick,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error('useMedia must be used within MediaProvider');
  return context;
};
