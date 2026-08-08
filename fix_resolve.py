import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

old_block = """      const matched = allAdmins.find(
        (a) => a.email?.toLowerCase() === userEmailLower && a.status !== 'disabled'
      );
      if (matched) {
        const updatedAdminUser: AdminUser = {
          ...matched,
          uid: firebaseUser.uid,
          email: matched.email || firebaseUser.email || '',
        };
        // Persist matched UID in background
        saveAdminUser(updatedAdminUser).catch((e) => console.warn('Sync admin UID error:', e));
        return updatedAdminUser;
      }"""

new_block = """      const matched = allAdmins.find(
        (a) => a.email?.toLowerCase() === userEmailLower && a.status !== 'disabled'
      );
      if (matched) {
        const updatedAdminUser: AdminUser = {
          ...matched,
          uid: firebaseUser.uid,
          id: firebaseUser.uid, // Also update ID so it overwrites or creates with correct ID
          email: matched.email || firebaseUser.email || '',
          status: 'active', // Activate upon first login
        };
        // Persist matched UID in background
        saveAdminUser(updatedAdminUser).catch((e) => console.warn('Sync admin UID error:', e));
        return updatedAdminUser;
      }"""

content = content.replace(old_block, new_block)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

