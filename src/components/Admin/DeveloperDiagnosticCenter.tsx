import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Zap, 
  Brain, 
  Activity, 
  Database, 
  Palette, 
  Smartphone, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  FileText,
  Terminal,
  Layers,
  History,
  Save,
  ArrowRight,
  Clock,
  Info as InfoIcon,
  Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DiagnosticIssue, DiagnosticScanResult, DiagnosticCenterState } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const DeveloperDiagnosticCenter: React.FC = () => {
  const { products, orders, reviews, storeInfo } = useStore();
  const [state, setState] = useState<DiagnosticCenterState>({
    isScanning: false,
    activeFixes: [],
    restorePoints: [
      { id: 'initial', timestamp: new Date().toISOString(), description: 'Automatic System Backup', data: {} }
    ]
  });

  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'history'>('overview');

  const startScan = async () => {
    setState(prev => ({ ...prev, isScanning: true }));
    setScanProgress(0);

    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 10) {
      setScanProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Heuristic Scan logic
    const detectedIssues: DiagnosticIssue[] = [];

    // 1. Performance / Image Audit
    products.forEach(p => {
      if (!p.images || p.images.length === 0) {
        detectedIssues.push({
          id: `img-${p.id}`,
          severity: 'high',
          category: 'ui',
          location: { file: 'src/types.ts', component: 'ProductCard', function: 'Render' },
          description: `Product "${p.name}" is missing images.`,
          suggestedFix: 'Add at least one product image.',
          isSafeToFix: false,
          status: 'detected',
          detectedAt: new Date().toISOString()
        });
      }
    });

    // 2. UI / Contrast (Simulated)
    if (storeInfo.name.length < 3) {
      detectedIssues.push({
        id: 'ui-short-name',
        severity: 'low',
        category: 'ui',
        location: { component: 'Navbar' },
        description: 'Store name is too short for optimal SEO and branding.',
        suggestedFix: 'Update store name in Settings.',
        isSafeToFix: false,
        status: 'detected',
        detectedAt: new Date().toISOString()
      });
    }

    // 4. Security Audit
    const unsecurePayment = orders.some(o => o.paymentStatus === 'PENDING' && new Date(o.createdAt).getTime() < Date.now() - 86400000 * 7);
    if (unsecurePayment) {
      detectedIssues.push({
        id: 'sec-stale-orders',
        severity: 'medium',
        category: 'security',
        location: { file: 'src/context/StoreContext.tsx' },
        description: 'Found pending orders older than 7 days. Potential abandoned checkout sessions.',
        suggestedFix: 'Configure auto-cancellation for stale pending orders.',
        isSafeToFix: true,
        status: 'detected',
        detectedAt: new Date().toISOString()
      });
    }

    const result: DiagnosticScanResult = {
      scanId: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
      issues: detectedIssues,
      healthScores: {
        performance: Math.max(0, 100 - detectedIssues.filter(i => i.category === 'performance').length * 10),
        security: 95,
        accessibility: 92,
        ui: 88,
        firestore: Math.max(0, 100 - detectedIssues.filter(i => i.category === 'firestore').length * 15),
        overall: 0
      }
    };
    
    result.healthScores.overall = Math.round(
      (result.healthScores.performance + result.healthScores.security + result.healthScores.accessibility + result.healthScores.ui + result.healthScores.firestore) / 5
    );

    setState(prev => ({ 
      ...prev, 
      isScanning: false, 
      lastScan: result 
    }));
    setActiveTab('issues');
  };

  const handleFixIssue = async (issueId: string) => {
    setState(prev => ({ ...prev, activeFixes: [...prev.activeFixes, issueId] }));
    
    // Simulate fixing
    await new Promise(resolve => setTimeout(resolve, 1500));

    setState(prev => {
      if (!prev.lastScan) return prev;
      const updatedIssues = prev.lastScan.issues.map(i => 
        i.id === issueId ? { ...i, status: 'fixed' as const } : i
      );
      return {
        ...prev,
        activeFixes: prev.activeFixes.filter(id => id !== issueId),
        lastScan: { ...prev.lastScan, issues: updatedIssues }
      };
    });
  };

  const fixAllSafe = async () => {
    if (!state.lastScan) return;
    const safeIssues = state.lastScan.issues.filter(i => i.isSafeToFix && i.status === 'detected');
    
    for (const issue of safeIssues) {
      await handleFixIssue(issue.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-neutral-50/50 rounded-3xl border border-neutral-200/50">
      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl shadow-neutral-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
                Developer Diagnostic Center
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black border border-emerald-200">Super Admin</span>
              </h1>
              <p className="text-sm text-neutral-500 font-medium">Advanced project auditing, error detection, and safe automated repairs.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={startScan}
            disabled={state.isScanning}
            className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-lg shadow-neutral-200 group"
          >
            {state.isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            {state.isScanning ? `Scanning... ${scanProgress}%` : 'Scan Website'}
          </button>
          
          <button
            className="p-3 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm"
            title="Diagnostic History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Stats & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Health Score Card */}
          {state.lastScan && (
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-neutral-100"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={
                        state.lastScan.healthScores.overall > 80 ? 'text-emerald-500' : 
                        state.lastScan.healthScores.overall > 50 ? 'text-amber-500' : 'text-rose-500'
                      }
                      strokeWidth="8"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * state.lastScan.healthScores.overall) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-neutral-900">{state.lastScan.healthScores.overall}%</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Health</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Performance', score: state.lastScan.healthScores.performance, icon: Zap, color: 'emerald' },
                  { label: 'Security', score: state.lastScan.healthScores.security, icon: Lock, color: 'blue' },
                  { label: 'Accessibility', score: state.lastScan.healthScores.accessibility, icon: Smartphone, color: 'purple' },
                  { label: 'UI/UX', score: state.lastScan.healthScores.ui, icon: Palette, color: 'pink' },
                  { label: 'Database', score: state.lastScan.healthScores.firestore, icon: Database, color: 'amber' },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <stat.icon className="w-3 h-3" />
                        <span>{stat.label}</span>
                      </div>
                      <span>{stat.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-${stat.color}-500`}
                        style={{ width: `${stat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions List */}
          <div className="space-y-2">
            {[
              { id: 'health', label: 'Quick Health Check', icon: Activity, color: 'text-emerald-600' },
              { id: 'ai', label: 'AI Bug Detection', icon: Brain, color: 'text-purple-600' },
              { id: 'perf', label: 'Performance Audit', icon: Zap, color: 'text-amber-600' },
              { id: 'db', label: 'Firestore Audit', icon: Database, color: 'text-blue-600' },
              { id: 'ui', label: 'UI & Theme Audit', icon: Palette, color: 'text-pink-600' },
              { id: 'resp', label: 'Responsive Audit', icon: Smartphone, color: 'text-neutral-600' },
              { id: 'sec', label: 'Security Audit', icon: Lock, color: 'text-indigo-600' },
            ].map((action) => (
              <button
                key={action.id}
                className="w-full flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-900 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-neutral-50 group-hover:bg-neutral-100 transition-colors ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-neutral-700">{action.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-neutral-300 group-hover:text-neutral-900 transition-colors" />
              </button>
            ))}
          </div>

          {/* Safe Cleanup Card */}
          <div className="bg-amber-50 p-5 rounded-3xl border border-amber-200/50 space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Safe Cleanup Center</span>
            </div>
            <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
              Automatically identify and remove unused assets, dead code paths, and orphan database references.
            </p>
            <button className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-black shadow-lg shadow-amber-200/50 hover:bg-amber-700 transition-colors uppercase tracking-widest">
              Launch Cleanup
            </button>
          </div>
        </div>

        {/* Right Column: Scan Results & Details */}
        <div className="lg:col-span-3 space-y-6">
          {!state.lastScan && !state.isScanning ? (
            <div className="bg-white border-2 border-dashed border-neutral-200 rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                <Search className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900">System Scan Required</h3>
                <p className="text-sm text-neutral-500 max-w-sm">Run a deep-level audit to detect potential issues across your entire application ecosystem.</p>
              </div>
              <button 
                onClick={startScan}
                className="bg-neutral-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-neutral-200"
              >
                START FULL SYSTEM AUDIT
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="flex items-center gap-1">
                  {['overview', 'issues', 'history'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t as any)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === t ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={fixAllSafe}
                  disabled={!state.lastScan?.issues.some(i => i.isSafeToFix && i.status === 'detected')}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  <Zap className="w-3 h-3" />
                  Fix All Safe Issues
                </button>
              </div>

              {/* Issues List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {state.lastScan?.issues.map((issue) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={issue.id}
                      className={`bg-white border rounded-3xl p-5 shadow-sm overflow-hidden relative group ${
                        issue.severity === 'critical' ? 'border-rose-200' :
                        issue.severity === 'high' ? 'border-amber-200' : 'border-neutral-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          issue.severity === 'critical' ? 'bg-rose-50 text-rose-600' :
                          issue.severity === 'high' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-600'
                        }`}>
                          {issue.severity === 'critical' ? <XCircle className="w-6 h-6" /> : 
                           issue.severity === 'high' ? <AlertTriangle className="w-6 h-6" /> : <InfoIcon className="w-6 h-6" />}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              issue.severity === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              issue.severity === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            }`}>
                              {issue.severity}
                            </span>
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{issue.category}</span>
                            <span className="text-[10px] font-medium text-neutral-500 flex items-center gap-1 bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-100">
                              <Terminal className="w-3 h-3" />
                              {issue.location.component || 'Global'}
                              {issue.location.function && ` → ${issue.location.function}`}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-neutral-900">{issue.description}</h4>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">{issue.suggestedFix}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
                                <Clock className="w-3 h-3" />
                                <span>Detected {new Date(issue.detectedAt).toLocaleTimeString()}</span>
                              </div>
                              {issue.isSafeToFix && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Safe to Auto-Fix</span>
                                </div>
                              )}
                            </div>

                            <button
                              disabled={issue.status === 'fixed' || state.activeFixes.includes(issue.id)}
                              onClick={() => handleFixIssue(issue.id)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                issue.status === 'fixed' 
                                  ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                              }`}
                            >
                              {state.activeFixes.includes(issue.id) ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : issue.status === 'fixed' ? (
                                <div className="flex items-center gap-1.5">
                                  <Check className="w-3 h-3" />
                                  Fixed
                                </div>
                              ) : 'Fix Issue'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator bar */}
                      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
                        issue.status === 'fixed' ? 'bg-emerald-500 w-full' : 'bg-neutral-100 w-0'
                      }`} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
