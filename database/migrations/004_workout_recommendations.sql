-- =============================================================================
-- FitMentor AI — Milestone 4: Workout Recommendations Schema Extension
-- =============================================================================

-- Extend workouts table with explicit recommendation feature columns
ALTER TABLE workouts
ADD COLUMN IF NOT EXISTS target_goal VARCHAR(50) DEFAULT 'HYPERTROPHY',
ADD COLUMN IF NOT EXISTS equipment_required VARCHAR(50) DEFAULT 'FULL_GYM',
ADD COLUMN IF NOT EXISTS workout_location VARCHAR(50) DEFAULT 'GYM';

-- Ensure target_goal constraint matches user goal categories
DO $$
BEGIN
    ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_target_goal_check;
    ALTER TABLE workouts ADD CONSTRAINT workouts_target_goal_check 
        CHECK (target_goal IN ('HYPERTROPHY', 'FAT_LOSS', 'STRENGTH', 'ENDURANCE', 'GENERAL_FITNESS', 'RECOVERY'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
