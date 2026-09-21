import {
  Farm,
  SoilAnalysis,
  SoilTestResult,
  Crop,
  FarmEvent,
  PaymentTransaction,
  ExpertReview,
  NotificationItem,
  KnowledgeSource,
  SystemSettings,
  UserProfile
} from '../types.js';

const TOKEN_KEY = 'shambasoil_auth_token';
const OFFLINE_QUEUE_KEY = 'shambasoil_offline_queue';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Low-bandwidth Image Compression using HTML5 Canvas
export async function compressImage(fileOrDataUrl: File | string, maxDimension = 1024, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

// Base Fetch Helper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Server request failed');
    }
    return data as T;
  } catch (err: any) {
    // If offline or network error, queue if mutative
    if (!navigator.onLine && options.method && options.method !== 'GET') {
      queueOfflineAction(endpoint, options);
      throw new Error('You are currently offline. This action has been saved to your phone and will synchronize when you reconnect.');
    }
    throw err;
  }
}

// Offline Action Queue
interface QueuedAction {
  id: string;
  endpoint: string;
  options: RequestInit;
  timestamp: string;
}

function queueOfflineAction(endpoint: string, options: RequestInit) {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: QueuedAction[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: 'queue_' + Date.now(),
      endpoint,
      options,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to queue offline action:', e);
  }
}

export async function flushOfflineQueue(): Promise<number> {
  if (!navigator.onLine) return 0;
  const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
  if (!raw) return 0;

  try {
    const queue: QueuedAction[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    let synced = 0;
    const remaining: QueuedAction[] = [];

    for (const item of queue) {
      try {
        await apiFetch(item.endpoint, item.options);
        synced++;
      } catch (e) {
        remaining.push(item);
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return synced;
  } catch (e) {
    console.error('Error flushing offline queue:', e);
    return 0;
  }
}

// ==================== API CLIENT ====================
export const api = {
  // Reference
  getCounties: () => apiFetch<any[]>('/api/reference/counties'),
  getCrops: () => apiFetch<Crop[]>('/api/crops'),
  getCropById: (id: string) => apiFetch<Crop>(`/api/crops/${id}`),
  getKnowledgeSources: () => apiFetch<KnowledgeSource[]>('/api/knowledge-sources'),

  // Auth
  register: (data: any) => apiFetch<{ token: string; profile: UserProfile }>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => apiFetch<{ token: string; profile: UserProfile }>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch<{ message: string }>('/api/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch<{ profile: UserProfile }>('/api/auth/me'),
  updateProfile: (data: Partial<UserProfile>) => apiFetch<{ profile: UserProfile }>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: () => apiFetch<{ message: string }>('/api/auth/account', { method: 'DELETE' }),

  // Farms
  getFarms: () => apiFetch<Farm[]>('/api/farms'),
  getFarmById: (id: string) => apiFetch<{ farm: Farm; analyses: SoilAnalysis[]; labResults: SoilTestResult[]; events: FarmEvent[] }>(`/api/farms/${id}`),
  createFarm: (data: any) => apiFetch<Farm>('/api/farms', { method: 'POST', body: JSON.stringify(data) }),
  updateFarm: (id: string, data: any) => apiFetch<Farm>(`/api/farms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFarm: (id: string) => apiFetch<{ message: string }>(`/api/farms/${id}`, { method: 'DELETE' }),

  // Soil Analyses
  getSoilAnalyses: (farmId?: string) => apiFetch<SoilAnalysis[]>(farmId ? `/api/soil-analysis?farm_id=${farmId}` : '/api/soil-analysis'),
  getSoilAnalysisById: (id: string) => apiFetch<{ analysis: SoilAnalysis; farm: Farm; labResults: SoilTestResult[] }>(`/api/soil-analysis/${id}`),
  createSoilAnalysis: (data: { farm_id: string; observations: any; images: { dataUrl: string; position_type: string }[] }) =>
    apiFetch<SoilAnalysis>('/api/soil-analysis', { method: 'POST', body: JSON.stringify(data) }),
  deleteSoilAnalysis: (id: string) => apiFetch<{ message: string }>(`/api/soil-analysis/${id}`, { method: 'DELETE' }),

  // Laboratory Results
  getLabResults: (farmId: string) => apiFetch<SoilTestResult[]>(`/api/lab-results?farm_id=${farmId}`),
  createLabResult: (data: any) => apiFetch<SoilTestResult>('/api/lab-results', { method: 'POST', body: JSON.stringify(data) }),

  // Farm Events
  getFarmEvents: (farmId?: string) => apiFetch<FarmEvent[]>(farmId ? `/api/farm-events?farm_id=${farmId}` : '/api/farm-events'),
  createFarmEvent: (data: any) => apiFetch<FarmEvent>('/api/farm-events', { method: 'POST', body: JSON.stringify(data) }),

  // User Profile
  flushOfflineQueue: () => flushOfflineQueue(),

  // Expert Reviews
  getExpertReviews: () => apiFetch<ExpertReview[]>('/api/expert-reviews'),
  createExpertReview: (data: any) => apiFetch<ExpertReview>('/api/expert-reviews', { method: 'POST', body: JSON.stringify(data) }),
  requestExpertReview: (data: any) => apiFetch<ExpertReview>('/api/expert-reviews', { method: 'POST', body: JSON.stringify(data) }),
  respondToReview: (id: string, data: any) => apiFetch<ExpertReview>(`/api/expert-reviews/${id}/respond`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Payments (M-Pesa)
  initiateMpesaPayment: (data: { amount: number; phone_number: string; product: string; metadata?: any }) =>
    apiFetch<{ message: string; transaction: PaymentTransaction }>('/api/payments/initiate-stk', { method: 'POST', body: JSON.stringify(data) }),
  simulateCallback: (data: { transaction_id: string; receipt_number?: string; status: string }) =>
    apiFetch<any>('/api/payments/callback', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: () => apiFetch<PaymentTransaction[]>('/api/payments'),

  // Notifications
  getNotifications: () => apiFetch<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: string) => apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  // Feedback
  submitFeedback: (data: { analysis_id: string; rating: string; comment?: string; missing_info?: string }) =>
    apiFetch<any>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminMetrics: () => apiFetch<any>('/api/admin/metrics'),
  getAdminAuditLogs: () => apiFetch<any[]>('/api/admin/audit-logs'),
  getAdminSettings: () => apiFetch<SystemSettings>('/api/admin/settings'),
  updateAdminSettings: (data: Partial<SystemSettings>) => apiFetch<SystemSettings>('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(data) })
};
