import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'import \{ HangingSneakerSettingsView \}.*\n?', '', content)
content = re.sub(r'import \{ AIShoePetSettingsView \}.*\n?', '', content)

content = re.sub(r'<button onClick=\{.*setActiveTab\(\'hanging_shoe\'\).*</button>\n?', '', content)
content = re.sub(r'<button onClick=\{.*setActiveTab\(\'ai_pet_shoe\'\).*</button>\n?', '', content)

content = re.sub(r'\{activeTab === \'hanging_shoe\'.*\}\n?', '', content)
content = re.sub(r'\{activeTab === \'ai_pet_shoe\'.*\}\n?', '', content)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

