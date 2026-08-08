import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

backup_function = """

/**
 * Initiates a full Firestore backup for a specific websiteId, archiving all core collections
 * into a single document in the 'backups' collection.
 */
export async function createWebsiteBackup(websiteId: string, adminEmail: string, notes: string = ''): Promise<{ success: boolean; backupId?: string; message?: string }> {
  try {
    const timestamp = Date.now();
    const backupId = `backup_${websiteId}_${timestamp}`;
    const backupRef = doc(db, 'backups', backupId);
    
    // Define the collections we want to back up
    const collectionsToBackup = [
      'products', 'orders', 'users', 'reviews', 'settings', 'homepage', 'categories',
      'payment', 'animations', 'mascot', 'social', 'theme', 'about', 'coupons',
      'product_gallery', 'product_variants', 'product_ai_metadata', 'storeInfo'
    ];

    const backupData: any = {
      id: backupId,
      websiteId,
      createdAt: new Date().toISOString(),
      timestamp,
      createdBy: adminEmail,
      notes,
      collections: {}
    };

    // Since we are using top-level collections with websiteId filtering, or website/{id}/collections
    // Based on firestore rules, it looks like most data might be top-level or scoped by websiteId.
    // Let's fetch using collectionGroup or query.
    // If they are subcollections of /websites/{websiteId}, we fetch them that way.
    
    for (const coll of collectionsToBackup) {
      // Assuming subcollections of /websites/{websiteId}/{coll}
      const collRef = collection(db, 'websites', websiteId, coll);
      const snap = await getDocs(collRef);
      backupData.collections[coll] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    
    // Also backup top-level things that have websiteId = websiteId
    // e.g. products, orders
    const topLevelCollections = ['products', 'orders', 'users', 'reviews'];
    for (const topColl of topLevelCollections) {
       if (!backupData.collections[topColl] || backupData.collections[topColl].length === 0) {
         const topRef = collection(db, topColl);
         const q = query(topRef, where('websiteId', '==', websiteId));
         const snap = await getDocs(q);
         if (!snap.empty) {
            backupData.collections[topColl] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         }
       }
    }

    await setDoc(backupRef, backupData);

    await recordAuditLog(
      'Website Backup Created',
      'SYSTEM',
      `Full backup created for website: ${websiteId} by ${adminEmail}`,
      'SUCCESS',
      websiteId
    );

    return { success: true, backupId, message: 'Backup created successfully.' };
  } catch (error: any) {
    console.error('Backup creation failed:', error);
    await recordAuditLog(
      'Website Backup Failed',
      'SYSTEM',
      `Backup failed for website: ${websiteId}. Error: ${error.message}`,
      'FAILURE',
      websiteId
    );
    return { success: false, message: error.message };
  }
}
"""

if "createWebsiteBackup" not in content:
    content += backup_function
    with open('src/lib/adminService.ts', 'w') as f:
        f.write(content)

