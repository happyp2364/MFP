import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

# We need to make sure websites collection gets created properly and admin_users gets linked

# Look for saveTenant
# In saveTenant, we do:
# const websiteRef = doc(db, 'websites', tenant.id);
# await setDoc(websiteRef, { ... }, { merge: true });

# Also in WebsiteDirectoryManager, onProvision does:
# const newTenant: Tenant = { ... };
# await onUpdateTenant(newTenant); (which calls saveTenant)

# BUT the requirement says:
# "Create websites/{websiteId}" where websiteId = tenant.id
# "Store websiteId, websiteSlug, websiteUrl, businessName, ownerEmail, ownerUid, status, createdAt, enabledModules"
# "Link admin_users: websiteId, ownerUid, roleId"

new_save_tenant = """export async function saveTenant(tenant: Tenant): Promise<void> {
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
}"""

# replace saveTenant
content = re.sub(r"export async function saveTenant\(tenant: Tenant\): Promise<void> \{.*?\n\}", new_save_tenant, content, flags=re.DOTALL)

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)

