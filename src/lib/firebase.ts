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
  reauthenticateWithPopup,
  reauthenticateWithRedirect,
  updatePassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocFromServer,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { CustomerProfile, MarketingConsent, MarketingSubscriber, MarketingCampaign } from '../types';
import { scopeDoc, getCurrentTenantId } from './tenantIsolation';
import { resolveTenantCollection, getTenantCollectionWriteRef, getTenantDocWriteRef } from './firestoreMultiTenant';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);

// Suppress Firestore timestamp mismatch warnings
setLogLevel('silent');

// Enable persistent auth session across page reloads & tabs
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence warning:', err);
});

// Enable Firestore offline persistence for resilience
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence notice: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this environment');
  }
});

// Connection test on load
async function testFirestoreConnection() {
  try {
    await getDoc(getTenantDocWriteRef(db, '_connection_test_', 'test'));
    console.log('Firestore connection verified');
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      console.warn('Firestore connected (Security rules active)');
    } else if (err?.code === 'unavailable' || err?.message?.includes('offline') || err?.message?.includes('Could not reach Cloud Firestore')) {
      console.warn('Firestore operating in offline/cache mode');
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
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType | string,
  path: string | null = null
) {
  const parts = path ? path.split('/') : [];
  const collectionName = parts[0] || 'unknown';
  const documentId = parts.length > 1 ? parts.slice(1).join('/') : 'collection-level';
  const currentUserUid = auth.currentUser?.uid || 'unauthenticated';
  const opType = typeof operationType === 'string' ? (operationType as OperationType) : operationType;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUserUid,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType: opType,
    path,
  };
  console.error(
    `[PERMISSION/DB ERROR] Path: "${path || 'N/A'}", Collection: "${collectionName}", DocID: "${documentId}", User UID: "${currentUserUid}"`,
    JSON.stringify(errInfo)
  );
  throw new Error(JSON.stringify(errInfo));
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
let cachedAccessToken: string | null = localStorage.getItem('nwd_google_access_token');

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
  if (token) {
    localStorage.setItem('nwd_google_access_token', token);
  } else {
    localStorage.removeItem('nwd_google_access_token');
  }
}

// Synchronize or create Customer Profile in Firestore (/users/{uid})
export async function syncCustomerProfileInFirestore(user: FirebaseUser): Promise<CustomerProfile> {
  const userRef = getTenantDocWriteRef(db, 'users', user.uid);
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

// Helper to identify unauthorized domain errors from Firebase Auth
export function isUnauthorizedDomainError(err: any): boolean {
  if (!err) return false;
  const code = err.code || '';
  const msg = typeof err.message === 'string' ? (err.message || '').toLowerCase() : '';
  return (
    code === 'auth/unauthorized-domain' ||
    msg.includes('unauthorized-domain') ||
    msg.includes('unauthorized domain') ||
    msg.includes('domain is not authorized') ||
    msg.includes('unauthorized_domain') ||
    msg.includes('not authorized in firebase')
  );
}

const UNAUTHORIZED_DOMAIN_FRIENDLY_MSG =
  'Google Sign-In is temporarily unavailable because this website domain has not yet been authorized. Please contact the website administrator.';

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
  } catch (err: any) {
    console.error('Firebase Auth Redirect Result Error:', err);
    if (isUnauthorizedDomainError(err)) {
      const domainError = new Error(UNAUTHORIZED_DOMAIN_FRIENDLY_MSG);
      (domainError as any).code = 'auth/unauthorized-domain';
      throw domainError;
    }
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
    // Log complete raw Firebase error ONLY in browser console for debugging
    console.error('Firebase Auth Error [signInWithGoogle]:', err);

    if (isUnauthorizedDomainError(err)) {
      const domainError = new Error(UNAUTHORIZED_DOMAIN_FRIENDLY_MSG);
      (domainError as any).code = 'auth/unauthorized-domain';
      throw domainError;
    }

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
        if (isUnauthorizedDomainError(redirectErr)) {
          const domainError = new Error(UNAUTHORIZED_DOMAIN_FRIENDLY_MSG);
          (domainError as any).code = 'auth/unauthorized-domain';
          throw domainError;
        }
        throw redirectErr;
      }
    }

    // User-friendly error messages
    let userFriendlyMsg = 'Google Sign-In failed. Please try again.';
    if (err?.code === 'auth/invalid-api-key') {
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
  const logItem: AuditLogItem = scopeDoc({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    category,
    details,
    userEmail: auth.currentUser?.email || 'admin@nwd.app',
    status,
    ipAddress: '127.0.0.1 (Client Applet)',
  });

  // 1. Save to local storage cache for instant UI rendering
  try {
    const cached = localStorage.getItem('nwd_audit_logs');
    const logs: AuditLogItem[] = cached ? JSON.parse(cached) : [];
    logs.unshift(logItem);
    localStorage.setItem('nwd_audit_logs', JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    console.warn('Could not cache audit log in localStorage:', e);
  }

  // 2. Persist to Firestore auditLogs collection
  try {
    await addDoc(getTenantCollectionWriteRef(db, 'auditLogs'), logItem);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'auditLogs');
  }

  return logItem;
}

