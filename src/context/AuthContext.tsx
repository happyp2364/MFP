import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser, CustomerProfile } from '../types';
import {
  auth,
  db,
  signInWithGoogle,
  logoutUser,
  onUserAuthChange,
  changeAdminPasswordFirebase,
  syncCustomerProfileInFirestore,
  recordAuditLog,
} from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, User as FirebaseUser } from 'firebase/auth';
import { recordAdminLoginHistory, fetchAdminUsers, saveAdminUser } from '../lib/adminService';

interface AuthContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
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
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [customerUser, setCustomerUser] = useState<FirebaseUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isCustomerAuthLoading, setIsCustomerAuthLoading] = useState<boolean>(true);
  const [customerAuthError, setCustomerAuthError] = useState<string | null>(null);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(false);

  const isSuperAdmin = Boolean(
    currentAdminUser?.roleId === 'super_admin' ||
    currentAdminUser?.email?.toLowerCase() === 'vpcreation2002@gmail.com' ||
    currentAdminUser?.email?.toLowerCase() === 'vishalpparihar2002@gmail.com'
  );

  const isAdmin = Boolean(
    currentAdminUser &&
    currentAdminUser.status !== 'disabled' &&
    (currentAdminUser.roleId === 'admin' ||
     currentAdminUser.roleId === 'super_admin' ||
     currentAdminUser.roleId === 'manager' ||
     currentAdminUser.roleId === 'staff' ||
     Boolean(currentAdminUser.roleId))
  );

  const resolveAdminUser = async (firebaseUser: FirebaseUser): Promise<AdminUser | null> => {
    const userEmailLower = (firebaseUser.email || '').toLowerCase();

    // 1. Try exact match by document ID (user.uid)
    try {
      const adminDocRef = doc(db, 'admin_users', firebaseUser.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (adminSnap.exists()) {
        const adminData = adminSnap.data() as AdminUser;
        if (adminData.status === 'disabled') return null;
        return {
          ...adminData,
          uid: firebaseUser.uid,
          email: adminData.email || firebaseUser.email || '',
        };
      }
    } catch (err) {
      console.warn('Error reading admin_users by UID:', err);
    }

    // 2. Try email match in admin_users collection
    try {
      const allAdmins = await fetchAdminUsers();
      const matched = allAdmins.find(
        (a) => a.email?.toLowerCase() === userEmailLower && a.status !== 'disabled'
      );
      if (matched) {
        const updatedAdminUser: AdminUser = {
          ...matched,
          uid: firebaseUser.uid,
          email: matched.email || firebaseUser.email || '',
        };
        // Persist matched UID in background
        saveAdminUser(updatedAdminUser).catch((e) => console.warn('Sync admin UID error:', e));
        return updatedAdminUser;
      }
    } catch (err) {
      console.warn('Error matching admin_users by email:', err);
    }

    // 3. Super Admin email fallback
    if (userEmailLower === 'vpcreation2002@gmail.com' || userEmailLower === 'vishalpparihar2002@gmail.com') {
      return {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Super Admin',
        roleId: 'super_admin',
        roleName: 'Super Admin',
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      };
    }

    return null;
  };

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

        try {
          const adminUser = await resolveAdminUser(user);
          if (adminUser) {
            setCurrentAdminUser(adminUser);
          } else {
            setCurrentAdminUser(null);
          }
        } catch (err) {
          console.warn('Failed to resolve admin user on auth state change:', err);
          setCurrentAdminUser(null);
        }
      } else {
        setCustomerProfile(null);
        setCurrentAdminUser(null);
      }
    });
    return () => unsub();
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        let adminUser = await resolveAdminUser(res.user);
        if (!adminUser) {
          const emailLower = email.toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          adminUser = {
            uid: res.user.uid,
            id: res.user.uid,
            email: res.user.email || email,
            name: res.user.displayName || (isSuper ? 'Super Admin' : 'Website Administrator'),
            roleId: isSuper ? 'super_admin' : 'admin',
            roleName: isSuper ? 'Super Admin' : 'Administrator',
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: 'system',
          };
          await saveAdminUser(adminUser);
        }
        setCurrentAdminUser(adminUser);
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
        let adminUser = await resolveAdminUser(result.user);
        if (!adminUser) {
          const emailLower = (result.user.email || '').toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          adminUser = {
            uid: result.user.uid,
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || (isSuper ? 'Super Admin' : 'Website Administrator'),
            roleId: isSuper ? 'super_admin' : 'admin',
            roleName: isSuper ? 'Super Admin' : 'Administrator',
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: 'system',
          };
          await saveAdminUser(adminUser);
        }
        setCurrentAdminUser(adminUser);
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
        isSuperAdmin,
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
