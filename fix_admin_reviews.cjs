const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/ReviewsSettingsView.tsx', 'utf-8');

// State Additions
content = content.replace(/const \[editProduct, setEditProduct\] = useState\(''\);/,
  `const [editProduct, setEditProduct] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editAvatar, setEditAvatar] = useState('');`
);

content = content.replace(/const \[newProduct, setNewProduct\] = useState\(''\);/,
  `const [newProduct, setNewProduct] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newAvatar, setNewAvatar] = useState('');`
);

// handleEditClick
content = content.replace(/setEditProduct\(rev.productBought \|\| ''\);/g,
  `setEditProduct(rev.productBought || '');
    setEditInstagram(rev.instagramHandle || '');
    setEditAvatar(rev.avatar || '');`
);

// handleSaveEdit
content = content.replace(/productBought: editProduct,/,
  `productBought: editProduct,
        instagramHandle: editInstagram || undefined,
        avatar: editAvatar || undefined,`
);

// handleAddReview (Admin)
content = content.replace(/productBought: newProduct,/,
  `productBought: newProduct,
        instagramHandle: newInstagram || undefined,
        avatar: newAvatar || \`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80\`,`
);

content = content.replace(/setNewProduct\(''\);\n\s*setIsAddMode\(false\);/,
  `setNewProduct('');
      setNewInstagram('');
      setNewAvatar('');
      setIsAddMode(false);`
);

fs.writeFileSync('src/components/Admin/ReviewsSettingsView.tsx', content, 'utf-8');
console.log('Fixed Admin Reviews 1');
