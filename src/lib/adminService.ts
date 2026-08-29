import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db, auth, recordAuditLog, OperationType, handleFirestoreError, sendAdminPasswordResetEmail as sendAdminPasswordResetEmailFirebase } from './firebase';
import {
  AdminUser,
  AdminRole,
  AdminLoginHistoryEntry,
  AdminPermissionMatrix,
} from '../types';
import {
  BUILTIN_ROLES,
  createFullPermissionMatrix,
  createNoPermissionMatrix,
  getDeviceInfo,
} from './adminPermissions';
import {
  normalizeAdminUser,
  isSuperAdminUser,
  normalizeTenantId,
  validateTenantAccess,
  KNOWN_TENANTS,
  SUPER_ADMIN_EMAILS,
} from './tenantUtils';

export {
  normalizeAdminUser,
  isSuperAdminUser,
  normalizeTenantId,
  validateTenantAccess,
  KNOWN_TENANTS,
  SUPER_ADMIN_EMAILS,
};

const SUPER_ADMIN_EMAIL = 'vpcreation2002@gmail.com';

// Guarantee Super Admin user record exists in Firestore admin_users collection
export async function ensureSuperAdminExists(
  firebaseUser?: FirebaseUser | null
): Promise<AdminUser> {
  const activeUser = firebaseUser || auth.currentUser;
  const targetUid = activeUser?.uid || 'super-admin-root';
  const targetEmail = (activeUser?.email || SUPER_ADMIN_EMAIL).trim().toLowerCase();
  const targetName = (activeUser?.displayName || 'Store Owner (Super Admin)').trim();

  const userDocRef = doc(db, 'admin_users', targetUid);

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const rawData = snap.data();
      const normalized = normalizeAdminUser({ ...rawData, uid: targetUid, id: targetUid });
      
      // Ensure super_admin role and active status for main owner
      if (
        (targetEmail === SUPER_ADMIN_EMAIL.toLowerCase() || isSuperAdminUser(normalized)) &&
        normalized.roleId !== 'super_admin'
      ) {
        const updated: AdminUser = {
          ...normalized,
          roleId: 'super_admin',
          roleName: 'Super Admin',
          status: 'active',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, updated, { merge: true });
        return updated;
      }
      return normalized;
    }
  } catch (err) {
    console.warn('[AdminService] Could not read admin_users doc:', err);
  }

  // Create primary Super Admin profile if non-existent
  const newSuperAdmin: AdminUser = normalizeAdminUser({
    uid: targetUid,
    id: targetUid,
    email: targetEmail,
    name: targetName,
    roleId: 'super_admin',
    role: 'super_admin',
    roleName: 'Super Admin',
    assignedWebsiteId: 'tenant-masrudharfashionpoint',
    websiteId: 'tenant-masrudharfashionpoint',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'SYSTEM_BOOTSTRAP',
    lastLogin: new Date().toISOString(),
    deviceInfo: getDeviceInfo(),
    loginHistory: [
      {
        id: `lh-${Date.now()}`,
        timestamp: new Date().toISOString(),
        device: getDeviceInfo(),
        loginMethod: activeUser?.providerData?.[0]?.providerId?.includes('google') ? 'google' : 'password',
        status: 'success',
      },
    ],
  });

  try {
    await setDoc(userDocRef, newSuperAdmin);
    recordAuditLog(
      'Super Admin Profile Initialized',
      'SECURITY',
      `Bootstrapped primary Super Admin record for ${targetEmail}`,
      'SUCCESS'
    );
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `admin_users/${targetUid}`);
    } catch (e) {
      console.warn('Super admin profile init notice:', e);
    }
  }

  return newSuperAdmin;
}

// Fetch all registered admin users with mandatory normalization
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, 'admin_users');
    const snap = await getDocs(colRef);
    const users: AdminUser[] = [];
    snap.forEach((docSnap) => {
      const raw = docSnap.data();
      const normalized = normalizeAdminUser({
        ...raw,
        uid: docSnap.id,
        id: docSnap.id,
      });
      users.push(normalized);
    });

    // Ensure super admin is included in array if collection is empty
    if (users.length === 0 && auth.currentUser) {
      const superAdmin = await ensureSuperAdminExists(auth.currentUser);
      return [superAdmin];
    }

    return users;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'admin_users');
    } catch (e) {
      console.warn('Fetch admin users notice:', e);
    }
    return [];
  }
}

