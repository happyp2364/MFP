import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PetShoeConfig } from '../types';
import { DEFAULT_PET_SHOE_CONFIG } from '../data/mockData';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface AIPetContextType {
  petShoeConfig: PetShoeConfig;
  updatePetShoeConfig: (config: PetShoeConfig) => Promise<void>;
}

const STORAGE_KEYS = {
  PET_SHOE_CONFIG: 'mfp_pet_shoe_config_live',
};

const AIPetContext = createContext<AIPetContextType | undefined>(undefined);

export const AIPetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [petShoeConfig, setPetShoeConfig] = useState<PetShoeConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PET_SHOE_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_PET_SHOE_CONFIG;
    } catch {
      return DEFAULT_PET_SHOE_CONFIG;
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'pet_shoe_config'), (snapshot) => {
      if (snapshot.exists()) {
        setPetShoeConfig(snapshot.data() as PetShoeConfig);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updatePetShoeConfig = async (config: PetShoeConfig) => {
    setPetShoeConfig(config);
    localStorage.setItem(STORAGE_KEYS.PET_SHOE_CONFIG, JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'pet_shoe_config'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore pet shoe config sync failed', e);
    }
  };

  return (
    <AIPetContext.Provider value={{ petShoeConfig, updatePetShoeConfig }}>
      {children}
    </AIPetContext.Provider>
  );
};

export const useAIPet = () => {
  const context = useContext(AIPetContext);
  if (!context) throw new Error('useAIPet must be used within AIPetProvider');
  return context;
};
