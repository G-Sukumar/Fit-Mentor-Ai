/**
 * FitMentor AI — Pure Mathematical & Exercise Science Formulation Utilities
 */

/**
 * Calculates Estimated 1-Rep Max (e1RM) using the validated Epley formula.
 * Epley Formula: e1RM = weight * (1 + reps / 30)
 * For 1 rep, e1RM = weight.
 * For reps > 12, effective reps are capped at 12 to prevent over-linear extrapolation.
 */
export function calculateEpleyE1RM(weightKg: number, reps: number): number {
  const w = Number(weightKg);
  const r = Number(reps);

  if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
    return 0;
  }

  if (r === 1) {
    return Number(w.toFixed(2));
  }

  const effectiveReps = Math.min(12, r);
  const e1rm = w * (1 + effectiveReps / 30.0);
  return Number(e1rm.toFixed(2));
}

/**
 * Calculates Reps in Reserve (RIR) from RPE.
 * Standard formula: RIR = 10 - RPE
 */
export function calculateRIR(rpe: number): number {
  const numericRpe = Number(rpe);
  if (isNaN(numericRpe) || numericRpe < 1 || numericRpe > 10) {
    return 2.0;
  }
  return Number(Math.max(0, 10 - numericRpe).toFixed(1));
}

/**
 * Calculates RPE from Reps in Reserve (RIR).
 * Standard formula: RPE = 10 - RIR
 */
export function calculateRPEFromRIR(rir: number): number {
  const numericRir = Number(rir);
  if (isNaN(numericRir) || numericRir < 0 || numericRir > 9) {
    return 8.0;
  }
  return Number(Math.min(10, Math.max(1, 10 - numericRir)).toFixed(1));
}

/**
 * Calculates Session Training Load (sRPE * duration in minutes).
 * Units: Arbitrary Load Units (A.U.)
 */
export function calculateTrainingLoad(sessionRpe: number, durationMinutes: number): number {
  const rpe = Number(sessionRpe) || 8.0;
  const dur = Number(durationMinutes) || 45;
  return Number((rpe * dur).toFixed(2));
}

/**
 * Calculates Volume Density in kg/min.
 */
export function calculateVolumeDensity(totalVolumeKg: number, durationMinutes: number): number {
  const vol = Number(totalVolumeKg) || 0;
  const dur = Math.max(1, Number(durationMinutes) || 1);
  return Number((vol / dur).toFixed(2));
}

/**
 * Calculates percentage delta between current e1RM and historical baseline.
 */
export function calculatePerformanceDelta(currentE1rm: number, baselineE1rm: number): number {
  const cur = Number(currentE1rm) || 0;
  const base = Number(baselineE1rm) || 0;

  if (base <= 0) return 0;
  const delta = ((cur - base) / base) * 100.0;
  return Number(delta.toFixed(2));
}
