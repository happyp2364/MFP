import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Smartphone,
  Fingerprint,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Lock,
  Sparkles,
} from 'lucide-react';

interface SuperAdminSecurityVerificationModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  targetDetails?: string;
  onVerified: () => void;
  onCancel: () => void;
}

type VerificationMethod = 'otp' | 'authenticator' | 'biometric';

export const SuperAdminSecurityVerificationModal: React.FC<
  SuperAdminSecurityVerificationModalProps
> = ({
  isOpen,
  actionTitle,
  actionDescription,
  targetDetails,
  onVerified,
  onCancel,
}) => {
  if (!isOpen) return null;

  const [method, setMethod] = useState<VerificationMethod>('otp');
  const [otpCode, setOtpCode] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  // Expiration countdown
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendSeconds]);

  const handleResendOtp = () => {
    setResendSeconds(60);
    setOtpCode('');
    setErrorMsg('A new 6-digit Security Verification Code has been sent.');
    setTimeout(() => setErrorMsg(''), 3000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (timerSeconds <= 0) {
      setErrorMsg('Verification session expired. Please restart the operation.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (otpCode.length === 6 || otpCode === '982415' || otpCode === '123456') {
        setIsVerifying(false);
        onVerified();
      } else {
        setIsVerifying(false);
        setErrorMsg('Invalid 6-digit security code. Try entering 982415 or any 6-digit code.');
      }
    }, 600);
  };

  const handleVerifyAuthPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (timerSeconds <= 0) {
      setErrorMsg('Verification session expired. Please restart the operation.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      if (authPin.length === 6) {
        setIsVerifying(false);
        onVerified();
      } else {
        setIsVerifying(false);
        setErrorMsg('Please enter a valid 6-digit Authenticator PIN.');
      }
    }, 600);
  };

  const handleBiometricScan = () => {
    setIsBiometricScanning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 700);
    }, 1200);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-neutral-950 border border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Super Admin Verification</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Sensitive Action
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Multi-Factor Authentication Required
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Detail Card */}
        <div className="my-4 p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>{actionTitle}</span>
          </div>
          <p className="text-[11px] text-neutral-300">{actionDescription}</p>
          {targetDetails && (
            <div className="pt-1 text-[10px] font-mono text-amber-400/90 truncate">
              Target: {targetDetails}
            </div>
          )}
        </div>

        {/* Session Expiration Countdown */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Verification expires in:</span>
          </span>
          <span
            className={`font-mono font-bold ${
              timerSeconds < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
            }`}
          >
            {formatTimer(timerSeconds)}
          </span>
        </div>

        {/* Verification Method Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMethod('otp');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              method === 'otp'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>OTP Code</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethod('authenticator');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              method === 'authenticator'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Authenticator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethod('biometric');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
              method === 'biometric'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Passkey</span>
          </button>
        </div>

        {/* Error / Notice Display */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/40 rounded-2xl text-[11px] text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* METHOD 1: OTP Code */}
        {method === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Enter 6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="982415"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setOtpCode('982415')}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-fill Demo OTP (982415)</span>
              </button>

              <button
                type="button"
                disabled={resendSeconds > 0}
                onClick={handleResendOtp}
                className="text-[11px] text-neutral-400 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>
                  {resendSeconds > 0 ? `Resend (${resendSeconds}s)` : 'Resend Code'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl border border-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || otpCode.length < 6}
                className="w-1/2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* METHOD 2: Authenticator App PIN */}
        {method === 'authenticator' && (
          <form onSubmit={handleVerifyAuthPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Authenticator App 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest text-amber-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setAuthPin('123456')}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-fill Demo PIN (123456)</span>
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl border border-neutral-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || authPin.length < 6}
                className="w-1/2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {isVerifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* METHOD 3: Passkey / Biometric Touch ID */}
        {method === 'biometric' && (
          <div className="space-y-4 text-center py-2">
            <div className="flex flex-col items-center justify-center space-y-3">
              <button
                type="button"
                onClick={handleBiometricScan}
                disabled={isBiometricScanning || biometricSuccess}
                className={`p-6 rounded-full border-2 transition-all ${
                  biometricSuccess
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isBiometricScanning
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-neutral-900 border-neutral-800 text-amber-400 hover:border-amber-500 hover:scale-105'
                }`}
              >
                <Fingerprint className="w-12 h-12" />
              </button>

              <div className="text-xs">
                {biometricSuccess ? (
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Biometric Identity Confirmed!</span>
                  </span>
                ) : isBiometricScanning ? (
                  <span className="font-extrabold text-amber-300 animate-pulse">
                    Scanning Passkey / Touch ID...
                  </span>
                ) : (
                  <span className="text-neutral-300 font-bold">
                    Touch fingerprint sensor to authorize
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-xs rounded-2xl border border-neutral-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
