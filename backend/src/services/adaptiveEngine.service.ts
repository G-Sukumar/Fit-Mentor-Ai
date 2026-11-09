import { analyticsService } from './analytics.service';
import { calculateEpleyE1RM, calculateRIR } from '../utils/formulas';
import { 
  AutoregulationInput, 
  AutoregulationResult, 
  AdaptiveSuggestion,
  PrescribedWorkoutPlan,
  PrescribedExerciseTarget 
} from '../types/adaptive';

export const adaptiveEngine = {
  /**
   * Evaluates performance of an individual completed set and determines real-time intra-session adjustments.
   */
  evaluateSetAutoregulation(input: AutoregulationInput): AutoregulationResult {
    const weight = Number(input.weightKg) || 0;
    const reps = Number(input.repsCompleted) || 0;
    const rpe = Number(input.rpeScore) || 8.0;
    const targetReps = Number(input.targetReps) || reps;
    const defaultRest = Number(input.restSeconds) || 90;

    const e1rm = calculateEpleyE1RM(weight, reps);
    const volumeKg = Number((weight * reps).toFixed(2));
    const repsInReserve = calculateRIR(rpe);

    let suggestion: AdaptiveSuggestion;

    // Rule 1: Severe Rep Drop or Undershoot with Max Exertion (e.g. Target 8, Actual 5, RPE 10 or Missed >= 2 reps)
    if (reps <= targetReps - 2) {
      const reducedWeight = Math.max(0, Math.round((weight * 0.90) * 2) / 2);
      suggestion = {
        trigger: 'SEVERE_FATIGUE',
        suggestedAction: 'DELOAD_INTENSITY',
        suggestedWeightKg: reducedWeight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest + 45,
        message: `Significant fatigue detected (-${targetReps - reps} reps vs target). Dropping load by 10% to ${reducedWeight}kg to sustain volume.`
      };
    }
    // Rule 2: Single Rep Drop with Failure (Target 8, Actual 7, RPE >= 9.5)
    else if (reps < targetReps && rpe >= 9.5) {
      const reducedWeight = Math.max(0, Math.round((weight * 0.95) * 2) / 2);
      suggestion = {
        trigger: 'MAXIMAL_FAILURE',
        suggestedAction: 'REDUCE_WEIGHT',
        suggestedWeightKg: reducedWeight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest + 30,
        message: `Set reached muscular failure (RPE ${rpe}). Reducing weight by 5% to ${reducedWeight}kg to maintain target reps.`
      };
    }
    // Rule 3: Target Reps Met + True Failure (RPE 10.0)
    else if (reps === targetReps && rpe >= 10.0) {
      const reducedWeight = Math.max(0, Math.round((weight * 0.95) * 2) / 2);
      suggestion = {
        trigger: 'MAXIMAL_FAILURE',
        suggestedAction: 'REDUCE_WEIGHT',
        suggestedWeightKg: reducedWeight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest + 30,
        message: `Set reached technical limit (RPE 10.0). Reduce weight by 5% to ${reducedWeight}kg to preserve movement quality.`
      };
    }
    // Rule 4: Target Reps Met + Near Maximal (RPE 9.0 - 9.5)
    else if (reps === targetReps && rpe >= 9.0) {
      suggestion = {
        trigger: 'NEAR_MAXIMAL_FATIGUE',
        suggestedAction: 'EXTEND_REST_OR_HOLD',
        suggestedWeightKg: weight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest + 30,
        message: `High exertion reached (RPE ${rpe}, RIR ${repsInReserve}). Maintain ${weight}kg but rest an additional 30 seconds.`
      };
    }
    // Rule 5: Rep Overshoot OR Target Reps with Low Exertion (RPE <= 7.0 or Reps > Target) -> Progressive Overload
    else if (reps > targetReps || (reps === targetReps && rpe <= 7.0)) {
      const overloadWeight = Number((weight + 2.5).toFixed(1));
      suggestion = {
        trigger: 'UNDERLOAD_PROGRESSIVE_OVERLOAD',
        suggestedAction: 'INCREASE_WEIGHT',
        suggestedWeightKg: overloadWeight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest,
        message: reps > targetReps 
          ? `Rep capacity exceeded target (${reps}/${targetReps} reps @ RPE ${rpe}). Increase by +2.5kg to ${overloadWeight}kg for progressive overload.`
          : `High velocity movement (RPE ${rpe}). Load is below target threshold. Increase by +2.5kg to ${overloadWeight}kg.`
      };
    }
    // Rule 6: Target In-Pocket (RPE 7.5 - 8.5)
    else {
      suggestion = {
        trigger: 'TARGET_IN_POCKET',
        suggestedAction: 'MAINTAIN',
        suggestedWeightKg: weight,
        suggestedReps: targetReps,
        suggestedRestSeconds: defaultRest,
        message: `Target intensity locked in (RPE ${rpe} in pocket). Maintain ${weight}kg for subsequent sets.`
      };
    }

    return {
      success: true,
      setCalculations: {
        e1rm,
        volumeKg,
        repsInReserve
      },
      adaptation: suggestion
    };
  },

  /**
   * Generates a personalized prescribed workout with starting target weights from user baselines.
   */
  async generatePrescribedWorkout(
    userId: string, 
    workoutTemplate: any
  ): Promise<PrescribedWorkoutPlan> {
    const exercises = workoutTemplate.exercises || [];
    const prescribedExercises: PrescribedExerciseTarget[] = [];

    for (const ex of exercises) {
      const baseline = await analyticsService.getExerciseBaseline(userId, ex.id);
      
      // Calculate prescribed starting weight from baseline working weight or e1RM
      let prescribedWeight = baseline.lastWorkingWeightKg || 70.0;
      let progressionReason = 'Standard working load maintained.';

      // Apply progressive overload if last RPE was <= 7.5
      if (baseline.lastWorkingRpe <= 7.5 && baseline.lastWorkingWeightKg > 0) {
        prescribedWeight = Number((baseline.lastWorkingWeightKg + 2.5).toFixed(1));
        progressionReason = `Previous session RPE ${baseline.lastWorkingRpe} demonstrated capacity for +2.5kg progressive overload.`;
      } else if (baseline.lastWorkingRpe >= 9.5 && baseline.lastWorkingWeightKg > 0) {
        prescribedWeight = Number(baseline.lastWorkingWeightKg.toFixed(1));
        progressionReason = `Previous session RPE ${baseline.lastWorkingRpe} near limit. Consolidating volume at current load.`;
      }

      prescribedExercises.push({
        id: ex.id,
        name: ex.name,
        category: ex.category || 'Compound',
        targetMuscle: ex.targetMuscle || 'Muscle Group',
        targetSets: ex.setsDefault || 4,
        targetReps: ex.repsDefault || 8,
        prescribedWeightKg: prescribedWeight,
        targetRpe: 8.0,
        restSeconds: ex.restSeconds || 90,
        baseline: {
          ...baseline,
          progressionReason
        }
      });
    }

    return {
      success: true,
      workoutId: workoutTemplate.id,
      title: workoutTemplate.title,
      category: workoutTemplate.category,
      difficulty: workoutTemplate.difficulty,
      durationEstMin: workoutTemplate.durationEstMin || 60,
      exercises: prescribedExercises,
      adaptiveContext: {
        progressionApplied: true,
        recommendationNote: 'Target loads personalized using your historical exercise performance and autoregulatory baselines.'
      }
    };
  }
};
