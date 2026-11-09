import React from 'react';
import { Calendar, Clock, Flame, Dumbbell, CheckCircle2 } from 'lucide-react';
import { WorkoutSessionLog } from '../../types/fitness';

interface WorkoutHistoryCardProps {
  session: WorkoutSessionLog;
}

export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ session }) => {
  const formattedDate = new Date(session.startedAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card p-5 rounded-2xl border border-border/80 hover:border-primary/40 transition-all space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{formattedDate}</span>
          </div>
          <h4 className="font-display font-bold text-lg text-text-primary mt-1">{session.workoutTitle}</h4>
        </div>
        <span className="px-3 py-1 rounded-full bg-success/10 border border-success/30 text-xs font-mono text-success flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-surface-container/60 p-3 rounded-xl border border-border/40">
          <span className="text-[10px] text-text-muted uppercase flex items-center gap-1">
            <Clock className="w-3 h-3 text-gold" /> Duration
          </span>
          <p className="font-bold text-text-primary mt-1">{session.durationMinutes || 45} mins</p>
        </div>

        <div className="bg-surface-container/60 p-3 rounded-xl border border-border/40">
          <span className="text-[10px] text-text-muted uppercase flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-secondary" /> Volume
          </span>
          <p className="font-bold text-secondary mt-1">{session.totalVolumeKg ? session.totalVolumeKg.toLocaleString() : '14,200'} kg</p>
        </div>

        <div className="bg-surface-container/60 p-3 rounded-xl border border-border/40">
          <span className="text-[10px] text-text-muted uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-warning" /> Burn
          </span>
          <p className="font-bold text-warning mt-1">{session.totalCalories || 480} kcal</p>
        </div>
      </div>
    </div>
  );
};
