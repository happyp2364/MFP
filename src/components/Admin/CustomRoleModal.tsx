import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Save,
  AlertCircle,
  SlidersHorizontal,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  AdminRole,
  AdminModule,
  AdminAction,
  AdminPermissionMatrix,
} from '../../types';
import {
  ADMIN_MODULE_LIST,
  NO_PERMISSIONS,
  FULL_PERMISSIONS,
  createNoPermissionMatrix,
} from '../../lib/adminPermissions';

interface CustomRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit: AdminRole | null;
  onSaveRole: (role: AdminRole) => Promise<void>;
}

export const CustomRoleModal: React.FC<CustomRoleModalProps> = ({
  isOpen,
  onClose,
  roleToEdit,
  onSaveRole,
}) => {
  if (!isOpen) return null;

  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<AdminPermissionMatrix>(() =>
    roleToEdit ? JSON.parse(JSON.stringify(roleToEdit.permissions)) : createNoPermissionMatrix()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name);
      setDescription(roleToEdit.description);
      setPermissions(JSON.parse(JSON.stringify(roleToEdit.permissions)));
    } else {
      setRoleName('');
      setDescription('');
      setPermissions(createNoPermissionMatrix());
    }
  }, [roleToEdit]);

  const handleToggleAction = (moduleKey: AdminModule, action: AdminAction) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || NO_PERMISSIONS),
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleToggleModuleAll = (moduleKey: AdminModule, enable: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: enable ? { ...FULL_PERMISSIONS } : { ...NO_PERMISSIONS },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = roleName.trim();
    if (!cleanName) {
      setError('Please enter a role name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const roleId = roleToEdit?.id || `role_custom_${Date.now()}`;
      const newRole: AdminRole = {
        id: roleId,
        name: cleanName,
        description: description.trim() || 'Custom administrative role',
        isSystemPreset: false,
        permissions,
        createdAt: roleToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveRole(newRole);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save custom role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                {roleToEdit ? 'Edit Custom Role' : 'Create Custom Role'}
              </h2>
              <p className="text-xs text-neutral-400">
                Define a tailored role preset with customized module permission matrix
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Role Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g. Regional Store Supervisor"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the operational scope and responsibilities of this role..."
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Module Permissions Matrix */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Module Permissions Matrix
            </h3>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950 max-h-72 overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-neutral-800/60">
                {ADMIN_MODULE_LIST.map((mod) => {
                  const modPerms = permissions[mod.key] || NO_PERMISSIONS;
                  const allActive =
                    modPerms.read && modPerms.create && modPerms.edit && modPerms.delete && modPerms.export;

                  return (
                    <div key={mod.key} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-neutral-900/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{mod.label}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleModuleAll(mod.key, !allActive)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                          >
                            {allActive ? 'Clear' : 'All'}
                          </button>
                        </div>
                        <span className="text-[10px] text-neutral-500 block">{mod.description}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        {(['read', 'create', 'edit', 'delete', 'export'] as AdminAction[]).map((act) => {
                          const active = modPerms[act];
                          return (
                            <button
                              key={act}
                              type="button"
                              onClick={() => handleToggleAction(mod.key, act)}
                              className={`px-2 py-1 rounded-lg border font-bold capitalize transition-all ${
                                active
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                  : 'bg-neutral-900 text-neutral-600 border-neutral-800 hover:border-neutral-700'
                              }`}
                            >
                              {act}
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
              <span>{isSubmitting ? 'Saving Role...' : 'Save Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
