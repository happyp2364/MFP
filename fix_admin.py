import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("  React.useEffect(() => {\n    if (initialTab && isOpen) {\n      setActiveTab(initialTab);\n    }\n  }, [initialTab, isOpen]);", "  React.useEffect(() => {\n    if (initialTab && isOpen) {\n      setActiveTab(initialTab);\n    }\n    if (isOpen) {\n      refreshAuditLogs();\n    }\n  }, [initialTab, isOpen, refreshAuditLogs]);")

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

