-- =============================================================================
-- FitMentor AI — Milestone 7: Zero-Equipment Home Workouts & Calisthenics Library
-- =============================================================================

-- 1. Insert Home Exercises (Crunches, Plank, Air Squats, Mountain Climbers, etc.)
INSERT INTO exercises (id, name, category, target_muscle, equipment, difficulty, movement_type, sets_default, reps_default, rest_seconds, instruction_cues)
VALUES
('e0000000-0000-0000-0000-000000000017', 'Abdominal Floor Crunches', 'Core', 'Rectus Abdominis', 'BODYWEIGHT', 'BEGINNER', 'ISOLATION', 3, 20, 45, ARRAY['Lie flat on back with knees bent at 90°', 'Cross arms over chest or fingertips by ears', 'Contract abdominals to curl ribcage towards pelvis', 'Lower under control with continuous tension']),
('e0000000-0000-0000-0000-000000000018', 'Forearm Plank', 'Core', 'Transverse Abdominis & Core', 'BODYWEIGHT', 'BEGINNER', 'ISOLATION', 3, 60, 45, ARRAY['Rest on forearms with elbows directly under shoulders', 'Maintain straight line from crown to heels', 'Posteriorly tilt pelvis and brace abs tightly', 'Breathe evenly without sagging hips']),
('e0000000-0000-0000-0000-000000000019', 'Bodyweight Air Squat', 'Legs', 'Quadriceps & Gluteus Maximus', 'BODYWEIGHT', 'BEGINNER', 'COMPOUND', 4, 15, 45, ARRAY['Stand with feet shoulder-width, toes flared slightly', 'Reach arms forward for balance as hips hinge back', 'Descend to full depth with chest upright', 'Drive through midfoot to full standing lockout']),
('e0000000-0000-0000-0000-000000000020', 'Mountain Climbers', 'Core', 'Abdominals & Hip Flexors', 'BODYWEIGHT', 'BEGINNER', 'COMPOUND', 3, 30, 45, ARRAY['Start in tall push-up plank position', 'Drive one knee up towards chest keeping back flat', 'Alternate legs in rapid rhythmic cadence', 'Avoid bouncing hips upwards']),
('e0000000-0000-0000-0000-000000000021', 'Bicycle Crunches', 'Core', 'Obliques & Rectus Abdominis', 'BODYWEIGHT', 'INTERMEDIATE', 'ISOLATION', 3, 20, 45, ARRAY['Lie on back with hands behind head, knees raised', 'Rotate opposite shoulder and elbow toward opposite knee', 'Extend opposite leg fully straight at 45°', 'Switch sides smoothly with deliberate core burn']),
('e0000000-0000-0000-0000-000000000022', 'Bodyweight Glute Bridge', 'Legs', 'Gluteus Maximus & Hamstrings', 'BODYWEIGHT', 'BEGINNER', 'ISOLATION', 3, 15, 45, ARRAY['Lie supine with feet flat on ground hip-width apart', 'Drive through heels to lift hips to full extension', 'Squeeze glutes hard at the apex for 2 seconds', 'Lower hips under control without slamming lower back']),
('e0000000-0000-0000-0000-000000000023', 'Jumping Jacks', 'Full Body', 'Cardiovascular & Calves', 'BODYWEIGHT', 'BEGINNER', 'COMPOUND', 3, 40, 30, ARRAY['Start standing tall with feet together and arms at sides', 'Jump feet outward while raising arms overhead', 'Jump back to starting position rhythmically', 'Land softly on balls of feet']),
('e0000000-0000-0000-0000-000000000024', 'Bodyweight Burpees', 'Full Body', 'Total Body Dynamic Conditioning', 'BODYWEIGHT', 'INTERMEDIATE', 'COMPOUND', 3, 12, 60, ARRAY['Drop hands to floor from standing position', 'Kick feet back into plank and touch chest to floor', 'Press up explosively and hop feet back to hands', 'Jump vertically with arms reaching overhead'])
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    target_muscle = EXCLUDED.target_muscle,
    equipment = EXCLUDED.equipment,
    difficulty = EXCLUDED.difficulty,
    movement_type = EXCLUDED.movement_type,
    sets_default = EXCLUDED.sets_default,
    reps_default = EXCLUDED.reps_default,
    rest_seconds = EXCLUDED.rest_seconds,
    instruction_cues = EXCLUDED.instruction_cues;

-- 2. Insert Home Workouts without Equipment
INSERT INTO workouts (id, user_id, title, category, duration_est_min, difficulty, target_goal, equipment_required, workout_location)
VALUES
('w0000000-0000-0000-0000-000000000016', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Zero-Equipment Home Core Crusher', 'Core & Abdominals', 25, 'BEGINNER', 'FAT_LOSS', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000017', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Awakened Home Calisthenics Full-Body', 'Full Body Bodyweight', 35, 'BEGINNER', 'GENERAL_FITNESS', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000018', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Shadow Hunter High-Intensity Fat Burner', 'HIIT & Calisthenics', 30, 'INTERMEDIATE', 'FAT_LOSS', 'BODYWEIGHT', 'HOME')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    duration_est_min = EXCLUDED.duration_est_min,
    difficulty = EXCLUDED.difficulty,
    target_goal = EXCLUDED.target_goal,
    equipment_required = EXCLUDED.equipment_required,
    workout_location = EXCLUDED.workout_location;

