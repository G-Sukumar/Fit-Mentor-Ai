import { query } from '../config/db';
import { logger } from '../utils/logger';
import { calculateEpleyE1RM, calculateTrainingLoad, calculateVolumeDensity, calculatePerformanceDelta } from '../utils/formulas';
import { ExerciseBaseline } from '../types/adaptive';

// In-memory fallback baseline cache keyed by "userId:exerciseId"
const inMemoryBaselines: Map<string, ExerciseBaseline> = new Map();

export const analyticsService = {
  /**
   * Retrieves the current performance baseline for a user on an exercise.
   */
  async getExerciseBaseline(userId: string, exerciseId: string): Promise<ExerciseBaseline> {
    const cacheKey = `${userId}:${exerciseId}`;
    try {
      const res = await query(
        `SELECT current_e1rm as "currentE1rm", best_e1rm as "bestE1rm", 
                last_working_weight_kg as "lastWorkingWeightKg", 
                last_working_reps as "lastWorkingReps", 
                last_working_rpe as "lastWorkingRpe"
         FROM user_exercise_baselines
         WHERE user_id = $1 AND exercise_id = $2`,
        [userId, exerciseId]
      );

      if (res && res.rows.length > 0) {
        return {
          exerciseId,
          currentE1rm: Number(res.rows[0].currentE1rm),
          bestE1rm: Number(res.rows[0].bestE1rm),
          lastWorkingWeightKg: Number(res.rows[0].lastWorkingWeightKg),
          lastWorkingReps: Number(res.rows[0].lastWorkingReps),
          lastWorkingRpe: Number(res.rows[0].lastWorkingRpe)
        };
      }
    } catch (err: any) {
      logger.warn('PostgreSQL baseline lookup fallback:', err.message);
    }

    const cached = inMemoryBaselines.get(cacheKey);
    if (cached) return cached;

    // Default starting baseline
    const defaultBaseline: ExerciseBaseline = {
      exerciseId,
      currentE1rm: 85.0,
      bestE1rm: 85.0,
      lastWorkingWeightKg: 70.0,
      lastWorkingReps: 8,
      lastWorkingRpe: 8.0,
      progressionReason: 'Initial starting baseline prescription.'
    };
    return defaultBaseline;
  },

  /**
   * Updates baseline when a set is completed with a new performance record.
   */
  async updateExerciseBaseline(
    userId: string, 
    exerciseId: string, 
    weightKg: number, 
    reps: number, 
    rpe: number
  ): Promise<{ newE1rm: number; previousE1rm: number; deltaPercent: number; isPR: boolean }> {
    const current = await this.getExerciseBaseline(userId, exerciseId);
    const newE1rm = calculateEpleyE1RM(weightKg, reps);
    const isPR = newE1rm > current.bestE1rm;
    const bestE1rm = Math.max(newE1rm, current.bestE1rm);
    const deltaPercent = calculatePerformanceDelta(newE1rm, current.currentE1rm);

    const updated: ExerciseBaseline = {
      exerciseId,
      currentE1rm: newE1rm,
      bestE1rm,
      lastWorkingWeightKg: weightKg,
      lastWorkingReps: reps,
      lastWorkingRpe: rpe
    };

    inMemoryBaselines.set(`${userId}:${exerciseId}`, updated);

    try {
      await query(
        `INSERT INTO user_exercise_baselines (user_id, exercise_id, current_e1rm, best_e1rm, 
                                             last_working_weight_kg, last_working_reps, last_working_rpe, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, exercise_id) DO UPDATE
         SET current_e1rm = EXCLUDED.current_e1rm,
             best_e1rm = EXCLUDED.best_e1rm,
             last_working_weight_kg = EXCLUDED.last_working_weight_kg,
             last_working_reps = EXCLUDED.last_working_reps,
             last_working_rpe = EXCLUDED.last_working_rpe,
             updated_at = CURRENT_TIMESTAMP`,
        [userId, exerciseId, newE1rm, bestE1rm, weightKg, reps, rpe]
      );
    } catch (err: any) {
      logger.warn('PostgreSQL update baseline fallback:', err.message);
    }

    return {
      newE1rm,
      previousE1rm: current.currentE1rm,
      deltaPercent,
      isPR
    };
  }
};
