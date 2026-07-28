import os
import re

components_dir = 'src/components/Admin'

for file in os.listdir(components_dir):
    if not file.endswith('.tsx'):
        continue
    
    filepath = os.path.join(components_dir, file)
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to change the text of the save button if it matches something like `{isSaving ? 'Saving...' : 'Save ...'}`
    # Instead of doing that blindly, let's just make sure they all say Save Changes.
    
    # We will search for `{isSaving ? 'Saving...' : 'Save ...'}` and replace it with:
    # `{isSaving ? 'Saving...' : saveSuccess ? 'Saved Successfully ✓' : 'Save Changes'}`
    
    # Let's do a regex replacement that targets `{isSaving ? .* : .*}`
    
    # Actually, some use `isSaving`, `isSubmitting`, `saving`
    
    # Let's do a simple replacement for the button contents if we can
