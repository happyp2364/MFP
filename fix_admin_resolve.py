import re

with open('src/context/AuthContext.tsx', 'r') as f:
    content = f.read()

old_resolve = """        const updatedAdminUser: AdminUser = {
          ...matched,
          uid: firebaseUser.uid,
          id: firebaseUser.uid, // Also update ID so it overwrites or creates with correct ID
          email: matched.email || firebaseUser.email || '',
          status: 'active', // Activate upon first login
        };
        // Persist matched UID in background
        saveAdminUser(updatedAdminUser).catch((e) => console.warn('Sync admin UID error:', e));
        return updatedAdminUser;"""

new_resolve = """        const updatedAdminUser: AdminUser = {
          ...matched,
          uid: firebaseUser.uid,
          id: firebaseUser.uid, 
          email: matched.email || firebaseUser.email || '',
          status: 'active',
        };
        // Persist matched UID in background and delete old placeholder if different
        (async () => {
          try {
            await saveAdminUser(updatedAdminUser);
            if (matched.uid !== firebaseUser.uid) {
              const { deleteDoc, doc } = await import('firebase/firestore');
              const { db } = await import('../lib/firebase');
              await deleteDoc(doc(db, 'admin_users', matched.uid));
            }
          } catch (e) {
            console.warn('Sync admin UID error:', e);
          }
        })();
        return updatedAdminUser;"""

content = content.replace(old_resolve, new_resolve)

with open('src/context/AuthContext.tsx', 'w') as f:
    f.write(content)

