import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

start_sig = "export async function provisionNewWebsite"
start_idx = content.find(start_sig)
end_idx = content.find("export async function createWebsiteBackup", start_idx)

# Extract original block
block = content[start_idx:end_idx]

# We will generate a new block that meticulously catches errors for each write.
new_block = """export async function provisionNewWebsite(tenantData: Partial<import('../types').Tenant> & { 
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

  const executeWrite = async (collectionName: string, docPath: string, action: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      console.error(`Provisioning Error - Collection: ${collectionName} | Doc: ${docPath}`, err);
      throw new Error(
        `Provisioning Failed at Collection: ${collectionName}\\n` +
        `Document Path: ${docPath}\\n` +
        `Firebase Error Code: ${err.code || 'UNKNOWN'}\\n` +
        `Firebase Error Message: ${err.message || String(err)}`
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
"""

content = content[:start_idx] + new_block + content[end_idx + len("/**\n * Initiates a full Firestore backup for a specific websiteId, archiving all core collections"):]

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)
