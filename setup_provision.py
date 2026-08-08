import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

provision_func = """
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

  const tenantRef = doc(db, 'tenants', newTenant.id);
  const websiteRef = doc(db, 'websites', newTenant.id);
  
  try {
    await setDoc(tenantRef, newTenant, { merge: true });
    
    // Create websites/{websiteId} doc
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
    
    await setDoc(websiteRef, websiteData, { merge: true });
    
    // Create admin user link
    const adminRef = doc(db, 'admin_users', ownerUid);
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

    // Seed default documents
    const collectionsToSeed = [
      'settings', 'homepage', 'theme', 'social', 'payment', 
      'categories', 'notifications', 'analytics', 'products', 
      'orders', 'reviews', 'customers', 'staff', 'managers', 
      'media', 'seo'
    ];

    for (const col of collectionsToSeed) {
      const colRef = doc(db, `websites/${newTenant.id}/${col}`, 'default');
      await setDoc(colRef, {
        initializedAt: new Date().toISOString(),
        _type: 'system_default'
      }, { merge: true });
    }

    recordAuditLog(
      'New Website Provisioned',
      'SECURITY',
      `Provisioned website: ${newTenant.name} with slug: ${newTenant.slug}`,
      'SUCCESS'
    );

    return { tenant: newTenant, secretCode };
  } catch (err) {
    console.warn('Failed to provision website:', err);
    throw err;
  }
}
"""

content = content + "\n\n" + provision_func

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)

