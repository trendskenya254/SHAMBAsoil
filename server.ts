import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { runSoilAssessment } from './server/ai.js';
import { KENYA_COUNTIES } from './server/seedData.js';

const PORT = 3000;

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  userProfile?: any;
}

// Authentication Middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const userSession = db.getUserByToken(token);
  if (!userSession) {
    res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    return;
  }

  req.userId = userSession.user.id;
  req.userRole = userSession.profile.role;
  req.userProfile = userSession.profile;
  next();
}

// Optional Auth (for public or authenticated routes)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const userSession = db.getUserByToken(token);
    if (userSession) {
      req.userId = userSession.user.id;
      req.userRole = userSession.profile.role;
      req.userProfile = userSession.profile;
    }
  }
  next();
}

// Admin only middleware
function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'system_admin') {
    res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
}

async function startServer() {
  const app = express();

  // Allow larger payloads for compressed soil images
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Maintenance mode check
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && !req.path.startsWith('/api/auth') && !req.path.startsWith('/api/admin') && !req.path.startsWith('/api/health')) {
      const settings = db.getSystemSettings();
      if (settings.maintenance_mode) {
        res.status(503).json({
          error: 'ShambaSoil is undergoing scheduled maintenance. Please try again shortly.',
          maintenance: true
        });
        return;
      }
    }
    next();
  });

  // ==================== API ROUTES ====================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ShambaSoil Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Reference data
  app.get('/api/reference/counties', (req, res) => {
    res.json(KENYA_COUNTIES);
  });

  app.get('/api/crops', (req, res) => {
    res.json(db.getCrops());
  });

  app.get('/api/crops/:id', (req, res) => {
    const crop = db.getCropById(req.params.id);
    if (!crop) {
      res.status(404).json({ error: 'Crop not found in knowledge base.' });
      return;
    }
    res.json(crop);
  });

  app.get('/api/knowledge-sources', (req, res) => {
    res.json(db.getKnowledgeSources());
  });

  // --- AUTHENTICATION ---
  app.post('/api/auth/register', (req, res) => {
    try {
      const { email, phone, password, full_name, county, sub_county, ward, language, role } = req.body;
      if (!phone || !password || !full_name || !county || !sub_county) {
        res.status(400).json({ error: 'Please enter your Full Name, Phone Number, Password, County, and Sub-County.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }

      const result = db.createUser({
        email: email ? email.trim() : undefined,
        phone,
        password,
        full_name,
        county,
        sub_county,
        ward,
        language: language === 'sw' ? 'sw' : 'en',
        role: role || 'farmer'
      });

      // Send initial welcome notification
      db.createNotification(
        result.user.id,
        'system',
        'Karibu ShambaSoil!',
        'Welcome to ShambaSoil. Register your first farm to begin understanding your soil conditions.',
        '/farms/new'
      );

      res.status(201).json({
        token: result.token,
        profile: result.profile
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        res.status(400).json({ error: 'Please enter your email or phone number, and password.' });
        return;
      }

      const result = db.authenticateUser(identifier, password);
      res.json({
        token: result.token,
        profile: result.profile
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid credentials.' });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
    const token = req.headers.authorization!.split(' ')[1];
    db.logout(token);
    res.json({ message: 'Signed out successfully.' });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ profile: req.userProfile });
  });

  app.patch('/api/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateProfile(req.userId!, req.body);
      res.json({ profile: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/auth/account', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      db.deleteUserAccount(req.userId!);
      res.json({ message: 'Account and all associated farm records have been permanently deleted.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FARMS ---
  app.get('/api/farms', requireAuth, (req: AuthenticatedRequest, res) => {
    const farms = db.getFarmsForUser(req.userId!, req.userRole as any);
    res.json(farms);
  });

  app.post('/api/farms', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { name, county, sub_county, ward, approximate_location, area, area_unit, soil_type, current_crop, previous_crop, irrigation_status, irrigation_type, farm_notes } = req.body;
      if (!name || !county || !sub_county || area === undefined) {
        res.status(400).json({ error: 'Farm name, county, sub-county, and farm size are required.' });
        return;
      }

      const farm = db.createFarm(req.userId!, {
        name,
        county,
        sub_county,
        ward: ward || '',
        approximate_location: approximate_location || `${ward || sub_county}, ${county}`,
        area: Number(area),
        area_unit: area_unit === 'hectares' ? 'hectares' : 'acres',
        soil_type,
        current_crop,
        previous_crop,
        irrigation_status: irrigation_status || 'rain_fed',
        irrigation_type: irrigation_type || 'none',
        farm_notes
      });

      res.status(201).json(farm);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/farms/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const farm = db.getFarmById(req.params.id, req.userId!, req.userRole as any);
    if (!farm) {
      res.status(404).json({ error: 'Farm not found or access unauthorized.' });
      return;
    }
    const analyses = db.getAnalysesForUser(req.userId!, farm.id, req.userRole as any);
    const labResults = db.getLabResultsForFarm(farm.id, req.userId!);
    const events = db.getFarmEvents(req.userId!, farm.id);

    res.json({
      farm,
      analyses,
      labResults,
      events
    });
  });

  app.patch('/api/farms/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateFarm(req.params.id, req.userId!, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/farms/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      db.deleteFarm(req.params.id, req.userId!);
      res.json({ message: 'Farm and associated analyses deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- SOIL ANALYSES ---
  app.get('/api/soil-analysis', requireAuth, (req: AuthenticatedRequest, res) => {
    const farmId = req.query.farm_id as string | undefined;
    const analyses = db.getAnalysesForUser(req.userId!, farmId, req.userRole as any);
    res.json(analyses);
  });

  app.get('/api/soil-analysis/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const analysis = db.getAnalysisById(req.params.id, req.userId!, req.userRole as any);
    if (!analysis) {
      res.status(404).json({ error: 'Soil analysis record not found or access unauthorized.' });
      return;
    }
    const farm = db.getFarmById(analysis.farm_id, req.userId!, req.userRole as any);
    const labResults = db.getLabResultsForFarm(analysis.farm_id, req.userId!);

    res.json({
      analysis,
      farm,
      labResults
    });
  });

  app.post('/api/soil-analysis', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { farm_id, observations, images } = req.body;
      if (!farm_id) {
        res.status(400).json({ error: 'Farm selection is required.' });
        return;
      }
      if (!images || images.length === 0) {
        res.status(400).json({ error: 'Please upload at least one clear photograph of your soil.' });
        return;
      }

      const farm = db.getFarmById(farm_id, req.userId!, req.userRole as any);
      if (!farm) {
        res.status(404).json({ error: 'Selected farm not found.' });
        return;
      }

      // Create initial analysis record
      const analysisRecord = db.createSoilAnalysis(req.userId!, farm_id, observations, images);

      // Get any existing verified lab results for this farm
      const labResults = db.getLabResultsForFarm(farm_id, req.userId!);

      // Execute AI pipeline with strict safety guidelines
      const assessmentResult = await runSoilAssessment({
        farm,
        images,
        observations,
        laboratoryResults: labResults
      });

      // Update analysis record in database
      const completedAnalysis = db.updateSoilAnalysisResult(
        analysisRecord.id,
        assessmentResult.analysis,
        assessmentResult.confidence,
        'COMPLETED'
      );

      // Trigger notification
      db.createNotification(
        req.userId!,
        'system',
        'Soil Assessment Ready',
        `Visual soil assessment for ${farm.name} has completed. Tap to view findings and crop guidance.`,
        `/soil-analyses/${completedAnalysis.id}`
      );

      res.status(201).json(completedAnalysis);
    } catch (err: any) {
      console.error('Soil analysis error:', err);
      res.status(500).json({
        error: err.message || 'We couldn\'t complete the soil assessment. Please check lighting and try again.'
      });
    }
  });

  app.delete('/api/soil-analysis/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      db.deleteAnalysis(req.params.id, req.userId!);
      res.json({ message: 'Analysis and stored images deleted successfully.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- LABORATORY RESULTS ---
  app.get('/api/lab-results', requireAuth, (req: AuthenticatedRequest, res) => {
    const farmId = req.query.farm_id as string;
    if (!farmId) {
      res.status(400).json({ error: 'farm_id parameter is required.' });
      return;
    }
    const results = db.getLabResultsForFarm(farmId, req.userId!);
    res.json(results);
  });

  app.post('/api/lab-results', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { farm_id, laboratory_name, test_date, ph, nitrogen, phosphorus, potassium, organic_carbon, ec, calcium, magnesium, sulfur, document_path, notes } = req.body;
      if (!farm_id || !laboratory_name || !test_date) {
        res.status(400).json({ error: 'Farm, laboratory name, and test date are required.' });
        return;
      }

      const labResult = db.createLabResult(req.userId!, farm_id, {
        farm_id,
        laboratory_name,
        test_date,
        ph: ph !== undefined && ph !== '' ? Number(ph) : undefined,
        nitrogen: nitrogen !== undefined && nitrogen !== '' ? Number(nitrogen) : undefined,
        phosphorus: phosphorus !== undefined && phosphorus !== '' ? Number(phosphorus) : undefined,
        potassium: potassium !== undefined && potassium !== '' ? Number(potassium) : undefined,
        organic_carbon: organic_carbon !== undefined && organic_carbon !== '' ? Number(organic_carbon) : undefined,
        ec: ec !== undefined && ec !== '' ? Number(ec) : undefined,
        calcium: calcium !== undefined && calcium !== '' ? Number(calcium) : undefined,
        magnesium: magnesium !== undefined && magnesium !== '' ? Number(magnesium) : undefined,
        sulfur: sulfur !== undefined && sulfur !== '' ? Number(sulfur) : undefined,
        document_path,
        notes
      });

      res.status(201).json(labResult);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- FARM JOURNAL EVENTS ---
  app.get('/api/farm-events', requireAuth, (req: AuthenticatedRequest, res) => {
    const farmId = req.query.farm_id as string | undefined;
    const events = db.getFarmEvents(req.userId!, farmId);
    res.json(events);
  });

  app.post('/api/farm-events', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { farm_id, event_type, event_date, notes, metadata } = req.body;
      if (!farm_id || !event_type || !event_date) {
        res.status(400).json({ error: 'Farm, event type, and date are required.' });
        return;
      }

      const event = db.createFarmEvent(req.userId!, farm_id, {
        farm_id,
        event_type,
        event_date,
        notes: notes || '',
        metadata
      });

      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- EXPERT REVIEWS ---
  app.get('/api/expert-reviews', requireAuth, (req: AuthenticatedRequest, res) => {
    const reviews = db.getExpertReviewsForUser(req.userId!, req.userRole as any);
    res.json(reviews);
  });

  app.post('/api/expert-reviews', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { analysis_id, farm_id, question, crop_intended } = req.body;
      if (!analysis_id || !farm_id || !question) {
        res.status(400).json({ error: 'Analysis ID, farm, and your question are required.' });
        return;
      }

      const review = db.createExpertReview(
        req.userId!,
        req.userProfile.full_name,
        analysis_id,
        farm_id,
        question,
        crop_intended || 'General'
      );

      res.status(201).json(review);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/expert-reviews/:id/respond', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      if (req.userRole !== 'agronomist' && req.userRole !== 'extension_officer' && req.userRole !== 'system_admin') {
        res.status(403).json({ error: 'Only certified agronomists or extension officers can submit professional reviews.' });
        return;
      }

      const { summary, agronomic_recommendations, fertilizer_opinion, soil_health_assessment, follow_up_advice } = req.body;
      const updated = db.respondToExpertReview(req.params.id, req.userId!, req.userProfile.full_name, {
        summary,
        agronomic_recommendations: agronomic_recommendations || [],
        fertilizer_opinion: fertilizer_opinion || '',
        soil_health_assessment: soil_health_assessment || '',
        follow_up_advice: follow_up_advice || '',
        reviewed_at: new Date().toISOString()
      });

      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- M-PESA PAYMENTS ---
  app.post('/api/payments/initiate-stk', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { amount, phone_number, product, metadata } = req.body;
      if (!amount || !phone_number || !product) {
        res.status(400).json({ error: 'Amount, phone number, and service product are required.' });
        return;
      }

      // Real payment record initiated
      const transaction = db.initiatePayment(req.userId!, Number(amount), phone_number, product, metadata);

      // Server-side response returning CheckoutRequestID and status
      res.status(201).json({
        message: `M-Pesa payment initiated for phone ${phone_number}. Please check your phone for the PIN prompt.`,
        transaction
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Server-side payment callback (M-Pesa Webhook)
  app.post('/api/payments/callback', (req, res) => {
    try {
      const { transaction_id, receipt_number, status } = req.body;
      if (!transaction_id) {
        res.status(400).json({ error: 'transaction_id required.' });
        return;
      }

      const confirmed = db.confirmPayment(
        transaction_id,
        receipt_number || ('QGH' + Math.floor(10000000 + Math.random() * 90000000)),
        status === 'failed' ? 'failed' : 'successful'
      );

      res.json({ result: 'Callback processed successfully', confirmed });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get('/api/payments', requireAuth, (req: AuthenticatedRequest, res) => {
    const list = db.getPaymentsForUser(req.userId!, req.userRole as any);
    res.json(list);
  });

  // --- NOTIFICATIONS ---
  app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
    const list = db.getNotifications(req.userId!);
    res.json(list);
  });

  app.patch('/api/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
    db.markNotificationAsRead(req.params.id, req.userId!);
    res.json({ success: true });
  });

  // --- FEEDBACK ---
  app.post('/api/feedback', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { analysis_id, rating, comment, missing_info } = req.body;
      if (!analysis_id || !rating) {
        res.status(400).json({ error: 'Analysis ID and rating are required.' });
        return;
      }
      const fb = db.createFeedback(req.userId!, analysis_id, rating, comment, missing_info);
      res.status(201).json(fb);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- ADMIN ENDPOINTS ---
  app.get('/api/admin/metrics', requireAuth, requireAdmin, (req, res) => {
    const metrics = db.getAdminMetrics();
    res.json(metrics);
  });

  app.get('/api/admin/audit-logs', requireAuth, requireAdmin, (req, res) => {
    const logs = db.getAuditLogs(150);
    res.json(logs);
  });

  app.get('/api/admin/settings', requireAuth, requireAdmin, (req, res) => {
    res.json(db.getSystemSettings());
  });

  app.patch('/api/admin/settings', requireAuth, requireAdmin, (req, res) => {
    try {
      const updated = db.updateSystemSettings(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ==================== VITE & STATIC SERVING ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShambaSoil server running on http://localhost:${PORT}`);
  });
}

startServer();
