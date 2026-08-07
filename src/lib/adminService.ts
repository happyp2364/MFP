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
import { db, auth, recordAuditLog, OperationType, handleFirestoreError, createAdminNotificationInFirestore } from './firebase';
import {
  AdminUser,
  AdminRole,
  AdminLoginHistoryEntry,
  AdminPermissionMatrix,
  BuiltInAdminRoleId,
  Tenant,
  AdminNotification,
} from '../types';
import {
  BUILTIN_ROLES,
  createFullPermissionMatrix,
  getDeviceInfo,
} from './adminPermissions';
import { getPlatformConfig, buildWebsiteUrl, buildAdminLoginUrl } from './platformConfig';

const SUPER_ADMIN_EMAIL = 'vpcreation2002@gmail.com';
export const SUPER_ADMIN_EMAILS = ['vpcreation2002@gmail.com', 'vishalpparihar2002@gmail.com'];

// Guarantee Super Admin user record exists in Firestore admin_users collection
export async function ensureSuperAdminExists(
  firebaseUser?: FirebaseUser | null
): Promise<AdminUser> {
  const activeUser = firebaseUser || auth.currentUser;
  const targetUid = activeUser?.uid || 'super-admin-root';
  const targetEmail = activeUser?.email || SUPER_ADMIN_EMAIL;
  const targetName = activeUser?.displayName || 'Store Owner (Super Admin)';

  const userDocRef = doc(db, 'admin_users', targetUid);

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as AdminUser;
      // Ensure super_admin role and active status for main owner
      if (targetEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && data.roleId !== 'super_admin') {
        const updated: AdminUser = {
          ...data,
          roleId: 'super_admin',
          roleName: 'Super Admin',
          status: 'active',
        };
        await setDoc(userDocRef, updated, { merge: true });
        return updated;
      }
      return data;
    }
  } catch (err) {
    console.warn('[AdminService] Could not read admin_users doc:', err);
  }

  // Create primary Super Admin profile if non-existent
  const newSuperAdmin: AdminUser = {
    uid: targetUid,
    email: targetEmail,
    name: targetName,
    roleId: 'super_admin',
    roleName: 'Super Admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: 'SYSTEM_BOOTSTRAP',
    lastLogin: new Date().toISOString(),
    deviceInfo: getDeviceInfo(),
    loginHistory: [
      {
        id: `lh-${Date.now()}`,
        timestamp: new Date().toISOString(),
        device: getDeviceInfo(),
        loginMethod: activeUser?.providerData?.[0]?.providerId.includes('google') ? 'google' : 'password',
        status: 'success',
      },
    ],
  };

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

// Fetch all registered admin users
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const colRef = collection(db, 'admin_users');
    const snap = await getDocs(colRef);
    const users: AdminUser[] = [];
    snap.forEach((docSnap) => {
      users.push({ ...(docSnap.data() as AdminUser), uid: docSnap.id });
    });

    // Ensure super admin is included in array
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

// Fetch all deployed tenants
export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const colRef = collection(db, 'tenants');
    const snap = await getDocs(colRef);
    const tenants: Tenant[] = [];
    snap.forEach((docSnap) => {
      tenants.push({ ...(docSnap.data() as Tenant), id: docSnap.id });
    });
    
    // Return mock data if none exist (since we don't have a provisioning flow setting up a tenant yet)
    if (tenants.length === 0) {
       const config = getPlatformConfig();
       const defaultSlug = 'main-store';
       return [{
         id: 'tenant-default',
         slug: defaultSlug,
         name: `${config.platformDisplayName} Primary Instance`,
         domain: 'main-store.platform.app',
         websiteUrl: buildWebsiteUrl(defaultSlug, config),
         adminLoginUrl: buildAdminLoginUrl(defaultSlug, config),
         ownerId: 'vpcreation2002',
         ownerEmail: 'vpcreation2002@gmail.com',
         adminGoogleEmail: 'vpcreation2002@gmail.com',
         status: 'active',
         plan: 'enterprise',
         createdAt: new Date().toISOString(),
         databaseSize: 42.8
       }];
    }
    return tenants;
  } catch (err) {
    console.warn('Fetch tenants notice:', err);
    return [];
  }
}

export async function saveTenant(tenant: Tenant): Promise<void> {
  const tenantRef = doc(db, 'tenants', tenant.id);
  try {
    await setDoc(tenantRef, tenant, { merge: true });
    recordAuditLog(
      'Tenant Profile Updated',
      'SECURITY',
      `Updated profile for tenant: ${tenant.name}`,
      'SUCCESS'
    );
  } catch (err) {
    console.warn('Failed to save tenant:', err);
    throw err;
  }
}

