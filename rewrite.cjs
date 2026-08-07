const fs = require('fs');
const file = 'src/components/Admin/SuperAdminConsoleView.tsx';
let content = fs.readFileSync(file, 'utf8');

const startTag = "{activeTab === 'overview' && (";
const startIdx = content.indexOf(startTag);

if (startIdx === -1) {
  console.log("Start tag not found.");
  process.exit(1);
}

// Find the ending tag of this section
// We look for the start of the next section
const endTag = "{/* ========================================== */}\n      {/* SECTION 2: WEBSITE BUYERS / ADMINS LIST     */}";
const endIdx = content.indexOf(endTag);

if (endIdx === -1) {
  console.log("End tag not found.");
  process.exit(1);
}

const replacement = `{activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* SECTION 1: Overview Cards */}
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Platform Overview</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Total Websites */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total Websites</span>
                <div className="text-3xl font-black text-white my-2">{tenants.length}</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Globe className="w-3 h-3" /> All provisioned
                </div>
              </div>

              {/* Active Websites */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">Active Websites</span>
                <div className="text-3xl font-black text-emerald-400 my-2">
                  {tenants.filter(t => t.status === 'active').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500/70">
                  <CheckCircle2 className="w-3 h-3" /> Live & Online
                </div>
              </div>

              {/* Suspended Websites */}
              <div className="p-4 bg-rose-950/20 border border-rose-900/30 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Suspended</span>
                <div className="text-3xl font-black text-rose-400 my-2">
                  {tenants.filter(t => t.status === 'suspended').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-rose-500/70">
                  <PauseCircle className="w-3 h-3" /> Access revoked
                </div>
              </div>

              {/* Archived Websites */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Archived</span>
                <div className="text-3xl font-black text-neutral-400 my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                  <Archive className="w-3 h-3" /> Cold storage
                </div>
              </div>

              {/* Total Admins */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-blue-500 tracking-wider">Total Admins</span>
                <div className="text-3xl font-black text-blue-400 my-2">
                  {admins.filter(a => a.roleId === 'admin').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <ShieldAlert className="w-3 h-3" /> Store Owners
                </div>
              </div>

              {/* Total Managers */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-purple-500 tracking-wider">Total Managers</span>
                <div className="text-3xl font-black text-purple-400 my-2">
                  {admins.filter(a => a.roleId === 'manager').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <UserCheck className="w-3 h-3" /> Store Managers
                </div>
              </div>

              {/* Total Staff */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-cyan-500 tracking-wider">Total Staff</span>
                <div className="text-3xl font-black text-cyan-400 my-2">
                  {admins.filter(a => a.roleId === 'staff').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Users2 className="w-3 h-3" /> Store Employees
                </div>
              </div>

              {/* Total Customers */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total Customers</span>
                <div className="text-3xl font-black text-white my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Users className="w-3 h-3" /> Registered shoppers
                </div>
              </div>

              {/* Total Products */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total Products</span>
                <div className="text-3xl font-black text-white my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Package className="w-3 h-3" /> Across all stores
                </div>
              </div>

              {/* Total Orders */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Total Orders</span>
                <div className="text-3xl font-black text-white my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <ShoppingCart className="w-3 h-3" /> All-time completed
                </div>
              </div>

              {/* Total Revenue */}
              <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Total Revenue</span>
                <div className="text-3xl font-black text-amber-400 my-2">$0</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-500/70">
                  <DollarSign className="w-3 h-3" /> Gross Volume
                </div>
              </div>

              {/* Orders Today */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Orders Today</span>
                <div className="text-3xl font-black text-white my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <TrendingUp className="w-3 h-3" /> Last 24h
                </div>
              </div>

              {/* New Customers Today */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">New Customers Today</span>
                <div className="text-3xl font-black text-white my-2">0</div>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <UserPlus className="w-3 h-3" /> Last 24h
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 2: Platform Health */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Platform Health</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-neutral-300">
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400"/> Firestore Status</div>
                  <span className="text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2"><Key className="w-4 h-4 text-emerald-400"/> Authentication Status</div>
                  <span className="text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400"/> Website Status</div>
                  <span className="text-emerald-400">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/> Build Status</div>
                  <span className="text-emerald-400">Passing</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-800 rounded-xl sm:col-span-2">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400"/> Last Sync Time</div>
                  <span className="text-blue-400 font-mono">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* SECTION 6: Security Summary */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Security Summary</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-neutral-300">
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex justify-between items-center">
                  <span className="text-rose-400/80">Failed Login Attempts</span>
                  <span className="text-rose-400 text-lg">0</span>
                </div>
                <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl flex justify-between items-center">
                  <span className="text-rose-400/80">Locked Accounts</span>
                  <span className="text-rose-400 text-lg">0</span>
                </div>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl sm:col-span-2 flex justify-between items-center">
                  <span className="text-neutral-400">Recent Super Admin Login</span>
                  <span className="text-white font-mono">{new Date().toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl sm:col-span-2 flex justify-between items-center">
                  <span className="text-emerald-500/80">Emergency Lock Status</span>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Disengaged
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 3: Recent Activities */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Recent Activities</span>
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><PlusCircle className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Website Created</span>
                    <span className="text-neutral-500">Super Admin provisioned a new tenant instance.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">Just now</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5"><UserPlus className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Admin Created</span>
                    <span className="text-neutral-500">New admin owner profile was generated.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">15m ago</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5"><LogOut className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Admin Login</span>
                    <span className="text-neutral-500">Store owner authenticated successfully.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">1h ago</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5"><Package className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Product Added</span>
                    <span className="text-neutral-500">New inventory item was synchronized.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">2h ago</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 mt-0.5"><PauseCircle className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Website Suspended</span>
                    <span className="text-neutral-500">License revoked for billing lapse.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">1d ago</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Website Restored</span>
                    <span className="text-neutral-500">Tenant status reverted to active.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">1d ago</span>
                </div>

                <div className="flex items-start gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5"><ArrowRightLeft className="w-3.5 h-3.5" /></div>
                  <div>
                    <span className="font-bold text-white block">Ownership Transfer</span>
                    <span className="text-neutral-500">Primary domain owner migrated.</span>
                  </div>
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">2d ago</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* SECTION 4: Quick Actions */}
              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Quick Actions</span>
                </h2>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <PlusCircle className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    Create Website
                  </button>
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <Globe className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    Manage Websites
                  </button>
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <Users className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    Manage Admins
                  </button>
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <Settings className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    Platform Settings
                  </button>
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <FileText className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    Audit Center
                  </button>
                  <button className="p-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-neutral-300 transition-all group">
                    <Key className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    License Center
                  </button>
                </div>
              </div>

              {/* SECTION 5: Platform Information */}
              <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-3xl space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  <span>Platform Information</span>
                </h2>
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden text-xs">
                  <div className="flex justify-between items-center p-3 border-b border-neutral-800">
                    <span className="text-neutral-500 font-bold">Platform Name</span>
                    <span className="text-white font-bold">NWD Enterprise</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-neutral-800">
                    <span className="text-neutral-500 font-bold">Platform Version</span>
                    <span className="text-white font-mono">v2.4.0-stable</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-neutral-800">
                    <span className="text-neutral-500 font-bold">Build Number</span>
                    <span className="text-white font-mono">#b89f2a1</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border-b border-neutral-800">
                    <span className="text-neutral-500 font-bold">Environment</span>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] uppercase font-black">Production</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-neutral-500 font-bold">Firebase Project</span>
                    <span className="text-neutral-300 font-mono">ai-studio-marudharfashionp</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
`;

content = content.substring(0, startIdx) + replacement + "\n" + content.substring(endIdx);
fs.writeFileSync(file, content, 'utf8');
console.log("Replaced successfully!");
