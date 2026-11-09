import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  ChevronRight, 
  Dumbbell, 
  Heart, 
  Brain, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  Target, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Zap, 
  Award,
  ChevronDown
} from 'lucide-react';
import { UserProfile, ReadinessScore, HealthMetric, Workout, WorkoutSessionLog } from '../types/fitness';
import { apiService } from '../services/api';
import { RecommendedWorkouts } from '../components/dashboard/RecommendedWorkouts';
import { AdaptiveRecommendationIntake, RecommendationContext } from '../components/dashboard/AdaptiveRecommendationIntake';
import { progressionService } from '../services/progressionService';
import { 
  HunterLevelCrest, 
  ShieldAchievementBadge, 
  WarriorCrestBadge, 
  GoldStrengthBadge, 
  ShadowAthleteBadge,
  GoldGobletIcon 
} from '../components/ui/HunterBadges';
import { resolveExerciseMetadata } from '../data/exerciseMetadataRegistry';
import { EquippedAvatarBadge } from '../components/ui/HunterAvatars';
import { LevelUpCelebrationModal } from '../components/progression/LevelUpCelebrationModal';
import { HunterArmoryModal } from '../components/progression/HunterArmoryModal';
import { HunterRank, LevelRewardMilestone } from '../types/progression';
import { getHunterRank } from '../services/progressionService';

