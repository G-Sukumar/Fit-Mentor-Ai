-- =============================================================================
-- FitMentor AI — Milestone 6: User Progression & RPG System State Migration
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_progression (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_xp INTEGER NOT NULL DEFAULT 0,
    total_earned_xp INTEGER NOT NULL DEFAULT 0,
    hunter_rank VARCHAR(50) NOT NULL DEFAULT 'E-Rank',
    equipped_avatar_id VARCHAR(100) NOT NULL DEFAULT 'kamish_10',
    equipped_aura_id VARCHAR(100) NOT NULL DEFAULT 'aura_initiate',
    equipped_title_id VARCHAR(100) NOT NULL DEFAULT 'title_kamish',
    claimed_quest_ids TEXT[] DEFAULT '{}',
    unlocked_achievement_ids TEXT[] DEFAULT '{}',
    claimed_level_rewards INTEGER[] DEFAULT '{1}',
    bonus_xp INTEGER NOT NULL DEFAULT 0,
    awarded_session_ids TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_progression_user ON user_progression(user_id);

