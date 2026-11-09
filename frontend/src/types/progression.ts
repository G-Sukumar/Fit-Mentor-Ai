export type HunterRank = 'E-Rank' | 'D-Rank' | 'C-Rank' | 'B-Rank' | 'A-Rank' | 'S-Rank' | 'Shadow Monarch';

export interface HunterAttributes {
  strength: number;
  endurance: number;
  discipline: number;
  recovery: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  iconType: 'shield' | 'crest' | 'star' | 'flame' | 'shadow' | 'trophy';
  color: 'blue' | 'violet' | 'gold' | 'cyan';
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface DailyActivityBar {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  volumeKg: number;
  workouts: number;
  intensity: number; // 0 to 100 for height rendering
}

/* =============================================================================
   Game Designer Level Rewards, Avatars & Armory Models
   ============================================================================= */

export interface HunterAvatar {
  id: string;
  name: string;
  rank: HunterRank;
  requiredLevel: number;
  tagline: string;
  avatarType: string;
  primaryColor: string;
  accentColor: string;
  lore: string;
  isUnlocked: boolean;
  avatarRankNumber?: number;
  imageSrc?: string;
  bannerSrc?: string;
  crestSrc?: string;
}

export interface AuraFrame {
  id: string;
  name: string;
  requiredLevel: number;
  glowClass: string;
  borderClass: string;
  description: string;
  isUnlocked: boolean;
}

export interface HunterTitle {
  id: string;
  title: string;
  requiredLevel: number;
  category: 'Rank' | 'Discipline' | 'Strength' | 'Mastery';
  isUnlocked: boolean;
}

export interface LevelRewardMilestone {
  level: number;
  rewardName: string;
  rewardType: 'avatar' | 'aura' | 'title' | 'perk';
  avatar?: HunterAvatar;
  aura?: AuraFrame;
  title?: HunterTitle;
  perkDescription?: string;
  isClaimed: boolean;
}

export interface ArmoryState {
  equippedAvatarId: string;
  equippedAuraId: string;
  equippedTitleId: string;
  claimedLevelRewardIds: number[];
}

export interface ProgressionProfile {
  level: number;
  hunterRank: HunterRank;
  currentXp: number;
  nextLevelXp: number;
  totalEarnedXp: number;
  attributes: HunterAttributes;
  activeQuests: Quest[];
  achievements: Achievement[];
  armory: ArmoryState;
  equippedAvatar: HunterAvatar;
  equippedAura: AuraFrame;
  equippedTitle: HunterTitle;
  availableRewards: LevelRewardMilestone[];
  allAvatars: HunterAvatar[];
  allAuras: AuraFrame[];
  allTitles: HunterTitle[];
  weeklyProgress: {
    completedWorkouts: number;
    targetWorkouts: number;
    totalVolumeKg: number;
    totalCalories: number;
    dailyActivity: DailyActivityBar[];
  };
}
