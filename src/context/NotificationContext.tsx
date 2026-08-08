import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminNotification, ToastState } from '../types';
import { db } from '../lib/firebase';
import { onTenantCollectionSnapshot, onTenantDocSnapshot } from '../lib/onSnapshotMultiTenant';
import { getTenantCollectionWriteRef, getTenantDocWriteRef } from '../lib/firestoreMultiTenant';
import { collection, limit, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface NotificationContextType {
  notifications: AdminNotification[];
  activeOrderNotification: AdminNotification | null;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  toastMessage: ToastState | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeOrderNotification, setActiveOrderNotification] = useState<AdminNotification | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastState | null>(null);

  useEffect(() => {
    const unsub = onTenantCollectionSnapshot(db, 'notifications', [orderBy('timestamp', 'desc'), limit(300)], (snapshot) => {
      const loaded: AdminNotification[] = [];
      snapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...(docSnap.data() as any) } as AdminNotification);
      });
      setNotifications(loaded);
      const unread = loaded.find((n) => (!n.read && !n.isRead) && n.type === 'new_order');
      if (unread) {
        setActiveOrderNotification(unread);
      } else {
        setActiveOrderNotification(null);
      }
    }, () => {});

    return () => unsub();
  }, []);

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    try {
      await updateDoc(getTenantDocWriteRef(db, 'notifications', id), { read: true, isRead: true });
    } catch (e) {
      console.warn('Firestore notification update failed', e);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activeOrderNotification,
        markNotificationRead,
        clearAllNotifications,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
