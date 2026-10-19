import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated Google Form response endpoints
const FORM_1_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfRj1vIsLnFFyaIu88QUduQxVhp_ASalaUDj2IdwoDeGDtquw/formResponse';
const FORM_2_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe9SF8bkpauk9zkM5nO7lrMQUhZ0s70cRd_-cCDsQfMPIIJbA/formResponse';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ app: 'Sakhi', status: 'ok', timestamp: new Date().toISOString() });
  });

  // Submit Form 1: Details (Id no., Full Name, DOB, E-mail, Mobile, PIN)
  app.post('/api/submit-details', async (req, res) => {
    try {
      const { idNo, fullName, dob, email, mobile, pin } = req.body;
      const params = new URLSearchParams();
      if (idNo !== undefined && idNo !== null) params.append('entry.1419613782', String(idNo));
      if (fullName) params.append('entry.2070462998', fullName);
      if (dob) params.append('entry.416279133', dob);
      if (email) params.append('entry.2017269109', email);
      if (mobile) params.append('entry.301913594', mobile);
      if (pin) params.append('entry.960344203', pin);

      const response = await fetch(FORM_1_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      console.log(`[Sakhi Form 1] ID: ${idNo}, Name: ${fullName}, Status: ${response.status}`);
      res.json({
        success: response.status >= 200 && response.status < 400,
        status: response.status,
        idNo,
        message: 'Details successfully submitted to Google Form 1',
      });
    } catch (err: any) {
      console.error('[Sakhi Form 1 error]:', err);
      res.status(500).json({ success: false, error: err?.message || 'Failed to submit Form 1' });
    }
  });

  // Submit Form 2: Basic Details (Id no., Blood Group, Height, Weight, Allergy)
  app.post('/api/submit-basic-details', async (req, res) => {
    try {
      const { idNo, bloodGroup, height, weight, allergy } = req.body;
      const params = new URLSearchParams();
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

      console.log(`[Sakhi Form 2] Linked ID: ${idNo}, Status: ${response.status}`);
      res.json({
        success: response.status >= 200 && response.status < 400,
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
