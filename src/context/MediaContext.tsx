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
  updateInstagramConfig: (config: InstagramConfig) => Promise<void>;
  socialMediaConfig: SocialMediaCenterConfig;
  updateSocialMediaConfig: (config: SocialMediaCenterConfig) => Promise<void>;
  socialAnalytics: SocialAnalyticsLog;
  recordSocialClick: (platform: string) => void;
}

const STORAGE_KEYS = {
  INSTAGRAM_CONFIG: 'nwd_instagram_config_live',
  SOCIAL_MEDIA_CONFIG: 'nwd_social_media_config_live_v2',
  SOCIAL_ANALYTICS: 'nwd_social_analytics_live_v2',
};

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [instagramConfig, setInstagramConfig] = useState<InstagramConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSTAGRAM_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_INSTAGRAM_CONFIG;
    } catch {
      return DEFAULT_INSTAGRAM_CONFIG;
    }
  });

  const [socialMediaConfig, setSocialMediaConfig] = useState<SocialMediaCenterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
    } catch {
      return DEFAULT_SOCIAL_MEDIA_CENTER_CONFIG;
    }
  });

  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalyticsLog>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_ANALYTICS);
      return saved ? JSON.parse(saved) : DEFAULT_SOCIAL_ANALYTICS;
    } catch {
      return DEFAULT_SOCIAL_ANALYTICS;
    }
  });

  useEffect(() => {
    const unsubInsta = onSnapshot(doc(db, 'settings', 'instagram_config'), (snapshot) => {
      if (snapshot.exists()) setInstagramConfig(snapshot.data() as InstagramConfig);
    }, () => {});

    const unsubSocial = onSnapshot(doc(db, 'settings', 'social_media'), (snapshot) => {
      if (snapshot.exists()) setSocialMediaConfig(snapshot.data() as SocialMediaCenterConfig);
    }, () => {});

    return () => {
      unsubInsta();
      unsubSocial();
    };
  }, []);

  const updateInstagramConfig = async (config: InstagramConfig) => {
    setInstagramConfig(config);
    localStorage.setItem(STORAGE_KEYS.INSTAGRAM_CONFIG, JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'instagram_config'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore instagram config sync failed', e);
    }
  };

  const updateSocialMediaConfig = async (config: SocialMediaCenterConfig) => {
    setSocialMediaConfig(config);
    localStorage.setItem(STORAGE_KEYS.SOCIAL_MEDIA_CONFIG, JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'social_media'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore social media config sync failed', e);
    }
  };

  const recordSocialClick = (platform: string) => {
    const updated = {
      ...socialAnalytics,
      totalClicks: (socialAnalytics.totalClicks || 0) + 1,
      clicksByPlatform: {
        ...socialAnalytics.clicksByPlatform,
        [platform]: ((socialAnalytics.clicksByPlatform && socialAnalytics.clicksByPlatform[platform]) || 0) + 1,
      },
    };
    setSocialAnalytics(updated);
    localStorage.setItem(STORAGE_KEYS.SOCIAL_ANALYTICS, JSON.stringify(updated));
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
