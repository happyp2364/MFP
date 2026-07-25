import React, { useState } from 'react';
import { ShieldCheck, Lock, User, X, AlertCircle, KeyRound, Smartphone, ShieldAlert, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { sendAdminPasswordResetEmail } from '../../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const { loginAdmin, loginWithGoogleAdmin, isTwoFactorEnabled } = useStore();
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Forgot Password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('vpcreation2002@gmail.com');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    try {
      const res = await loginAdmin(password, twoFactorCode);

      if (res.requires2FA) {
        setShowTwoFactorInput(true);
        setError('Two-Factor Authentication is active. Please enter your 6-digit code.');
        setIsAuthenticating(false);
        return;
      }

      if (res.success) {
        setPassword('');
        setTwoFactorCode('');
        setShowTwoFactorInput(false);
        onLoginSuccess();
        onClose();
      } else {
        setError(res.message || 'Invalid password or credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setResetError('Please enter a valid admin email address.');
      return;
    }

    setIsSendingReset(true);
    try {
      const res = await sendAdminPasswordResetEmail(cleanEmail);
      if (res.success) {
        setResetSuccess('A password reset link has been sent to your email. Please check your inbox and spam folder.');
      } else {
        setResetError(res.message || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setResetError(err.message || 'An error occurred while requesting password reset.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      const success = await loginWithGoogleAdmin();
      if (success) {
        onLoginSuccess();
        onClose();
      } else {
        setError('Google Authentication failed or permission denied.');
      }
    } catch (err: any) {
      setError('Google Sign-In Error: ' + (err.message || 'Access Denied'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-lg shadow-[#0B8F63]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-lg text-neutral-900">
                {showForgotPassword ? 'Admin Password Recovery' : 'Enterprise Admin Login'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                Marudhar Fashion Point Security Console
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Badge */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-emerald-800">
          <ShieldAlert className="w-5 h-5 text-[#0B8F63] shrink-0" />
          <div>
            <span className="font-bold">Encrypted Session (256-Bit SSL)</span>
            <p className="text-[10px] text-emerald-700">Protected by Firebase Authentication & Audit Logging</p>
          </div>
        </div>

        {showForgotPassword ? (
          /* Forgot Password View */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-in fade-in duration-200">
            {resetError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0B8F63] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{resetSuccess}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Admin Email Address *</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="enter admin email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>
              <p className="text-[11px] text-neutral-500">
                Firebase will send an official password reset link to this email address.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSendingReset}
              className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-[#0B8F63]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              <span>{isSendingReset ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetError(null);
                  setResetSuccess(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin Login</span>
              </button>
            </div>
          </form>
        ) : (
          /* Normal Login View */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 block">Admin Identity</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  disabled
                  value="vpcreation2002@gmail.com (Owner Admin)"
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-neutral-600 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-700 block">Admin Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetError(null);
                    setResetSuccess(null);
                  }}
                  className="text-xs font-bold text-[#0B8F63] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>
            </div>

            {/* 2FA Input Step */}
            {(showTwoFactorInput || isTwoFactorEnabled) && (
              <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-[#0B8F63] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  <span>6-Digit 2FA Authenticator Code</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border-2 border-[#0B8F63] rounded-xl py-2.5 px-4 text-center text-sm tracking-widest font-mono font-bold text-neutral-900 focus:ring-2 focus:ring-[#0B8F63] outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-[#0B8F63]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isAuthenticating ? 'VERIFYING CREDENTIALS...' : 'VERIFY & ENTER DASHBOARD'}</span>
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-bold text-neutral-400 absolute">
            OR GOOGLE AUTH
          </span>
        </div>

        {/* Firebase Google Auth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isAuthenticating}
          className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs py-3 px-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center gap-2.5 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          <span>SIGN IN WITH GOOGLE FIREBASE AUTH</span>
        </button>

        <div className="text-center pt-2 text-[10px] text-neutral-400 border-t border-neutral-100">
          Marudhar Fashion Point • Protected by Firebase Security Rules & ABAC
        </div>

      </div>
    </div>
  );
};
