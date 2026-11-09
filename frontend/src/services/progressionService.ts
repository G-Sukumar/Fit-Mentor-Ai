import { UserProfile, ReadinessScore, HealthMetric, WorkoutSessionLog } from '../types/fitness';
import { 
  ProgressionProfile, 
  HunterRank, 
  HunterAttributes, 
  Quest, 
  Achievement, 
  DailyActivityBar,
  HunterAvatar,
  AuraFrame,
  HunterTitle,
  LevelRewardMilestone,
  ArmoryState
} from '../types/progression';
import { apiService } from './api';

const DEFAULT_STORAGE_KEY = 'fitmentor_hunter_progression_state';

function getStorageKey(userId?: string): string {
  if (userId) return `fitmentor_hunter_progression_${userId}`;
  return DEFAULT_STORAGE_KEY;
}

export interface PersistedProgressionState {
  claimedQuestIds: string[];
  unlockedAchievementIds: string[];
  bonusXp: number;
  lastAwardedSessionIds: string[];
  equippedAvatarId: string;
  equippedAuraId: string;
  equippedTitleId: string;
  claimedLevelRewardIds: number[];
}

// =============================================================================
// CATALOG: HUNTER AVATARS (Ascension Roster: Rank 10 to Rank 1)
// =============================================================================
export const ALL_HUNTER_AVATARS: Omit<HunterAvatar, 'isUnlocked'>[] = [
  {
    id: 'kamish_10',
    name: 'Kamish',
    rank: 'E-Rank',
    requiredLevel: 1,
    avatarRankNumber: 10,
    tagline: 'Dragon of Calamity',
    avatarType: 'kamish',
    primaryColor: '#00F5D4',
    accentColor: '#0D9488',
    imageSrc: '/avatars/rank_10_kamish_avatar.png',
    bannerSrc: '/avatars/rank_10_kamish_banner.png',
    crestSrc: '/avatars/rank_10_kamish_crest.png',
    lore: 'The legendary Dragon of Calamity with cataclysmic teal aura. The starting awakened avatar for every novice hunter.'
  },
  {
    id: 'sung_il_hwan_09',
    name: 'Sung Il-Hwan',
    rank: 'E-Rank',
    requiredLevel: 5,
    avatarRankNumber: 9,
    tagline: 'S-Rank Hunter • Golden Thunder Conduit',
    avatarType: 'sung_il_hwan',
    primaryColor: '#FBBF24',
    accentColor: '#D97706',
    imageSrc: '/avatars/rank_9_sung_il_hwan_avatar.png',
    bannerSrc: '/avatars/rank_9_sung_il_hwan_banner.png',
    crestSrc: '/avatars/rank_9_sung_il_hwan_crest.png',
    lore: 'Legendary warrior cloaked in crackling golden lightning. Proof that consistent daily compound reps forge divine power.'
  },
  {
    id: 'baran_08',
    name: 'Baran',
    rank: 'D-Rank',
    requiredLevel: 10,
    avatarRankNumber: 8,
    tagline: 'Monarch of White Flames',
    avatarType: 'baran',
    primaryColor: '#38BDF8',
    accentColor: '#0284C7',
    imageSrc: '/avatars/rank_8_baran_avatar.png',
    bannerSrc: '/avatars/rank_8_baran_banner.png',
    crestSrc: '/avatars/rank_8_baran_crest.png',
    lore: 'Demon King crowned in white hellfire and icy crystalline plate. Conquered after breaking initial strength plateau thresholds.'
  },
  {
    id: 'rakan_07',
    name: 'Rakan',
    rank: 'C-Rank',
    requiredLevel: 18,
    avatarRankNumber: 7,
    tagline: 'Beast Monarch',
    avatarType: 'rakan',
    primaryColor: '#F97316',
    accentColor: '#C2410C',
    imageSrc: '/avatars/rank_7_rakan_avatar.png',
    bannerSrc: '/avatars/rank_7_rakan_banner.png',
    crestSrc: '/avatars/rank_7_rakan_crest.png',
    lore: 'The feral king of wolves and apex predatory instinct. Bestowed upon hunters who train with raw, savage intensity.'
  },
  {
    id: 'bellion_06',
    name: 'Bellion',
    rank: 'B-Rank',
    requiredLevel: 25,
    avatarRankNumber: 6,
    tagline: 'Grand Marshal • Commander of the Shadow Legion',
    avatarType: 'bellion',
    primaryColor: '#A855F7',
    accentColor: '#7E22CE',
    imageSrc: '/avatars/rank_6_bellion_avatar.png',
    bannerSrc: '/avatars/rank_6_bellion_banner.png',
    crestSrc: '/avatars/rank_6_bellion_crest.png',
    lore: 'The supreme Grand Marshal of the shadow army, born from the World Tree. Commands total discipline and monstrous volume capacity.'
  },
  {
    id: 'absolute_being_05',
    name: 'Absolute Being',
    rank: 'A-Rank',
    requiredLevel: 35,
    avatarRankNumber: 5,
    tagline: 'Creator Deity',
    avatarType: 'absolute_being',
    primaryColor: '#FDE047',
    accentColor: '#EAB308',
    imageSrc: '/avatars/rank_5_absolute_being_avatar.png',
    bannerSrc: '/avatars/rank_5_absolute_being_banner.png',
    crestSrc: '/avatars/rank_5_absolute_being_crest.png',
    lore: 'The cosmic creator deity bathed in radiant solar corona. Represents total physical transcendence and elite cardiovascular drive.'
  },
  {
    id: 'the_rulers_04',
    name: 'The Rulers',
    rank: 'A-Rank',
    requiredLevel: 42,
    avatarRankNumber: 4,
    tagline: 'Divine Enforcers',
    avatarType: 'the_rulers',
    primaryColor: '#60A5FA',
    accentColor: '#2563EB',
    imageSrc: '/avatars/rank_4_the_rulers_avatar.png',
    bannerSrc: '/avatars/rank_4_the_rulers_banner.png',
    crestSrc: '/avatars/rank_4_the_rulers_crest.png',
    lore: 'The celestial army of light and heavenly enforcers. Unlocked upon breaching national-level physical fitness benchmarks.'
  },
  {
    id: 'ashborn_03',
    name: 'Ashborn',
    rank: 'S-Rank',
    requiredLevel: 50,
    avatarRankNumber: 3,
    tagline: 'Original Shadow Monarch',
    avatarType: 'ashborn',
    primaryColor: '#8B5CF6',
    accentColor: '#4C1D95',
    imageSrc: '/avatars/rank_3_ashborn_avatar.png',
    bannerSrc: '/avatars/rank_3_ashborn_banner.png',
    crestSrc: '/avatars/rank_3_ashborn_crest.png',
    lore: 'The Great Fragment of Brilliant Light and progenitor of shadows. Imbued with endless dark mana and sovereign dominion.'
  },
  {
    id: 'antares_02',
    name: 'Antares',
    rank: 'S-Rank',
    requiredLevel: 55,
    avatarRankNumber: 2,
    tagline: 'Monarch of Destruction',
    avatarType: 'antares',
    primaryColor: '#EF4444',
    accentColor: '#B91C1C',
    imageSrc: '/avatars/rank_2_antares_avatar.png',
    bannerSrc: '/avatars/rank_2_antares_banner.png',
    crestSrc: '/avatars/rank_2_antares_crest.png',
    lore: 'The Crimson Dragon King of obliteration and raging breath of death. Unlocked only by masters of maximum strength.'
  },
  {
    id: 'sung_jinwoo_01',
    name: 'Sung Jinwoo',
    rank: 'Shadow Monarch',
    requiredLevel: 60,
    avatarRankNumber: 1,
    tagline: 'Shadow Monarch • The Apex Sovereign',
    avatarType: 'sung_jinwoo',
    primaryColor: '#C084FC',
    accentColor: '#7C3AED',
    imageSrc: '/avatars/rank_1_sung_jinwoo_avatar.png',
    bannerSrc: '/avatars/rank_1_sung_jinwoo_banner.png',
    crestSrc: '/avatars/rank_1_sung_jinwoo_crest.png',
    lore: 'The ultimate Shadow Monarch. Rose from the weakest E-Rank to the supreme sovereign of life and death. The absolute pinnacle of FitMentor AI.'
  }
];

