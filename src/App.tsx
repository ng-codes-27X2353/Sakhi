import React, { useState, useEffect } from 'react';
import { 
  Heart, ShieldAlert, Smartphone, Monitor, UserPlus, 
  Settings, CheckCircle2, AlertTriangle, Sparkles, Satellite 
} from 'lucide-react';
import { UserProfile } from './types';
import { getActiveProfile, getSavedProfiles, upsertProfile, getNextIdNo } from './utils/api';
import { OnboardingModal } from './components/OnboardingModal';
import { AlarmModal } from './components/AlarmModal';
import { BottomBar, TabType } from './components/BottomBar';
import { HomeDashboard } from './components/HomeDashboard';
import { LiveLocationView } from './components/LiveLocationView';
import { EmergencyContactsView } from './components/EmergencyContactsView';
import { HealthRingView } from './components/HealthRingView';
import { MedicalIdCard } from './components/MedicalIdCard';
import { ProfileSwitcherView } from './components/ProfileSwitcherView';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive'>('mobile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or load profile
  useEffect(() => {
    const existing = getActiveProfile();
    if (existing) {
      // Ensure idNo is set
      if (!existing.idNo) {
        existing.idNo = 1;
        upsertProfile(existing);
      }
      setProfile(existing);
    } else {
      // First open: open onboarding modal so user can fill Form 1 & Form 2
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowOnboarding(false);
    showToast(`Welcome ${newProfile.fullName}! Sakhi Safety ID #${newProfile.idNo} Active.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerAlarm = () => {
    setShowAlarm(true);
  };

  const handleDisarmAlarm = () => {
    setShowAlarm(false);
    showToast('Alarm Successfully Disarmed With Security PIN ✓');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-rose-500 selection:text-white">
      
      {/* Sakhi Top Minimalist Header (No bulky upper bar) */}
      <header className="w-full max-w-md mx-auto pt-3 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <img
            src="/sakhi-logo.png"
            alt="Sakhi Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-md shadow-blue-950/80 ring-1 ring-blue-500/30"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">
                Sakhi
              </span>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">
                सखी
              </span>
              {profile && (
                <span className="text-[10px] font-mono text-cyan-300 bg-blue-950/90 border border-blue-800 px-1.5 py-0.2 rounded">
                  ID #{profile.idNo}
                </span>
              )}
            </div>
            <span className="text-[9px] text-slate-400 block -mt-0.5">
              Always with you
            </span>
          </div>
        </div>

        {/* View mode toggle (Mobile Shell vs Full Web Layout) */}
        <div className="flex items-center gap-1 bg-[#131c2e] border border-blue-900/50 rounded-full p-1 shadow-inner">
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-full transition flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile App Frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline pr-1">Mobile</span>
          </button>

          <button
            onClick={() => setViewMode('responsive')}
            className={`p-1.5 rounded-full transition flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
              viewMode === 'responsive'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Full Web Layout"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline pr-1">Web</span>
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main
        className={`w-full transition-all duration-300 pb-28 ${
          viewMode === 'mobile'
            ? 'max-w-md my-2 px-3 sm:px-4'
            : 'max-w-2xl my-4 px-4'
        }`}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-3 p-3 rounded-2xl bg-[#131c2e] border border-blue-800 shadow-xl flex items-center gap-2 text-xs text-white animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        {profile ? (
          <div>
            {activeTab === 'home' && (
              <HomeDashboard
                profile={profile}
                onNavigateTab={(t) => setActiveTab(t)}
                onTriggerAlarm={handleTriggerAlarm}
                onOpenNotifications={() => setShowNotifications(true)}
              />
            )}

            {activeTab === 'map' && (
              <LiveLocationView profile={profile} />
            )}

            {activeTab === 'contacts' && (
              <EmergencyContactsView
                profile={profile}
                onProfileUpdated={(up) => {
                  setProfile(up);
                  showToast('Emergency Contacts Updated');
                }}
              />
            )}

            {activeTab === 'health' && (
              <HealthRingView
                profile={profile}
                onProfileUpdated={(up) => {
                  setProfile(up);
                  showToast('Health Vitals Synced with Google Form #2');
                }}
              />
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <MedicalIdCard
                  profile={profile}
                  onEditVitals={() => setActiveTab('health')}
                  onTriggerAlarmDirect={handleTriggerAlarm}
                />
                <ProfileSwitcherView
                  currentProfile={profile}
                  onSelectProfile={(p) => {
                    setProfile(p);
                    showToast(`Switched to ${p.fullName} (ID #${p.idNo})`);
                  }}
                  onAddNewUser={() => {
                    setIsAddingNew(true);
                    setShowOnboarding(true);
                  }}
                  onTriggerAlarmTest={handleTriggerAlarm}
                />
              </div>
            )}
          </div>
        ) : (
          /* Empty / Welcome State */
          <div className="p-8 text-center space-y-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 mt-6 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-cyan-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <h2 className="text-xl font-black">Sakhi - Always with you</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Universal Women&apos;s Safety &amp; Smart Health Ring System. Register your profile to link with Google Forms and activate the 5-tap emergency siren.
            </p>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setShowOnboarding(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Start Registration (Form 1 &amp; 2)
            </button>
          </div>
        )}
      </main>

      {/* Persistent Bottom Bar with 5-Tap Alert Trigger */}
      <BottomBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onTriggerAlarm={handleTriggerAlarm}
      />

      {/* 5-Tap Emergency Alarm Modal with PIN Disarm */}
      <AlarmModal
        isOpen={showAlarm}
        userPin={profile?.pin || '1234'}
        userName={profile?.fullName || 'User'}
        idNo={profile?.idNo || 1}
        onDisarm={handleDisarmAlarm}
      />

      {/* 2-Step Onboarding Modal with unique Id no. */}
      <OnboardingModal
        key={isAddingNew ? `new_${Date.now()}` : `edit_${profile?.id || 'none'}`}
        isOpen={showOnboarding}
        onComplete={(p) => {
          setIsAddingNew(false);
          handleOnboardingComplete(p);
        }}
        initialProfile={isAddingNew ? null : profile}
        onClose={() => {
          setIsAddingNew(false);
          if (profile) setShowOnboarding(false);
        }}
      />

      {/* Notifications Drawer */}
      {profile && (
        <NotificationsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
