import re

with open('src/components/Admin/AdminDashboardModal.tsx', 'r') as f:
    content = f.read()

import_stmt = "import { validateTenantAccess, getCurrentTenantId } from '../../lib/tenantIsolation';\n"
if "validateTenantAccess" not in content:
    content = content.replace("import { validateFileUpload }", import_stmt + "import { validateFileUpload }")

# Insert check just after isSuperAdminUser
check_code = """
  const isSuperAdminUser = Boolean(
    store.isSuperAdmin ||
    currentAdminUser?.roleId === 'super_admin' ||
    currentAdminUser?.email?.toLowerCase() === 'vpcreation2002@gmail.com' ||
    currentAdminUser?.email?.toLowerCase() === 'vishalpparihar2002@gmail.com'
  );

  const hasTenantAccess = currentAdminUser ? validateTenantAccess(
    currentAdminUser.roleId,
    currentAdminUser.websiteId,
    getCurrentTenantId(),
    currentAdminUser.email
  ) : false;

  if (isOpen && !hasTenantAccess && currentAdminUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Access Denied</h2>
            <p className="text-neutral-400 text-sm">You do not have permission to access the administration panel for this website.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={onClose} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition">Return</button>
            <button onClick={() => { logoutAdmin(); onClose(); }} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition">Sign Out</button>
          </div>
        </div>
      </div>
    );
  }
"""

content = re.sub(r"const isSuperAdminUser = Boolean\(.*?;\s*", check_code, content, flags=re.DOTALL)

with open('src/components/Admin/AdminDashboardModal.tsx', 'w') as f:
    f.write(content)

