import os

for filename in ['src/components/Collections/PricePointCollectionSection.tsx', 'src/components/Collections/TrendingShoesSection.tsx']:
    with open(filename, 'r') as f:
        text = f.read()
    
    text = text.replace('} as any)[config.backgroundStyle', '}[config.backgroundStyle')
    text = text.replace('} as any)[config.cardStyle', '}[config.cardStyle')
    
    text = text.replace('const bgThemeClasses = {', 'const bgThemeClasses = ({')
    text = text.replace('}[config.backgroundStyle', '} as any)[config.backgroundStyle')
    text = text.replace('const cardStyleClasses = {', 'const cardStyleClasses = ({')
    text = text.replace('}[config.cardStyle', '} as any)[config.cardStyle')
    
    with open(filename, 'w') as f:
        f.write(text)

