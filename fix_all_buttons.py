import os
import re

components_dir = 'src/components/Admin'

for file in os.listdir(components_dir):
    if not file.endswith('.tsx'):
        continue
    
    filepath = os.path.join(components_dir, file)
    with open(filepath, 'r') as f:
        content = f.read()

    if "isSaving ?" in content or "saving ?" in content or "isSubmitting ?" in content:
        # We need to find the button text and replace it.
        # This is a bit tricky with regex. Instead of modifying all of them, I will just do standard string replacements.
        content = content.replace("isSaving ? 'Saving Changes...' : 'Save Global Atmosphere'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving Changes...' : 'Save Changes'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving...' : 'Save Changes'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving Configuration...' : 'Save Payment Configuration'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving Setup...' : 'Save Hanging Shoe Setup'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving Core...' : 'Save Core Initialization'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Synchronizing...' : 'Save Instagram Settings'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")
        content = content.replace("isSaving ? 'Saving Settings...' : 'Save Sound Settings'", "isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'")

        with open(filepath, 'w') as out:
            out.write(content)

