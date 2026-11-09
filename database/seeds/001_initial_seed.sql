-- =============================================================================
-- FitMentor AI — Initial Seed Data Script (PostgreSQL)
-- =============================================================================

INSERT INTO users (id, email, password_hash, full_name, fitness_level, primary_goal, target_calories)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'sukumar@fitmentor.ai',
    '$2b$10$e8T.xQ2p2a/V29u91N10.eZ113X2.b3109a',
    'Sukumar',
    'ADVANCED',
    'HYPERTROPHY',
    2400
) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (user_id, age, height_cm, weight_kg, body_fat_percentage, wearable_device, streak_days)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    26,
    178,
    78,
    14.5,
    'Galaxy Watch 6',
    7
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO exercises (name, category, target_muscle, sets_default, reps_default, rest_seconds, instruction_cues)
VALUES 
('Barbell Bench Press', 'Chest', 'Pectoralis Major', 4, 6, 120, ARRAY['Retract scapula', 'Keep feet planted']),
('Incline Dumbbell Row', 'Back', 'Latissimus Dorsi', 4, 8, 90, ARRAY['Pull with elbows', 'Squeeze at top']),
('Overhead Barbell Press', 'Shoulders', 'Deltoids', 3, 8, 90, ARRAY['Keep core braced', 'Elbows tucked ~45°']);
