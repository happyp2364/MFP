import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SEOMetadataConfig } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const DEFAULT_SEO_CONFIG: SEOMetadataConfig = {
  globalTitleTemplate: '%s | Marudhar Fashion Point',
  globalDescription: 'Marudhar Fashion Point - Premium Sports & Luxury Footwear Store.',
  defaultOgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
  googleAnalyticsId: 'G-MEASUREMENT_ID',
  googleSearchConsoleVerification: 'gsc_verification_code',
  googleBusinessProfileId: 'gbp_profile_id',
  robotsTxtContent: 'User-agent: *\nAllow: /\nSitemap: https://marudharfashionpoint.com/sitemap.xml',
  businessName: 'Marudhar Fashion Point',
  businessCategory: 'Footwear Store',
  foundedYear: '2015',
  contactNumber: '+919876543210',
  businessAddress: 'Marudhar Fashion Point, Main Market, City',
};

interface SEOContextType {
  seoConfig: SEOMetadataConfig;
  updateSEOConfig: (config: SEOMetadataConfig) => Promise<void>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [seoConfig, setSeoConfig] = useState<SEOMetadataConfig>(DEFAULT_SEO_CONFIG);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'seo_config'), (snapshot) => {
      if (snapshot.exists()) {
        setSeoConfig(snapshot.data() as SEOMetadataConfig);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateSEOConfig = async (config: SEOMetadataConfig) => {
    setSeoConfig(config);
    try {
      await setDoc(doc(db, 'settings', 'seo_config'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore SEO config sync failed', e);
    }
  };

  return (
    <SEOContext.Provider value={{ seoConfig, updateSEOConfig }}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (!context) throw new Error('useSEO must be used within SEOProvider');
  return context;
};
