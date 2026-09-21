import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  Farm,
  SoilAnalysis,
  SoilImage,
  VisualObservation,
  SoilTestResult,
  Crop,
  FarmEvent,
  PaymentTransaction,
  ExpertReview,
  NotificationItem,
  KnowledgeSource,
  SystemSettings
} from '../src/types.js';
import { GENUINE_CROPS, GENUINE_KNOWLEDGE_SOURCES } from './seedData.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'shambasoil_db.json');

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  salt: string;
  created_at: string;
}

export interface SessionToken {
  token: string;
  user_id: string;
  expires_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  metadata?: any;
  created_at: string;
}

export interface FeedbackRecord {
  id: string;
  user_id: string;
  analysis_id: string;
  rating: 'useful' | 'partly' | 'not_useful';
  comment?: string;
  missing_info?: string;
  created_at: string;
}

export interface DatabaseSchema {
  auth_users: AuthUser[];
  sessions: SessionToken[];
  profiles: UserProfile[];
  farms: Farm[];
  soil_analyses: SoilAnalysis[];
  soil_images: SoilImage[];
  visual_observations: VisualObservation[];
  soil_test_results: SoilTestResult[];
  crops: Crop[];
  farm_events: FarmEvent[];
  payments: PaymentTransaction[];
  expert_reviews: ExpertReview[];
  notifications: NotificationItem[];
  knowledge_sources: KnowledgeSource[];
  feedback: FeedbackRecord[];
  audit_logs: AuditLog[];
  system_settings: SystemSettings;
}

class DatabaseService {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure crops and knowledge sources are present and up to date
        if (!parsed.crops || parsed.crops.length === 0) {
          parsed.crops = GENUINE_CROPS;
        }
        if (!parsed.knowledge_sources || parsed.knowledge_sources.length === 0) {
          parsed.knowledge_sources = GENUINE_KNOWLEDGE_SOURCES;
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing clean database:', err);
    }

    const initialDb: DatabaseSchema = {
      auth_users: [],
      sessions: [],
      profiles: [],
      farms: [],
      soil_analyses: [],
      soil_images: [],
      visual_observations: [],
      soil_test_results: [],
      crops: GENUINE_CROPS,
      farm_events: [],
      payments: [],
      expert_reviews: [],
      notifications: [],
      knowledge_sources: GENUINE_KNOWLEDGE_SOURCES,
      feedback: [],
      audit_logs: [],
      system_settings: {
        ai_model: 'gemini-3.8-flash',
        prompt_version: 'shambasoil-v1.2-safeguard',
        maintenance_mode: false,
        free_analysis_limit: 10,
        mpesa_paybill: '522522',
        mpesa_till: '987654'
      }
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write initial DB file:', e);
    }

