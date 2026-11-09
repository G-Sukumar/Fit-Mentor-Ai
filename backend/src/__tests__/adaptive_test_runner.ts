/**
 * FitMentor AI — Milestone 5 Adaptive Intelligence Unit Test Suite
 */

import { calculateEpleyE1RM, calculateRIR, calculateRPEFromRIR, calculateTrainingLoad, calculateVolumeDensity, calculatePerformanceDelta } from '../utils/formulas';
import { adaptiveEngine } from '../services/adaptiveEngine.service';

function runTests() {
  console.log('🧪 Running Milestone 5 Adaptive Workout Intelligence Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // 1. Math Formula Tests
  console.log('--- 1. Mathematical Formulas Tests ---');
  // Epley formula: 100 * (1 + 10/30) = 133.33
  const e1rm1 = calculateEpleyE1RM(100, 10);
  assert(Math.abs(e1rm1 - 133.33) < 0.1, `Epley e1RM for 100kg x 10 reps = 133.33kg (Got: ${e1rm1})`);

  // Single rep e1RM = weight
  const e1rmSingle = calculateEpleyE1RM(140, 1);
  assert(e1rmSingle === 140, `Single rep e1RM for 140kg x 1 rep = 140kg (Got: ${e1rmSingle})`);

  // Reps in Reserve & RPE conversions
  const rir8 = calculateRIR(8.0);
  assert(rir8 === 2.0, `RIR for RPE 8.0 = 2.0 RIR (Got: ${rir8})`);

  const rir95 = calculateRIR(9.5);
  assert(rir95 === 0.5, `RIR for RPE 9.5 = 0.5 RIR (Got: ${rir95})`);

  const rpeFromRir2 = calculateRPEFromRIR(2.0);
  assert(rpeFromRir2 === 8.0, `RPE for 2.0 RIR = 8.0 RPE (Got: ${rpeFromRir2})`);

  // Training Load: RPE 8 * 60 min = 480 AU
  const load = calculateTrainingLoad(8.0, 60);
  assert(load === 480.0, `Training load for RPE 8.0 x 60 min = 480.0 AU (Got: ${load})`);

  // Volume Density: 14000 kg / 50 min = 280 kg/min
  const density = calculateVolumeDensity(14000, 50);
  assert(density === 280.0, `Volume density for 14,000kg / 50 min = 280.0 kg/min (Got: ${density})`);

  // Performance Delta
  const delta = calculatePerformanceDelta(105, 100);
  assert(delta === 5.0, `Performance delta (105kg vs 100kg) = +5.0% (Got: ${delta}%)`);

  // 2. Deterministic Autoregulation Rules Tests
  console.log('\n--- 2. Autoregulation Rule Engine Tests ---');

  // Specific User Case 1: Target 70kg x 8, Actual 70kg x 10, RPE 7 -> Increase load (+2.5kg)
  const resCase1 = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e_bench',
    setNumber: 1,
    weightKg: 70,
    repsCompleted: 10,
    rpeScore: 7.0,
    targetReps: 8,
    targetWeightKg: 70
  });
  assert(
    resCase1.adaptation.suggestedAction === 'INCREASE_WEIGHT' &&
    resCase1.adaptation.suggestedWeightKg === 72.5,
    `User Case 1 (Target: 70kg x 8, Actual: 70kg x 10, RPE 7) -> Suggests increasing load to 72.5kg (Got: ${resCase1.adaptation.suggestedWeightKg}kg)`
  );

  // Specific User Case 2: Target 70kg x 8, Actual 70kg x 8, RPE 8 -> Maintain
  const resCase2 = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e_bench',
    setNumber: 1,
    weightKg: 70,
    repsCompleted: 8,
    rpeScore: 8.0,
    targetReps: 8,
    targetWeightKg: 70
  });
  assert(
    resCase2.adaptation.suggestedAction === 'MAINTAIN' &&
    resCase2.adaptation.suggestedWeightKg === 70,
    `User Case 2 (Target: 70kg x 8, Actual: 70kg x 8, RPE 8) -> Suggests maintaining load at 70kg`
  );

  // Specific User Case 3: Target 70kg x 8, Actual 70kg x 5, RPE 10 -> Reduce load / Deload
  const resCase3 = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e_bench',
    setNumber: 1,
    weightKg: 70,
    repsCompleted: 5,
    rpeScore: 10.0,
    targetReps: 8,
    targetWeightKg: 70
  });
  assert(
    (resCase3.adaptation.suggestedAction === 'DELOAD_INTENSITY' || resCase3.adaptation.suggestedAction === 'REDUCE_WEIGHT') &&
    resCase3.adaptation.suggestedWeightKg === 63.0,
    `User Case 3 (Target: 70kg x 8, Actual: 70kg x 5, RPE 10) -> Suggests reducing load by 10% to 63kg (Got: ${resCase3.adaptation.suggestedWeightKg}kg)`
  );

  // Rule: Underload Overload (reps=6, target=6, RPE=6.0 -> +2.5kg)
  const resUnderload = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e01',
    setNumber: 1,
    weightKg: 80,
    repsCompleted: 6,
    rpeScore: 6.0,
    targetReps: 6,
    targetWeightKg: 80
  });
  assert(
    resUnderload.adaptation.trigger === 'UNDERLOAD_PROGRESSIVE_OVERLOAD' &&
    resUnderload.adaptation.suggestedAction === 'INCREASE_WEIGHT' &&
    resUnderload.adaptation.suggestedWeightKg === 82.5,
    `Underload (RPE 6.0) prompts +2.5kg progressive overload (Got: ${resUnderload.adaptation.suggestedWeightKg}kg)`
  );

  // Rule: Near-Maximal Exertion (reps=6, target=6, RPE=9.5 -> Extend rest +30s)
  const resNearMax = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e01',
    setNumber: 1,
    weightKg: 80,
    repsCompleted: 6,
    rpeScore: 9.5,
    targetReps: 6,
    targetWeightKg: 80,
    restSeconds: 90
  });
  assert(
    resNearMax.adaptation.trigger === 'NEAR_MAXIMAL_FATIGUE' &&
    resNearMax.adaptation.suggestedRestSeconds === 120,
    `Near-maximal exertion (RPE 9.5) extends rest to 120s (+30s)`
  );

  // Rule: Maximal Technical Limit (reps=6, target=6, RPE=10.0 -> Reduce 5%)
  const resMaxFailure = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e01',
    setNumber: 1,
    weightKg: 80,
    repsCompleted: 6,
    rpeScore: 10.0,
    targetReps: 6,
    targetWeightKg: 80
  });
  assert(
    resMaxFailure.adaptation.trigger === 'MAXIMAL_FAILURE' &&
    resMaxFailure.adaptation.suggestedAction === 'REDUCE_WEIGHT' &&
    resMaxFailure.adaptation.suggestedWeightKg === 76.0,
    `Maximal limit (RPE 10.0) reduces load by 5% to 76kg (Got: ${resMaxFailure.adaptation.suggestedWeightKg}kg)`
  );

  // Rule 5: Severe Fatigue (reps=4, target=6 -> Missed by 2 reps -> Deload 10%)
  const resSevere = adaptiveEngine.evaluateSetAutoregulation({
    exerciseId: 'e01',
    setNumber: 2,
    weightKg: 80,
    repsCompleted: 4,
    rpeScore: 9.5,
    targetReps: 6,
    targetWeightKg: 80,
    restSeconds: 90
  });
  assert(
    resSevere.adaptation.trigger === 'SEVERE_FATIGUE' &&
    resSevere.adaptation.suggestedAction === 'DELOAD_INTENSITY' &&
    resSevere.adaptation.suggestedWeightKg === 72.0 &&
    resSevere.adaptation.suggestedRestSeconds === 135,
    `Severe fatigue (-2 reps) drops weight by 10% to 72kg and adds +45s rest`
  );

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} / ${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`========================================\n`);
}

runTests();
