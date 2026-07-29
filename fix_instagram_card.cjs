const fs = require('fs');
let content = fs.readFileSync('src/components/Reviews/ReviewsSection.tsx', 'utf-8');

const newLink = `{rev.instagramHandle && (
                      <a 
                        href={\`https://instagram.com/\${rev.instagramHandle.replace('@', '')}\`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-pink-600 hover:text-pink-700 bg-pink-50 rounded-full px-1.5 py-0.5 transition-colors"
                        title="View on Instagram"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        <span className="text-[10px] font-semibold leading-none">{rev.instagramHandle}</span>
                      </a>
                    )}`;
                    
content = content.replace(/\{rev\.instagramHandle && \([\s\S]*?<\/a>\n\s*\)\}/, newLink);

fs.writeFileSync('src/components/Reviews/ReviewsSection.tsx', content, 'utf-8');
console.log('Fixed Instagram Card display.');
