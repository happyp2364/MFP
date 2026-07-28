import re
with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

# For each published item, remove localStorage loading and just use default
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.PRODUCTS\);\n\s*return saved \? JSON\.parse\(saved\) : PRODUCTS_DATA;', 'return PRODUCTS_DATA;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.REVIEWS\);\n\s*return saved \? JSON\.parse\(saved\) : REVIEWS_DATA;', 'return REVIEWS_DATA;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.STORE_INFO\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_STORE_INFO;', 'return DEFAULT_STORE_INFO;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.HERO_CONTENT\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_HERO_CONTENT;', 'return DEFAULT_HERO_CONTENT;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.ANNOUNCEMENTS\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_ANNOUNCEMENTS;', 'return DEFAULT_ANNOUNCEMENTS;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.CATEGORY_HIGHLIGHTS\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_CATEGORY_HIGHLIGHTS;', 'return DEFAULT_CATEGORY_HIGHLIGHTS;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.TRENDING_COLLECTIONS\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_TRENDING_COLLECTIONS;', 'return DEFAULT_TRENDING_COLLECTIONS;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.PAYMENT_SETTINGS\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_PAYMENT_SETTINGS;', 'return DEFAULT_PAYMENT_SETTINGS;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.HANGING_SNEAKER\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_HANGING_SNEAKER_CONFIG;', 'return DEFAULT_HANGING_SNEAKER_CONFIG;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.PET_SHOE_CONFIG\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_PET_SHOE_CONFIG;', 'return DEFAULT_PET_SHOE_CONFIG;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.INSTAGRAM_CONFIG\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_INSTAGRAM_CONFIG;', 'return DEFAULT_INSTAGRAM_CONFIG;', content)
content = re.sub(r'const saved = localStorage\.getItem\(STORAGE_KEYS\.SOUND_CONFIG\);\n\s*return saved \? JSON\.parse\(saved\) : DEFAULT_SOUND_CONFIG;', 'return DEFAULT_SOUND_CONFIG;', content)

# Remove the localStorage setters that might be causing stale data
content = re.sub(r'localStorage\.setItem\(STORAGE_KEYS\.PRODUCTS, JSON\.stringify\(stitched\)\);\n', '', content)

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)
