import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

bad_str = """/**
 * Initiates a full Firestore backup for a specific websiteId, archiving all core collections
''): Promise<{ success: boolean; backupId?: string; message?: string }> {"""

good_str = """/**
 * Initiates a full Firestore backup for a specific websiteId, archiving all core collections
 * into a single document in the 'backups' collection.
 */
export async function createWebsiteBackup(websiteId: string, adminEmail: string, notes: string = ''): Promise<{ success: boolean; backupId?: string; message?: string }> {"""

content = content.replace(bad_str, good_str)

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)
