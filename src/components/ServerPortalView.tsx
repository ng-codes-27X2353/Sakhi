import React, { useState, useEffect } from 'react';
import { 
  Server, Shield, Eye, EyeOff, Lock, Unlock, 
  MapPin, Phone, Droplets, AlertTriangle, CheckCircle2, 
  Clock, RefreshCw, Trash2, ArrowLeft, ExternalLink, 
  Edit3, Save, FileText, UserCheck, AlertOctagon, UserX, 
  Radio, Check, Sparkles, Filter, LogIn, LogOut, Hash, Building2 
} from 'lucide-react';
import { ServerAlert, PublicInfoItem, AlertVisibility } from '../types';
import { 
  fetchPublicInfo, fetchManagerAlerts, updateAlertManager, 
  deleteAlertManager, serverLogin, getAdminSessionAuth, setAdminSessionAuth 
} from '../utils/api';

interface ServerPortalViewProps {
  onBackToApp: () => void;
  initialTab?: 'directory' | 'manager';
}

export const ServerPortalView: React.FC<ServerPortalViewProps> = ({ onBackToApp, initialTab }) => {
  // Mode: 'directory' (Public Incident Board) or 'manager' (Only visible if administrator)
  const [activeTab, setActiveTab] = useState<'directory' | 'manager'>(
    initialTab || (getAdminSessionAuth() ? 'manager' : 'directory')
  );

  // Administrator authorization state
  const [isAdministrator, setIsAdministrator] = useState<boolean>(() => getAdminSessionAuth());
  const [managerName, setManagerName] = useState<string>('System Administrator');

  // Login Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Public Directory Data
  const [publicItems, setPublicItems] = useState<PublicInfoItem[]>([]);
  const [isRefreshingPublic, setIsRefreshingPublic] = useState(false);

  // Manager Alerts Data
  const [managerAlerts, setManagerAlerts] = useState<ServerAlert[]>([]);
  const [isRefreshingManager, setIsRefreshingManager] = useState(false);

  // In-line editing for the "Case" column
  const [editingCaseNotes, setEditingCaseNotes] = useState<{ [id: string]: string }>({});
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPublicData = async () => {
    setIsRefreshingPublic(true);
    const items = await fetchPublicInfo();
    setPublicItems(items);
    setIsRefreshingPublic(false);
  };

  const loadManagerData = async () => {
    setIsRefreshingManager(true);
    const res = await fetchManagerAlerts();
    setManagerAlerts(res.alerts);
    setManagerName(res.managerName);
    const notesMap: { [id: string]: string } = {};
    res.alerts.forEach((a) => {
      notesMap[a.id] = a.case || '';
    });
    setEditingCaseNotes(notesMap);
    setIsRefreshingManager(false);
  };

  useEffect(() => {
    loadPublicData();
    if (isAdministrator) {
      loadManagerData();
    }

    const interval = setInterval(() => {
      loadPublicData();
      if (isAdministrator) {
        loadManagerData();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isAdministrator]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await serverLogin(loginPhone.trim(), loginPassword.trim());
    setIsLoggingIn(false);

    if (res.success && res.isAdministrator) {
      setIsAdministrator(true);
      setAdminSessionAuth(true);
      setShowLoginModal(false);
      setLoginPhone('');
      setLoginPassword('');
      setActiveTab('manager');
      loadManagerData();
      showToast('Administrator authority verified.');
    } else if (res.success && !res.isAdministrator) {
      setShowLoginModal(false);
      setLoginPhone('');
      setLoginPassword('');
      showToast('Logged in successfully.');
    } else {
      setLoginError(res.error || 'Authentication failed. Please verify phone and password/PIN.');
    }
  };

  const handleLogout = () => {
    setIsAdministrator(false);
    setAdminSessionAuth(false);
    setActiveTab('directory');
    showToast('Logged out of administrator authority.');
  };

  // Manager: Toggle visibility on any field
  const handleToggleVisibility = async (
    alertId: string,
    field: keyof AlertVisibility,
    currentValue: boolean
  ) => {
    const targetAlert = managerAlerts.find((a) => a.id === alertId);
    if (!targetAlert) return;

    const newVisibility = {
      ...targetAlert.visibility,
      [field]: !currentValue,
    };

    setManagerAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, visibility: newVisibility } : a))
    );

    const res = await updateAlertManager(alertId, { visibility: newVisibility });
    if (res.success) {
      loadPublicData();
      showToast(`Updated display settings for ID #${targetAlert.idNo}`);
    }
  };

  // Manager: Save Case column note
  const handleSaveCaseNote = async (alertId: string) => {
    setSavingCaseId(alertId);
    const newCaseNote = editingCaseNotes[alertId] ?? '';
    const res = await updateAlertManager(alertId, { caseNote: newCaseNote });
    setSavingCaseId(null);
    if (res.success) {
      setManagerAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, case: newCaseNote } : a))
      );
      loadPublicData();
      showToast('Case record updated successfully');
    }
  };

  // Manager: Change Case Status
  const handleChangeStatus = async (
    alertId: string,
    status: 'active' | 'dispatched' | 'investigating' | 'resolved'
  ) => {
    const res = await updateAlertManager(alertId, { status });
    if (res.success) {
      setManagerAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status } : a))
      );
      loadPublicData();
      showToast(`Status marked as ${status}`);
    }
  };

  // Manager: Delete alert
  const handleDeleteAlert = async (alertId: string) => {
    if (confirm('Delete this emergency alert record from the server?')) {
      const ok = await deleteAlertManager(alertId);
      if (ok) {
        setManagerAlerts((prev) => prev.filter((a) => a.id !== alertId));
        loadPublicData();
        showToast('Record deleted from server');
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-16 text-slate-100 animate-fade-in">
      
      {/* Top Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-800/50 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToApp}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Return to Sakhi App"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to App</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Sakhi Emergency Server
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Connected SOS Telemetry &amp; Response Directory
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Admin Auth Bar */}
        <div className="flex items-center gap-2">
          {/* Manager Authority is COMPLETELY INVISIBLE for others */}
          {isAdministrator ? (
            <div className="flex items-center gap-1 bg-[#131c2e] p-1 rounded-2xl border border-blue-900/40">
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Incident Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('manager')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'manager'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Manager Authority</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 transition"
                title="Log Out of Administrator Mode"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Clean Sign In button for regular users */
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-3.5 py-2 rounded-2xl bg-[#131c2e] hover:bg-slate-800 border border-blue-900/50 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PUBLIC EMERGENCY INCIDENT DIRECTORY                   */}
      {/* "dont mention name and contact on info site and the      */}
      {/*  infor site must only say rough location like city       */}
      {/*  state and country"                                      */}
      {/* ======================================================== */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
                Public Safety Directory
              </span>
              <h2 className="text-lg font-black text-white">
                Emergency Incident Board
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays verified incident telemetry: ID Number, Date/Time, and Rough Location.
              </p>
            </div>

            <button
              onClick={loadPublicData}
              disabled={isRefreshingPublic}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPublic ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {publicItems.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#131c2e]/60 border border-blue-900/30 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Incidents</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active emergency signals currently published. When the SOS button is triggered in Sakhi, the incident immediately registers here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {publicItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-sm">
                        SOS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white font-mono tracking-wide">
                            Incident #{item.idNo}
                          </span>
                          {/* Name is NOT shown unless manager explicitly toggled it */}
                          {item.fullName && (
                            <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                              {item.fullName}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        item.status === 'active'
                          ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : item.status === 'dispatched'
                          ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40'
                          : item.status === 'investigating'
                          ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* ONLY ROUGH LOCATION (City, State, Country) - No coordinates / phone / name */}
                  <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-900/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">
                          Rough Geographic Sector (City, State, Country)
                        </span>
                        <span className="font-bold text-white text-sm">
                          {item.roughLocation || 'City, State, Country'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional fields if toggled on by manager */}
                  {(item.bloodGroup || item.height || item.weight || item.allergy) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      {item.bloodGroup && (
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-rose-400 font-bold uppercase block">Blood Group</span>
                          <span className="text-xs font-black text-white">{item.bloodGroup}</span>
                        </div>
                      )}
                      {(item.height || item.weight) && (
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block">Physical Vitals</span>
                          <span className="text-xs font-bold text-slate-200">
                            {item.height || '-'} / {item.weight || '-'}
                          </span>
                        </div>
                      )}
                      {item.allergy && (
                        <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/30">
                          <span className="text-[9px] text-amber-400 font-bold uppercase block">Allergies</span>
                          <span className="text-xs font-bold text-amber-200 truncate block">⚠️ {item.allergy}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Case Notes (Only if manager toggled on) */}
                  {item.case && (
                    <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                      <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1 mb-0.5">
                        <FileText className="w-3.5 h-3.5" />
                        Dispatcher Case Notes:
                      </span>
                      <p className="text-slate-200 leading-relaxed font-medium">
                        {item.case}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MANAGER AUTHORITY (COMPLETELY INVISIBLE UNLESS ADMIN)  */}
      {/* ======================================================== */}
      {activeTab === 'manager' && isAdministrator && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Authority Bar */}
          <div className="p-4 rounded-3xl bg-[#131c2e] border border-blue-900/50 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Active Administrator
                </span>
                <span className="text-sm font-black text-white">{managerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Phone: 9149389480
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-xs text-rose-300 font-semibold border border-rose-500/30 transition cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Master Alerts Control List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Active SOS Records ({managerAlerts.length})
              </span>
              <span className="text-xs text-cyan-400">
                Check toggles below to configure what displays on the public directory
              </span>
            </div>

            {managerAlerts.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-[#131c2e] border border-blue-900/30">
                <p className="text-xs text-slate-400">No emergency alert records on server.</p>
              </div>
            ) : (
              managerAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-5 rounded-3xl bg-[#131c2e] border border-blue-900/40 shadow-xl space-y-4"
                >
                  {/* Alert Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-sm">
                        #{alert.idNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white">{alert.fullName}</span>
                          <span className="text-xs text-slate-400 font-mono">DOB: {alert.dob || 'N/A'}</span>
                          <span className="text-xs text-rose-400 font-bold">Blood: {alert.bloodGroup}</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Phone: {alert.mobile || 'None'}</span>
                          <span>•</span>
                          <span>Email: {alert.email || 'None'}</span>
                          <span>•</span>
                          <span>PIN: •••• (Encrypted)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={alert.status}
                        onChange={(e) => handleChangeStatus(alert.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold cursor-pointer"
                      >
                        <option value="active">🔴 Active</option>
                        <option value="dispatched">🔵 Dispatched</option>
                        <option value="investigating">🟡 Investigating</option>
                        <option value="resolved">🟢 Resolved</option>
                      </select>

                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Location & Vitals Data Received From Alert */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Precise Satellite Coordinates
                      </span>
                      <span className="font-mono text-cyan-300 block mt-0.5">
                        {alert.location?.latitude?.toFixed(4)}° N, {alert.location?.longitude?.toFixed(4)}° E (±{alert.location?.accuracy || 5}m)
                      </span>
                      <span className="text-[11px] text-slate-300 block mt-0.5">
                        Rough Location: <strong>{alert.roughLocation}</strong>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Medical Profile Telemetry
                      </span>
                      <div className="text-slate-300 mt-0.5 flex flex-wrap gap-2">
                        <span>Height: {alert.height || 'N/A'}</span>
                        <span>Weight: {alert.weight || 'N/A'}</span>
                        <span className="text-amber-300">Allergy: {alert.allergy || 'None'}</span>
                      </div>
                    </div>
                  </div>

                  {/* MANAGER DISPLAY AUTHORITY TOGGLES */}
                  <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Display Toggles (What to Show On Public Directory)
                      </span>
                      
                      <button
                        onClick={() =>
                          handleToggleVisibility(
                            alert.id,
                            'isPublished',
                            alert.visibility.isPublished
                          )
                        }
                        className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer flex items-center gap-1 ${
                          alert.visibility.isPublished
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {alert.visibility.isPublished ? 'Visible on Directory' : 'Hidden from Directory'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      {/* Name Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showName', alert.visibility.showName)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showName
                            ? 'bg-blue-600/40 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Name: {alert.visibility.showName ? 'Shown' : 'Hidden'}
                      </button>

                      {/* Mobile Contact Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showMobile', alert.visibility.showMobile)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showMobile
                            ? 'bg-blue-600/40 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Contact: {alert.visibility.showMobile ? 'Shown' : 'Hidden'}
                      </button>

                      {/* Rough Location Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showLocation', alert.visibility.showLocation)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showLocation
                            ? 'bg-blue-600/40 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Location: {alert.visibility.showLocation ? 'Shown' : 'Hidden'}
                      </button>

                      {/* Blood Group Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showBloodGroup', alert.visibility.showBloodGroup)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showBloodGroup
                            ? 'bg-rose-600/40 text-rose-300 border border-rose-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Blood Group: {alert.visibility.showBloodGroup ? 'Shown' : 'Hidden'}
                      </button>

                      {/* Vitals/Allergies Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showMedicalDetails', alert.visibility.showMedicalDetails)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showMedicalDetails
                            ? 'bg-blue-600/40 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Vitals/Allergies: {alert.visibility.showMedicalDetails ? 'Shown' : 'Hidden'}
                      </button>

                      {/* Case Notes Toggle */}
                      <button
                        onClick={() =>
                          handleToggleVisibility(alert.id, 'showCase', alert.visibility.showCase)
                        }
                        className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                          alert.visibility.showCase
                            ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/50'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        Case Note: {alert.visibility.showCase ? 'Shown' : 'Hidden'}
                      </button>
                    </div>
                  </div>

                  {/* SEPARATE COLUMN NAMED "CASE" WHERE MANAGER CAN TYPE */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        Case Column (Type Instructions &amp; Action Notes):
                      </label>

                      <button
                        onClick={() => handleSaveCaseNote(alert.id)}
                        disabled={savingCaseId === alert.id}
                        className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1 shadow transition cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        <span>{savingCaseId === alert.id ? 'Saving...' : 'Save Case'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={editingCaseNotes[alert.id] ?? alert.case}
                      onChange={(e) =>
                        setEditingCaseNotes({
                          ...editingCaseNotes,
                          [alert.id]: e.target.value,
                        })
                      }
                      placeholder="Type case notes here (e.g. PCR Unit 4 dispatched; contacted family; patient safe at hospital)..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Login Modal (Asks for Phone Number & Password/PIN) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-white">
          <form
            onSubmit={handleLoginSubmit}
            className="w-full max-w-sm bg-[#0f172a] border border-blue-900/60 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Portal Sign In</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                }}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="Enter registered mobile number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Password / PIN
              </label>
              <input
                type="password"
                required
                placeholder="Enter password or PIN"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
