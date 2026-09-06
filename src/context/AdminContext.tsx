import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AdminUser, AdminRole } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { normalizeAdminUser, sanitizeForFirestore } from '../lib/tenantUtils';

interface AdminContextType {
  createAdminUser: (user: Omit<AdminUser, 'createdAt'>) => Promise<void>;
  updateAdminUser: (id: string, user: Partial<AdminUser>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  createAdminRole: (role: Omit<AdminRole, 'id'>) => Promise<void>;
  updateAdminRole: (id: string, role: Partial<AdminRole>) => Promise<void>;
  deleteAdminRole: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const createAdminUser = async (user: Omit<AdminUser, 'createdAt'>) => {
    const targetUid = user.uid || `admin_${Date.now()}`;
    const newAdmin = normalizeAdminUser({
      ...user,
      uid: targetUid,
      id: targetUid,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'admin_users', targetUid), sanitizeForFirestore(newAdmin));
  };

  const updateAdminUser = async (id: string, user: Partial<AdminUser>) => {
    const clean = sanitizeForFirestore(user);
    await setDoc(doc(db, 'admin_users', id), clean, { merge: true });
  };

  const deleteAdminUser = async (id: string) => {
    await deleteDoc(doc(db, 'admin_users', id));
  };

  const createAdminRole = async (role: Omit<AdminRole, 'id'>) => {
    const newRole: AdminRole = {
      ...role,
      id: `role_${Date.now()}`,
    };
    await setDoc(doc(db, 'admin_roles', newRole.id), sanitizeForFirestore(newRole));
  };

  const updateAdminRole = async (id: string, role: Partial<AdminRole>) => {
    const clean = sanitizeForFirestore(role);
    await setDoc(doc(db, 'admin_roles', id), clean, { merge: true });
  };

  const deleteAdminRole = async (id: string) => {
    await deleteDoc(doc(db, 'admin_roles', id));
  };

  return (
    <AdminContext.Provider
      value={{
        createAdminUser,
        updateAdminUser,
        deleteAdminUser,
        createAdminRole,
        updateAdminRole,
        deleteAdminRole,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
