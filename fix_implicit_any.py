import os
import re

files_to_fix = [
    "src/components/Admin/SocialMediaSettingsView.tsx",
    "src/components/Admin/StoreManagementAdmin.tsx",
    "src/components/Admin/TrendingShoesSettingsView.tsx",
    "src/components/Admin/WebsiteConfigurationView.tsx",
    "src/components/Admin/WebsiteManagementView.tsx",
    "src/components/Admin/WhatsAppTemplateManager.tsx",
    "src/components/Categories/CategorySection.tsx",
    "src/components/Categories/MobileScrollableCategories.tsx",
    "src/components/Checkout/CheckoutModal.tsx",
    "src/components/Collections/PricePointCollectionSection.tsx",
    "src/components/Collections/TrendingCollections.tsx",
    "src/components/Collections/TrendingShoesSection.tsx",
    "src/components/FloatingActions/FloatingActionHub.tsx",
    "src/components/Footer/Footer.tsx",
    "src/components/Header/Navbar.tsx",
    "src/components/Social/SocialFollowCTA.tsx"
]

def add_any(match):
    return match.group(1) + ": any" + match.group(2)

for filename in files_to_fix:
    if not os.path.exists(filename):
        continue
    with open(filename, 'r') as f:
        content = f.read()

    # Generic fix for parameter implicit any in arrow functions (x) => 
    content = re.sub(r'\((\w+)\) =>', r'(\1: any) =>', content)
    # Also (a, b) =>
    content = re.sub(r'\((\w+),\s*(\w+)\) =>', r'(\1: any, \2: any) =>', content)
    # Also reduce (acc, curr) =>
    content = re.sub(r'\((\w+),\s*(\w+)\)\s*=>', r'(\1: any, \2: any) =>', content)
    
    # Check for specific files with TS7053 indexing errors
    if "PricePointCollectionSection.tsx" in filename:
        content = content.replace("themeConfig[activeTheme as keyof typeof themeConfig]", "themeConfig[activeTheme as keyof typeof themeConfig] as any")
        content = content.replace("themeConfig[activeTheme]", "(themeConfig as any)[activeTheme]")
        content = content.replace("shadowColors[activeTheme]", "(shadowColors as any)[activeTheme]")
        content = content.replace("shadowColors[activeTheme as keyof typeof shadowColors]", "shadowColors[activeTheme as keyof typeof shadowColors] as any")

    if "TrendingShoesSection.tsx" in filename:
        content = content.replace("themeConfig[activeTheme as keyof typeof themeConfig]", "themeConfig[activeTheme as keyof typeof themeConfig] as any")
        content = content.replace("themeConfig[activeTheme]", "(themeConfig as any)[activeTheme]")
        content = content.replace("shadowColors[activeTheme]", "(shadowColors as any)[activeTheme]")
        content = content.replace("shadowColors[activeTheme as keyof typeof shadowColors]", "shadowColors[activeTheme as keyof typeof shadowColors] as any")

    if "WhatsAppTemplateManager.tsx" in filename:
        content = content.replace("TEMPLATE_CATEGORY_MAP[tpl.category]", "(TEMPLATE_CATEGORY_MAP as any)[tpl.category]")
        content = content.replace("CATEGORY_COLORS[tpl.category]", "(CATEGORY_COLORS as any)[tpl.category]")
        
    with open(filename, 'w') as f:
        f.write(content)

print("Done")
