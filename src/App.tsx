import React, { useState, useEffect } from 'react';
import { 
  Heart, ShieldAlert, Smartphone, Monitor, UserPlus, 
  Settings, CheckCircle2, AlertTriangle, Sparkles, Satellite, 
  Archive, LogOut 
} from 'lucide-react';
import { UserProfile } from './types';
import { 
  getActiveProfile, getSavedProfiles, upsertProfile, 
  generateUniqueRandomId, dispatchServerAlert, setActiveProfileId, 
  getAdminSessionAuth 
} from './utils/api';
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
import { ServerPortalView } from './components/ServerPortalView';
import { BeginningLoginView } from './components/BeginningLoginView';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'responsive' | 'server'>('mobile');
  const [serverInitialTab, setServerInitialTab] = useState<'directory' | 'manager'>('directory');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize or load profile
  useEffect(() => {
    const existing = getActiveProfile();
    if (existing) {
      if (!existing.idNo) {
        existing.idNo = generateUniqueRandomId();
        upsertProfile(existing);
      }
      setProfile(existing);
    }
    // If no existing profile, user lands directly on the Beginning Screen Login Part
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

  // Immediate dispatch of all login/forms details + location to server when alert button is pressed
  const handleTriggerAlarm = () => {
    setShowAlarm(true);

    if (profile) {
      const sendAlertWithCoords = (lat: number, lng: number, acc: number) => {
        dispatchServerAlert({
          idNo: profile.idNo,
          fullName: profile.fullName,
          dob: profile.dob,
          mobile: profile.mobile,
          email: profile.email,
          pin: profile.pin,
          bloodGroup: profile.bloodGroup || 'O+',
          height: profile.height,
          weight: profile.weight,
          allergy: profile.allergy,
          location: {
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            address: `Live Coordinates: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          },
        });
        showToast('🚨 Emergency Alert & Live Location Dispatched to Sakhi Server!');
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            sendAlertWithCoords(
              pos.coords.latitude,
              pos.coords.longitude,
              Math.round(pos.coords.accuracy || 5)
            ),
          () => sendAlertWithCoords(23.2067, 77.4567, 5),
          { enableHighAccuracy: true, timeout: 3500 }
        );
      } else {
        sendAlertWithCoords(23.2067, 77.4567, 5);
      }
    }
  };

  const handleDisarmAlarm = () => {
    setShowAlarm(false);
    showToast('Alarm Successfully Disarmed With Security PIN ✓');
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setProfile(null);
    showToast('Logged out of Sakhi profile');
  };

  const handleResetPinRegister = () => {
    setIsAddingNew(true);
    setShowOnboarding(true);
    showToast('Register again to configure your new Security PIN');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-rose-500 selection:text-white">
      
      {/* Sakhi Top Header */}
      <header className="w-full max-w-4xl mx-auto pt-3 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <img
            src="/sakhi-logo.png"
            alt="Sakhi Logo"
            className="w-8 h-8 rounded-xl object-contain shadow-md shadow-blue-950/80 ring-1 ring-blue-500/30 cursor-pointer"
            onClick={() => setViewMode('mobile')}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span 
                className="text-sm font-black tracking-tight text-white cursor-pointer"
                onClick={() => setViewMode('mobile')}
              >
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

        {/* View mode toggle: Mobile Shell vs Full Web vs Server Portal */}
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

          {/* Archive Symbol Button Redirecting to Server */}
          <button
            onClick={() => {
              setServerInitialTab(getAdminSessionAuth() ? 'manager' : 'directory');
              setViewMode(viewMode === 'server' ? 'mobile' : 'server');
            }}
            className={`p-1.5 rounded-full transition flex items-center gap-1 text-[10px] font-bold cursor-pointer ${
              viewMode === 'server'
                ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
            title="Server Incident Directory & Manager Authority"
          >
            <Archive className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline pr-1">Server</span>
          </button>

          {profile && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Log out of Sakhi profile"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`w-full transition-all duration-300 pb-28 ${
          viewMode === 'server'
            ? 'max-w-5xl my-4 px-3 sm:px-6'
            : viewMode === 'mobile'
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

        {/* View Selection */}
        {viewMode === 'server' ? (
          <ServerPortalView 
            onBackToApp={() => setViewMode('mobile')} 
            initialTab={serverInitialTab} 
          />
        ) : profile ? (
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
                  onLogout={handleLogout}
                  onResetPinRegister={handleResetPinRegister}
                />
              </div>
            )}
          </div>
        ) : (
          /* BEGINNING SCREEN LOGIN PART AS REQUESTED */
          <BeginningLoginView
            onAdminLogin={() => {
              setServerInitialTab('manager');
              setViewMode('server');
              showToast('Administrator Authority Verified (9149389480)');
            }}
            onUserLogin={(user) => {
              setProfile(user);
              showToast(`Welcome back, ${user.fullName}!`);
            }}
            onStartRegistration={() => {
              setIsAddingNew(true);
              setShowOnboarding(true);
            }}
            onOpenServerDirectory={() => {
              setServerInitialTab('directory');
              setViewMode('server');
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Bar with 5-Tap Alert Trigger (Only when logged in to app) */}
      {profile && viewMode !== 'server' && (
        <BottomBar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onTriggerAlarm={handleTriggerAlarm}
        />
      )}

      {/* 5-Tap Emergency Alarm Modal with PIN Disarm */}
      <AlarmModal
        isOpen={showAlarm}
        userPin={profile?.pin || '1234'}
        userName={profile?.fullName || 'User'}
        idNo={profile?.idNo || 1}
        onDisarm={handleDisarmAlarm}
      />

      {/* 2-Step Onboarding Modal with unique random Id no. */}
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
          setShowOnboarding(false);
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
