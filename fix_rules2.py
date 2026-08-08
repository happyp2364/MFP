import re

with open('firestore.rules', 'r') as f:
    content = f.read()

# find everything between "    // Global Safety Helper Functions" and the last "  }"
start_idx = content.find("    // Public Products Catalog (Read-Only for Public, Write for Admins)")
end_idx = content.rfind("  }")

inner_rules = content[start_idx:end_idx]

wrapper = f"""
    match /websites/{{websiteId}} {{
{inner_rules}
    }}
"""

new_content = content[:end_idx] + wrapper + "\n  }\n}"

with open('firestore.rules', 'w') as f:
    f.write(new_content)

