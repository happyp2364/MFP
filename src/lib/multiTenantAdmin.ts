import { AdminUser } from '../types';
import { setTenantId } from './tenantIsolation';

export function routeAdminToAssignedWebsite(adminUser: AdminUser) {
  if (adminUser.roleId === 'super_admin') return;
  if (adminUser.assignedWebsiteId) {
    setTenantId(adminUser.assignedWebsiteId);
  }
}