export async function fetchRemoteAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const q = query(await resolveTenantCollection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const logs: AuditLogItem[] = [];
    snap.forEach((docSnap) => {
      logs.push({ ...(docSnap.data() as AuditLogItem), id: docSnap.id });
    });
    return logs;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'auditLogs');
    } catch (e) {
      console.warn('Audit logs fetch notice:', e);
    }
    // Fallback to local storage
    const cached = localStorage.getItem('nwd_audit_logs');
    return cached ? JSON.parse(cached) : [];
  }
}

// Send Password Reset Email via Firebase Authentication
export async function sendAdminPasswordResetEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid admin email address.' };
    }

    await sendPasswordResetEmail(auth, cleanEmail);

    await recordAuditLog(
      'Admin Password Reset Email Sent',
      'SECURITY',
      `Password reset link sent to ${cleanEmail}`,
      'SUCCESS'
    );

    return {
      success: true,
      message: 'A password reset link has been sent to your email. Please check your inbox and spam folder.',
    };
  } catch (err: any) {
    console.error('sendPasswordResetEmail error:', err);
    if (
      err.code === 'auth/operation-not-allowed' ||
      err.code === 'auth/admin-restricted-operation'
    ) {
      return {
        success: false,
        message:
          'Email/Password authentication is disabled in your Firebase Console. Please enable Email/Password provider under Authentication > Sign-in method.',
      };
    } else if (err.code === 'auth/user-not-found') {
      return {
        success: false,
        message: 'No account found with this email address in Firebase Authentication.',
      };
    } else if (err.code === 'auth/invalid-email') {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      };
    } else if (err.code === 'auth/too-many-requests') {
      return {
        success: false,
        message: 'Too many password reset requests. Please wait a moment before trying again.',
      };
    } else if (err.code === 'auth/network-request-failed') {
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
      };
    } else {
      return {
        success: false,
        message: err.message || 'Failed to send password reset email. Please try again.',
      };
    }
  }
}