// Securely transfer tenant ownership, update Firestore, create notification & audit log
export async function transferTenantOwnership(
  tenant: Tenant,
  newOwner: {
    ownerName: string;
    ownerEmail: string;
    adminGoogleEmail?: string;
    ownerPhone?: string;
    transferReason?: string;
  }
): Promise<Tenant> {
  const previousOwner = tenant.ownerEmail || 'Unassigned';
  const updatedTenant: Tenant = {
    ...tenant,
    ownerName: newOwner.ownerName,
    ownerEmail: newOwner.ownerEmail,
    adminGoogleEmail: newOwner.adminGoogleEmail || newOwner.ownerEmail,
    adminLoginStatus: newOwner.adminGoogleEmail ? 'pending_activation' : tenant.adminLoginStatus,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update Firestore tenant record
  await saveTenant(updatedTenant);

  // 2. Create persistent Admin Notification in Firestore
  const notifId = `notif-transfer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const notification: AdminNotification = {
    id: notifId,
    message: `👑 Website Ownership Transferred: Primary ownership of "${tenant.name}" was transferred from ${previousOwner} to ${newOwner.ownerName} (${newOwner.ownerEmail}).${newOwner.transferReason ? ` Reason: ${newOwner.transferReason}` : ''}`,
    timestamp: new Date().toISOString(),
    read: false,
    isRead: false,
    type: 'OWNERSHIP_TRANSFER',
  };
  await createAdminNotificationInFirestore(notification);

  // 3. Log Audit Trail
  recordAuditLog(
    'Website Ownership Transferred',
    'SECURITY',
    `Transferred ownership of website "${tenant.name}" (${tenant.id}) from ${previousOwner} to ${newOwner.ownerName} (${newOwner.ownerEmail}). Reason: ${newOwner.transferReason || 'Super Admin Manual Transfer'}`,
    'SUCCESS'
  );

  return updatedTenant;
}

// Fetch all custom defined admin roles
export async function fetchAdminRoles(): Promise<AdminRole[]> {
  try {
    const colRef = collection(db, 'admin_roles');
    const snap = await getDocs(colRef);
    const customRoles: AdminRole[] = [];
    snap.forEach((docSnap) => {
      customRoles.push({ ...(docSnap.data() as AdminRole), id: docSnap.id });
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
export async function saveAdminUser(admin: AdminUser): Promise<void> {
  const userRef = doc(db, 'admin_users', admin.uid);
  try {
    await setDoc(userRef, admin, { merge: true });
    recordAuditLog(
      'Admin Profile Updated',
      'SECURITY',
      `Updated profile & permissions for admin: ${admin.email} (${admin.roleName || admin.roleId})`,
      'SUCCESS'
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `admin_users/${admin.uid}`);
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

    const adminData = snap.data() as AdminUser;

    // Failsafe: Prevent disabling primary Super Admin or sole Super Admin
    if (
      adminData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
      adminData.roleId === 'super_admin'
    ) {
      const allAdmins = await fetchAdminUsers();
      const activeSuperAdmins = allAdmins.filter(
        (a) => a.roleId === 'super_admin' && a.status === 'active' && a.uid !== uid
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
    });

    recordAuditLog(
      `Admin Account ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`,
      'SECURITY',
      `${currentUserEmail} ${newStatus === 'active' ? 'enabled' : 'disabled'} account ${adminData.email}`,
      newStatus === 'disabled' ? 'WARNING' : 'SUCCESS'
    );

    return {
      success: true,
      message: `Admin account ${adminData.email} is now ${newStatus.toUpperCase()}.`,
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

    const adminData = snap.data() as AdminUser;

    // Failsafe: Cannot delete primary Super Admin or last remaining Super Admin
    if (
      adminData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
      adminData.roleId === 'super_admin'
    ) {
      const allAdmins = await fetchAdminUsers();
      const otherSuperAdmins = allAdmins.filter(
        (a) => a.roleId === 'super_admin' && a.status === 'active' && a.uid !== uid
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
      `${currentUserEmail} deleted admin user ${adminData.email}`,
      'DANGER'
    );

    return {
      success: true,
      message: `Admin user ${adminData.email} deleted successfully.`,
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
    });

    recordAuditLog(
      'Admin Session Force Logout',
      'SECURITY',
      `${currentUserEmail} issued force logout command for admin user UID: ${uid}`,
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
      const data = snap.data() as AdminUser;
      const updatedHistory = [newHistoryEntry, ...(data.loginHistory || [])].slice(0, 25);
      await updateDoc(userRef, {
        lastLogin: now,
        deviceInfo: device,
        loginHistory: updatedHistory,
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
      `${currentUserEmail} deleted custom role ID: ${roleId}`,
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
