import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CustomerProfile } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistent auth session across page reloads & tabs
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
});

// Connection test on load
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test_', 'test'));
    console.log('Firestore connection verified');
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn('Firestore connected (Security rules active)');
    } else {
      console.log('Firestore initialized');
    }
  }
}
testFirestoreConnection();

// Structured Firestore error handler per skill guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType | string,
  path: string | null = null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType: typeof operationType === 'string' ? OperationType.WRITE : operationType,
    path,
  };
  console.error('Firestore Security / DB Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Google OAuth Provider Setup - Standard Customer Authentication
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Google Workspace Provider Setup (includes additional Calendar & Gmail scopes for store fitting & messaging)
export const googleWorkspaceProvider = new GoogleAuthProvider();
googleWorkspaceProvider.setCustomParameters({
  prompt: 'select_account',
});
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/calendar');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');

// In-memory token store for Google Workspace API calls
let cachedAccessToken: string | null = localStorage.getItem('mfp_google_access_token');

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
  if (token) {
    localStorage.setItem('mfp_google_access_token', token);
  } else {
    localStorage.removeItem('mfp_google_access_token');
  }
}

// Synchronize or create Customer Profile in Firestore (/users/{uid})
export async function syncCustomerProfileInFirestore(user: FirebaseUser): Promise<CustomerProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingSnap = null;
  try {
    existingSnap = await getDoc(userRef);
  } catch (e) {
    console.warn('Could not read existing customer profile from Firestore:', e);
  }

  const now = new Date().toISOString();

  if (!existingSnap || !existingSnap.exists()) {
    // Automatically create a new user profile document in Firestore
    const newProfile: CustomerProfile = {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Valued Customer',
      email: user.email || '',
      photoURL: user.photoURL || '',
      phoneNumber: user.phoneNumber || '',
      loginProvider: user.providerData?.[0]?.providerId || 'google.com',
      createdAt: now,
      lastLogin: now,
      wishlist: [],
      savedAddresses: [],
      orderHistory: [],
    };

    try {
      await setDoc(userRef, newProfile);
      recordAuditLog('New Customer Profile Created', 'AUTH', `Created Firestore record for ${newProfile.email} (${user.uid})`, 'SUCCESS');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }

    return newProfile;
  } else {
    // Existing customer - restore profile and update lastLogin
    const existingData = existingSnap.data() as CustomerProfile;
    const updatedData: Partial<CustomerProfile> = {
      lastLogin: now,
      name: user.displayName || existingData.name,
      email: user.email || existingData.email,
      photoURL: user.photoURL || existingData.photoURL,
    };

    try {
      await setDoc(userRef, updatedData, { merge: true });
      recordAuditLog('Customer Profile Synchronized', 'AUTH', `Updated lastLogin for ${user.email}`, 'SUCCESS');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }

    return {
      ...existingData,
      ...updatedData,
    } as CustomerProfile;
  }
}

// Process redirect result if customer was redirected back from Google auth
export async function checkRedirectAuthResult(): Promise<{ user: FirebaseUser; profile: CustomerProfile; token?: string } | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
      }
      const profile = await syncCustomerProfileInFirestore(result.user);
      return { user: result.user, profile, token: credential?.accessToken };
    }
  } catch (err) {
    console.error('Error handling redirect result:', err);
  }
  return null;
}

// Universal Google Sign-In with automatic fallback (popup -> redirect)
export async function signInWithGoogle(useWorkspaceScopes: boolean = false): Promise<{ user: FirebaseUser; profile: CustomerProfile; token?: string }> {
  const provider = useWorkspaceScopes ? googleWorkspaceProvider : googleProvider;

  try {
    // Primary attempt: signInWithPopup
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedAccessToken(credential.accessToken);
    }
    const profile = await syncCustomerProfileInFirestore(result.user);
    return { user: result.user, profile, token: credential?.accessToken };
  } catch (err: any) {
    console.warn('signInWithPopup error, checking fallback condition:', err?.code || err);

    // Fallback conditions (popup blocked, closed, iframe restriction, or mobile browser)
    const shouldFallbackToRedirect =
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/operation-not-supported-in-this-environment';

    if (shouldFallbackToRedirect) {
      try {
        console.log('Initiating signInWithRedirect fallback...');
        await signInWithRedirect(auth, provider);
        throw new Error('Redirecting to Google Sign-In...');
      } catch (redirectErr: any) {
        console.error('signInWithRedirect failed:', redirectErr);
        throw redirectErr;
      }
    }

    // User-friendly error messages
    let userFriendlyMsg = 'Google Sign-In failed. Please try again.';
    if (err?.code === 'auth/unauthorized-domain') {
      userFriendlyMsg = 'This domain is not authorized in Firebase Authentication settings. Please contact the administrator.';
    } else if (err?.code === 'auth/invalid-api-key') {
      userFriendlyMsg = 'Invalid Firebase configuration key.';
    } else if (err?.code === 'auth/network-request-failed') {
      userFriendlyMsg = 'Network error. Please check your internet connection and try again.';
    } else if (err?.code === 'auth/account-exists-with-different-credential') {
      userFriendlyMsg = 'An account already exists with the same email address using a different sign-in method.';
    } else if (err?.message) {
      userFriendlyMsg = err.message;
    }

    const enhancedError = new Error(userFriendlyMsg);
    (enhancedError as any).code = err?.code;
    throw enhancedError;
  }
}

