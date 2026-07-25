import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
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
  getDocFromServer,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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

// Google OAuth Provider Setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://mail.google.com/');

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

// Google Sign-In helper
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setCachedAccessToken(credential.accessToken);
    }
    return { user: result.user, token: credential?.accessToken };
  } catch (err: any) {
    console.error('Google Auth Sign-In error:', err);
    throw err;
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
