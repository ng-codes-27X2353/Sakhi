import { UserProfile, ServerAlert, PublicInfoItem, AlertVisibility } from '../types';

export const FORM_1_SHARE_URL = 'https://forms.gle/j83ELRXJWvTRTYrg9';
export const FORM_2_SHARE_URL = 'https://forms.gle/sonYz3F5hNDXPeNi7';

const FORM_1_DIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfRj1vIsLnFFyaIu88QUduQxVhp_ASalaUDj2IdwoDeGDtquw/formResponse';
const FORM_2_DIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9SF8bkpauk9zkM5nO7lrMQUhZ0s70cRd_-cCDsQfMPIIJbA/formResponse';

const STORAGE_KEY_PROFILES = 'sakhi_user_profiles';
const STORAGE_KEY_ACTIVE_ID = 'sakhi_active_profile_id';
const STORAGE_KEY_SERVER_ALERTS = 'sakhi_local_server_alerts_backup';
const STORAGE_KEY_ADMIN_AUTH = 'sakhi_admin_session_auth';

export function getAdminSessionAuth(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ADMIN_AUTH) === 'true';
  } catch (_) {
    return false;
  }
}

export function setAdminSessionAuth(val: boolean): void {
  try {
    if (val) {
      localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
    }
  } catch (_) {}
}

export function generateUniqueRandomId(): number {
  const profiles = getSavedProfiles();
  const existingIds = new Set(profiles.map((p) => p.idNo));

  let attempts = 0;
  while (attempts < 1000) {
    const randomCandidate = Math.floor(10000 + Math.random() * 90000);
    if (!existingIds.has(randomCandidate)) {
      return randomCandidate;
    }
    attempts++;
  }

  return Math.floor(Date.now() % 1000000);
}

/**
 * Server Login:
 * Authenticates phone number and password/PIN.
 * When mob: 9149389480 and pass: agaj27x2, grants Administrator Authority.
 * Also logs in registered users with their phone number & PIN.
 */
export async function serverLogin(
  phone: string,
  pass: string
): Promise<{ 
  success: boolean; 
  isAdministrator: boolean; 
  managerName?: string; 
  userProfile?: UserProfile;
  error?: string 
}> {
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  // 1. Direct Administrator Verification
  if (cleanPhone.endsWith('9149389480') && pass === 'agaj27x2') {
    setAdminSessionAuth(true);
    return {
      success: true,
      isAdministrator: true,
      managerName: 'Administrator (9149389480)',
    };
  }

  // 2. Registered Local User Profile Verification
  const profiles = getSavedProfiles();
  const matched = profiles.find(
    (p) => p.mobile.replace(/\D/g, '').endsWith(cleanPhone) && p.pin === pass
  );
  if (matched) {
    setActiveProfileId(matched.id);
    return {
      success: true,
      isAdministrator: false,
      userProfile: matched,
    };
  }

  // 3. Server-side API Check
  try {
    const res = await fetch('/api/server/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password: pass }),
    });

    const json = await res.json();
    if (res.ok && json.success) {
      if (json.isAdministrator) {
        setAdminSessionAuth(true);
      }
      return {
        success: true,
        isAdministrator: !!json.isAdministrator,
        managerName: json.managerName,
      };
    } else {
      return {
        success: false,
        isAdministrator: false,
        error: json.error || 'Invalid phone number or password/PIN.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      isAdministrator: false,
      error: 'Invalid phone number or password/PIN.',
    };
  }
}

/**
 * Dispatches an Emergency Alert to the Sakhi Server immediately upon alert button press.
 * From the beginning, only location, ID number, and date/time are enabled for public info.
 */
