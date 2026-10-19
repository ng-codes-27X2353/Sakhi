export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isCustom?: boolean;
}

export interface UserProfile {
  id: string;
  idNo: number; // Unique ID number starting from 1, linking Form 1 and Form 2
  fullName: string;
  dob: string;
  email: string;
  mobile: string;
  pin: string;
  // Step 2 optional fields
  bloodGroup?: string;
  height?: string;
  weight?: string;
  allergy?: string;
  // Emergency Contacts
  emergencyContacts: EmergencyContact[];
  // Health Ring Vitals
  ringConnected: boolean;
  ringBattery: number; // e.g. 82%
  heartRate: number; // e.g. 72 bpm
  steps: number; // e.g. 5842
  stepsGoal: number; // e.g. 10000
  sleepTime: string; // e.g. "7h 20m"
  sleepQuality: string; // e.g. "Good"
  temperature: string; // e.g. "98.4°F"
  oxygenLevel: number; // e.g. 98%
  // Meta
  createdAt: string;
  updatedAt: string;
  form1Submitted?: boolean;
  form2Submitted?: boolean;
}

export interface AlarmLog {
  id: string;
  idNo: number;
  timestamp: string;
  triggeredBy: string;
  disarmedAt?: string;
  durationSeconds?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface EmergencyNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'sent' | 'acknowledged' | 'dispatched' | 'en_route' | 'resolved';
  target: 'police' | 'ambulance' | 'family' | 'system';
}
