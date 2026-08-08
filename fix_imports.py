import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

# Replace import if it doesn't have `where`
if "where," not in content and "where } from 'firebase/firestore'" not in content:
    content = content.replace("query,\n  orderBy,\n", "query,\n  orderBy,\n  where,\n")
    with open('src/lib/adminService.ts', 'w') as f:
        f.write(content)
