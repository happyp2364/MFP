import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  Phone,
  Sparkles,
  SlidersHorizontal,
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
  createNoPermissionMatrix,
} from '../../lib/adminPermissions';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adminData: Partial<AdminUser>) => Promise<void>;
  customRoles?: AdminRole[];
}

export const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customRoles = [],
}) => {
  if (!isOpen) return null;

  const allAvailableRoles = [...BUILTIN_ROLES, ...customRoles];

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin');
  const [enableCustomOverrides, setEnableCustomOverrides] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<Partial<AdminPermissionMatrix>>({});
  const [showPermissionsAccordion, setShowPermissionsAccordion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoleDef = allAvailableRoles.find((r) => r.id === selectedRoleId) || BUILTIN_ROLES[1];

  const handleToggleCustomPermission = (moduleKey: AdminModule, action: AdminAction) => {
    setCustomPermissions((prev) => {
      const currentMod = prev[moduleKey] || { ...(selectedRoleDef.permissions[moduleKey] || NO_PERMISSIONS) };
      return {
        ...prev,
        [moduleKey]: {
          ...currentMod,
          [action]: !currentMod[action],
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!cleanName) {
      setError('Please enter the full name of the admin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAdminData: Partial<AdminUser> = {
        email: cleanEmail,
        name: cleanName,
        phoneNumber: phoneNumber.trim(),
        roleId: selectedRoleId,
        roleName: selectedRoleDef.name,
        status: 'active',
        customPermissions: enableCustomOverrides ? customPermissions : undefined,
      };

      await onSave(newAdminData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create admin user.');
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
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">Create & Invite New Admin Account</h2>
              <p className="text-xs text-neutral-400">
                Grant role-based access control with granular module permissions
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

          {/* Account Identity Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Admin Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@nwd.app"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Role Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAvailableRoles.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {role.name}
                        {role.isSystemPreset && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-normal">
                            System Preset
                          </span>
                        )}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-amber-500 text-black rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug line-clamp-2">{role.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Custom Permission Overrides Toggle */}
          <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white">Custom Permission Overrides</span>
                  <p className="text-[10px] text-neutral-400">
                    Optionally override specific module Read/Create/Edit/Delete/Export toggles
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnableCustomOverrides(!enableCustomOverrides);
                  setShowPermissionsAccordion(!enableCustomOverrides);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  enableCustomOverrides ? 'bg-amber-500' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableCustomOverrides ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {enableCustomOverrides && (
              <div className="pt-3 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setShowPermissionsAccordion(!showPermissionsAccordion)}
                  className="w-full flex items-center justify-between p-2.5 bg-neutral-900 rounded-xl text-xs font-bold text-amber-300 hover:bg-neutral-850 transition-all"
                >
                  <span>Configure Module Permission Matrix ({ADMIN_MODULE_LIST.length} Modules)</span>
                  {showPermissionsAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showPermissionsAccordion && (
                  <div className="mt-3 space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {ADMIN_MODULE_LIST.map((mod) => {
                      const modPerms =
                        customPermissions[mod.key] || selectedRoleDef.permissions[mod.key] || NO_PERMISSIONS;

                      return (
                        <div
                          key={mod.key}
                          className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">{mod.label}</span>
                            <span className="text-[10px] text-neutral-500">{mod.description}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                            {(['read', 'create', 'edit', 'delete', 'export'] as AdminAction[]).map((act) => {
                              const active = modPerms[act];
                              return (
                                <button
                                  key={act}
                                  type="button"
                                  onClick={() => handleToggleCustomPermission(mod.key, act)}
                                  className={`px-2 py-1 rounded-lg border font-bold capitalize transition-all ${
                                    active
                                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                      : 'bg-neutral-950 text-neutral-600 border-neutral-800 hover:border-neutral-700'
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
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
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
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Create Admin Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
