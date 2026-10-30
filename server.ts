import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Form response endpoints
const FORM_1_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfRj1vIsLnFFyaIu88QUduQxVhp_ASalaUDj2IdwoDeGDtquw/formResponse';
const FORM_2_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9SF8bkpauk9zkM5nO7lrMQUhZ0s70cRd_-cCDsQfMPIIJbA/formResponse';

const DATA_FILE = path.resolve(__dirname, 'server_data.json');

// Designated Administrator credentials
const ADMIN_PHONE = '9149389480';
const ADMIN_PASS = 'agaj27x2';

interface AlertVisibility {
  isPublished: boolean;
  showName: boolean;
  showMobile: boolean;
  showBloodGroup: boolean;
  showMedicalDetails: boolean;
  showLocation: boolean;
  showCase: boolean;
}

interface ServerAlertRecord {
  id: string;
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
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    mapsUrl?: string;
    address?: string;
  };
  roughLocation: string; // City, State, Country
  timestamp: string;
  status: 'active' | 'dispatched' | 'investigating' | 'resolved';
  case: string; // Separate column where manager can type
  visibility: AlertVisibility;
}

interface ServerStore {
  adminPhone: string;
  adminPasscode: string;
  managerName: string;
  alerts: ServerAlertRecord[];
}

function computeRoughLocation(lat?: number, lng?: number, address?: string): string {
  if (address && (address.includes('India') || address.includes('Delhi') || address.includes('Bhopal') || address.includes('Mumbai'))) {
    return address;
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    if (Math.abs(lat - 23.2) < 0.8 && Math.abs(lng - 77.4) < 0.8) {
      return 'Bhopal, Madhya Pradesh, India';
    }
    if (Math.abs(lat - 28.6) < 0.8 && Math.abs(lng - 77.2) < 0.8) {
      return 'New Delhi, Delhi, India';
    }
    if (Math.abs(lat - 19.0) < 0.8 && Math.abs(lng - 72.8) < 0.8) {
      return 'Mumbai, Maharashtra, India';
    }
    if (Math.abs(lat - 12.9) < 0.8 && Math.abs(lng - 77.5) < 0.8) {
      return 'Bengaluru, Karnataka, India';
    }
    if (Math.abs(lat - 22.5) < 0.8 && Math.abs(lng - 88.3) < 0.8) {
      return 'Kolkata, West Bengal, India';
    }
    if (Math.abs(lat - 26.9) < 0.8 && Math.abs(lng - 75.7) < 0.8) {
      return 'Jaipur, Rajasthan, India';
    }
    return `Northern Region, India`;
  }
  return 'Central Region, India';
}

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure admin credentials always stay synchronized
      parsed.adminPhone = ADMIN_PHONE;
      parsed.adminPasscode = ADMIN_PASS;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading server data file:', err);
  }

  // Initial seed with only location, id number, and time/date visible from the beginning
  const defaultStore: ServerStore = {
    adminPhone: ADMIN_PHONE,
    adminPasscode: ADMIN_PASS,
    managerName: 'Administrator (9149389480)',
    alerts: [
      {
        id: 'alt_seed_101',
        idNo: 86050,
        fullName: 'Akarsh',
        dob: '2002-05-14',
        mobile: '+91 98765 43210',
        email: 'akarsh.sakhi@gmail.com',
        pin: '1234',
        bloodGroup: 'O+',
        height: '178 cm',
        weight: '72 kg',
        allergy: 'Penicillin, Dust',
        location: {
          latitude: 23.2067,
          longitude: 77.4567,
          accuracy: 5,
          mapsUrl: 'https://www.google.com/maps?q=23.2067,77.4567',
          address: 'Bhopal Central Corridor, MP',
        },
        roughLocation: 'Bhopal, Madhya Pradesh, India',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: 'active',
        case: 'Case #SK-86: Emergency SOS received. Initial coordinates verified.',
        visibility: {
          isPublished: true,
          showName: false,         // Never included from beginning
          showMobile: false,       // Never included from beginning
          showBloodGroup: false,   // Controlled by manager toggle
          showMedicalDetails: false,
          showLocation: true,      // Rough location: City, State, Country
          showCase: false,
        },
      },
    ],
  };

  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: ServerStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server data file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  let store = loadStore();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ app: 'Sakhi', status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // UNIFIED LOGIN (Administrator & User Access)
  // When logged in with mob: 9149389480 & pass: agaj27x2, grants manager authority
  // For others, manager authority is invisible
  // ==========================================
  app.post('/api/server/login', (req, res) => {
    try {
      const { phone, password } = req.body;
      const cleanPhone = String(phone || '').replace(/\D/g, '');

      // Check Administrator Credentials
      if (cleanPhone.endsWith(ADMIN_PHONE) && password === ADMIN_PASS) {
        console.log(`[Sakhi Admin Login] Authorized Administrator: ${ADMIN_PHONE}`);
        return res.json({
          success: true,
          isAdministrator: true,
          managerName: store.managerName || 'Administrator',
          message: 'Administrator authority verified.',
        });
      }

      // If user provided a password/pin matching a registered individual
      const matchedAlert = store.alerts.find(
        (a) => a.mobile.replace(/\D/g, '').endsWith(cleanPhone) && a.pin === password
      );

      if (matchedAlert) {
        return res.json({
          success: true,
          isAdministrator: false,
          user: {
            fullName: matchedAlert.fullName,
            idNo: matchedAlert.idNo,
            mobile: matchedAlert.mobile,
          },
          message: 'User logged in successfully.',
        });
      }

      res.status(401).json({
        success: false,
        isAdministrator: false,
        error: 'Invalid phone number or password/PIN.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Login error' });
    }
  });

  // ==========================================
  // EMERGENCY SOS DISPATCH (App -> Server)
  // Receives all details; by default ONLY shows location, ID number, and date/time
  // ==========================================
  app.post('/api/server/alerts', (req, res) => {
    try {
      const {
        idNo,
        fullName,
        dob,
        mobile,
        email,
        pin,
        bloodGroup,
        height,
        weight,
        allergy,
        location,
        caseNote,
      } = req.body;

      const latitude = Number(location?.latitude) || 23.2067;
      const longitude = Number(location?.longitude) || 77.4567;
      const accuracy = Number(location?.accuracy) || 5;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const roughLocation = computeRoughLocation(latitude, longitude, location?.address);

      const newAlert: ServerAlertRecord = {
        id: `alt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        idNo: Number(idNo) || Math.floor(10000 + Math.random() * 90000),
        fullName: fullName || 'Protected User',
        dob: dob || '',
        mobile: mobile || '',
        email: email || '',
        pin: pin || '',
        bloodGroup: bloodGroup || 'O+',
        height: height || '',
        weight: weight || '',
        allergy: allergy || '',
        location: {
          latitude,
          longitude,
          accuracy,
          mapsUrl,
          address: location?.address || roughLocation,
        },
        roughLocation,
        timestamp: new Date().toISOString(),
        status: 'active',
        case: caseNote || 'Active SOS alert. Telemetry received; awaiting response.',
        // STRICT PRIVACY FROM THE BEGINNING:
        // Only location, ID number, and date/time are shown. Name and contact are hidden.
        visibility: {
          isPublished: true,
          showName: false,         // Never shown on info site from the beginning
          showMobile: false,       // Never shown on info site from the beginning
          showBloodGroup: false,   // Manager can toggle on
          showMedicalDetails: false,
          showLocation: true,      // Rough location (City, State, Country)
          showCase: false,
        },
      };

      store.alerts.unshift(newAlert);
      saveStore(store);

      console.log(`[Sakhi Server Alert] Received: ID #${newAlert.idNo} at ${newAlert.roughLocation}`);

      res.status(201).json({
        success: true,
        message: 'Emergency alert stored on Sakhi Server',
        alertId: newAlert.id,
        alert: newAlert,
      });
    } catch (err: any) {
      console.error('[Sakhi Server Alert Error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server error saving alert' });
    }
  });

  // ==========================================
  // PUBLIC INFORMATION SITE
  // Simple directory: In the beginning ONLY shows location, ID number, and time/date.
  // Does NOT mention Name and Contact from the beginning!
  // ==========================================
  app.get('/api/server/public-info', (_req, res) => {
    try {
      const publishedAlerts = store.alerts
        .filter((a) => a.visibility.isPublished)
        .map((a) => {
          const item: any = {
            id: a.id,
            idNo: a.idNo,
            timestamp: a.timestamp,
            status: a.status,
            roughLocation: a.roughLocation || 'City, State, Country',
          };

          // Name and Contact are NEVER included from the beginning unless explicitly enabled by manager
          if (a.visibility.showName) item.fullName = a.fullName;
          if (a.visibility.showMobile) item.mobile = a.mobile;
          if (a.visibility.showBloodGroup) item.bloodGroup = a.bloodGroup;
          if (a.visibility.showMedicalDetails) {
            item.height = a.height;
            item.weight = a.weight;
            item.allergy = a.allergy;
          }
          if (a.visibility.showCase) item.case = a.case;

          return item;
        });

      res.json({
        success: true,
        total: publishedAlerts.length,
        items: publishedAlerts,
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // ==========================================
  // MANAGER AUTHORITY
  // Full visibility toggles, Case text column, and incident resolution
  // ==========================================
  app.get('/api/server/manager/alerts', (_req, res) => {
    res.json({
      success: true,
      alerts: store.alerts,
      managerName: store.managerName,
      adminPhone: ADMIN_PHONE,
    });
  });

  app.patch('/api/server/manager/alerts/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { caseNote, status, visibility } = req.body;
      const alert = store.alerts.find((a) => a.id === id);

      if (!alert) {
        return res.status(404).json({ success: false, error: 'Alert record not found' });
      }

      if (caseNote !== undefined) {
        alert.case = caseNote; // Editable "case" column
      }

      if (status !== undefined) {
        alert.status = status;
      }

      if (visibility && typeof visibility === 'object') {
        alert.visibility = {
          ...alert.visibility,
          ...visibility,
        };
      }

      saveStore(store);
      console.log(`[Sakhi Manager] Updated ID #${alert.idNo}: Case="${alert.case}"`);

      res.json({
        success: true,
        message: 'Alert updated by Manager',
        alert,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.delete('/api/server/manager/alerts/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = store.alerts.length;
    store.alerts = store.alerts.filter((a) => a.id !== id);
    saveStore(store);

    res.json({
      success: true,
      deleted: store.alerts.length < initialLen,
      message: 'Alert record deleted from server',
    });
  });

  // ==========================================
  // GOOGLE FORMS INTEGRATION (Form 1 & Form 2)
  // ==========================================
  app.post('/api/submit-details', async (req, res) => {
    try {
      const { idNo, fullName, dob, email, mobile, pin } = req.body;
      const params = new URLSearchParams();
      
      params.append('fvv', '1');
      params.append('pageHistory', '0');

      if (idNo !== undefined && idNo !== null) params.append('entry.1419613782', String(idNo));
      if (fullName) params.append('entry.2070462998', fullName);

      if (dob) {
        params.append('entry.416279133', dob);
        const parts = dob.split('-');
        if (parts.length === 3) {
          const [year, month, day] = parts;
          params.append('entry.416279133_year', year);
          params.append('entry.416279133_month', month);
          params.append('entry.416279133_day', day);
        }
      }

      if (email) params.append('entry.2017269109', email);
      if (mobile) params.append('entry.301913594', mobile);
      if (pin) params.append('entry.960344203', pin);

      const response = await fetch(FORM_1_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const responseText = await response.text();
      const isConfirmed = responseText.includes('form_confirm') || 
                          responseText.includes('formResponse') ||
                          responseText.includes('回覆') || 
                          responseText.includes('recorded') ||
                          response.status < 400;

      res.json({
        success: isConfirmed,
        status: response.status,
        idNo,
        message: 'Details successfully submitted to Google Form 1',
      });
    } catch (err: any) {
      console.error('[Sakhi Form 1 error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to submit Form 1' });
    }
  });

  app.post('/api/submit-basic-details', async (req, res) => {
    try {
      const { idNo, bloodGroup, height, weight, allergy } = req.body;
      const params = new URLSearchParams();
      
      params.append('fvv', '1');
      params.append('pageHistory', '0');

      if (idNo !== undefined && idNo !== null) params.append('entry.276521875', String(idNo));
      if (bloodGroup) params.append('entry.446776732', bloodGroup);
      if (height) params.append('entry.1530619306', height);
      if (weight) params.append('entry.2009710054', weight);
      if (allergy) params.append('entry.1976716211', allergy);

      const response = await fetch(FORM_2_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const responseText = await response.text();
      const isConfirmed = responseText.includes('form_confirm') || 
                          responseText.includes('formResponse') ||
                          responseText.includes('回覆') || 
                          responseText.includes('recorded') ||
                          response.status < 400;

      res.json({
        success: isConfirmed,
        status: response.status,
        idNo,
        message: 'Medical details successfully submitted to Google Form 2',
      });
    } catch (err: any) {
      console.error('[Sakhi Form 2 error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to submit Form 2' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sakhi server listening on port ${PORT}`);
  });
}

startServer();