// =============================================================================
// CATALOG: AURA FRAMES
// =============================================================================
export const ALL_AURA_FRAMES: Omit<AuraFrame, 'isUnlocked'>[] = [
  {
    id: 'aura_initiate',
    name: 'Void Obsidian Frame',
    requiredLevel: 1,
    glowClass: '',
    borderClass: 'border-border/80',
    description: 'Minimalist deep obsidian perimeter for newly awakened hunters.'
  },
  {
    id: 'aura_calamity_cyan',
    name: 'Calamity Cyan Pulse',
    requiredLevel: 5,
    glowClass: 'shadow-[0_0_18px_rgba(0,245,212,0.4)]',
    borderClass: 'border-[#00F5D4]',
    description: 'Radiates a bright teal pulse inspired by Kamish the Dragon of Calamity.'
  },
  {
    id: 'aura_thunder_gold',
    name: 'Golden Lightning Aura',
    requiredLevel: 10,
    glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.45)]',
    borderClass: 'border-amber-400',
    description: 'Cracking golden electricity dancing along the borders of your avatar.'
  },
  {
    id: 'aura_violet_surge',
    name: 'Violet Surge Aura',
    requiredLevel: 18,
    glowClass: 'shadow-[0_0_22px_rgba(168,85,247,0.45)]',
    borderClass: 'border-purple-500',
    description: 'Concentrated purple shadow mana accumulated through intense training blocks.'
  },
  {
    id: 'aura_grand_marshal',
    name: 'Grand Marshal Void Aura',
    requiredLevel: 25,
    glowClass: 'shadow-[0_0_25px_rgba(139,92,246,0.55)]',
    borderClass: 'border-secondary',
    description: 'Signature aura of Bellion and the shadow army command legion.'
  },
  {
    id: 'aura_crimson_destruction',
    name: 'Crimson Destruction Flames',
    requiredLevel: 45,
    glowClass: 'shadow-[0_0_28px_rgba(239,68,68,0.55)]',
    borderClass: 'border-red-500',
    description: 'Blazing crimson dragon fire inspired by Antares the Monarch of Destruction.'
  },
  {
    id: 'aura_monarch_eclipse',
    name: 'Monarch Abyssal Eclipse',
    requiredLevel: 60,
    glowClass: 'shadow-[0_0_35px_rgba(192,132,252,0.7)]',
    borderClass: 'border-purple-300',
    description: 'The supreme shadow aura of Sung Jinwoo. Swirling dark matter and ethereal violet flame.'
  }
];