// Fetch all custom defined admin roles
export async function fetchAdminRoles(): Promise<AdminRole[]> {
  try {
    const colRef = collection(db, 'admin_roles');
    const snap = await getDocs(colRef);
    const customRoles: AdminRole[] = [];
    snap.forEach((docSnap) => {
      const raw = docSnap.data() as AdminRole;
      customRoles.push({
        ...raw,
        id: docSnap.id,
        name: raw.name || 'Custom Role',
        description: raw.description || '',
        permissions: raw.permissions || createNoPermissionMatrix(),
      });
    });
    return customRoles;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'admin_roles');
    } catch (e) {
      console.warn('Fetch admin roles notice:', e);
    }
    return [];
  }
}

// Create or update admin user profile
export async function saveAdminUser(admin: Partial<AdminUser>): Promise<AdminUser> {
  const normalized = normalizeAdminUser(admin);
  const userRef = doc(db, 'admin_users', normalized.uid);
  try {
    await setDoc(userRef, normalized, { merge: true });
    recordAuditLog(
      'Admin Profile Updated',
      'SECURITY',
      `Updated profile & permissions for admin: ${normalized.email || normalized.name} (${normalized.roleName || normalized.roleId})`,
      'SUCCESS'
    );
    return normalized;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `admin_users/${normalized.uid}`);
    throw err;
  }
}

