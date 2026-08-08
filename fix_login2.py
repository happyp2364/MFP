import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

old_login2 = """        if (!adminUser) {
          const emailLower = email.toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          adminUser = {
            uid: res.user.uid,
            id: res.user.uid,
            email: res.user.email || email,
            name: res.user.displayName || (isSuper ? 'Super Admin' : 'Website Administrator'),
            roleId: isSuper ? 'super_admin' : 'admin',
            roleName: isSuper ? 'Super Admin' : 'Administrator',
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: 'system',
          };
          await saveAdminUser(adminUser);
        }"""

new_login2 = """        if (!adminUser) {
          const emailLower = email.toLowerCase();
          const isSuper = emailLower === 'vpcreation2002@gmail.com' || emailLower === 'vishalpparihar2002@gmail.com';
          if (isSuper) {
            adminUser = {
              uid: res.user.uid,
              id: res.user.uid,
              email: res.user.email || email,
              name: res.user.displayName || 'Super Admin',
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

content = content.replace(old_login2, new_login2)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