// =============================================================================
// CATALOG: HUNTER TITLES
// =============================================================================
export const ALL_HUNTER_TITLES: Omit<HunterTitle, 'isUnlocked'>[] = [
  { id: 'title_kamish', title: 'Dragon of Calamity', requiredLevel: 1, category: 'Rank' },
  { id: 'title_thunder', title: 'Golden Thunder Conduit', requiredLevel: 5, category: 'Discipline' },
  { id: 'title_white_flames', title: 'Monarch of White Flames', requiredLevel: 10, category: 'Strength' },
  { id: 'title_beast', title: 'Beast Monarch', requiredLevel: 18, category: 'Mastery' },
  { id: 'title_marshal', title: 'Grand Marshal', requiredLevel: 25, category: 'Strength' },
  { id: 'title_creator', title: 'Creator Deity', requiredLevel: 35, category: 'Mastery' },
  { id: 'title_enforcer', title: 'Divine Enforcer', requiredLevel: 42, category: 'Rank' },
  { id: 'title_original_shadow', title: 'Original Shadow Monarch', requiredLevel: 50, category: 'Mastery' },
  { id: 'title_destruction', title: 'Monarch of Destruction', requiredLevel: 55, category: 'Strength' },
  { id: 'title_shadow_monarch', title: 'Shadow Monarch', requiredLevel: 60, category: 'Mastery' }
];

