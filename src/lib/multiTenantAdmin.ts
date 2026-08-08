import { AdminUser } from '../types';

export function routeAdminToAssignedWebsite(adminUser: AdminUser) {
  if (adminUser.roleId === 'super_admin') return;
  if (adminUser.assignedWebsiteId) {
    const config = { websiteId: adminUser.assignedWebsiteId, slug: adminUser.assignedWebsiteId.replace('tenant-', '') };
    localStorage.setItem('nwd_website_config_live', JSON.stringify(config));
    // Optional: reload the page or navigate to dashboard if needed
  }
}
