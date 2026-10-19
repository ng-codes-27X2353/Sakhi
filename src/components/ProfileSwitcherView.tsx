import React from 'react';
import { 
  User, UserPlus, Check, Trash2, ExternalLink, 
  ShieldAlert, Key, FileSpreadsheet, Sparkles, Hash 
} from 'lucide-react';
import { UserProfile } from '../types';
import { getSavedProfiles, setActiveProfileId, deleteProfile, FORM_1_SHARE_URL, FORM_2_SHARE_URL } from '../utils/api';

interface ProfileSwitcherViewProps {
  currentProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onAddNewUser: () => void;
  onTriggerAlarmTest: () => void;
}

export const ProfileSwitcherView: React.FC<ProfileSwitcherViewProps> = ({
  currentProfile,
  onSelectProfile,
  onAddNewUser,
  onTriggerAlarmTest,
}) => {
  const allProfiles = getSavedProfiles();

  const handleSelect = (profile: UserProfile) => {
    setActiveProfileId(profile.id);
    onSelectProfile(profile);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (allProfiles.length <= 1) {
      alert('Cannot delete the only existing profile. Add a new user first.');
      return;
    }
    if (confirm('Delete this user profile from the device?')) {
      deleteProfile(id);
      const remaining = getSavedProfiles();
      if (remaining.length > 0) {
        onSelectProfile(remaining[0]);
      }
    }
  };

  return (
    <div className="space-y-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
            Sakhi Identity &amp; Multi-User
          </span>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            User Profiles
          </h2>
        </div>

        <button
          onClick={onAddNewUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Person</span>
        </button>
      </div>

      {/* Profiles List */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
          Registered Individuals (Linked by Unique ID)
        </span>

        {allProfiles.map((p) => {
          const isSelected = p.id === currentProfile.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#131c2e] border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${
                    isSelected
                      ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{p.fullName}</span>
                    <span className="px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800 text-[10px] font-mono font-bold text-cyan-300">
                      ID #{p.idNo || 1}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-600/30 border border-rose-500/40 text-[9px] font-black text-rose-300 uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Blood: <span className="font-semibold text-rose-400">{p.bloodGroup || 'O+'}</span> • DOB: {p.dob || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Switch</span>
                )}

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

      {/* Security & Alarm Test Info */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 space-y-2.5 shadow-lg">
        <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
          <Key className="w-4 h-4" />
          Active Security Disarm PIN
        </span>
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-slate-200">Registered Siren Disarm PIN:</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Enter this PIN on the numeric keypad to turn off the 5-tap siren
            </div>
          </div>
          <div className="font-mono text-base font-black text-rose-400 px-3.5 py-1 rounded-xl bg-slate-950 border border-slate-700">
            {currentProfile.pin || '••••'}
          </div>
        </div>

        <button
          onClick={onTriggerAlarmTest}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Test 5-Tap Siren &amp; PIN Keypad
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
              Open Form <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            Entry Fields: <strong>Id no. (#{currentProfile.idNo})</strong>, Full Name, DOB, E-mail, Mobile Number, PIN
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
              Open Form <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-400">
            Entry Fields: <strong>Id no. (#{currentProfile.idNo})</strong>, Blood Group, Height, Weight, Allergy
          </p>
        </div>
      </div>
    </div>
  );
};