// Change Admin Password using Firebase Authentication
export async function changeAdminPasswordFirebase(
  currentPassword?: string,
  newPassword?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user = auth.currentUser;
    const adminEmail = user?.email || 'vpcreation2002@gmail.com';

    // 1. Detect if the current logged-in user authenticated via Google OAuth
    const isGoogleUser = user?.providerData.some((p) => p.providerId === 'google.com');

    if (user && isGoogleUser) {
      return {
        success: false,
        message: 'This account uses Google Sign-In. Password changes must be done through your Google Account.',
      };
    }

    if (!currentPassword) {
      return {
        success: false,
        message: 'Please enter your current admin password.',
      };
    }

    if (!newPassword) {
      return {
        success: false,
        message: 'Please enter your new admin password.',
      };
    }

    let activeUser = user;

    // 2. Re-authenticate the user with Email/Password before updating
    if (activeUser) {
      try {
        const credential = EmailAuthProvider.credential(activeUser.email || adminEmail, currentPassword);
        await reauthenticateWithCredential(activeUser, credential);
      } catch (reAuthErr: any) {
        console.warn('Re-authentication error:', reAuthErr);
        if (
          reAuthErr.code === 'auth/operation-not-allowed' ||
          reAuthErr.code === 'auth/admin-restricted-operation'
        ) {
          return {
            success: false,
            message:
              'Email/Password sign-in is disabled in your Firebase project. Please enable the Email/Password provider in the Firebase Console under Authentication > Sign-in method.',
          };
        } else if (
          reAuthErr.code === 'auth/wrong-password' ||
          reAuthErr.code === 'auth/invalid-credential' ||
          reAuthErr.code === 'auth/user-mismatch'
        ) {
          return {
            success: false,
            message: 'Current password verification failed: Incorrect current password.',
          };
        } else if (reAuthErr.code === 'auth/user-not-found') {
          return {
            success: false,
            message: 'Admin account not found in Firebase Authentication.',
          };
        } else if (reAuthErr.code === 'auth/requires-recent-login') {
          return {
            success: false,
            message: 'Your session has expired. Please log in again before updating your password.',
          };
        } else if (reAuthErr.code === 'auth/too-many-requests') {
          return {
            success: false,
            message: 'Too many unsuccessful attempts. Access temporarily locked for security. Please try again later.',
          };
        } else if (reAuthErr.code === 'auth/network-request-failed') {
          return {
            success: false,
            message: 'Network error. Please check your internet connection.',
          };
        } else {
          return {
            success: false,
            message: `Current password verification failed: ${reAuthErr.message || 'Invalid current password.'}`,
          };
        }
      }
    } else {
      // User is not active in auth.currentUser, attempt signing in
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, currentPassword);
        activeUser = cred.user;
      } catch (signInErr: any) {
        if (
          signInErr.code === 'auth/operation-not-allowed' ||
          signInErr.code === 'auth/admin-restricted-operation'
        ) {
          return {
            success: false,
            message:
              'Email/Password sign-in is disabled in your Firebase project. Please enable the Email/Password provider in the Firebase Console under Authentication > Sign-in method.',
          };
        } else if (
          signInErr.code === 'auth/wrong-password' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/user-not-found'
        ) {
          return {
            success: false,
            message: 'Current password verification failed: Incorrect current password.',
          };
        } else if (signInErr.code === 'auth/too-many-requests') {
          return {
            success: false,
            message: 'Too many unsuccessful attempts. Please try again later.',
          };
        } else if (signInErr.code === 'auth/network-request-failed') {
          return {
            success: false,
            message: 'Network error. Please check your internet connection.',
          };
        } else {
          return {
            success: false,
            message: `Sign-in failed: ${signInErr.message || 'Invalid credentials.'}`,
          };
        }
      }
    }

    if (!activeUser) {
      return {
        success: false,
        message: 'Admin authentication session not found. Please log in again.',
      };
    }

    // 3. Use updatePassword() correctly after re-authentication
    try {
      await updatePassword(activeUser, newPassword);
    } catch (updateErr: any) {
      console.warn('updatePassword error:', updateErr);
      if (
        updateErr.code === 'auth/operation-not-allowed' ||
        updateErr.code === 'auth/admin-restricted-operation'
      ) {
        return {
          success: false,
          message:
            'Email/Password sign-in is disabled in your Firebase project. Please enable the Email/Password provider in the Firebase Console under Authentication > Sign-in method.',
        };
      } else if (updateErr.code === 'auth/weak-password') {
        return {
          success: false,
          message: 'The new password is too weak. Please use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.',
        };
      } else if (updateErr.code === 'auth/requires-recent-login') {
        return {
          success: false,
          message: 'Your session has expired. Please log in again before updating your password.',
        };
      } else if (updateErr.code === 'auth/network-request-failed') {
        return {
          success: false,
          message: 'Network error. Please check your internet connection.',
        };
      } else if (updateErr.code === 'auth/too-many-requests') {
        return {
          success: false,
          message: 'Too many requests. Please wait a moment before trying again.',
        };
      } else {
        return {
          success: false,
          message: updateErr.message || 'Failed to update password.',
        };
      }
    }

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
    console.error('Firebase updatePassword exception:', err);
    let errorMsg = 'Failed to update password.';
    if (
      err.code === 'auth/operation-not-allowed' ||
      err.code === 'auth/admin-restricted-operation'
    ) {
      errorMsg =
        'Email/Password sign-in is disabled in your Firebase project. Please enable the Email/Password provider in the Firebase Console under Authentication > Sign-in method.';
    } else if (err.code === 'auth/weak-password') {
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

// Default Payment Gateway & UPI Settings
export const DEFAULT_PAYMENT_SETTINGS: import('../types').PaymentSettings = {
  merchantName: 'Multi-Store Platform Store',
  upiId: 'store@upi',
  upiName: 'Store Payment',
  qrCodeCustomImage: '',
  qrCodeUrl: '',
  paymentInstructions: 'Scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to make instant payment. Enter your transaction ID after payment.',
  paymentEnabled: true,
  minOrderAmount: 1,
  maxOrderAmount: 0,
  gatewayProvider: 'DIRECT_UPI_QR',
  apiKey: '',
  apiSecret: '',
  enableUPI: true,
  enableQR: true,
  enableCards: true,
  enableNetBanking: true,
  enableWallets: true,
  enableCOD: true,
  isTestMode: false,
  autoApprovePaidOrders: true,
  currencySymbol: '₹',
  gstPercent: 5,
  flatShippingRate: 80,
  standardDeliveryCharge: 80,
  freeShippingMinAmount: 999,
  noReturnPolicyEnabled: true,
  noExchangePolicyEnabled: true,
  policyText: 'No Return & No Exchange Policy',
  deliveryMessage: '🚚 Fast & Express Delivery Across India',
  estimatedDeliveryTime: '3-5 Business Days',
  enableConvenienceFee: true,
  convenienceFeePercent: 2,
  applyFeeToOnlineOnly: true,
  enableBuyNow: true,
  enableBuyWhatsApp: true,
  enableAddToCart: true,
  enableCashfree: true,
  actionButtonsOrder: ['BUY_NOW', 'BUY_WHATSAPP', 'ADD_TO_BAG'],
  buyNowButtonText: 'BUY NOW',
  buyNowButtonColor: '#0B8F63',
  buyWhatsAppButtonText: 'BUY ON WHATSAPP',
  buyWhatsAppButtonColor: '#25D366',
  addToBagButtonText: 'ADD TO BAG',
  addToBagButtonColor: '#171717',
};

// Fetch Payment Settings from Firestore
export async function fetchPaymentSettingsFromFirestore(): Promise<import('../types').PaymentSettings> {
  try {
    const docRef = getTenantDocWriteRef(db, 'paymentSettings', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_PAYMENT_SETTINGS, ...(snap.data() as object) } as import('../types').PaymentSettings;
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, 'paymentSettings/config');
    } catch (e) {
      console.warn('Payment settings fetch notice:', e);
    }
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

// Save Payment Settings in Firestore (Optimized fast single-document update)
export async function savePaymentSettingsInFirestore(
  settings: import('../types').PaymentSettings
): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'paymentSettings', 'config');
    // Direct merge update to single document
    await setDoc(docRef, settings, { merge: true });

    // Non-blocking asynchronous security audit log
    recordAuditLog(
      'Payment Settings Updated',
      'SETTINGS',
      `Updated UPI ID: ${settings.upiId}, Merchant: ${settings.merchantName}`,
      'SUCCESS'
    ).catch((logErr) => console.warn('Non-blocking audit log warning:', logErr));

    return true;
  } catch (err) {
    console.error('Error saving payment settings to Firestore:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, 'paymentSettings/config');
    } catch (e) {
      console.warn('Payment settings save notice:', e);
    }
    return false;
  }
}

