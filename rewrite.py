import re

with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

# 1. Rename draft_ collections to live collections in saveDraftLocallyAndRemote
content = content.replace("doc(db, 'draft_settings'", "doc(db, 'settings'")
content = content.replace("doc(db, 'draft_hero'", "doc(db, 'hero'")
content = content.replace("doc(db, 'draft_homepage'", "doc(db, 'homepage'")
content = content.replace("doc(db, 'draft_categories'", "doc(db, 'categories'")
content = content.replace("doc(db, 'draft_payment'", "doc(db, 'payment'")
content = content.replace("doc(db, 'draft_animations'", "doc(db, 'animations'")
content = content.replace("doc(db, 'draft_mascot'", "doc(db, 'mascot'")
content = content.replace("doc(db, 'draft_social'", "doc(db, 'social'")
content = content.replace("doc(db, 'draft_theme'", "doc(db, 'theme'")
content = content.replace("doc(db, 'draft_products'", "doc(db, 'products'")
content = content.replace("doc(db, 'draft_product_gallery'", "doc(db, 'product_gallery'")
content = content.replace("doc(db, 'draft_product_variants'", "doc(db, 'product_variants'")
content = content.replace("doc(db, 'draft_product_reviews'", "doc(db, 'product_reviews'")
content = content.replace("doc(db, 'draft_product_ai'", "doc(db, 'product_ai'")
content = content.replace("doc(db, 'draft_product_seo'", "doc(db, 'product_seo'")
content = content.replace("doc(db, 'draft_product_statistics'", "doc(db, 'product_statistics'")
content = content.replace("doc(db, 'draft_product_related'", "doc(db, 'product_related'")
content = content.replace("doc(db, 'draft_product_shipping'", "doc(db, 'product_shipping'")
content = content.replace("doc(db, 'draft_reviews'", "doc(db, 'reviews'")

# Rename saveDraftLocallyAndRemote to saveLiveChanges
content = content.replace("saveDraftLocallyAndRemote", "saveLiveChanges")

# We want the active components to just use published variables directly.
# Let's replace 'isEditingDraft ? draftProducts : publishedProducts' with 'publishedProducts'
content = re.sub(r'isEditingDraft \? draft[A-Za-z]+ : (published[A-Za-z]+)', r'\1', content)

# Remove the publish button from Header or Admin Dashboard? Wait, we need to remove publishWebsite
# Let's write the modified content back.
with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)