// Toggle admin account status (Active / Disabled) with Failsafe Guard
export async function toggleAdminStatus(
  uid: string,
  newStatus: 'active' | 'disabled',
  currentUserEmail: string
): Promise<{ success: boolean; message: string }> {
  const userRef = doc(db, 'admin_users', uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return { success: false, message: 'Admin account not found in system.' };
    }

    const adminData = normalizeAdminUser({ ...snap.data(), uid });

    // Failsafe: Prevent disabling primary Super Admin or sole Super Admin
    if (isSuperAdminUser(adminData)) {
      const allAdmins = await fetchAdminUsers();
      const activeSuperAdmins = allAdmins.filter(
        (a) => isSuperAdminUser(a) && a.status === 'active' && a.uid !== uid
      );
      if (activeSuperAdmins.length === 0 && newStatus === 'disabled') {
        return {
          success: false,
          message: 'Security Guard: Cannot disable the last active Super Admin account.',
        };
      }
    }

    const forceTime = newStatus === 'disabled' ? new Date().toISOString() : adminData.forceLoggedOutAt;

    await updateDoc(userRef, {
      status: newStatus,
      forceLoggedOutAt: forceTime,
      updatedAt: new Date().toISOString(),
    });

    recordAuditLog(
      `Admin Account ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
      'SECURITY',
      `${currentUserEmail || 'Admin'} ${newStatus === 'active' ? 'enabled' : 'disabled'} account ${adminData.email || adminData.name}`,
      newStatus === 'disabled' ? 'WARNING' : 'SUCCESS'
    );

    return {
      success: true,
      message: `Admin account ${adminData.email || adminData.name} is now ${newStatus.toUpperCase()}.`,
    };
  } catch (err: any) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, `admin_users/${uid}`);
    } catch (e) {
      console.warn('Toggle admin status notice:', e);
    }
    return { success: false, message: err?.message || 'Failed to update admin account status.' };
  }
}

// Delete admin user record with Failsafe Guard
export async function deleteAdminUser(
  uid: string,
  currentUserEmail: string
): Promise<{ success: boolean; message: string }> {
  const userRef = doc(db, 'admin_users', uid);

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return { success: false, message: 'Admin account not found.' };
    }

    const adminData = normalizeAdminUser({ ...snap.data(), uid });

    // Failsafe: Cannot delete primary Super Admin or last remaining Super Admin
    if (isSuperAdminUser(adminData)) {
      const allAdmins = await fetchAdminUsers();
      const otherSuperAdmins = allAdmins.filter(
        (a) => isSuperAdminUser(a) && a.status === 'active' && a.uid !== uid
      );
      if (otherSuperAdmins.length === 0) {
        return {
          success: false,
          message: 'Security Guard: Cannot delete the last remaining Super Admin account.',
        };
      }
    }

    await deleteDoc(userRef);

    recordAuditLog(
      'Admin Account Deleted',
      'SECURITY',
      `${currentUserEmail || 'Admin'} deleted admin user ${adminData.email || adminData.name}`,
      'DANGER'
    );

    return {
      success: true,
      message: `Admin user ${adminData.email || adminData.name} deleted successfully.`,
    };
  } catch (err: any) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `admin_users/${uid}`);
    } catch (e) {
      console.warn('Delete admin user notice:', e);
    }
    return { success: false, message: err?.message || 'Failed to delete admin user.' };
  }
}

// Force logout active session for a specific admin user
export async function forceLogoutAdminUser(
  uid: string,
  currentUserEmail: string
): Promise<{ success: boolean; message: string }> {
  const userRef = doc(db, 'admin_users', uid);

  try {
    const now = new Date().toISOString();
    await updateDoc(userRef, {
      forceLoggedOutAt: now,
      updatedAt: now,
    });

    recordAuditLog(
      'Admin Session Force Logout',
      'SECURITY',
      `${currentUserEmail || 'Admin'} issued force logout command for admin user UID: ${uid}`,
      'WARNING'
    );

    return {
      success: true,
      message: 'Force logout issued. Active user session terminated.',
    };
  } catch (err: any) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, `admin_users/${uid}`);
    } catch (e) {
      console.warn('Force logout admin user notice:', e);
    }
    return { success: false, message: err?.message || 'Failed to issue force logout.' };
  }
}

// Send Password Reset Email for Admin
export async function sendAdminPasswordResetEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Invalid admin email address.' };
  }
  try {
    return await sendAdminPasswordResetEmailFirebase(email);
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to send password reset email.' };
  }
}

// Record login event in Admin User's login history
export async function recordAdminLoginHistory(
  uid: string,
  email: string,
  loginMethod: 'google' | 'password',
  status: 'success' | 'failed'
): Promise<void> {
  const userRef = doc(db, 'admin_users', uid);
  const now = new Date().toISOString();
  const device = getDeviceInfo();

  const newHistoryEntry: AdminLoginHistoryEntry = {
    id: `lh-${Date.now()}`,
    timestamp: now,
    device,
    loginMethod,
    status,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
  };

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = normalizeAdminUser({ ...snap.data(), uid });
      const updatedHistory = [newHistoryEntry, ...(data.loginHistory || [])].slice(0, 25);
      await updateDoc(userRef, {
        lastLogin: now,
        deviceInfo: device,
        loginHistory: updatedHistory,
        updatedAt: now,
      });
    }
  } catch (e) {
    console.warn('[AdminService] Could not update login history:', e);
  }
}

// Create or update a custom role
export async function saveCustomRole(role: AdminRole): Promise<void> {
  const roleRef = doc(db, 'admin_roles', role.id);
  try {
    await setDoc(roleRef, {
      ...role,
      updatedAt: new Date().toISOString(),
    });
    recordAuditLog(
      'Admin Custom Role Saved',
      'SECURITY',
      `Saved custom role: "${role.name}" (${role.id})`,
      'SUCCESS'
    );
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `admin_roles/${role.id}`);
    } catch (e) {
      console.warn('Save custom role notice:', e);
    }
    throw err;
  }
}

// Delete custom role
export async function deleteCustomRole(
  roleId: string,
  currentUserEmail: string
): Promise<{ success: boolean; message: string }> {
  if (BUILTIN_ROLES.some((r) => r.id === roleId)) {
    return { success: false, message: 'Built-in system preset roles cannot be deleted.' };
  }

  const roleRef = doc(db, 'admin_roles', roleId);
  try {
    await deleteDoc(roleRef);
    recordAuditLog(
      'Admin Custom Role Deleted',
      'SECURITY',
      `${currentUserEmail || 'Admin'} deleted custom role ID: ${roleId}`,
      'WARNING'
    );
    return { success: true, message: 'Custom role deleted successfully.' };
  } catch (err: any) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `admin_roles/${roleId}`);
    } catch (e) {
      console.warn('Delete custom role notice:', e);
    }
    return { success: false, message: err?.message || 'Failed to delete custom role.' };
  }
}
