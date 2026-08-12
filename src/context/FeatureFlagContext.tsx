import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SpinWheelConfig,
  ScratchWinConfig,
  EngagementAnalytics,
  OrderCelebrationConfig,
} from '../types';
import { db } from '../lib/firebase';
import { onTenantDocSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { setDoc } from 'firebase/firestore';
import { getCurrentTenantId } from '../lib/tenantIsolation';
import {
  getDefaultFeatureConfig,
  checkFeatureDependencies,
  getFeatureById,
} from '../lib/featureRegistry';
import { saveTenantFeatureSettings, getTenantFeatureSettings } from '../lib/tenantFeatureService';

interface FeatureFlagContextType {
  // Global / Tenant Feature Registry Toggles
  tenantFeatures: Record<string, boolean>;
  isFeatureEnabled: (featureId: string) => boolean;
  checkFeatureDependency: (featureId: string) => { satisfied: boolean; missing: string[] };
  updateTenantFeatureToggle: (featureId: string, enabled: boolean) => Promise<void>;
  
  // Specific Gamification Feature Configs (backward compatibility)
  spinWheelConfig: SpinWheelConfig;
  updateSpinWheelConfig: (newConfig: SpinWheelConfig) => Promise<void>;
  scratchWinConfig: ScratchWinConfig;
  updateScratchWinConfig: (newConfig: ScratchWinConfig) => Promise<void>;
  engagementAnalytics: EngagementAnalytics;
  recordEngagementMetric: (metric: keyof EngagementAnalytics) => void;
  orderCelebrationConfig: OrderCelebrationConfig;
  updateOrderCelebrationConfig: (newConfig: OrderCelebrationConfig) => Promise<void>;
  isCelebrating: boolean;
  setIsCelebrating: (val: boolean) => void;
  triggerGlobalCelebration: () => void;
}

const DEFAULT_SPIN_WHEEL_CONFIG: SpinWheelConfig = {
  enabled: true,
  sectionsCount: 5,
  soundEnabled: true,
  celebrationEnabled: true,
  autoApplyCoupon: true,
  canSpinAgainDays: 30,
  minCartValue: 0,
  sections: [
    { id: '1', title: '10% OFF', type: 'PERCENTAGE', value: 10, probability: 30, couponCode: 'SPIN10', color: '#4F46E5' },
    { id: '2', title: 'Better Luck Next Time', type: 'BETTER_LUCK', value: 0, probability: 20, couponCode: '', color: '#6B7280' },
    { id: '3', title: '₹100 OFF', type: 'FLAT', value: 100, probability: 25, couponCode: 'SPIN100', color: '#059669' },
    { id: '4', title: '15% OFF', type: 'PERCENTAGE', value: 15, probability: 15, couponCode: 'SPIN15', color: '#D97706' },
    { id: '5', title: 'Free Shipping', type: 'FREE_SHIPPING', value: 0, probability: 10, couponCode: 'FREESHIP', color: '#DC2626' },
  ],
};

const DEFAULT_SCRATCH_WIN_CONFIG: ScratchWinConfig = {
  enabled: true,
  permanentlyDisabled: false,
  showOnHomepage: true,
  showOnProductPage: true,
  showOnCheckout: false,
  showOnOrderSuccess: true,
  firstVisitOnly: false,
  firstOrderOnly: false,
  returningCustomerOnly: false,
  newCustomerOnly: false,
  festivalOnly: false,
  dailyLimit: 1,
  perCustomerLimit: 3,
  globalUsageLimit: 1000,
  minCartValue: 0,
  rewards: [
    { id: 'r1', name: 'Flat ₹200 OFF', type: 'FLAT', value: 200, probability: 40, usageLimit: 100, usageCount: 0, perCustomerLimit: 1, couponCode: 'SCRATCH200' },
    { id: 'r2', name: '20% OFF Everything', type: 'PERCENTAGE', value: 20, probability: 30, usageLimit: 100, usageCount: 0, perCustomerLimit: 1, couponCode: 'SUPER20' },
    { id: 'r3', name: 'Free Delivery', type: 'FREE_SHIPPING', value: 0, probability: 30, usageLimit: 100, usageCount: 0, perCustomerLimit: 1, couponCode: 'EXPRESSFREE' },
  ],
};

const DEFAULT_ENGAGEMENT_ANALYTICS: EngagementAnalytics = {
  luckyBoxOpens: 0,
  wheelSpins: 0,
  couponsWon: 0,
  couponsUsed: 0,
  flashDealClicks: 0,
  flashDealConversions: 0,
  revenueGenerated: 0,
};

const DEFAULT_ORDER_CELEBRATION_CONFIG: OrderCelebrationConfig = {
  enabled: true,
  confetti: true,
  sparkles: true,
  balloons: true,
  sound: true,
  successAnimation: true,
  duration: 5,
  speed: 'medium',
  mobileOnly: false,
  desktopOnly: false,
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTenant, setActiveTenant] = useState(getCurrentTenantId());
  const [tenantFeatures, setTenantFeatures] = useState<Record<string, boolean>>(getDefaultFeatureConfig());
  const [spinWheelConfig, setSpinWheelConfig] = useState<SpinWheelConfig>(DEFAULT_SPIN_WHEEL_CONFIG);
  const [scratchWinConfig, setScratchWinConfig] = useState<ScratchWinConfig>(DEFAULT_SCRATCH_WIN_CONFIG);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics>(DEFAULT_ENGAGEMENT_ANALYTICS);
  const [orderCelebrationConfig, setOrderCelebrationConfig] = useState<OrderCelebrationConfig>(DEFAULT_ORDER_CELEBRATION_CONFIG);
  const [isCelebrating, setIsCelebrating] = useState<boolean>(false);

  useEffect(() => {
    const handleTenantChange = () => {
      setActiveTenant(getCurrentTenantId());
    };
    window.addEventListener('tenantChanged', handleTenantChange);
    window.addEventListener('storage', handleTenantChange);
    return () => {
      window.removeEventListener('tenantChanged', handleTenantChange);
      window.removeEventListener('storage', handleTenantChange);
    };
  }, []);

  useEffect(() => {
    // Subscribe to tenant features document
    const unsubFeatures = onTenantDocSnapshot(db, 'settings', 'features', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.features) {
          setTenantFeatures({
            ...getDefaultFeatureConfig(),
            ...data.features,
          });
        }
      } else {
        setTenantFeatures(getDefaultFeatureConfig());
      }
    }, () => {});

    const unsubSpin = onTenantDocSnapshot(db, 'settings', 'spin_wheel', (snapshot) => {
      if (snapshot.exists()) setSpinWheelConfig(snapshot.data() as SpinWheelConfig);
    }, () => {});

    const unsubScratch = onTenantDocSnapshot(db, 'settings', 'scratch_win', (snapshot) => {
      if (snapshot.exists()) setScratchWinConfig(snapshot.data() as ScratchWinConfig);
    }, () => {});

    const unsubCelebration = onTenantDocSnapshot(db, 'settings', 'order_celebration', (snapshot) => {
      if (snapshot.exists()) setOrderCelebrationConfig(snapshot.data() as OrderCelebrationConfig);
    }, () => {});

    return () => {
      unsubFeatures();
      unsubSpin();
      unsubScratch();
      unsubCelebration();
    };
  }, [activeTenant]);

  const isFeatureEnabled = (featureId: string): boolean => {
    if (!featureId) return true;
    // Default to feature registry default if undefined
    if (tenantFeatures[featureId] !== undefined) {
      return Boolean(tenantFeatures[featureId]);
    }
    const def = getFeatureById(featureId);
    return def ? def.defaultEnabled : true;
  };

  const checkFeatureDependency = (featureId: string) => {
    return checkFeatureDependencies(featureId, tenantFeatures);
  };

  const updateTenantFeatureToggle = async (featureId: string, enabled: boolean) => {
    const activeId = getCurrentTenantId();
    const updated = { ...tenantFeatures, [featureId]: enabled };
    setTenantFeatures(updated);
    await saveTenantFeatureSettings(activeId, { features: updated }, 'Admin User');
  };

  const updateSpinWheelConfig = async (newConfig: SpinWheelConfig) => {
    setSpinWheelConfig(newConfig);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'spin_wheel'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore spin wheel sync failed', e);
    }
  };

  const updateScratchWinConfig = async (newConfig: ScratchWinConfig) => {
    setScratchWinConfig(newConfig);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'scratch_win'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore scratch win sync failed', e);
    }
  };

  const recordEngagementMetric = (metric: keyof EngagementAnalytics) => {
    setEngagementAnalytics((prev) => {
      const currentVal = prev[metric];
      if (typeof currentVal === 'number') {
        return {
          ...prev,
          [metric]: currentVal + 1,
        };
      }
      return prev;
    });
  };

  const updateOrderCelebrationConfig = async (newConfig: OrderCelebrationConfig) => {
    setOrderCelebrationConfig(newConfig);
    try {
      await setDoc(getTenantDocWriteRef(db, 'settings', 'order_celebration'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore order celebration sync failed', e);
    }
  };

  const triggerGlobalCelebration = () => {
    setIsCelebrating(true);
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        tenantFeatures,
        isFeatureEnabled,
        checkFeatureDependency,
        updateTenantFeatureToggle,
        spinWheelConfig,
        updateSpinWheelConfig,
        scratchWinConfig,
        updateScratchWinConfig,
        engagementAnalytics,
        recordEngagementMetric,
        orderCelebrationConfig,
        updateOrderCelebrationConfig,
        isCelebrating,
        setIsCelebrating,
        triggerGlobalCelebration,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  return context;
};
