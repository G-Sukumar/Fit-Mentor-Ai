import { UserProfile, ReadinessScore, HealthMetric } from '../types/fitness';

export const mockUserProfile: UserProfile = {
  id: 'u_sukumar_01',
  email: 'sukumar@fitmentor.ai',
  fullName: 'Sukumar',
  fitnessLevel: 'ADVANCED',
  primaryGoal: 'HYPERTROPHY',
  targetCalories: 2400,
  createdAt: '2026-01-15T00:00:00Z',
  age: 26,
  heightCm: 178,
  weightKg: 78,
  bodyFatPercentage: 14.5,
  activityLevel: 'MODERATELY_ACTIVE',
  workoutLocation: 'GYM',
  availableEquipment: 'FULL_GYM',
  preferredDurationMin: 60,
  trainingDaysPerWeek: 4,
  wearableDevice: 'Galaxy Watch 6',
  streakDays: 7,
  onboardingCompleted: true
};

export const mockReadiness: ReadinessScore = {
  score: 85,
  status: 'Optimal',
  recoveryScore: 92,
  sleepScore: 88,
  activityScore: 84,
  trainingLoadScore: 79,
  aiBriefing: 'Your autonomic nervous system recovery is high (92%). You are in prime condition for high-volume progressive overload training today.'
};

export const mockHealthMetric: HealthMetric = {
  date: '2026-08-31',
  steps: { current: 12400, goal: 10000, deltaPercent: 24 },
  activeCalories: { current: 2100, goal: 2400, deltaPercent: -12.5 },
  sleep: { durationMinutes: 440, durationFormatted: '7h 20m', qualityScore: 88 },
  restingHr: { bpm: 62, status: 'Stable' }
};
