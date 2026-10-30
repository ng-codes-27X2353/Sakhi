import React, { useState } from 'react';
import { 
  Users, UserPlus, Key, ShieldAlert, FileSpreadsheet, 
  ExternalLink, Trash2, CheckCircle2, RotateCcw, AlertCircle, 
  LogOut, Shield, Lock 
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSavedProfiles, deleteProfile, FORM_1_SHARE_URL, FORM_2_SHARE_URL } from '../utils/api';

interface ProfileSwitcherViewProps {
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onAddNewUser: () => void;
  onTriggerAlarmTest: () => void;
  onLogout?: () => void;
  onResetPinRegister?: () => void;
}

export const ProfileSwitcherView: React.FC<ProfileSwitcherViewProps> = ({
  currentProfile,
  onSelectProfile,
  onAddNewUser,
  onTriggerAlarmTest,
  onLogout,
  onResetPinRegister,
}) => {
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(() => getSavedProfiles());
  const [showResetPinModal, setShowResetPinModal] = useState(false);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this user profile from this device?')) {
      deleteProfile(id);
      const updated = getSavedProfiles();
      setAllProfiles(updated);
      if (updated.length > 0 && currentProfile.id === id) {
        onSelectProfile(updated[0]);
      }
    }
  };

  const handleConfirmResetPin = () => {
    setShowResetPinModal(false);
    if (onResetPinRegister) {
      onResetPinRegister();
    } else {
      onAddNewUser();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Profile Strip with Logout */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center font-black">
            {currentProfile.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
              Active Profile
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{currentProfile.fullName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-cyan-300 font-bold">
                ID #{currentProfile.idNo}
              </span>
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Log out of current profile"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        )}
      </div>

      {/* Profile Multi-User Switcher */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block">
              Sakhi Identity &amp; Multi-User
            </span>
            <h2 className="text-base font-black text-white">User Profiles</h2>
          </div>

          <button
            onClick={onAddNewUser}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Person</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Registered Individuals (Linked by Unique ID)
        </div>

        {allProfiles.map((p) => {
          const isSelected = p.id === currentProfile.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{p.fullName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-cyan-300 font-bold">
                      ID #{p.idNo}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Blood: {p.bloodGroup || 'O+'} • DOB: {p.dob || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {allProfiles.length > 1 && (
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & PIN Policy (PIN is NEVER revealed; Reset requires re-registering) */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 space-y-3 shadow-lg">
        <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Key className="w-4 h-4" />
          Security Siren Disarm PIN
        </span>

        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-200">Security Disarm PIN Status:</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Encrypted for your safety and never displayed on screen.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black text-rose-400 px-3.5 py-1 rounded-xl bg-slate-950 border border-slate-700 tracking-widest">
              ••••
            </span>

            {/* Reset PIN button (person must register again) */}
            <button
              onClick={() => setShowResetPinModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition flex items-center gap-1 cursor-pointer"
              title="Reset PIN (Requires new registration)"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset PIN</span>
            </button>
          </div>
        </div>

        <button
          onClick={onTriggerAlarmTest}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Test 5-Tap Siren &amp; Disarm Keypad
        </button>
      </div>

      {/* Google Forms Connection Overview */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4" />
            Connected Google Forms (Linked by ID #{currentProfile.idNo})
          </span>
        </div>

        {/* Form 1 */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Form 1: Details (Registration &amp; PIN)</span>
            <a
              href={FORM_1_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px]"
            >
              <span>Open Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            Entry Fields: <strong className="text-cyan-300">Id no. (#{currentProfile.idNo})</strong>, Full Name, DOB, E-mail, Mobile Number, PIN
          </p>
        </div>

        {/* Form 2 */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Form 2: Basic Medical Details (Optional)</span>
            <a
              href={FORM_2_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px]"
            >
              <span>Open Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            Entry Fields: <strong className="text-cyan-300">Id no. (#{currentProfile.idNo})</strong>, Blood Group, Height, Weight, Allergy
          </p>
        </div>
      </div>

      {/* Reset PIN Confirmation Modal: Person Must Register Again */}
      {showResetPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white">
          <div className="w-full max-w-sm bg-[#0f172a] border border-blue-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Lock className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-black text-white">PIN Reset Policy</h3>
            </div>

            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-200 space-y-2">
              <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                PIN Cannot Be Revealed or Retrieved
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                To maintain emergency security, your siren disarm PIN is never revealed. <strong>To reset your PIN, you must register again</strong> with Form 1 &amp; Form 2 to establish a new verified security credential.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetPinModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPin}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                Register Again &amp; Set New PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
