import React from 'react';
import { 
  Bell, Shield, PhoneCall, Users, CheckCircle2, 
  Clock, X, AlertTriangle, Radio 
} from 'lucide-react';
import { UserProfile } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Sakhi Safety Active',
      desc: `Profile ID #${profile.idNo} (${profile.fullName}) is protected. Emergency SOS gesture enabled on Sakhi Ring.`,
      time: 'Just now',
      type: 'system',
      icon: Shield,
      color: 'text-cyan-400 bg-cyan-500/20',
    },
    {
      id: 'n2',
      title: 'Emergency Responders Linked',
      desc: 'Police (100) and Ambulance (102) configured with your live satellite location sharing.',
      time: '10 mins ago',
      type: 'responders',
      icon: PhoneCall,
      color: 'text-rose-400 bg-rose-500/20',
    },
    {
      id: 'n3',
      title: 'Ring Battery & Vitals Synced',
      desc: `Sakhi Ring battery at ${profile.ringBattery || 82}%. Heart rate sensor calibrated at ${profile.heartRate || 72} bpm.`,
      time: '1 hour ago',
      type: 'health',
      icon: Radio,
      color: 'text-emerald-400 bg-emerald-500/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white">
      <div className="w-full max-w-sm bg-[#0f172a] border border-blue-900/60 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-black text-white">Sakhi Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3.5 rounded-2xl bg-[#131c2e] border border-blue-900/30 flex items-start gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{n.title}</span>
                  <span className="text-[10px] text-slate-500">{n.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
