import React from 'react';
import { 
  Heart, ShieldAlert, MapPin, Activity, Settings, 
  HelpCircle, Battery, Bluetooth, Users, Radio, 
  CreditCard, Bell, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { UserProfile } from '../types';
import { TabType } from './BottomBar';

interface HomeDashboardProps {
  profile: UserProfile;
  onNavigateTab: (tab: TabType) => void;
  onTriggerAlarm: () => void;
  onOpenNotifications: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  onNavigateTab,
  onTriggerAlarm,
  onOpenNotifications,
}) => {
  return (
    <div className="space-y-4 text-white">
      {/* Top Greeting & Ring Status Banner as in Image 2 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-950/50">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-base text-rose-300">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="text-base font-black text-white leading-tight flex items-center gap-1.5">
              Hello, {profile.fullName}
              <span className="text-[10px] font-mono text-cyan-300 bg-blue-950/80 border border-blue-800 px-1.5 py-0.2 rounded">
                #{profile.idNo}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Stay safe, stay prepared.</div>
          </div>
        </div>

        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-2xl bg-slate-900 border border-blue-900/40 hover:border-blue-700 text-slate-200 transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-cyan-300" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
        </button>
      </div>

      {/* Sakhi Ring Connection Pill */}
      <div className="p-3.5 rounded-2xl bg-[#131c2e] border border-blue-900/40 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Bluetooth className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Sakhi Health Ring</div>
            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected &amp; Synced
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <Battery className="w-3.5 h-3.5 text-cyan-400" />
            {profile.ringBattery || 82}%
          </span>
          <button
            onClick={() => onNavigateTab('health')}
            className="text-xs text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center SOS Emergency Trigger Card as in Image 2 */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#131c2e] via-[#0f172a] to-[#0a0f1d] border-2 border-rose-500/40 p-6 flex flex-col items-center text-center shadow-2xl">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
        
        {/* Pulsing Concentric Emergency Circles */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-rose-600/10 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute w-36 h-36 rounded-full border border-rose-500/30 animate-pulse pointer-events-none" />

          {/* SOS Button */}
          <button
            onClick={onTriggerAlarm}
            className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-pink-500 hover:from-red-500 hover:to-rose-400 active:scale-95 transition-all duration-150 shadow-2xl shadow-rose-600/70 ring-4 ring-rose-400/50 flex flex-col items-center justify-center cursor-pointer group"
          >
            <span className="text-3xl font-black tracking-widest text-white drop-shadow-md group-hover:scale-110 transition-transform">
              SOS
            </span>
          </button>
        </div>

        <h3 className="text-sm font-bold text-slate-200 mt-2">
          Tap in emergency or press 5 times below
        </h3>
        <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
          Broadcasts satellite location to Police (100), Ambulance (102) &amp; Family
        </p>
      </div>

      {/* Quick Action Tiles (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Tile 1: Live Location */}
        <button
          onClick={() => onNavigateTab('map')}
          className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/30 hover:border-blue-600/50 transition flex flex-col items-start text-left shadow-lg cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-white group-hover:text-cyan-400 transition">
            Live Location
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            GPS Radar &amp; Share
          </span>
        </button>

        {/* Tile 2: Health & Ring */}
        <button
          onClick={() => onNavigateTab('health')}
          className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/30 hover:border-rose-500/50 transition flex flex-col items-start text-left shadow-lg cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-white group-hover:text-rose-400 transition">
            Health &amp; Fitness
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {profile.heartRate || 72} bpm • {profile.steps || 5842} steps
          </span>
        </button>

        {/* Tile 3: Emergency Contacts */}
        <button
          onClick={() => onNavigateTab('contacts')}
          className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/30 hover:border-indigo-500/50 transition flex flex-col items-start text-left shadow-lg cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-white group-hover:text-indigo-400 transition">
            SOS Contacts
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Police, 102 &amp; Family
          </span>
        </button>

        {/* Tile 4: Medical ID & Profile */}
        <button
          onClick={() => onNavigateTab('profile')}
          className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/30 hover:border-emerald-500/50 transition flex flex-col items-start text-left shadow-lg cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-white group-hover:text-emerald-400 transition">
            Medical ID Card
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Blood: {profile.bloodGroup || 'O+'} • ID #{profile.idNo}
          </span>
        </button>
      </div>

      {/* Emergency Flow Guide as shown in Image 2 footer */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-2">
          Emergency Response Flow
        </span>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-rose-400 block">1. Press SOS</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Ring or 5-Tap</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 block">2. GPS Fetch</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Live Coordinates</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] font-bold text-emerald-400 block">3. Help Arrives</span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">100 &amp; 102 Dispatched</span>
          </div>
        </div>
      </div>
    </div>
  );
};
