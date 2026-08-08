import re

with open('src/types.ts', 'r') as f:
    content = f.read()

# Fix tenant status
old_status = "status: 'active' | 'suspended' | 'provisioning' | 'draft' | 'maintenance' | 'archived';"
new_status = "status: 'active' | 'suspended' | 'provisioning' | 'draft' | 'maintenance' | 'archived' | 'pending_activation' | 'pending';"

content = content.replace(old_status, new_status)

with open('src/types.ts', 'w') as f:
    f.write(content)

