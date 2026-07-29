const fs = require('fs');
let content = fs.readFileSync('src/components/Reviews/ReviewsSection.tsx', 'utf-8');

// Add state variables
content = content.replace(
  /const \[newProduct, setNewProduct\] = useState\(''\);/,
  `const [newProduct, setNewProduct] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newAvatar, setNewAvatar] = useState('');`
);

// Add to addReview
content = content.replace(
  /productBought: newProduct \|\| 'Marudhar Footwear',\n\s*avatar: `https:\/\/images\.unsplash\.com\/photo-1535713875002-d1d0cf377fde\?auto=format&fit=crop&w=120&q=80`,/,
  `productBought: newProduct || 'Marudhar Footwear',
      avatar: newAvatar || \`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80\`,
      instagramHandle: newInstagram || undefined,`
);

// Reset state
content = content.replace(
  /setNewProduct\(''\);\n\s*\}, 1800\);/,
  `setNewProduct('');
      setNewInstagram('');
      setNewAvatar('');
    }, 1800);`
);

// Add form inputs
const formInputs = `                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Product Purchased (Optional)</label>
                  <input
                    type="text"
                    value={newProduct}
                    onChange={(e) => setNewProduct(e.target.value)}
                    placeholder="e.g. Royal Leather Loafers"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Instagram (Optional)</label>
                    <input
                      type="text"
                      value={newInstagram}
                      onChange={(e) => setNewInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Profile Picture URL (Optional)</label>
                    <input
                      type="url"
                      value={newAvatar}
                      onChange={(e) => setNewAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                    />
                  </div>
                </div>`;
                
content = content.replace(/                <div>\n\s*<label className="font-bold text-neutral-700 block mb-1">Product Purchased \(Optional\)<\/label>\n\s*<input\n\s*type="text"\n\s*value=\{newProduct\}\n\s*onChange=\{\(e\) => setNewProduct\(e\.target\.value\)\}\n\s*placeholder="e\.g\. Royal Leather Loafers"\n\s*className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-\[#0B8F63\] outline-none"\n\s*\/>\n\s*<\/div>/, formInputs);

// Add Instagram link to Review Card
const authorCard = `<div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    {rev.author}
                    {rev.instagramHandle && (
                      <a 
                        href={\`https://instagram.com/\${rev.instagramHandle.replace('@', '')}\`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 hover:text-pink-700 bg-pink-50 rounded-full p-0.5"
                        title="View on Instagram"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-500">{rev.location}</div>`;

content = content.replace(/<div>\n\s*<div className="text-xs font-bold text-neutral-900">\{rev\.author\}<\/div>\n\s*<div className="text-\[10px\] text-neutral-500">\{rev\.location\}<\/div>/, authorCard);

fs.writeFileSync('src/components/Reviews/ReviewsSection.tsx', content, 'utf-8');
console.log('Fixed ReviewsSection');
