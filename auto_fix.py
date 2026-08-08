import re

with open('tsc_output.log', 'r') as f:
    log_content = f.read()

# Pattern for file errors: file.tsx(line,col): error TS...
errors = re.findall(r'([a-zA-Z0-9_\-\.\/]+)\((\d+),(\d+)\): error (TS\d+): (.*?)(?=\n|$)', log_content)

for filepath, line, col, error_code, msg in errors:
    filepath = filepath.strip()
    if not filepath.startswith('src/'):
        continue
    print(f"Fixing {filepath}:{line}:{col} ({error_code})")
    
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    line_idx = int(line) - 1
    
    if error_code == 'TS7006':
        text = lines[line_idx]
        text = re.sub(r'\((\w+)\)\s*=>', r'(\1: any) =>', text)
        text = re.sub(r'\((\w+),\s*(\w+)\)\s*=>', r'(\1: any, \2: any) =>', text)
        text = re.sub(r'\((\w+),\s*(\w+),\s*(\w+)\)\s*=>', r'(\1: any, \2: any, \3: any) =>', text)
        text = re.sub(r'\b(\w+)\s*=>', r'(\1: any) =>', text)
        lines[line_idx] = text
        
    elif error_code == 'TS7053':
        text = lines[line_idx]
        if 'themeConfig[' in text:
            text = text.replace('themeConfig[', '(themeConfig as any)[')
        if 'shadowColors[' in text:
            text = text.replace('shadowColors[', '(shadowColors as any)[')
        if 'TEMPLATE_CATEGORY_MAP[' in text:
            text = text.replace('TEMPLATE_CATEGORY_MAP[', '(TEMPLATE_CATEGORY_MAP as any)[')
        if 'CATEGORY_COLORS[' in text:
            text = text.replace('CATEGORY_COLORS[', '(CATEGORY_COLORS as any)[')
        lines[line_idx] = text

    elif error_code == 'TS2322' and 'SmartProductFormModal' in filepath:
        text = lines[line_idx]
        text = text.replace('basePrice,', 'basePrice: basePrice || 0,')
        text = text.replace('salePrice,', 'salePrice: salePrice || 0,')
        text = text.replace('costPerItem,', 'costPerItem: costPerItem || 0,')
        lines[line_idx] = text
        
    with open(filepath, 'w') as f:
        f.writelines(lines)
        
print("Done")
