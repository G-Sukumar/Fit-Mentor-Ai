-- =============================================================================
-- FitMentor AI — Milestone 3: Exercise Library & Workout Plans Seed Script
-- =============================================================================

-- 1. Seed Exercises Library across 8 Muscle Groups
INSERT INTO exercises (id, name, category, target_muscle, equipment, difficulty, movement_type, sets_default, reps_default, rest_seconds, instruction_cues)
VALUES 
-- Chest
('e0000000-0000-0000-0000-000000000001', 'Barbell Bench Press', 'Chest', 'Pectoralis Major', 'FULL_GYM', 'INTERMEDIATE', 'COMPOUND', 4, 6, 120, ARRAY['Retract scapula', 'Plant feet firmly on floor', 'Touch lower chest']),
('e0000000-0000-0000-0000-000000000002', 'Incline Dumbbell Press', 'Chest', 'Upper Pectoralis', 'DUMBBELLS', 'INTERMEDIATE', 'COMPOUND', 4, 8, 90, ARRAY['Set bench to 30 degrees', 'Drive dumbbells up in arc']),

-- Back
('e0000000-0000-0000-0000-000000000003', 'Barbell Bent-Over Row', 'Back', 'Latissimus Dorsi', 'FULL_GYM', 'INTERMEDIATE', 'COMPOUND', 4, 8, 90, ARRAY['Hinge at hips at 45°', 'Pull bar to lower sternum', 'Squeeze lats at peak']),
('e0000000-0000-0000-0000-000000000004', 'Lat Pulldown', 'Back', 'Latissimus Dorsi', 'FULL_GYM', 'BEGINNER', 'COMPOUND', 3, 10, 90, ARRAY['Grip slightly wider than shoulders', 'Pull down to upper chest']),

-- Shoulders
('e0000000-0000-0000-0000-000000000005', 'Overhead Barbell Press', 'Shoulders', 'Deltoids', 'FULL_GYM', 'ADVANCED', 'COMPOUND', 3, 8, 90, ARRAY['Brace core and glutes', 'Press bar straight up over head', 'Tuck chin']),
('e0000000-0000-0000-0000-000000000006', 'Dumbbell Lateral Raise', 'Shoulders', 'Lateral Deltoids', 'DUMBBELLS', 'BEGINNER', 'ISOLATION', 4, 12, 60, ARRAY['Lead with elbows', 'Slight forward lean']),

-- Biceps & Triceps
('e0000000-0000-0000-0000-000000000007', 'Barbell Bicep Curl', 'Biceps', 'Biceps Brachii', 'FULL_GYM', 'BEGINNER', 'ISOLATION', 3, 10, 60, ARRAY['Keep elbows pinned to sides', 'Full range of motion']),
('e0000000-0000-0000-0000-000000000008', 'Tricep Rope Pushdown', 'Triceps', 'Triceps Brachii', 'FULL_GYM', 'BEGINNER', 'ISOLATION', 3, 12, 60, ARRAY['Lock elbows in place', 'Spread rope ends at bottom']),

-- Legs
('e0000000-0000-0000-0000-000000000009', 'Barbell Back Squat', 'Legs', 'Quadriceps & Glutes', 'FULL_GYM', 'ADVANCED', 'COMPOUND', 4, 6, 120, ARRAY['Chest high', 'Break at hips and knees simultaneously', 'Depth below parallel']),
('e0000000-0000-0000-0000-000000000010', 'Romanian Deadlift', 'Legs', 'Hamstrings & Glutes', 'FULL_GYM', 'INTERMEDIATE', 'COMPOUND', 4, 8, 90, ARRAY['Maintain slight knee bend', 'Push hips back', 'Feel hamstring stretch']),

-- Core & Full Body
('e0000000-0000-0000-0000-000000000011', 'Hanging Leg Raise', 'Core', 'Rectus Abdominis', 'BODYWEIGHT', 'INTERMEDIATE', 'ISOLATION', 3, 15, 60, ARRAY['Control the swing', 'Lift knees to chest']),
('e0000000-0000-0000-0000-000000000012', 'Kettlebell Farmer Walk', 'Full Body', 'Total Body Conditioning', 'DUMBBELLS', 'BEGINNER', 'COMPOUND', 3, 1, 60, ARRAY['Stand tall with shoulders back', 'Walk in controlled strides'])
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Initial Workout Templates
INSERT INTO workouts (id, user_id, title, category, duration_est_min, difficulty)
VALUES
('w0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Power Hypertrophy Routine', 'Upper Body Strength', 60, 'ADVANCED'),
('w0000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lower Body Power & Core', 'Legs & Abs', 55, 'INTERMEDIATE')
ON CONFLICT (id) DO NOTHING;

-- 3. Link Exercises to Workout Templates
INSERT INTO workout_plan_exercises (workout_id, exercise_id, sequence_order, sets_target, reps_target, target_weight_kg, rest_seconds)
VALUES
('w0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 1, 4, 6, 80.00, 120),
('w0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 2, 4, 8, 70.00, 90),
('w0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 3, 3, 8, 50.00, 90),
('w0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000009', 1, 4, 6, 100.00, 120),
('w0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000010', 2, 4, 8, 85.00, 90)
ON CONFLICT DO NOTHING;
