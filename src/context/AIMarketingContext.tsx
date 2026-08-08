import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIMarketingGrowthConfig } from '../types';
import { db } from '../lib/firebase';
import { onTenantCollectionSnapshot, onTenantDocSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantCollectionWriteRef, getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const DEFAULT_AI_MARKETING_GROWTH_CONFIG: AIMarketingGrowthConfig = {
  aiCampaignsEnabled: true,
  socialMediaTone: 'Luxury',
  customerEngagement: {
    wishlistReminders: true,
    backInStockAlerts: true,
    priceDropAlerts: true,
    orderUpdates: true,
    reviewRequests: true,
    birthdayGreetings: true,
    festivalWishes: true,
  },
  recommendationEngine: {
    enabled: true,
    suggestByRecentlyViewed: true,
    suggestByBestSellers: true,
    suggestByCategory: true,
    suggestByPriceRange: true,
    suggestByPurchaseHistory: true,
    suggestByTrending: true,
  },
};

interface AIMarketingContextType {
  aiMarketingGrowthConfig: AIMarketingGrowthConfig;
  updateAIMarketingGrowthConfig: (config: AIMarketingGrowthConfig) => Promise<void>;
}

const AIMarketingContext = createContext<AIMarketingContextType | undefined>(undefined);

export const AIMarketingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [aiMarketingGrowthConfig, setAiMarketingGrowthConfig] = useState<AIMarketingGrowthConfig>(DEFAULT_AI_MARKETING_GROWTH_CONFIG);

  useEffect(() => {
    const unsub = onTenantDocSnapshot(db, 'settings', 'ai_marketing_growth', (snapshot) => {
      if (snapshot.exists()) {
        setAiMarketingGrowthConfig(snapshot.data() as AIMarketingGrowthConfig);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateAIMarketingGrowthConfig = async (config: AIMarketingGrowthConfig) => {
    setAiMarketingGrowthConfig(config);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'ai_marketing_growth'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore AI marketing growth config sync failed', e);
    }
  };

  return (
    <AIMarketingContext.Provider value={{ aiMarketingGrowthConfig, updateAIMarketingGrowthConfig }}>
      {children}
    </AIMarketingContext.Provider>
  );
};

export const useAIMarketing = () => {
  const context = useContext(AIMarketingContext);
  if (!context) throw new Error('useAIMarketing must be used within AIMarketingProvider');
  return context;
};
