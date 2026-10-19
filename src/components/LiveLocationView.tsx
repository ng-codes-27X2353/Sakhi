import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Share2, Radio, Shield, 
  Copy, CheckCircle2, ExternalLink, Satellite 
} from 'lucide-react';
import { UserProfile } from '../types';

interface LiveLocationViewProps {
  profile: UserProfile;
}

export const LiveLocationView: React.FC<LiveLocationViewProps> = ({ profile }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Default initial mock or live fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setAccuracy(Math.round(pos.coords.accuracy || 5));
        },
        () => {
          // Default fallback coordinates (e.g. standard central coordinates as in reference mockup)
          setCoords({ lat: 23.2067, lng: 77.4567 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setCoords({ lat: 23.2067, lng: 77.4567 });
    }
  }, []);

  const handleRefresh = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(Math.round(pos.coords.accuracy || 4));
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const mapsUrl = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : '';

  const handleShare = () => {
    if (!coords) return;
    const text = `SAKHI EMERGENCY LOCATION: ${profile.fullName} (ID #${profile.idNo}) needs safety assistance. Live Coordinates: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E. Map: ${mapsUrl}`;
    if (navigator.share) {
      navigator.share({ title: 'Sakhi Live Location', text, url: mapsUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
            Satellite Telemetry &amp; GPS
          </span>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            Live Location
          </h2>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Locating...' : 'Refresh GPS'}</span>
        </button>
      </div>

      {/* Stylized Satellite Radar Map as in Image 2 */}
      <div className="relative rounded-3xl overflow-hidden bg-[#0c1424] border border-blue-900/50 shadow-2xl h-80 flex flex-col items-center justify-center p-4">
        {/* Background Grid Lines */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(56, 189, 248, 0.25) 1px, transparent 1px), linear-gradient(to right, rgba(30, 58, 138, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 58, 138, 0.3) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Concentric Radar Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-blue-500/20 animate-ping opacity-25 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full border border-cyan-400/30 pointer-events-none" />
        <div className="absolute w-36 h-36 rounded-full border border-blue-400/40 pointer-events-none" />

        {/* Center Satellite User Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-blue-600/30 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center shadow-inner">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <span className="mt-2 text-xs font-black text-cyan-200 bg-slate-900/90 border border-blue-800/80 px-2.5 py-0.5 rounded-full shadow">
            {profile.fullName} (You)
          </span>
        </div>

        {/* Floating live status badge */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md border border-blue-800/60 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-[11px]">Sakhi Satellite Tracking</span>
          <Satellite className="w-3.5 h-3.5 text-cyan-400 ml-0.5" />
        </div>

        {/* Floating accuracy pill */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-blue-800/60 px-2.5 py-1 rounded-full text-[10px] text-cyan-300 font-mono">
          Accuracy: ±{accuracy}m
        </div>

        {/* Bottom Coordinates Strip */}
        <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 backdrop-blur-md border border-blue-800/60 p-3 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              Current GPS Coordinates
            </span>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Acquiring GPS...'}
            </span>
          </div>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Location'}</span>
          </button>
        </div>
      </div>

      {/* External Map Action */}
      <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg flex items-center justify-between">
        <div>
          <div className="text-xs font-black text-white">Full Satellite Navigation</div>
          <div className="text-[11px] text-slate-400">Open in external Google Maps application</div>
        </div>

        {coords && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
          >
            <span>Open Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
