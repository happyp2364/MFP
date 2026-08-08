import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

# I want to modify loginWithGoogleAdmin to deny if not resolved, unless they are super admin.
old_login = """        let adminUser = await resolveAdminUser(result.user);
        if (!adminUser) {
          const emailLower = (result.user.email || '').toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          adminUser = {
            uid: result.user.uid,
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || (isSuper ? 'Super Admin' : 'Website Administrator'),
            roleId: isSuper ? 'super_admin' : 'admin',
            roleName: isSuper ? 'Super Admin' : 'Administrator',
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: 'system',
          };
          await saveAdminUser(adminUser);
        }"""

new_login = """        let adminUser = await resolveAdminUser(result.user);
        if (!adminUser) {
          const emailLower = (result.user.email || '').toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          if (isSuper) {
            adminUser = {
              uid: result.user.uid,
              id: result.user.uid,
              email: result.user.email || '',
              name: result.user.displayName || 'Super Admin',
              roleId: 'super_admin',
              roleName: 'Super Admin',
              status: 'active',
              createdAt: new Date().toISOString(),
              createdBy: 'system',
            };
            await saveAdminUser(adminUser);
          } else {
            console.warn('Denying activation: Email does not match any invited admin.');
            await logoutUser();
            return false;
          }
        }"""

content = content.replace(old_login, new_login)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

