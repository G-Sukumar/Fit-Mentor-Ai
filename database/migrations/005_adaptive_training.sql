-- =============================================================================
-- FitMentor AI — Milestone 5: Adaptive Workout Intelligence Migration
-- =============================================================================

-- 1. Extend workout_set_logs with decimal RPE, targets, and e1RM
ALTER TABLE workout_set_logs
ADD COLUMN IF NOT EXISTS target_reps INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC(6, 2) DEFAULT 70.0,
ADD COLUMN IF NOT EXISTS calculated_e1rm NUMERIC(6, 2) DEFAULT 0.0;

-- Ensure rpe_score can store decimal precision (e.g. 7.5, 8.5)
ALTER TABLE workout_set_logs 
ALTER COLUMN rpe_score TYPE NUMERIC(3, 1) USING rpe_score::NUMERIC(3, 1);

-- 2. Extend workout_logs with session RPE, training load, density, and e1RM delta
ALTER TABLE workout_logs
ADD COLUMN IF NOT EXISTS session_rpe NUMERIC(3, 1) DEFAULT 8.0,
ADD COLUMN IF NOT EXISTS training_load_score NUMERIC(8, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS volume_density_kg_min NUMERIC(8, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS avg_e1rm_delta_percent NUMERIC(5, 2) DEFAULT 0.0;

-- 3. Create user_exercise_baselines table to track historical PRs & current working weight
CREATE TABLE IF NOT EXISTS user_exercise_baselines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    current_e1rm NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    best_e1rm NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    last_working_weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
    last_working_reps INTEGER NOT NULL DEFAULT 0,
    last_working_rpe NUMERIC(3, 1) DEFAULT 8.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_exercise_unique UNIQUE(user_id, exercise_id)
);

-- 4. Create set_adaptations table for logging intra-session autoregulation advice
CREATE TABLE IF NOT EXISTS set_adaptations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_set_log_id UUID REFERENCES workout_set_logs(id) ON DELETE CASCADE,
    adaptation_type VARCHAR(50) NOT NULL,
    trigger_reason VARCHAR(100) NOT NULL,
    suggested_weight_kg NUMERIC(6, 2),
    suggested_reps INTEGER,
    suggested_rest_seconds INTEGER,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
