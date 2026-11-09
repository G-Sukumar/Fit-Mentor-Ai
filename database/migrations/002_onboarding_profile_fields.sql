-- =============================================================================
-- FitMentor AI — Milestone 2: Onboarding & Profile Schema Extension (PostgreSQL)
-- Specification Source: Milestone 2 Requirement 3 (database/migrations/002_onboarding_profile_fields.sql)
-- =============================================================================

-- 1. Extend user_profiles table with onboarding fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50) DEFAULT 'MODERATELY_ACTIVE',
ADD COLUMN IF NOT EXISTS workout_location VARCHAR(50) DEFAULT 'GYM',
ADD COLUMN IF NOT EXISTS available_equipment VARCHAR(50) DEFAULT 'FULL_GYM',
ADD COLUMN IF NOT EXISTS preferred_duration_min INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS training_days_per_week INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Ensure users.primary_goal supports GENERAL_FITNESS
DO $$
BEGIN
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_primary_goal_check;
    ALTER TABLE users ADD CONSTRAINT users_primary_goal_check 
        CHECK (primary_goal IN ('HYPERTROPHY', 'FAT_LOSS', 'STRENGTH', 'ENDURANCE', 'GENERAL_FITNESS', 'RECOVERY'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
