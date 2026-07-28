import re
with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'hasPendingDraft: boolean;\n\s*', '', content)
content = re.sub(r'pendingDraftCount: number;\n\s*', '', content)
content = re.sub(r'lastPublishedAt: string \| null;\n\s*', '', content)
content = re.sub(r'lastPublishedBy: string \| null;\n\s*', '', content)
content = re.sub(r'publishedVersions: PublishedVersionHistory\[\];\n\s*', '', content)
content = re.sub(r'previewMode: \'draft\' \| \'live\';\n\s*', '', content)
content = re.sub(r'publishWebsite: \([\s\S]*?\) => Promise<PublishResult>;\n\s*', '', content)
content = re.sub(r'restorePublishedVersion: \(versionId: string\) => Promise<boolean>;\n\s*', '', content)
content = re.sub(r'togglePreviewMode: \(\) => void;\n\s*', '', content)
content = re.sub(r'discardDraft: \(\) => Promise<void>;\n\s*', '', content)

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)
