-- =============================================================================
-- FitMentor AI — Milestone 3: Workout Management & Set Logging Schema Migration
-- Specification Source: Milestone 3 Requirements (database/migrations/003_workout_management.sql)
-- =============================================================================

-- 1. Extend exercises table with equipment, difficulty, movement type
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS equipment VARCHAR(50) DEFAULT 'FULL_GYM',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(30) DEFAULT 'INTERMEDIATE',
ADD COLUMN IF NOT EXISTS movement_type VARCHAR(50) DEFAULT 'COMPOUND';

-- 2. Create workout_plan_exercises junction table linking workout plans to target exercises
CREATE TABLE IF NOT EXISTS workout_plan_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    sets_target INTEGER NOT NULL DEFAULT 4,
    reps_target INTEGER NOT NULL DEFAULT 8,
    target_weight_kg NUMERIC(5, 2) DEFAULT 0,
    rest_seconds INTEGER DEFAULT 90
);

-- 3. Create workout_set_logs table for active set-by-set weight & rep logging
CREATE TABLE IF NOT EXISTS workout_set_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps_completed INTEGER NOT NULL CHECK (reps_completed >= 0),
    weight_kg NUMERIC(6, 2) NOT NULL CHECK (weight_kg >= 0),
    rpe_score INTEGER CHECK (rpe_score BETWEEN 1 AND 10),
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extend workout_logs with total volume column
ALTER TABLE workout_logs
ADD COLUMN IF NOT EXISTS total_volume_kg NUMERIC(10, 2) DEFAULT 0;
