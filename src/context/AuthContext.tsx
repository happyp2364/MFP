import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, CustomerProfile } from '../types';
import {
  auth,
  signInWithGoogle,
  logoutUser,
  onUserAuthChange,
  changeAdminPasswordFirebase,
  syncCustomerProfileInFirestore,
  recordAuditLog,
} from '../lib/firebase';
import { signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, User as FirebaseUser } from 'firebase/auth';
import { recordAdminLoginHistory } from '../lib/adminService';

interface AuthContextType {
  isAdmin: boolean;
  currentAdminUser: AdminUser | null;
  customerUser: FirebaseUser | null;
  customerProfile: CustomerProfile | null;
  isCustomerAuthLoading: boolean;
  customerAuthError: string | null;
  isTwoFactorEnabled: boolean;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogleAdmin: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  toggleTwoFactor: () => void;
  verifyReAuthentication: (pass: string) => Promise<boolean>;
  customerSignInWithGoogle: () => Promise<void>;
  customerSignOut: () => Promise<void>;
  updateCustomerProfileInFirestore: (updates: Partial<CustomerProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [customerUser, setCustomerUser] = useState<FirebaseUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isCustomerAuthLoading, setIsCustomerAuthLoading] = useState<boolean>(true);
  const [customerAuthError, setCustomerAuthError] = useState<string | null>(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onUserAuthChange(async (user) => {
      setCustomerUser(user);
      setIsCustomerAuthLoading(false);
      if (user) {
        setCustomerProfile({
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || 'Valued Customer',
          photoURL: user.photoURL || undefined,
          loginProvider: user.providerData?.[0]?.providerId || 'google',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
      } else {
        setCustomerProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        setIsAdmin(true);
        const adminData: AdminUser = {
          uid: res.user.uid,
          id: res.user.uid,
          email: res.user.email || email,
          name: res.user.displayName || 'Admin User',
          roleId: email === 'vpcreation2002@gmail.com' ? 'super_admin' : 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: 'system',
        };
        setCurrentAdminUser(adminData);
        await recordAdminLoginHistory(res.user.uid, res.user.email || email, 'password', 'success');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin login error', e);
      return false;
    }
  };

  const loginWithGoogleAdmin = async (): Promise<boolean> => {
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        setIsAdmin(true);
        const adminData: AdminUser = {
          uid: result.user.uid,
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'Admin User',
          roleId: result.user.email === 'vpcreation2002@gmail.com' ? 'super_admin' : 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: 'system',
        };
        setCurrentAdminUser(adminData);
        await recordAdminLoginHistory(result.user.uid, result.user.email || '', 'google', 'success');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin Google login error', e);
      return false;
    }
  };

  const logoutAdmin = async () => {
    setIsAdmin(false);
    setCurrentAdminUser(null);
    await logoutUser();
  };

  const changeAdminPassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    try {
      await changeAdminPasswordFirebase(oldPass, newPass);
      return true;
    } catch {
      return false;
    }
  };

  const toggleTwoFactor = () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
  };

  const verifyReAuthentication = async (pass: string): Promise<boolean> => {
    if (!auth.currentUser || !auth.currentUser.email) return false;
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, pass);
      await reauthenticateWithCredential(auth.currentUser, cred);
      return true;
    } catch {
      return false;
    }
  };

  const customerSignInWithGoogle = async () => {
    setIsCustomerAuthLoading(true);
    setCustomerAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setCustomerAuthError(e.message || 'Failed to sign in with Google');
    } finally {
      setIsCustomerAuthLoading(false);
    }
  };

  const customerSignOut = async () => {
    await logoutUser();
  };

  const updateCustomerProfileInFirestore = async (updates: Partial<CustomerProfile>) => {
    if (!customerUser) return;
    const updated = { ...customerProfile, ...updates } as CustomerProfile;
    setCustomerProfile(updated);
    await syncCustomerProfileInFirestore(customerUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        currentAdminUser,
        customerUser,
        customerProfile,
        isCustomerAuthLoading,
        customerAuthError,
        isTwoFactorEnabled,
        loginAdmin,
        loginWithGoogleAdmin,
        logoutAdmin,
        changeAdminPassword,
        toggleTwoFactor,
        verifyReAuthentication,
        customerSignInWithGoogle,
        customerSignOut,
        updateCustomerProfileInFirestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
