import re

with open('src/components/Admin/ProductsManagerView.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';", "import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Copy } from 'lucide-react';")

duplicate_func = """  const handleDuplicate = async (p: Product) => {
    const { id, ...rest } = p;
    const duplicate = {
      ...rest,
      name: `${p.name} (Copy)`
    };
    await addProduct(duplicate as any);
  };

  const handleEdit ="""

content = content.replace("  const handleEdit =", duplicate_func)

duplicate_btn = """                    <button onClick={() => handleDuplicate(product)} className="text-blue-600 hover:text-blue-900" title="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(product)}"""

content = content.replace("                    <button onClick={() => handleEdit(product)}", duplicate_btn)

with open('src/components/Admin/ProductsManagerView.tsx', 'w') as f:
    f.write(content)

