import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "const handleConfirmPublish" in line:
        skip = True
    if skip and "const handleClosePublishModal" in line:
        pass # continue skipping
    if skip and "const handleDiscard" in line:
        pass
    if skip and "};" in line and not "const handle" in line:
        # this is fragile. Let's just use a state machine based on bracket nesting.
        pass

