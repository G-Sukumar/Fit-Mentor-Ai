-- =============================================================================
-- FitMentor AI — Initial Relational Database Schema Migration (PostgreSQL)
-- Specification Source: documentation/Database.md
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    fitness_level VARCHAR(30) DEFAULT 'INTERMEDIATE' CHECK (fitness_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    primary_goal VARCHAR(50) DEFAULT 'HYPERTROPHY' CHECK (primary_goal IN ('HYPERTROPHY', 'FAT_LOSS', 'STRENGTH', 'ENDURANCE', 'RECOVERY')),
    target_calories INTEGER DEFAULT 2400,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    height_cm NUMERIC(5, 2),
    weight_kg NUMERIC(5, 2),
    body_fat_percentage NUMERIC(4, 2),
    wearable_device VARCHAR(100),
    streak_days INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fitness Goals Table
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    target_value NUMERIC(10, 2) NOT NULL,
    current_value NUMERIC(10, 2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Exercises Library Table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    target_muscle VARCHAR(50) NOT NULL,
    sets_default INTEGER DEFAULT 4,
    reps_default INTEGER DEFAULT 8,
    rest_seconds INTEGER DEFAULT 90,
    instruction_cues TEXT[]
);

-- 5. Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration_est_min INTEGER NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'INTERMEDIATE'
);

-- 6. Workout History & Logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_calories INTEGER,
    average_hr INTEGER,
    rpe_score INTEGER CHECK (rpe_score BETWEEN 1 AND 10)
);

-- 7. Daily Biometrics & Telemetry Table
CREATE TABLE IF NOT EXISTS daily_biometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL UNIQUE,
    readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
    recovery_score INTEGER CHECK (recovery_score BETWEEN 0 AND 100),
    sleep_duration_min INTEGER,
    sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
    resting_hr INTEGER,
    daily_steps INTEGER DEFAULT 0,
    active_calories INTEGER DEFAULT 0
);

-- 8. Wearable Connections Table
CREATE TABLE IF NOT EXISTS wearable_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    connected BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    battery_level INTEGER
);

-- 9. AI Chat Sessions & Recommendations Table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),
    message TEXT NOT NULL,
    context_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
