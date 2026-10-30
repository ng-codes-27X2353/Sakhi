import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, Footprints, Moon, Droplets, 
  Ruler, Weight, AlertTriangle, Battery, Bluetooth, 
  Vibrate, RefreshCw, CheckCircle2, Edit3, Flame, ExternalLink 
} from 'lucide-react';
import { UserProfile } from '../types';
import { submitForm2, upsertProfile, FORM_2_SHARE_URL } from '../utils/api';

interface HealthRingViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const HealthRingView: React.FC<HealthRingViewProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || 'O+');
  const [height, setHeight] = useState(profile.height || '');
  const [weight, setWeight] = useState(profile.weight || '');
  const [allergy, setAllergy] = useState(profile.allergy || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Live heart rate pulse simulator
  const [liveHeartRate, setLiveHeartRate] = useState(profile.heartRate || 72);
  const [isRingVibrating, setIsRingVibrating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Subtle natural variation between 70 and 76 bpm
      const delta = (Math.random() - 0.5) * 4;
      setLiveHeartRate(Math.round(72 + delta));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleTestVibration = () => {
    setIsRingVibrating(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([150, 100, 150, 100, 300]);
    }
    setTimeout(() => setIsRingVibrating(false), 2000);
  };

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSyncStatus(`Syncing with Google Form #2 for ID #${profile.idNo}...`);

    const res = await submitForm2({
      idNo: profile.idNo,
      bloodGroup: bloodGroup.trim(),
      height: height.trim(),
      weight: weight.trim(),
      allergy: allergy.trim(),
    });

    const updatedProfile: UserProfile = {
      ...profile,
      bloodGroup: bloodGroup.trim(),
      height: height.trim() || undefined,
      weight: weight.trim() || undefined,
      allergy: allergy.trim() || undefined,
      updatedAt: new Date().toISOString(),
      form2Submitted: true,
    };

    upsertProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setIsSubmitting(false);
    setIsEditingVitals(false);
    setSyncStatus(res.success ? `Synced with Google Form 2 (ID #${profile.idNo}) ✓` : 'Updated locally');
    setTimeout(() => setSyncStatus(null), 3500);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
            Sakhi Smart Health Ring
          </span>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Health &amp; Ring Vitals
          </h2>
        </div>

        <button
          onClick={() => setIsEditingVitals(!isEditingVitals)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isEditingVitals ? 'Cancel' : 'Edit Vitals'}</span>
        </button>
      </div>

      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Ring Connectivity Banner as in Image 2 */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/50 relative">
            <Bluetooth className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">Sakhi Ring Gen 2</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
                Connected
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-cyan-300">
                <Battery className="w-3.5 h-3.5" />
                {profile.ringBattery || 82}%
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400 text-[11px]">ID #{profile.idNo}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleTestVibration}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
            isRingVibrating
              ? 'bg-rose-600 text-white animate-bounce'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
          title="Test Ring Haptic Vibration"
        >
          <Vibrate className="w-3.5 h-3.5" />
          <span>{isRingVibrating ? 'Vibrating...' : 'Test Haptics'}</span>
        </button>
      </div>

      {/* Edit Vitals Form if active */}
      {isEditingVitals && (
        <form onSubmit={handleSaveVitals} className="p-4 rounded-3xl bg-slate-900 border border-blue-900/60 space-y-3.5 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              Edit Vitals (Linked to ID #{profile.idNo})
            </span>
            <a
              href={FORM_2_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-300 hover:text-white flex items-center gap-1"
            >
              <span>View Form 2</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Blood Group
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-1.5">
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-1 rounded text-xs font-bold transition ${
                    bloodGroup === bg ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                placeholder="e.g. 178 cm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                placeholder="e.g. 72 kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Allergies</label>
            <input
              type="text"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              placeholder="e.g. Penicillin, Peanuts"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingVitals(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 font-bold text-xs text-white cursor-pointer"
            >
              {isSubmitting ? 'Syncing...' : 'Save & Sync Google Form 2'}
            </button>
          </div>
        </form>
      )}

      {/* Ring Vital Metrics (Heart Rate, Steps, Sleep as in Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Heart Rate Card */}
        <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Heart Rate
            </span>
            <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Live Sensor
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-white">{liveHeartRate}</span>
            <span className="text-xs font-bold text-slate-400">bpm</span>
          </div>

          {/* Animated SVG Pulse wave */}
          <div className="mt-3 h-8 w-full overflow-hidden flex items-center">
            <svg className="w-full h-8 text-rose-500 stroke-current fill-none" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path
                d="M0,12 L20,12 L25,4 L30,22 L35,8 L40,15 L45,12 L65,12 L70,4 L75,22 L80,8 L85,15 L90,12 L100,12"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        {/* Steps Tracker */}
        <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-emerald-400" />
              Daily Steps
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              Goal: {profile.stepsGoal || 10000}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-white">{profile.steps || 5842}</span>
            <span className="text-xs font-bold text-slate-400">steps</span>
          </div>

          <div className="mt-3 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2.5 rounded-full"
              style={{ width: `${Math.min(100, ((profile.steps || 5842) / (profile.stepsGoal || 10000)) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            58% of daily goal completed
          </span>
        </div>

        {/* Sleep Quality */}
        <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-400" />
              Sleep Score
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {profile.sleepQuality || 'Good'}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white">{profile.sleepTime || '7h 20m'}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Optimal REM and Deep Sleep cycles
          </span>
        </div>

        {/* SpO2 & Body Temp */}
        <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Oxygen &amp; Temp
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
              Normal
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">SpO2 Oxygen:</span>
              <span className="text-xl font-black text-cyan-300">{profile.oxygenLevel || 98}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Skin Temp:</span>
              <span className="text-xl font-black text-slate-100">{profile.temperature || '98.4°F'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medical ID Vitals Summary linked to Form 2 */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Droplets className="w-4 h-4" />
            Medical ID Card Vitals (Form 2)
          </span>
          <span className="text-[10px] font-mono text-cyan-400 bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-800">
            Linked ID #{profile.idNo}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood</span>
            <span className="text-base font-black text-rose-400 mt-0.5 block">{profile.bloodGroup || 'O+'}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Height</span>
            <span className="text-sm font-black text-slate-200 mt-0.5 block">{profile.height || 'N/A'}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Weight</span>
            <span className="text-sm font-black text-slate-200 mt-0.5 block">{profile.weight || 'N/A'}</span>
          </div>
        </div>

        {profile.allergy && (
          <div className="p-2.5 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Allergies: <strong>{profile.allergy}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