// Save Order in Firestore
export async function saveOrderInFirestore(order: import('../types').CustomerOrder): Promise<boolean> {
  try {
    const scopedOrder = scopeDoc(order);
    const docRef = getTenantDocWriteRef(db, 'orders', order.id);
    await setDoc(docRef, scopedOrder);

    // Create persistent Admin Notification in Firestore collection
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const notifRef = getTenantDocWriteRef(db, 'notifications', notifId);
    await setDoc(notifRef, scopeDoc({
      id: notifId,
      orderId: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      productCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      paymentStatus: order.paymentStatus,
      timestamp: new Date().toISOString(),
      read: false,
    }));

    // If order is linked to a logged-in user, also sync to customer's order history array
    if (order.userId) {
      try {
        const userRef = getTenantDocWriteRef(db, 'users', order.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profile = userSnap.data() as import('../types').CustomerProfile;
          const updatedHistory = [order, ...(profile.orderHistory || []).filter((o) => o.id !== order.id)];
          await setDoc(userRef, { orderHistory: updatedHistory }, { merge: true });
        }
      } catch (e) {
        console.warn('Could not sync order to user profile document:', e);
      }
    }

    recordAuditLog(
      'New Order Placed',
      'PRODUCT',
      `Order ${order.id} placed by ${order.customerName} for ₹${order.totalAmount} (${order.paymentStatus})`,
      'SUCCESS'
    );
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `orders/${order.id}`);
    } catch (e) {
      console.warn('Save order notice:', e);
    }
    return false;
  }
}

