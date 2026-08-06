import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PhysicalStore } from '../types';
import { DEFAULT_PHYSICAL_STORES } from '../data/defaultStores';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface StoreLocatorContextType {
  physicalStores: PhysicalStore[];
  addPhysicalStore: (store: Omit<PhysicalStore, 'id'>) => Promise<void>;
  updatePhysicalStore: (id: string, store: Partial<PhysicalStore>) => Promise<void>;
  deletePhysicalStore: (id: string) => Promise<void>;
  togglePhysicalStoreStatus: (id: string) => Promise<void>;
}

const STORAGE_KEYS = {
  PHYSICAL_STORES: 'mfp_physical_stores_live',
};

const StoreLocatorContext = createContext<StoreLocatorContextType | undefined>(undefined);

export const StoreLocatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [physicalStores, setPhysicalStores] = useState<PhysicalStore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHYSICAL_STORES);
      return saved ? JSON.parse(saved) : DEFAULT_PHYSICAL_STORES;
    } catch {
      return DEFAULT_PHYSICAL_STORES;
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'physical_stores'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().stores as PhysicalStore[];
        if (Array.isArray(data)) setPhysicalStores(data);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const saveStores = async (stores: PhysicalStore[]) => {
    setPhysicalStores(stores);
    localStorage.setItem(STORAGE_KEYS.PHYSICAL_STORES, JSON.stringify(stores));
    try {
      await setDoc(doc(db, 'settings', 'physical_stores'), { stores }, { merge: true });
    } catch (e) {
      console.warn('Firestore physical stores sync failed', e);
    }
  };

  const addPhysicalStore = async (store: Omit<PhysicalStore, 'id'>) => {
    const newStore: PhysicalStore = {
      ...store,
      id: `store_${Date.now()}`,
    };
    await saveStores([...physicalStores, newStore]);
  };

  const updatePhysicalStore = async (id: string, store: Partial<PhysicalStore>) => {
    const updated = physicalStores.map((s) => (s.id === id ? { ...s, ...store } : s));
    await saveStores(updated);
  };

  const deletePhysicalStore = async (id: string) => {
    const updated = physicalStores.filter((s) => s.id !== id);
    await saveStores(updated);
  };

  const togglePhysicalStoreStatus = async (id: string) => {
    const updated = physicalStores.map((s) =>
      s.id === id ? { ...s, isOpen: !s.isOpen } : s
    );
    await saveStores(updated);
  };

  return (
    <StoreLocatorContext.Provider
      value={{
        physicalStores,
        addPhysicalStore,
        updatePhysicalStore,
        deletePhysicalStore,
        togglePhysicalStoreStatus,
      }}
    >
      {children}
    </StoreLocatorContext.Provider>
  );
};

export const useStoreLocator = () => {
  const context = useContext(StoreLocatorContext);
  if (!context) throw new Error('useStoreLocator must be used within StoreLocatorProvider');
  return context;
};
