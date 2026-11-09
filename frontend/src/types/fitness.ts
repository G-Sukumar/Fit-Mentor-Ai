export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type PrimaryGoal = 'HYPERTROPHY' | 'FAT_LOSS' | 'STRENGTH' | 'ENDURANCE' | 'GENERAL_FITNESS' | 'RECOVERY';

export type ActivityLevel = 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTREMELY_ACTIVE';

export type WorkoutLocation = 'GYM' | 'HOME';

export type EquipmentChoice = 'FULL_GYM' | 'DUMBBELLS' | 'BODYWEIGHT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  fitnessLevel: FitnessLevel;
  primaryGoal: PrimaryGoal;
  targetCalories: number;
  createdAt: string;
}

export interface UserProfile extends User {
  age?: number;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercentage?: number;
  activityLevel?: ActivityLevel;
  workoutLocation?: WorkoutLocation;
  availableEquipment?: EquipmentChoice;
  preferredDurationMin?: number;
  trainingDaysPerWeek?: number;
  wearableDevice?: string;
  streakDays: number;
  onboardingCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g. "Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core", "Full Body"
  targetMuscle: string;
  equipment: EquipmentChoice;
  difficulty: FitnessLevel;
  movementType: 'COMPOUND' | 'ISOLATION';
  setsDefault: number;
  repsDefault: number;
  restSeconds: number;
  instructionCues?: string[];
}

export interface WorkoutPlanExercise {
  id?: string;
  workoutId?: string;
  exerciseId: string;
  exerciseName: string;
  targetMuscle: string;
  sequenceOrder: number;
  setsTarget: number;
  repsTarget: number;
  targetWeightKg: number;
  restSeconds: number;
}

export interface Workout {
  id: string;
  title: string;
  category: string;
  durationEstMin: number;
  difficulty: FitnessLevel;
  exercises: Exercise[];
  planExercises?: WorkoutPlanExercise[];
  progressPercent?: number;
}

export interface WorkoutSetLog {
  id?: string;
  workoutLogId?: string;
  exerciseId: string;
  exerciseName?: string;
  setNumber: number;
  repsCompleted: number;
  weightKg: number;
  rpeScore?: number;
  targetReps?: number;
  targetWeightKg?: number;
  calculatedE1rm?: number;
  completed: boolean;
}

export interface WorkoutSessionLog {
  id: string;
  userId: string;
  workoutId: string;
  workoutTitle: string;
  category: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes: number;
  totalCalories: number;
  totalVolumeKg: number;
  averageHr?: number;
  rpeScore?: number;
  sessionRpe?: number;
  trainingLoadScore?: number;
  volumeDensityKgMin?: number;
  setsLogs: WorkoutSetLog[];
}

export interface AdaptiveSuggestion {
  trigger: string;
  suggestedAction: string;
  suggestedWeightKg: number;
  suggestedReps: number;
  suggestedRestSeconds: number;
  message: string;
}

export interface AutoregulationResult {
  success: boolean;
  setCalculations: {
    e1rm: number;
    volumeKg: number;
    repsInReserve: number;
  };
  adaptation: AdaptiveSuggestion;
}

export interface PrescribedExerciseTarget {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  targetSets: number;
  targetReps: number;
  prescribedWeightKg: number;
  targetRpe: number;
  restSeconds: number;
  baseline?: {
    currentE1rm: number;
    bestE1rm: number;
    lastWorkingWeightKg: number;
    lastWorkingReps: number;
    lastWorkingRpe: number;
    progressionReason?: string;
  };
}

export interface PrescribedWorkoutPlan {
  success: boolean;
  workoutId: string;
  title: string;
  category: string;
  difficulty: string;
  durationEstMin: number;
  exercises: PrescribedExerciseTarget[];
  adaptiveContext: {
    progressionApplied: boolean;
    recommendationNote: string;
  };
}

/* =============================================================================
   Data Structure for Future AIML Feature Engineering Layer
   ============================================================================= */
export interface WorkoutPerformanceVector {
  userId: string;
  exerciseId: string;
  setsCount: number;
  totalReps: number;
  totalVolumeKg: number;
  avgWeightKg: number;
  avgRpeScore: number;
  sessionDurationMin: number;
  densityKgpM: number; // Volume per minute
}

export interface FitnessGoal {
  id: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'WEIGHT' | 'STREAK' | 'VOLUME' | 'SLEEP';
  deadline?: string;
}

export interface HealthMetric {
  date: string;
  steps: { current: number; goal: number; deltaPercent: number };
  activeCalories: { current: number; goal: number; deltaPercent: number };
  sleep: { durationMinutes: number; durationFormatted: string; qualityScore: number };
  restingHr: { bpm: number; status: string };
}

export interface ReadinessScore {
  score: number;
  status: 'Optimal' | 'Good' | 'Moderate' | 'Low' | 'Rest Needed';
  recoveryScore: number;
  sleepScore: number;
  activityScore: number;
  trainingLoadScore: number;
  aiBriefing: string;
}

export interface AIRecommendation {
  id: string;
  timestamp: string;
  category: 'RECOVERY' | 'WORKOUT_ADJUSTMENT' | 'NUTRITION' | 'MOBILITY';
  title: string;
  description: string;
  suggestedActions: string[];
}

export interface WearableConnection {
  deviceId: string;
  deviceName: string;
  connected: boolean;
  lastSyncedAt: string;
  batteryLevelPercent: number;
}

export interface WorkoutRecommendation {
  workoutId: string;
  name: string;
  title: string;
  score: number;
  matchPercentage: number;
  goal: PrimaryGoal;
  difficulty: FitnessLevel;
  equipment: EquipmentChoice;
  location: WorkoutLocation;
  duration: number;
  explanation: string;
  numberOfExercises?: number;
  targetMuscleGroups?: string[];
  metScore?: number;
  estimatedCaloriesBurned?: number;
  compoundRatioPercent?: number;
  forceDistribution?: {
    pushPercent: number;
    pullPercent: number;
    legsOrCorePercent: number;
  };
  safetyVerified?: boolean;
  exercises?: any[];
}

export interface RecommendationAPIResponse {
  success: boolean;
  count: number;
  recommendations: WorkoutRecommendation[];
  message: string;
}
