import React from 'react';
import {
  X,
  History,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  SmartphoneNfc,
} from 'lucide-react';
import { AdminUser } from '../../types';

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  isOpen,
  onClose,
  adminUser,
}) => {
  if (!isOpen || !adminUser) return null;

  const history = adminUser.loginHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Admin Session & Device Audit</h2>
              <p className="text-xs text-neutral-400">
                User: <span className="text-white font-bold">{adminUser.name}</span> ({adminUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Active Device Info Card */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Latest Active Device & Session Specs
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Device / OS</span>
                <span className="font-bold text-white block mt-0.5">{adminUser.deviceInfo || 'Web Browser'}</span>
              </div>

              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Last Login Time</span>
                <span className="font-bold text-white block mt-0.5">
                  {adminUser.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'Never Logged In'}
                </span>
              </div>

              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Account Status</span>
                <span
                  className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-full mt-1 ${
                    adminUser.status === 'active'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {adminUser.status.toUpperCase()}
                </span>
              </div>

              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Assigned Role</span>
                <span className="font-bold text-amber-300 block mt-0.5">{adminUser.roleName || adminUser.roleId}</span>
              </div>
            </div>
          </div>

          {/* Login History Logs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Authentication History ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950/40 border border-neutral-800/60 rounded-2xl text-neutral-500 text-xs">
                No recorded login events for this admin user yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {history.map((entry) => {
                  const isSuccess = entry.status === 'success';
                  return (
                    <div
                      key={entry.id || entry.timestamp}
                      className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSuccess
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{entry.device || 'Unknown Browser'}</span>
                          <span className="text-[10px] text-neutral-500 flex items-center gap-2">
                            <span>Method: <strong className="text-neutral-400 uppercase">{entry.loginMethod}</strong></span>
                            {entry.ip && <span>• IP: {entry.ip}</span>}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider ${
                            isSuccess ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
