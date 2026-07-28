import React, { useState } from 'react';
import { Clock, RotateCcw, History, AlertCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const VersionHistoryView: React.FC = () => {
  const { auditLogs } = useStore();
  const [expandedVerId, setExpandedVerId] = useState<string | null>(null);

  const historyLogs = auditLogs ? auditLogs.filter(log => log.category === 'SETTINGS' || log.category === 'PRODUCT') : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Status */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B8F63]/10 text-[#0B8F63] flex items-center justify-center font-bold">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base">Real-Time Sync Audit & Activity Log</h3>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                🟢 Live Real-Time Firestore Sync
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              All admin actions are saved directly to Firestore and instantly updated for live store customers.
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200 w-full md:w-auto">
          <div className="font-bold text-neutral-800">Firestore Connection Status</div>
          <div className="text-[11px] font-mono text-emerald-700 mt-0.5 font-bold">
            Connected (Live Updates Enabled)
          </div>
        </div>
      </div>

      {/* Version History List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h4 className="font-bold text-neutral-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B8F63]" />
            Recent Admin Activity Log ({historyLogs.length} events recorded)
          </h4>
        </div>

        {historyLogs.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            No recent activity recorded yet. Changes made in the Admin panel will appear here automatically.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {historyLogs.map((log) => {
              const isExpanded = expandedVerId === log.id;

              return (
                <div key={log.id} className="p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        LOG
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 text-sm">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{log.details}</p>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1 font-mono">
                          <span>📅 {new Date(log.timestamp).toLocaleString()}</span>
                          <span>👤 {log.userEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
