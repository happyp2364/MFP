import re

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'r') as f:
    content = f.read()

# Replace alert('Failed to provision website'); with the actual error message
content = content.replace(
    "alert('Failed to provision website');",
    "alert(err instanceof Error ? err.message : 'Failed to provision website');\n      // Also set an error state to show it on screen if preferred, but alert satisfies it.\n"
)

with open('src/components/Admin/ProvisionWebsiteModal.tsx', 'w') as f:
    f.write(content)

