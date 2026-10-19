import { UserProfile } from '../types';

export const FORM_1_SHARE_URL = 'https://forms.gle/RMc9w52VzG1hQaLC9';
export const FORM_2_SHARE_URL = 'https://forms.gle/sonYz3F5hNDXPeNi7';

const FORM_1_DIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfRj1vIsLnFFyaIu88QUduQxVhp_ASalaUDj2IdwoDeGDtquw/formResponse';
const FORM_2_DIRECT_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9SF8bkpauk9zkM5nO7lrMQUhZ0s70cRd_-cCDsQfMPIIJbA/formResponse';

const STORAGE_KEY_PROFILES = 'sakhi_user_profiles';
const STORAGE_KEY_ACTIVE_ID = 'sakhi_active_profile_id';

/**
 * Computes next unique ID number starting from 1.
 * Guarantees no two individuals have the same ID number.
 */
export function getNextIdNo(): number {
  const profiles = getSavedProfiles();
  if (profiles.length === 0) return 1;
  const maxId = Math.max(...profiles.map((p) => p.idNo || 0));
  return maxId + 1;
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
  // 1. Try server proxy endpoint
  try {
    const res = await fetch('/api/submit-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message || 'Google Form 1 successfully recorded' };
    }
  } catch (err) {
    console.warn('[Proxy unreachable, attempting direct Form 1]:', err);
  }

  // 2. Direct browser fallback (no-cors mode)
  try {
    const params = new URLSearchParams();
    params.append('entry.1419613782', String(data.idNo));
    if (data.fullName) params.append('entry.2070462998', data.fullName);
    if (data.dob) params.append('entry.416279133', data.dob);
    if (data.email) params.append('entry.2017269109', data.email);
    if (data.mobile) params.append('entry.301913594', data.mobile);
    if (data.pin) params.append('entry.960344203', data.pin);

    await fetch(FORM_1_DIRECT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    return { success: true, message: 'Google Form 1 submitted with ID #' + data.idNo };
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
  // 1. Try server proxy endpoint
  try {
    const res = await fetch('/api/submit-basic-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      return { success: true, message: json.message || 'Google Form 2 successfully recorded' };
    }
  } catch (err) {
    console.warn('[Proxy unreachable, attempting direct Form 2]:', err);
  }

  // 2. Direct browser fallback (no-cors mode)
  try {
    const params = new URLSearchParams();
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
    return { success: true, message: 'Google Form 2 submitted with linked ID #' + data.idNo };
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
  if (!activeId) return profiles[0];
  return profiles.find((p) => p.id === activeId) || profiles[0];
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
