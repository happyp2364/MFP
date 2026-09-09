import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PhysicalStore } from '../types';
import { DEFAULT_PHYSICAL_STORES } from '../data/defaultStores';
import { CANONICAL_STORE_LOCATION } from '../data/storeLocation';
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

// Normalize store 1 to canonical store location
const normalizeStore = (store: PhysicalStore): PhysicalStore => {
  if (
    store.id === 'store-pipar-main' ||
    store.id === 'store-jodhpur-flagship' ||
    store.city?.toLowerCase().includes('pipar') ||
    (store.address && store.address.toUpperCase().includes('PIPAR'))
  ) {
    return {
      ...store,
      id: 'store-pipar-main',
      name: CANONICAL_STORE_LOCATION.legalName,
      address: 'JOJRI NADI KE PASS, MISTRI MARKET, PIPAR CITY',
      city: CANONICAL_STORE_LOCATION.city,
      state: CANONICAL_STORE_LOCATION.state,
      pincode: CANONICAL_STORE_LOCATION.pincode,
      latitude: CANONICAL_STORE_LOCATION.latitude,
      longitude: CANONICAL_STORE_LOCATION.longitude,
      googleMapsUrl: CANONICAL_STORE_LOCATION.googleMapsUrl,
    };
  }
  return store;
};

const StoreLocatorContext = createContext<StoreLocatorContextType | undefined>(undefined);

export const StoreLocatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [physicalStores, setPhysicalStores] = useState<PhysicalStore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PHYSICAL_STORES);
      const storesToLoad: PhysicalStore[] = saved ? JSON.parse(saved) : DEFAULT_PHYSICAL_STORES;
      return storesToLoad.map(normalizeStore);
    } catch {
      return DEFAULT_PHYSICAL_STORES.map(normalizeStore);
    }
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'physical_stores'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data().stores as PhysicalStore[];
          if (Array.isArray(data)) {
            setPhysicalStores(data.map(normalizeStore));
          }
        }
      },
      () => {}
    );

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