// Update Order Status in Firestore
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: import('../types').OrderStatus,
  trackingNumber?: string,
  courierName?: string,
  note?: string
): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;

    const existing = snap.data() as import('../types').CustomerOrder;
    const now = new Date().toISOString();
    const updatedHistory = [
      ...(existing.statusHistory || []),
      { status: newStatus, timestamp: now, note: note || `Order status changed to ${newStatus}` },
    ];

    const updatePayload: Partial<import('../types').CustomerOrder> = {
      orderStatus: newStatus,
      updatedAt: now,
      statusHistory: updatedHistory,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(courierName ? { courierName } : {}),
    };

    await setDoc(docRef, updatePayload, { merge: true });

    // Also sync to user profile orderHistory if userId present
    if (existing.userId) {
      try {
        const userRef = getTenantDocWriteRef(db, 'users', existing.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profile = userSnap.data() as import('../types').CustomerProfile;
          const updatedHistoryList = (profile.orderHistory || []).map((o) =>
            o.id === orderId ? { ...o, ...updatePayload } : o
          );
          await setDoc(userRef, { orderHistory: updatedHistoryList }, { merge: true });
        }
      } catch (e) {
        console.warn('Could not update user profile order history:', e);
      }
    }

    recordAuditLog(
      'Order Status Updated',
      'PRODUCT',
      `Order ${orderId} status changed to ${newStatus}`,
      'SUCCESS'
    );
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    } catch (e) {
      console.warn('Update order status notice:', e);
    }
    return false;
  }
}

// Fetch Remote Orders from Firestore
export async function fetchRemoteOrders(): Promise<import('../types').CustomerOrder[]> {
  try {
    const q = query(await resolveTenantCollection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const list: import('../types').CustomerOrder[] = [];
    snap.forEach((d) => {
      list.push(d.data() as import('../types').CustomerOrder);
    });
    return list;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'orders');
    } catch (e) {
      console.warn('Fetch remote orders notice:', e);
    }
    return [];
  }
}

// Save Transaction Record
export async function saveTransactionInFirestore(tx: import('../types').TransactionRecord): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'transactions', tx.id);
    await setDoc(docRef, tx);
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
    } catch (e) {
      console.warn('Save transaction notice:', e);
    }
    return false;
  }
}

// Save Admin Notification in Firestore
export async function createAdminNotificationInFirestore(
  notif: import('../types').AdminNotification
): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'notifications', notif.id);
    await setDoc(docRef, notif);
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `notifications/${notif.id}`);
    } catch (e) {
      console.warn('Create admin notification notice:', e);
    }
    return false;
  }
}

// ----------------------------------------------------------------------------
// CUSTOMER ENGAGEMENT & MARKETING AUTOMATION FIRESTORE SERVICES
// ----------------------------------------------------------------------------

/**
 * Save or update Customer Marketing Preferences in Firestore
 */
