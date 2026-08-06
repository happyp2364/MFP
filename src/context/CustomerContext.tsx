import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SoundConfig, CustomerSoundSettings, SoundType } from '../types';
import { DEFAULT_SOUND_CONFIG, DEFAULT_CUSTOMER_SOUND_SETTINGS } from '../data/mockData';
import { playSound, applyAudioCustomerSettings } from '../utils/audio';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface CustomerContextType {
  soundConfig: SoundConfig;
  updateSoundConfig: (config: SoundConfig) => Promise<void>;
  customerSoundSettings: CustomerSoundSettings;
  updateCustomerSoundSettings: (settings: Partial<CustomerSoundSettings>) => void;
  playSiteSound: (soundType: SoundType) => void;
}

const STORAGE_KEYS = {
  SOUND_CONFIG: 'mfp_sound_config_live',
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundConfig, setSoundConfig] = useState<SoundConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_SOUND_CONFIG;
    } catch {
      return DEFAULT_SOUND_CONFIG;
    }
  });

  const [customerSoundSettings, setCustomerSoundSettings] = useState<CustomerSoundSettings>(DEFAULT_CUSTOMER_SOUND_SETTINGS);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'sound_config'), (snapshot) => {
      if (snapshot.exists()) {
        setSoundConfig(snapshot.data() as SoundConfig);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const updateSoundConfig = async (config: SoundConfig) => {
    setSoundConfig(config);
    localStorage.setItem(STORAGE_KEYS.SOUND_CONFIG, JSON.stringify(config));
    try {
      await setDoc(doc(db, 'settings', 'sound_config'), config, { merge: true });
    } catch (e) {
      console.warn('Firestore sound config sync failed', e);
    }
  };

  const updateCustomerSoundSettings = (settings: Partial<CustomerSoundSettings>) => {
    const updated = { ...customerSoundSettings, ...settings };
    setCustomerSoundSettings(updated);
    applyAudioCustomerSettings(updated);
  };

  const playSiteSound = (soundType: SoundType) => {
    playSound(soundType);
  };

  return (
    <CustomerContext.Provider
      value={{
        soundConfig,
        updateSoundConfig,
        customerSoundSettings,
        updateCustomerSoundSettings,
        playSiteSound,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomer must be used within CustomerProvider');
  return context;
};
