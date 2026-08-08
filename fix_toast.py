import re

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'r') as f:
    content = f.read()

old_toast = "showToast('error', 'Failed to provision website');"
new_toast = "showToast('error', err instanceof Error ? err.message : 'Failed to provision website');"

content = content.replace(old_toast, new_toast)

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'w') as f:
    f.write(content)
