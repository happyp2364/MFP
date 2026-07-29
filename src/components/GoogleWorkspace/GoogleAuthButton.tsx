import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { LogIn, LogOut, Calendar, Mail, CheckCircle, ShieldCheck } from 'lucide-react';
import { signInWithGoogle, logoutUser, onUserAuthChange, getCachedAccessToken } from '../../lib/firebase';

interface GoogleAuthButtonProps {
  onOpenWorkspaceHub?: () => void;
  compact?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onOpenWorkspaceHub,
  compact = false,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(!!getCachedAccessToken());

  useEffect(() => {
    const unsubscribe = onUserAuthChange((currentUser) => {
      setUser(currentUser);
      setHasToken(!!getCachedAccessToken());
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const res = await signInWithGoogle();
      if (res?.token) {
        setHasToken(true);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setHasToken(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    if (compact) {
      return (
        <button
          onClick={onOpenWorkspaceHub}
          className="flex items-center gap-2 p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all text-xs font-semibold"
          title={`Google Account: ${user.email}`}
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#0B8F63] text-white flex items-center justify-center text-xs font-bold">
              {user.email?.[0].toUpperCase() || 'G'}
            </div>
          )}
          <span className="hidden sm:inline text-[11px] font-bold text-[#0B8F63] max-w-[100px] truncate">
            {user.displayName?.split(' ')[0] || 'Google User'}
          </span>
          <div className="flex items-center gap-1 text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full font-bold">
            <Calendar className="w-2.5 h-2.5" />
            <Mail className="w-2.5 h-2.5" />
          </div>
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2 bg-neutral-900 text-white p-2 sm:p-2.5 rounded-2xl border border-neutral-800 shadow-md">
        <button
          onClick={onOpenWorkspaceHub}
          className="flex items-center gap-2.5 flex-1 text-left group"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-emerald-400/40" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0B8F63] text-white flex items-center justify-center font-bold text-xs">
              {user.email?.[0].toUpperCase() || 'G'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                {user.displayName || 'Google Account'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
          </div>
        </button>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          title="Sign out Google Account"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className={`flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-sm active:scale-95 ${
        compact
          ? 'bg-neutral-900 hover:bg-neutral-800 text-white text-xs px-3 py-1.5 border border-neutral-700'
          : 'w-full bg-[#0B8F63] hover:bg-[#086F4C] text-white text-xs py-2.5 px-4 rounded-xl shadow-md'
      }`}
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
    </button>
  );
};
