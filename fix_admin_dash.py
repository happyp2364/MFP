import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "hasPendingDraft" in line and "const {" in line:
        line = line.replace("hasPendingDraft,", "")
    if "pendingDraftCount" in line and "const {" in line:
        line = line.replace("pendingDraftCount,", "")
    if "publishWebsite" in line and "const {" in line:
        line = line.replace("publishWebsite,", "")
    if "discardDraft" in line and "const {" in line:
        line = line.replace("discardDraft,", "")
    
    if "const handlePublish" in line:
        skip = True
    if skip and "};" in line and "const handleDiscard" not in line:
        skip = False
        continue
    if "const handleDiscard" in line:
        skip = True
    if skip and "};" in line:
        skip = False
        continue
    if skip:
        continue

    # UI elements
    if "hasPendingDraft ?" in line:
        line = "                  'bg-[#0B8F63] text-white'\n"
    if "{hasPendingDraft ?" in line:
        line = "                  {'🟢 Live'}\n"
    if "{hasPendingDraft && (" in line:
        skip = True
        continue
    if skip and ")}" in line:
        skip = False
        continue
    
    new_lines.append(line)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.writelines(new_lines)
