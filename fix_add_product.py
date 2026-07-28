import re
with open('src/context/StoreContext.tsx', 'r') as f:
    content = f.read()

content = content.replace("  }, []);\n\n    const newProduct: Product = {\n", """  }, []);

  const addProduct = async (p: Omit<Product, 'id'>) => {
    const cleanName = p.name;
    const cleanDesc = p.description;
    const cleanBrand = p.brand;
    const cleanPrice = p.price;
    const cleanOrigPrice = p.originalPrice;
    const newId = `mfp-custom-${Date.now()}`;

    const newProduct: Product = {
""")

with open('src/context/StoreContext.tsx', 'w') as f:
    f.write(content)
