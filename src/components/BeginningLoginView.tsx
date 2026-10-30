import React, { useState } from 'react';
import { 
  Lock, Phone, ArrowRight, ShieldCheck, UserPlus, 
  Server, AlertCircle, Loader2, Sparkles, Shield 
} from 'lucide-react';
import { UserProfile } from '../types';
import { serverLogin } from '../utils/api';

interface BeginningLoginViewProps {
  onAdminLogin: () => void;
  onUserLogin: (profile: UserProfile) => void;
  onStartRegistration: () => void;
  onOpenServerDirectory: () => void;
}

export const BeginningLoginView: React.FC<BeginningLoginViewProps> = ({
  onAdminLogin,
  onUserLogin,
  onStartRegistration,
  onOpenServerDirectory,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password or PIN');
      return;
    }

    setLoading(true);
    const res = await serverLogin(phone.trim(), password.trim());
    setLoading(false);

    if (res.success && res.isAdministrator) {
      onAdminLogin();
    } else if (res.success && res.userProfile) {
      onUserLogin(res.userProfile);
    } else {
      setError(res.error || 'Invalid phone number or password/PIN.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 space-y-4 animate-fade-in text-white">
      
      {/* Sakhi Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-900/50 shadow-2xl text-center space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          <img
            src="/sakhi-logo.png"
            alt="Sakhi Logo"
            className="w-10 h-10 rounded-2xl object-contain shadow-md shadow-blue-950 ring-1 ring-blue-500/30"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                Sakhi
              </span>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">
                सखी
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
              Always with you
            </span>
          </div>
        </div>

        <h1 className="text-xl font-black text-white tracking-tight">
          Sakhi Access Portal
        </h1>
        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          Sign in with your phone number and password/PIN to access your profile or manager authority.
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="p-6 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
              Sign In
            </h2>
          </div>
          <span className="text-[11px] text-cyan-400 font-semibold">
            Secure Entry
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Password / PIN
            </label>
            <input
              type="password"
              required
              placeholder="Enter password or PIN"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* REGISTRATION & DIRECTORY OPTIONS */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          <button
            type="button"
            onClick={onStartRegistration}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New User? Register Profile (Form 1 &amp; 2)</span>
          </button>

          <button
            type="button"
            onClick={onOpenServerDirectory}
            className="w-full py-2 px-3 rounded-xl hover:bg-slate-900/60 text-slate-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Browse Public Emergency Incident Directory →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
