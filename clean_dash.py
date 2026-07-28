import re
with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("hasPendingDraft,", "")
content = content.replace("pendingDraftCount,", "")
content = content.replace("discardDraft,", "")
content = content.replace("stepName: 'Preparing & Validating Draft Data...',", "")
content = content.replace("Marudhar Fashion Point • Draft & Publish System Active", "Marudhar Fashion Point • Real-Time CMS Active")
content = re.sub(r'previewMode === \'draft\'[^\n]*', 'true', content)
content = content.replace("title=\"Toggle previewing Draft changes vs Live Published site\"", "")
content = content.replace("<span>{true ? '👁 Previewing: DRAFT' : '🔴 Previewing: LIVE'}</span>", "")
content = content.replace("{/* Discard Draft Button */}", "")

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

