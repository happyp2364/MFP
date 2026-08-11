import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebsiteConfig } from '../types';
import { DEFAULT_WEBSITE_CONFIG } from '../data/defaultWebsiteConfig';
import { db } from '../lib/firebase';
import { onTenantCollectionSnapshot, onTenantDocSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantCollectionWriteRef, getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface WebsiteIdentityContextType {
  websiteConfig: WebsiteConfig;
  updateWebsiteConfig: (newConfig: WebsiteConfig) => Promise<void>;
}

const STORAGE_KEYS = {
  WEBSITE_CONFIG: 'nwd_website_config_live',
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
    const unsub = onTenantDocSnapshot(db, 'settings', 'website_config', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WebsiteConfig;
        setWebsiteConfig(data);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateWebsiteConfig = async (newConfig: WebsiteConfig) => {
    let activeWebsiteId: string | undefined = undefined;
    let activeSlug: string | undefined = undefined;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WEBSITE_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        activeWebsiteId = parsed.websiteId || parsed.tenantId;
        activeSlug = parsed.slug;
      }
    } catch {
      // Ignore parse error
    }

    const mergedConfig = {
      ...newConfig,
      websiteId: newConfig.websiteId || activeWebsiteId,
      tenantId: newConfig.tenantId || activeWebsiteId,
      slug: (newConfig as any).slug || activeSlug,
    };

    setWebsiteConfig(mergedConfig);
    localStorage.setItem(STORAGE_KEYS.WEBSITE_CONFIG, JSON.stringify(mergedConfig));
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'website_config'), mergedConfig, { merge: true });
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
