/**
 * FitMentor AI — Milestone 5: Adaptive Training Domain Types
 */

export interface ExerciseBaseline {
  exerciseId: string;
  exerciseName?: string;
  currentE1rm: number;
  bestE1rm: number;
  lastWorkingWeightKg: number;
  lastWorkingReps: number;
  lastWorkingRpe: number;
  progressionReason?: string;
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
  baseline?: ExerciseBaseline;
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

export interface AutoregulationInput {
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  repsCompleted: number;
  rpeScore: number;
  targetReps?: number;
  targetWeightKg?: number;
  restSeconds?: number;
}

export interface SetCalculations {
  e1rm: number;
  volumeKg: number;
  repsInReserve: number;
}

export interface AdaptiveSuggestion {
  trigger: 'UNDERLOAD_PROGRESSIVE_OVERLOAD' | 'TARGET_IN_POCKET' | 'NEAR_MAXIMAL_FATIGUE' | 'MAXIMAL_FAILURE' | 'MINOR_REP_DROP' | 'SEVERE_FATIGUE';
  suggestedAction: 'INCREASE_WEIGHT' | 'MAINTAIN' | 'EXTEND_REST_OR_HOLD' | 'REDUCE_WEIGHT' | 'DELOAD_INTENSITY';
  suggestedWeightKg: number;
  suggestedReps: number;
  suggestedRestSeconds: number;
  message: string;
}

export interface AutoregulationResult {
  success: boolean;
  setCalculations: SetCalculations;
  adaptation: AdaptiveSuggestion;
}

export interface SessionCompletionSummary {
  sessionLogId: string;
  totalVolumeKg: number;
  durationMinutes: number;
  sessionRpe: number;
  trainingLoadScore: number;
  volumeDensityKgMin: number;
  e1rmRecordsSet: Array<{
    exerciseId: string;
    exerciseName: string;
    newE1rm: number;
    previousE1rm: number;
    deltaPercent: number;
    isNewPersonalRecord: boolean;
  }>;
}
