import React, { useState } from 'react';
import { 
  HeartPulse, Ruler, Weight, AlertTriangle, 
  Droplet, Activity, Edit3, CheckCircle2, 
  ExternalLink, Sparkles, Loader2 
} from 'lucide-react';
import { UserProfile } from '../types';
import { submitForm2, upsertProfile } from '../utils/api';

interface VitalsViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const VitalsView: React.FC<VitalsViewProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup || 'O+');
  const [height, setHeight] = useState(profile.height || '');
  const [weight, setWeight] = useState(profile.weight || '');
  const [allergy, setAllergy] = useState(profile.allergy || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Compute BMI if numbers can be parsed
  const computeBMI = (): { bmi: number; category: string; color: string } | null => {
    if (!profile.height || !profile.weight) return null;
    const heightMatch = profile.height.match(/(\d+(\.\d+)?)/);
    const weightMatch = profile.weight.match(/(\d+(\.\d+)?)/);
    if (!heightMatch || !weightMatch) return null;

    let heightVal = parseFloat(heightMatch[1]);
    let weightVal = parseFloat(weightMatch[1]);

    // If height is in inches or cm:
    if (heightVal < 3) {
      // likely meters, e.g. 1.75
    } else if (heightVal > 30 && heightVal < 100) {
      // likely inches, convert to cm
      heightVal = heightVal * 2.54;
      heightVal = heightVal / 100;
    } else if (heightVal >= 100) {
      // cm to meters
      heightVal = heightVal / 100;
    }

    // If weight in lbs
    if (profile.weight.toLowerCase().includes('lb')) {
      weightVal = weightVal * 0.453592;
    }

    if (heightVal <= 0 || weightVal <= 0) return null;
    const bmi = weightVal / (heightVal * heightVal);
    const rounded = Math.round(bmi * 10) / 10;

    if (rounded < 18.5) return { bmi: rounded, category: 'Underweight', color: 'text-amber-400' };
    if (rounded <= 24.9) return { bmi: rounded, category: 'Healthy Weight', color: 'text-emerald-400' };
    if (rounded <= 29.9) return { bmi: rounded, category: 'Overweight', color: 'text-yellow-400' };
    return { bmi: rounded, category: 'High BMI', color: 'text-rose-400' };
  };

  const bmiData = computeBMI();

  // Blood group compatibility chart
  const getCompatibility = (bg: string) => {
    const clean = bg.toUpperCase().trim();
    switch (clean) {
      case 'O-':
        return { canGive: 'Everyone (Universal Donor)', canReceive: 'O-' };
      case 'O+':
        return { canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-' };
      case 'A-':
        return { canGive: 'A+, A-, AB+, AB-', canReceive: 'A-, O-' };
      case 'A+':
        return { canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-' };
      case 'B-':
        return { canGive: 'B+, B-, AB+, AB-', canReceive: 'B-, O-' };
      case 'B+':
        return { canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-' };
      case 'AB-':
        return { canGive: 'AB+, AB-', canReceive: 'AB-, A-, B-, O-' };
      case 'AB+':
        return { canGive: 'AB+ only', canReceive: 'Everyone (Universal Recipient)' };
      default:
        return { canGive: 'All compatible types', canReceive: 'Type-matched blood' };
    }
  };

  const compatibility = getCompatibility(profile.bloodGroup || 'O+');

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSyncStatus('Syncing with Google Form #2...');

    const res = await submitForm2({
      idNo: profile.idNo || 1,
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
    setIsEditing(false);
    setSyncStatus(res.success ? 'Synced with Google Form ✓' : 'Updated locally');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  return (
    <div className="space-y-4 text-white">
      {/* Vitals Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">Health Vitals &amp; Metrics</h2>
          <p className="text-xs text-neutral-400">
            Backed by Google Form #2 (Basic Details)
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-rose-400" />
          <span>{isEditing ? 'Cancel' : 'Edit Vitals'}</span>
        </button>
      </div>

      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Editing Modal/Form */}
      {isEditing && (
        <form onSubmit={handleSaveVitals} className="p-4 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Edit &amp; Re-submit to Google Form 2
            </span>
            <a
              href="https://forms.gle/YLhgEhUZ3QQbA4EK8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <span>View Form</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
              Blood Group
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-1.5">
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  className={`py-1 rounded text-xs font-bold transition ${
                    bloodGroup === bg ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-300'
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
              className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white"
              placeholder="Or enter blood group"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Height
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white"
                placeholder="e.g. 175 cm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                Weight
              </label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white"
                placeholder="e.g. 70 kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
              Allergies
            </label>
            <input
              type="text"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white"
              placeholder="e.g. Penicillin, Peanuts, None"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating Form 2...
                </>
              ) : (
                'Save & Sync Form 2'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Primary Blood Group Card */}
      <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Droplet className="w-4 h-4 fill-red-500" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-red-400">
                Blood Group Transfusion Match
              </div>
              <div className="text-lg font-black text-white">{profile.bloodGroup || 'O+'}</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase">
            Emergency Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
            <span className="text-[10px] text-neutral-400 block font-semibold">Can Donate To:</span>
            <span className="text-neutral-200 font-bold mt-0.5 block">{compatibility.canGive}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
            <span className="text-[10px] text-neutral-400 block font-semibold">Can Receive From:</span>
            <span className="text-neutral-200 font-bold mt-0.5 block">{compatibility.canReceive}</span>
          </div>
        </div>
      </div>

      {/* Body Metrics & BMI */}
      <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Body Metrics &amp; Body Mass Index
          </span>
          {bmiData && (
            <span className={`text-xs font-bold ${bmiData.color}`}>
              BMI: {bmiData.bmi} ({bmiData.category})
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
            <span className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-rose-400" />
              Recorded Height
            </span>
            <div className="text-base font-black text-white mt-1">
              {profile.height || 'N/A'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
            <span className="text-[10px] text-neutral-400 font-bold uppercase flex items-center gap-1">
              <Weight className="w-3.5 h-3.5 text-rose-400" />
              Recorded Weight
            </span>
            <div className="text-base font-black text-white mt-1">
              {profile.weight || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Allergies section */}
      <div className="p-4 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-lg">
        <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4 h-4" />
          Critical Allergies &amp; Drug Sensitivities
        </span>
        <p className="text-xs text-neutral-300">
          {profile.allergy && profile.allergy.trim() && profile.allergy.toLowerCase() !== 'none'
            ? profile.allergy
            : 'No known allergies recorded. Keep this updated to ensure safe paramedic treatment.'}
        </p>
      </div>

      {/* Google Form Link footer */}
      <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Form 2 URL: https://forms.gle/YLhgEhUZ3QQbA4EK8</span>
        <a
          href="https://forms.gle/YLhgEhUZ3QQbA4EK8"
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
        >
          Open Form
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
