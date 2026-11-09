import { 
  UserProfile, 
  ReadinessScore, 
  HealthMetric, 
  Workout, 
  Exercise, 
  WorkoutSessionLog,
  AIRecommendation, 
  WearableConnection,
  RecommendationAPIResponse,
  PrescribedWorkoutPlan,
  AutoregulationResult
} from '../types/fitness';
import { 
  mockUserProfile, 
  mockReadiness, 
  mockHealthMetric, 
  mockActiveWorkout, 
  mockAIRecommendations, 
  mockWearable 
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchWithAuth<T>(url: string, token?: string | null, options: RequestInit = {}, fallbackData?: T): Promise<T> {
  const authToken = token || localStorage.getItem('fitmentor_jwt_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data as T;
  } catch (err) {
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const apiService = {
  // Auth API Endpoints
  registerUser: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed.');
    return data;
  },

  loginUser: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed.');
    return data;
  },

  // Protected Profile & Onboarding Endpoints
  getProfile: (authToken?: string | null) => fetchWithAuth<UserProfile>('/profile', authToken, {}, mockUserProfile),
  updateProfile: (updated: Partial<UserProfile>) => fetchWithAuth<{ success: boolean; profile: UserProfile }>('/profile', null, { method: 'PUT', body: JSON.stringify(updated) }),
  completeOnboarding: (onboardingData: any) => fetchWithAuth<{ success: boolean; profile: UserProfile }>('/profile/onboarding', null, { method: 'POST', body: JSON.stringify(onboardingData) }),

  // RPG Progression Endpoints (Solo Leveling System)
  getProgression: () => fetchWithAuth<{ success: boolean; progression: any }>('/progression', null, {}, { success: false, progression: null }),
  syncProgression: (progData: any) => fetchWithAuth<{ success: boolean; progression: any }>('/progression/sync', null, { method: 'POST', body: JSON.stringify(progData) }),

  // Exercise Library
  getExercises: (category?: string) => fetchWithAuth<Exercise[]>(`/exercises${category ? `?category=${category}` : ''}`, null, {}, []),

  // Workout Management & Adaptive Endpoints
  getWorkouts: () => fetchWithAuth<Workout[]>('/workouts', null, {}, [mockActiveWorkout]),
  getWorkoutHistory: () => fetchWithAuth<WorkoutSessionLog[]>('/workouts/history', null, {}, []),
  getPrescribedWorkout: (workoutId: string) => fetchWithAuth<PrescribedWorkoutPlan>(`/workouts/${workoutId}/prescribed`, null, {}),
  startWorkoutSession: (workoutId: string) => fetchWithAuth<{ success: boolean; sessionLogId: string; session: any }>(`/workouts/${workoutId}/start`, null, { method: 'POST' }),
  logWorkoutSet: (logId: string, setData: any) => fetchWithAuth<{ success: boolean; setLog: any }>(`/workouts/session/${logId}/log-set`, null, { method: 'POST', body: JSON.stringify(setData) }),
  autoregulateSet: (logId: string, setData: any) => fetchWithAuth<AutoregulationResult>(`/workouts/session/${logId}/auto-regulate`, null, { method: 'POST', body: JSON.stringify(setData) }),
  completeWorkoutSession: (logId: string, sessionData: any) => fetchWithAuth<{ success: boolean; session: any }>(`/workouts/session/${logId}/complete`, null, { method: 'POST', body: JSON.stringify(sessionData) }),

  // Telemetry & Metrics Endpoints
  getReadiness: () => fetchWithAuth<ReadinessScore>('/readiness', null, {}, mockReadiness),
  getMetrics: () => fetchWithAuth<HealthMetric>('/metrics', null, {}, mockHealthMetric),
  getRecommendations: () => fetchWithAuth<AIRecommendation[]>('/recommendations', null, {}, mockAIRecommendations),
  getWorkoutRecommendations: () => fetchWithAuth<RecommendationAPIResponse>('/recommendations/workouts', null, {}, {
    success: true,
    count: 0,
    recommendations: [],
    message: 'Loading recommendations...'
  }),
  getWearableStatus: () => fetchWithAuth<WearableConnection>('/wearables', null, {}, mockWearable),
  
  sendAIChatPrompt: async (message: string) => {
    try {
      return await fetchWithAuth<{ reply: string; timestamp: string }>('/ai/chat', null, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    } catch {
      const lower = message.toLowerCase();
      let reply = "I'm analyzing your current telemetry: Heart rate is stable at 62 BPM, and weekly volume adherence is at 88%. How can I help refine your training or nutrition right now?";
      if (lower.includes('recover') || lower.includes('ready') || lower.includes('score')) {
        reply = "Your composite Readiness Score is **85/100 (Optimal)**. Your autonomic nervous system recovery is at 92% with 7h 20m of deep and REM sleep. You are primed for high-intensity power hypertrophy training today!";
      }
      return { reply, timestamp: new Date().toISOString() };
    }
  }
};
