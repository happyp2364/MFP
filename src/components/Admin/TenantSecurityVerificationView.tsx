import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Building,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Copy,
  Download,
  Terminal,
  KeyRound,
  Users,
} from 'lucide-react';
import {
  runSecurityVerificationSuite,
  SecurityVerificationReport,
  VerificationTestResult,
} from '../../lib/securityVerificationSuite';

export const TenantSecurityVerificationView: React.FC = () => {
  const [report, setReport] = useState<SecurityVerificationReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [copiedReport, setCopiedReport] = useState(false);

  const executeSuite = async () => {
    setIsRunning(true);
    try {
      const result = await runSecurityVerificationSuite();
      setReport(result);
    } catch (e) {
      console.error('Failed to run security suite:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    executeSuite();
  }, []);

  const copyReportToClipboard = () => {
    if (!report) return;
    const reportText = `
=================================================
TENANT ISOLATION & SECURITY VERIFICATION REPORT
Generated: ${report.timestamp}
Overall Status: ${report.overallStatus}
Total Tests: ${report.totalTests} | Passed: ${report.passedCount} | Failed: ${report.failedCount}
=================================================

SUMMARY:
• Super Admin Access: ${report.summary.superAdminAccess}
• Website Admin Isolation: ${report.summary.websiteAdminIsolation}
• Manager & Staff Confinement: ${report.summary.managerStaffIsolation}
• Customer Data Isolation: ${report.summary.customerDataIsolation}
• Super Admin Module Protection: ${report.summary.superAdminModuleProtection}

TEST RESULTS:
${report.results
  .map(
    (r) =>
      `[${r.passed ? 'PASS' : 'FAIL'}] ${r.id} - ${r.testName}\n  Category: ${r.category}\n  Details: ${r.details}\n`
  )
  .join('\n')}
=================================================
`.trim();

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const filteredResults = report
    ? report.results.filter((r) => {
        if (selectedFilter === 'PASSED') return r.passed;
        if (selectedFilter === 'FAILED') return !r.passed;
        return true;
      })
    : [];

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 p-6 rounded-3xl border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Automated Security Verification
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Tenant Isolation Active
              </span>
            </div>
            <h1 className="text-xl font-black text-white mt-1">Multi-Tenant Isolation & RBAC Verification Console</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Comprehensive automated verification verifying zero cross-tenant data leaks and strict role authorization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={executeSuite}
            disabled={isRunning}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/10 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Security Tests...' : 'Re-Run Verification Suite'}
          </button>
          <button
            onClick={copyReportToClipboard}
            disabled={!report}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-4 h-4 text-neutral-300" />
            {copiedReport ? 'Report Copied!' : 'Export Security Report'}
          </button>
        </div>
      </div>

      {/* Report Metrics Bar */}
      {report && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Overall Isolation Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-lg font-black ${
                    report.overallStatus === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {report.overallStatus === 'PASSED' ? 'VERIFIED PASSED' : 'ACTION REQUIRED'}
                </span>
              </div>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                report.overallStatus === 'PASSED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {report.overallStatus === 'PASSED' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Total Security Assertions</p>
              <p className="text-xl font-black text-white mt-1">{report.totalTests} Tests Run</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Isolation Checks Passed</p>
              <p className="text-xl font-black text-emerald-400 mt-1">{report.passedCount} Verified</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Security Failures</p>
              <p className="text-xl font-black text-neutral-300 mt-1">{report.failedCount} Errors</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {report && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Tenant Security Verification Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="font-bold text-emerald-400 block mb-1">Super Admin Access</span>
              <p className="text-neutral-300">{report.summary.superAdminAccess}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="font-bold text-sky-400 block mb-1">Website Admin Isolation</span>
              <p className="text-neutral-300">{report.summary.websiteAdminIsolation}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="font-bold text-purple-400 block mb-1">Manager & Staff Confinement</span>
              <p className="text-neutral-300">{report.summary.managerStaffIsolation}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="font-bold text-amber-400 block mb-1">Super Admin Module Protection</span>
              <p className="text-neutral-300">{report.summary.superAdminModuleProtection}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Filter & Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-900">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Automated Test Execution Results</h3>
            <span className="text-xs text-neutral-400">({filteredResults.length} test assertions)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setSelectedFilter('PASSED')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedFilter === 'PASSED'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Passed Only
            </button>
            <button
              onClick={() => setSelectedFilter('FAILED')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                selectedFilter === 'FAILED'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Failed Only
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-800">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-800/40 transition"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    result.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {result.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">{result.id}</span>
                    <h4 className="text-xs font-bold text-white">{result.testName}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{result.description}</p>
                  <p className="text-[11px] font-mono text-neutral-300 mt-1.5 bg-neutral-950 p-2 rounded-lg border border-neutral-800/80 inline-block">
                    {result.details}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    result.passed
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {result.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No test results matching filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
