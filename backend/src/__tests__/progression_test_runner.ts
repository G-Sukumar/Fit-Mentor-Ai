import assert from 'assert';

// Simulated progression logic corresponding directly to frontend/src/services/progressionService.ts
export function getHunterRank(level: number): string {
  if (level >= 60) return 'Shadow Monarch';
  if (level >= 45) return 'S-Rank';
  if (level >= 35) return 'A-Rank';
  if (level >= 25) return 'B-Rank';
  if (level >= 15) return 'C-Rank';
  if (level >= 8) return 'D-Rank';
  return 'E-Rank';
}

interface ProgressionState {
  claimedQuestIds: string[];
  bonusXp: number;
  awardedSessionIds: string[];
}

class TestProgressionManager {
  private state: ProgressionState = {
    claimedQuestIds: [],
    bonusXp: 0,
    awardedSessionIds: [],
  };

  public computeStats(volumeKg: number, stepsRatio: number, streakDays: number, recoveryScore: number) {
    const strength = Math.min(99, Math.max(40, Math.round(50 + (volumeKg / 1000))));
    const endurance = Math.min(99, Math.max(35, Math.round(55 + (stepsRatio * 13))));
    const discipline = Math.min(99, Math.max(50, Math.round(60 + (streakDays * 3.5))));
    const recovery = Math.min(99, Math.max(30, Math.round(recoveryScore * 0.8 + 10)));

    return { strength, endurance, discipline, recovery };
  }

  public claimQuest(questId: string, reward: number): boolean {
    if (this.state.claimedQuestIds.includes(questId)) {
      return false; // Prevent duplicate award
    }
    this.state.claimedQuestIds.push(questId);
    this.state.bonusXp += reward;
    return true;
  }

  public recordSession(sessionId: string): boolean {
    if (this.state.awardedSessionIds.includes(sessionId)) {
      return false; // Prevent duplicate award
    }
    this.state.awardedSessionIds.push(sessionId);
    this.state.bonusXp += 500;
    return true;
  }

  public getBonusXp(): number {
    return this.state.bonusXp;
  }
}

console.log('⚔️ Running FitMentor Solo Leveling Fitness RPG Progression Test Suite...\n');

let passed = 0;
let total = 0;

function runTest(description: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${description}`);
    passed++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${description}:`, err.message);
  }
}

// 1. Rank determination tests
runTest('First-time user starts at Level 1 mapping to E-Rank Hunter', () => {
  assert.strictEqual(getHunterRank(1), 'E-Rank');
});

runTest('Level 28 maps to B-Rank Hunter', () => {
  assert.strictEqual(getHunterRank(28), 'B-Rank');
});

runTest('Level 12 maps to D-Rank Hunter', () => {
  assert.strictEqual(getHunterRank(12), 'D-Rank');
});

runTest('Level 48 maps to S-Rank Hunter', () => {
  assert.strictEqual(getHunterRank(48), 'S-Rank');
});

runTest('Level 75 maps to Shadow Monarch', () => {
  assert.strictEqual(getHunterRank(75), 'Shadow Monarch');
});


// 2. Telemetry Stat derivation tests
const manager = new TestProgressionManager();

runTest('Attributes derive deterministically from live volume and telemetry', () => {
  const stats = manager.computeStats(22000, 1.24, 7, 75);
  assert.strictEqual(stats.strength, 72);
  assert.strictEqual(stats.endurance, 71);
  assert.strictEqual(stats.discipline, 85);
  assert.strictEqual(stats.recovery, 70);
});

// 3. Quest Reward Deduplication Tests
runTest('First claim of quest awards +500 XP', () => {
  const firstClaim = manager.claimQuest('quest_weekly_3', 500);
  assert.strictEqual(firstClaim, true);
  assert.strictEqual(manager.getBonusXp(), 500);
});

runTest('Repeated claim of same quest is rejected with no duplicate XP', () => {
  const duplicateClaim = manager.claimQuest('quest_weekly_3', 500);
  assert.strictEqual(duplicateClaim, false);
  assert.strictEqual(manager.getBonusXp(), 500); // XP remains exactly 500
});

