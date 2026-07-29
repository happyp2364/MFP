const fs = require('fs');
let content = fs.readFileSync('src/components/Header/Navbar.tsx', 'utf-8');

const adminSection = `              </div>

              {isAdmin && (
                <div className="space-y-1 pt-2 border-t border-neutral-100">
                  <span className="text-[11px] font-extrabold uppercase text-[#0B8F63] tracking-wider block mb-1">
                    Admin Tools
                  </span>
                  
                  <button
                    onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-semibold text-neutral-900 bg-[#0B8F63]/10 hover:bg-[#0B8F63]/20 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#0B8F63]" />
                      <span>Open Admin Panel</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#0B8F63]" />
                  </button>
                </div>
              )}

            </div>`;

content = content.replace(/              <\/div>\n\n            <\/div>/, adminSection);

fs.writeFileSync('src/components/Header/Navbar.tsx', content, 'utf-8');
console.log('Fixed Mobile Admin Menu');
