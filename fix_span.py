import re
with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

# Replace the whole button
content = re.sub(r'<button\s*className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border \${.*?<span>{true</span>\s*</button>', '', content, flags=re.DOTALL)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)
