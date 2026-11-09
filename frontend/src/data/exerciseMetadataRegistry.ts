/**
 * FitMentor AI — Unified Exercise Metadata Registry
 * Incorporates RepDB & exercise-dataset.com taxonomy, MET energy expenditure,
 * safety constraints, biomechanical relations (alternatives, progressions, regressions),
 * and 3D animated kinematics.
 */

import {
  EXERCISE_3D_REGISTRY,
  Exercise3DConfig,
  CameraPreset,
  SLUG_TO_3D_ID,
} from '../config/exercise3DRegistry';

// ─── Muscle descriptor ───────────────────────────────────────────────────────

export interface ExerciseMuscle {
  /** Human-readable name shown in UI */
  name: string;
  /** Hex colour for glow / SVG highlight */
  color: string;
  /** Coarse body region used by FocusAreaMuscleMap SVG routing */
  bodyRegion:
    | 'chest'
    | 'back'
    | 'shoulder'
    | 'arm'
    | 'core'
    | 'leg'
    | 'glute'
    | 'forearm';
}

// ─── Camera views (mirrors CameraPreset shape) ───────────────────────────────

export interface ExerciseCameraViews {
  front: CameraPreset;
  side: CameraPreset;
  isometric: CameraPreset;
  defaultView: 'front' | 'side' | 'isometric';
}

// ─── Full exercise metadata interface ────────────────────────────────────────

export interface ExerciseMetadata {
  // Identity
  exerciseId: string;
  slug: string;
  displayName: string;
  category: string;
  bodyPart: 'chest' | 'back' | 'shoulders' | 'upper_arms' | 'upper_legs' | 'lower_legs' | 'core' | 'full_body';
  movementType: 'COMPOUND' | 'ISOLATION';
  forceType: 'push' | 'pull' | 'dynamic';
  met: number;

  // Muscles
  primaryMuscles: ExerciseMuscle[];
  secondaryMuscles: ExerciseMuscle[];

  // Equipment & difficulty
  equipment: 'FULL_GYM' | 'DUMBBELLS' | 'BODYWEIGHT';
  /** Human-friendly equipment label shown in UI cards */
  equipmentLabel: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  // Prescription defaults
  recommendedSets: number;
  /** Display string e.g. "6–8", "8–10", "12–15" */
  repRange: string;
  restSeconds: number;

  // Coaching content
  /** Numbered step-by-step execution instructions */
  instructions: string[];
  /** 3–5 concise biomechanical technique cues */
  formCues: string[];
  /** RepDB pro coaching & safety advice */
  tips: string[];
  /** RepDB safety & constraint tags */
  safetyTags: string[];

  // RepDB Exercise Relations Matrix
  relations?: {
    alternatives?: { id: string; name: string }[];
    progression?: { id: string; name: string };
    regression?: { id: string; name: string };
  };

  /** RepDB 512px illustrated athlete gesture images from GitHub */
  images?: {
    start: string;
    peak: string;
  };

  // 3D animation fields (sourced from exercise3DRegistry)
  movementPattern: Exercise3DConfig['movementPattern'];
  tempo: { eccentric: number; pause: number; concentric: number };
  durationSec: number;
  cameraViews: ExerciseCameraViews;
  animationAvailable: boolean;
}

const REPDB_SLUG_MAP: Record<string, string> = {
  'barbell-bench-press': 'bench-press',
  'bench-press': 'bench-press',
  'incline-db-press': 'incline-db-press',
  'close-grip-bench-press': 'close-grip-bench-press',
  'incline-dumbbell-bench-press': 'close-grip-bench-press',
  'incline-dumbbell-press': 'incline-db-press',
  'bent-over-barbell-row': 'barbell-row',
  'barbell-row': 'barbell-row',
  'lat-pulldown': 'lat-pulldown',
  'overhead-barbell-press': 'seated-barbell-overhead-press',
  'seated-barbell-overhead-press': 'seated-barbell-overhead-press',
  'arnold-press': 'arnold-press',
  'db-lateral-raise': 'lateral-raise',
  'lateral-raise': 'lateral-raise',
  'bicep-curl': 'bicep-curl',
  'barbell-curl': 'barbell-curl',
  'tricep-pushdown': 'tricep-pushdown',
  'bench-dips': 'bench-dips',
  'barbell-back-squat': 'squat',
  'squat': 'squat',
  'romanian-deadlift': 'romanian-deadlift',
  'banded-romanian-deadlift': 'banded-romanian-deadlift',
  'hanging-leg-raise': 'hanging-leg-raise',
  'farmer-walk': 'dumbbell-deadlift',
  'ab-wheel-rollout': 'ab-wheel-rollout',
  'front-squat': 'front-squat',
  'box-squat': 'box-squat',
  'bent-over-db-row': 'bent-over-db-row',
  'push-up': 'push-up',
  'close-grip-push-ups': 'close-grip-push-ups',
  'crunches': 'crunches',
  'plank': 'plank',
  'front-plank': 'plank',
  'forearm-plank': 'plank',
  'bodyweight-squat': 'bodyweight-squat',
  'air-squat': 'bodyweight-squat',
  'bulgarian-split-squat': 'bulgarian-split-squat',
  'bench-calf-stretch': 'bench-calf-stretch',
  'bench-leg-pull-in': 'bench-leg-pull-in',
  'mountain-climbers': 'mountain-climbers',
  'bicycle-crunches': 'bicycle-crunch',
  'bicycle-crunch': 'bicycle-crunch',
  'glute-bridge': 'glute-bridge',
  'jumping-jacks': 'jumping-jacks',
  'burpees': 'burpees',
  'burpee': 'burpees',
};

/**
 * Returns raw GitHub CDN URLs for RepDB 512px flat WebP illustrations
 */
export function getRepDBImageUrls(slug: string): { start: string; peak: string } {
  const mapped = REPDB_SLUG_MAP[slug] || slug;

  // Single-pose / hold / main exercises in RepDB GitHub dataset:
  if (mapped === 'plank' || mapped === 'forearm-plank' || mapped === 'front-plank') {
    const plankUrl = 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/plank-main.webp';
    return { start: plankUrl, peak: plankUrl };
  }
  if (mapped === 'burpees' || mapped === 'burpee') {
    const burpeeUrl = 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/burpees-main.webp';
    return { start: burpeeUrl, peak: burpeeUrl };
  }
  if (mapped === 'bench-calf-stretch') {
    return {
      start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-calf-raise-start.webp',
      peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bodyweight-calf-raise-peak.webp'
    };
  }
  if (mapped === 'bicycle-crunches' || mapped === 'bicycle-crunch') {
    return {
      start: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bicycle-crunch-start.webp',
      peak: 'https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/bicycle-crunch-peak.webp'
    };
  }

  return {
    start: `https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/${mapped}-start.webp`,
    peak: `https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat/${mapped}-peak.webp`,
  };
}

// ─── Default camera views used when no 3D config exists ──────────────────────

const DEFAULT_CAMERA_VIEWS: ExerciseCameraViews = {
  isometric: { position: [2.5, 2.0, 2.8], target: [0, 1.0, 0] },
  front:     { position: [0,   2.0, 3.2], target: [0, 1.0, 0] },
  side:      { position: [3.2, 1.4, 0],   target: [0, 1.0, 0] },
  defaultView: 'isometric',
};

const DEFAULT_TEMPO = { eccentric: 2, pause: 1, concentric: 1 };

