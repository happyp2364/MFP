import re

with open('src/components/Admin/WebsiteDirectoryManager.tsx', 'r') as f:
    content = f.read()

# Update table headers
old_thead = """            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Logo</th>
                <th className="p-4">Website Name & ID</th>
                <th className="p-4">Owner Name & Email</th>
                <th className="p-4">Website URL (Dynamic)</th>
                <th className="p-4">Admin Login URL</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Super Admin Actions</th>
              </tr>
            </thead>"""

new_thead = """            <thead className="bg-neutral-900/80 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 text-left">Website</th>
                <th className="p-4 text-left">Owner</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">URLs</th>
                <th className="p-4 text-left">Created Date</th>
                <th className="p-4 text-left">Last Login</th>
                <th className="p-4 text-left">Stats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>"""

content = content.replace(old_thead, new_thead)

# Update row
old_row = """                    <tr key={tenant.id} className="hover:bg-neutral-900/40 transition-colors">
                      {/* Logo */}
                      <td className="p-4">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                          {tenant.logoUrl ? (
                            <img src={tenant.logoUrl} alt={tenant.name} className="w-full h-full object-cover" />
                          ) : (
                            <Globe className="w-5 h-5 text-amber-400" />
                          )}
                        </div>
                      </td>

                      {/* Business Name & ID */}
                      <td className="p-4">
                        <span className="font-bold text-white block max-w-[180px] truncate" title={tenant.name}>
                          {tenant.name}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono block truncate">
                          ID: {tenant.id}
                        </span>
                      </td>

                      {/* Owner Name & Email */}
                      <td className="p-4">
                        <span className="font-bold text-neutral-200 block">
                          {tenant.ownerName || 'Primary Admin'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate max-w-[160px]" title={tenant.ownerEmail}>
                          {tenant.ownerEmail || tenant.adminGoogleEmail || 'No email assigned'}
                        </span>
                      </td>

                      {/* Website URL */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-sky-400 truncate max-w-[180px]" title={webUrl}>
                            {webUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(webUrl, 'Website URL')}
                            title="Copy Website URL"
                            className="p-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-800 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-1">
                           <span className="font-mono text-[9px] text-purple-400 truncate max-w-[180px]" title={adminUrl}>
                             Admin: {adminUrl}
                           </span>
                           <button
                             onClick={() => copyToClipboard(adminUrl, 'Admin URL')}
                             title="Copy Admin URL"
                             className="p-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 hover:text-white rounded border border-neutral-800 transition"
                           >
                             <Copy className="w-2.5 h-2.5" />
                           </button>
                        </div>
                      </td>

                      {/* Admin Login URL (Removed in this merge) */}
                      <td className="p-4 hidden">
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeColor(tenant.status)}`}>
                          {tenant.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="p-4">
                        <span className="text-xs text-neutral-300 font-mono">
                          {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>

                      {/* Super Admin Actions */}"""

# Wait, I need to match everything carefully. It's better to use regex to replace the entire <tr> content up to the actions cell.