// Logout helper
export async function logoutUser() {
  await signOut(auth);
  setCachedAccessToken(null);
}

// Subscribe to auth state
export function onUserAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// Security Audit Event Logger
export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: 'AUTH' | 'PRODUCT' | 'SETTINGS' | 'BACKUP' | 'SECURITY' | 'MEDIA';
  details: string;
  userEmail: string;
  status: 'SUCCESS' | 'WARNING' | 'DANGER';
  ipAddress?: string;
}

export async function recordAuditLog(
  action: string,
  category: 'AUTH' | 'PRODUCT' | 'SETTINGS' | 'BACKUP' | 'SECURITY' | 'MEDIA',
  details: string,
  status: 'SUCCESS' | 'WARNING' | 'DANGER' = 'SUCCESS'
): Promise<AuditLogItem> {
  const logItem: AuditLogItem = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    details,
    userEmail: auth.currentUser?.email || 'admin@marudharfashionpoint.com',
    status,
    ipAddress: '127.0.0.1 (Client Applet)',
  };

  // 1. Save to local storage cache for instant UI rendering
  try {
    const cached = localStorage.getItem('mfp_audit_logs');
    const logs: AuditLogItem[] = cached ? JSON.parse(cached) : [];
    logs.unshift(logItem);
    localStorage.setItem('mfp_audit_logs', JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.warn('Could not cache audit log in localStorage:', e);
  }

  // 2. Persist to Firestore auditLogs collection
  try {
    await addDoc(collection(db, 'auditLogs'), logItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'auditLogs');
  }

  return logItem;
}

export async function fetchRemoteAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const logs: AuditLogItem[] = [];
    snap.forEach((docSnap) => {
      logs.push({ ...(docSnap.data() as AuditLogItem), id: docSnap.id });
    });
    return logs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'auditLogs');
    // Fallback to local storage
    const cached = localStorage.getItem('mfp_audit_logs');
    return cached ? JSON.parse(cached) : [];
  }
}

// Change Admin Password using Firebase Authentication
export async function changeAdminPasswordFirebase(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    let user = auth.currentUser;
    const adminEmail = user?.email || 'vpcreation2002@gmail.com';

    // 1. Ensure user is authenticated in Firebase Auth
    if (!user) {
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, currentPassword);
        user = cred.user;
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, adminEmail, currentPassword);
            user = newCred.user;
          } catch (createErr: any) {
            return {
              success: false,
              message: 'Incorrect current password. Please enter your valid current password.',
            };
          }
        } else if (signInErr.code === 'auth/wrong-password') {
          return {
            success: false,
            message: 'Incorrect current password. Please enter your valid current password.',
          };
        } else if (signInErr.code === 'auth/too-many-requests') {
          return {
            success: false,
            message: 'Too many failed login attempts. Access temporarily locked for security. Please try again later.',
          };
        } else if (signInErr.code === 'auth/network-request-failed') {
          return {
            success: false,
            message: 'Network error. Please check your internet connection.',
          };
        } else {
          return {
            success: false,
            message: 'Current password verification failed: ' + (signInErr.message || 'Invalid credentials'),
          };
        }
      }
    } else {
      // 2. Re-authenticate active user with currentPassword
      try {
        const credential = EmailAuthProvider.credential(adminEmail, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } catch (reAuthErr: any) {
        if (reAuthErr.code === 'auth/wrong-password' || reAuthErr.code === 'auth/invalid-credential') {
          return {
            success: false,
            message: 'Incorrect current password. Please enter your valid current password.',
          };
        } else if (reAuthErr.code === 'auth/too-many-requests') {
          return {
            success: false,
            message: 'Too many failed attempts. Access temporarily locked for security. Please try again later.',
          };
        } else if (reAuthErr.code === 'auth/network-request-failed') {
          return {
            success: false,
            message: 'Network error. Please check your internet connection.',
          };
        } else {
          return {
            success: false,
            message: 'Re-authentication failed: ' + (reAuthErr.message || 'Incorrect current password'),
          };
        }
      }
    }

    if (!user) {
      return { success: false, message: 'Admin authentication session not found. Please log in again.' };
    }

    // 3. Call Firebase updatePassword
    await updatePassword(user, newPassword);

    await recordAuditLog(
      'Admin Password Changed',
      'SECURITY',
      'Password updated securely via Firebase Authentication',
      'SUCCESS'
    );

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (err: any) {
    console.error('Firebase updatePassword error:', err);
    let errorMsg = 'Failed to update password.';
    if (err.code === 'auth/weak-password') {
      errorMsg = 'The new password is too weak according to Firebase security requirements.';
    } else if (err.code === 'auth/requires-recent-login') {
      errorMsg = 'Your session has expired. Please log out and log in again before updating your password.';
    } else if (err.code === 'auth/network-request-failed') {
      errorMsg = 'Network error. Please check your internet connection.';
    } else if (err.code === 'auth/too-many-requests') {
      errorMsg = 'Too many requests. Please wait a moment before trying again.';
    } else if (err.message) {
      errorMsg = err.message;
    }
    return { success: false, message: errorMsg };
  }
}