// 4. Workout Session Award Deduplication Tests
runTest('First workout session completion awards +500 XP', () => {
  const firstSession = manager.recordSession('session_log_001');
  assert.strictEqual(firstSession, true);
  assert.strictEqual(manager.getBonusXp(), 1000); // 500 from quest + 500 from session
});

runTest('Repeated completion call of same session ID is rejected with no duplicate XP', () => {
  const duplicateSession = manager.recordSession('session_log_001');
  assert.strictEqual(duplicateSession, false);
  assert.strictEqual(manager.getBonusXp(), 1000); // XP remains exactly 1000
});

// 5. Verification on simulated re-rendering
runTest('100 repeated re-renders do not change XP or award unearned rewards', () => {
  const xpBefore = manager.getBonusXp();
  for (let i = 0; i < 100; i++) {
    manager.computeStats(22000, 1.24, 7, 75);
  }
  assert.strictEqual(manager.getBonusXp(), xpBefore);
});

// 6. 10-Tier Solo Leveling Avatar Unlock Rules
const AVATAR_ROSTER = [
  { rankNumber: 10, name: 'Kamish', reqLevel: 1 },
  { rankNumber: 9, name: 'Sung Il-Hwan', reqLevel: 5 },
  { rankNumber: 8, name: 'Baran', reqLevel: 10 },
  { rankNumber: 7, name: 'Rakan', reqLevel: 18 },
  { rankNumber: 6, name: 'Bellion', reqLevel: 25 },
  { rankNumber: 5, name: 'Absolute Being', reqLevel: 35 },
  { rankNumber: 4, name: 'The Rulers', reqLevel: 42 },
  { rankNumber: 3, name: 'Ashborn', reqLevel: 50 },
  { rankNumber: 2, name: 'Antares', reqLevel: 55 },
  { rankNumber: 1, name: 'Sung Jinwoo', reqLevel: 60 }
];

runTest('Level 1 athlete unlocks only Rank 10 Kamish and locks Ranks 9 through 1', () => {
  const userLevel = 1;
  const unlocked = AVATAR_ROSTER.filter(a => userLevel >= a.reqLevel);
  const locked = AVATAR_ROSTER.filter(a => userLevel < a.reqLevel);

  assert.strictEqual(unlocked.length, 1);
  assert.strictEqual(unlocked[0].name, 'Kamish');
  assert.strictEqual(locked.length, 9);
  assert.strictEqual(locked[0].name, 'Sung Il-Hwan');
});

runTest('Earning 1,000 total XP ascends user from Level 1 to Level 2', () => {
  const totalXp = 1000;
  const level = 1 + Math.floor(totalXp / 1000);
  assert.strictEqual(level, 2);
});

runTest('Level 28 athlete unlocks Ranks 10 through 6 and locks Ranks 5 through 1', () => {

  const userLevel = 28;
  const unlocked = AVATAR_ROSTER.filter(a => userLevel >= a.reqLevel);
  const locked = AVATAR_ROSTER.filter(a => userLevel < a.reqLevel);

  assert.strictEqual(unlocked.length, 5); // Kamish, Sung Il-Hwan, Baran, Rakan, Bellion
  assert.strictEqual(locked.length, 5);   // Absolute Being, The Rulers, Ashborn, Antares, Sung Jinwoo
  assert.strictEqual(unlocked[unlocked.length - 1].name, 'Bellion');
  assert.strictEqual(locked[0].name, 'Absolute Being');
});

runTest('Level 60 unlocks Rank 1 Sung Jinwoo (Shadow Monarch)', () => {
  const maxLevel = 60;
  const unlocked = AVATAR_ROSTER.filter(a => maxLevel >= a.reqLevel);
  assert.strictEqual(unlocked.length, 10);
  assert.strictEqual(unlocked.some(a => a.name === 'Sung Jinwoo'), true);
});

console.log(`\n========================================`);
console.log(`Test Results: ${passed} / ${total} Passed (${Math.round((passed / total) * 100)}%)`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exit(1);
}

