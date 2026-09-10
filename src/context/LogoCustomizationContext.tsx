import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LogoCustomConfig } from '../types/logoCustomization';
import { DEFAULT_LOGO_CONFIG, DEFAULT_MARUDHAR_LOGO_SVG } from '../constants/defaultLogo';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface LogoCustomizationContextType {
  logoConfig: LogoCustomConfig;
  draftLogoConfig: LogoCustomConfig;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  updateDraftLogoConfig: (updates: Partial<LogoCustomConfig>) => void;
  saveLogoConfig: (userEmail?: string) => Promise<void>;
  resetToDefaultLogo: (userEmail?: string) => Promise<void>;
  removeLogo: (userEmail?: string) => Promise<void>;
}

const STORAGE_KEY = 'mfp_logo_config_live';

const LogoCustomizationContext = createContext<LogoCustomizationContextType | undefined>(undefined);

export const LogoCustomizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logoConfig, setLogoConfig] = useState<LogoCustomConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_LOGO_CONFIG, ...JSON.parse(saved) } : DEFAULT_LOGO_CONFIG;
    } catch {
      return DEFAULT_LOGO_CONFIG;
    }
  });

  const [draftLogoConfig, setDraftLogoConfig] = useState<LogoCustomConfig>(logoConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize Firestore doc 'settings/logo_config'
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      const docRef = doc(db, 'settings', 'logo_config');
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<LogoCustomConfig>;
            const merged: LogoCustomConfig = {
              ...DEFAULT_LOGO_CONFIG,
              ...data,
              // Fallback to default SVG if logoUrl is empty or invalid
              logoUrl: data.logoUrl || DEFAULT_MARUDHAR_LOGO_SVG,
            };
            setLogoConfig(merged);
            setDraftLogoConfig(merged);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } else {
            setLogoConfig(DEFAULT_LOGO_CONFIG);
            setDraftLogoConfig(DEFAULT_LOGO_CONFIG);
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn('Firestore settings/logo_config listener error:', error);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.warn('Error setting up logo_config listener:', err);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const hasUnsavedChanges = JSON.stringify(logoConfig) !== JSON.stringify(draftLogoConfig);

  const updateDraftLogoConfig = (updates: Partial<LogoCustomConfig>) => {
    setDraftLogoConfig((prev) => ({ ...prev, ...updates }));
  };

  const saveLogoConfig = async (userEmail?: string) => {
    const payload: LogoCustomConfig = {
      ...draftLogoConfig,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'Admin',
    };

    setLogoConfig(payload);
    setDraftLogoConfig(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    try {
      // 1. Save to settings/logo_config
      await setDoc(doc(db, 'settings', 'logo_config'), payload, { merge: true });

      // 2. Sync to website_config
      await setDoc(
        doc(db, 'settings', 'website_config'),
        {
          businessIdentity: {
            logoUrl: payload.logoUrl,
            lightLogoUrl: payload.logoUrl,
            darkLogoUrl: payload.logoUrl,
            logoType: payload.logoType,
            businessName: payload.brandNameText,
            displayName: payload.brandNameText,
          },
        },
        { merge: true }
      );

      // 3. Sync to store_info
      await setDoc(
        doc(db, 'settings', 'store_info'),
        {
          logoUrl: payload.logoUrl,
          logoType: payload.logoType,
          headerLogoText: payload.brandNameText,
          showHeaderLogo: payload.logoVisibility,
        },
        { merge: true }
      );

      // 4. Sync to website_design_config
      await setDoc(
        doc(db, 'settings', 'website_design_config'),
        {
          header: {
            logoWidth: payload.logoWidthDesktop,
            logoHeight: typeof payload.logoHeightDesktop === 'number' ? payload.logoHeightDesktop : 40,
          },
        },
        { merge: true }
      );
    } catch (e) {
      console.error('Failed to sync logo config to Firestore:', e);
      throw e;
    }
  };

  const resetToDefaultLogo = async (userEmail?: string) => {
    const defaultConfig: LogoCustomConfig = {
      ...DEFAULT_LOGO_CONFIG,
      logoUrl: DEFAULT_MARUDHAR_LOGO_SVG,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'Admin',
    };
    setDraftLogoConfig(defaultConfig);
    await saveLogoConfig(userEmail);
  };

  const removeLogo = async (userEmail?: string) => {
    const emptyConfig: LogoCustomConfig = {
      ...draftLogoConfig,
      logoUrl: '',
      logoVisibility: false,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'Admin',
    };
    setDraftLogoConfig(emptyConfig);
    await saveLogoConfig(userEmail);
  };

  return (
    <LogoCustomizationContext.Provider
      value={{
        logoConfig,
        draftLogoConfig,
        isLoading,
        hasUnsavedChanges,
        updateDraftLogoConfig,
        saveLogoConfig,
        resetToDefaultLogo,
        removeLogo,
      }}
    >
      {children}
    </LogoCustomizationContext.Provider>
  );
};

export const useLogoCustomization = () => {
  const context = useContext(LogoCustomizationContext);
  if (!context) {
    throw new Error('useLogoCustomization must be used within LogoCustomizationProvider');
  }
  return context;
};
