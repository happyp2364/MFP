import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ProductFeedConfig,
  ButtonThemeConfig,
  WhatsAppTemplatesConfig,
  OpenBoxDeliveryConfig,
  PaymentSettings,
} from '../types';
import { DEFAULT_BUTTON_THEME_CONFIG } from '../types';
import { DEFAULT_WHATSAPP_TEMPLATES_CONFIG } from '../data/defaultWhatsAppTemplates';
import { DEFAULT_OPEN_BOX_DELIVERY_CONFIG } from '../types';
import { DEFAULT_PAYMENT_SETTINGS } from '../data/mockData';
import { getCurrentTenantId } from '../lib/tenantUtils';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export const DEFAULT_PRODUCT_FEED_CONFIG: ProductFeedConfig = {
  productsPerPage: 24,
  infiniteScroll: true,
  loadMoreButton: false,
  maxHomepageProducts: 48,
  maxCategoryProducts: 100,
  duplicateDetection: true,
  randomization: false,
  featuredPriority: 10,
  trendingPriority: 8,
  bestSellerPriority: 9,
  recentlyAddedPriority: 7,
};

interface AppConfigContextType {
  productFeedConfig: ProductFeedConfig;
  updateProductFeedConfig: (newConfig: Partial<ProductFeedConfig>) => Promise<void>;
  buttonThemeConfig: ButtonThemeConfig;
  updateButtonThemeConfig: (newConfig: Partial<ButtonThemeConfig>) => Promise<void>;
  whatsappTemplatesConfig: WhatsAppTemplatesConfig;
  updateWhatsAppTemplatesConfig: (newConfig: WhatsAppTemplatesConfig) => Promise<void>;
  resetWhatsAppTemplatesToDefault: () => Promise<void>;
  openBoxDeliveryConfig: OpenBoxDeliveryConfig;
  updateOpenBoxDeliveryConfig: (newConfig: OpenBoxDeliveryConfig) => Promise<void>;
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (newSettings: PaymentSettings) => Promise<boolean>;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCT_FEED_CONFIG: 'mfp_product_feed_config_live',
  BUTTON_THEME_CONFIG: 'mfp_button_theme_config_live',
  PAYMENT_SETTINGS: 'mfp_payment_settings_live',
  OPEN_BOX_DELIVERY_CONFIG: 'mfp_open_box_delivery_config_live',
};

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [productFeedConfig, setProductFeedConfig] = useState<ProductFeedConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCT_FEED_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCT_FEED_CONFIG;
    } catch {
      return DEFAULT_PRODUCT_FEED_CONFIG;
    }
  });

  const [buttonThemeConfig, setButtonThemeConfig] = useState<ButtonThemeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUTTON_THEME_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_BUTTON_THEME_CONFIG;
    } catch {
      return DEFAULT_BUTTON_THEME_CONFIG;
    }
  });

  const [whatsappTemplatesConfig, setWhatsappTemplatesConfig] = useState<WhatsAppTemplatesConfig>(
    DEFAULT_WHATSAPP_TEMPLATES_CONFIG
  );

  const [openBoxDeliveryConfig, setOpenBoxDeliveryConfig] = useState<OpenBoxDeliveryConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPEN_BOX_DELIVERY_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_OPEN_BOX_DELIVERY_CONFIG;
    } catch {
      return DEFAULT_OPEN_BOX_DELIVERY_CONFIG;
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENT_SETTINGS;
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
  });

  // Firestore subscriptions for remote config sync
  useEffect(() => {
    const unsubFeed = onSnapshot(doc(db, 'settings', 'product_feed'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ProductFeedConfig;
        setProductFeedConfig((prev) => ({ ...prev, ...data }));
      }
    }, () => {});

    const unsubButton = onSnapshot(doc(db, 'settings', 'button_theme'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ButtonThemeConfig;
        setButtonThemeConfig((prev) => ({ ...prev, ...data }));
      }
    }, () => {});

    const unsubPayment = onSnapshot(doc(db, 'settings', 'payment_settings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PaymentSettings;
        setPaymentSettings((prev) => ({ ...prev, ...data }));
      }
    }, () => {});

    const unsubWhatsApp = onSnapshot(doc(db, 'settings', 'whatsapp_templates'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WhatsAppTemplatesConfig;
        setWhatsappTemplatesConfig((prev) => ({ ...prev, ...data }));
      }
    }, () => {});

    const unsubOpenBox = onSnapshot(doc(db, 'settings', 'open_box_delivery'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as OpenBoxDeliveryConfig;
        setOpenBoxDeliveryConfig((prev) => ({ ...prev, ...data }));
      }
    }, () => {});

    return () => {
      unsubFeed();
      unsubButton();
      unsubPayment();
      unsubWhatsApp();
      unsubOpenBox();
    };
  }, []);

  const updateProductFeedConfig = async (newConfig: Partial<ProductFeedConfig>) => {
    const merged = { ...productFeedConfig, ...newConfig };
    setProductFeedConfig(merged);
    localStorage.setItem(STORAGE_KEYS.PRODUCT_FEED_CONFIG, JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', 'product_feed'), merged, { merge: true });
    } catch (e) {
      console.warn('Firestore feed config sync failed', e);
    }
  };

  const updateButtonThemeConfig = async (newConfig: Partial<ButtonThemeConfig>) => {
    const merged = { ...buttonThemeConfig, ...newConfig };
    setButtonThemeConfig(merged);
    localStorage.setItem(STORAGE_KEYS.BUTTON_THEME_CONFIG, JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', 'button_theme'), merged, { merge: true });
    } catch (e) {
      console.warn('Firestore button theme sync failed', e);
    }
  };

  const updateWhatsAppTemplatesConfig = async (newConfig: WhatsAppTemplatesConfig) => {
    setWhatsappTemplatesConfig(newConfig);
    try {
      await setDoc(doc(db, 'settings', 'whatsapp_templates'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore whatsapp config sync failed', e);
    }
  };

  const resetWhatsAppTemplatesToDefault = async () => {
    setWhatsappTemplatesConfig(DEFAULT_WHATSAPP_TEMPLATES_CONFIG);
    try {
      await setDoc(doc(db, 'settings', 'whatsapp_templates'), DEFAULT_WHATSAPP_TEMPLATES_CONFIG);
    } catch (e) {
      console.warn('Firestore whatsapp reset sync failed', e);
    }
  };

  const updateOpenBoxDeliveryConfig = async (newConfig: OpenBoxDeliveryConfig) => {
    setOpenBoxDeliveryConfig(newConfig);
    localStorage.setItem(STORAGE_KEYS.OPEN_BOX_DELIVERY_CONFIG, JSON.stringify(newConfig));
    try {
      await setDoc(doc(db, 'settings', 'open_box_delivery'), newConfig, { merge: true });
    } catch (e) {
      console.warn('Firestore open box config sync failed', e);
    }
  };

  const updatePaymentSettings = async (newSettings: PaymentSettings): Promise<boolean> => {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      console.error('[TENANT PAYMENT SAVE ERROR] Invalid tenantId');
      return false;
    }
    const merged = { ...paymentSettings, ...newSettings };
    setPaymentSettings(merged);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_SETTINGS, JSON.stringify(merged));
    try {
      await setDoc(doc(db, 'settings', 'payment_settings'), merged, { merge: true });
      return true;
    } catch (e: any) {
      console.error('[TENANT PAYMENT SAVE ERROR]', {
        tenantId,
        error: e?.message || e,
        code: e?.code,
      });
      return false;
    }
  };

  return (
    <AppConfigContext.Provider
      value={{
        productFeedConfig,
        updateProductFeedConfig,
        buttonThemeConfig,
        updateButtonThemeConfig,
        whatsappTemplatesConfig,
        updateWhatsAppTemplatesConfig,
        resetWhatsAppTemplatesToDefault,
        openBoxDeliveryConfig,
        updateOpenBoxDeliveryConfig,
        paymentSettings,
        updatePaymentSettings,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) throw new Error('useAppConfig must be used within AppConfigProvider');
  return context;
};