// Helper: pull camera views from the 3D registry
function camFrom(cfg: Exercise3DConfig): ExerciseCameraViews {
  return {
    front:       cfg.cameraViews.front,
    side:        cfg.cameraViews.side,
    isometric:   cfg.cameraViews.isometric,
    defaultView: cfg.cameraViews.defaultView,
  };
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const EXERCISE_METADATA_REGISTRY: Record<string, ExerciseMetadata> = {

  // 1. Barbell Bench Press
  'e0000000-0000-0000-0000-000000000001': {
    exerciseId: 'e0000000-0000-0000-0000-000000000001',
    slug: 'barbell-bench-press',
    displayName: 'Barbell Bench Press',
    category: 'Chest',
    bodyPart: 'chest',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 6.0,
    primaryMuscles: [
      { name: 'Pectoralis Major', color: '#22d3ee', bodyRegion: 'chest' },
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoid', color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Triceps Brachii',  color: '#f59e0b', bodyRegion: 'arm'      },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell + Flat Bench',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '6–8',
    restSeconds: 120,
    instructions: [
      'Set the barbell at arm-length height above the rack and load your working weight.',
      'Lie flat on the bench with eyes directly under the bar.',
      'Retract and depress your shoulder blades firmly into the bench pad.',
      'Plant both feet flat on the floor — maintain 5 points of contact throughout.',
      'Un-rack the bar with a grip slightly wider than shoulder-width.',
      'Inhale and lower the bar with control to your mid-sternum, keeping elbows at ~45–60°.',
      'Drive the bar explosively back to lockout while exhaling — squeeze the chest at the top.',
      'Re-rack carefully only after both arms are fully locked out.',
    ],
    formCues: [
      'Keep elbows tucked at 45–60°, never flare perpendicular to the torso.',
      'Maintain a slight arch in the lower back — do not bridge excessively.',
      'Bar path travels in a slight diagonal from lower chest on descent to over clavicles at lockout.',
      'Squeeze the bar as if trying to bend it toward you — creates lat tension for shoulder stability.',
    ],
    tips: [
      'Pin the shoulder blades back and down before un-racking to protect rotator cuffs.',
      'Maintain steady leg drive into the floor without lifting glutes from the bench.',
      'Control the descent for 2–3 seconds to maximize mechanical tension.'
    ],
    safetyTags: ['shoulder_stability', 'controlled_eccentric', 'wrist_stacked'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000002', name: 'Incline Dumbbell Press' },
        { id: 'e0000000-0000-0000-0000-000000000016', name: 'Push-Up' }
      ],
      regression: { id: 'e0000000-0000-0000-0000-000000000016', name: 'Push-Up' },
      progression: { id: 'close-grip-bench', name: 'Paused Bench Press' }
    },
    movementPattern: 'BENCH_PRESS',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000001'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000001'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000001']),
    animationAvailable: true,
  },

  // 2. Incline Dumbbell Press
  'e0000000-0000-0000-0000-000000000002': {
    exerciseId: 'e0000000-0000-0000-0000-000000000002',
    slug: 'incline-db-press',
    displayName: 'Incline Dumbbell Press',
    category: 'Chest',
    bodyPart: 'chest',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 5.5,
    primaryMuscles: [
      { name: 'Upper Pectoralis Major', color: '#22d3ee', bodyRegion: 'chest' },
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoid', color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Triceps Brachii',  color: '#f59e0b', bodyRegion: 'arm'      },
    ],
    equipment: 'DUMBBELLS',
    equipmentLabel: 'Dumbbells + Incline Bench',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '8–10',
    restSeconds: 90,
    instructions: [
      'Set the bench to a 30–45° incline angle.',
      'Hold a dumbbell in each hand, resting them on your thighs before lifting.',
      'Use a leg kick to help bring the dumbbells to shoulder height as you lie back.',
      'Position dumbbells at chest level with palms facing forward, elbows at ~75°.',
      'Inhale, then press the dumbbells in an arc upward until arms are nearly locked out.',
      'Squeeze the upper chest at the top without clanging the dumbbells together.',
      'Lower slowly with control back to start — feel the stretch in the upper chest.',
    ],
    formCues: [
      'Drive elbows slightly forward (not straight out) to maximally recruit the upper pec.',
      'Keep wrists stacked directly over elbows throughout the movement.',
      'Avoid overarching the lower back — keep glutes lightly pressed into the pad.',
      'Control the descent — do not let gravity dictate the speed on the way down.',
    ],
    tips: [
      'Keep incline at 30° to target clavicular pecs without turning it into a shoulder press.',
      'Allow dumbbells to converge at the peak for maximum contraction.',
      'Do not clang dumbbells at the top — keep constant tension on the muscle.'
    ],
    safetyTags: ['shoulder_safe', 'wrist_neutral', 'no_axial_load'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000001', name: 'Barbell Bench Press' }]
    },
    movementPattern: 'BENCH_PRESS',
    tempo: DEFAULT_TEMPO,
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 3. Barbell Bent-Over Row
  'e0000000-0000-0000-0000-000000000003': {
    exerciseId: 'e0000000-0000-0000-0000-000000000003',
    slug: 'bent-over-barbell-row',
    displayName: 'Barbell Bent-Over Row',
    category: 'Back',
    bodyPart: 'back',
    movementType: 'COMPOUND',
    forceType: 'pull',
    met: 6.0,
    primaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#22d3ee', bodyRegion: 'back' },
      { name: 'Rhomboids',        color: '#06b6d4', bodyRegion: 'back' },
    ],
    secondaryMuscles: [
      { name: 'Posterior Deltoid', color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Biceps Brachii',   color: '#f59e0b', bodyRegion: 'arm'      },
      { name: 'Erector Spinae',   color: '#34d399', bodyRegion: 'back'     },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '6–8',
    restSeconds: 90,
    instructions: [
      'Stand with feet hip-width apart, grip the bar just outside shoulder-width (overhand).',
      'Hinge at the hips until your torso is at roughly 45° to the floor with a neutral spine.',
      'Let the bar hang straight down from your shoulders with a slight knee bend.',
      'Inhale, then drive your elbows back and up, pulling the bar toward your lower ribcage.',
      'Squeeze your shoulder blades together hard at the top of the movement.',
      'Lower the bar under control, fully extending the arms before the next rep.',
    ],
    formCues: [
      'Lead with the elbows — the hands are just hooks, the lats do the work.',
      'Keep the lower back neutral and braced — spinal flexion under load risks injury.',
      'Pull to the lower ribcage/navel, not the upper chest — upper chest pulling flares elbows.',
      'Brace the core as if expecting a punch before every rep.',
    ],
    tips: [
      'The torso angle stays fixed throughout — no rocking up to help the barbell.',
      'Pull to the lower ribs/belly, not to the chest; that line keeps the lats loaded.',
      'If the lower back rounds, hinge slightly less and reset before the next set.'
    ],
    safetyTags: ['neutral_spine', 'pull_day', 'hip_hinge'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000004', name: 'Lat Pulldown' },
        { id: 'e0000000-0000-0000-0000-000000000015', name: 'Bent-Over DB Row' }
      ],
      regression: { id: 'e0000000-0000-0000-0000-000000000004', name: 'Lat Pulldown' },
      progression: { id: 'pendlay-row', name: 'Pendlay Row' }
    },
    movementPattern: 'BARBELL_ROW',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000003'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000003'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000003']),
    animationAvailable: true,
  },

  // 4. Lat Pulldown
  'e0000000-0000-0000-0000-000000000004': {
    exerciseId: 'e0000000-0000-0000-0000-000000000004',
    slug: 'lat-pulldown',
    displayName: 'Lat Pulldown',
    category: 'Back',
    bodyPart: 'back',
    movementType: 'COMPOUND',
    forceType: 'pull',
    met: 5.0,
    primaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#22d3ee', bodyRegion: 'back' },
    ],
    secondaryMuscles: [
      { name: 'Biceps Brachii',    color: '#8b5cf6', bodyRegion: 'arm'      },
      { name: 'Posterior Deltoid', color: '#f59e0b', bodyRegion: 'shoulder' },
      { name: 'Rhomboids',         color: '#34d399', bodyRegion: 'back'     },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Cable Machine + Lat Bar',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '10–12',
    restSeconds: 90,
    instructions: [
      'Sit at the lat pulldown machine and secure your thighs under the pad.',
      'Grip the bar slightly wider than shoulder-width with an overhand grip.',
      'Lean back very slightly (10–15°) and retract your shoulder blades.',
      'Exhale and pull the bar down to your upper chest, driving elbows toward your hips.',
      'Hold the contraction briefly, squeezing your lats at the bottom position.',
      'Slowly let the bar rise back to the top, arms fully extended, feeling the lat stretch.',
    ],
    formCues: [
      'Initiate with the elbows, not the biceps — think "elbows to your back pockets".',
      'Avoid using momentum or excessive torso rock — keep the movement strict.',
      'Depress the shoulder blades before pulling — this sets the lats to engage first.',
      'Full stretch at the top on every rep maximises lat recruitment through full ROM.',
    ],
    tips: [
      'Depress scapulae before flexing elbows to isolate lats from biceps.',
      'Do not pull behind the neck — pull always to upper clavicle line.',
      'Control the 2-second ascent for optimal eccentric muscle growth.'
    ],
    safetyTags: ['lower_back_safe', 'knee_safe', 'no_axial_load'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000003', name: 'Barbell Bent-Over Row' }],
      progression: { id: 'pull-up', name: 'Weighted Pull-Up' }
    },
    movementPattern: 'BARBELL_ROW',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 5. Overhead Barbell Press
  'e0000000-0000-0000-0000-000000000005': {
    exerciseId: 'e0000000-0000-0000-0000-000000000005',
    slug: 'overhead-barbell-press',
    displayName: 'Overhead Barbell Press',
    category: 'Shoulders',
    bodyPart: 'shoulders',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 6.0,
    primaryMuscles: [
      { name: 'Anterior Deltoid',  color: '#22d3ee', bodyRegion: 'shoulder' },
      { name: 'Lateral Deltoid',   color: '#06b6d4', bodyRegion: 'shoulder' },
    ],
    secondaryMuscles: [
      { name: 'Triceps Brachii',      color: '#8b5cf6', bodyRegion: 'arm'  },
      { name: 'Upper Trapezius',      color: '#f59e0b', bodyRegion: 'back' },
      { name: 'Serratus Anterior',    color: '#34d399', bodyRegion: 'core' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell',
    difficulty: 'ADVANCED',
    recommendedSets: 3,
    repRange: '6–8',
    restSeconds: 90,
    instructions: [
      'Set the barbell in a squat rack at upper-chest height and grip just outside shoulder-width.',
      'Step under the bar and position it across your front deltoids — not resting on your neck.',
      'Un-rack, step back, and set your stance at shoulder-width with a slight forward lean.',
      'Brace your core hard and squeeze your glutes to create a rigid foundation.',
      'Tuck your chin slightly, then press the bar in a vertical path directly overhead.',
      'At the top, shrug the traps upward and lock out the elbows fully.',
      'Lower the bar under control back to the starting position at front deltoid level.',
    ],
    formCues: [
      'Bar stays directly over the midfoot throughout — no forward drift.',
      'Think "push your head through" as the bar passes your face — let your face move through the bar path.',
      'Glutes and core braced the entire time — prevents lumbar hyperextension.',
      'Full lockout at the top every rep — partial lockouts underload the triceps and shoulders.',
    ],
    tips: [
      'Brace glutes and abs hard before the press to prevent arching the lower back.',
      'Keep vertical forearm angle right beneath the barbell for optimal mechanical advantage.',
      'Slightly push the head through at the top to secure lockout over midfoot.'
    ],
    safetyTags: ['core_brace', 'strict_lockout', 'push_day'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000006', name: 'Dumbbell Lateral Raise' }],
      regression: { id: 'seated-db-press', name: 'Seated Dumbbell Shoulder Press' }
    },
    movementPattern: 'OVERHEAD_PRESS',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000005'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000005'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000005']),
    animationAvailable: true,
  },

  // 6. Dumbbell Lateral Raise
  'e0000000-0000-0000-0000-000000000006': {
    exerciseId: 'e0000000-0000-0000-0000-000000000006',
    slug: 'db-lateral-raise',
    displayName: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    bodyPart: 'shoulders',
    movementType: 'ISOLATION',
    forceType: 'push',
    met: 4.5,
    primaryMuscles: [
      { name: 'Lateral Deltoid', color: '#22d3ee', bodyRegion: 'shoulder' },
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoid',  color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Supraspinatus',     color: '#f59e0b', bodyRegion: 'shoulder' },
    ],
    equipment: 'DUMBBELLS',
    equipmentLabel: 'Dumbbells',
    difficulty: 'BEGINNER',
    recommendedSets: 4,
    repRange: '12–15',
    restSeconds: 60,
    instructions: [
      'Stand with feet hip-width apart, holding a dumbbell in each hand at your sides.',
      'Allow a very slight forward lean (5–10°) to shift emphasis onto the lateral head.',
      'With a soft bend in the elbows, raise the dumbbells out to the sides.',
      'Lead with the elbows — imagine pouring water from a jug — pinky slightly higher than thumb.',
      'Stop when your arms are parallel to the floor (90°) to avoid impingement.',
      'Lower the weights slowly and under control — the eccentric drives hypertrophy here.',
    ],
    formCues: [
      'Never use momentum or shrug the traps — the lateral delt must do the work.',
      'Keep a slight elbow bend (10–15°) to protect the joint and maximise muscle tension.',
      'Stop at shoulder height — going above shifts load to the traps, reducing lateral delt stimulus.',
      'Use lighter weights with strict form rather than ego loading with body english.',
    ],
    tips: [
      'Move dumbbells within the scapular plane (15–30° forward) for joint safety.',
      'Do not shrug traps at the peak; keep shoulders depressed.',
      'Focus on slow 3-second descent on every rep.'
    ],
    safetyTags: ['knee_safe', 'no_axial_load', 'scapular_plane'],
    relations: {
      alternatives: [{ id: 'cable-lateral-raise', name: 'Cable Lateral Raise' }]
    },
    movementPattern: 'OVERHEAD_PRESS',
    tempo: { eccentric: 3, pause: 0, concentric: 1 },
    durationSec: 3.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 7. Barbell Bicep Curl
  'e0000000-0000-0000-0000-000000000007': {
    exerciseId: 'e0000000-0000-0000-0000-000000000007',
    slug: 'bicep-curl',
    displayName: 'Barbell Bicep Curl',
    category: 'Biceps',
    bodyPart: 'upper_arms',
    movementType: 'ISOLATION',
    forceType: 'pull',
    met: 4.5,
    primaryMuscles: [
      { name: 'Biceps Brachii', color: '#22d3ee', bodyRegion: 'arm' },
    ],
    secondaryMuscles: [
      { name: 'Brachialis',  color: '#8b5cf6', bodyRegion: 'arm'     },
      { name: 'Brachioradialis', color: '#f59e0b', bodyRegion: 'forearm' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell (or EZ-bar)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '8–12',
    restSeconds: 60,
    instructions: [
      'Stand holding a barbell with an underhand (supinated) grip, hands shoulder-width apart.',
      'Let the bar hang at arms length against your thighs — this is the start position.',
      'Keep your elbows pinned to your sides throughout the entire movement.',
      'Curl the bar up in an arc toward your upper chest while exhaling.',
      'Squeeze the biceps hard at the top — pause for 1 second.',
      'Lower the bar slowly under control (3–4 seconds) back to the start.',
    ],
    formCues: [
      'Elbows stay stationary — they are the pivot, not the engine.',
      'Avoid rocking the torso or using hips to swing the bar up — strict form only.',
      'Full extension at the bottom on every rep to maximise bicep stretch.',
      'Wrists stay neutral — no excessive flexion that shifts load off the biceps.',
    ],
    tips: [
      'Keep elbows pinned to your sides — avoid drifting them forward.',
      'Squeeze at the peak contraction for 1 second before lowering.',
      'Eliminate swinging or body momentum.'
    ],
    safetyTags: ['knee_safe', 'shoulder_safe', 'no_axial_load'],
    relations: {
      alternatives: [{ id: 'incline-db-curl', name: 'Incline Dumbbell Curl' }]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: { eccentric: 3, pause: 1, concentric: 1 },
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 8. Tricep Rope Pushdown
  'e0000000-0000-0000-0000-000000000008': {
    exerciseId: 'e0000000-0000-0000-0000-000000000008',
    slug: 'tricep-pushdown',
    displayName: 'Tricep Rope Pushdown',
    category: 'Triceps',
    bodyPart: 'upper_arms',
    movementType: 'ISOLATION',
    forceType: 'push',
    met: 4.5,
    primaryMuscles: [
      { name: 'Triceps Brachii (all 3 heads)', color: '#22d3ee', bodyRegion: 'arm' },
    ],
    secondaryMuscles: [
      { name: 'Anconeus',          color: '#8b5cf6', bodyRegion: 'arm'     },
      { name: 'Forearm Extensors', color: '#f59e0b', bodyRegion: 'forearm' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Cable Machine + Rope Attachment',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '10–15',
    restSeconds: 60,
    instructions: [
      'Attach a rope to a high pulley cable station.',
      'Stand facing the machine, feet shoulder-width, slight forward lean at the hips.',
      'Grip the rope with both hands in a neutral grip, thumbs pointing up.',
      'Pin your elbows to your sides — they must not move during the exercise.',
      'Push the rope downward by extending the elbows until arms are fully locked out.',
      'At the bottom, spread the rope ends outward to maximise the tricep contraction.',
      'Slowly let the rope rise back up, elbows still fixed, until hands are near chin level.',
    ],
    formCues: [
      'Elbows are anchored to your sides — the only joint moving is the elbow.',
      'Spread the rope at the bottom to fully contract the lateral tricep head.',
      'Do not let the elbows drift forward as fatigue sets in — reset if needed.',
      'Maintain a slight forward lean to keep tension on the triceps throughout the range.',
    ],
    tips: [
      'Keep elbows firmly anchored to torso — only forearms move.',
      'Spread the rope ends apart at full lockout for intense peak contraction.',
      'Control eccentric return without letting the cable yank your arms up.'
    ],
    safetyTags: ['elbow_safe', 'lower_back_safe', 'no_axial_load'],
    relations: {
      alternatives: [{ id: 'overhead-tricep-ext', name: 'Overhead Cable Tricep Extension' }]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 3.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 9. Barbell Back Squat
  'e0000000-0000-0000-0000-000000000009': {
    exerciseId: 'e0000000-0000-0000-0000-000000000009',
    slug: 'barbell-back-squat',
    displayName: 'Barbell Back Squat',
    category: 'Legs',
    bodyPart: 'upper_legs',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 7.0,
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee', bodyRegion: 'leg'   },
      { name: 'Gluteus Maximus',    color: '#06b6d4', bodyRegion: 'glute' },
    ],
    secondaryMuscles: [
      { name: 'Hamstrings',             color: '#8b5cf6', bodyRegion: 'leg'  },
      { name: 'Adductors',              color: '#f59e0b', bodyRegion: 'leg'  },
      { name: 'Erector Spinae & Core',  color: '#34d399', bodyRegion: 'back' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell + Squat Rack',
    difficulty: 'ADVANCED',
    recommendedSets: 4,
    repRange: '4–6',
    restSeconds: 120,
    instructions: [
      'Set the bar at upper-chest height in a squat rack. Step under it with a high-bar or low-bar position.',
      'Create upper-back tension by squeezing your shoulder blades together.',
      'Un-rack, take 2–3 steps back, and set feet at shoulder-width with toes flared 15–30° out.',
      'Take a big breath into your belly (Valsalva), brace the core hard.',
      'Initiate the descent by simultaneously breaking at hips and knees — do not lead with the knees.',
      'Descend until the hip crease is at or below the top of the kneecap (parallel or below).',
      'Drive back up by pressing the floor away, keeping chest tall and knees tracking over toes.',
      'Lock out hips and knees fully at the top before the next rep.',
    ],
    formCues: [
      'Knees must track in line with the toes — cue "spread the floor" to prevent valgus collapse.',
      'Keep the chest up and torso as vertical as mobility allows — excessive forward lean compresses the spine.',
      'Breath into the belly (360° brace), not the chest — this creates intra-abdominal pressure.',
      'Bar stays over midfoot throughout — assess from a side-view if possible.',
    ],
    tips: [
      'Maintain strong intra-abdominal pressure throughout the entire repetition.',
      'Knees must track in line with toes — never let them cave inwards.',
      'Descend until hip crease breaks parallel for complete glute/quad recruitment.'
    ],
    safetyTags: ['depth_control', 'knee_tracking', 'hip_mobility', 'leg_day'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000014', name: 'Front Squat' },
        { id: 'goblet-squat', name: 'Goblet Squat' }
      ],
      regression: { id: 'goblet-squat', name: 'Goblet Squat' },
      progression: { id: 'paused-squat', name: 'Paused Barbell Squat' }
    },
    movementPattern: 'SQUAT',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000009'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000009'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000009']),
    animationAvailable: true,
  },

  // 10. Romanian Deadlift
  'e0000000-0000-0000-0000-000000000010': {
    exerciseId: 'e0000000-0000-0000-0000-000000000010',
    slug: 'romanian-deadlift',
    displayName: 'Romanian Deadlift',
    category: 'Legs',
    bodyPart: 'upper_legs',
    movementType: 'COMPOUND',
    forceType: 'pull',
    met: 6.5,
    primaryMuscles: [
      { name: 'Hamstrings',      color: '#22d3ee', bodyRegion: 'leg'   },
      { name: 'Gluteus Maximus', color: '#06b6d4', bodyRegion: 'glute' },
    ],
    secondaryMuscles: [
      { name: 'Erector Spinae', color: '#8b5cf6', bodyRegion: 'back'    },
      { name: 'Adductors',      color: '#f59e0b', bodyRegion: 'leg'     },
      { name: 'Trapezius',      color: '#34d399', bodyRegion: 'back'    },
      { name: 'Forearms',       color: '#a3e635', bodyRegion: 'forearm' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '8–10',
    restSeconds: 90,
    instructions: [
      'Stand with the bar against your shins, feet hip-width apart, overhand or mixed grip.',
      'Begin standing: deadlift or clean the bar to the standing position — this is your start.',
      'Maintain a soft, micro-bend in the knees — this is not a straight-leg deadlift.',
      'Push your hips backward, hinging at the hip joint, and let the bar slide down your thighs.',
      'Continue until you feel a deep stretch in the hamstrings (typically mid-shin level).',
      'Drive the hips forward powerfully to stand back up — squeeze the glutes at lockout.',
      'Do not allow the lower back to round at any point in the movement.',
    ],
    formCues: [
      'The bar stays in contact with or very close to the thighs throughout — bar drift increases lower back stress.',
      'Hinge at the hip, not the waist — think "hips back", not "chest down".',
      'Maintain a long neutral spine — imagine a broomstick from skull to tailbone.',
      'The hamstring stretch at the bottom is the signal to reverse — go to your mobility limit, not beyond.',
    ],
    tips: [
      'Hinge at hips like closing a car door with your glutes — keep knees soft, not locked.',
      'Keep the bar shaving down your thighs to minimize lumbar shear stress.',
      'Contract glutes powerfully at the top to complete lockout.'
    ],
    safetyTags: ['hip_hinge', 'hamstring_stretch', 'neutral_spine', 'pull_day'],
    relations: {
      alternatives: [{ id: 'db-rdl', name: 'Dumbbell Romanian Deadlift' }],
      regression: { id: 'glute-bridge', name: 'Glute Bridge' },
      progression: { id: 'snatch-grip-rdl', name: 'Snatch-Grip RDL' }
    },
    movementPattern: 'ROMANIAN_DEADLIFT',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000010'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000010'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000010']),
    animationAvailable: true,
  },

  // 11. Hanging Leg Raise
  'e0000000-0000-0000-0000-000000000011': {
    exerciseId: 'e0000000-0000-0000-0000-000000000011',
    slug: 'hanging-leg-raise',
    displayName: 'Hanging Leg Raise',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'ISOLATION',
    forceType: 'pull',
    met: 5.0,
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee', bodyRegion: 'core' },
    ],
    secondaryMuscles: [
      { name: 'Iliopsoas (Hip Flexors)', color: '#8b5cf6', bodyRegion: 'core' },
      { name: 'Obliques',               color: '#f59e0b', bodyRegion: 'core' },
      { name: 'Forearms & Lats',        color: '#34d399', bodyRegion: 'back' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'Pull-up Bar',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 3,
    repRange: '10–15',
    restSeconds: 60,
    instructions: [
      'Hang from a pull-up bar with an overhand grip, hands shoulder-width apart.',
      'Activate the shoulders (active hang) — do not passively hang from passive structures.',
      'Posteriorly tilt the pelvis (tuck your tailbone) before lifting — this pre-activates the abs.',
      'Exhale and lift your legs upward using abdominal contraction, not hip flexor momentum.',
      'Raise until thighs are at least parallel to the floor (or higher if strength allows).',
      'Pause at the top, squeeze the abs, then slowly lower legs under control.',
      'Do not swing or use momentum — if swinging occurs, pause and reset before the next rep.',
    ],
    formCues: [
      'Posterior pelvic tilt before and during the movement — tailbone points forward.',
      'Exhale forcefully as you lift — the abdominal compression assists spinal flexion.',
      'Control the eccentric (lowering) phase — this is where significant tension is built.',
      'If straight-leg form breaks down, tuck the knees and progress over time.',
    ],
    tips: [
      'Tilt pelvis backward before lifting legs to ensure rectus abdominis drives the rep.',
      'Do not swing or kip — if swinging starts, stop and perform a dead-hang reset.',
      'Control the lowering phase completely.'
    ],
    safetyTags: ['core_focus', 'calisthenics', 'grip_strength'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000013', name: 'Ab Wheel Rollout' }],
      regression: { id: 'knee-tuck-hang', name: 'Hanging Knee Tuck' }
    },
    movementPattern: 'LEG_RAISE',
    tempo: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000011'].tempo,
    durationSec: EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000011'].durationSec,
    cameraViews: camFrom(EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000011']),
    animationAvailable: true,
  },

  // 12. Kettlebell Farmer Walk
  'e0000000-0000-0000-0000-000000000012': {
    exerciseId: 'e0000000-0000-0000-0000-000000000012',
    slug: 'farmer-walk',
    displayName: 'Farmer Walk',
    category: 'Full Body',
    bodyPart: 'full_body',
    movementType: 'COMPOUND',
    forceType: 'dynamic',
    met: 7.5,
    primaryMuscles: [
      { name: 'Trapezius (upper/mid)', color: '#22d3ee', bodyRegion: 'back'    },
      { name: 'Forearms & Grip',       color: '#06b6d4', bodyRegion: 'forearm' },
    ],
    secondaryMuscles: [
      { name: 'Core (anti-lateral flexion)', color: '#8b5cf6', bodyRegion: 'core' },
      { name: 'Quadriceps & Glutes',         color: '#f59e0b', bodyRegion: 'leg'  },
      { name: 'Rhomboids',                   color: '#34d399', bodyRegion: 'back' },
    ],
    equipment: 'DUMBBELLS',
    equipmentLabel: 'Dumbbells / Kettlebells',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '20–30m walk',
    restSeconds: 60,
    instructions: [
      'Pick up a heavy dumbbell or kettlebell in each hand using proper deadlift mechanics.',
      'Stand tall — chest up, shoulders retracted and depressed, core braced.',
      'Walk forward at a controlled, deliberate pace using short, stable strides.',
      'Keep the weights from swaying — your torso should remain perfectly upright.',
      'Continue for the prescribed distance or time (typically 20–30 metres per set).',
      'Set the weights down with a hip-hinge motion — never round the lower back on descent.',
    ],
    formCues: [
      'Walk tall — any lateral torso lean means the weight is too heavy for strict form.',
      'Shoulders packed down and back — resist the urge to shrug as you fatigue.',
      'Breathe normally — do not hold your breath for the entire walk.',
      'Grip the handles hard — the forearm and grip strength is a primary training stimulus here.',
    ],
    tips: [
      'Maintain an upright posture with shoulders retracted and depressed.',
      'Take short, deliberate strides to prevent lateral pelvis rocking.',
      'Crush the grips to develop forearm and wrist stability.'
    ],
    safetyTags: ['posture_reinforcement', 'grip_strength', 'core_bracing'],
    relations: {
      alternatives: [{ id: 'suitcase-carry', name: 'Suitcase Carry' }]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: { eccentric: 1, pause: 0, concentric: 1 },
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
  },

  // 13. Ab Wheel Rollout (RepDB iconic core)
  'e0000000-0000-0000-0000-000000000013': {
    exerciseId: 'e0000000-0000-0000-0000-000000000013',
    slug: 'ab-wheel-rollout',
    displayName: 'Ab Wheel Rollout',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'COMPOUND',
    forceType: 'pull',
    met: 6.0,
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee', bodyRegion: 'core' },
      { name: 'Transverse Abdominis', color: '#06b6d4', bodyRegion: 'core' },
    ],
    secondaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#8b5cf6', bodyRegion: 'back' },
      { name: 'Anterior Deltoid', color: '#f59e0b', bodyRegion: 'shoulder' },
      { name: 'Obliques', color: '#34d399', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'Ab Wheel Roller',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 3,
    repRange: '8–12',
    restSeconds: 60,
    instructions: [
      'Kneel on the floor and grip the ab wheel handles shoulder-width apart.',
      'Brace the core hard so the lower back stays in neutral alignment.',
      'Roll the wheel slowly forward, extending the body as far as you can control.',
      'Stop before the hips sag or the lower back arches.',
      'Pull the wheel back toward your knees by actively contracting the abs.',
    ],
    formCues: [
      'Brace the core before each rep — never let the lower back sag.',
      'Build range gradually, stopping short of any lumbar strain.',
      'Drop to a wall stop if you cannot control the deep bottom stretch.',
    ],
    tips: [
      'Brace the core before each rep — do not let the lower back arch.',
      'Build range gradually, stopping short of any hip sag.',
      'Pull back through the abdominal wall, not by pulling with the arms.'
    ],
    safetyTags: ['anti_extension', 'core_focus', 'lower_back_stability'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000011', name: 'Hanging Leg Raise' }],
      regression: { id: 'plank', name: 'Standard RKC Plank' }
    },
    movementPattern: 'LEG_RAISE',
    tempo: { eccentric: 3, pause: 1, concentric: 1 },
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 14. Front Squat (RepDB iconic quad-builder)
  'e0000000-0000-0000-0000-000000000014': {
    exerciseId: 'e0000000-0000-0000-0000-000000000014',
    slug: 'front-squat',
    displayName: 'Front Squat',
    category: 'Legs',
    bodyPart: 'upper_legs',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 6.5,
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee', bodyRegion: 'leg' },
      { name: 'Gluteus Maximus', color: '#06b6d4', bodyRegion: 'glute' },
    ],
    secondaryMuscles: [
      { name: 'Rectus Abdominis & Core', color: '#8b5cf6', bodyRegion: 'core' },
      { name: 'Upper Trapezius', color: '#f59e0b', bodyRegion: 'back' },
      { name: 'Hamstrings', color: '#34d399', bodyRegion: 'leg' },
    ],
    equipment: 'FULL_GYM',
    equipmentLabel: 'Barbell + Rack',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '6–8',
    restSeconds: 90,
    instructions: [
      'Un-rack the bar resting across your anterior deltoids with high elbows.',
      'Stand with feet shoulder-width, chest tall and core rigid.',
      'Squat straight down, keeping your torso as upright as possible.',
      'Descend until thighs are parallel to the floor.',
      'Drive powerfully through midfoot back to standing lockout.',
    ],
    formCues: [
      'Maintain high elbows throughout the entire descent and ascent.',
      'Keep the torso upright — forward lean dumps the bar forward.',
      'Track knees out over second and third toes.',
    ],
    tips: [
      'Maintain high elbows to keep the bar stable on the deltoids.',
      'A more upright torso increases quad activation and protects the lumbar spine.',
      'Drive knees out over toes throughout the repetition.'
    ],
    safetyTags: ['knee_tracking', 'upright_torso', 'quad_dominant'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000009', name: 'Barbell Back Squat' }],
      regression: { id: 'goblet-squat', name: 'Goblet Squat' }
    },
    movementPattern: 'SQUAT',
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 15. Bent-Over Dumbbell Row (RepDB classic sample)
  'e0000000-0000-0000-0000-000000000015': {
    exerciseId: 'e0000000-0000-0000-0000-000000000015',
    slug: 'bent-over-db-row',
    displayName: 'Bent-Over Dumbbell Row',
    category: 'Back',
    bodyPart: 'back',
    movementType: 'COMPOUND',
    forceType: 'pull',
    met: 6.0,
    primaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#22d3ee', bodyRegion: 'back' },
      { name: 'Rhomboids', color: '#06b6d4', bodyRegion: 'back' },
    ],
    secondaryMuscles: [
      { name: 'Biceps Brachii', color: '#8b5cf6', bodyRegion: 'arm' },
      { name: 'Posterior Deltoid', color: '#f59e0b', bodyRegion: 'shoulder' },
    ],
    equipment: 'DUMBBELLS',
    equipmentLabel: 'Dumbbells',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 4,
    repRange: '8–10',
    restSeconds: 90,
    instructions: [
      'Stand hip-width apart holding a dumbbell in each hand, palms facing in.',
      'Hinge at hips with a flat back until torso is 30–45° from horizontal.',
      'Pull both dumbbells up and slightly back, driving elbows past the ribs.',
      'Squeeze upper back at the top, keeping elbows tucked.',
      'Lower under control to starting position with arms extended.',
    ],
    formCues: [
      'The torso angle stays fixed throughout — no jerking up.',
      'Pull to lower ribs, not chest, to keep the lats loaded.',
      'Keep wrists neutral and squeeze the rhomboids.',
    ],
    tips: [
      'Torso angle stays fixed throughout — no rocking up to help the weights.',
      'Pull to lower ribs rather than chest to keep tension on the lats.',
      'If lower back rounds, reduce the hinge angle slightly.'
    ],
    safetyTags: ['pull_day', 'back_day', 'hip_hinge'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000003', name: 'Barbell Bent-Over Row' }]
    },
    movementPattern: 'BARBELL_ROW',
    tempo: DEFAULT_TEMPO,
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 16. Push-Up (RepDB bodyweight staple)
  'e0000000-0000-0000-0000-000000000016': {
    exerciseId: 'e0000000-0000-0000-0000-000000000016',
    slug: 'push-up',
    displayName: 'Push-Up',
    category: 'Chest',
    bodyPart: 'chest',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 4.0,
    primaryMuscles: [
      { name: 'Pectoralis Major', color: '#22d3ee', bodyRegion: 'chest' },
    ],
    secondaryMuscles: [
      { name: 'Triceps Brachii', color: '#8b5cf6', bodyRegion: 'arm' },
      { name: 'Anterior Deltoid', color: '#f59e0b', bodyRegion: 'shoulder' },
      { name: 'Rectus Abdominis', color: '#34d399', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'Bodyweight',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '12–20',
    restSeconds: 60,
    instructions: [
      'Place hands slightly wider than shoulder-width, fingers pointing forward.',
      'Set feet together, form a rigid straight line from heels to crown.',
      'Lower chest toward the floor until elbows reach 90° or chest brushes floor.',
      'Press the floor away to full elbow extension.',
      'Keep core and glutes engaged to prevent hip sagging.',
    ],
    formCues: [
      'Elbows should track at roughly 45° to torso, forming an arrow shape.',
      'Do not let hips sag or pike upward.',
      'Keep neck neutral — gaze at floor 6 inches ahead.',
    ],
    tips: [
      'Maintain rigid plank tension — squeeze glutes and brace abs.',
      'Do not flare elbows wide at 90° to avoid shoulder impingement.',
      'Push all the way to full protraction at the top.'
    ],
    safetyTags: ['shoulder_safe', 'wrist_neutral', 'calisthenics', 'push_day'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000001', name: 'Barbell Bench Press' }]
    },
    movementPattern: 'BENCH_PRESS',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 17. Abdominal Floor Crunches (Core, Zero Equipment)
  'e0000000-0000-0000-0000-000000000017': {
    exerciseId: 'e0000000-0000-0000-0000-000000000017',
    slug: 'crunches',
    displayName: 'Abdominal Floor Crunches',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'ISOLATION',
    forceType: 'pull',
    met: 4.0,
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee', bodyRegion: 'core' },
    ],
    secondaryMuscles: [
      { name: 'Obliques', color: '#8b5cf6', bodyRegion: 'core' },
      { name: 'Transverse Abdominis', color: '#f59e0b', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '15–25',
    restSeconds: 45,
    instructions: [
      'Lie flat on your back on a mat with knees bent at ~90° and feet flat on the floor.',
      'Place fingertips lightly behind ears or cross arms across chest; do not pull on your neck.',
      'Exhale and contract your abdominals, curling your shoulders and upper ribcage toward your pelvis.',
      'Pause for 1 second at maximum contraction, then lower down under control.'
    ],
    formCues: [
      'Keep your lower back anchored firmly into the floor.',
      'Curl the ribcage inward rather than simply flexing the hips.',
      'Exhale forcefully at peak contraction.'
    ],
    tips: [
      'Focus on mind-muscle connection: visualize ribs closing towards your belly button.',
      'Never yank your head forward with your hands.',
      'Perform slow, deliberate repetitions for superior core hypertrophy.'
    ],
    safetyTags: ['neck_safe', 'lumbar_support', 'beginner_friendly', 'home_workout', 'no_equipment'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000018', name: 'Forearm Plank' },
        { id: 'e0000000-0000-0000-0000-000000000021', name: 'Bicycle Crunches' }
      ]
    },
    movementPattern: 'LEG_RAISE',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 18. Forearm Plank (Core, Isometric, Zero Equipment)
  'e0000000-0000-0000-0000-000000000018': {
    exerciseId: 'e0000000-0000-0000-0000-000000000018',
    slug: 'plank',
    displayName: 'Forearm Plank',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'ISOLATION',
    forceType: 'pull',
    met: 3.8,
    primaryMuscles: [
      { name: 'Transverse Abdominis', color: '#22d3ee', bodyRegion: 'core' },
      { name: 'Rectus Abdominis', color: '#06b6d4', bodyRegion: 'core' },
    ],
    secondaryMuscles: [
      { name: 'Gluteus Maximus', color: '#8b5cf6', bodyRegion: 'glute' },
      { name: 'Anterior Deltoids', color: '#f59e0b', bodyRegion: 'shoulder' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '45–60s Hold',
    restSeconds: 45,
    instructions: [
      'Place forearms on the floor with elbows directly under shoulders, hands pointing forward.',
      'Extend legs straight behind you, resting on the balls of your feet.',
      'Contract your abdominals, squeeze glutes, and tuck your pelvis into a neutral position.',
      'Hold a rigid straight line from crown of head to heels for the prescribed duration.'
    ],
    formCues: [
      'Do not let hips sag toward the floor or pike into a V-shape.',
      'Push active forearms down into the floor to keep scapulae broad.',
      'Maintain steady diaphragmatic breathing throughout the isometric hold.'
    ],
    tips: [
      'Actively pull your elbows towards your toes to amplify abdominal tension.',
      'If your lower back starts arching, take a 5-second rest and re-engage.'
    ],
    safetyTags: ['anti_extension', 'spine_safe', 'isometric', 'core_stability', 'home_workout'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000017', name: 'Abdominal Floor Crunches' },
        { id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers' }
      ]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: DEFAULT_TEMPO,
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 19. Bodyweight Air Squat (Lower Body, Zero Equipment)
  'e0000000-0000-0000-0000-000000000019': {
    exerciseId: 'e0000000-0000-0000-0000-000000000019',
    slug: 'bodyweight-squat',
    displayName: 'Bodyweight Air Squat',
    category: 'Legs',
    bodyPart: 'upper_legs',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 5.5,
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee', bodyRegion: 'leg' },
      { name: 'Gluteus Maximus', color: '#06b6d4', bodyRegion: 'glute' },
    ],
    secondaryMuscles: [
      { name: 'Hamstrings', color: '#8b5cf6', bodyRegion: 'leg' },
      { name: 'Abdominals & Core', color: '#f59e0b', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 4,
    repRange: '15–20',
    restSeconds: 45,
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward (15–25°).',
      'Inhale, hinge back at the hips and bend knees simultaneously, reaching arms forward for balance.',
      'Descend until thighs are parallel to the floor or slightly below, keeping chest tall.',
      'Drive through midfoot and heels to return to full standing lockout.'
    ],
    formCues: [
      'Knees track in line with toes throughout descent and ascent.',
      'Keep chest elevated and gaze forward.',
      'Keep entire foot grounded, especially heels.'
    ],
    tips: [
      'Push your knees outwards as you descend to maximize glute activation.',
      'Pause for 1 second in the hole for added difficulty.'
    ],
    safetyTags: ['knee_safe', 'functional_movement', 'calisthenics', 'home_workout'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000009', name: 'Barbell Back Squat' }]
    },
    movementPattern: 'SQUAT',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 20. Mountain Climbers (Core & Conditioning, Zero Equipment)
  'e0000000-0000-0000-0000-000000000020': {
    exerciseId: 'e0000000-0000-0000-0000-000000000020',
    slug: 'mountain-climbers',
    displayName: 'Mountain Climbers',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'COMPOUND',
    forceType: 'dynamic',
    met: 6.5,
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee', bodyRegion: 'core' },
      { name: 'Hip Flexors', color: '#06b6d4', bodyRegion: 'leg' },
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoids', color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Quadriceps', color: '#f59e0b', bodyRegion: 'leg' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '30–45s',
    restSeconds: 45,
    instructions: [
      'Start in a tall push-up plank position with hands directly under shoulders.',
      'Engage your core and bring one knee forward toward your chest without touching the floor.',
      'Return that leg quickly while simultaneously driving the other knee forward.',
      'Continue alternating in a rapid, controlled running cadence.'
    ],
    formCues: [
      'Keep hips level with shoulders — avoid piking into the air.',
      'Maintain strong shoulder push against the floor.',
      'Stay light on the balls of your feet.'
    ],
    tips: [
      'Pace yourself for the full time interval rather than sprinting out too fast.',
      'Focus on abdominal contraction on every knee drive.'
    ],
    safetyTags: ['cardio_conditioning', 'high_met', 'core_endurance', 'home_workout'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000018', name: 'Forearm Plank' }]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: DEFAULT_TEMPO,
    durationSec: 2.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 21. Bicycle Crunches (Core & Obliques, Zero Equipment)
  'e0000000-0000-0000-0000-000000000021': {
    exerciseId: 'e0000000-0000-0000-0000-000000000021',
    slug: 'bicycle-crunches',
    displayName: 'Bicycle Crunches',
    category: 'Core',
    bodyPart: 'core',
    movementType: 'ISOLATION',
    forceType: 'pull',
    met: 5.0,
    primaryMuscles: [
      { name: 'Obliques', color: '#22d3ee', bodyRegion: 'core' },
      { name: 'Rectus Abdominis', color: '#06b6d4', bodyRegion: 'core' },
    ],
    secondaryMuscles: [
      { name: 'Hip Flexors', color: '#8b5cf6', bodyRegion: 'leg' },
      { name: 'Serratus Anterior', color: '#f59e0b', bodyRegion: 'chest' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 3,
    repRange: '20–25',
    restSeconds: 45,
    instructions: [
      'Lie on your back with knees bent and feet lifted off the floor at 90°.',
      'Place fingertips lightly on the back of your head.',
      'Rotate your torso and bring your right elbow and shoulder toward your left knee as you extend the right leg.',
      'Switch sides smoothly in a pedaling motion, maintaining constant core tension.'
    ],
    formCues: [
      'Rotate with your torso and armpit, not just your elbows.',
      'Extend the non-working leg straight out at a 45° angle.',
      'Keep movement controlled and avoid using momentum.'
    ],
    tips: [
      'Ranked by sports biomechanists as one of the most effective abdominal recruitment exercises.',
      'Slow the cadence down for intense rotational burn.'
    ],
    safetyTags: ['oblique_activation', 'rotational_strength', 'home_workout', 'no_equipment'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000017', name: 'Abdominal Floor Crunches' }]
    },
    movementPattern: 'LEG_RAISE',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 22. Bodyweight Glute Bridge (Glutes & Hamstrings, Zero Equipment)
  'e0000000-0000-0000-0000-000000000022': {
    exerciseId: 'e0000000-0000-0000-0000-000000000022',
    slug: 'glute-bridge',
    displayName: 'Bodyweight Glute Bridge',
    category: 'Legs',
    bodyPart: 'upper_legs',
    movementType: 'ISOLATION',
    forceType: 'push',
    met: 4.0,
    primaryMuscles: [
      { name: 'Gluteus Maximus', color: '#22d3ee', bodyRegion: 'glute' },
      { name: 'Hamstrings', color: '#06b6d4', bodyRegion: 'leg' },
    ],
    secondaryMuscles: [
      { name: 'Erector Spinae', color: '#8b5cf6', bodyRegion: 'back' },
      { name: 'Core', color: '#f59e0b', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '15–20',
    restSeconds: 45,
    instructions: [
      'Lie supine on floor with knees bent and feet flat on the ground hip-width apart.',
      'Place arms at sides with palms down for stability.',
      'Drive through your heels to raise your hips until thighs and torso form a straight diagonal line.',
      'Squeeze glutes hard at the top for 2 seconds, then lower under control.'
    ],
    formCues: [
      'Drive through heels, not toes.',
      'Do not hyperextend lower back at the top.',
      'Keep ribs down and core braced.'
    ],
    tips: [
      'Fantastic exercise for desk workers to awaken dormant gluteal musculature.',
      'Elevate feet on a low couch or chair for an extended range of motion regression.'
    ],
    safetyTags: ['glute_activation', 'lower_back_friendly', 'posture_correction', 'home_workout'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000010', name: 'Romanian Deadlift' }]
    },
    movementPattern: 'ROMANIAN_DEADLIFT',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.5,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 23. Jumping Jacks (Cardio Conditioning, Zero Equipment)
  'e0000000-0000-0000-0000-000000000023': {
    exerciseId: 'e0000000-0000-0000-0000-000000000023',
    slug: 'jumping-jacks',
    displayName: 'Jumping Jacks',
    category: 'Full Body',
    bodyPart: 'full_body',
    movementType: 'COMPOUND',
    forceType: 'dynamic',
    met: 6.0,
    primaryMuscles: [
      { name: 'Cardiovascular System', color: '#22d3ee', bodyRegion: 'leg' },
      { name: 'Calves (Gastrocnemius)', color: '#06b6d4', bodyRegion: 'leg' },
    ],
    secondaryMuscles: [
      { name: 'Deltoids', color: '#8b5cf6', bodyRegion: 'shoulder' },
      { name: 'Gluteus Medius', color: '#f59e0b', bodyRegion: 'glute' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '40–50',
    restSeconds: 30,
    instructions: [
      'Stand upright with feet together and arms resting comfortably at your sides.',
      'Bend knees slightly and jump feet outward while raising arms out to sides and overhead.',
      'Without pausing, quickly jump back to starting position with feet together and arms at sides.',
      'Repeat in a continuous rhythmic cadence.'
    ],
    formCues: [
      'Land softly on the balls of your feet.',
      'Keep knees softly bent throughout to absorb impact.',
      'Breathe steadily and maintain rhythmic tempo.'
    ],
    tips: [
      'Great for warming up prior to resistance training or HIIT intervals.',
      'For low impact, step feet out one at a time instead of jumping.'
    ],
    safetyTags: ['warmup', 'aerobic_capacity', 'coordination', 'home_workout'],
    relations: {
      alternatives: [{ id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers' }]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: DEFAULT_TEMPO,
    durationSec: 2.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  },

  // 24. Bodyweight Burpees (Full Body Calisthenics, Zero Equipment)
  'e0000000-0000-0000-0000-000000000024': {
    exerciseId: 'e0000000-0000-0000-0000-000000000024',
    slug: 'burpees',
    displayName: 'Bodyweight Burpees',
    category: 'Full Body',
    bodyPart: 'full_body',
    movementType: 'COMPOUND',
    forceType: 'dynamic',
    met: 8.0,
    primaryMuscles: [
      { name: 'Full Body Conditioning', color: '#22d3ee', bodyRegion: 'chest' },
      { name: 'Pectoralis Major', color: '#06b6d4', bodyRegion: 'chest' },
    ],
    secondaryMuscles: [
      { name: 'Quadriceps', color: '#8b5cf6', bodyRegion: 'leg' },
      { name: 'Core & Abdominals', color: '#f59e0b', bodyRegion: 'core' },
    ],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'No Equipment (Bodyweight)',
    difficulty: 'INTERMEDIATE',
    recommendedSets: 3,
    repRange: '10–15',
    restSeconds: 60,
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Squat down and place hands flat on the floor in front of you.',
      'Jump or kick both feet back to land in a plank, and lower your chest to the floor.',
      'Push up explosively, jump feet forward toward hands, and jump vertically into the air clapping overhead.'
    ],
    formCues: [
      'Keep core braced when kicking legs back to protect the lower back.',
      'Land softly on the jump and immediately transition into the next repetition.',
      'Complete the push-up cleanly without worming.'
    ],
    tips: [
      'The gold standard for bodyweight metabolic conditioning and VO2 max development.',
      'Step back instead of jumping if you need to manage fatigue.'
    ],
    safetyTags: ['high_intensity', 'full_body_power', 'calisthenics', 'home_workout'],
    relations: {
      alternatives: [
        { id: 'e0000000-0000-0000-0000-000000000016', name: 'Push-Up' },
        { id: 'e0000000-0000-0000-0000-000000000023', name: 'Jumping Jacks' }
      ]
    },
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: DEFAULT_TEMPO,
    durationSec: 3.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: true,
  }
};

// ─── Public lookup helpers ────────────────────────────────────────────────────

/**
 * Look up full exercise metadata by ID.
 * Returns undefined if the exercise is not yet in the registry.
 */
export function getExerciseMetadata(exerciseId: string): ExerciseMetadata | undefined {
  const canonicalId = SLUG_TO_3D_ID[exerciseId] || SLUG_TO_3D_ID[exerciseId.toLowerCase()] || exerciseId;
  const ex = EXERCISE_METADATA_REGISTRY[canonicalId] || EXERCISE_METADATA_REGISTRY[exerciseId];
  if (ex && !ex.images) {
    ex.images = getRepDBImageUrls(ex.slug);
  }
  return ex;
}

/**
 * Look up by exact or partial slug (case-insensitive)
 */
export function getExerciseMetadataBySlug(slug: string): ExerciseMetadata | undefined {
  const lower = slug.toLowerCase();
  const canonicalId = SLUG_TO_3D_ID[lower];
  if (canonicalId && EXERCISE_METADATA_REGISTRY[canonicalId]) {
    const ex = EXERCISE_METADATA_REGISTRY[canonicalId];
    if (!ex.images) ex.images = getRepDBImageUrls(ex.slug);
    return ex;
  }
  const ex = Object.values(EXERCISE_METADATA_REGISTRY).find((m) =>
    m.slug.toLowerCase() === lower || m.slug.toLowerCase().includes(lower)
  );
  if (ex && !ex.images) {
    ex.images = getRepDBImageUrls(ex.slug);
  }
  return ex;
}

/**
 * Look up by name keyword (case-insensitive). Useful when only a name is available.
 */
export function getExerciseMetadataByName(name: string): ExerciseMetadata | undefined {
  const lower = name.toLowerCase().trim();
  const ex = Object.values(EXERCISE_METADATA_REGISTRY).find((m) => {
    const d = m.displayName.toLowerCase();
    const s = m.slug.toLowerCase();
    return d === lower || s === lower || d.includes(lower) || lower.includes(d);
  });
  if (ex) {
    if (!ex.images) ex.images = getRepDBImageUrls(ex.slug);
    return ex;
  }
  const slugGuess = lower.replace(/\s+/g, '-');
  const mappedId = SLUG_TO_3D_ID[slugGuess] || SLUG_TO_3D_ID[lower];
  if (mappedId && EXERCISE_METADATA_REGISTRY[mappedId]) {
    const found = EXERCISE_METADATA_REGISTRY[mappedId];
    if (!found.images) found.images = getRepDBImageUrls(found.slug);
    return found;
  }
  return undefined;
}

/**
 * Resolve metadata from either an ID or a name.
 * Falls back to a minimal descriptor so callers never receive undefined.
 */
export function resolveExerciseMetadata(
  exerciseId?: string,
  exerciseName?: string
): ExerciseMetadata {
  if (exerciseId) {
    const byId = getExerciseMetadata(exerciseId);
    if (byId) return byId;
  }
  if (exerciseName) {
    const byName = getExerciseMetadataByName(exerciseName);
    if (byName) return byName;
  }

  const fallbackSlug = (exerciseName || 'bench-press').toLowerCase().replace(/\s+/g, '-');

  // Generic fallback — should not appear in production with a fully populated registry
  return {
    exerciseId: exerciseId || 'unknown',
    slug: fallbackSlug,
    displayName: exerciseName || 'Exercise',
    category: 'General',
    bodyPart: 'full_body',
    movementType: 'COMPOUND',
    forceType: 'push',
    met: 5.0,
    primaryMuscles:   [{ name: 'Target Muscle Group', color: '#22d3ee', bodyRegion: 'core' }],
    secondaryMuscles: [{ name: 'Stabilizer Muscles',  color: '#8b5cf6', bodyRegion: 'core' }],
    equipment: 'BODYWEIGHT',
    equipmentLabel: 'Bodyweight',
    difficulty: 'BEGINNER',
    recommendedSets: 3,
    repRange: '8–12',
    restSeconds: 60,
    instructions: [
      'Set up in the correct starting position for this exercise.',
      'Perform the movement through a full, controlled range of motion.',
      'Return to the start position under control and repeat.',
    ],
    formCues: [
      'Maintain a neutral spine throughout.',
      'Control the eccentric (lowering) phase — do not let gravity do the work.',
      'Breathe rhythmically — exhale on exertion, inhale on return.',
    ],
    tips: [
      'Focus on mind-muscle connection and controlled tempo.',
      'Maintain stable ground contact and even core pressure.'
    ],
    safetyTags: ['controlled_tempo', 'neutral_spine'],
    movementPattern: 'DEFAULT_COMPOUND',
    tempo: DEFAULT_TEMPO,
    durationSec: 4.0,
    cameraViews: DEFAULT_CAMERA_VIEWS,
    animationAvailable: false,
    images: getRepDBImageUrls(fallbackSlug),
  };
}
