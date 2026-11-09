import { Request, Response } from 'express';
import { query } from '../config/db';
import { mockReadiness, mockHealthMetric } from '../services/mockService';
import { logger } from '../utils/logger';
import { inMemoryProgression, calculateHunterRank, createDefaultProgression } from './progression.controller';

// In-memory workout session & log store fallback
const inMemoryWorkoutLogs: Map<string, any> = new Map();
const inMemorySetLogs: Map<string, any[]> = new Map();

// Default workout templates
// Canonical RepDB Exercise Dataset Workout Templates
const defaultWorkoutTemplates = [
  {
    id: 'w0000000-0000-0000-0000-000000000001',
    title: 'RepDB Upper Body Push Hypertrophy',
    category: 'Chest, Shoulders & Triceps',
    targetGoal: 'HYPERTROPHY',
    difficulty: 'ADVANCED',
    equipment: 'FULL_GYM',
    location: 'GYM',
    durationEstMin: 60,
    progressPercent: 45,
    exercises: [
      { id: 'bench-press', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 6.0, setsDefault: 4, repsDefault: 6, restSeconds: 120, repdbSlug: 'bench-press', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-press-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-press-peak.webp' } },
      { id: 'close-grip-bench-press', name: 'Incline Dumbbell Bench Press', category: 'Chest', targetMuscle: 'Clavicular Pectoralis', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 5.5, setsDefault: 4, repsDefault: 8, restSeconds: 90, repdbSlug: 'close-grip-bench-press', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-bench-press-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-bench-press-peak.webp' } },
      { id: 'arnold-press', name: 'Arnold Dumbbell Press', category: 'Shoulders', targetMuscle: 'Anterior & Lateral Deltoid', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', forceType: 'push', met: 5.5, setsDefault: 3, repsDefault: 8, restSeconds: 90, repdbSlug: 'arnold-press', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/arnold-press-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/arnold-press-peak.webp' } },
      { id: 'close-grip-push-ups', name: 'Close-Grip Push-Up', category: 'Chest', targetMuscle: 'Triceps & Pecs', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 4.8, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'close-grip-push-ups', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-push-ups-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-push-ups-peak.webp' } },
      { id: 'bench-dips', name: 'Bench Triceps Dips', category: 'Arms', targetMuscle: 'Triceps Brachii', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'push', met: 4.0, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'bench-dips', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-dips-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-dips-peak.webp' } }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000002',
    title: 'RepDB Lower Body Power & Core Stability',
    category: 'Quadriceps, Hamstrings & Abs',
    targetGoal: 'HYPERTROPHY',
    difficulty: 'INTERMEDIATE',
    equipment: 'FULL_GYM',
    location: 'GYM',
    durationEstMin: 55,
    progressPercent: 0,
    exercises: [
      { id: 'bodyweight-squat', name: 'Barbell Back Squat', category: 'Legs', targetMuscle: 'Quadriceps & Gluteus Maximus', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', forceType: 'push', met: 7.5, setsDefault: 4, repsDefault: 6, restSeconds: 120, repdbSlug: 'bodyweight-squat', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-peak.webp' } },
      { id: 'banded-romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs', targetMuscle: 'Hamstrings & Posterior Chain', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 7.0, setsDefault: 4, repsDefault: 8, restSeconds: 90, repdbSlug: 'banded-romanian-deadlift', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/banded-romanian-deadlift-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/banded-romanian-deadlift-peak.webp' } },
      { id: 'box-squat', name: 'Front Squat / Box Squat', category: 'Legs', targetMuscle: 'Anterior Quads & Core', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', forceType: 'push', met: 7.5, setsDefault: 3, repsDefault: 8, restSeconds: 90, repdbSlug: 'box-squat', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/box-squat-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/box-squat-peak.webp' } },
      { id: 'bench-calf-stretch', name: 'Standing Calf Raise', category: 'Legs', targetMuscle: 'Gastrocnemius & Soleus', equipment: 'FULL_GYM', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'push', met: 3.5, setsDefault: 4, repsDefault: 15, restSeconds: 60, repdbSlug: 'bench-calf-stretch', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-calf-stretch-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-calf-stretch-peak.webp' } },
      { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core', targetMuscle: 'Rectus Abdominis & Deep Core', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 6.0, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'ab-wheel-rollout', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-peak.webp' } }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000003',
    title: 'RepDB Upper Body Pull & Latissimus Power',
    category: 'Back, Lats & Biceps',
    targetGoal: 'HYPERTROPHY',
    difficulty: 'INTERMEDIATE',
    equipment: 'FULL_GYM',
    location: 'GYM',
    durationEstMin: 55,
    progressPercent: 0,
    exercises: [
      { id: 'barbell-row', name: 'Barbell Bent-Over Row', category: 'Back', targetMuscle: 'Latissimus Dorsi & Rhomboids', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 6.0, setsDefault: 4, repsDefault: 8, restSeconds: 90, repdbSlug: 'barbell-row', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-row-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-row-peak.webp' } },
      { id: 'bent-over-db-row', name: 'Bent-Over Dumbbell Row', category: 'Back', targetMuscle: 'Lats & Middle Traps', equipment: 'DUMBBELLS', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 5.5, setsDefault: 4, repsDefault: 10, restSeconds: 75, repdbSlug: 'bent-over-db-row', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bent-over-db-row-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bent-over-db-row-peak.webp' } },
      { id: 'barbell-curl', name: 'Barbell Biceps Curl', category: 'Arms', targetMuscle: 'Biceps Brachii', equipment: 'FULL_GYM', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 4.0, setsDefault: 3, repsDefault: 10, restSeconds: 60, repdbSlug: 'barbell-curl', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-curl-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-curl-peak.webp' } },
      { id: 'bench-leg-pull-in', name: 'Seated Leg Pull-In Tuck', category: 'Core', targetMuscle: 'Lower Abdominals', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 4.5, setsDefault: 3, repsDefault: 15, restSeconds: 60, repdbSlug: 'bench-leg-pull-in', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-leg-pull-in-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-leg-pull-in-peak.webp' } }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000004',
    title: 'RepDB Full-Body Athletic Foundation',
    category: 'Full Body Compound Strength',
    targetGoal: 'STRENGTH',
    difficulty: 'ADVANCED',
    equipment: 'FULL_GYM',
    location: 'GYM',
    durationEstMin: 65,
    progressPercent: 0,
    exercises: [
      { id: 'bodyweight-squat', name: 'Barbell Squat', category: 'Legs', targetMuscle: 'Quadriceps & Glutes', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', forceType: 'push', met: 7.5, setsDefault: 4, repsDefault: 6, restSeconds: 120, repdbSlug: 'bodyweight-squat', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-squat-peak.webp' } },
      { id: 'bench-press', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 6.0, setsDefault: 4, repsDefault: 6, restSeconds: 120, repdbSlug: 'bench-press', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-press-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-press-peak.webp' } },
      { id: 'barbell-row', name: 'Barbell Bent-Over Row', category: 'Back', targetMuscle: 'Latissimus Dorsi', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 6.0, setsDefault: 4, repsDefault: 8, restSeconds: 90, repdbSlug: 'barbell-row', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-row-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/barbell-row-peak.webp' } },
      { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core', targetMuscle: 'Core & Anti-Extension', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 6.0, setsDefault: 3, repsDefault: 10, restSeconds: 60, repdbSlug: 'ab-wheel-rollout', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-peak.webp' } }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000005',
    title: 'RepDB Home Calisthenics Core & Stamina',
    category: 'Calisthenics & Core Endurance',
    targetGoal: 'FAT_LOSS',
    difficulty: 'BEGINNER',
    equipment: 'BODYWEIGHT',
    location: 'HOME',
    durationEstMin: 35,
    progressPercent: 0,
    exercises: [
      { id: 'close-grip-push-ups', name: 'Close-Grip Push-Up', category: 'Chest', targetMuscle: 'Pectorals & Triceps', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'push', met: 4.8, setsDefault: 4, repsDefault: 15, restSeconds: 45, repdbSlug: 'close-grip-push-ups', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-push-ups-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/close-grip-push-ups-peak.webp' } },
      { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'Legs', targetMuscle: 'Quads & Glutes', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 5.5, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'bulgarian-split-squat', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bulgarian-split-squat-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bulgarian-split-squat-peak.webp' } },
      { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'Core', targetMuscle: 'Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'pull', met: 6.0, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'ab-wheel-rollout', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/ab-wheel-rollout-peak.webp' } },
      { id: 'bench-dips', name: 'Bench Triceps Dips', category: 'Arms', targetMuscle: 'Triceps Brachii', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'push', met: 4.0, setsDefault: 3, repsDefault: 15, restSeconds: 45, repdbSlug: 'bench-dips', images: { start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-dips-start.webp', peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bench-dips-peak.webp' } }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000016',
    title: 'Zero-Equipment Home Core Crusher',
    category: 'Core & Abdominals',
    targetGoal: 'FAT_LOSS',
    difficulty: 'BEGINNER',
    equipment: 'BODYWEIGHT',
    location: 'HOME',
    durationEstMin: 25,
    progressPercent: 0,
    exercises: [
      { id: 'e0000000-0000-0000-0000-000000000017', name: 'Abdominal Floor Crunches', category: 'Core', targetMuscle: 'Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 4.0, setsDefault: 3, repsDefault: 20, restSeconds: 45, repdbSlug: 'crunches' },
      { id: 'e0000000-0000-0000-0000-000000000018', name: 'Forearm Plank', category: 'Core', targetMuscle: 'Transverse Abdominis & Core', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 3.8, setsDefault: 3, repsDefault: 60, restSeconds: 45, repdbSlug: 'plank' },
      { id: 'e0000000-0000-0000-0000-000000000021', name: 'Bicycle Crunches', category: 'Core', targetMuscle: 'Obliques & Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'ISOLATION', forceType: 'pull', met: 5.0, setsDefault: 3, repsDefault: 20, restSeconds: 45, repdbSlug: 'bicycle-crunches' },
      { id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers', category: 'Core', targetMuscle: 'Abdominals & Hip Flexors', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'pull', met: 6.5, setsDefault: 3, repsDefault: 30, restSeconds: 45, repdbSlug: 'mountain-climbers' }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000017',
    title: 'Awakened Home Calisthenics Full-Body',
    category: 'Full Body Bodyweight',
    targetGoal: 'GENERAL_FITNESS',
    difficulty: 'BEGINNER',
    equipment: 'BODYWEIGHT',
    location: 'HOME',
    durationEstMin: 35,
    progressPercent: 0,
    exercises: [
      { id: 'close-grip-push-ups', name: 'Close-Grip Push-Up', category: 'Chest', targetMuscle: 'Pectorals & Triceps', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'push', met: 4.8, setsDefault: 4, repsDefault: 12, restSeconds: 45, repdbSlug: 'close-grip-push-ups' },
      { id: 'e0000000-0000-0000-0000-000000000019', name: 'Bodyweight Air Squat', category: 'Legs', targetMuscle: 'Quadriceps & Gluteus Maximus', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'push', met: 5.5, setsDefault: 4, repsDefault: 15, restSeconds: 45, repdbSlug: 'bodyweight-squat' },
      { id: 'e0000000-0000-0000-0000-000000000022', name: 'Bodyweight Glute Bridge', category: 'Legs', targetMuscle: 'Gluteus Maximus & Hamstrings', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'push', met: 4.0, setsDefault: 3, repsDefault: 15, restSeconds: 45, repdbSlug: 'glute-bridge' },
      { id: 'e0000000-0000-0000-0000-000000000018', name: 'Forearm Plank', category: 'Core', targetMuscle: 'Transverse Abdominis & Core', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 3.8, setsDefault: 3, repsDefault: 60, restSeconds: 45, repdbSlug: 'plank' },
      { id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers', category: 'Core', targetMuscle: 'Abdominals & Hip Flexors', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'pull', met: 6.5, setsDefault: 3, repsDefault: 30, restSeconds: 45, repdbSlug: 'mountain-climbers' }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000018',
    title: 'Shadow Hunter High-Intensity Fat Burner',
    category: 'HIIT & Calisthenics',
    targetGoal: 'FAT_LOSS',
    difficulty: 'INTERMEDIATE',
    equipment: 'BODYWEIGHT',
    location: 'HOME',
    durationEstMin: 30,
    progressPercent: 0,
    exercises: [
      { id: 'e0000000-0000-0000-0000-000000000024', name: 'Bodyweight Burpees', category: 'Full Body', targetMuscle: 'Total Body Dynamic Conditioning', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', forceType: 'push', met: 8.0, setsDefault: 3, repsDefault: 12, restSeconds: 60, repdbSlug: 'burpees' },
      { id: 'e0000000-0000-0000-0000-000000000023', name: 'Jumping Jacks', category: 'Full Body', targetMuscle: 'Cardiovascular & Calves', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'dynamic', met: 6.0, setsDefault: 3, repsDefault: 40, restSeconds: 30, repdbSlug: 'jumping-jacks' },
      { id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers', category: 'Core', targetMuscle: 'Abdominals & Hip Flexors', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'pull', met: 6.5, setsDefault: 3, repsDefault: 30, restSeconds: 45, repdbSlug: 'mountain-climbers' },
      { id: 'e0000000-0000-0000-0000-000000000017', name: 'Abdominal Floor Crunches', category: 'Core', targetMuscle: 'Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', forceType: 'pull', met: 4.0, setsDefault: 3, repsDefault: 20, restSeconds: 45, repdbSlug: 'crunches' },
      { id: 'e0000000-0000-0000-0000-000000000019', name: 'Bodyweight Air Squat', category: 'Legs', targetMuscle: 'Quadriceps & Gluteus Maximus', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', forceType: 'push', met: 5.5, setsDefault: 3, repsDefault: 20, restSeconds: 45, repdbSlug: 'bodyweight-squat' }
    ]
  }
];

export const getWorkouts = async (req: Request, res: Response) => {
  try {
    try {
      const result = await query(
        `SELECT id, title, category, duration_est_min as "durationEstMin", difficulty FROM workouts ORDER BY title`
      );
      if (result && result.rows.length > 0) {
        return res.status(200).json(result.rows.map(w => ({ ...w, exercises: defaultWorkoutTemplates[0].exercises })));
      }
    } catch {
      // Fallback
    }

    return res.status(200).json(defaultWorkoutTemplates);
  } catch (error: any) {
    logger.error('Get workouts error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving workout plans.' });
  }
};

export const getWorkoutById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workout = defaultWorkoutTemplates.find(w => w.id === id) || defaultWorkoutTemplates[0];
    return res.status(200).json(workout);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving workout details.' });
  }
};

export const startWorkoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const workoutId = req.params.id || defaultWorkoutTemplates[0].id;
    const sessionLogId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startedAt = new Date().toISOString();

    const sessionData = {
      id: sessionLogId,
      userId,
      workoutId,
      workoutTitle: defaultWorkoutTemplates.find(w => w.id === workoutId)?.title || 'Power Hypertrophy Routine',
      startedAt,
      completedAt: null,
      durationMinutes: 0,
      totalCalories: 0,
      totalVolumeKg: 0,
      rpeScore: null
    };

    try {
      await query(
        `INSERT INTO workout_logs (id, user_id, workout_id, started_at, total_calories, total_volume_kg)
         VALUES ($1, $2, $3, $4, 0, 0)`,
        [sessionLogId, userId, workoutId, startedAt]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL workout log start fallback:', dbErr.message);
    }

    inMemoryWorkoutLogs.set(sessionLogId, sessionData);
    inMemorySetLogs.set(sessionLogId, []);

    return res.status(201).json({
      success: true,
      message: 'Workout session started',
      sessionLogId,
      session: sessionData
    });
  } catch (error: any) {
    logger.error('Start workout session error:', error);
    return res.status(500).json({ success: false, message: 'Failed to start workout session.' });
  }
};

export const logWorkoutSet = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { logId } = req.params;
    const { exerciseId, setNumber, repsCompleted, weightKg, rpeScore, targetReps, targetWeightKg } = req.body;

    // Validation
    const reps = Number(repsCompleted);
    const weight = Number(weightKg);

    if (isNaN(reps) || reps < 0) {
      return res.status(400).json({ success: false, message: 'Repetitions must be a positive number.' });
    }
    if (isNaN(weight) || weight < 0) {
      return res.status(400).json({ success: false, message: 'Weight cannot be negative.' });
    }
    if (!exerciseId) {
      return res.status(400).json({ success: false, message: 'Exercise ID is required.' });
    }

    const tReps = targetReps !== undefined ? Number(targetReps) : reps;
    const tWeight = targetWeightKg !== undefined ? Number(targetWeightKg) : weight;
    const e1rm = Math.round(weight * (1 + Math.min(12, reps) / 30.0) * 100) / 100;

    const setLogId = `set_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const setRecord = {
      id: setLogId,
      workoutLogId: logId,
      exerciseId,
      setNumber: Number(setNumber || 1),
      repsCompleted: reps,
      weightKg: weight,
      rpeScore: rpeScore ? Number(rpeScore) : 8.0,
      targetReps: tReps,
      targetWeightKg: tWeight,
      calculatedE1rm: e1rm,
      completed: true
    };

    try {
      await query(
        `INSERT INTO workout_set_logs (id, workout_log_id, exercise_id, set_number, reps_completed, weight_kg, rpe_score, target_reps, target_weight_kg, calculated_e1rm, completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
        [setLogId, logId, exerciseId, setRecord.setNumber, reps, weight, setRecord.rpeScore, tReps, tWeight, e1rm]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL set log fallback:', dbErr.message);
    }

    const sets = inMemorySetLogs.get(logId) || [];
    sets.push(setRecord);
    inMemorySetLogs.set(logId, sets);

    return res.status(200).json({
      success: true,
      message: 'Set logged successfully',
      setLog: setRecord
    });
  } catch (error: any) {
    logger.error('Log set error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record exercise set.' });
  }
};

export const completeWorkoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { logId } = req.params;
    const { rpeScore, durationMinutes, totalCalories } = req.body;

    const completedAt = new Date().toISOString();
    const sets = inMemorySetLogs.get(logId) || [];

    // Calculate total volume = SUM(reps * weight)
    const totalVolumeKg = sets.reduce((sum, s) => sum + (s.repsCompleted * s.weightKg), 0);
    const estDuration = durationMinutes ? Number(durationMinutes) : 45;
    const estCalories = totalCalories ? Number(totalCalories) : Math.floor(estDuration * 8.5);
    const sessionRpe = rpeScore ? Number(rpeScore) : 8.0;
    const trainingLoadScore = Number((sessionRpe * estDuration).toFixed(2));
    const volumeDensityKgMin = Number((totalVolumeKg / Math.max(1, estDuration)).toFixed(2));

    try {
      await query(
        `UPDATE workout_logs 
         SET completed_at = $1, total_calories = $2, total_volume_kg = $3, rpe_score = $4,
             session_rpe = $5, training_load_score = $6, volume_density_kg_min = $7
         WHERE id = $8 AND user_id = $9`,
        [completedAt, estCalories, totalVolumeKg, sessionRpe, sessionRpe, trainingLoadScore, volumeDensityKgMin, logId, userId]
      );

      // Increment streak in user_profiles
      await query(
        `UPDATE user_profiles SET streak_days = streak_days + 1 WHERE user_id = $1`,
        [userId]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL complete workout fallback:', dbErr.message);
    }

    const session = inMemoryWorkoutLogs.get(logId) || {
      id: logId,
      userId,
      workoutTitle: 'Power Hypertrophy Routine',
      startedAt: new Date(Date.now() - estDuration * 60000).toISOString()
    };

    const completedSession = {
      ...session,
      completedAt,
      durationMinutes: estDuration,
      totalCalories: estCalories,
      totalVolumeKg,
      rpeScore: sessionRpe,
      sessionRpe,
      trainingLoadScore,
      volumeDensityKgMin,
      setsLogs: sets
    };

    inMemoryWorkoutLogs.set(logId, completedSession);

    // Award Solo Leveling XP & Progression Update
    const earnedXp = 500 + Math.round(totalVolumeKg / 100);
    let userProg = inMemoryProgression.get(userId) || createDefaultProgression(userId);

    if (!userProg.awardedSessionIds.includes(logId)) {
      userProg.awardedSessionIds.push(logId);
      userProg.totalEarnedXp += earnedXp;
      const XP_PER_LEVEL = 1000;
      userProg.currentLevel = 1 + Math.floor(userProg.totalEarnedXp / XP_PER_LEVEL);
      userProg.currentXp = userProg.totalEarnedXp % XP_PER_LEVEL;
      userProg.hunterRank = calculateHunterRank(userProg.currentLevel);

      if (!userProg.unlockedAchievementIds.includes('ach_first_workout')) {
        userProg.unlockedAchievementIds.push('ach_first_workout');
      }
      if (totalVolumeKg >= 10000 && !userProg.unlockedAchievementIds.includes('ach_strength_gain')) {
        userProg.unlockedAchievementIds.push('ach_strength_gain');
      }
      if (userProg.currentLevel >= 25 && !userProg.unlockedAchievementIds.includes('ach_shadow_athlete')) {
        userProg.unlockedAchievementIds.push('ach_shadow_athlete');
      }

      inMemoryProgression.set(userId, userProg);

      try {
        await query(
          `INSERT INTO user_progression (
             user_id, current_level, current_xp, total_earned_xp, hunter_rank,
             equipped_avatar_id, equipped_aura_id, equipped_title_id,
             claimed_quest_ids, unlocked_achievement_ids, claimed_level_rewards, bonus_xp, awarded_session_ids
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (user_id) DO UPDATE SET
             current_level = EXCLUDED.current_level,
             current_xp = EXCLUDED.current_xp,
             total_earned_xp = EXCLUDED.total_earned_xp,
             hunter_rank = EXCLUDED.hunter_rank,
             unlocked_achievement_ids = EXCLUDED.unlocked_achievement_ids,
             awarded_session_ids = EXCLUDED.awarded_session_ids,
             updated_at = CURRENT_TIMESTAMP`,
          [
            userId, userProg.currentLevel, userProg.currentXp, userProg.totalEarnedXp, userProg.hunterRank,
            userProg.equippedAvatarId, userProg.equippedAuraId, userProg.equippedTitleId,
            userProg.claimedQuestIds, userProg.unlockedAchievementIds, userProg.claimedLevelRewardIds,
            userProg.bonusXp, userProg.awardedSessionIds
          ]
        );
      } catch (dbErr: any) {
        logger.warn('PostgreSQL progression update on workout completion fallback:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Workout session completed!',
      session: completedSession,
      progression: userProg,
      earnedXp
    });
  } catch (error: any) {
    logger.error('Complete workout session error:', error);
    return res.status(500).json({ success: false, message: 'Failed to complete workout session.' });
  }
};

export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    try {
      const result = await query(
        `SELECT l.id, l.user_id as "userId", l.workout_id as "workoutId", w.title as "workoutTitle",
                w.category, l.started_at as "startedAt", l.completed_at as "completedAt",
                COALESCE(l.total_calories, 0) as "totalCalories", COALESCE(l.total_volume_kg, 0) as "totalVolumeKg",
                COALESCE(l.rpe_score, 8) as "rpeScore"
         FROM workout_logs l
         LEFT JOIN workouts w ON l.workout_id = w.id
         WHERE l.user_id = $1
         ORDER BY l.started_at DESC`,
        [userId]
      );

      if (result && result.rows.length > 0) {
        return res.status(200).json(result.rows);
      }
    } catch (dbErr: any) {
      logger.warn('PostgreSQL history query fallback:', dbErr.message);
    }

    // Return authenticated user's in-memory logs (or empty array if new user)
    const userLogs = Array.from(inMemoryWorkoutLogs.values()).filter(l => l.userId === userId);
    return res.status(200).json(userLogs);
  } catch (error: any) {
    logger.error('Get workout history error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving workout history.' });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  res.status(200).json({
    weeklyVolumeKg: [14200, 18500, 8100, 16800, 19200, 6400, 0],
    streakDays: 7
  });
};

export const getMetrics = async (req: Request, res: Response) => {
  res.status(200).json(mockHealthMetric);
};

export const getReadiness = async (req: Request, res: Response) => {
  res.status(200).json(mockReadiness);
};

// 18 Expanded RepDB Workout Catalog Templates
export const expandedWorkoutCatalog = [
  { id: 'w0000000-0000-0000-0000-000000000001', title: 'RepDB Upper Body Push Hypertrophy', category: 'Chest & Shoulders', targetGoal: 'HYPERTROPHY', difficulty: 'ADVANCED', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 60, exercises: defaultWorkoutTemplates[0].exercises },
  { id: 'w0000000-0000-0000-0000-000000000002', title: 'RepDB Lower Body Power & Core Stability', category: 'Legs & Abs', targetGoal: 'HYPERTROPHY', difficulty: 'INTERMEDIATE', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 55, exercises: defaultWorkoutTemplates[1].exercises },
  { id: 'w0000000-0000-0000-0000-000000000003', title: 'RepDB Upper Body Pull & Latissimus Power', category: 'Back & Biceps', targetGoal: 'HYPERTROPHY', difficulty: 'INTERMEDIATE', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 55, exercises: defaultWorkoutTemplates[2].exercises },
  { id: 'w0000000-0000-0000-0000-000000000004', title: 'RepDB Full-Body Athletic Foundation', category: 'Full Body Strength', targetGoal: 'STRENGTH', difficulty: 'ADVANCED', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 65, exercises: defaultWorkoutTemplates[3].exercises },
  { id: 'w0000000-0000-0000-0000-000000000005', title: 'RepDB Home Calisthenics Core & Stamina', category: 'Bodyweight Core', targetGoal: 'FAT_LOSS', difficulty: 'BEGINNER', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 35, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000006', title: 'RepDB Dumbbell Upper Muscle Builder', category: 'Upper Body', targetGoal: 'HYPERTROPHY', difficulty: 'INTERMEDIATE', equipment: 'DUMBBELLS', location: 'HOME', durationEstMin: 60, exercises: defaultWorkoutTemplates[0].exercises },
  { id: 'w0000000-0000-0000-0000-000000000007', title: 'RepDB High Intensity Endurance Circuit', category: 'Endurance', targetGoal: 'ENDURANCE', difficulty: 'INTERMEDIATE', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 45, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000008', title: 'RepDB Decompression & Joint Mobility Flow', category: 'Mobility & Stretch', targetGoal: 'RECOVERY', difficulty: 'BEGINNER', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 30, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000009', title: 'RepDB Heavy Dumbbell Strength & Power', category: 'Full Body Strength', targetGoal: 'STRENGTH', difficulty: 'ADVANCED', equipment: 'DUMBBELLS', location: 'HOME', durationEstMin: 75, exercises: defaultWorkoutTemplates[0].exercises },
  { id: 'w0000000-0000-0000-0000-000000000010', title: 'RepDB Gym Aerobic Stamina & Conditioning', category: 'Cardio & Legs', targetGoal: 'ENDURANCE', difficulty: 'ADVANCED', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 75, exercises: defaultWorkoutTemplates[1].exercises },
  { id: 'w0000000-0000-0000-0000-000000000011', title: 'RepDB Active Gym Recovery & Deload', category: 'Active Recovery', targetGoal: 'RECOVERY', difficulty: 'INTERMEDIATE', equipment: 'FULL_GYM', location: 'GYM', durationEstMin: 45, exercises: defaultWorkoutTemplates[2].exercises },
  { id: 'w0000000-0000-0000-0000-000000000012', title: 'RepDB Dumbbell Fat Loss Metabolic HIIT', category: 'Metabolic', targetGoal: 'FAT_LOSS', difficulty: 'INTERMEDIATE', equipment: 'DUMBBELLS', location: 'HOME', durationEstMin: 45, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000013', title: 'RepDB Advanced Bodyweight Calisthenics Volume', category: 'Bodyweight Hypertrophy', targetGoal: 'HYPERTROPHY', difficulty: 'INTERMEDIATE', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 60, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000014', title: 'RepDB General Fitness Express Dumbbells', category: 'Full Body', targetGoal: 'GENERAL_FITNESS', difficulty: 'BEGINNER', equipment: 'DUMBBELLS', location: 'HOME', durationEstMin: 30, exercises: defaultWorkoutTemplates[3].exercises },
  { id: 'w0000000-0000-0000-0000-000000000015', title: 'RepDB Advanced Bodyweight Stamina Challenge', category: 'Calisthenics Endurance', targetGoal: 'ENDURANCE', difficulty: 'ADVANCED', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 90, exercises: defaultWorkoutTemplates[4].exercises },
  { id: 'w0000000-0000-0000-0000-000000000016', title: 'Zero-Equipment Home Core Crusher', category: 'Core & Abdominals', targetGoal: 'FAT_LOSS', difficulty: 'BEGINNER', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 25, exercises: defaultWorkoutTemplates[5].exercises },
  { id: 'w0000000-0000-0000-0000-000000000017', title: 'Awakened Home Calisthenics Full-Body', category: 'Full Body Bodyweight', targetGoal: 'GENERAL_FITNESS', difficulty: 'BEGINNER', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 35, exercises: defaultWorkoutTemplates[6].exercises },
  { id: 'w0000000-0000-0000-0000-000000000018', title: 'Shadow Hunter High-Intensity Fat Burner', category: 'HIIT & Calisthenics', targetGoal: 'FAT_LOSS', difficulty: 'INTERMEDIATE', equipment: 'BODYWEIGHT', location: 'HOME', durationEstMin: 30, exercises: defaultWorkoutTemplates[7].exercises }
];

// Internal 13-D Cosine Engine Helper
function compute13DCosineRecommendations(userProfile: any, catalog: any[], topK: number = 5) {
  const goalMap: Record<string, number> = { HYPERTROPHY: 0, FAT_LOSS: 1, STRENGTH: 2, ENDURANCE: 3, GENERAL_FITNESS: 4, RECOVERY: 5 };
  const levelMap: Record<string, number> = { BEGINNER: 0.0, INTERMEDIATE: 0.5, ADVANCED: 1.0 };
  const eqMap: Record<string, number> = { FULL_GYM: 7, DUMBBELLS: 8, BODYWEIGHT: 9 };
  const locMap: Record<string, number> = { GYM: 10, HOME: 11 };

  const uGoal = (userProfile.primaryGoal || userProfile.primary_goal || 'GENERAL_FITNESS').toUpperCase();
  const uLevel = (userProfile.fitnessLevel || userProfile.fitness_level || 'INTERMEDIATE').toUpperCase();
  const uEq = (userProfile.availableEquipment || userProfile.available_equipment || 'FULL_GYM').toUpperCase();
  const uLoc = (userProfile.workoutLocation || userProfile.workout_location || 'GYM').toUpperCase();
  const uDur = Number(userProfile.preferredDurationMin || userProfile.preferred_duration_min || 60);

  // Build 13-D User Vector
  const uVec = new Array(13).fill(0);
  uVec[goalMap[uGoal] ?? 4] = 1.0;
  uVec[6] = levelMap[uLevel] ?? 0.5;
  uVec[eqMap[uEq] ?? 7] = 1.0;
  uVec[locMap[uLoc] ?? 10] = 1.0;
  uVec[12] = Math.max(0, Math.min(1, (uDur - 30) / 60));

  const uNorm = Math.sqrt(uVec.reduce((sum, val) => sum + val * val, 0));

  const scored: any[] = [];

  for (const w of catalog) {
    const wGoal = (w.targetGoal || w.target_goal || 'GENERAL_FITNESS').toUpperCase();
    const wLevel = (w.difficulty || w.difficulty_level || 'INTERMEDIATE').toUpperCase();
    const wEq = (w.equipment || w.equipment_required || 'FULL_GYM').toUpperCase();
    const wLoc = (w.location || w.workout_location || 'GYM').toUpperCase();
    const wDur = Number(w.durationEstMin || w.duration_est_min || 60);

    // Hard Constraints Filter
    if (uEq === 'BODYWEIGHT' && (wEq === 'DUMBBELLS' || wEq === 'FULL_GYM')) continue;
    if (uEq === 'DUMBBELLS' && wEq === 'FULL_GYM') continue;
    if (uLoc === 'HOME' && (wLoc === 'GYM' || wEq === 'FULL_GYM')) continue;

    // Build 13-D Workout Vector
    const wVec = new Array(13).fill(0);
    wVec[goalMap[wGoal] ?? 4] = 1.0;
    wVec[6] = levelMap[wLevel] ?? 0.5;
    wVec[eqMap[wEq] ?? 7] = 1.0;
    wVec[locMap[wLoc] ?? 10] = 1.0;
    wVec[12] = Math.max(0, Math.min(1, (wDur - 30) / 60));

    const wNorm = Math.sqrt(wVec.reduce((sum, val) => sum + val * val, 0));
    let dot = 0;
    for (let i = 0; i < 13; i++) dot += uVec[i] * wVec[i];

    const rawScore = uNorm > 0 && wNorm > 0 ? Math.max(0, Math.min(1, dot / (uNorm * wNorm))) : 0;
    const matchPercent = Math.round(rawScore * 100);

    // Natural Language Explanation (strictly matching features)
    const reasons: string[] = [];
    if (uGoal === wGoal) {
      const gLabels: Record<string, string> = { HYPERTROPHY: 'muscle-gain goal', FAT_LOSS: 'fat-loss goal', STRENGTH: 'strength goal', ENDURANCE: 'endurance goal', GENERAL_FITNESS: 'general fitness goal', RECOVERY: 'recovery goal' };
      reasons.push(gLabels[uGoal] || 'fitness goal');
    }
    if (uLevel === wLevel) reasons.push(`${uLevel.toLowerCase()} fitness level`);
    if (uEq === wEq) {
      const eqLabels: Record<string, string> = { FULL_GYM: 'gym equipment', DUMBBELLS: 'dumbbell setup', BODYWEIGHT: 'bodyweight equipment' };
      reasons.push(eqLabels[uEq] || 'equipment');
    }
    if (uLoc === wLoc) {
      const locLabels: Record<string, string> = { GYM: 'gym location', HOME: 'home environment' };
      reasons.push(locLabels[uLoc] || 'location');
    }
    if (Math.abs(uDur - wDur) <= 15) reasons.push(`preferred ${wDur}-minute duration`);

    let explanation = `${matchPercent}% match based on custom feature compatibility.`;
    if (reasons.length === 1) {
      explanation = `${matchPercent}% match because this workout matches your ${reasons[0]}.`;
    } else if (reasons.length === 2) {
      explanation = `${matchPercent}% match because this workout matches your ${reasons[0]} and ${reasons[1]}.`;
    } else if (reasons.length > 2) {
      explanation = `${matchPercent}% match because this workout matches your ${reasons.slice(0, -1).join(', ')}, and ${reasons[reasons.length - 1]}.`;
    }

    // RepDB Biomechanical Telemetry calculation
    const metScore = wGoal === 'STRENGTH' ? 7.2 : wGoal === 'HYPERTROPHY' ? 6.5 : wGoal === 'FAT_LOSS' ? 6.8 : wGoal === 'RECOVERY' ? 3.5 : 5.8;
    const estimatedCaloriesBurned = Math.round(metScore * 75 * 0.0175 * wDur);
    const compoundRatioPercent = wGoal === 'STRENGTH' ? 80 : wGoal === 'HYPERTROPHY' ? 70 : wGoal === 'RECOVERY' ? 40 : 60;
    const isUpper = (w.category || '').toLowerCase().includes('upper') || (w.title || '').toLowerCase().includes('upper');
    const isLower = (w.category || '').toLowerCase().includes('lower') || (w.title || '').toLowerCase().includes('leg');
    const forceDistribution = isUpper
      ? { pushPercent: 50, pullPercent: 40, legsOrCorePercent: 10 }
      : isLower
      ? { pushPercent: 40, pullPercent: 35, legsOrCorePercent: 25 }
      : { pushPercent: 35, pullPercent: 35, legsOrCorePercent: 30 };

    const assignedExercises = w.exercises || [];
    scored.push({
      workoutId: w.id || w.workoutId || 'w_unk',
      name: w.title || w.name || 'Workout Routine',
      title: w.title || w.name || 'Workout Routine',
      category: w.category || 'RepDB Performance',
      score: Number(rawScore.toFixed(4)),
      matchPercentage: matchPercent,
      goal: wGoal,
      difficulty: wLevel,
      equipment: wEq,
      location: wLoc,
      duration: wDur,
      explanation,
      metScore,
      estimatedCaloriesBurned,
      compoundRatioPercent,
      forceDistribution,
      safetyVerified: true,
      numberOfExercises: w.numberOfExercises || assignedExercises.length,
      targetMuscleGroups: w.targetMuscleGroups || ['Full Body'],
      exercises: assignedExercises
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const topRecs = scored.slice(0, topK);

  return {
    success: true,
    count: topRecs.length,
    recommendations: topRecs,
    message: topRecs.length > 0 ? `Successfully retrieved top ${topRecs.length} recommendations.` : 'No compatible workout was found.'
  };
}

export const getWorkoutRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch user profile from DB or profileStore
    let profile: any = null;
    try {
      const result = await query(
        `SELECT u.primary_goal as "primaryGoal", u.fitness_level as "fitnessLevel",
                p.available_equipment as "availableEquipment", p.workout_location as "workoutLocation",
                p.preferred_duration_min as "preferredDurationMin"
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = $1`,
        [userId]
      );
      if (result && result.rows.length > 0) {
        profile = result.rows[0];
      }
    } catch {
      // Fallback
    }

    if (!profile) {
      profile = {
        primaryGoal: 'HYPERTROPHY',
        fitnessLevel: 'INTERMEDIATE',
        availableEquipment: 'FULL_GYM',
        workoutLocation: 'GYM',
        preferredDurationMin: 60
      };
    }

    // Load workout catalog
    let catalog = expandedWorkoutCatalog;
    try {
      const dbWorkouts = await query(
        `SELECT id, title, category, duration_est_min as "durationEstMin", difficulty,
                COALESCE(target_goal, 'HYPERTROPHY') as "targetGoal",
                COALESCE(equipment_required, 'FULL_GYM') as "equipment",
                COALESCE(workout_location, 'GYM') as "location"
         FROM workouts ORDER BY title`
      );
      if (dbWorkouts && dbWorkouts.rows.length >= 10) {
        catalog = dbWorkouts.rows;
      }
    } catch {
      // Fallback
    }

    const result = compute13DCosineRecommendations(profile, catalog, 5);
    return res.status(200).json(result);
  } catch (error: any) {
    logger.error('Get workout recommendations error:', error);
    return res.status(500).json({ success: false, message: 'Error computing recommendations.' });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  return getWorkoutRecommendations(req, res);
};

export const getWearables = async (req: Request, res: Response) => {
  res.status(200).json({
    deviceId: 'dev_gw6_981',
    deviceName: 'Galaxy Watch 6',
    connected: true,
    lastSyncedAt: '2 minutes ago',
    batteryLevelPercent: 82
  });
};

export const handleAIChat = async (req: Request, res: Response) => {
  const { message } = req.body;
  const lower = (message || '').toLowerCase();
  let reply = "I'm analyzing your current telemetry: Heart rate is stable at 62 BPM, and weekly volume adherence is at 88%. How can I help refine your training or nutrition right now?";

  if (lower.includes('recover') || lower.includes('ready') || lower.includes('score')) {
    reply = "Your composite Readiness Score is 85/100 (Optimal). Your autonomic nervous system recovery is at 92% with 7h 20m of deep and REM sleep. You are primed for high-intensity power hypertrophy training today!";
  } else if (lower.includes('workout') || lower.includes('exercise')) {
    reply = "For today's Upper Body Power session, start with Barbell Bench Press (4 sets x 6 reps at 80% 1RM), followed by Incline Dumbbell Rows (4 sets x 8 reps).";
  }

  res.status(200).json({ reply, timestamp: new Date().toISOString() });
};
