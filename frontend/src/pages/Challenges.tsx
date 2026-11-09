import React, { useState, useEffect } from 'react';
import { Target, Zap, Shield, CheckCircle2, ChevronRight, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { progressionService } from '../services/progressionService';
import { mockUserProfile, mockReadiness, mockHealthMetric } from '../data/mockData';
import { GoldGobletIcon } from '../components/ui/HunterBadges';

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => 
    progressionService.computeProgression(user || mockUserProfile, mockReadiness, mockHealthMetric, [])
  );
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(progressionService.computeProgression(user || mockUserProfile, mockReadiness, mockHealthMetric, []));
    };
    window.addEventListener('fitmentor_progression_updated', handleUpdate);
    return () => window.removeEventListener('fitmentor_progression_updated', handleUpdate);
  }, [user]);

  const handleClaimQuest = (questId: string, xpReward: number, title: string) => {
    const success = progressionService.claimQuestReward(questId, xpReward, user?.id);
    if (success) {
      setClaimedNotice(`+${xpReward} XP claimed for "${title}"!`);
      setTimeout(() => setClaimedNotice(null), 3500);
      setProfile(progressionService.computeProgression(user, mockReadiness, mockHealthMetric, []));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-primary font-bold uppercase tracking-wider">
            Daily & Weekly Missions
          </span>
          <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Active Hunter Quests</h2>
          <p className="text-sm text-text-secondary mt-1">Fulfill physical training trials to accumulate XP and elevate your Hunter Rank.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border border-border">
            <Trophy className="w-5 h-5 text-gold" />
            <div>
              <p className="text-[10px] uppercase font-mono text-text-muted">Total Level XP</p>
              <p className="text-lg font-display font-bold text-text-primary">
                {profile.currentXp.toLocaleString()} <span className="text-xs text-text-muted">/ {profile.nextLevelXp.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {claimedNotice && (
        <div className="p-4 rounded-xl bg-cyan/10 border border-cyan/40 text-primary flex items-center justify-between animate-fade-in font-mono text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyan" />
            <span>{claimedNotice}</span>
          </div>
        </div>
      )}

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profile.activeQuests.map((quest) => {
          const percent = Math.min(100, Math.round((quest.currentProgress / quest.targetProgress) * 100));
          const canClaim = quest.isCompleted && !quest.isClaimed;

          return (
            <div
              key={quest.id}
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between space-y-5 transition-all hover:border-cyan/40 relative overflow-hidden ${
                quest.isCompleted ? 'border-primary/40 bg-navy/90' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-electric-blue/15 border border-electric-blue/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-text-primary leading-snug">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {quest.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-elevated border border-gold/30 shrink-0">
                  <span className="text-xs font-mono font-bold text-gold">+{quest.xpReward} XP</span>
                  <GoldGobletIcon size={14} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-text-primary font-bold">
                    {quest.currentProgress} / {quest.targetProgress}
                  </span>
                </div>
                <div className="w-full bg-navy-elevated rounded-full h-2 overflow-hidden border border-border/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-electric-blue via-cyan to-secondary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border/40">
                <span className="text-[11px] font-mono text-text-muted">
                  {quest.isClaimed ? 'Claimed' : quest.isCompleted ? 'Mission Complete' : 'In Progress'}
                </span>

                {canClaim ? (
                  <button
                    onClick={() => handleClaimQuest(quest.id, quest.xpReward, quest.title)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan to-electric-blue text-background font-mono text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.35)] hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <span>Claim Reward</span>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : quest.isClaimed ? (
                  <span className="text-xs font-mono text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Claimed
                  </span>
                ) : (
                  <span className="text-xs font-mono text-text-muted">
                    {percent}% Complete
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

