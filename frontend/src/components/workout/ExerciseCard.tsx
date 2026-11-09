import React, { useState } from 'react';
import { Dumbbell, Target, ChevronRight, Zap, Clock } from 'lucide-react';
import { Exercise } from '../../types/fitness';
import { ExerciseDetailPanel } from './ExerciseDetailPanel';

interface ExerciseCardProps {
  exercise: Exercise;
  /** When provided, shows "Begin Exercise" CTA inside the detail panel */
  onBeginExercise?: (exerciseId: string) => void;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER:     'bg-success/10 border-success/40 text-success',
  INTERMEDIATE: 'bg-gold/10 border-gold/40 text-gold',
  ADVANCED:     'bg-error/10 border-error/40 text-error',
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onBeginExercise }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const diffClass = DIFFICULTY_BADGE[exercise.difficulty] ?? DIFFICULTY_BADGE['BEGINNER'];

  return (
    <>
      {/* ── Card ──────────────────────────────────────────── */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className="glass-card p-5 rounded-2xl border border-border hover:border-cyan/50 hover:shadow-cyan-glow transition-all flex flex-col justify-between space-y-4 text-left w-full group bg-navy/85"
        id={`exercise-card-${exercise.id}`}
        aria-label={`View details for ${exercise.name}`}
      >
        {/* Top row: category + difficulty + movement type */}
        <div>
          <div className="flex justify-between items-start gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan/15 border border-cyan/30 text-[10px] font-mono text-cyan font-bold uppercase">
              {exercise.category}
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-mono border px-2 py-0.5 rounded ${diffClass}`}>
                {exercise.difficulty.charAt(0) + exercise.difficulty.slice(1).toLowerCase()}
              </span>
              <span className="text-[10px] font-mono text-text-muted border border-border px-2 py-0.5 rounded">
                {exercise.movementType}
              </span>
            </div>
          </div>

          <h4 className="font-display font-bold text-base text-text-primary mt-2 group-hover:text-cyan transition-colors">
            {exercise.name}
          </h4>
          <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
            <Target className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span>{exercise.targetMuscle}</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-navy-elevated rounded-lg p-2 text-center border border-border/60">
            <span className="text-[9px] text-text-muted block uppercase tracking-wide">Sets × Reps</span>
            <span className="text-cyan font-bold text-sm">{exercise.setsDefault}×{exercise.repsDefault}</span>
          </div>
          <div className="bg-navy-elevated rounded-lg p-2 text-center border border-border/60">
            <span className="text-[9px] text-text-muted block uppercase tracking-wide">Rest</span>
            <span className="text-gold font-bold text-sm">{exercise.restSeconds}s</span>
          </div>
          <div className="bg-navy-elevated rounded-lg p-2 text-center border border-border/60">
            <span className="text-[9px] text-text-muted block uppercase tracking-wide">Gear</span>
            <span className="text-text-primary font-semibold text-[11px] leading-tight">
              {exercise.equipment === 'FULL_GYM' ? 'Gym' : exercise.equipment === 'DUMBBELLS' ? 'DBs' : 'BW'}
            </span>
          </div>
        </div>

        {/* Footer CTA hint */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
            <Zap className="w-3 h-3 text-cyan" /> Tap to view demo & instructions
          </span>
          <ChevronRight className="w-4 h-4 text-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      {/* ── Exercise Detail Panel (full-screen overlay) ──── */}
      <ExerciseDetailPanel
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onBeginExercise={onBeginExercise}
      />
    </>
  );
};
