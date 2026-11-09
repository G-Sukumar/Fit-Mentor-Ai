import { Request, Response } from 'express';
import { query } from '../config/db';
import { logger } from '../utils/logger';

export interface UserProgressionData {
  userId: string;
  currentLevel: number;
  currentXp: number;
  totalEarnedXp: number;
  hunterRank: string;
  equippedAvatarId: string;
  equippedAuraId: string;
  equippedTitleId: string;
  claimedQuestIds: string[];
  unlockedAchievementIds: string[];
  claimedLevelRewardIds: number[];
  bonusXp: number;
  awardedSessionIds: string[];
}

export function calculateHunterRank(level: number): string {
  if (level >= 60) return 'Shadow Monarch';
  if (level >= 45) return 'S-Rank';
  if (level >= 35) return 'A-Rank';
  if (level >= 25) return 'B-Rank';
  if (level >= 15) return 'C-Rank';
  if (level >= 8) return 'D-Rank';
  return 'E-Rank';
}

// In-memory store fallback per user
export const inMemoryProgression: Map<string, UserProgressionData> = new Map();

export function createDefaultProgression(userId: string): UserProgressionData {
  return {
    userId,
    currentLevel: 1,
    currentXp: 0,
    totalEarnedXp: 0,
    hunterRank: 'E-Rank',
    equippedAvatarId: 'kamish_10',
    equippedAuraId: 'aura_initiate',
    equippedTitleId: 'title_kamish',
    claimedQuestIds: [],
    unlockedAchievementIds: [],
    claimedLevelRewardIds: [1],
    bonusXp: 0,
    awardedSessionIds: []
  };
}

export const getProgression = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const dbRes = await query(
        `SELECT user_id as "userId", current_level as "currentLevel", current_xp as "currentXp",
                total_earned_xp as "totalEarnedXp", hunter_rank as "hunterRank",
                equipped_avatar_id as "equippedAvatarId", equipped_aura_id as "equippedAuraId",
                equipped_title_id as "equippedTitleId", claimed_quest_ids as "claimedQuestIds",
                unlocked_achievement_ids as "unlockedAchievementIds", claimed_level_rewards as "claimedLevelRewardIds",
                bonus_xp as "bonusXp", awarded_session_ids as "awardedSessionIds"
         FROM user_progression
         WHERE user_id = $1`,
        [userId]
      );

      if (dbRes && dbRes.rows.length > 0) {
        return res.status(200).json({ success: true, progression: dbRes.rows[0] });
      }

      // If user row does not exist yet in DB, create initial Level 1 row
      const initial = createDefaultProgression(userId);
      await query(
        `INSERT INTO user_progression (
           user_id, current_level, current_xp, total_earned_xp, hunter_rank,
           equipped_avatar_id, equipped_aura_id, equipped_title_id,
           claimed_quest_ids, unlocked_achievement_ids, claimed_level_rewards, bonus_xp, awarded_session_ids
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (user_id) DO NOTHING`,
        [
          userId, initial.currentLevel, initial.currentXp, initial.totalEarnedXp, initial.hunterRank,
          initial.equippedAvatarId, initial.equippedAuraId, initial.equippedTitleId,
          initial.claimedQuestIds, initial.unlockedAchievementIds, initial.claimedLevelRewardIds,
          initial.bonusXp, initial.awardedSessionIds
        ]
      );
      inMemoryProgression.set(userId, initial);
      return res.status(200).json({ success: true, progression: initial });
    } catch (dbErr: any) {
      logger.warn('PostgreSQL progression query fallback:', dbErr.message);
    }

    // In-Memory Fallback
    if (!inMemoryProgression.has(userId)) {
      inMemoryProgression.set(userId, createDefaultProgression(userId));
    }
    return res.status(200).json({ success: true, progression: inMemoryProgression.get(userId) });
  } catch (error: any) {
    logger.error('Get progression error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user progression.' });
  }
};

export const syncProgression = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      currentLevel, currentXp, totalEarnedXp, hunterRank,
      equippedAvatarId, equippedAuraId, equippedTitleId,
      claimedQuestIds, unlockedAchievementIds, claimedLevelRewardIds,
      bonusXp, awardedSessionIds
    } = req.body;

    const updated: UserProgressionData = {
      userId,
      currentLevel: Number(currentLevel || 1),
      currentXp: Number(currentXp || 0),
      totalEarnedXp: Number(totalEarnedXp || 0),
      hunterRank: hunterRank || calculateHunterRank(Number(currentLevel || 1)),
      equippedAvatarId: equippedAvatarId || 'kamish_10',
      equippedAuraId: equippedAuraId || 'aura_initiate',
      equippedTitleId: equippedTitleId || 'title_kamish',
      claimedQuestIds: Array.isArray(claimedQuestIds) ? claimedQuestIds : [],
      unlockedAchievementIds: Array.isArray(unlockedAchievementIds) ? unlockedAchievementIds : [],
      claimedLevelRewardIds: Array.isArray(claimedLevelRewardIds) ? claimedLevelRewardIds : [1],
      bonusXp: Number(bonusXp || 0),
      awardedSessionIds: Array.isArray(awardedSessionIds) ? awardedSessionIds : []
    };

    try {
      await query(
        `INSERT INTO user_progression (
           user_id, current_level, current_xp, total_earned_xp, hunter_rank,
           equipped_avatar_id, equipped_aura_id, equipped_title_id,
           claimed_quest_ids, unlocked_achievement_ids, claimed_level_rewards, bonus_xp, awarded_session_ids, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE SET
           current_level = EXCLUDED.current_level,
           current_xp = EXCLUDED.current_xp,
           total_earned_xp = EXCLUDED.total_earned_xp,
           hunter_rank = EXCLUDED.hunter_rank,
           equipped_avatar_id = EXCLUDED.equipped_avatar_id,
           equipped_aura_id = EXCLUDED.equipped_aura_id,
           equipped_title_id = EXCLUDED.equipped_title_id,
           claimed_quest_ids = EXCLUDED.claimed_quest_ids,
           unlocked_achievement_ids = EXCLUDED.unlocked_achievement_ids,
           claimed_level_rewards = EXCLUDED.claimed_level_rewards,
           bonus_xp = EXCLUDED.bonus_xp,
           awarded_session_ids = EXCLUDED.awarded_session_ids,
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId, updated.currentLevel, updated.currentXp, updated.totalEarnedXp, updated.hunterRank,
          updated.equippedAvatarId, updated.equippedAuraId, updated.equippedTitleId,
          updated.claimedQuestIds, updated.unlockedAchievementIds, updated.claimedLevelRewardIds,
          updated.bonusXp, updated.awardedSessionIds
        ]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL progression sync fallback:', dbErr.message);
    }

    inMemoryProgression.set(userId, updated);
    return res.status(200).json({ success: true, progression: updated });
  } catch (error: any) {
    logger.error('Sync progression error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update progression.' });
  }
};

