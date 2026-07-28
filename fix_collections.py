import re
with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

replacements = [
    ("doc(db, 'draft_settings'", "doc(db, 'settings'"),
    ("doc(db, 'draft_hero'", "doc(db, 'hero'"),
    ("doc(db, 'draft_homepage'", "doc(db, 'homepage'"),
    ("doc(db, 'draft_categories'", "doc(db, 'categories'"),
    ("doc(db, 'draft_payment'", "doc(db, 'payment'"),
    ("doc(db, 'draft_animations'", "doc(db, 'animations'"),
    ("doc(db, 'draft_mascot'", "doc(db, 'mascot'"),
    ("doc(db, 'draft_social'", "doc(db, 'social'"),
    ("doc(db, 'draft_theme'", "doc(db, 'theme'"),
    ("doc(db, 'draft_products'", "doc(db, 'products'"),
    ("doc(db, 'draft_product_gallery'", "doc(db, 'product_gallery'"),
    ("doc(db, 'draft_product_variants'", "doc(db, 'product_variants'"),
    ("doc(db, 'draft_product_reviews'", "doc(db, 'product_reviews'"),
    ("doc(db, 'draft_product_ai'", "doc(db, 'product_ai'"),
    ("doc(db, 'draft_product_seo'", "doc(db, 'product_seo'"),
    ("doc(db, 'draft_product_statistics'", "doc(db, 'product_statistics'"),
    ("doc(db, 'draft_product_related'", "doc(db, 'product_related'"),
    ("doc(db, 'draft_product_shipping'", "doc(db, 'product_shipping'"),
    ("doc(db, 'draft_reviews'", "doc(db, 'reviews'"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Also let's rename saveLiveChanges variables to not say 'draft'
content = content.replace("'draft_settings/store'", "'settings/store'")
content = content.replace("'draft_hero/current'", "'hero/current'")
content = content.replace("'draft_homepage/announcements'", "'homepage/announcements'")
content = content.replace("'draft_categories/highlights'", "'categories/highlights'")
content = content.replace("'draft_homepage/trendingCollections'", "'homepage/trendingCollections'")
content = content.replace("'draft_payment/config'", "'payment/config'")
content = content.replace("'draft_animations/hangingSneakerConfig'", "'animations/hangingSneakerConfig'")
content = content.replace("'draft_mascot/petShoeConfig'", "'mascot/petShoeConfig'")
content = content.replace("'draft_social/instagramConfig'", "'social/instagramConfig'")
content = content.replace("'draft_theme/current'", "'theme/current'")
content = content.replace("draft_products/${p.id}", "products/${p.id}")
content = content.replace("draft_reviews/${r.id}", "reviews/${r.id}")

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)
