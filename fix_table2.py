import re

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'r') as f:
    content = f.read()

# Replace the thead
old_thead = re.search(r"<thead.*?</thead>", content, re.DOTALL)
if old_thead:
    new_thead = """<thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 text-left">Website</th>
                <th className="p-4 text-left">Owner</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">URLs</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Stats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>"""
    content = content[:old_thead.start()] + new_thead + content[old_thead.end():]

# Now for the tbody map
# I need to replace the <tr> content.
# I'll just replace the whole return block inside the map.

old_return_match = re.search(r"return \(\s*<tr key=\{tenant\.id\}.*?\{/\* Super Admin Actions \*/\}", content, re.DOTALL)
if old_return_match:
    new_return = """return (
                    <tr key={tenant.id} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Website */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                            {tenant.logoUrl ? (
                              <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
                            ) : (
                              <Globe className="w-5 h-5 text-amber-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block max-w-[150px] truncate" title={tenant.name}>
                              {tenant.name}
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono block truncate">
                              {tenant.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="p-4">
                        <span className="font-bold text-neutral-200 block">
                          {tenant.ownerName || 'Primary Admin'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[150px]" title={tenant.ownerEmail}>
                          {tenant.ownerEmail || tenant.adminGoogleEmail || 'No email assigned'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>

                      {/* URLs */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] text-sky-400 truncate max-w-[140px]" title={webUrl}>
                            {webUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(webUrl, 'Website URL')}
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="font-mono text-[10px] text-purple-400 truncate max-w-[140px]" title={adminUrl}>
                             Admin
                           </span>
                           <button
                             onClick={() => copyToClipboard(adminUrl, 'Admin URL')}
                             className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                           >
                             <Copy className="w-3 h-3" />
                           </button>
                        </div>
                      </td>

                      {/* Created */}
                      <td className="p-4">
                        <span className="text-xs text-neutral-300 font-mono block">
                          {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </span>
                        {tenant.lastLogin && (
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            Login: {new Date(tenant.lastLogin).toLocaleDateString()}
                          </span>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="p-4">
                        <div className="text-[10px] font-mono text-neutral-400">
                           <div className="flex gap-2"><span>Prod:</span> <span className="text-white">{tenant.statistics?.totalProducts || 0}</span></div>
                           <div className="flex gap-2"><span>Ord:</span> <span className="text-white">{tenant.statistics?.totalOrders || 0}</span></div>
                           <div className="flex gap-2"><span>DB:</span> <span className="text-white">{tenant.databaseSize || 0}MB</span></div>
                        </div>
                      </td>

                      {/* Super Admin Actions */"""
    content = content[:old_return_match.start()] + new_return + content[old_return_match.end():]

# Note, the column span for "No websites match" should be 7 now.
content = content.replace("colSpan={8}", "colSpan={7}")

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'w') as f:
    f.write(content)

