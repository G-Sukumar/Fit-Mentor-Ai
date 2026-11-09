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
  category: string;
  targetMuscle: string;
  equipment: EquipmentChoice;
  difficulty: FitnessLevel;
  movementType: 'COMPOUND' | 'ISOLATION';
  setsDefault: number;
  repsDefault: number;
  restSeconds: number;
  instructionCues?: string[];
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
  completed: boolean;
}

export interface ReadinessScore {
  score: number;
  status: string;
  recoveryScore: number;
  sleepScore: number;
  activityScore: number;
  trainingLoadScore: number;
  aiBriefing: string;
}

export interface HealthMetric {
  date: string;
  steps: { current: number; goal: number; deltaPercent: number };
  activeCalories: { current: number; goal: number; deltaPercent: number };
  sleep: { durationMinutes: number; durationFormatted: string; qualityScore: number };
  restingHr: { bpm: number; status: string };
}
