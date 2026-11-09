import { Request, Response } from 'express';
import { adaptiveEngine } from '../services/adaptiveEngine.service';
import { analyticsService } from '../services/analytics.service';
import { query } from '../config/db';
import { logger } from '../utils/logger';
import { expandedWorkoutCatalog } from './workouts.controller';

// Fallback workout templates for prescription
const defaultTemplates = [
  {
    id: 'w0000000-0000-0000-0000-000000000001',
    title: 'Power Hypertrophy Upper Body',
    category: 'Upper Body',
    durationEstMin: 60,
    difficulty: 'ADVANCED',
    exercises: [
      { id: 'e0000000-0000-0000-0000-000000000001', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', setsDefault: 4, repsDefault: 6, restSeconds: 120 },
      { id: 'e0000000-0000-0000-0000-000000000003', name: 'Barbell Bent-Over Row', category: 'Back', targetMuscle: 'Latissimus Dorsi', setsDefault: 4, repsDefault: 8, restSeconds: 90 },
      { id: 'e0000000-0000-0000-0000-000000000005', name: 'Overhead Barbell Press', category: 'Shoulders', targetMuscle: 'Deltoids', setsDefault: 3, repsDefault: 8, restSeconds: 90 }
    ]
  },
  {
    id: 'w0000000-0000-0000-0000-000000000002',
    title: 'Lower Body Power & Core',
    category: 'Lower Body',
    durationEstMin: 55,
    difficulty: 'INTERMEDIATE',
    exercises: [
      { id: 'e0000000-0000-0000-0000-000000000009', name: 'Barbell Back Squat', category: 'Legs', targetMuscle: 'Quadriceps & Glutes', setsDefault: 4, repsDefault: 6, restSeconds: 120 },
      { id: 'e0000000-0000-0000-0000-000000000010', name: 'Romanian Deadlift', category: 'Legs', targetMuscle: 'Hamstrings & Glutes', setsDefault: 4, repsDefault: 8, restSeconds: 90 },
      { id: 'e0000000-0000-0000-0000-000000000011', name: 'Hanging Leg Raise', category: 'Core', targetMuscle: 'Rectus Abdominis', setsDefault: 3, repsDefault: 15, restSeconds: 60 }
    ]
  }
];

export const getPrescribedWorkout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    let template = (expandedWorkoutCatalog.find(w => w.id === id) as any) || defaultTemplates.find(w => w.id === id) || defaultTemplates[0];

    try {
      const dbRes = await query(
        `SELECT w.id, w.title, w.category, w.duration_est_min as "durationEstMin", w.difficulty
         FROM workouts w WHERE w.id = $1`,
        [id]
      );
      if (dbRes && dbRes.rows.length > 0) {
        template = { ...template, ...dbRes.rows[0] };
        
        // Fetch plan exercises if configured
        const exRes = await query(
          `SELECT e.id, e.name, e.category, e.target_muscle as "targetMuscle",
                  p.sets_target as "setsDefault", p.reps_target as "repsDefault",
                  p.target_weight_kg as "targetWeightKg", p.rest_seconds as "restSeconds"
           FROM workout_plan_exercises p
           JOIN exercises e ON p.exercise_id = e.id
           WHERE p.workout_id = $1
           ORDER BY p.sequence_order ASC`,
          [id]
        );
        if (exRes && exRes.rows.length > 0) {
          template.exercises = exRes.rows;
        }
      }
    } catch (err: any) {
      logger.warn('PostgreSQL template lookup fallback:', err.message);
    }

    const prescribed = await adaptiveEngine.generatePrescribedWorkout(userId, template);
    return res.status(200).json(prescribed);
  } catch (error: any) {
    logger.error('Get prescribed workout error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate prescribed workout plan.' });
  }
};

export const evaluateAutoregulation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { logId } = req.params;
    const { exerciseId, setNumber, weightKg, repsCompleted, rpeScore, targetReps, targetWeightKg } = req.body;

    const weight = Number(weightKg);
    const reps = Number(repsCompleted);
    const rpe = Number(rpeScore);

    // Validation
    if (isNaN(weight) || weight < 0) {
      return res.status(400).json({ success: false, message: 'Weight must be a non-negative number.' });
    }
    if (isNaN(reps) || reps < 0) {
      return res.status(400).json({ success: false, message: 'Reps must be a positive integer.' });
    }
    if (isNaN(rpe) || rpe < 1.0 || rpe > 10.0) {
      return res.status(400).json({ success: false, message: 'RPE score must be between 1.0 and 10.0.' });
    }
    if (!exerciseId) {
      return res.status(400).json({ success: false, message: 'Exercise ID is required.' });
    }

    // Run deterministic APRE / RIR autoregulation
    const result = adaptiveEngine.evaluateSetAutoregulation({
      exerciseId,
      setNumber: Number(setNumber || 1),
      weightKg: weight,
      repsCompleted: reps,
      rpeScore: rpe,
      targetReps: targetReps ? Number(targetReps) : reps,
      targetWeightKg: targetWeightKg ? Number(targetWeightKg) : weight
    });

    // Update user exercise baseline with this set performance
    const baselineUpdate = await analyticsService.updateExerciseBaseline(
      userId,
      exerciseId,
      weight,
      reps,
      rpe
    );

    // Record adaptation in DB if possible
    try {
      await query(
        `INSERT INTO set_adaptations (workout_set_log_id, adaptation_type, trigger_reason, suggested_weight_kg, suggested_reps, suggested_rest_seconds, message)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
        [
          result.adaptation.suggestedAction,
          result.adaptation.trigger,
          result.adaptation.suggestedWeightKg,
          result.adaptation.suggestedReps,
          result.adaptation.suggestedRestSeconds,
          result.adaptation.message
        ]
      );
    } catch {
      // Fallback
    }

    return res.status(200).json({
      ...result,
      baselineUpdate
    });
  } catch (error: any) {
    logger.error('Evaluate autoregulation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to evaluate autoregulation.' });
  }
};
