import re
with open('src/components/Admin/VersionHistoryView.tsx', 'r') as f:
    content = f.read()

content = content.replace("hasPendingDraft,", "")
content = content.replace("publishWebsite,", "")

# Replace usage of hasPendingDraft
content = content.replace("hasPendingDraft ?", "false ?")
content = content.replace("hasPendingDraft", "false")

with open('src/components/Admin/VersionHistoryView.tsx', 'w') as f:
    f.write(content)
