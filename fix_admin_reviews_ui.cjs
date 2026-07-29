const fs = require('fs');
let content = fs.readFileSync('src/components/Admin/ReviewsSettingsView.tsx', 'utf-8');

const editBlock = `
                            <input
                              type="text"
                              value={editProduct}
                              onChange={(e) => setEditProduct(e.target.value)}
                              placeholder="Product Bought"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                            <input
                              type="text"
                              value={editInstagram}
                              onChange={(e) => setEditInstagram(e.target.value)}
                              placeholder="Instagram (@username)"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />
                            <input
                              type="text"
                              value={editAvatar}
                              onChange={(e) => setEditAvatar(e.target.value)}
                              placeholder="Avatar URL"
                              className="w-full bg-neutral-100 border p-1 rounded text-[10px]"
                            />`;
                            
content = content.replace(/<input\n\s*type="text"\n\s*value=\{editProduct\}\n\s*onChange=\{\(e\) => setEditProduct\(e\.target\.value\)\}\n\s*placeholder="Product Bought"\n\s*className="w-full bg-neutral-100 border p-1 rounded text-\[10px\]"\n\s*\/>/g, editBlock);

const displayBlock = `<div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-neutral-900 text-xs">{rev.author}</span>
                              {rev.instagramHandle && (
                                <span className="text-pink-600 font-medium text-[9px] bg-pink-50 px-1 rounded-full">
                                  {rev.instagramHandle}
                                </span>
                              )}`;
                              
content = content.replace(/<div className="flex items-center gap-1\.5">\n\s*<span className="font-extrabold text-neutral-900 text-xs">\{rev\.author\}<\/span>/, displayBlock);

fs.writeFileSync('src/components/Admin/ReviewsSettingsView.tsx', content, 'utf-8');
console.log('Fixed Admin Reviews UI 1');
