import React from 'react';
import { Dumbbell, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { PrescribedExerciseTarget } from '../../types/fitness';

interface ExerciseNavigationPanelProps {
  exercises: PrescribedExerciseTarget[];
  activeIndex: number;
  onSelectExercise: (index: number) => void;
  completedSetsMap: Record<string, number>; // exerciseId -> completed sets count
  totalSetsMap: Record<string, number>; // exerciseId -> total sets count
}

export const ExerciseNavigationPanel: React.FC<ExerciseNavigationPanelProps> = ({
  exercises,
  activeIndex,
  onSelectExercise,
  completedSetsMap,
  totalSetsMap
}) => {
  const totalSets = Object.values(totalSetsMap).reduce((a, b) => a + b, 0);
  const totalCompletedSets = Object.values(completedSetsMap).reduce((a, b) => a + b, 0);
  const workoutProgressPercent = totalSets > 0 ? Math.round((totalCompletedSets / totalSets) * 100) : 0;

  return (
    <div className="bg-surface-container/50 rounded-2xl border border-border/80 p-4 flex flex-col h-full space-y-4">
      {/* Panel Header & Overall Progress */}
      <div className="space-y-2 border-b border-border/40 pb-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-text-muted uppercase font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-primary" /> Routine Sequence
          </span>
          <span className="text-primary font-bold">{workoutProgressPercent}% Done</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
            style={{ width: `${workoutProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Exercise Items List */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {exercises.map((ex, idx) => {
          const isActive = idx === activeIndex;
          const completedCount = completedSetsMap[ex.id] || 0;
          const targetCount = totalSetsMap[ex.id] || ex.targetSets || 4;
          const isFullyDone = completedCount >= targetCount && targetCount > 0;

          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExercise(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 group ${
                isActive
                  ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-primary/30'
                  : isFullyDone
                  ? 'bg-surface-elevated/40 border-success/30 hover:border-success/60'
                  : 'bg-surface-elevated/20 border-border/40 hover:bg-surface-elevated/50 hover:border-border'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-primary text-background'
                      : isFullyDone
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-surface border border-border text-text-muted'
                  }`}
                >
                  {isFullyDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </span>

                <div className="min-w-0">
                  <h5 className={`text-xs font-display font-bold truncate ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                    {ex.name}
                  </h5>
                  <p className="text-[10px] font-mono text-text-muted truncate mt-0.5">
                    {ex.targetMuscle} • {targetCount} Sets @ {ex.prescribedWeightKg || 70}kg
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                  isFullyDone ? 'bg-success/10 text-success' : 'bg-surface text-text-muted'
                }`}>
                  {completedCount}/{targetCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