    return initialDb;
  }

  private persist() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist database:', err);
      }
    }, 100);
  }

  // --- Auth & User Management ---
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const s = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
    return { hash, salt: s };
  }

  createUser(params: {
    email: string;
    phone: string;
    password: string;
    full_name: string;
    county: string;
    sub_county: string;
    ward?: string;
    language?: 'en' | 'sw';
    role?: UserProfile['role'];
  }): { user: AuthUser; profile: UserProfile; token: string } {
    const normalizedEmail = params.email.trim().toLowerCase();
    const normalizedPhone = params.phone.trim();

    // Check uniqueness
    const existing = this.data.auth_users.find(
      u => u.email.toLowerCase() === normalizedEmail || u.phone === normalizedPhone
    );
    if (existing) {
      throw new Error('An account with this email or phone number already exists.');
    }

    const { hash, salt } = this.hashPassword(params.password);
    const userId = 'usr_' + crypto.randomUUID();
    const now = new Date().toISOString();

    const user: AuthUser = {
      id: userId,
      email: normalizedEmail,
      phone: normalizedPhone,
      password_hash: hash,
      salt,
      created_at: now
    };

    const profile: UserProfile = {
      id: 'prof_' + crypto.randomUUID(),
      auth_user_id: userId,
      full_name: params.full_name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      county: params.county.trim(),
      sub_county: params.sub_county.trim(),
      ward: params.ward?.trim() || '',
      language: params.language || 'en',
      role: params.role || 'farmer',
      farming_scale: 'smallholder',
      created_at: now,
      updated_at: now
    };

    const token = crypto.randomBytes(32).toString('hex');
    const session: SessionToken = {
      token,
      user_id: userId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.data.auth_users.push(user);
    this.data.profiles.push(profile);
    this.data.sessions.push(session);

    this.logAudit({
      user_id: userId,
      action: 'USER_REGISTERED',
      resource: 'auth_users',
      resource_id: userId,
      metadata: { role: profile.role, county: profile.county }
    });

    this.persist();
    return { user, profile, token };
  }

  authenticateUser(identifier: string, password: string): { user: AuthUser; profile: UserProfile; token: string } {
    const idClean = identifier.trim().toLowerCase();
    const user = this.data.auth_users.find(
      u => u.email.toLowerCase() === idClean || u.phone.replace(/[\s\-\+]/g, '') === idClean.replace(/[\s\-\+]/g, '')
    );

    if (!user) {
      throw new Error('Invalid email/phone or password.');
    }

    const { hash } = this.hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
      throw new Error('Invalid email/phone or password.');
    }

    const profile = this.data.profiles.find(p => p.auth_user_id === user.id);
    if (!profile) {
      throw new Error('User profile record not found.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const session: SessionToken = {
      token,
      user_id: user.id,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    this.data.sessions.push(session);
    this.logAudit({
      user_id: user.id,
      action: 'USER_LOGIN',
      resource: 'auth_users',
      resource_id: user.id
    });

    this.persist();
    return { user, profile, token };
  }

  getUserByToken(token: string): { user: AuthUser; profile: UserProfile } | null {
    if (!token) return null;
    const session = this.data.sessions.find(
      s => s.token === token && new Date(s.expires_at) > new Date()
    );
    if (!session) return null;

    const user = this.data.auth_users.find(u => u.id === session.user_id);
    if (!user) return null;

    const profile = this.data.profiles.find(p => p.auth_user_id === user.id);
    if (!profile) return null;

    return { user, profile };
  }

  logout(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const idx = this.data.profiles.findIndex(p => p.auth_user_id === userId);
    if (idx === -1) throw new Error('Profile not found.');

    // Protect against non-admin role escalation
    const current = this.data.profiles[idx];
    const updated: UserProfile = {
      ...current,
      ...updates,
      id: current.id,
      auth_user_id: current.auth_user_id,
      role: updates.role && current.role === 'system_admin' ? updates.role : current.role, // role change only if admin
      updated_at: new Date().toISOString()
    };

    this.data.profiles[idx] = updated;
    this.persist();
    return updated;
  }

  deleteUserAccount(userId: string) {
    // Delete farms, analyses, events, lab results for user
    const userFarms = this.data.farms.filter(f => f.owner_id === userId).map(f => f.id);
    this.data.farms = this.data.farms.filter(f => f.owner_id !== userId);
    this.data.soil_analyses = this.data.soil_analyses.filter(a => a.user_id !== userId);
    this.data.soil_test_results = this.data.soil_test_results.filter(t => !userFarms.includes(t.farm_id));
    this.data.farm_events = this.data.farm_events.filter(e => e.user_id !== userId);
    this.data.notifications = this.data.notifications.filter(n => n.user_id !== userId);
    this.data.sessions = this.data.sessions.filter(s => s.user_id !== userId);
    this.data.profiles = this.data.profiles.filter(p => p.auth_user_id !== userId);
    this.data.auth_users = this.data.auth_users.filter(u => u.id !== userId);

    this.logAudit({
      user_id: userId,
      action: 'USER_ACCOUNT_DELETED',
      resource: 'auth_users',
      resource_id: userId
    });

    this.persist();
  }

  // --- Farm Management ---
  createFarm(ownerId: string, farmData: Omit<Farm, 'id' | 'owner_id' | 'created_at' | 'updated_at'>): Farm {
    const now = new Date().toISOString();
    const farm: Farm = {
      ...farmData,
      id: 'farm_' + crypto.randomUUID(),
      owner_id: ownerId,
      created_at: now,
      updated_at: now
    };

    this.data.farms.push(farm);
    this.logAudit({
      user_id: ownerId,
      action: 'FARM_CREATED',
      resource: 'farms',
      resource_id: farm.id,
      metadata: { name: farm.name, county: farm.county }
    });
    this.persist();
    return farm;
  }

  getFarmsForUser(userId: string, role?: UserProfile['role']): Farm[] {
    if (role === 'system_admin') {
      return this.data.farms;
    }
    return this.data.farms.filter(f => f.owner_id === userId);
  }

  getFarmById(farmId: string, userId: string, role?: UserProfile['role']): Farm | null {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm) return null;
    if (farm.owner_id !== userId && role !== 'system_admin' && role !== 'agronomist' && role !== 'extension_officer') {
      return null;
    }
    return farm;
  }

  updateFarm(farmId: string, userId: string, updates: Partial<Farm>): Farm {
    const idx = this.data.farms.findIndex(f => f.id === farmId);
    if (idx === -1) throw new Error('Farm not found.');
    if (this.data.farms[idx].owner_id !== userId) throw new Error('Unauthorized to modify this farm.');

    const updated: Farm = {
      ...this.data.farms[idx],
      ...updates,
      id: farmId,
      owner_id: userId,
      updated_at: new Date().toISOString()
    };
    this.data.farms[idx] = updated;
    this.persist();
    return updated;
  }

  deleteFarm(farmId: string, userId: string) {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found.');
    if (farm.owner_id !== userId) throw new Error('Unauthorized to delete this farm.');

    this.data.farms = this.data.farms.filter(f => f.id !== farmId);
    this.data.soil_analyses = this.data.soil_analyses.filter(a => a.farm_id !== farmId);
    this.data.soil_test_results = this.data.soil_test_results.filter(t => t.farm_id !== farmId);
    this.data.farm_events = this.data.farm_events.filter(e => e.farm_id !== farmId);

    this.logAudit({
      user_id: userId,
      action: 'FARM_DELETED',
      resource: 'farms',
      resource_id: farmId
    });
    this.persist();
  }

  // --- Soil Analysis Management ---
  createSoilAnalysis(userId: string, farmId: string, observations: any, images: { dataUrl: string; position_type: any }[]): SoilAnalysis {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found.');
    if (farm.owner_id !== userId) throw new Error('Unauthorized.');

    const now = new Date().toISOString();
    const analysisId = 'scan_' + crypto.randomUUID();

    const storedImages: SoilImage[] = images.map((img, idx) => ({
      id: 'img_' + crypto.randomUUID(),
      analysis_id: analysisId,
      storage_path: img.dataUrl,
      position_type: img.position_type || (idx === 0 ? 'surface' : 'close_up'),
      quality_score: 85,
      created_at: now
    }));

    const analysis: SoilAnalysis = {
      id: analysisId,
      farm_id: farmId,
      farm_name: farm.name,
      user_id: userId,
      status: 'PROCESSING',
      analysis_type: 'AI_VISUAL',
      confidence: 'moderate',
      observations,
      images: storedImages,
      created_at: now
    };

    this.data.soil_analyses.push(analysis);
    this.data.soil_images.push(...storedImages);

    this.logAudit({
      user_id: userId,
      action: 'SOIL_SCAN_STARTED',
      resource: 'soil_analyses',
      resource_id: analysisId,
      metadata: { farm_id: farmId, image_count: images.length }
    });

    this.persist();
    return analysis;
  }

  updateSoilAnalysisResult(analysisId: string, aiResult: any, confidence: SoilAnalysis['confidence'], status: SoilAnalysis['status']) {
    const idx = this.data.soil_analyses.findIndex(a => a.id === analysisId);
    if (idx === -1) throw new Error('Analysis not found');

    this.data.soil_analyses[idx].ai_result = aiResult;
    this.data.soil_analyses[idx].confidence = confidence;
    this.data.soil_analyses[idx].status = status;
    this.data.soil_analyses[idx].completed_at = new Date().toISOString();

    this.persist();
    return this.data.soil_analyses[idx];
  }

  getAnalysesForUser(userId: string, farmId?: string, role?: UserProfile['role']): SoilAnalysis[] {
    let list = this.data.soil_analyses;
    if (role !== 'system_admin') {
      list = list.filter(a => a.user_id === userId);
    }
    if (farmId) {
      list = list.filter(a => a.farm_id === farmId);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAnalysisById(analysisId: string, userId: string, role?: UserProfile['role']): SoilAnalysis | null {
    const analysis = this.data.soil_analyses.find(a => a.id === analysisId);
    if (!analysis) return null;
    if (analysis.user_id !== userId && role !== 'system_admin' && role !== 'agronomist' && role !== 'extension_officer') {
      return null;
    }
    return analysis;
  }

  deleteAnalysis(analysisId: string, userId: string) {
    const analysis = this.data.soil_analyses.find(a => a.id === analysisId);
    if (!analysis) throw new Error('Analysis not found.');
    if (analysis.user_id !== userId) throw new Error('Unauthorized.');

    this.data.soil_analyses = this.data.soil_analyses.filter(a => a.id !== analysisId);
    this.data.soil_images = this.data.soil_images.filter(i => i.analysis_id !== analysisId);
    this.data.expert_reviews = this.data.expert_reviews.filter(r => r.analysis_id !== analysisId);
    this.persist();
  }

  // --- Laboratory Results ---
  createLabResult(userId: string, farmId: string, resultData: Omit<SoilTestResult, 'id' | 'created_at' | 'source'>): SoilTestResult {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found.');
    if (farm.owner_id !== userId) throw new Error('Unauthorized.');

    const labResult: SoilTestResult = {
      ...resultData,
      id: 'lab_' + crypto.randomUUID(),
      farm_id: farmId,
      farm_name: farm.name,
      source: 'LABORATORY', // Strictly distinguished from AI_VISUAL
      created_at: new Date().toISOString()
    };

    this.data.soil_test_results.push(labResult);

    this.logAudit({
      user_id: userId,
      action: 'LAB_RESULT_ADDED',
      resource: 'soil_test_results',
      resource_id: labResult.id,
      metadata: { laboratory_name: labResult.laboratory_name, ph: labResult.ph }
    });

    this.persist();
    return labResult;
  }

  getLabResultsForFarm(farmId: string, userId: string): SoilTestResult[] {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm || farm.owner_id !== userId) return [];
    return this.data.soil_test_results.filter(r => r.farm_id === farmId);
  }

  // --- Farm Journal Events ---
  createFarmEvent(userId: string, farmId: string, eventData: Omit<FarmEvent, 'id' | 'user_id' | 'created_at'>): FarmEvent {
    const farm = this.data.farms.find(f => f.id === farmId);
    if (!farm || farm.owner_id !== userId) throw new Error('Unauthorized.');

    const event: FarmEvent = {
      ...eventData,
      id: 'evt_' + crypto.randomUUID(),
      farm_id: farmId,
      farm_name: farm.name,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    this.data.farm_events.push(event);
    this.persist();
    return event;
  }

  getFarmEvents(userId: string, farmId?: string): FarmEvent[] {
    let list = this.data.farm_events.filter(e => e.user_id === userId);
    if (farmId) {
      list = list.filter(e => e.farm_id === farmId);
    }
    return list.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }

  // --- Expert Reviews ---
  createExpertReview(userId: string, farmerName: string, analysisId: string, farmId: string, question: string, cropIntended: string): ExpertReview {
    const review: ExpertReview = {
      id: 'rev_' + crypto.randomUUID(),
      analysis_id: analysisId,
      farm_id: farmId,
      user_id: userId,
      farmer_name: farmerName,
      status: 'pending',
      farmer_question: question,
      crop_intended: cropIntended,
      created_at: new Date().toISOString()
    };

    this.data.expert_reviews.push(review);
    this.persist();
    return review;
  }

  getExpertReviewsForUser(userId: string, role?: UserProfile['role']): ExpertReview[] {
    if (role === 'agronomist' || role === 'extension_officer' || role === 'system_admin') {
      return this.data.expert_reviews;
    }
    return this.data.expert_reviews.filter(r => r.user_id === userId);
  }

  respondToExpertReview(reviewId: string, professionalId: string, professionalName: string, response: ExpertReview['professional_response']) {
    const idx = this.data.expert_reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) throw new Error('Review request not found.');

    this.data.expert_reviews[idx].professional_id = professionalId;
    this.data.expert_reviews[idx].professional_name = professionalName;
    this.data.expert_reviews[idx].status = 'completed';
    this.data.expert_reviews[idx].professional_response = response;
    this.data.expert_reviews[idx].completed_at = new Date().toISOString();

    // Create notification for farmer
    this.createNotification(
      this.data.expert_reviews[idx].user_id,
      'review_completed',
      'Agronomist Review Ready',
      `${professionalName} has reviewed your soil analysis and provided recommendations.`,
      `/soil-analyses/${this.data.expert_reviews[idx].analysis_id}`
    );

    this.persist();
    return this.data.expert_reviews[idx];
  }

  // --- Payments ---
  initiatePayment(userId: string, amount: number, phone: string, product: PaymentTransaction['product'], metadata?: any): PaymentTransaction {
    const txId = 'TX_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const tx: PaymentTransaction = {
      id: txId,
      user_id: userId,
      amount,
      currency: 'KES',
      provider: 'M-PESA',
      provider_reference: 'WS_' + crypto.randomBytes(6).toString('hex').toUpperCase(),
      phone_number: phone,
      status: 'pending',
      product,
      metadata,
      created_at: new Date().toISOString()
    };

    this.data.payments.push(tx);
    this.persist();
    return tx;
  }

  confirmPayment(txId: string, receiptNumber: string, status: PaymentTransaction['status']): PaymentTransaction {
    const idx = this.data.payments.findIndex(p => p.id === txId || p.provider_reference === txId);
    if (idx === -1) throw new Error('Transaction record not found.');

    this.data.payments[idx].status = status;
    this.data.payments[idx].receipt_number = receiptNumber;

    if (status === 'successful') {
      this.createNotification(
        this.data.payments[idx].user_id,
        'system',
        'Payment Confirmed',
        `M-Pesa payment of KES ${this.data.payments[idx].amount} received. Receipt: ${receiptNumber}.`
      );
    }

    this.persist();
    return this.data.payments[idx];
  }

  getPaymentsForUser(userId: string, role?: UserProfile['role']): PaymentTransaction[] {
    if (role === 'system_admin') {
      return this.data.payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return this.data.payments.filter(p => p.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- Notifications ---
  createNotification(userId: string, type: NotificationItem['type'], title: string, body: string, action_url?: string): NotificationItem {
    const item: NotificationItem = {
      id: 'notif_' + crypto.randomUUID(),
      user_id: userId,
      type,
      title,
      body,
      read: false,
      action_url,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(item);
    this.persist();
    return item;
  }

  getNotifications(userId: string): NotificationItem[] {
    return this.data.notifications.filter(n => n.user_id === userId);
  }

  markNotificationAsRead(notifId: string, userId: string) {
    const n = this.data.notifications.find(item => item.id === notifId && item.user_id === userId);
    if (n) {
      n.read = true;
      this.persist();
    }
  }

  // --- Feedback ---
  createFeedback(userId: string, analysisId: string, rating: FeedbackRecord['rating'], comment?: string, missing_info?: string) {
    const fb: FeedbackRecord = {
      id: 'fb_' + crypto.randomUUID(),
      user_id: userId,
      analysis_id: analysisId,
      rating,
      comment,
      missing_info,
      created_at: new Date().toISOString()
    };
    this.data.feedback.push(fb);
    this.persist();
    return fb;
  }

  // --- Audit Logs ---
  logAudit(entry: Omit<AuditLog, 'id' | 'created_at'>) {
    const log: AuditLog = {
      ...entry,
      id: 'log_' + crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    this.data.audit_logs.unshift(log);
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.persist();
  }

  getAuditLogs(limit = 100): AuditLog[] {
    return this.data.audit_logs.slice(0, limit);
  }

  // --- Reference Data ---
  getCrops(): Crop[] {
    return this.data.crops;
  }

  getCropById(id: string): Crop | undefined {
    return this.data.crops.find(c => c.id === id);
  }

  getKnowledgeSources(): KnowledgeSource[] {
    return this.data.knowledge_sources;
  }

  // --- Admin Metrics (REAL METRICS ONLY) ---
  getAdminMetrics() {
    const totalFarmers = this.data.profiles.filter(p => p.role === 'farmer').length;
    const totalActiveUsers = this.data.profiles.length;
    const totalFarms = this.data.farms.length;
    const totalAnalyses = this.data.soil_analyses.length;
    const completedAnalyses = this.data.soil_analyses.filter(a => a.status === 'COMPLETED').length;
    const failedAnalyses = this.data.soil_analyses.filter(a => a.status === 'FAILED').length;
    const totalLabTests = this.data.soil_test_results.length;
    const totalExpertReviews = this.data.expert_reviews.length;
    const successfulPayments = this.data.payments.filter(p => p.status === 'successful');
    const totalRevenueKes = successfulPayments.reduce((acc, p) => acc + p.amount, 0);

    return {
      total_registered_farmers: totalFarmers,
      total_active_users: totalActiveUsers,
      total_farms: totalFarms,
      total_analyses: totalAnalyses,
      completed_analyses: completedAnalyses,
      failed_analyses: failedAnalyses,
      total_lab_tests: totalLabTests,
      total_expert_reviews: totalExpertReviews,
      total_payments_count: this.data.payments.length,
      total_revenue_kes: totalRevenueKes,
      ai_requests_count: completedAnalyses + failedAnalyses,
      maintenance_mode: this.data.system_settings.maintenance_mode
    };
  }

  getSystemSettings(): SystemSettings {
    return this.data.system_settings;
  }

  updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.system_settings = {
      ...this.data.system_settings,
      ...updates
    };
    this.persist();
    return this.data.system_settings;
  }
}

export const db = new DatabaseService();