// =============================================================================
// CATALOG: LEVEL REWARD MILESTONES (1 to 60)
// =============================================================================
export const LEVEL_REWARDS_ROADMAP: Omit<LevelRewardMilestone, 'isClaimed'>[] = [
  {
    level: 1,
    rewardName: 'Kamish Avatar (#10) & Dragon of Calamity Title',
    rewardType: 'avatar',
    perkDescription: 'Novice awakening: Unlocks legendary dragon avatar & E-Rank access'
  },
  {
    level: 5,
    rewardName: 'Sung Il-Hwan Avatar (#9) & Golden Thunder Aura',
    rewardType: 'avatar',
    perkDescription: 'Unlocks golden lightning hunter avatar and electric aura frame'
  },
  {
    level: 10,
    rewardName: 'Baran Avatar (#8) & +5% Daily Quest XP Multiplier',
    rewardType: 'avatar',
    perkDescription: 'Unlocks white flames demon king avatar & D-Rank Hunter status'
  },
  {
    level: 18,
    rewardName: 'Rakan Avatar (#7) & Beast Monarch Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks feral lion beast monarch avatar & C-Rank Hunter status'
  },
  {
    level: 25,
    rewardName: 'Bellion Avatar (#6) & Grand Marshal Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks colossal shadow legion commander avatar and B-Rank authority'
  },
  {
    level: 28,
    rewardName: 'Ascension Sigil & +800 Bonus XP',
    rewardType: 'perk',
    perkDescription: 'Power milestone: High B-Rank power threshold'
  },
  {
    level: 35,
    rewardName: 'Absolute Being Avatar (#5) & Creator Deity Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks cosmic creator deity avatar and A-Rank Hunter status'
  },
  {
    level: 42,
    rewardName: 'The Rulers Avatar (#4) & Divine Enforcers Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks heavenly angelic vanguard avatar and celestial aura'
  },
  {
    level: 50,
    rewardName: 'Ashborn Avatar (#3) & Original Shadow Monarch Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks primordial shadow monarch armor avatar and S-Rank status'
  },
  {
    level: 55,
    rewardName: 'Antares Avatar (#2) & Monarch of Destruction Title',
    rewardType: 'avatar',
    perkDescription: 'Unlocks blazing dragon emperor avatar and crimson flame frame'
  },
  {
    level: 60,
    rewardName: 'Sung Jinwoo Avatar (#1) & Apex Shadow Monarch Throne',
    rewardType: 'avatar',
    perkDescription: 'The pinnacle reward: Supreme Shadow Monarch avatar and Abyssal Eclipse aura'
  }
];

function getInitialState(): PersistedProgressionState {
  return {
    claimedQuestIds: [],
    unlockedAchievementIds: [],
    bonusXp: 0,
    lastAwardedSessionIds: [],
    equippedAvatarId: 'kamish_10',
    equippedAuraId: 'aura_initiate',
    equippedTitleId: 'title_kamish',
    claimedLevelRewardIds: [1]
  };
}

function loadPersistedState(userId?: string): PersistedProgressionState {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isKnownAvatar = ALL_HUNTER_AVATARS.some(a => a.id === parsed.equippedAvatarId);
      const isKnownAura = ALL_AURA_FRAMES.some(a => a.id === parsed.equippedAuraId);
      const isKnownTitle = ALL_HUNTER_TITLES.some(t => t.id === parsed.equippedTitleId);

      return {
        claimedQuestIds: Array.isArray(parsed.claimedQuestIds) ? parsed.claimedQuestIds : [],
        unlockedAchievementIds: Array.isArray(parsed.unlockedAchievementIds) ? parsed.unlockedAchievementIds : [],
        bonusXp: typeof parsed.bonusXp === 'number' ? parsed.bonusXp : 0,
        lastAwardedSessionIds: Array.isArray(parsed.lastAwardedSessionIds) ? parsed.lastAwardedSessionIds : [],
        equippedAvatarId: isKnownAvatar ? parsed.equippedAvatarId : 'kamish_10',
        equippedAuraId: isKnownAura ? parsed.equippedAuraId : 'aura_initiate',
        equippedTitleId: isKnownTitle ? parsed.equippedTitleId : 'title_kamish',
        claimedLevelRewardIds: Array.isArray(parsed.claimedLevelRewardIds) ? parsed.claimedLevelRewardIds : [1]
      };
    }
  } catch (e) {
    console.error('Failed to parse persisted progression state:', e);
  }
  return getInitialState();
}

