import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteConfig } from '../types';
import { DEFAULT_WEBSITE_CONFIG } from '../data/defaultWebsiteConfig';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface WebsiteIdentityContextType {
  websiteConfig: WebsiteConfig;
  updateWebsiteConfig: (newConfig: WebsiteConfig) => Promise<void>;
}

const STORAGE_KEYS = {
  WEBSITE_CONFIG: 'mfp_website_config_live',
};

const WebsiteIdentityContext = createContext<WebsiteIdentityContextType | undefined>(undefined);

export const WebsiteIdentityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEBSITE_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_WEBSITE_CONFIG;
    } catch {
      return DEFAULT_WEBSITE_CONFIG;
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'website_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WebsiteConfig;
        setWebsiteConfig(data);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateWebsiteConfig = async (newConfig: WebsiteConfig) => {
    setWebsiteConfig(newConfig);
    localStorage.setItem(STORAGE_KEYS.WEBSITE_CONFIG, JSON.stringify(newConfig));
    try {
      await setDoc(doc(db, 'settings', 'website_config'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore website config sync failed', e);
    }
  };

  return (
    <WebsiteIdentityContext.Provider value={{ websiteConfig, updateWebsiteConfig }}>
      {children}
    </WebsiteIdentityContext.Provider>
  );
};

export const useWebsiteIdentity = () => {
  const context = useContext(WebsiteIdentityContext);
  if (!context) throw new Error('useWebsiteIdentity must be used within WebsiteIdentityProvider');
  return context;
};
