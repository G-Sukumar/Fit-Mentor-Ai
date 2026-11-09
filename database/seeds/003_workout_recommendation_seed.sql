-- =============================================================================
-- FitMentor AI — Milestone 4: Workout Catalog Seed Expansion (15 Templates)
-- =============================================================================

INSERT INTO workouts (id, user_id, title, category, duration_est_min, difficulty, target_goal, equipment_required, workout_location)
VALUES
('w0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Power Hypertrophy Upper Body', 'Upper Body', 60, 'ADVANCED', 'HYPERTROPHY', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lower Body Power & Core', 'Lower Body', 55, 'INTERMEDIATE', 'HYPERTROPHY', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beginner Full Gym Foundation', 'Full Body', 45, 'BEGINNER', 'GENERAL_FITNESS', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Calisthenics Fat Burner', 'Full Body Cardio', 30, 'BEGINNER', 'FAT_LOSS', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy Barbell Strength Overload', 'Strength', 90, 'ADVANCED', 'STRENGTH', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000006', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Home Dumbbell Muscle Builder', 'Upper Body', 60, 'INTERMEDIATE', 'HYPERTROPHY', 'DUMBBELLS', 'HOME'),
('w0000000-0000-0000-0000-000000000007', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'High Intensity Endurance Circuit', 'Endurance', 45, 'INTERMEDIATE', 'ENDURANCE', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Decompression & Joint Mobility Flow', 'Mobility & Stretch', 30, 'BEGINNER', 'RECOVERY', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000009', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Heavy Dumbbell Strength & Power', 'Full Body Strength', 75, 'ADVANCED', 'STRENGTH', 'DUMBBELLS', 'HOME'),
('w0000000-0000-0000-0000-000000000010', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gym Aerobic Stamina & Conditioning', 'Cardio & Legs', 75, 'ADVANCED', 'ENDURANCE', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000011', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Active Gym Recovery & Deload', 'Active Recovery', 45, 'INTERMEDIATE', 'RECOVERY', 'FULL_GYM', 'GYM'),
('w0000000-0000-0000-0000-000000000012', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dumbbell Fat Loss Metabolic HIIT', 'Metabolic', 45, 'INTERMEDIATE', 'FAT_LOSS', 'DUMBBELLS', 'HOME'),
('w0000000-0000-0000-0000-000000000013', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Advanced Bodyweight Calisthenics Volume', 'Bodyweight Hypertrophy', 60, 'INTERMEDIATE', 'HYPERTROPHY', 'BODYWEIGHT', 'HOME'),
('w0000000-0000-0000-0000-000000000014', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'General Fitness Express Dumbbells', 'Full Body', 30, 'BEGINNER', 'GENERAL_FITNESS', 'DUMBBELLS', 'HOME'),
('w0000000-0000-0000-0000-000000000015', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Advanced Bodyweight Stamina Challenge', 'Calisthenics Endurance', 90, 'ADVANCED', 'ENDURANCE', 'BODYWEIGHT', 'HOME')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    duration_est_min = EXCLUDED.duration_est_min,
    difficulty = EXCLUDED.difficulty,
    target_goal = EXCLUDED.target_goal,
    equipment_required = EXCLUDED.equipment_required,
    workout_location = EXCLUDED.workout_location;
