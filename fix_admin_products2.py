import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

if "import { ProductsManagerView }" not in content:
    content = content.replace("import { SmartProductFormModal } from './SmartProductFormModal';", "import { SmartProductFormModal } from './SmartProductFormModal';\nimport { ProductsManagerView } from './ProductsManagerView';")

content = re.sub(
    r'\{activeTab === \'products\' && \(\s*<div>\s*<h2[^>]*>Products</h2>\s*<p>Products manager goes here\.</p>\s*</div>\s*\)\}',
    """{activeTab === 'products' && <ProductsManagerView />}""",
    content
)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

