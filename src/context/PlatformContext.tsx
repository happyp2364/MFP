import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  StoreInfo,
  StoreBackupSnapshot,
  PublishedVersionHistory,
  PublishProgressState,
  PublishResult,
} from '../types';
import { STORE_INFO } from '../data/mockData';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { DEFAULT_HERO_CONTENT } from '../data/mockData';

interface PlatformContextType {
  publishedStoreInfo: StoreInfo;
  updateStoreInfo: (info: StoreInfo) => Promise<void>;
  createStoreBackup: (label?: string) => Promise<StoreBackupSnapshot>;
  restoreStoreBackup: (snapshot: StoreBackupSnapshot) => Promise<boolean>;
  publishedVersions: PublishedVersionHistory[];
  publishWebsite: () => Promise<PublishResult>;
  restorePublishedVersion: (versionId: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STORE_INFO: 'mfp_store_info_live',
};

export const PlatformProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publishedStoreInfo, setPublishedStoreInfo] = useState<StoreInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
      return saved ? JSON.parse(saved) : STORE_INFO;
    } catch {
      return STORE_INFO;
    }
  });

  const [publishedVersions, setPublishedVersions] = useState<PublishedVersionHistory[]>([]);

  useEffect(() => {
    const unsubStoreInfo = onSnapshot(doc(db, 'settings', 'store_info'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreInfo;
        setPublishedStoreInfo(data);
      }
    }, () => {});

    return () => {
      unsubStoreInfo();
    };
  }, []);

  const updateStoreInfo = async (info: StoreInfo) => {
    setPublishedStoreInfo(info);
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(info));
    try {
      await setDoc(doc(db, 'settings', 'store_info'), info, { merge: true });
    } catch (e) {
      console.warn('Firestore store info sync failed', e);
    }
  };

  const createStoreBackup = async (_label = 'Manual Backup'): Promise<StoreBackupSnapshot> => {
    const backup: StoreBackupSnapshot = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      createdBy: 'Admin',
      dataSizeKb: 15,
      data: {
        products: [],
        reviews: [],
        storeInfo: publishedStoreInfo,
        heroContent: DEFAULT_HERO_CONTENT,
        announcements: [],
        categoryHighlights: [],
        trendingCollections: [],
      },
    };
    return backup;
  };

  const restoreStoreBackup = async (snapshot: StoreBackupSnapshot): Promise<boolean> => {
    if (snapshot.data?.storeInfo) {
      await updateStoreInfo(snapshot.data.storeInfo);
    }
    return true;
  };

  const publishWebsite = async (): Promise<PublishResult> => {
    return {
      success: true,
      versionNumber: 'Live',
      publishedAt: new Date().toISOString(),
      totalUpdatedDocs: 0,
      publishDuration: '0s',
      logs: [
        {
          id: `log_${Date.now()}`,
          name: 'Live Sync',
          status: 'success',
          timestamp: new Date().toISOString(),
          message: 'Live real-time sync active',
        },
      ],
      documentSize: '0 KB',
      batchSize: 0,
      numDocuments: 0,
      commitDuration: '0s',
      writeCount: 0,
    };
  };

  const restorePublishedVersion = async (_versionId: string): Promise<boolean> => {
    return true;
  };

  const resetToDefaults = async (): Promise<void> => {
    await updateStoreInfo(STORE_INFO);
    localStorage.clear();
  };

  return (
    <PlatformContext.Provider
      value={{
        publishedStoreInfo,
        updateStoreInfo,
        createStoreBackup,
        restoreStoreBackup,
        publishedVersions,
        publishWebsite,
        restorePublishedVersion,
        resetToDefaults,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within PlatformProvider');
  return context;
};
