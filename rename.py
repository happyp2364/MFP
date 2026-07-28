import re

with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

replacements = [
    ('draftProducts', 'publishedProducts'),
    ('setDraftProducts', 'setPublishedProducts'),
    ('draftReviews', 'publishedReviews'),
    ('setDraftReviews', 'setPublishedReviews'),
    ('draftStoreInfo', 'publishedStoreInfo'),
    ('setDraftStoreInfo', 'setPublishedStoreInfo'),
    ('draftHeroContent', 'publishedHeroContent'),
    ('setDraftHeroContent', 'setPublishedHeroContent'),
    ('draftAnnouncements', 'publishedAnnouncements'),
    ('setDraftAnnouncements', 'setPublishedAnnouncements'),
    ('draftCategoryHighlights', 'publishedCategoryHighlights'),
    ('setDraftCategoryHighlights', 'setPublishedCategoryHighlights'),
    ('draftTrendingCollections', 'publishedTrendingCollections'),
    ('setDraftTrendingCollections', 'setPublishedTrendingCollections'),
    ('draftPaymentSettings', 'publishedPaymentSettings'),
    ('setDraftPaymentSettings', 'setPublishedPaymentSettings'),
    ('draftHangingSneakerConfig', 'publishedHangingSneakerConfig'),
    ('setDraftHangingSneakerConfig', 'setPublishedHangingSneakerConfig'),
    ('draftPetShoeConfig', 'publishedPetShoeConfig'),
    ('setDraftPetShoeConfig', 'setPublishedPetShoeConfig'),
    ('draftInstagramConfig', 'publishedInstagramConfig'),
    ('setDraftInstagramConfig', 'setPublishedInstagramConfig'),
    ('draftSoundConfig', 'publishedSoundConfig'),
    ('setDraftSoundConfig', 'setPublishedSoundConfig'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)

