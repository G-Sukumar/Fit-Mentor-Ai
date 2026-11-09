/**
 * FitMentor AI — 3D Animated Exercise Demonstration Registry
 * Maps exercise IDs and movement patterns to 3D models, skeletal animation rigs,
 * muscle highlights, camera presets, and biomechanical form cues.
 */

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export interface Exercise3DConfig {
  exerciseId: string;
  name: string;
  movementPattern: 'BENCH_PRESS' | 'SQUAT' | 'BARBELL_ROW' | 'ROMANIAN_DEADLIFT' | 'OVERHEAD_PRESS' | 'LEG_RAISE' | 'DEFAULT_COMPOUND';
  equipment: 'BARBELL' | 'DUMBBELLS' | 'BODYWEIGHT' | 'BENCH' | 'MACHINE';
  cameraViews: {
    front: CameraPreset;
    side: CameraPreset;
    isometric: CameraPreset;
    defaultView: 'front' | 'side' | 'isometric';
  };
  primaryMuscles: { name: string; color: string }[];
  secondaryMuscles: { name: string; color: string }[];
  formCues: string[];
  tempo: { eccentric: number; pause: number; concentric: number };
  durationSec: number;
}

export const EXERCISE_3D_REGISTRY: Record<string, Exercise3DConfig> = {
  // 1. Barbell Bench Press
  'e0000000-0000-0000-0000-000000000001': {
    exerciseId: 'e0000000-0000-0000-0000-000000000001',
    name: 'Barbell Bench Press',
    movementPattern: 'BENCH_PRESS',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.5, 2.2, 2.8], target: [0, 0.8, 0] },
      front: { position: [0, 2.4, 3.2], target: [0, 0.8, 0] },
      side: { position: [3.4, 1.4, 0], target: [0, 0.8, 0] },
      defaultView: 'isometric'
    },
    primaryMuscles: [
      { name: 'Pectoralis Major', color: '#22d3ee' } // Cyan glow
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoid', color: '#8b5cf6' }, // Purple
      { name: 'Triceps Brachii', color: '#f59e0b' } // Gold
    ],
    formCues: [
      'Retract and depress scapulae firmly against the bench.',
      'Maintain 5 points of contact (head, shoulders, glutes, both feet).',
      'Lower bar with control to the mid-sternum, keeping elbows at ~45-60°.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0
  },

  // 2. Barbell Bent-Over Row
  'e0000000-0000-0000-0000-000000000003': {
    exerciseId: 'e0000000-0000-0000-0000-000000000003',
    name: 'Barbell Bent-Over Row',
    movementPattern: 'BARBELL_ROW',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.8, 2.0, 2.6], target: [0, 1.0, 0] },
      front: { position: [0, 1.8, 3.2], target: [0, 1.0, 0] },
      side: { position: [3.2, 1.5, 0], target: [0, 1.0, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#22d3ee' },
      { name: 'Rhomboids', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Posterior Deltoid', color: '#8b5cf6' },
      { name: 'Biceps Brachii', color: '#f59e0b' }
    ],
    formCues: [
      'Hinge at the hips with a neutral spine at ~45° torso angle.',
      'Pull barbell towards lower ribcage/umbilicus leading with elbows.',
      'Squeeze shoulder blades together at the apex of the pull.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0
  },

  // 3. Overhead Barbell Press
  'e0000000-0000-0000-0000-000000000005': {
    exerciseId: 'e0000000-0000-0000-0000-000000000005',
    name: 'Overhead Barbell Press',
    movementPattern: 'OVERHEAD_PRESS',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.4, 2.2, 2.6], target: [0, 1.4, 0] },
      front: { position: [0, 2.0, 3.2], target: [0, 1.4, 0] },
      side: { position: [3.2, 1.8, 0], target: [0, 1.4, 0] },
      defaultView: 'front'
    },
    primaryMuscles: [
      { name: 'Anterior & Lateral Deltoids', color: '#22d3ee' }
    ],
    secondaryMuscles: [
      { name: 'Triceps Brachii', color: '#8b5cf6' },
      { name: 'Upper Trapezius & Core', color: '#f59e0b' }
    ],
    formCues: [
      'Brace core and squeeze glutes to establish a rigid foundation.',
      'Press bar vertically in a straight path, tilting head back slightly to clear chin.',
      'Lock out overhead with bar centered over midfoot and active scapular elevation.'
    ],
    tempo: { eccentric: 2, pause: 0, concentric: 1 },
    durationSec: 3.5
  },

  // 4. Barbell Back Squat
  'e0000000-0000-0000-0000-000000000009': {
    exerciseId: 'e0000000-0000-0000-0000-000000000009',
    name: 'Barbell Back Squat',
    movementPattern: 'SQUAT',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.8, 2.0, 2.8], target: [0, 1.0, 0] },
      front: { position: [0, 1.8, 3.4], target: [0, 1.0, 0] },
      side: { position: [3.4, 1.4, 0], target: [0, 1.0, 0] },
      defaultView: 'isometric'
    },
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee' },
      { name: 'Gluteus Maximus', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Hamstrings', color: '#8b5cf6' },
      { name: 'Erector Spinae & Core', color: '#f59e0b' }
    ],
    formCues: [
      'Set feet shoulder-width with toes flared 15-30° out.',
      'Initiate descent by breaking simultaneously at hips and knees.',
      'Descend until crease of hip is below top of knee, maintaining neutral lumbar spine.'
    ],
    tempo: { eccentric: 3, pause: 1, concentric: 1 },
    durationSec: 4.5
  },

  // 5. Romanian Deadlift
  'e0000000-0000-0000-0000-000000000010': {
    exerciseId: 'e0000000-0000-0000-0000-000000000010',
    name: 'Romanian Deadlift',
    movementPattern: 'ROMANIAN_DEADLIFT',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.6, 1.8, 2.6], target: [0, 1.0, 0] },
      side: { position: [3.2, 1.4, 0], target: [0, 1.0, 0] },
      front: { position: [0, 1.8, 3.2], target: [0, 1.0, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Hamstrings', color: '#22d3ee' },
      { name: 'Gluteus Maximus', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Erector Spinae', color: '#8b5cf6' },
      { name: 'Forearms & Trapezius', color: '#f59e0b' }
    ],
    formCues: [
      'Hinge back deeply at the hips while maintaining a soft knee bend.',
      'Keep bar skimming close to thighs and shins throughout descent.',
      'Drive hips forward powerfully to lockout once maximum hamstring stretch is achieved.'
    ],
    tempo: { eccentric: 3, pause: 1, concentric: 1 },
    durationSec: 4.5
  },

  // 6. Hanging Leg Raise
  'e0000000-0000-0000-0000-000000000011': {
    exerciseId: 'e0000000-0000-0000-0000-000000000011',
    name: 'Hanging Leg Raise',
    movementPattern: 'LEG_RAISE',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.4, 2.0, 2.6], target: [0, 1.3, 0] },
      front: { position: [0, 1.8, 3.0], target: [0, 1.3, 0] },
      side: { position: [3.0, 1.6, 0], target: [0, 1.3, 0] },
      defaultView: 'front'
    },
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee' }
    ],
    secondaryMuscles: [
      { name: 'Iliopsoas (Hip Flexors)', color: '#8b5cf6' },
      { name: 'Forearms & Lats', color: '#f59e0b' }
    ],
    formCues: [
      'Hang from bar with active shoulders to avoid passive joint hanging.',
      'Posteriorly tilt pelvis and lift legs with abdominal contraction, avoiding swinging.',
      'Lower legs under control to prevent momentum rebound.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 3.5
  },

  // 7. Ab Wheel Rollout (RepDB core)
  'e0000000-0000-0000-0000-000000000013': {
    exerciseId: 'e0000000-0000-0000-0000-000000000013',
    name: 'Ab Wheel Rollout',
    movementPattern: 'LEG_RAISE',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.5, 1.8, 2.6], target: [0, 0.6, 0] },
      front: { position: [0, 1.6, 3.0], target: [0, 0.6, 0] },
      side: { position: [3.2, 1.4, 0], target: [0, 0.6, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee' },
      { name: 'Transverse Abdominis', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#8b5cf6' },
      { name: 'Anterior Deltoid', color: '#f59e0b' }
    ],
    formCues: [
      'Brace core hard to keep lumbar spine neutral.',
      'Roll out under control stopping before hips sag.',
      'Contract abs powerfully to roll wheel back.'
    ],
    tempo: { eccentric: 3, pause: 1, concentric: 1 },
    durationSec: 4.0
  },

  // 8. Front Squat (RepDB quads)
  'e0000000-0000-0000-0000-000000000014': {
    exerciseId: 'e0000000-0000-0000-0000-000000000014',
    name: 'Front Squat',
    movementPattern: 'SQUAT',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.5, 2.2, 2.6], target: [0, 1.0, 0] },
      front: { position: [0, 2.0, 3.2], target: [0, 1.0, 0] },
      side: { position: [3.2, 1.6, 0], target: [0, 1.0, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee' },
      { name: 'Gluteus Maximus', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Core & Rectus Abdominis', color: '#8b5cf6' },
      { name: 'Upper Trapezius', color: '#f59e0b' }
    ],
    formCues: [
      'Maintain high elbows to keep bar seated on front deltoids.',
      'Squat deep with vertical torso angle.',
      'Drive up through midfoot and knees tracking out.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0
  },

  // 9. Bent-Over Dumbbell Row (RepDB back)
  'e0000000-0000-0000-0000-000000000015': {
    exerciseId: 'e0000000-0000-0000-0000-000000000015',
    name: 'Bent-Over Dumbbell Row',
    movementPattern: 'BARBELL_ROW',
    equipment: 'DUMBBELLS',
    cameraViews: {
      isometric: { position: [2.8, 1.8, 2.6], target: [0, 1.0, 0] },
      front: { position: [0, 1.8, 3.2], target: [0, 1.0, 0] },
      side: { position: [3.2, 1.5, 0], target: [0, 1.0, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Latissimus Dorsi', color: '#22d3ee' },
      { name: 'Rhomboids', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Biceps Brachii', color: '#8b5cf6' },
      { name: 'Posterior Deltoid', color: '#f59e0b' }
    ],
    formCues: [
      'Keep 30–45° hip hinge with rigid flat back.',
      'Pull dumbbells toward lower ribcage with elbows tight.',
      'Full eccentric stretch on descent.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0
  },

  // 10. Push-Up (RepDB chest)
  'e0000000-0000-0000-0000-000000000016': {
    exerciseId: 'e0000000-0000-0000-0000-000000000016',
    name: 'Push-Up',
    movementPattern: 'BENCH_PRESS',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.5, 1.8, 2.5], target: [0, 0.5, 0] },
      front: { position: [0, 1.8, 3.0], target: [0, 0.5, 0] },
      side: { position: [3.2, 1.2, 0], target: [0, 0.5, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Pectoralis Major', color: '#22d3ee' }
    ],
    secondaryMuscles: [
      { name: 'Triceps Brachii', color: '#8b5cf6' },
      { name: 'Anterior Deltoid', color: '#f59e0b' }
    ],
    formCues: [
      'Maintain rigid straight line from heels to crown.',
      'Keep elbows at ~45° arrow angle.',
      'Full range of motion: chest to floor, complete lockout.'
    ],
    tempo: { eccentric: 2, pause: 0, concentric: 1 },
    durationSec: 3.0
  },

  // 11. Abdominal Floor Crunches (Home Bodyweight Core)
  'e0000000-0000-0000-0000-000000000017': {
    exerciseId: 'e0000000-0000-0000-0000-000000000017',
    name: 'Abdominal Floor Crunches',
    movementPattern: 'LEG_RAISE',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.2, 1.6, 2.4], target: [0, 0.4, 0] },
      front: { position: [0, 1.8, 2.6], target: [0, 0.4, 0] },
      side: { position: [2.8, 1.2, 0], target: [0, 0.4, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee' }
    ],
    secondaryMuscles: [
      { name: 'Obliques', color: '#8b5cf6' },
      { name: 'Transverse Abdominis', color: '#f59e0b' }
    ],
    formCues: [
      'Keep lower back anchored firmly into the floor.',
      'Curl ribcage toward pelvis by contracting abdominals, not pulling the neck.',
      'Exhale fully at peak contraction and pause for 1 second.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 3.0
  },

  // 12. Forearm Plank (Home Bodyweight Isometric Core)
  'e0000000-0000-0000-0000-000000000018': {
    exerciseId: 'e0000000-0000-0000-0000-000000000018',
    name: 'Forearm Plank',
    movementPattern: 'DEFAULT_COMPOUND',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.6, 1.6, 2.4], target: [0, 0.5, 0] },
      side: { position: [3.0, 1.2, 0], target: [0, 0.5, 0] },
      front: { position: [0, 1.6, 2.8], target: [0, 0.5, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Transverse Abdominis', color: '#22d3ee' },
      { name: 'Rectus Abdominis', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Gluteus Maximus', color: '#8b5cf6' },
      { name: 'Anterior Deltoids', color: '#f59e0b' }
    ],
    formCues: [
      'Rest on forearms with elbows stacked directly beneath shoulders.',
      'Create total-body tension: squeeze glutes, brace abs, and drive heels back.',
      'Do not allow hips to sag or pike upwards.'
    ],
    tempo: { eccentric: 0, pause: 60, concentric: 0 },
    durationSec: 4.0
  },

  // 13. Bodyweight Air Squat (Home Bodyweight Legs)
  'e0000000-0000-0000-0000-000000000019': {
    exerciseId: 'e0000000-0000-0000-0000-000000000019',
    name: 'Bodyweight Air Squat',
    movementPattern: 'SQUAT',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.6, 1.8, 2.6], target: [0, 0.9, 0] },
      front: { position: [0, 1.8, 3.0], target: [0, 0.9, 0] },
      side: { position: [3.0, 1.4, 0], target: [0, 0.9, 0] },
      defaultView: 'isometric'
    },
    primaryMuscles: [
      { name: 'Quadriceps Femoris', color: '#22d3ee' },
      { name: 'Gluteus Maximus', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Hamstrings', color: '#8b5cf6' },
      { name: 'Abdominals & Core', color: '#f59e0b' }
    ],
    formCues: [
      'Feet shoulder-width apart with toes flared slightly.',
      'Send hips back and down while keeping torso upright.',
      'Break parallel at depth, then drive through midfoot to full standing lockout.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 3.5
  },

  // 14. Mountain Climbers (Home Bodyweight Core Conditioning)
  'e0000000-0000-0000-0000-000000000020': {
    exerciseId: 'e0000000-0000-0000-0000-000000000020',
    name: 'Mountain Climbers',
    movementPattern: 'DEFAULT_COMPOUND',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.5, 1.6, 2.4], target: [0, 0.5, 0] },
      side: { position: [3.0, 1.2, 0], target: [0, 0.5, 0] },
      front: { position: [0, 1.6, 2.8], target: [0, 0.5, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Rectus Abdominis', color: '#22d3ee' },
      { name: 'Hip Flexors', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Anterior Deltoids', color: '#8b5cf6' },
      { name: 'Quadriceps', color: '#f59e0b' }
    ],
    formCues: [
      'Hold high plank position with shoulders stacked over wrists.',
      'Drive one knee up towards chest without rounding lower back.',
      'Alternate legs in rapid rhythmic cadence with stable core.'
    ],
    tempo: { eccentric: 1, pause: 0, concentric: 1 },
    durationSec: 2.5
  },

  // 15. Bicycle Crunches (Home Bodyweight Core & Obliques)
  'e0000000-0000-0000-0000-000000000021': {
    exerciseId: 'e0000000-0000-0000-0000-000000000021',
    name: 'Bicycle Crunches',
    movementPattern: 'LEG_RAISE',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.2, 1.6, 2.4], target: [0, 0.4, 0] },
      front: { position: [0, 1.8, 2.6], target: [0, 0.4, 0] },
      side: { position: [2.8, 1.2, 0], target: [0, 0.4, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Obliques', color: '#22d3ee' },
      { name: 'Rectus Abdominis', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Hip Flexors', color: '#8b5cf6' },
      { name: 'Serratus Anterior', color: '#f59e0b' }
    ],
    formCues: [
      'Rotate torso bringing opposite armpit and elbow toward knee.',
      'Extend opposite leg straight out at 45° angle.',
      'Maintain continuous tension on abdominal wall throughout.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 3.0
  },

  // 16. Bodyweight Glute Bridge (Home Posterior Chain)
  'e0000000-0000-0000-0000-000000000022': {
    exerciseId: 'e0000000-0000-0000-0000-000000000022',
    name: 'Bodyweight Glute Bridge',
    movementPattern: 'ROMANIAN_DEADLIFT',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.4, 1.6, 2.4], target: [0, 0.4, 0] },
      side: { position: [3.0, 1.2, 0], target: [0, 0.4, 0] },
      front: { position: [0, 1.8, 2.6], target: [0, 0.4, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Gluteus Maximus', color: '#22d3ee' },
      { name: 'Hamstrings', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Erector Spinae', color: '#8b5cf6' },
      { name: 'Core', color: '#f59e0b' }
    ],
    formCues: [
      'Feet flat on floor hip-width apart with knees bent.',
      'Drive through heels to lift hips until thighs and torso align.',
      'Squeeze glutes hard at the top for 2 seconds before lowering.'
    ],
    tempo: { eccentric: 2, pause: 2, concentric: 1 },
    durationSec: 3.5
  },

  // 17. Jumping Jacks (Home Cardio & Full Body)
  'e0000000-0000-0000-0000-000000000023': {
    exerciseId: 'e0000000-0000-0000-0000-000000000023',
    name: 'Jumping Jacks',
    movementPattern: 'DEFAULT_COMPOUND',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.5, 2.0, 2.8], target: [0, 1.2, 0] },
      front: { position: [0, 2.0, 3.2], target: [0, 1.2, 0] },
      side: { position: [3.0, 1.6, 0], target: [0, 1.2, 0] },
      defaultView: 'front'
    },
    primaryMuscles: [
      { name: 'Cardiovascular System', color: '#22d3ee' },
      { name: 'Calves (Gastrocnemius)', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Deltoids', color: '#8b5cf6' },
      { name: 'Gluteus Medius', color: '#f59e0b' }
    ],
    formCues: [
      'Land softly on the balls of your feet with knees slightly bent.',
      'Swing arms fully overhead in coordinated fluid motion.',
      'Keep breathing steady and core lightly engaged.'
    ],
    tempo: { eccentric: 1, pause: 0, concentric: 1 },
    durationSec: 2.0
  },

  // 18. Bodyweight Burpees (Home Explosive Full Body)
  'e0000000-0000-0000-0000-000000000024': {
    exerciseId: 'e0000000-0000-0000-0000-000000000024',
    name: 'Bodyweight Burpees',
    movementPattern: 'DEFAULT_COMPOUND',
    equipment: 'BODYWEIGHT',
    cameraViews: {
      isometric: { position: [2.6, 1.8, 2.6], target: [0, 0.8, 0] },
      side: { position: [3.2, 1.4, 0], target: [0, 0.8, 0] },
      front: { position: [0, 1.8, 3.0], target: [0, 0.8, 0] },
      defaultView: 'side'
    },
    primaryMuscles: [
      { name: 'Full Body Conditioning', color: '#22d3ee' },
      { name: 'Pectoralis Major', color: '#06b6d4' }
    ],
    secondaryMuscles: [
      { name: 'Quadriceps', color: '#8b5cf6' },
      { name: 'Deltoids', color: '#f59e0b' }
    ],
    formCues: [
      'Drop down quickly, place hands on floor, and kick feet back to plank.',
      'Lower chest to floor, then press up explosively.',
      'Snap feet back under hips and jump upward clapping overhead.'
    ],
    tempo: { eccentric: 1, pause: 0, concentric: 1 },
    durationSec: 3.0
  }
};

/**
 * Direct ID & Slug Alias Map to canonical 3D exercise registry configs
 */
export const SLUG_TO_3D_ID: Record<string, string> = {
  // 1. Barbell Bench Press
  'e0000000-0000-0000-0000-000000000001': 'e0000000-0000-0000-0000-000000000001',
  'e1': 'e0000000-0000-0000-0000-000000000001',
  'bench-press': 'e0000000-0000-0000-0000-000000000001',
  'barbell-bench-press': 'e0000000-0000-0000-0000-000000000001',

  // 2. Incline Dumbbell Press / Close Grip Bench
  'e0000000-0000-0000-0000-000000000002': 'e0000000-0000-0000-0000-000000000002',
  'incline-db-press': 'e0000000-0000-0000-0000-000000000002',
  'close-grip-bench-press': 'e0000000-0000-0000-0000-000000000002',
  'incline-dumbbell-press': 'e0000000-0000-0000-0000-000000000002',
  'incline-dumbbell-bench-press': 'e0000000-0000-0000-0000-000000000002',

  // 3. Barbell Bent-Over Row
  'e0000000-0000-0000-0000-000000000003': 'e0000000-0000-0000-0000-000000000003',
  'e2': 'e0000000-0000-0000-0000-000000000003',
  'barbell-row': 'e0000000-0000-0000-0000-000000000003',
  'bent-over-barbell-row': 'e0000000-0000-0000-0000-000000000003',

  // 4. Lat Pulldown
  'e0000000-0000-0000-0000-000000000004': 'e0000000-0000-0000-0000-000000000004',
  'lat-pulldown': 'e0000000-0000-0000-0000-000000000004',

  // 5. Overhead Barbell Press / Arnold Press
  'e0000000-0000-0000-0000-000000000005': 'e0000000-0000-0000-0000-000000000005',
  'e3': 'e0000000-0000-0000-0000-000000000005',
  'overhead-barbell-press': 'e0000000-0000-0000-0000-000000000005',
  'seated-barbell-overhead-press': 'e0000000-0000-0000-0000-000000000005',
  'arnold-press': 'e0000000-0000-0000-0000-000000000005',

  // 6. Dumbbell Lateral Raise
  'e0000000-0000-0000-0000-000000000006': 'e0000000-0000-0000-0000-000000000006',
  'db-lateral-raise': 'e0000000-0000-0000-0000-000000000006',
  'lateral-raise': 'e0000000-0000-0000-0000-000000000006',

  // 7. Barbell Bicep Curl
  'e0000000-0000-0000-0000-000000000007': 'e0000000-0000-0000-0000-000000000007',
  'e4': 'e0000000-0000-0000-0000-000000000007',
  'barbell-curl': 'e0000000-0000-0000-0000-000000000007',
  'bicep-curl': 'e0000000-0000-0000-0000-000000000007',

  // 8. Tricep Pushdown / Bench Dips
  'e0000000-0000-0000-0000-000000000008': 'e0000000-0000-0000-0000-000000000008',
  'tricep-pushdown': 'e0000000-0000-0000-0000-000000000008',
  'bench-dips': 'e0000000-0000-0000-0000-000000000008',

  // 9. Barbell Back Squat
  'e0000000-0000-0000-0000-000000000009': 'e0000000-0000-0000-0000-000000000009',
  'squat': 'e0000000-0000-0000-0000-000000000009',
  'barbell-back-squat': 'e0000000-0000-0000-0000-000000000009',

  // 10. Romanian Deadlift
  'e0000000-0000-0000-0000-000000000010': 'e0000000-0000-0000-0000-000000000010',
  'romanian-deadlift': 'e0000000-0000-0000-0000-000000000010',
  'banded-romanian-deadlift': 'e0000000-0000-0000-0000-000000000010',
  'deadlift': 'e0000000-0000-0000-0000-000000000010',

  // 11. Hanging Leg Raise / Seated Tuck
  'e0000000-0000-0000-0000-000000000011': 'e0000000-0000-0000-0000-000000000011',
  'hanging-leg-raise': 'e0000000-0000-0000-0000-000000000011',
  'bench-leg-pull-in': 'e0000000-0000-0000-0000-000000000011',

  // 12. Kettlebell Farmer Walk
  'e0000000-0000-0000-0000-000000000012': 'e0000000-0000-0000-0000-000000000012',
  'farmer-walk': 'e0000000-0000-0000-0000-000000000012',

  // 13. Ab Wheel Rollout
  'e0000000-0000-0000-0000-000000000013': 'e0000000-0000-0000-0000-000000000013',
  'ab-wheel-rollout': 'e0000000-0000-0000-0000-000000000013',

  // 14. Front Squat / Box Squat
  'e0000000-0000-0000-0000-000000000014': 'e0000000-0000-0000-0000-000000000014',
  'front-squat': 'e0000000-0000-0000-0000-000000000014',
  'box-squat': 'e0000000-0000-0000-0000-000000000014',

  // 15. Bent-Over Dumbbell Row
  'e0000000-0000-0000-0000-000000000015': 'e0000000-0000-0000-0000-000000000015',
  'bent-over-db-row': 'e0000000-0000-0000-0000-000000000015',

  // 16. Push-Up
  'e0000000-0000-0000-0000-000000000016': 'e0000000-0000-0000-0000-000000000016',
  'push-up': 'e0000000-0000-0000-0000-000000000016',
  'close-grip-push-ups': 'e0000000-0000-0000-0000-000000000016',

  // 17. Abdominal Floor Crunches
  'e0000000-0000-0000-0000-000000000017': 'e0000000-0000-0000-0000-000000000017',
  'crunches': 'e0000000-0000-0000-0000-000000000017',
  'crunch': 'e0000000-0000-0000-0000-000000000017',

  // 18. Forearm Plank
  'e0000000-0000-0000-0000-000000000018': 'e0000000-0000-0000-0000-000000000018',
  'plank': 'e0000000-0000-0000-0000-000000000018',
  'front-plank': 'e0000000-0000-0000-0000-000000000018',
  'forearm-plank': 'e0000000-0000-0000-0000-000000000018',

  // 19. Bodyweight Air Squat / Bulgarian Split Squat / Standing Calf
  'e0000000-0000-0000-0000-000000000019': 'e0000000-0000-0000-0000-000000000019',
  'bodyweight-squat': 'e0000000-0000-0000-0000-000000000019',
  'air-squat': 'e0000000-0000-0000-0000-000000000019',
  'bulgarian-split-squat': 'e0000000-0000-0000-0000-000000000019',
  'bench-calf-stretch': 'e0000000-0000-0000-0000-000000000019',

  // 20. Mountain Climbers
  'e0000000-0000-0000-0000-000000000020': 'e0000000-0000-0000-0000-000000000020',
  'mountain-climbers': 'e0000000-0000-0000-0000-000000000020',

  // 21. Bicycle Crunches
  'e0000000-0000-0000-0000-000000000021': 'e0000000-0000-0000-0000-000000000021',
  'bicycle-crunches': 'e0000000-0000-0000-0000-000000000021',
  'bicycle-crunch': 'e0000000-0000-0000-0000-000000000021',

  // 22. Bodyweight Glute Bridge
  'e0000000-0000-0000-0000-000000000022': 'e0000000-0000-0000-0000-000000000022',
  'glute-bridge': 'e0000000-0000-0000-0000-000000000022',

  // 23. Jumping Jacks
  'e0000000-0000-0000-0000-000000000023': 'e0000000-0000-0000-0000-000000000023',
  'jumping-jacks': 'e0000000-0000-0000-0000-000000000023',

  // 24. Bodyweight Burpees
  'e0000000-0000-0000-0000-000000000024': 'e0000000-0000-0000-0000-000000000024',
  'burpees': 'e0000000-0000-0000-0000-000000000024',
  'burpee': 'e0000000-0000-0000-0000-000000000024',
};

/**
 * Helper to retrieve 3D configuration by exercise ID or match by name
 */
export function getExercise3DConfig(exerciseId?: string, exerciseName?: string): Exercise3DConfig {
  if (exerciseId) {
    if (EXERCISE_3D_REGISTRY[exerciseId]) {
      return EXERCISE_3D_REGISTRY[exerciseId];
    }
    const resolvedId = SLUG_TO_3D_ID[exerciseId] || SLUG_TO_3D_ID[exerciseId.toLowerCase()];
    if (resolvedId && EXERCISE_3D_REGISTRY[resolvedId]) {
      return EXERCISE_3D_REGISTRY[resolvedId];
    }
  }

  // Lookup by matching name keywords in strict priority order (specific before generic)
  const lower = (exerciseName || '').toLowerCase().trim();
  if (lower) {
    if (lower.includes('crunches') || lower.includes('crunch')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000017'];
    if (lower.includes('plank')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000018'];
    if (lower.includes('burpee')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000024'];
    if (lower.includes('jack') || lower.includes('jumping')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000023'];
    if (lower.includes('bridge') || lower.includes('glute')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000022'];
    if (lower.includes('bicycle')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000021'];
    if (lower.includes('climber')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000020'];
    if (lower.includes('air squat') || (lower.includes('squat') && lower.includes('bodyweight')) || lower.includes('bulgarian') || lower.includes('calf')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000019'];
    if (lower.includes('push-up') || lower.includes('pushup') || lower.includes('push up')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000016'];
    if (lower.includes('dumbbell row') || lower.includes('db row')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000015'];
    if (lower.includes('front squat') || lower.includes('box squat')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000014'];
    if (lower.includes('rollout') || lower.includes('ab wheel')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000013'];
    if (lower.includes('farmer') || lower.includes('carry')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000012'];
    if (lower.includes('leg raise') || lower.includes('pull-in') || lower.includes('leg pull')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000011'];
    if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('romanian')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000010'];
    if (lower.includes('squat')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000009'];
    if (lower.includes('tricep') || lower.includes('pushdown') || lower.includes('dip')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000008'];
    if (lower.includes('curl') || lower.includes('bicep')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000007'];
    if (lower.includes('lateral raise')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000006'];
    if (lower.includes('overhead') || lower.includes('arnold') || lower.includes('military') || lower.includes('shoulder press')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000005'];
    if (lower.includes('pulldown') || lower.includes('lat pull')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000004'];
    if (lower.includes('row')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000003'];
    if (lower.includes('incline') || lower.includes('close-grip bench')) return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000002'];
    if (lower.includes('bench press') || lower.includes('barbell bench') || lower.includes('chest press') || lower === 'bench') return EXERCISE_3D_REGISTRY['e0000000-0000-0000-0000-000000000001'];
  }

  // Default fallback config
  return {
    exerciseId: exerciseId || 'default_ex',
    name: exerciseName || 'Compound Exercise',
    movementPattern: 'BENCH_PRESS',
    equipment: 'BARBELL',
    cameraViews: {
      isometric: { position: [2.5, 2.0, 2.8], target: [0, 1.0, 0] },
      front: { position: [0, 2.0, 3.2], target: [0, 1.0, 0] },
      side: { position: [3.2, 1.4, 0], target: [0, 1.0, 0] },
      defaultView: 'isometric'
    },
    primaryMuscles: [{ name: 'Target Muscle Group', color: '#22d3ee' }],
    secondaryMuscles: [{ name: 'Stabilizer Muscles', color: '#8b5cf6' }],
    formCues: [
      'Maintain tight core and neutral spine alignment.',
      'Control the eccentric phase smoothly with full range of motion.',
      'Breathe rhythmically and lock in stable footing.'
    ],
    tempo: { eccentric: 2, pause: 1, concentric: 1 },
    durationSec: 4.0
  };
}
