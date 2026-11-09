import { UserProfile, ReadinessScore, HealthMetric, Workout, AIRecommendation, WearableConnection } from '../types/fitness';

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
  aiBriefing: 'Your autonomic nervous system recovery is high (92%). You are in prime condition for high-volume progressive overload or heavy compound lifts today.'
};

export const mockHealthMetric: HealthMetric = {
  date: '2026-08-31',
  steps: { current: 12400, goal: 10000, deltaPercent: 24 },
  activeCalories: { current: 2100, goal: 2400, deltaPercent: -12.5 },
  sleep: { durationMinutes: 440, durationFormatted: '7h 20m', qualityScore: 88 },
  restingHr: { bpm: 62, status: 'Stable' }
};

export const mockActiveWorkout: Workout = {
  id: 'w0000000-0000-0000-0000-000000000001',
  title: 'Power Hypertrophy Routine',
  category: 'Upper Body Strength',
  durationEstMin: 60,
  difficulty: 'ADVANCED',
  progressPercent: 45,
  exercises: [
    { id: 'e1', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 6, restSeconds: 120, instructionCues: ['Retract scapula', 'Keep feet planted'] },
    { id: 'e2', name: 'Incline Dumbbell Row', category: 'Back', targetMuscle: 'Latissimus Dorsi', equipment: 'DUMBBELLS', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 8, restSeconds: 90, instructionCues: ['Pull with elbows', 'Squeeze at top'] },
    { id: 'e3', name: 'Overhead Barbell Press', category: 'Shoulders', targetMuscle: 'Deltoids', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 8, restSeconds: 90, instructionCues: ['Keep core braced', 'Elbows tucked ~45°'] }
  ]
};

export const mockWearable: WearableConnection = {
  deviceId: 'dev_gw6_981',
  deviceName: 'Galaxy Watch 6',
  connected: true,
  lastSyncedAt: '2 minutes ago',
  batteryLevelPercent: 82
};

export const mockAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec_01',
    timestamp: '10 mins ago',
    category: 'RECOVERY',
    title: 'Optimal Recovery Window',
    description: 'HRV baseline increased by +8ms. Recommend adding 1 additional working set to compound movements.',
    suggestedActions: ['Increase Bench Press load by +2.5kg', 'Maintain 90s rest periods']
  },
  {
    id: 'rec_02',
    timestamp: '1 hour ago',
    category: 'NUTRITION',
    title: 'Post-Workout Macro Alignment',
    description: 'You require 48g of protein and 65g carbs to maximize muscular protein synthesis before 7:00 PM.',
    suggestedActions: ['Log 200g Grilled Salmon with Quinoa', 'Add Hydration Electrolyte Pack']
  }
];
