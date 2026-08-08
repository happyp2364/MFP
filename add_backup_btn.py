import re

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'r') as f:
    content = f.read()

# Add import
if "createWebsiteBackup" not in content:
    content = content.replace("provisionNewWebsite } from '../../lib/adminService';", "provisionNewWebsite, createWebsiteBackup } from '../../lib/adminService';")

# Add Backup Icon
if "DatabaseBackup" not in content and "Database," not in content:
    content = content.replace("  Archive,\n", "  Archive,\n  Database,\n")

# Add handleBackupWebsite
handle_backup = """
  const handleBackupWebsite = async (tenant: Tenant) => {
    if (!currentUser) return;
    triggerSuperAdminVerification(
      'CREATE DATABASE BACKUP',
      `ACTION: Initiate full Firestore backup for website "${tenant.name}" (${tenant.id})`,
      'This will snapshot all sub-collections and core data into the central backups collection.',
      async () => {
        try {
          showToast('info', `Backup initiated for ${tenant.name}...`);
          const res = await createWebsiteBackup(tenant.id, currentUser.email);
          if (res.success) {
            showToast('success', `Backup completed successfully. ID: ${res.backupId}`);
          } else {
            showToast('error', `Backup failed: ${res.message}`);
          }
        } catch (err: any) {
          showToast('error', `Failed to backup website: ${err.message}`);
        }
      }
    );
  };
"""
if "handleBackupWebsite" not in content:
    # Insert before handleStatusChange
    content = content.replace("  const handleStatusChange =", handle_backup + "\n  const handleStatusChange =")

# Add button
backup_btn = """                          {/* Backup */}
                          <button
                            onClick={() => handleBackupWebsite(tenant)}
                            title="Create Backup Snapshot"
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-blue-400 border border-neutral-800 rounded-lg transition-all"
                          >
                            <Database className="w-3.5 h-3.5" />
                          </button>
"""
if "title=\"Create Backup Snapshot\"" not in content:
    # Insert before /* Suspend / Restore */
    content = content.replace("                          {/* Suspend / Restore */}", backup_btn + "                          {/* Suspend / Restore */}")

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'w') as f:
    f.write(content)

