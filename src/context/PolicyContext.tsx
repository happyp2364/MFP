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
  ABOUT_US_CONFIG: 'mfp_about_us_config_live',
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
        const firestoreData = snapshot.data() as Partial<AboutUsConfig>;
        const mergedGallery = (firestoreData.gallery && firestoreData.gallery.length > 0 && !firestoreData.gallery[0].imageUrl?.includes('unsplash'))
          ? firestoreData.gallery
          : DEFAULT_ABOUT_US_CONFIG.gallery;
        
        const mergedOwners = (firestoreData.ownersAndTeam && firestoreData.ownersAndTeam.length > 0)
          ? firestoreData.ownersAndTeam.map((m, idx) => {
              const defaultMember = DEFAULT_ABOUT_US_CONFIG.ownersAndTeam[idx];
              return {
                ...m,
                profilePhoto: (m.profilePhoto && !m.profilePhoto.includes('unsplash'))
                  ? m.profilePhoto
                  : (defaultMember?.profilePhoto || '/images/shop/owners_vijay_parihar_viju_bhai_team.jpg')
              };
            })
          : DEFAULT_ABOUT_US_CONFIG.ownersAndTeam;

        const mainHeaderImage = (firestoreData.mainHeaderImage && !firestoreData.mainHeaderImage.includes('unsplash'))
          ? firestoreData.mainHeaderImage
          : DEFAULT_ABOUT_US_CONFIG.mainHeaderImage;

        setAboutUsConfig({
          ...DEFAULT_ABOUT_US_CONFIG,
          ...firestoreData,
          mainHeaderImage,
          ownersAndTeam: mergedOwners,
          gallery: mergedGallery,
        });
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
