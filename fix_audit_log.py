import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

content = content.replace("'SYSTEM',\n      `Full backup created for website: ${websiteId} by ${adminEmail}`,\n      'SUCCESS',\n      websiteId", "'BACKUP',\n      `Full backup created for website: ${websiteId} by ${adminEmail}`,\n      'SUCCESS'")

content = content.replace("'SYSTEM',\n      `Backup failed for website: ${websiteId}. Error: ${error.message}`,\n      'FAILURE',\n      websiteId", "'BACKUP',\n      `Backup failed for website: ${websiteId}. Error: ${error.message}`,\n      'DANGER'")

with open('src/lib/adminService.ts', 'w') as f:
    f.write(content)
