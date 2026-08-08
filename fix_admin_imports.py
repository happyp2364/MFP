import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

if "buildWebsiteUrl" not in content[:1000]:
    import_stmt = "import { buildWebsiteUrl, buildAdminLoginUrl, getPlatformConfig } from './platformConfig';\n"
    # insert at top
    content = import_stmt + content
    
    with open('src/lib/adminService.ts', 'w') as f:
        f.write(content)