interface DashboardProps {
  user: UserProfile;
  readiness: ReadinessScore;
  metrics: HealthMetric;
  workout: Workout;
  onStartWorkout: (workoutId?: string, exerciseIndex?: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  readiness, 
  metrics, 
  workout, 
  onStartWorkout 
}) => {
  const navigate = useNavigate();
  const [recommendationContext, setRecommendationContext] = useState<RecommendationContext>({ 
    sessionGoal: 'strength', 
    minutes: 45, 
    energy: 'ready', 
    painFree: true 
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSessionLog[]>([]);

  const [progression, setProgression] = useState(() => 
    progressionService.computeProgression(user, readiness, metrics, [])
  );

  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    level: number;
    rank: HunterRank;
    reward?: LevelRewardMilestone;
  }>({
    isOpen: false,
    level: 1,
    rank: 'E-Rank'
  });

  // Fetch real user workout history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const hist = await apiService.getWorkoutHistory();
        if (Array.isArray(hist)) {
          setWorkoutHistory(hist);
          setProgression(progressionService.computeProgression(user, readiness, metrics, hist));
        }
      } catch (err) {
        console.warn('Could not load user workout history:', err);
      }
    }
    loadHistory();
  }, [user]);

  const handleSimulateLevelUp = () => {
    const res = progressionService.simulateLevelUp(user?.id);
    setLevelUpModal({
      isOpen: true,
      level: res.newLevel,
      rank: getHunterRank(res.newLevel),
      reward: res.reward
    });
  };

  useEffect(() => {
    const handleProgressionUpdate = async () => {
      try {
        const hist = await apiService.getWorkoutHistory();
        if (Array.isArray(hist)) {
          setWorkoutHistory(hist);
          setProgression(progressionService.computeProgression(user, readiness, metrics, hist));
          return;
        }
      } catch {}
      setProgression(progressionService.computeProgression(user, readiness, metrics, workoutHistory));
    };
    window.addEventListener('fitmentor_progression_updated', handleProgressionUpdate);
    return () => window.removeEventListener('fitmentor_progression_updated', handleProgressionUpdate);
  }, [user, readiness, metrics, workoutHistory]);


  // Today's workout exercises (either from prop or top standard split)
  const defaultExercises = [
    { name: 'Bench Press', sets: 4, reps: '6–8', id: 'e1' },
    { name: 'Bent-Over Row', sets: 4, reps: '8–10', id: 'e2' },
    { name: 'Overhead Press', sets: 3, reps: '8–10', id: 'e3' },
    { name: 'Barbell Curl', sets: 3, reps: '10–12', id: 'e4' },
  ];

  const displayExercises = workout?.exercises?.length >= 4 
    ? workout.exercises.slice(0, 4).map((ex) => ({
        name: ex.name,
        sets: ex.setsDefault,
        reps: `${ex.repsDefault}`,
        id: ex.id
      }))
    : defaultExercises;

  // XP calculation
  const xpPercent = Math.min(100, Math.round((progression.currentXp / progression.nextLevelXp) * 100));

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-full overflow-x-hidden">
      
      {/* =========================================================================
          ROW 1: HERO BANNER & PLAYER PROGRESSION HUD
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Cinematic Hero Section */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border-cyan/30 shadow-hunter-glow">
          {/* Subtle Ambient Blue Lightning Background Aura */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-electric-blue/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />
          
          {/* Solo Leveling Training Graphic */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 sm:w-5/12 max-w-[300px] pointer-events-none overflow-hidden flex items-end justify-end select-none">
            <img 
              src="/solo_leveling_hero.jpg" 
              alt="Solo Leveling Workout Progression" 
              className="w-full h-full object-cover object-top opacity-80 sm:opacity-90 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            />
            {/* Smooth gradient blend into card background */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-navy to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-cyan uppercase font-bold">
                SYSTEM AWAKENING
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight leading-none text-soft-white uppercase">
              <span className="text-gradient-cyan-violet block mb-1">YOUR STRONGER</span>
              <span className="text-soft-white block">SELF</span>
            </h1>

            <div className="w-20 h-1 bg-gradient-to-r from-cyan to-electric-blue rounded-full my-3 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <p className="text-xs sm:text-sm font-mono tracking-wider text-text-secondary uppercase mt-2">
              IS A LEVEL HIGHER EVERY DAY.
            </p>

            <p className="text-xs text-text-muted mt-3 max-w-md leading-relaxed hidden sm:block">
              Daily telemetry synced. Autoregulation calibrated to your recovery index. Break your personal limits.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-border/40">
            <button
              onClick={() => onStartWorkout(workout?.id, 0)}
              className="btn-hunter-primary px-6 py-3 rounded-xl flex items-center gap-2 text-xs font-mono tracking-wide"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START WORKOUT</span>
            </button>

            <button
              onClick={() => navigate('/progress')}
              className="btn-hunter-secondary px-5 py-3 rounded-xl text-xs font-mono tracking-wide"
            >
              VIEW PROGRESS
            </button>
          </div>
        </div>

        {/* Right: Hunter Status & Quote HUD */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Player Progression Card */}
          <div className="glass-card rounded-2xl p-5 border-border flex flex-col justify-between space-y-4 bg-navy/90">
            {/* Header: User, Level, Crest */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <EquippedAvatarBadge 
                  avatar={progression.equippedAvatar} 
                  aura={progression.equippedAura} 
                  size={46}
                  onClick={() => setIsArmoryOpen(true)}
                />
                <div>
                  <h3 className="font-display font-bold text-text-primary text-base leading-tight flex items-center gap-2">
                    <span>{user.fullName || 'Hunter'}</span>
                    <button 
                      onClick={() => setIsArmoryOpen(true)}
                      className="text-[10px] font-mono text-cyan hover:underline bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan/30"
                    >
                      Armory
                    </button>
                  </h3>
                  <p className="text-xs font-mono text-cyan flex items-center gap-1.5 mt-0.5">
                    <span className="text-gold font-bold">#{progression.equippedAvatar.avatarRankNumber || 6} {progression.equippedAvatar.name}</span>
                    <span>•</span>
                    <span>{progression.hunterRank}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-base font-display font-bold text-soft-white flex items-center justify-end gap-1">
                    <span>Lv. {progression.level}</span>
                  </div>
                  <p className="text-[10px] font-mono text-text-muted">
                    {progression.currentXp.toLocaleString()} / {progression.nextLevelXp.toLocaleString()} XP
                  </p>
                </div>
                <HunterLevelCrest size={34} />
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="w-full bg-navy-elevated rounded-full h-1.5 overflow-hidden border border-border/60">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-electric-blue via-cyan to-secondary shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-700" 
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            {/* 4 Player Attributes Row */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* Strength */}
              <div className="bg-navy-elevated/80 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-electric-blue/15 text-electric-blue flex items-center justify-center shrink-0">
                  <Dumbbell className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-text-muted uppercase leading-tight truncate">STRENGTH</p>
                  <p className="text-sm font-display font-bold text-soft-white">{progression.attributes.strength}</p>
                </div>
              </div>

              {/* Endurance */}
              <div className="bg-navy-elevated/80 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan/15 text-cyan flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-text-muted uppercase leading-tight truncate">ENDURANCE</p>
                  <p className="text-sm font-display font-bold text-soft-white">{progression.attributes.endurance}</p>
                </div>
              </div>

              {/* Discipline */}
              <div className="bg-navy-elevated/80 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-text-muted uppercase leading-tight truncate">DISCIPLINE</p>
                  <p className="text-sm font-display font-bold text-soft-white">{progression.attributes.discipline}</p>
                </div>
              </div>

              {/* Recovery */}
              <div className="bg-navy-elevated/80 border border-border/80 rounded-xl p-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-success/15 text-success flex items-center justify-center shrink-0">
                  <PlusCircle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-mono text-text-muted uppercase leading-tight truncate">RECOVERY</p>
                  <p className="text-sm font-display font-bold text-soft-white">{progression.attributes.recovery}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Quote Banner */}
          <div className="glass-card rounded-2xl p-4 border-border/70 bg-gradient-to-r from-navy to-navy-elevated relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10 max-w-sm">
              <p className="text-xs font-display italic text-text-secondary leading-snug">
                “Small steps today, a stronger you tomorrow.”
              </p>
            </div>
            <div className="w-16 h-10 opacity-30 text-secondary shrink-0 flex items-center justify-end pointer-events-none">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          ROW 2: TODAY'S WORKOUT & PROGRESS COLUMNS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Today's Workout Card */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border-border flex flex-col justify-between space-y-5 bg-navy/80">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-cyan uppercase">
                TODAY'S WORKOUT
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <span>DAY 3 / 4</span>
                <button 
                  onClick={() => navigate('/workouts')}
                  className="p-1 rounded bg-navy-elevated text-text-secondary hover:text-cyan transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
              <div>
                <h3 className="text-2xl font-display font-bold text-text-primary tracking-tight">
                  {workout?.title || 'Power Hypertrophy Routine'}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold" /> {workout?.durationEstMin || 60} min
                  </span>
                  <span>•</span>
                  <span>{displayExercises.length} exercises</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-surface-elevated text-gold border border-gold/30 text-[10px] font-bold">
                    {workout?.difficulty || 'INTERMEDIATE'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onStartWorkout(workout?.id, 0)}
                className="btn-hunter-primary px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-mono font-bold self-start sm:self-auto shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Workout</span>
              </button>
            </div>
          </div>

          {/* 4 Exercise Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {displayExercises.map((ex, idx) => {
              const meta = resolveExerciseMetadata(ex.id, ex.name);
              const thumbUrl = meta.images?.start;

              return (
                <div
                  key={ex.name + idx}
                  onClick={() => onStartWorkout(workout?.id, idx)}
                  className="bg-navy-elevated/70 border border-border/80 hover:border-cyan/40 rounded-xl p-3 flex flex-col justify-between space-y-2 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-md bg-electric-blue/20 text-cyan text-[10px] font-mono font-bold flex items-center justify-center border border-cyan/30">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="w-full h-16 rounded-lg bg-navy flex items-center justify-center overflow-hidden border border-border/40 p-1">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={ex.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Dumbbell className="w-6 h-6 text-text-muted" />
                    )}
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-text-primary truncate group-hover:text-cyan transition-colors">
                      {ex.name}
                    </h5>
                    <p className="text-[10px] font-mono text-text-muted mt-0.5">
                      {ex.sets} × {ex.reps}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Level Progress & Weekly Progress */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          
          {/* Level Progress Card */}
          <div className="glass-card rounded-2xl p-5 border-border bg-navy/90 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider">
                  LEVEL PROGRESS
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <h4 className="text-2xl font-display font-bold text-soft-white">
                    Lv. {progression.level}
                  </h4>
                  <span className="text-xs font-mono text-cyan">
                    Hunter Rank
                  </span>
                </div>
              </div>
              <HunterLevelCrest size={34} />
            </div>

            {/* Glowing XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-text-muted">
                <span>Experience</span>
                <span className="text-soft-white">{progression.currentXp.toLocaleString()} / {progression.nextLevelXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-navy-elevated rounded-full h-2 overflow-hidden border border-border/60">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-electric-blue via-cyan to-secondary shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Next Reward Banner */}
            <div 
              onClick={() => setIsArmoryOpen(true)}
              className="mt-2 p-3 rounded-xl bg-navy-elevated border border-border/70 hover:border-secondary/40 flex items-center justify-between cursor-pointer group transition-all"
              title="Click to view all unlocked avatars, auras, and level rewards"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                  <ShadowAthleteBadge size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-mono text-cyan uppercase font-bold">Next Reward (Lv. {progression.level + 1})</p>
                    <span className="text-[9px] font-mono bg-cyan/15 text-cyan px-1.5 rounded">Armory</span>
                  </div>
                  <p className="text-xs font-display font-bold text-soft-white group-hover:text-secondary transition-colors">
                    {progression.availableRewards.find(r => r.level > progression.level)?.rewardName || 'Titan of Volume Avatar'}
                  </p>
                  <p className="text-[10px] text-text-secondary">Click to view & equip unlocked avatars</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-soft-white transition-colors" />
            </div>
          </div>

          {/* Weekly Progress Card */}
          <div className="glass-card rounded-2xl p-5 border-border bg-navy/90 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan uppercase tracking-wider">
                WEEKLY PROGRESS
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-text-secondary bg-navy-elevated px-2.5 py-1 rounded-lg border border-border/60">
                <span>This Week</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-navy-elevated/70 p-2.5 rounded-xl border border-border/60">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan">
                  <Target className="w-3 h-3" /> Workouts
                </div>
                <p className="text-sm font-display font-bold text-soft-white mt-1">
                  {progression.weeklyProgress.completedWorkouts} / {progression.weeklyProgress.targetWorkouts}
                </p>
              </div>

              <div className="bg-navy-elevated/70 p-2.5 rounded-xl border border-border/60">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-electric-blue">
                  <Layers className="w-3 h-3" /> Volume
                </div>
                <p className="text-sm font-display font-bold text-soft-white mt-1">
                  {progression.weeklyProgress.totalVolumeKg.toLocaleString()} <span className="text-[9px] font-normal text-text-muted">kg</span>
                </p>
              </div>

              <div className="bg-navy-elevated/70 p-2.5 rounded-xl border border-border/60">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-gold">
                  <Flame className="w-3 h-3" /> Calories
                </div>
                <p className="text-sm font-display font-bold text-soft-white mt-1">
                  {progression.weeklyProgress.totalCalories.toLocaleString()} <span className="text-[9px] font-normal text-text-muted">kcal</span>
                </p>
              </div>
            </div>

            {/* Glowing Vertical Bar Chart */}
            <div className="h-24 flex items-end gap-2 pt-2 border-t border-border/40">
              {progression.weeklyProgress.dailyActivity.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full bg-navy-elevated rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        d.intensity > 0
                          ? 'bg-gradient-to-t from-electric-blue to-cyan shadow-[0_0_8px_rgba(34,211,238,0.4)] group-hover:brightness-125'
                          : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(6, d.intensity)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-text-muted">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          ROW 3: RECOMMENDED WORKOUTS
          ========================================================================= */}
      <div className="space-y-4">
        <AdaptiveRecommendationIntake onChange={setRecommendationContext} />
        <RecommendedWorkouts 
          context={recommendationContext} 
          onStartWorkout={(workoutId) => onStartWorkout(workoutId)} 
        />
      </div>

      {/* =========================================================================
          ROW 4: ACTIVE QUESTS & ACHIEVEMENTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Active Quests */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border-border flex flex-col justify-between space-y-4 bg-navy/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <h3 className="text-sm font-mono font-bold text-soft-white tracking-wider uppercase">
                ACTIVE QUESTS
              </h3>
            </div>
            <button 
              onClick={() => navigate('/challenges')}
              className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {progression.activeQuests.map((quest) => {
              const qPercent = Math.min(100, Math.round((quest.currentProgress / quest.targetProgress) * 100));

              return (
                <div 
                  key={quest.id}
                  className="bg-navy-elevated/70 p-3.5 rounded-xl border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-electric-blue/15 border border-cyan/25 flex items-center justify-center text-cyan shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-display font-bold text-soft-white">
                        {quest.title}
                      </p>
                      <p className="text-[10px] text-text-muted">{quest.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    {/* Progress Bar Mini */}
                    <div className="w-28 sm:w-32 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-text-muted">
                        <span>{quest.currentProgress} / {quest.targetProgress}</span>
                        <span>{qPercent}%</span>
                      </div>
                      <div className="w-full bg-navy rounded-full h-1.5 overflow-hidden border border-border/60">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-electric-blue to-cyan" 
                          style={{ width: `${qPercent}%` }} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-navy border border-gold/30">
                      <span className="text-xs font-mono font-bold text-gold">+{quest.xpReward} XP</span>
                      <GoldGobletIcon size={13} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Achievements Preview */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border-border flex flex-col justify-between space-y-4 bg-navy/90">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-soft-white tracking-wider uppercase">
              ACHIEVEMENTS
            </h3>
            <button 
              onClick={() => navigate('/achievements')}
              className="text-xs font-mono text-secondary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* First Workout */}
            <div className="bg-navy-elevated/70 p-3 rounded-xl border border-border/70 flex flex-col items-center text-center space-y-2 hover:border-cyan/40 transition-all">
              <ShieldAchievementBadge size={34} />
              <div>
                <p className="text-[11px] font-display font-bold text-soft-white leading-tight">First Workout</p>
                <p className="text-[9px] font-mono text-cyan mt-0.5">Completed</p>
              </div>
            </div>

            {/* Week Warrior */}
            <div className="bg-navy-elevated/70 p-3 rounded-xl border border-border/70 flex flex-col items-center text-center space-y-2 hover:border-secondary/40 transition-all">
              <WarriorCrestBadge size={34} />
              <div>
                <p className="text-[11px] font-display font-bold text-soft-white leading-tight">Week Warrior</p>
                <p className="text-[9px] font-mono text-secondary mt-0.5">7-day streak</p>
              </div>
            </div>

            {/* Strength Gain */}
            <div className="bg-navy-elevated/70 p-3 rounded-xl border border-border/70 flex flex-col items-center text-center space-y-2 hover:border-gold/40 transition-all">
              <GoldStrengthBadge size={34} />
              <div>
                <p className="text-[11px] font-display font-bold text-soft-white leading-tight">Strength Gain</p>
                <p className="text-[9px] font-mono text-gold mt-0.5">+20%</p>
              </div>
            </div>

            {/* Shadow Athlete */}
            <div className="bg-navy-elevated/70 p-3 rounded-xl border border-border/70 flex flex-col items-center text-center space-y-2 hover:border-secondary/40 transition-all">
              <ShadowAthleteBadge size={34} />
              <div>
                <p className="text-[11px] font-display font-bold text-soft-white leading-tight">Shadow Athlete</p>
                <p className="text-[9px] font-mono text-secondary mt-0.5">Lv. 25</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hunter Armory & Avatar Wardrobe Modal */}
      <HunterArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        progression={progression}
        onEquipAvatar={(id) => progressionService.equipAvatar(id)}
        onEquipAura={(id) => progressionService.equipAura(id)}
        onEquipTitle={(id) => progressionService.equipTitle(id)}
        onSimulateLevelUp={() => {
          setIsArmoryOpen(false);
          handleSimulateLevelUp();
        }}
      />

      {/* Level Up Celebration Ceremony Modal */}
      <LevelUpCelebrationModal
        isOpen={levelUpModal.isOpen}
        onClose={() => setLevelUpModal(prev => ({ ...prev, isOpen: false }))}
        newLevel={levelUpModal.level}
        rank={levelUpModal.rank}
        reward={levelUpModal.reward}
        onEquipAvatar={(id) => progressionService.equipAvatar(id)}
        onOpenArmory={() => setIsArmoryOpen(true)}
      />

    </div>
  );
};
