import React, { useState, useEffect } from 'react';
import { Award, Shield, Star, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { progressionService } from '../services/progressionService';
import { mockUserProfile, mockReadiness, mockHealthMetric } from '../data/mockData';
import { 
  ShieldAchievementBadge, 
  WarriorCrestBadge, 
  GoldStrengthBadge, 
  ShadowAthleteBadge 
} from '../components/ui/HunterBadges';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => 
    progressionService.computeProgression(user || mockUserProfile, mockReadiness, mockHealthMetric, [])
  );

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(progressionService.computeProgression(user || mockUserProfile, mockReadiness, mockHealthMetric, []));
    };
    window.addEventListener('fitmentor_progression_updated', handleUpdate);
    return () => window.removeEventListener('fitmentor_progression_updated', handleUpdate);
  }, [user]);

  const renderBadge = (type: string, isUnlocked: boolean) => {
    switch (type) {
      case 'shield':
        return <ShieldAchievementBadge size={44} className={isUnlocked ? '' : 'grayscale opacity-40'} />;
      case 'crest':
        return <WarriorCrestBadge size={44} className={isUnlocked ? '' : 'grayscale opacity-40'} />;
      case 'star':
        return <GoldStrengthBadge size={44} className={isUnlocked ? '' : 'grayscale opacity-40'} />;
      case 'shadow':
      default:
        return <ShadowAthleteBadge size={44} className={isUnlocked ? '' : 'grayscale opacity-40'} />;
    }
  };

  const unlockedCount = profile.achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-xs font-mono text-secondary font-bold uppercase tracking-wider">
            Trophy Hall
          </span>
          <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Hunter Achievements</h2>
          <p className="text-sm text-text-secondary mt-1">Unlock prestigious badges as you hit lifetime milestones and ascend the ranks.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border border-border">
            <Award className="w-5 h-5 text-gold" />
            <div>
              <p className="text-[10px] uppercase font-mono text-text-muted">Unlocked Badges</p>
              <p className="text-lg font-display font-bold text-text-primary">
                {unlockedCount} <span className="text-xs text-text-muted">/ {profile.achievements.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {profile.achievements.map((ach) => (
          <div
            key={ach.id}
            className={`glass-card p-6 rounded-2xl flex flex-col items-center text-center space-y-4 border transition-all ${
              ach.isUnlocked
                ? 'border-border hover:border-cyan/40 bg-navy/90 hover:shadow-cyan-glow'
                : 'border-border/40 opacity-60 bg-navy/40'
            }`}
          >
            <div className="p-3 rounded-2xl bg-navy-elevated border border-border/80 flex items-center justify-center">
              {renderBadge(ach.iconType, ach.isUnlocked)}
            </div>

            <div>
              <h4 className="font-display font-bold text-text-primary text-base">
                {ach.title}
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                {ach.subtitle}
              </p>
            </div>

            <div className="w-full pt-3 border-t border-border/40 flex items-center justify-center">
              {ach.isUnlocked ? (
                <span className="text-xs font-mono text-cyan flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                </span>
              ) : (
                <span className="text-xs font-mono text-text-muted">
                  Locked
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

