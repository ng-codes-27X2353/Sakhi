import React, { useState } from 'react';
import { 
  User, Calendar, Mail, Phone, Lock, HeartPulse, 
  Ruler, Weight, AlertCircle, ArrowRight, CheckCircle2, 
  Sparkles, ExternalLink, ShieldCheck, Loader2, Hash
} from 'lucide-react';
import { UserProfile, EmergencyContact } from '../types';
import { submitForm1, submitForm2, upsertProfile, getNextIdNo, FORM_1_SHARE_URL, FORM_2_SHARE_URL } from '../utils/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialProfile,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Unique Id no. start from 1, linking both forms
  const [idNo] = useState<number>(() => {
    if (initialProfile?.idNo) return initialProfile.idNo;
    return getNextIdNo();
  });

  // Step 1: Details (Form 1)
  const [fullName, setFullName] = useState(initialProfile?.fullName || '');
  const [dob, setDob] = useState(initialProfile?.dob || '');
  const [email, setEmail] = useState(initialProfile?.email || '');
  const [mobile, setMobile] = useState(initialProfile?.mobile || '');
  const [pin, setPin] = useState(initialProfile?.pin || '');

  // Step 2: Basic Medical Details (Form 2 - Optional)
  const [bloodGroup, setBloodGroup] = useState(initialProfile?.bloodGroup || '');
  const [height, setHeight] = useState(initialProfile?.height || '');
  const [weight, setWeight] = useState(initialProfile?.weight || '');
  const [allergy, setAllergy] = useState(initialProfile?.allergy || '');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form1Status, setForm1Status] = useState<string | null>(null);
  const [form2Status, setForm2Status] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFillDemoAkarsh = () => {
    setFullName('Akarsh');
    setDob('2002-05-14');
    setEmail('akarsh.sakhi@gmail.com');
    setMobile('+91 98765 43210');
    setPin('1234');
    setBloodGroup('O+');
    setHeight('178 cm');
    setWeight('72 kg');
    setAllergy('Penicillin, Dust');
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!dob) {
      setErrorMessage('Please enter your date of birth');
      return;
    }
    if (!pin.trim()) {
      setErrorMessage('Please set a security PIN (used to disarm emergency alarms)');
      return;
    }

    setIsSubmitting(true);
    setForm1Status(`Submitting ID #${idNo} to Google Form 1...`);

    const result = await submitForm1({
      idNo,
      fullName: fullName.trim(),
      dob,
      email: email.trim(),
      mobile: mobile.trim(),
      pin: pin.trim(),
    });

    setIsSubmitting(false);
    if (result.success) {
      setForm1Status(`Recorded in Google Form 1 with ID #${idNo} ✓`);
    } else {
      setForm1Status(`Saved with ID #${idNo} (sync backup active)`);
    }

    // Move to step 2 (Medical Vitals)
    setStep(2);
  };

  const handleStep2Submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setForm2Status(`Submitting linked ID #${idNo} to Google Form 2...`);

    const result = await submitForm2({
      idNo,
      bloodGroup: bloodGroup.trim(),
      height: height.trim(),
      weight: weight.trim(),
      allergy: allergy.trim(),
    });

    if (result.success) {
      setForm2Status(`Recorded in Google Form 2 with ID #${idNo} ✓`);
    }

    // Default emergency contacts as shown in Sakhi reference design
    const defaultContacts: EmergencyContact[] = initialProfile?.emergencyContacts || [
      { id: 'c1', name: 'Police Helpline', relation: 'Emergency Service', phone: '100' },
      { id: 'c2', name: 'Ambulance Response', relation: 'Medical Service', phone: '102' },
      { id: 'c3', name: 'Family / ICE Contact', relation: 'Primary Family', phone: mobile || '+91 98765 43210' },
    ];

    const now = new Date().toISOString();
    const finalProfile: UserProfile = {
      id: initialProfile?.id || `user_${Date.now()}`,
      idNo,
      fullName: fullName.trim(),
      dob,
      email: email.trim(),
      mobile: mobile.trim(),
      pin: pin.trim(),
      bloodGroup: bloodGroup.trim() || 'O+',
      height: height.trim() || undefined,
      weight: weight.trim() || undefined,
      allergy: allergy.trim() || undefined,
      emergencyContacts: defaultContacts,
      ringConnected: true,
      ringBattery: 82,
      heartRate: 72,
      steps: 5842,
      stepsGoal: 10000,
      sleepTime: '7h 20m',
      sleepQuality: 'Good',
      temperature: '98.4°F',
      oxygenLevel: 98,
      createdAt: initialProfile?.createdAt || now,
      updatedAt: now,
      form1Submitted: true,
      form2Submitted: true,
    };

    upsertProfile(finalProfile);
    setIsSubmitting(false);
    onComplete(finalProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-blue-900/50 rounded-3xl shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Bluish Sakhi Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 border-b border-blue-800/40 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/sakhi-logo.png"
                alt="Sakhi Logo"
                className="w-8 h-8 rounded-xl object-contain shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/40 text-xs font-black text-cyan-300">
                {step}/2
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-cyan-300">
                {step === 1 ? 'Sakhi Registration' : 'Basic Medical Details'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-blue-600/40 border border-blue-400/30 text-cyan-300 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Hash className="w-3 h-3" />
                ID #{idNo}
              </span>

              {step === 1 && (
                <button
                  type="button"
                  onClick={handleFillDemoAkarsh}
                  className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer"
                  title="Fill with previous demo data"
                >
                  <Sparkles className="w-3 h-3 text-rose-300" />
                  Demo
                </button>
              )}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {step === 1 ? 'Welcome to Sakhi' : 'Medical Vitals & Health Ring'}
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            {step === 1 
              ? `Unique ID #${idNo} assigned. Synced with Google Form #1.` 
              : `Optional vitals linked with same ID #${idNo}. Synced with Google Form #2.`}
          </p>

          {/* Connected Google Forms Badges */}
          <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
            <a
              href={FORM_1_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-lg text-blue-200 font-mono border border-blue-800/60"
            >
              <span>Form 1 (Details)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href={FORM_2_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-lg text-blue-200 font-mono border border-blue-800/60"
            >
              <span>Form 2 (Vitals)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 text-slate-100">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Details Form */
            <form onSubmit={handleStep1Submit} className="space-y-4">
              
              {/* Unique ID Info Banner */}
              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  Your Unique ID Number:
                </span>
                <span className="font-mono font-black text-cyan-300 bg-blue-900/60 px-2.5 py-0.5 rounded-lg border border-blue-700/60">
                  #{idNo}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Akarsh, Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    DOB (Date of Birth) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Security PIN (4 digits) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="e.g. 1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono tracking-widest focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Required to turn off the 5-tap emergency siren
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  E-mail Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Form 1...
                    </>
                  ) : (
                    <>
                      Next: Medical Details
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: Basic Medical Details (Optional) */
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40 text-xs text-blue-200">
                <span className="font-semibold text-cyan-400">Linked to ID #{idNo}:</span> All fields below are optional. You can fill any or none and press Next. Stored in Google Form #2.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Blood Group (Optional)
                </label>
                
                {/* Blood group quick pills */}
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition ${
                        bloodGroup === bg
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Or enter custom blood group..."
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-cyan-400" />
                    Height (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 165 cm or 5'5&quot;"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5 text-cyan-400" />
                    Weight (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 58 kg or 128 lbs"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Latex, None"
                  value={allergy}
                  onChange={(e) => setAllergy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Form 2...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Finish &amp; Open Sakhi
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Live sync indicators */}
          {(form1Status || form2Status) && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Form 1: {form1Status || 'Ready'}
              </span>
              {form2Status && (
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Form 2: {form2Status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
