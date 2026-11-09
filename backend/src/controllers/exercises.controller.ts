import { Request, Response } from 'express';
import { query } from '../config/db';
import { logger } from '../utils/logger';

// In-memory exercise library fallback
const inMemoryExercises = [
  { id: 'e0000000-0000-0000-0000-000000000001', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 6, restSeconds: 120, instructionCues: ['Retract scapula', 'Plant feet firmly on floor', 'Touch lower chest'] },
  { id: 'e0000000-0000-0000-0000-000000000002', name: 'Incline Dumbbell Press', category: 'Chest', targetMuscle: 'Upper Pectoralis', equipment: 'DUMBBELLS', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 8, restSeconds: 90, instructionCues: ['Set bench to 30 degrees', 'Drive dumbbells up in arc'] },
  { id: 'e0000000-0000-0000-0000-000000000003', name: 'Barbell Bent-Over Row', category: 'Back', targetMuscle: 'Latissimus Dorsi', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 8, restSeconds: 90, instructionCues: ['Hinge at hips at 45°', 'Pull bar to lower sternum', 'Squeeze lats at peak'] },
  { id: 'e0000000-0000-0000-0000-000000000004', name: 'Lat Pulldown', category: 'Back', targetMuscle: 'Latissimus Dorsi', equipment: 'FULL_GYM', difficulty: 'BEGINNER', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 10, restSeconds: 90, instructionCues: ['Grip slightly wider than shoulders', 'Pull down to upper chest'] },
  { id: 'e0000000-0000-0000-0000-000000000005', name: 'Overhead Barbell Press', category: 'Shoulders', targetMuscle: 'Deltoids', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 8, restSeconds: 90, instructionCues: ['Brace core and glutes', 'Press bar straight up over head', 'Tuck chin'] },
  { id: 'e0000000-0000-0000-0000-000000000006', name: 'Dumbbell Lateral Raise', category: 'Shoulders', targetMuscle: 'Lateral Deltoids', equipment: 'DUMBBELLS', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 4, repsDefault: 12, restSeconds: 60, instructionCues: ['Lead with elbows', 'Slight forward lean'] },
  { id: 'e0000000-0000-0000-0000-000000000007', name: 'Barbell Bicep Curl', category: 'Biceps', targetMuscle: 'Biceps Brachii', equipment: 'FULL_GYM', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 10, restSeconds: 60, instructionCues: ['Keep elbows pinned to sides', 'Full range of motion'] },
  { id: 'e0000000-0000-0000-0000-000000000008', name: 'Tricep Rope Pushdown', category: 'Triceps', targetMuscle: 'Triceps Brachii', equipment: 'FULL_GYM', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 12, restSeconds: 60, instructionCues: ['Lock elbows in place', 'Spread rope ends at bottom'] },
  { id: 'e0000000-0000-0000-0000-000000000009', name: 'Barbell Back Squat', category: 'Legs', targetMuscle: 'Quadriceps & Glutes', equipment: 'FULL_GYM', difficulty: 'ADVANCED', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 6, restSeconds: 120, instructionCues: ['Chest high', 'Break at hips and knees simultaneously', 'Depth below parallel'] },
  { id: 'e0000000-0000-0000-0000-000000000010', name: 'Romanian Deadlift', category: 'Legs', targetMuscle: 'Hamstrings & Glutes', equipment: 'FULL_GYM', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 8, restSeconds: 90, instructionCues: ['Maintain slight knee bend', 'Push hips back', 'Feel hamstring stretch'] },
  { id: 'e0000000-0000-0000-0000-000000000011', name: 'Hanging Leg Raise', category: 'Core', targetMuscle: 'Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 15, restSeconds: 60, instructionCues: ['Control the swing', 'Lift knees to chest'] },
  { id: 'e0000000-0000-0000-0000-000000000012', name: 'Kettlebell Farmer Walk', category: 'Full Body', targetMuscle: 'Total Body Conditioning', equipment: 'DUMBBELLS', difficulty: 'BEGINNER', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 1, restSeconds: 60, instructionCues: ['Stand tall with shoulders back', 'Walk in controlled strides'] },
  { id: 'e0000000-0000-0000-0000-000000000017', name: 'Abdominal Floor Crunches', category: 'Core', targetMuscle: 'Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 20, restSeconds: 45, instructionCues: ['Lie flat on back with knees bent at 90°', 'Contract abdominals to curl ribcage towards pelvis', 'Lower under control with continuous tension'] },
  { id: 'e0000000-0000-0000-0000-000000000018', name: 'Forearm Plank', category: 'Core', targetMuscle: 'Transverse Abdominis & Core', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 60, restSeconds: 45, instructionCues: ['Rest on forearms with elbows directly under shoulders', 'Maintain straight line from crown to heels', 'Posteriorly tilt pelvis and brace abs tightly'] },
  { id: 'e0000000-0000-0000-0000-000000000019', name: 'Bodyweight Air Squat', category: 'Legs', targetMuscle: 'Quadriceps & Gluteus Maximus', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', setsDefault: 4, repsDefault: 15, restSeconds: 45, instructionCues: ['Stand with feet shoulder-width, toes flared', 'Descend to full depth with chest upright', 'Drive through midfoot to full standing lockout'] },
  { id: 'e0000000-0000-0000-0000-000000000020', name: 'Mountain Climbers', category: 'Core', targetMuscle: 'Abdominals & Hip Flexors', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 30, restSeconds: 45, instructionCues: ['Start in tall push-up plank position', 'Drive knees towards chest in rapid rhythmic cadence', 'Avoid bouncing hips upwards'] },
  { id: 'e0000000-0000-0000-0000-000000000021', name: 'Bicycle Crunches', category: 'Core', targetMuscle: 'Obliques & Rectus Abdominis', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 20, restSeconds: 45, instructionCues: ['Lie on back with hands behind head, knees raised', 'Rotate opposite elbow toward opposite knee', 'Extend opposite leg fully straight at 45°'] },
  { id: 'e0000000-0000-0000-0000-000000000022', name: 'Bodyweight Glute Bridge', category: 'Legs', targetMuscle: 'Gluteus Maximus & Hamstrings', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'ISOLATION', setsDefault: 3, repsDefault: 15, restSeconds: 45, instructionCues: ['Lie supine with feet flat on ground hip-width apart', 'Drive through heels to lift hips to full extension', 'Squeeze glutes hard at apex for 2 seconds'] },
  { id: 'e0000000-0000-0000-0000-000000000023', name: 'Jumping Jacks', category: 'Full Body', targetMuscle: 'Cardiovascular & Calves', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 40, restSeconds: 30, instructionCues: ['Stand with feet together and arms at sides', 'Jump feet outward while raising arms overhead', 'Land softly on balls of feet'] },
  { id: 'e0000000-0000-0000-0000-000000000024', name: 'Bodyweight Burpees', category: 'Full Body', targetMuscle: 'Total Body Dynamic Conditioning', equipment: 'BODYWEIGHT', difficulty: 'INTERMEDIATE', movementType: 'COMPOUND', setsDefault: 3, repsDefault: 12, restSeconds: 60, instructionCues: ['Drop hands to floor from standing position', 'Kick feet back into plank and touch chest to floor', 'Hop feet back and jump vertically reaching overhead'] }
];

export const getExercises = async (req: Request, res: Response) => {
  try {
    const { category, equipment } = req.query;

    try {
      let sql = 'SELECT id, name, category, target_muscle as "targetMuscle", equipment, difficulty, movement_type as "movementType", sets_default as "setsDefault", reps_default as "repsDefault", rest_seconds as "restSeconds", instruction_cues as "instructionCues" FROM exercises WHERE 1=1';
      const params: any[] = [];

      if (category) {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      if (equipment) {
        params.push(equipment);
        sql += ` AND equipment = $${params.length}`;
      }

      sql += ' ORDER BY category, name';

      const result = await query(sql, params);
      if (result && result.rows.length > 0) {
        return res.status(200).json(result.rows);
      }
    } catch (dbErr: any) {
      logger.warn('PostgreSQL query exercises fallback:', dbErr.message);
    }

    let filtered = [...inMemoryExercises];
    if (category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === String(category).toLowerCase());
    }
    if (equipment) {
      filtered = filtered.filter(e => e.equipment.toLowerCase() === String(equipment).toLowerCase());
    }

    return res.status(200).json(filtered);
  } catch (error: any) {
    logger.error('Get exercises error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving exercise library.' });
  }
};
