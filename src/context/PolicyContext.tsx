import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AboutUsConfig } from '../types';
import { DEFAULT_ABOUT_US_CONFIG } from '../data/defaultAboutUs';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface PolicyContextType {
  aboutUsConfig: AboutUsConfig;
  updateAboutUsConfig: (config: AboutUsConfig) => Promise<void>;
}

const STORAGE_KEYS = {
  ABOUT_US_CONFIG: 'nwd_about_us_config_live',
};

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const PolicyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [aboutUsConfig, setAboutUsConfig] = useState<AboutUsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ABOUT_US_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_ABOUT_US_CONFIG;
    } catch {
      return DEFAULT_ABOUT_US_CONFIG;
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'about_us'), (snapshot) => {
      if (snapshot.exists()) {
        setAboutUsConfig(snapshot.data() as AboutUsConfig);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateAboutUsConfig = async (config: AboutUsConfig) => {
    setAboutUsConfig(config);
    localStorage.setItem(STORAGE_KEYS.ABOUT_US_CONFIG, JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'about_us'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore about us config sync failed', e);
    }
  };

  return (
    <PolicyContext.Provider value={{ aboutUsConfig, updateAboutUsConfig }}>
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => {
  const context = useContext(PolicyContext);
  if (!context) throw new Error('usePolicy must be used within PolicyProvider');
  return context;
};
