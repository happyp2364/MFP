import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Check,
  AlertCircle,
  SlidersHorizontal,
  Save,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  AdminUser,
  AdminRole,
  AdminModule,
  AdminAction,
  AdminPermissionMatrix,
} from '../../types';
import {
  ADMIN_MODULE_LIST,
  BUILTIN_ROLES,
  NO_PERMISSIONS,
  FULL_PERMISSIONS,
  getEffectivePermissions,
} from '../../lib/adminPermissions';

interface EditAdminPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: AdminUser | null;
  customRoles?: AdminRole[];
  onSave: (
    uid: string,
    updatedRole: { roleId: string; roleName: string; customPermissions?: Partial<AdminPermissionMatrix> }
  ) => Promise<void>;
}

export const EditAdminPermissionsModal: React.FC<EditAdminPermissionsModalProps> = ({
  isOpen,
  onClose,
  adminUser,
  customRoles = [],
  onSave,
}) => {
  if (!isOpen || !adminUser) return null;

  const allAvailableRoles = [...BUILTIN_ROLES, ...customRoles];

  const [selectedRoleId, setSelectedRoleId] = useState<string>(adminUser.roleId || 'admin');
  const [matrix, setMatrix] = useState<AdminPermissionMatrix>(() =>
    getEffectivePermissions(adminUser, customRoles)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRoleId(adminUser.roleId || 'admin');
    setMatrix(getEffectivePermissions(adminUser, customRoles));
  }, [adminUser, customRoles]);

  const selectedRoleDef = allAvailableRoles.find((r) => r.id === selectedRoleId) || BUILTIN_ROLES[1];

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const targetRole = allAvailableRoles.find((r) => r.id === roleId);
    if (targetRole) {
      setMatrix(JSON.parse(JSON.stringify(targetRole.permissions)));
    }
  };

  const handleTogglePermission = (moduleKey: AdminModule, action: AdminAction) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || NO_PERMISSIONS),
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleSetAllModuleActions = (moduleKey: AdminModule, enabled: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [moduleKey]: enabled ? { ...FULL_PERMISSIONS } : { ...NO_PERMISSIONS },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(adminUser.uid, {
        roleId: selectedRoleId,
        roleName: selectedRoleDef.name,
        customPermissions: matrix,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update admin permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Edit Role & Permissions Matrix
              </h2>
              <p className="text-xs text-neutral-400">
                User: <span className="text-white font-bold">{adminUser.name || 'Admin User'}</span> ({adminUser.email || 'No email registered'})
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
              Select Role Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allAvailableRoles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                    }`}
                  >
                    <span className="text-xs block truncate">{role.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Permission Matrix Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Granular Permissions Matrix ({ADMIN_MODULE_LIST.length} Modules)
              </h3>
              <button
                type="button"
                onClick={() => handleRoleChange(selectedRoleId)}
                className="text-[11px] font-bold text-neutral-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Role Default
              </button>
            </div>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950">
              <div className="grid grid-cols-12 gap-2 p-3 bg-neutral-900 border-b border-neutral-800 text-[11px] font-bold uppercase text-neutral-400">
                <div className="col-span-5">Module Name</div>
                <div className="col-span-7 grid grid-cols-5 text-center">
                  <span>Read</span>
                  <span>Create</span>
                  <span>Edit</span>
                  <span>Delete</span>
                  <span>Export</span>
                </div>
              </div>

              <div className="divide-y divide-neutral-800/60 max-h-80 overflow-y-auto custom-scrollbar">
                {ADMIN_MODULE_LIST.map((mod) => {
                  const modPerms = matrix[mod.key] || NO_PERMISSIONS;
                  const allActive =
                    modPerms.read && modPerms.create && modPerms.edit && modPerms.delete && modPerms.export;

                  return (
                    <div
                      key={mod.key}
                      className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="col-span-5 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{mod.label}</span>
                          <button
                            type="button"
                            onClick={() => handleSetAllModuleActions(mod.key, !allActive)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          >
                            {allActive ? 'Clear' : 'All'}
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-500 block truncate">{mod.description}</span>
                      </div>

                      <div className="col-span-7 grid grid-cols-5 gap-1 items-center text-center">
                        {(['read', 'create', 'edit', 'delete', 'export'] as AdminAction[]).map((act) => {
                          const isChecked = modPerms[act];
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => handleTogglePermission(mod.key, act)}
                              className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                                isChecked
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              <span className="capitalize">{act.substring(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Matrix...' : 'Save Permissions'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