export async function dispatchServerAlert(data: {
  idNo: number;
  fullName: string;
  dob: string;
  mobile: string;
  email: string;
  pin: string;
  bloodGroup: string;
  height?: string;
  weight?: string;
  allergy?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  caseNote?: string;
}): Promise<{ success: boolean; alert?: ServerAlert; error?: string }> {
  try {
    const res = await fetch('/api/server/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      return { success: true, alert: json.alert };
    }
  } catch (err) {
    console.warn('[Server Alert fetch error, storing local backup]:', err);
  }

  const fallbackAlert: ServerAlert = {
    id: `alt_offline_${Date.now()}`,
    idNo: data.idNo,
    fullName: data.fullName,
    dob: data.dob,
    mobile: data.mobile,
    email: data.email,
    pin: data.pin,
    bloodGroup: data.bloodGroup,
    height: data.height,
    weight: data.weight,
    allergy: data.allergy,
    location: {
      latitude: data.location?.latitude || 23.2067,
      longitude: data.location?.longitude || 77.4567,
      accuracy: data.location?.accuracy || 5,
      mapsUrl: `https://www.google.com/maps?q=${data.location?.latitude || 23.2067},${data.location?.longitude || 77.4567}`,
      address: data.location?.address || 'Bhopal, Madhya Pradesh, India',
    },
    roughLocation: 'Bhopal, Madhya Pradesh, India',
    timestamp: new Date().toISOString(),
    status: 'active',
    case: data.caseNote || 'Active emergency alert received.',
    visibility: {
      isPublished: true,
      showName: false,         // Never shown on info site from the beginning
      showMobile: false,       // Never shown on info site from the beginning
      showBloodGroup: false,   // Controlled by manager toggle
      showMedicalDetails: false,
      showLocation: true,      // Rough location: City, State, Country
      showCase: false,
    },
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_SERVER_ALERTS) || '[]');
    existing.unshift(fallbackAlert);
    localStorage.setItem(STORAGE_KEY_SERVER_ALERTS, JSON.stringify(existing));
  } catch (_) {}

  return { success: true, alert: fallbackAlert };
}

/**
 * Fetches data for the Public Info Site.
 * From the beginning only shows location, ID number, and date/time.
 * Name and phone number are omitted unless explicitly toggled on by manager.
 */
export async function fetchPublicInfo(): Promise<PublicInfoItem[]> {
  try {
    const res = await fetch('/api/server/public-info');
    if (res.ok) {
      const json = await res.json();
      return json.items || [];
    }
  } catch (err) {
    console.warn('Error fetching public info:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SERVER_ALERTS);
    if (raw) {
      const alerts: ServerAlert[] = JSON.parse(raw);
      return alerts
        .filter((a) => a.visibility?.isPublished)
        .map((a) => ({
          id: a.id,
          idNo: a.idNo,
          timestamp: a.timestamp,
          status: a.status,
          roughLocation: a.roughLocation || 'City, State, Country',
          fullName: a.visibility?.showName ? a.fullName : undefined,
          mobile: a.visibility?.showMobile ? a.mobile : undefined,
          bloodGroup: a.visibility?.showBloodGroup ? a.bloodGroup : undefined,
          height: a.visibility?.showMedicalDetails ? a.height : undefined,
          weight: a.visibility?.showMedicalDetails ? a.weight : undefined,
          allergy: a.visibility?.showMedicalDetails ? a.allergy : undefined,
          case: a.visibility?.showCase ? a.case : undefined,
        }));
    }
  } catch (_) {}

  return [];
}

/**
 * Fetches all alert records for the Authorized Manager.
 */
export async function fetchManagerAlerts(): Promise<{
  alerts: ServerAlert[];
  managerName: string;
}> {
  try {
    const res = await fetch('/api/server/manager/alerts');
    if (res.ok) {
      const json = await res.json();
      return {
        alerts: json.alerts || [],
        managerName: json.managerName || 'Administrator (9149389480)',
      };
    }
  } catch (err) {
    console.warn('Error fetching manager alerts:', err);
  }

  const local = JSON.parse(localStorage.getItem(STORAGE_KEY_SERVER_ALERTS) || '[]');
  return {
    alerts: local,
    managerName: 'Administrator (9149389480)',
  };
}

/**
 * Updates an alert's visibility toggles, case notes, or response status.
 */
export async function updateAlertManager(
  id: string,
  payload: {
    caseNote?: string;
    status?: 'active' | 'dispatched' | 'investigating' | 'resolved';
    visibility?: Partial<AlertVisibility>;
  }
): Promise<{ success: boolean; alert?: ServerAlert }> {
  try {
    const res = await fetch(`/api/server/manager/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, alert: json.alert };
    }
  } catch (err) {
    console.warn('Error updating alert via API:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SERVER_ALERTS);
    if (raw) {
      let alerts: ServerAlert[] = JSON.parse(raw);
      alerts = alerts.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            case: payload.caseNote !== undefined ? payload.caseNote : a.case,
            status: payload.status !== undefined ? payload.status : a.status,
            visibility: { ...a.visibility, ...payload.visibility },
          };
        }
        return a;
      });
      localStorage.setItem(STORAGE_KEY_SERVER_ALERTS, JSON.stringify(alerts));
      const updated = alerts.find((a) => a.id === id);
      return { success: true, alert: updated };
    }
  } catch (_) {}

  return { success: false };
}

/**
 * Deletes an alert from the server.
 */
export async function deleteAlertManager(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/server/manager/alerts/${id}`, { method: 'DELETE' });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Error deleting alert:', err);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SERVER_ALERTS);
    if (raw) {
      let alerts: ServerAlert[] = JSON.parse(raw);
      alerts = alerts.filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEY_SERVER_ALERTS, JSON.stringify(alerts));
      return true;
    }
  } catch (_) {}

  return false;
}

