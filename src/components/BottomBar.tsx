import React, { useState, useEffect, useRef } from 'react';
import { Home, Map, BellRing, PhoneCall, UserCheck, Activity } from 'lucide-react';
import { alarmAudio } from '../utils/sound';

export type TabType = 'home' | 'map' | 'health' | 'contacts' | 'profile';

interface BottomBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onTriggerAlarm: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onTabChange,
  onTriggerAlarm,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleAlertTap = () => {
    alarmAudio.playBeep(700 + tapCount * 120, 0.08);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60 + tapCount * 25);
    }

    const nextCount = tapCount + 1;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    if (nextCount >= 5) {
      setTapCount(0);
      onTriggerAlarm();
    } else {
      setTapCount(nextCount);
      resetTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2800);
    }
  };

  const getTapHelperText = () => {
    if (tapCount === 0) return null;
    if (tapCount === 1) return 'Tap 4 more times!';
    if (tapCount === 2) return 'Tap 3 more times!';
    if (tapCount === 3) return 'Tap 2 more times!';
    if (tapCount === 4) return '🚨 1 MORE TAP TO SOUND SIREN!';
    return null;
  };

  return (
    <nav aria-label="Sakhi Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-blue-900/40 pb-safe">
      <div className="max-w-md mx-auto relative px-2 py-2 flex items-center justify-between">
        
        {/* Floating Tap Counter Badge */}
        {tapCount > 0 && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-lg border border-rose-400 animate-bounce flex items-center gap-1.5 whitespace-nowrap z-50">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {getTapHelperText()} ({tapCount}/5)
          </div>
        )}

        {/* Tab 1: Home Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition cursor-pointer ${
            activeTab === 'home'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Tab 2: Map / Live Location */}
        <button
          type="button"
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition cursor-pointer ${
            activeTab === 'map'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Map</span>
        </button>

        {/* Center: SOS Alert Bar Button (Tap 5 times) */}
        <div className="flex flex-col items-center justify-center px-1 -mt-6">
          <button
            type="button"
            onClick={handleAlertTap}
            className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
              tapCount > 0
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 ring-4 ring-rose-500/70 shadow-rose-600/60 scale-105'
                : 'bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 ring-4 ring-rose-500/30 shadow-lg shadow-rose-950/70'
            }`}
            title="Press 5 times to sound emergency siren"
          >
            {tapCount > 0 && (
              <div className="absolute inset-0 rounded-full border-2 border-white/80 animate-ping opacity-40 pointer-events-none" />
            )}

            <BellRing className={`w-7 h-7 text-white ${tapCount > 0 ? 'animate-bounce' : ''}`} />
            
            <span className="text-[9px] font-black tracking-widest text-white uppercase mt-0.5">
              {tapCount > 0 ? `${tapCount}/5` : 'SOS'}
            </span>
          </button>
          <span className="text-[9px] font-black text-rose-400 mt-1 uppercase tracking-tighter">
            5-Tap Siren
          </span>
        </div>

        {/* Tab 3: Emergency Contacts */}
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition cursor-pointer ${
            activeTab === 'contacts'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Contacts</span>
        </button>

        {/* Tab 4: Health Ring / Vitals */}
        <button
          type="button"
          onClick={() => onTabChange('health')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition cursor-pointer ${
            activeTab === 'health'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Health Ring</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition cursor-pointer ${
            activeTab === 'profile'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
