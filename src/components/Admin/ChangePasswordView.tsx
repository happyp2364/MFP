import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  X
} from 'lucide-react';
import { changeAdminPasswordFirebase, logoutUser } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';

interface ChangePasswordViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { logoutAdmin } = useStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Calculate password strength score (0 to 5)
  const strengthScore =
    (hasMinLength ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return { label: 'None', color: 'bg-neutral-200', text: 'text-neutral-400' };
    if (strengthScore <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (strengthScore <= 4) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong', color: 'bg-[#0B8F63]', text: 'text-[#0B8F63]' };
  };

  const strengthInfo = getStrengthLabel();

  const isFormValid =
    currentPassword.trim().length > 0 &&
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage('Please enter your current admin password.');
      return;
    }

    if (!isFormValid) {
      setErrorMessage('Please ensure all password strength requirements are met and passwords match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await changeAdminPasswordFirebase(currentPassword, newPassword);

      if (res.success) {
        setSuccessMessage('Password updated successfully.');
        
        // Log out admin session after brief pause so toast is visible
        setTimeout(async () => {
          await logoutUser();
          logoutAdmin('Admin Password Changed via Firebase');
          onSuccess();
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-lg shadow-[#0B8F63]/25 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif-heading font-bold text-lg text-neutral-900">
              Change Admin Password
            </h2>
            <p className="text-xs text-neutral-500">
              Manage your store credentials securely via Firebase Authentication
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </button>
      </div>

      {/* Security Note */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
        <ShieldCheck className="w-5 h-5 text-[#0B8F63] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Firebase Security Rules & Encryption Active</span>
          <p className="text-emerald-700 leading-relaxed mt-0.5">
            Passwords are processed directly through Firebase Authentication with end-to-end encryption. Passwords are <strong>never stored</strong> in local storage, cookies, or plain text.
          </p>
        </div>
      </div>

      {/* Main Password Change Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
        
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Update Failed</span>
              <p className="text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Success Notification Toast */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-[#0B8F63] shrink-0" />
            <div className="flex-1">
              <span className="font-bold block">Success!</span>
              <p className="text-emerald-700">{successMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Current Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            <span>Current Admin Password *</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              required
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl py-3 pl-4 pr-11 text-xs font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#0B8F63] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors"
              title={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. New Password */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#0B8F63]" />
              <span>New Admin Password *</span>
            </span>
            {newPassword.length > 0 && (
              <span className={`text-[11px] font-bold ${strengthInfo.text}`}>
                Strength: {strengthInfo.label}
              </span>
            )}
          </label>

          <div className="relative flex items-center">
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              placeholder="Enter new password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#F7F7F7] border border-neutral-200 rounded-xl py-3 pl-4 pr-11 text-xs font-medium text-neutral-900 focus:bg-white focus:ring-2 focus:ring-[#0B8F63] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors"
              title={showNewPassword ? 'Hide password' : 'Show password'}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Meter Bar */}
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-1">
            <div
              className={`h-full transition-all duration-300 ${strengthInfo.color}`}
              style={{ width: `${(strengthScore / 5) * 100}%` }}
            />
          </div>

          {/* Realtime Password Criteria Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-[11px]">
            <div className={`flex items-center gap-2 ${hasMinLength ? 'text-[#0B8F63] font-bold' : 'text-neutral-500'}`}>
              {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-neutral-300" />}
              <span>At least 8 characters</span>
            </div>

            <div className={`flex items-center gap-2 ${hasUppercase ? 'text-[#0B8F63] font-bold' : 'text-neutral-500'}`}>
              {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-neutral-300" />}
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>

            <div className={`flex items-center gap-2 ${hasLowercase ? 'text-[#0B8F63] font-bold' : 'text-neutral-500'}`}>
              {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-neutral-300" />}
              <span>At least 1 lowercase letter (a-z)</span>
            </div>

            <div className={`flex items-center gap-2 ${hasNumber ? 'text-[#0B8F63] font-bold' : 'text-neutral-500'}`}>
              {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-neutral-300" />}
              <span>At least 1 number (0-9)</span>
            </div>

            <div className={`flex items-center gap-2 col-span-1 sm:col-span-2 ${hasSpecialChar ? 'text-[#0B8F63] font-bold' : 'text-neutral-500'}`}>
              {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <XCircle className="w-3.5 h-3.5 shrink-0 text-neutral-300" />}
              <span>At least 1 special character (!@#$%^&*)</span>
            </div>
          </div>
        </div>

        {/* 3. Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Confirm New Password *</span>
            </span>
            {confirmPassword.length > 0 && (
              <span className={`text-[11px] font-bold ${passwordsMatch ? 'text-[#0B8F63]' : 'text-rose-600'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
              </span>
            )}
          </label>

          <div className="relative flex items-center">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#F7F7F7] border rounded-xl py-3 pl-4 pr-11 text-xs font-medium text-neutral-900 focus:bg-white outline-none transition-all ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-300 focus:ring-2 focus:ring-[#0B8F63]'
                    : 'border-rose-300 focus:ring-2 focus:ring-rose-500'
                  : 'border-neutral-200 focus:ring-2 focus:ring-[#0B8F63]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form Buttons */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs shadow-lg shadow-[#0B8F63]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>UPDATING FIREBASE AUTH...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>SAVE PASSWORD</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
