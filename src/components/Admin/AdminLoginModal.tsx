import React, { useState } from 'react';
import { ShieldCheck, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

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

  const { loginWithGoogleAdmin } = useStore();
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsAuthenticating(true);

    try {
      const result = await loginWithGoogleAdmin();
      if (result && result.success) {
        onLoginSuccess();
        onClose();
      } else {
        setError(
          result?.error ||
            'Google Sign-In is temporarily unavailable because this website domain has not yet been authorized. Please contact the website administrator.'
        );
      }
    } catch (err: any) {
      console.error('Google Admin Login Exception:', err);
      setError(
        err?.message ||
          'Google Sign-In is temporarily unavailable because this website domain has not yet been authorized. Please contact the website administrator.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B8F63] text-white flex items-center justify-center shadow-lg shadow-[#0B8F63]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading font-bold text-lg text-neutral-900">
                Enterprise Admin Login
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                Security Console Access
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

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Firebase Google Auth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isAuthenticating}
          className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs py-3 px-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center gap-2.5 transition-all"
        >
          {isAuthenticating ? (
            <span className="animate-pulse">AUTHENTICATING...</span>
          ) : (
            <>
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
              <span>SIGN IN WITH GOOGLE</span>
            </>
          )}
        </button>

        <div className="text-center pt-2 text-[10px] text-neutral-400 border-t border-neutral-100">
          Protected by Firebase Security Rules & ABAC
        </div>
      </div>
    </div>
  );
};
