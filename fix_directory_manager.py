import re

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'r') as f:
    content = f.read()

# Replace onProvision implementation in WebsiteDirectoryManager
# Find: onProvision={async (tenantData) => { ... }} 
# Wait, I can just import provisionNewWebsite in WebsiteDirectoryManager and call it directly.

if "provisionNewWebsite" not in content:
    content = content.replace(
        "import { transferTenantOwnership } from '../../lib/adminService';",
        "import { transferTenantOwnership, provisionNewWebsite } from '../../lib/adminService';"
    )

old_provision = re.search(r"onProvision=\{async \(tenantData\) => \{.*?\n        \}\}", content, re.DOTALL)
if old_provision:
    new_provision = """onProvision={async (tenantData) => {
          try {
            const result = await provisionNewWebsite(tenantData as any);
            const generatedUrl = buildWebsiteUrl(result.tenant.slug || result.tenant.id);
            showToast('success', `Website URL created for "${result.tenant.name}" (${generatedUrl})`);
            
            // Refresh tenants list if we have a way... wait, we need to add to local state if possible or wait for sync
            // For now just return result so the modal can show step 6
            return result;
          } catch (err) {
            showToast('error', 'Failed to provision website');
            throw err; // So modal catches it
          }
        }}"""
    content = content[:old_provision.start()] + new_provision + content[old_provision.end():]

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'w') as f:
    f.write(content)

