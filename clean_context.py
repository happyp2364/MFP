import re

with open('src/context/StoreContext.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const [previewMode, setPreviewMode]" in line:
        continue
    if "const [hasPendingDraft, setHasPendingDraft]" in line:
        skip = True
        continue
    if "const [pendingDraftCount, setPendingDraftCount]" in line:
        skip = True
        continue
    if "const [lastPublishedAt, setLastPublishedAt]" in line:
        skip = True
        continue
    if "const [lastPublishedBy, setLastPublishedBy]" in line:
        skip = True
        continue
    if "const [publishedVersions, setPublishedVersions]" in line:
        skip = True
        continue
    
    if skip:
        if "useState" in line or "});" in line or "] = useState" in line:
            if "});" in line or "])" in line or "useState<" in line and not line.strip().endswith('{'):
                skip = False
        continue

    # Remove the tracking updates inside saveLiveChanges
    if "const newCount = pendingDraftCount + 1;" in line:
        continue
    if "setHasPendingDraft(true);" in line:
        continue
    if "setPendingDraftCount(newCount);" in line:
        continue
    if "localStorage.setItem('mfp_cms_active_draft'" in line:
        continue
    if "localStorage.setItem('mfp_cms_pending_count'" in line:
        continue

    # Replace usages in activeProducts
    if "const activeProducts = isEditingDraft ? publishedProducts : publishedProducts;" in line:
        line = "  const activeProducts = publishedProducts;\n"
    elif "const activeProducts = isEditingDraft" in line:
        line = "  const activeProducts = publishedProducts;\n"
        
    line = re.sub(r'const active([A-Za-z]+) = isEditingDraft \? (published[A-Za-z]+) : \2;', r'const active\1 = \2;', line)
    
    new_lines.append(line)

with open('src/context/StoreContext.tsx', 'w') as f:
    f.writelines(new_lines)
