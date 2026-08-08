import re

with open('src/lib/adminService.ts', 'r') as f:
    content = f.read()

# We need to replace the body of provisionNewWebsite
# Search for: export async function provisionNewWebsite(tenantData: ...
# up to: catch (err) { ... throw err; } }
match = re.search(r"export async function provisionNewWebsite\([^)]+\): Promise<\{ tenant: import\('\.\./types'\)\.Tenant, secretCode: string \}> \{.*?return \{ tenant: newTenant, secretCode \};\n  \} catch \(err\) \{.*?\n  \}\n\}", content, re.DOTALL)

if match:
    pass
else:
    print("Match failed")
