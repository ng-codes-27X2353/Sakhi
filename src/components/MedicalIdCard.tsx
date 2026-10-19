import React, { useState, useEffect } from 'react';
import { 
  Heart, ShieldAlert, Phone, QrCode, AlertTriangle, 
  Calendar, Ruler, Weight, Droplets, CheckCircle, Copy, Hash, Activity 
} from 'lucide-react';
import QRCode from 'qrcode';
import { UserProfile } from '../types';

interface MedicalIdCardProps {
  profile: UserProfile;
  onEditVitals: () => void;
  onTriggerAlarmDirect: () => void;
}

export const MedicalIdCard: React.FC<MedicalIdCardProps> = ({
  profile,
  onEditVitals,
  onTriggerAlarmDirect,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.dob);

  useEffect(() => {
    const emergencyPayload = `--- SAKHI EMERGENCY MEDICAL ID ---
ID Number: #${profile.idNo}
Name: ${profile.fullName}
DOB: ${profile.dob} (${age ?? 'N/A'} yrs)
Blood Group: ${profile.bloodGroup || 'O+'}
Height: ${profile.height || 'N/A'}
Weight: ${profile.weight || 'N/A'}
Allergies: ${profile.allergy || 'None reported'}
Mobile: ${profile.mobile || 'N/A'}
Police: 100 | Ambulance: 102
PIN Protected Sakhi Safety Profile`;

    QRCode.toDataURL(emergencyPayload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [profile, age]);

  const handleCopyCard = () => {
    const text = `SAKHI EMERGENCY MEDICAL CARD
ID Number: #${profile.idNo}
Name: ${profile.fullName}
DOB: ${profile.dob} (${age} yrs)
Blood Group: ${profile.bloodGroup || 'O+'}
Height: ${profile.height || 'N/A'} | Weight: ${profile.weight || 'N/A'}
Allergies: ${profile.allergy || 'None'}
Phone: ${profile.mobile || 'N/A'}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Sakhi Medical ID Card Container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#131c2e] via-[#0f172a] to-[#0a0f1d] border-2 border-blue-800/60 shadow-2xl p-5 text-white">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="/sakhi-logo.png"
              alt="Sakhi"
              className="w-9 h-9 rounded-xl object-contain shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase block">
                Sakhi Universal Medical ID
              </span>
              <h3 className="text-base font-black text-white leading-tight">
                Emergency Information
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-lg bg-blue-950 border border-blue-800 text-cyan-300 font-mono font-black text-xs flex items-center gap-0.5">
              <Hash className="w-3 h-3 text-cyan-400" />
              {profile.idNo}
            </span>
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Show Emergency QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyCard}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Copy Medical Card Info"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Identification */}
        <div className="py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400 font-medium">Full Name</div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
              {profile.fullName || 'Unnamed'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {profile.dob || 'DOB Not set'}
              </span>
              {age !== null && (
                <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[11px] font-bold text-cyan-300">
                  {age} yrs
                </span>
              )}
            </div>
          </div>

          {/* Blood Group Badge */}
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-bold uppercase text-rose-300 tracking-wider mb-1 flex items-center gap-0.5">
              <Droplets className="w-3 h-3 text-rose-400 fill-rose-400" />
              Blood Group
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-700 to-pink-600 border border-rose-400/50 flex flex-col items-center justify-center shadow-lg shadow-rose-950/60">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                {profile.bloodGroup || 'O+'}
              </span>
              <span className="text-[9px] font-bold text-rose-100 uppercase mt-0.5">
                VITAL
              </span>
            </div>
          </div>
        </div>

        {/* Vitals Grid: Height, Weight & Contact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-2">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Ruler className="w-3 h-3 text-cyan-400" />
              Height
            </span>
            <div className="text-sm font-bold text-white mt-1">
              {profile.height || 'Not recorded'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Weight className="w-3 h-3 text-cyan-400" />
              Weight
            </span>
            <div className="text-sm font-bold text-white mt-1">
              {profile.weight || 'Not recorded'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              Primary Mobile
            </span>
            <div className="text-sm font-bold text-white mt-1 font-mono truncate">
              {profile.mobile || 'None'}
            </div>
          </div>
        </div>

        {/* Allergies & Critical Alerts */}
        <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Allergies &amp; Medical Warnings
            </span>
            <button
              onClick={onEditVitals}
              className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
            >
              Update
            </button>
          </div>

          {profile.allergy && profile.allergy.trim() && profile.allergy.toLowerCase() !== 'none' ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.allergy.split(',').map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold"
                >
                  ⚠️ {item.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No known allergies or alerts specified.
            </p>
          )}
        </div>

        {/* Bottom card quick actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Security PIN: <span className="font-mono text-slate-200 font-bold">••••</span> (Used for Disarm)
          </span>

          <button
            onClick={onEditVitals}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            Edit Medical Vitals →
          </button>
        </div>
      </div>

      {/* QR Code Modal for Paramedics */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#0f172a] border border-blue-900/60 rounded-3xl p-6 text-center text-white shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-600/20 text-rose-500 mx-auto flex items-center justify-center mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black">Emergency Medical QR</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Paramedics or first responders can scan this code with any phone camera to access vital health info offline.
            </p>

            {qrCodeDataUrl ? (
              <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
                <img
                  src={qrCodeDataUrl}
                  alt="Emergency QR Code"
                  className="w-56 h-56 mx-auto rounded-lg"
                />
              </div>
            ) : (
              <div className="w-56 h-56 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                Generating QR...
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
