import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CustomerAuthGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reasonTitle?: string;
  reasonDescription?: string;
}

export const CustomerAuthGuardModal: React.FC<CustomerAuthGuardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reasonTitle = 'Login Required to Place Order',
  reasonDescription = 'Please log in securely to continue with your purchase, track orders, and checkout.',
}) => {
  const { customerSignInWithGoogle, customerUser, isCustomerAuthLoading, customerAuthError, showToast } = useStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await customerSignInWithGoogle();
      showToast('Successfully logged in!', 'success');
      onSuccess();
    } catch (err: any) {
      console.error('Customer login error:', err);
      showToast(err?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/70 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20 animate-in zoom-in-95 duration-200">
        
        {/* Top Decorative Gradient */}
        <div className="bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 bg-amber-500/20 rounded-2xl border border-amber-400/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>

          <h3 className="text-xl font-serif font-bold text-amber-100">{reasonTitle}</h3>
          <p className="text-xs text-neutral-300 mt-1 max-w-xs mx-auto leading-relaxed">
            {reasonDescription}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {customerAuthError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{customerAuthError}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              type="button"
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 bg-white border border-neutral-300 hover:border-neutral-400 rounded-2xl shadow-sm hover:shadow transition-all text-neutral-800 font-medium text-sm disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.35 7.23 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.44 8.14 0 9.88 0 12s.44 3.86 1.2 5.4l4.08-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.65 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-4 text-neutral-400 text-[11px] uppercase tracking-wider">Secure & Encrypted</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold block mb-0.5">Secure Customer Authentication</span>
              Your account allows secure order tracking, instant checkout, and personalized updates for this store. We never share your credentials.
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              type="button"
              className="text-xs text-neutral-500 hover:text-neutral-800 font-medium transition-colors"
            >
              Continue browsing without login (Cancel order)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