/**
 * Submit Form 1: Details (Id no., Full Name, DOB, E-mail, Mobile, PIN)
 */
export async function submitForm1(data: {
  idNo: number;
  fullName: string;
  dob: string;
  email: string;
  mobile: string;
  pin: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/submit-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: json.success ?? true, message: json.message || 'Google Form 1 successfully recorded' };
    }
  } catch (err) {
    console.warn('[Proxy unreachable, attempting direct Form 1]:', err);
  }

  try {
    const params = new URLSearchParams();
    params.append('fvv', '1');
    params.append('pageHistory', '0');
    params.append('entry.1419613782', String(data.idNo));
    if (data.fullName) params.append('entry.2070462998', data.fullName);

    if (data.dob) {
      params.append('entry.416279133', data.dob);
      const parts = data.dob.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        params.append('entry.416279133_year', year);
        params.append('entry.416279133_month', month);
        params.append('entry.416279133_day', day);
      }
    }

    if (data.email) params.append('entry.2017269109', data.email);
    if (data.mobile) params.append('entry.301913594', data.mobile);
    if (data.pin) params.append('entry.960344203', data.pin);

    await fetch(FORM_1_DIRECT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return { success: true, message: `Google Form 1 recorded with Unique ID #${data.idNo}` };
  } catch (directErr: any) {
    console.error('Direct Form 1 error:', directErr);
    return { success: false, message: directErr.message || 'Submission failed' };
  }
}

/**
 * Submit Form 2: Basic Details (Id no., Blood Group, Height, Weight, Allergy)
 */
export async function submitForm2(data: {
  idNo: number;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  allergy?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/submit-basic-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: json.success ?? true, message: json.message || 'Google Form 2 successfully recorded' };
    }
  } catch (err) {
    console.warn('[Proxy unreachable, attempting direct Form 2]:', err);
  }

  try {
    const params = new URLSearchParams();
    params.append('fvv', '1');
    params.append('pageHistory', '0');
    params.append('entry.276521875', String(data.idNo));
    if (data.bloodGroup) params.append('entry.446776732', data.bloodGroup);
    if (data.height) params.append('entry.1530619306', data.height);
    if (data.weight) params.append('entry.2009710054', data.weight);
    if (data.allergy) params.append('entry.1976716211', data.allergy);

    await fetch(FORM_2_DIRECT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return { success: true, message: `Google Form 2 recorded with linked ID #${data.idNo}` };
  } catch (directErr: any) {
    console.error('Direct Form 2 error:', directErr);
    return { success: false, message: directErr.message || 'Submission failed' };
  }
}

// Storage helpers
export function getSavedProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function saveProfiles(profiles: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving profiles:', e);
  }
}

export function getActiveProfileId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch (_) {
    return null;
  }
}

export function setActiveProfileId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (_) {}
}

export function getActiveProfile(): UserProfile | null {
  const profiles = getSavedProfiles();
  if (profiles.length === 0) return null;
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  return profiles.find((p) => p.id === activeId) || null;
}

export function upsertProfile(profile: UserProfile): void {
  const profiles = getSavedProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
  setActiveProfileId(profile.id);
}

export function deleteProfile(id: string): void {
  let profiles = getSavedProfiles();
  profiles = profiles.filter((p) => p.id !== id);
  saveProfiles(profiles);
  if (getActiveProfileId() === id) {
    setActiveProfileId(profiles.length > 0 ? profiles[0].id : null);
  }
}
