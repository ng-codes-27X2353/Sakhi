import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Volume2, VolumeX, AlertTriangle, 
  KeyRound, Delete, CheckCircle2, Radio, Send, 
  Shield, PhoneCall, Users, Satellite 
} from 'lucide-react';
import { alarmAudio } from '../utils/sound';

interface AlarmModalProps {
  isOpen: boolean;
  userPin: string;
  userName: string;
  idNo: number;
  onDisarm: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  userPin,
  userName,
  idNo,
  onDisarm,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [soundProfile, setSoundProfile] = useState<'siren' | 'police' | 'pulse'>('siren');
  const [soundMuted, setSoundMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPinInput('');
      setErrorMsg('');
      setElapsedSeconds(0);
      alarmAudio.stopSiren();
      return;
    }

    // Start loud emergency siren
    if (!soundMuted) {
      alarmAudio.playSiren(soundProfile);
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      alarmAudio.stopSiren();
    };
  }, [isOpen, soundProfile, soundMuted]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    alarmAudio.playBeep(650, 0.08);
    setErrorMsg('');
    if (pinInput.length < 8) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      if (nextPin === userPin) {
        handleSuccess();
      }
    }
  };

  const handleDelete = () => {
    alarmAudio.playBeep(450, 0.06);
    setErrorMsg('');
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    alarmAudio.playBeep(350, 0.06);
    setErrorMsg('');
    setPinInput('');
  };

  const handleSuccess = () => {
    alarmAudio.stopSiren();
    alarmAudio.playDisarmSuccess();
    onDisarm();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === userPin) {
      handleSuccess();
    } else {
      alarmAudio.playError();
      setErrorMsg('Incorrect PIN! Siren continues.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPinInput('');
    }
  };

  const toggleMute = () => {
    if (soundMuted) {
      setSoundMuted(false);
      alarmAudio.playSiren(soundProfile);
    } else {
      setSoundMuted(true);
      alarmAudio.stopSiren();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in">
      {/* Emergency flashing strobe border */}
      <div className="absolute inset-0 pointer-events-none border-8 border-rose-600/70 animate-pulse" />

      <div className="relative w-full max-w-md bg-[#0f172a] border-2 border-rose-500/70 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-white">
        
        {/* Urgent Header Banner matching Image 2 */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-900 px-5 py-4 text-center shadow-lg relative">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase bg-black/40 px-2.5 py-1 rounded-full text-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
              EMERGENCY ALERT SENT
            </span>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition text-xs flex items-center gap-1 cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-yellow-300" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              <span className="text-[10px] font-bold">{soundMuted ? 'MUTED' : 'SIREN'}</span>
            </button>
          </div>

          {/* Large Glowing Red/Coral SOS Button as in Image 2 */}
          <div className="my-2 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-rose-600/60 ring-8 ring-rose-500/30 animate-pulse">
              <span className="text-2xl font-black tracking-widest text-white drop-shadow">
                SOS
              </span>
            </div>
            <span className="text-xs font-bold text-rose-100 mt-2">
              Active: <span className="font-mono text-white font-black">{elapsedSeconds}s</span> • User: <span className="font-semibold text-white">{userName}</span> (ID #{idNo})
            </span>
          </div>

          {/* Responders notified badge */}
          <div className="mt-2 py-1.5 px-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-around text-[10px] text-rose-100">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-300" /> Police (100)
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-rose-300" /> Ambulance (102)
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-300" /> Family
            </span>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Siren Frequency:</span>
          <div className="flex gap-1.5">
            {(['siren', 'police', 'pulse'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setSoundProfile(mode);
                  if (!soundMuted) {
                    alarmAudio.stopSiren();
                    setTimeout(() => alarmAudio.playSiren(mode), 50);
                  }
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                  soundProfile === mode
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* PIN Entry Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <KeyRound className="w-4 h-4" />
              Enter PIN to Cancel Alert
            </div>
            <p className="text-[11px] text-slate-400">
              Enter the security PIN set during registration to silence the alarm
            </p>

            {/* PIN display dots */}
            <div
              className={`mt-2.5 inline-flex items-center justify-center gap-2.5 px-6 py-2 rounded-2xl bg-slate-950 border ${
                errorMsg ? 'border-rose-500' : 'border-slate-800'
              } ${isShaking ? 'animate-shake' : ''}`}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < pinInput.length;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                      isFilled
                        ? 'bg-rose-500 scale-125 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  />
                );
              })}
              {pinInput.length > 4 && (
                <span className="text-xs font-mono text-rose-400 ml-1">+{pinInput.length - 4}</span>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-semibold mt-2 animate-shake">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto w-full my-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                className="h-11 sm:h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-rose-950 active:scale-95 text-white font-mono text-xl font-bold shadow-md border border-slate-700/60 transition flex items-center justify-center cursor-pointer select-none"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="h-11 sm:h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 text-xs font-bold uppercase transition flex items-center justify-center cursor-pointer active:scale-95"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-11 sm:h-12 rounded-2xl bg-slate-800/90 hover:bg-slate-700 active:bg-rose-950 active:scale-95 text-white font-mono text-xl font-bold shadow-md border border-slate-700/60 transition flex items-center justify-center cursor-pointer select-none"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="h-11 sm:h-12 rounded-2xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition flex items-center justify-center cursor-pointer active:scale-95"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Confirm Button */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={pinInput.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wide shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              CONFIRM PIN &amp; SILENCE ALARM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
