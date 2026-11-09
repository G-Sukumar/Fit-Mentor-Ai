import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, TrendingUp, Zap, Target, Layers, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { progressionService } from '../services/progressionService';
import { mockUserProfile, mockReadiness, mockHealthMetric } from '../data/mockData';
import { 
  HunterLevelCrest, 
  ShieldAchievementBadge, 
  WarriorCrestBadge, 
  GoldStrengthBadge, 
  ShadowAthleteBadge 
} from '../components/ui/HunterBadges';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
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

  const volumeHistory = [
    { day: 'Mon', val: 75, label: '14,200kg' },
    { day: 'Tue', val: 90, label: '18,500kg' },
    { day: 'Wed', val: 40, label: '8,100kg' },
    { day: 'Thu', val: 85, label: '16,800kg' },
    { day: 'Fri', val: 95, label: '19,200kg' },
    { day: 'Sat', val: 30, label: '6,400kg' },
    { day: 'Sun', val: 0, label: 'Rest' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-bold uppercase tracking-wider">
            HUNTER TELEMETRY ANALYTICS
          </span>
          <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Volume Load & Ascension Progress</h2>
          <p className="text-sm text-text-secondary mt-1">
            Track periodized training volume density, personal records, and stat attribute growth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-3 border border-border">
            <HunterLevelCrest size={32} />
            <div>
              <p className="text-[10px] uppercase font-mono text-text-muted">Ascension Rank</p>
              <p className="text-sm font-display font-bold text-soft-white">
                Lv. {profile.level} • {profile.hunterRank}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Hunter Attributes Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-electric-blue/30 bg-navy/80">
          <span className="text-[10px] font-mono text-text-muted uppercase">Strength Index</span>
          <p className="text-2xl font-display font-bold text-electric-blue mt-1">{profile.attributes.strength} <span className="text-xs text-text-muted">/ 100</span></p>
          <div className="w-full bg-navy-elevated h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-electric-blue h-full rounded-full" style={{ width: `${profile.attributes.strength}%` }} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-cyan/30 bg-navy/80">
          <span className="text-[10px] font-mono text-text-muted uppercase">Endurance Capacity</span>
          <p className="text-2xl font-display font-bold text-cyan mt-1">{profile.attributes.endurance} <span className="text-xs text-text-muted">/ 100</span></p>
          <div className="w-full bg-navy-elevated h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan h-full rounded-full" style={{ width: `${profile.attributes.endurance}%` }} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-secondary/30 bg-navy/80">
          <span className="text-[10px] font-mono text-text-muted uppercase">Discipline Rating</span>
          <p className="text-2xl font-display font-bold text-secondary mt-1">{profile.attributes.discipline} <span className="text-xs text-text-muted">/ 100</span></p>
          <div className="w-full bg-navy-elevated h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-secondary h-full rounded-full" style={{ width: `${profile.attributes.discipline}%` }} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-success/30 bg-navy/80">
          <span className="text-[10px] font-mono text-text-muted uppercase">Recovery Readiness</span>
          <p className="text-2xl font-display font-bold text-success mt-1">{profile.attributes.recovery} <span className="text-xs text-text-muted">/ 100</span></p>
          <div className="w-full bg-navy-elevated h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-success h-full rounded-full" style={{ width: `${profile.attributes.recovery}%` }} />
          </div>
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-navy/90">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-bold text-text-primary flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-cyan" /> Weekly Volume Load (kg)
          </h3>
          <span className="text-xs font-mono text-cyan bg-cyan/10 px-2.5 py-1 rounded-full border border-cyan/30 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs baseline
          </span>
        </div>

        <div className="h-52 flex items-end gap-3 sm:gap-4 pt-6 border-b border-border/40 pb-4">
          {volumeHistory.map((bar) => (
            <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full bg-navy-elevated rounded-t-lg relative overflow-hidden flex items-end" style={{ height: '150px' }}>
                <div
                  className="w-full bg-gradient-to-t from-electric-blue via-cyan to-secondary rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                  style={{ height: `${bar.val}%` }}
                />
              </div>
              <span className="text-xs font-mono text-text-secondary">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hunter Badges & Milestones */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-navy/90">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-text-primary flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-gold" /> Unlocked Hunter Crests
          </h3>
          <button 
            onClick={() => navigate('/achievements')}
            className="text-xs font-mono text-cyan hover:underline"
          >
            View All Achievements →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-navy-elevated/70 border border-border rounded-xl p-4 flex items-center gap-3">
            <ShieldAchievementBadge size={36} />
            <div>
              <p className="font-semibold text-text-primary text-xs">First Workout</p>
              <p className="text-[10px] text-cyan font-mono">Dungeon Cleared</p>
            </div>
          </div>

          <div className="bg-navy-elevated/70 border border-border rounded-xl p-4 flex items-center gap-3">
            <WarriorCrestBadge size={36} />
            <div>
              <p className="font-semibold text-text-primary text-xs">Week Warrior</p>
              <p className="text-[10px] text-secondary font-mono">7-Day Adherence</p>
            </div>
          </div>

          <div className="bg-navy-elevated/70 border border-border rounded-xl p-4 flex items-center gap-3">
            <GoldStrengthBadge size={36} />
            <div>
              <p className="font-semibold text-text-primary text-xs">Strength Gain</p>
              <p className="text-[10px] text-gold font-mono">+20% Progressive</p>
            </div>
          </div>

          <div className="bg-navy-elevated/70 border border-border rounded-xl p-4 flex items-center gap-3">
            <ShadowAthleteBadge size={36} />
            <div>
              <p className="font-semibold text-text-primary text-xs">Shadow Athlete</p>
              <p className="text-[10px] text-secondary font-mono">Ascended Lv. 25</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
