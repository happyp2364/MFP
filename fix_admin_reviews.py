import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

if "import { ReviewsManagerView }" not in content:
    content = content.replace("import { ProductsManagerView } from './ProductsManagerView';", "import { ProductsManagerView } from './ProductsManagerView';\nimport { ReviewsManagerView } from './ReviewsManagerView';")

content = re.sub(
    r'\{activeTab === \'reviews\' && \(\s*<div>\s*<h2[^>]*>Reviews</h2>\s*<p>Reviews manager goes here\.</p>\s*</div>\s*\)\}',
    """{activeTab === 'reviews' && <ReviewsManagerView />}""",
    content
)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

