import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
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
  const websiteRef = doc(db, 'websites', tenant.id);
  
  try {
    await setDoc(tenantRef, tenant, { merge: true });
    
    // Provision Website module synchronization
    const websiteData = {
      websiteId: tenant.id,
      websiteSlug: tenant.slug || tenant.id,
      websiteUrl: tenant.websiteUrl || '',
      businessName: tenant.name,
      ownerEmail: tenant.ownerEmail,
      ownerUid: tenant.ownerId || '',
      createdAt: tenant.createdAt || new Date().toISOString(),
      status: tenant.status || 'active',
      enabledModules: ['storefront', 'admin'],
    };
    
    await setDoc(websiteRef, websiteData, { merge: true });
    
    if (tenant.ownerId) {
      const adminRef = doc(db, 'admin_users', tenant.ownerId);
      await setDoc(adminRef, {
        uid: tenant.ownerId,
        email: tenant.ownerEmail,
        websiteId: tenant.id,
        ownerUid: tenant.ownerId,
        roleId: 'admin',
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

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
export async function syncAdminWebsiteLink(adminUser: AdminUser, websiteId: string): Promise<void> {
  if (adminUser.roleId === 'super_admin') return;
  try {
    const adminRef = doc(db, 'admin_users', adminUser.uid);
    await setDoc(adminRef, { assignedWebsiteId: websiteId }, { merge: true });

    const websiteRef = doc(db, 'websites', websiteId);
    const snap = await getDoc(websiteRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.ownerUid && data.ownerEmail === adminUser.email) {
        await setDoc(websiteRef, { ownerUid: adminUser.uid, adminUid: adminUser.uid }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Failed to sync admin website link:', err);
  }
}



export async function provisionNewWebsite(tenantData: Partial<import('../types').Tenant> & { 
  ownerName: string;
  ownerGoogleEmail: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  businessCategory: string;
  defaultTheme: string;
  primaryColor: string;
  secondaryColor: string;
  enabledModules: Record<string, boolean>;
}): Promise<{ tenant: import('../types').Tenant, secretCode: string }> {
  const newId = tenantData.slug ? `tenant-${tenantData.slug}` : `tenant-${Date.now()}`;
  const ownerUid = `owner-${Date.now()}`;
  const secretCode = `NWD-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const config = getPlatformConfig();
  const platformHost = (() => {
    try { return new URL(config.platformBaseUrl).hostname; } catch { return 'platform.app'; }
  })();

  const webUrl = tenantData.websiteUrl || (tenantData.slug ? buildWebsiteUrl(tenantData.slug) : undefined);
  const adminUrl = tenantData.adminLoginUrl || (tenantData.slug ? buildAdminLoginUrl(tenantData.slug) : undefined);

  const newTenant: import('../types').Tenant = {
    id: newId,
    slug: tenantData.slug,
    name: tenantData.name || 'Untitled Website',
    domain: tenantData.domain || `${tenantData.slug || newId}.${platformHost}`,
    websiteUrl: webUrl,
    adminLoginUrl: adminUrl,
    ownerEmail: tenantData.ownerEmail || 'owner@example.com',
    adminGoogleEmail: tenantData.ownerGoogleEmail || tenantData.ownerEmail || 'owner@example.com',
    ownerName: tenantData.ownerName || 'Store Owner',
    ownerId: ownerUid,
    status: 'pending_activation',
    plan: tenantData.plan || 'free',
    createdAt: new Date().toISOString(),
    databaseSize: 0,
    businessCategory: tenantData.businessCategory,
  };

  console.log("Firebase Connection Info:");
  console.log("projectId:", db.app.options.projectId);
  console.log("appId:", db.app.options.appId);
  console.log("authDomain:", db.app.options.authDomain);
  console.log("currentUser UID:", auth.currentUser?.uid);

  const executeWrite = async (collectionName: string, docPath: string, action: () => Promise<void>) => {
    console.log("Writing:", docPath);
    try {
      await action();
      console.log("Successfully wrote to:", docPath);
    } catch (error: any) {
      console.error("Provisioning Error:", error);
      if (error.code) { // checking if it's like a FirebaseError
        console.error("error.code:", error.code);
        console.error("error.message:", error.message);
        console.error("error.stack:", error.stack);
      }
      throw new Error(
        `Collection Name: ${collectionName}\n` +
        `Document Path: ${docPath}\n` +
        `Firebase Error Code: ${error.code || 'UNKNOWN'}\n` +
        `Firebase Error Message: ${error.message || String(error)}`
      );
    }
  };

  const tenantRef = doc(db, 'tenants', newTenant.id);
  const websiteRef = doc(db, 'websites', newTenant.id);
  
  // 1. Write tenants/{tenantId}
  await executeWrite('tenants', `tenants/${newTenant.id}`, async () => {
    await setDoc(tenantRef, newTenant, { merge: true });
  });

  // 2. Write websites/{websiteId} doc
  const websiteData = {
    websiteId: newTenant.id,
    websiteSlug: newTenant.slug || newTenant.id,
    websiteUrl: newTenant.websiteUrl || '',
    businessName: newTenant.name,
    ownerEmail: newTenant.ownerEmail,
    ownerUid: ownerUid,
    createdAt: newTenant.createdAt || new Date().toISOString(),
    status: 'pending',
    enabledModules: Object.entries(tenantData.enabledModules).filter(([_, enabled]) => enabled).map(([key]) => key),
    secretCode: secretCode,
    theme: {
      id: tenantData.defaultTheme,
      primaryColor: tenantData.primaryColor,
      secondaryColor: tenantData.secondaryColor,
    }
  };
  await executeWrite('websites', `websites/${newTenant.id}`, async () => {
    await setDoc(websiteRef, websiteData, { merge: true });
  });
  
  // 3. Write admin user link
  const adminRef = doc(db, 'admin_users', ownerUid);
  await executeWrite('admin_users', `admin_users/${ownerUid}`, async () => {
    await setDoc(adminRef, {
      uid: ownerUid,
      email: newTenant.ownerEmail,
      websiteId: newTenant.id,
      ownerUid: ownerUid,
      roleId: 'admin',
      status: 'pending_activation',
      secretCode: secretCode,
      createdAt: new Date().toISOString()
    }, { merge: true });
  });

  // 4. Seed default documents
  const collectionsToSeed = [
    'settings', 'homepage', 'theme', 'social', 'payment', 
    'categories', 'notifications', 'analytics', 'products', 
    'orders', 'reviews', 'customers', 'staff', 'managers', 
    'media', 'seo'
  ];

  for (const col of collectionsToSeed) {
    const docPath = `websites/${newTenant.id}/${col}/default`;
    const colRef = doc(db, `websites/${newTenant.id}/${col}`, 'default');
    await executeWrite(col, docPath, async () => {
      await setDoc(colRef, {
        initializedAt: new Date().toISOString(),
        _type: 'system_default'
      }, { merge: true });
    });
  }

  try {
    recordAuditLog(
      'New Website Provisioned',
      'SECURITY',
      `Provisioned website: ${newTenant.name} with slug: ${newTenant.slug}`,
      'SUCCESS'
    );
  } catch (err) {
    console.warn("Non-fatal: Failed to record audit log:", err);
  }

  return { tenant: newTenant, secretCode };
}
/**
 * Initiates a full Firestore backup for a specific websiteId, archiving all core collections
 * into a single document in the 'backups' collection.
 */
export async function createWebsiteBackup(websiteId: string, adminEmail: string, notes: string = ''): Promise<{ success: boolean; backupId?: string; message?: string }> {
  try {
    const timestamp = Date.now();
    const backupId = `backup_${websiteId}_${timestamp}`;
    const backupRef = doc(db, 'backups', backupId);
    
    // Define the collections we want to back up
    const collectionsToBackup = [
      'products', 'orders', 'users', 'reviews', 'settings', 'homepage', 'categories',
      'payment', 'animations', 'mascot', 'social', 'theme', 'about', 'coupons',
      'product_gallery', 'product_variants', 'product_ai_metadata', 'storeInfo'
    ];

    const backupData: any = {
      id: backupId,
      websiteId,
      createdAt: new Date().toISOString(),
      timestamp,
      createdBy: adminEmail,
      notes,
      collections: {}
    };

    // Since we are using top-level collections with websiteId filtering, or website/{id}/collections
    // Based on firestore rules, it looks like most data might be top-level or scoped by websiteId.
    // Let's fetch using collectionGroup or query.
    // If they are subcollections of /websites/{websiteId}, we fetch them that way.
    
    for (const coll of collectionsToBackup) {
      // Assuming subcollections of /websites/{websiteId}/{coll}
      const collRef = collection(db, 'websites', websiteId, coll);
      const snap = await getDocs(collRef);
      backupData.collections[coll] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    // Also backup top-level things that have websiteId = websiteId
    // e.g. products, orders
    const topLevelCollections = ['products', 'orders', 'users', 'reviews'];
    for (const topColl of topLevelCollections) {
       if (!backupData.collections[topColl] || backupData.collections[topColl].length === 0) {
         const topRef = collection(db, topColl);
         const q = query(topRef, where('websiteId', '==', websiteId));
         const snap = await getDocs(q);
         if (!snap.empty) {
            backupData.collections[topColl] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         }
       }
    }

    await setDoc(backupRef, backupData);

    await recordAuditLog(
      'Website Backup Created',
      'BACKUP',
      `Full backup created for website: ${websiteId} by ${adminEmail}`,
      'SUCCESS'
    );

    return { success: true, backupId, message: 'Backup created successfully.' };
  } catch (error: any) {
    console.error('Backup creation failed:', error);
    await recordAuditLog(
      'Website Backup Failed',
      'BACKUP',
      `Backup failed for website: ${websiteId}. Error: ${error.message}`,
      'DANGER'
    );
    return { success: false, message: error.message };
  }
}