function savePersistedState(state: PersistedProgressionState, userId?: string) {
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
    // Also keep default key synced for non-user views
    localStorage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('fitmentor_progression_updated'));

    // Asynchronously synchronize with backend API
    apiService.syncProgression({
      ...state,
      currentLevel: 1 + Math.floor(state.bonusXp / 1000),
      currentXp: state.bonusXp % 1000,
      totalEarnedXp: state.bonusXp,
      hunterRank: getHunterRank(1 + Math.floor(state.bonusXp / 1000))
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to save progression state:', e);
  }
}

export function getHunterRank(level: number): HunterRank {
  if (level >= 60) return 'Shadow Monarch';
  if (level >= 45) return 'S-Rank';
  if (level >= 35) return 'A-Rank';
  if (level >= 25) return 'B-Rank';
  if (level >= 15) return 'C-Rank';
  if (level >= 8) return 'D-Rank';
  return 'E-Rank';
}

export const progressionService = {
  getPersistedState: loadPersistedState,

  computeProgression(
    user?: UserProfile | null,
    readiness?: ReadinessScore | null,
    metrics?: HealthMetric | null,
    history: WorkoutSessionLog[] = []
  ): ProgressionProfile {
    const state = loadPersistedState(user?.id);

    // 1. Calculate cumulative volume & workout count strictly from verified user history
    const verifiedHistoryCount = history.length;
    const totalVolume = history.reduce((acc, h) => acc + (Number(h.totalVolumeKg) || 0), 0);
    const totalCalories = history.reduce((acc, h) => acc + (Number(h.totalCalories) || 0), 0);

    // 2. Derive Attributes directly from telemetry & user actions:
    // Starts at authentic baseline (15-25) and increases with performance
    const strength = Math.min(99, Math.max(15, Math.round(20 + (totalVolume / 500))));
    const stepsRatio = metrics?.steps && metrics.steps.goal ? (metrics.steps.current / metrics.steps.goal) : 0.4;
    const endurance = Math.min(99, Math.max(15, Math.round(20 + (stepsRatio * 20) + (verifiedHistoryCount * 2))));
    const streak = user?.streakDays || 0;
    const discipline = Math.min(99, Math.max(15, Math.round(20 + (streak * 5) + (verifiedHistoryCount * 3))));
    const recovery = Math.min(99, Math.max(15, Math.round((readiness?.recoveryScore || readiness?.score || 50) * 0.8 + 10)));

    const attributes: HunterAttributes = {
      strength: Math.min(99, Math.max(1, strength)),
      endurance: Math.min(99, Math.max(1, endurance)),
      discipline: Math.min(99, Math.max(1, discipline)),
      recovery: Math.min(99, Math.max(1, recovery)),
    };

    // 3. Level & XP system:
    // Starts at Level 1 with 0 XP for first-time users.
    // 1,000 XP per level.
    const xpPerLevel = 1000;
    const workoutSessionXp = (verifiedHistoryCount * 500) + Math.round(totalVolume / 100);
    const totalEarnedXp = (state.bonusXp || 0) + workoutSessionXp;

    const level = 1 + Math.floor(totalEarnedXp / xpPerLevel);
    const currentXp = totalEarnedXp % xpPerLevel;
    const nextLevelXp = xpPerLevel;
    const hunterRank = getHunterRank(level);

    // 4. Quests tracking real user actions
    const quests: Quest[] = [
      {
        id: 'q_weekly_3_workouts',
        title: 'Complete 3 Workouts This Week',
        description: 'Engage in at least 3 completed physical sessions.',
        currentProgress: Math.min(3, verifiedHistoryCount),
        targetProgress: 3,
        xpReward: 500,
        isCompleted: verifiedHistoryCount >= 3,
        isClaimed: state.claimedQuestIds.includes('q_weekly_3_workouts'),
      },
      {
        id: 'q_new_personal_record',
        title: 'Hit a New Personal Record',
        description: 'Log heavy sets or complete compound strength movements.',
        currentProgress: totalVolume > 0 ? 1 : 0,
        targetProgress: 1,
        xpReward: 300,
        isCompleted: totalVolume > 0,
        isClaimed: state.claimedQuestIds.includes('q_new_personal_record'),
      },
      {
        id: 'q_7day_streak',
        title: 'Maintain a 7-Day Workout Streak',
        description: 'Log activity or complete prescribed sessions 7 days consecutively.',
        currentProgress: Math.min(7, streak),
        targetProgress: 7,
        xpReward: 700,
        isCompleted: streak >= 7,
        isClaimed: state.claimedQuestIds.includes('q_7day_streak'),
      },
    ];

    // 5. Achievements unlocked strictly on merit
    const achievements: Achievement[] = [
      {
        id: 'ach_first_workout',
        title: 'First Workout',
        subtitle: 'Completed initial training dungeon',
        iconType: 'shield',
        color: 'blue',
        isUnlocked: verifiedHistoryCount >= 1 || state.unlockedAchievementIds.includes('ach_first_workout'),
      },
      {
        id: 'ach_week_warrior',
        title: 'Week Warrior',
        subtitle: '7-day streak maintained',
        iconType: 'crest',
        color: 'violet',
        isUnlocked: streak >= 7 || state.unlockedAchievementIds.includes('ach_week_warrior'),
      },
      {
        id: 'ach_strength_gain',
        title: 'Strength Gain',
        subtitle: 'Accumulated 10,000+ kg volume',
        iconType: 'star',
        color: 'gold',
        isUnlocked: totalVolume >= 10000 || state.unlockedAchievementIds.includes('ach_strength_gain'),
      },
      {
        id: 'ach_shadow_athlete',
        title: 'Shadow Athlete',
        subtitle: 'Ascended to Lv. 25 Rank',
        iconType: 'shadow',
        color: 'violet',
        isUnlocked: level >= 25 || state.unlockedAchievementIds.includes('ach_shadow_athlete'),
      },
    ];

    // 6. Armory: Avatars, Auras, Titles
    const allAvatars: HunterAvatar[] = ALL_HUNTER_AVATARS.map(av => ({
      ...av,
      isUnlocked: level >= av.requiredLevel
    }));

    const allAuras: AuraFrame[] = ALL_AURA_FRAMES.map(au => ({
      ...au,
      isUnlocked: level >= au.requiredLevel
    }));

    const allTitles: HunterTitle[] = ALL_HUNTER_TITLES.map(ti => ({
      ...ti,
      isUnlocked: level >= ti.requiredLevel
    }));

    const equippedAvatar = allAvatars.find(a => a.id === state.equippedAvatarId && a.isUnlocked) 
      || allAvatars.find(a => a.isUnlocked && a.requiredLevel <= level) 
      || allAvatars[0];

    const equippedAura = allAuras.find(a => a.id === state.equippedAuraId && a.isUnlocked)
      || allAuras.find(a => a.isUnlocked)
      || allAuras[0];

    const equippedTitle = allTitles.find(t => t.id === state.equippedTitleId && t.isUnlocked)
      || allTitles.find(t => t.isUnlocked)
      || allTitles[0];

    const availableRewards: LevelRewardMilestone[] = LEVEL_REWARDS_ROADMAP.map(r => ({
      ...r,
      isClaimed: state.claimedLevelRewardIds.includes(r.level)
    }));

    const armory: ArmoryState = {
      equippedAvatarId: equippedAvatar.id,
      equippedAuraId: equippedAura.id,
      equippedTitleId: equippedTitle.id,
      claimedLevelRewardIds: state.claimedLevelRewardIds
    };

    // 7. Weekly Activity Data derived from real workout records
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap: Record<string, { volumeKg: number; workouts: number }> = {
      Mon: { volumeKg: 0, workouts: 0 },
      Tue: { volumeKg: 0, workouts: 0 },
      Wed: { volumeKg: 0, workouts: 0 },
      Thu: { volumeKg: 0, workouts: 0 },
      Fri: { volumeKg: 0, workouts: 0 },
      Sat: { volumeKg: 0, workouts: 0 },
      Sun: { volumeKg: 0, workouts: 0 },
    };

    history.forEach(h => {
      if (h.completedAt || h.startedAt) {
        const d = new Date(h.completedAt || h.startedAt);
        const dayName = days[d.getDay()];
        if (dayMap[dayName]) {
          dayMap[dayName].volumeKg += Number(h.totalVolumeKg) || 0;
          dayMap[dayName].workouts += 1;
        }
      }
    });

    const maxDayVol = Math.max(1, ...Object.values(dayMap).map(d => d.volumeKg));
    const weekDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyActivity: DailyActivityBar[] = weekDays.map(day => ({
      day,
      volumeKg: dayMap[day].volumeKg,
      workouts: dayMap[day].workouts,
      intensity: dayMap[day].volumeKg > 0 ? Math.min(100, Math.round((dayMap[day].volumeKg / maxDayVol) * 100)) : 0
    }));

    return {
      level,
      hunterRank,
      currentXp,
      nextLevelXp,
      totalEarnedXp,
      attributes,
      activeQuests: quests,
      achievements,
      armory,
      equippedAvatar,
      equippedAura,
      equippedTitle,
      availableRewards,
      allAvatars,
      allAuras,
      allTitles,
      weeklyProgress: {
        completedWorkouts: verifiedHistoryCount,
        targetWorkouts: user?.trainingDaysPerWeek || 4,
        totalVolumeKg: totalVolume,
        totalCalories: totalCalories,
        dailyActivity,
      },
    };
  },

  equipAvatar(avatarId: string, userId?: string): boolean {
    const state = loadPersistedState(userId);
    const avatar = ALL_HUNTER_AVATARS.find(a => a.id === avatarId);
    if (!avatar) return false;
    state.equippedAvatarId = avatarId;
    savePersistedState(state, userId);
    return true;
  },

  equipAura(auraId: string, userId?: string): boolean {
    const state = loadPersistedState(userId);
    const aura = ALL_AURA_FRAMES.find(a => a.id === auraId);
    if (!aura) return false;
    state.equippedAuraId = auraId;
    savePersistedState(state, userId);
    return true;
  },

  equipTitle(titleId: string, userId?: string): boolean {
    const state = loadPersistedState(userId);
    const title = ALL_HUNTER_TITLES.find(t => t.id === titleId);
    if (!title) return false;
    state.equippedTitleId = titleId;
    savePersistedState(state, userId);
    return true;
  },

  claimLevelReward(level: number, userId?: string): boolean {
    const state = loadPersistedState(userId);
    if (state.claimedLevelRewardIds.includes(level)) {
      return false;
    }
    state.claimedLevelRewardIds.push(level);
    savePersistedState(state, userId);
    return true;
  },

  claimQuestReward(questId: string, xpReward: number, userId?: string): boolean {
    const state = loadPersistedState(userId);
    if (state.claimedQuestIds.includes(questId)) {
      return false;
    }

    state.claimedQuestIds.push(questId);
    state.bonusXp += xpReward;
    savePersistedState(state, userId);
    return true;
  },

  recordWorkoutCompletion(sessionId: string, userId?: string, volumeKg?: number): boolean {
    const state = loadPersistedState(userId);
    if (state.lastAwardedSessionIds.includes(sessionId)) {
      return false;
    }

    state.lastAwardedSessionIds.push(sessionId);
    // Base 500 XP + volume XP
    const volumeBonus = volumeKg ? Math.round(volumeKg / 100) : 0;
    state.bonusXp += (500 + volumeBonus);
    if (!state.unlockedAchievementIds.includes('ach_first_workout')) {
      state.unlockedAchievementIds.push('ach_first_workout');
    }
    savePersistedState(state, userId);
    return true;
  },

  /** Simulator to trigger a Level Ascension event (adds exact 1,000 XP needed for next level) */
  simulateLevelUp(userId?: string): { newLevel: number; reward: LevelRewardMilestone | undefined } {
    const state = loadPersistedState(userId);
    state.bonusXp += 1000;
    const newLevel = 1 + Math.floor(state.bonusXp / 1000);
    const reward = LEVEL_REWARDS_ROADMAP.find(r => r.level <= newLevel && !state.claimedLevelRewardIds.includes(r.level))
      || LEVEL_REWARDS_ROADMAP.find(r => r.level === newLevel);
    savePersistedState(state, userId);
    return { newLevel, reward: reward ? { ...reward, isClaimed: false } : undefined };
  }
};