export async function saveMarketingConsentInFirestore(
  consent: MarketingConsent,
  userEmail?: string,
  userName?: string,
  phoneNumber?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const currentUser = auth.currentUser;
  const email = userEmail || currentUser?.email || '';
  const name = userName || currentUser?.displayName || email.split('@')[0] || 'Valued Customer';
  const phone = phoneNumber || currentUser?.phoneNumber || '';

  const fullConsentPayload: MarketingConsent = {
    accepted: consent.accepted ?? (consent.email || consent.push || consent.whatsApp),
    marketingEnabled: consent.accepted ?? (consent.email || consent.push || consent.whatsApp),
    email: Boolean(consent.email),
    emailMarketing: Boolean(consent.email),
    push: Boolean(consent.push),
    pushNotifications: Boolean(consent.push),
    whatsApp: Boolean(consent.whatsApp),
    whatsappMarketing: Boolean(consent.whatsApp),
    updatedAt: consent.updatedAt || now,
    updatedBy: email || currentUser?.uid || 'Customer',
  };

  console.log('[DEBUG] saveMarketingConsentInFirestore -> Initiated');
  console.log('[DEBUG] UID:', currentUser?.uid || 'guest');
  console.log('[DEBUG] User Email:', email);
  console.log('[DEBUG] Payload:', fullConsentPayload);

  try {
    // 1. Update user profile if authenticated
    if (currentUser?.uid) {
      const userRef = getTenantDocWriteRef(db, 'users', currentUser.uid);
      console.log('[DEBUG] Firestore Path (users):', `users/${currentUser.uid}`);
      await setDoc(userRef, { marketingConsent: fullConsentPayload }, { merge: true });
      console.log('[DEBUG] Firestore Response (users): SUCCESS');
    }

    // 2. Upsert subscriber entry in marketingSubscribers collection
    if (email) {
      const subId = (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const subRef = getTenantDocWriteRef(db, 'marketingSubscribers', subId);
      console.log('[DEBUG] Firestore Path (marketingSubscribers):', `marketingSubscribers/${subId}`);
      const subscriberDoc: MarketingSubscriber = {
        id: subId,
        name,
        email,
        phoneNumber: phone,
        preferences: fullConsentPayload,
        pushPermissionGranted: fullConsentPayload.push,
        subscribedAt: now,
      };
      await setDoc(subRef, subscriberDoc, { merge: true });
      console.log('[DEBUG] Firestore Response (marketingSubscribers): SUCCESS');
    }

    recordAuditLog(
      'Marketing Preferences Updated',
      'SETTINGS',
      `Updated engagement channels for ${email || 'guest'} (Email: ${fullConsentPayload.email}, Push: ${fullConsentPayload.push}, WhatsApp: ${fullConsentPayload.whatsApp})`,
      'SUCCESS'
    );
    return true;
  } catch (err: any) {
    console.error('[DEBUG] saveMarketingConsentInFirestore -> FAILED:', err);
    handleFirestoreError(err, OperationType.WRITE, 'marketingSubscribers');
    throw err;
  }
}

/**
 * Fetch all Marketing Subscribers
 */
export async function fetchMarketingSubscribersFromFirestore(): Promise<MarketingSubscriber[]> {
  try {
    const q = query(await resolveTenantCollection(db, 'marketingSubscribers'), limit(200));
    const snap = await getDocs(q);
    const subscribers: MarketingSubscriber[] = [];
    snap.forEach((d) => {
      subscribers.push(d.data() as MarketingSubscriber);
    });
    return subscribers;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'marketingSubscribers');
    } catch (e) {
      console.warn('Fetch marketing subscribers notice:', e);
    }
    return [];
  }
}

/**
 * Fetch all Marketing Campaigns
 */
export async function fetchMarketingCampaignsFromFirestore(): Promise<MarketingCampaign[]> {
  try {
    const q = query(await resolveTenantCollection(db, 'marketingCampaigns'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const list: MarketingCampaign[] = [];
    snap.forEach((d) => {
      list.push(d.data() as MarketingCampaign);
    });
    return list;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'marketingCampaigns');
    } catch (e) {
      console.warn('Fetch marketing campaigns notice:', e);
    }
    return [];
  }
}

/**
 * Save or update Marketing Campaign
 */
export async function saveMarketingCampaignInFirestore(
  campaign: MarketingCampaign
): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'marketingCampaigns', campaign.id);
    await setDoc(docRef, campaign, { merge: true });
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `marketingCampaigns/${campaign.id}`);
    } catch (e) {
      console.warn('Save marketing campaign notice:', e);
    }
    return false;
  }
}

/**
 * Delete Marketing Campaign
 */
export async function deleteMarketingCampaignFromFirestore(campaignId: string): Promise<boolean> {
  try {
    const docRef = getTenantDocWriteRef(db, 'marketingCampaigns', campaignId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `marketingCampaigns/${campaignId}`);
    } catch (e) {
      console.warn('Delete marketing campaign notice:', e);
    }
    return false;
  }
}


