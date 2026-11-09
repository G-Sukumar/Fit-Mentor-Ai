import React from 'react';
import { Play, Dumbbell, Clock } from 'lucide-react';
import { Workout } from '../../types/fitness';
import { getExerciseMetadataByName, getRepDBImageUrls } from '../../data/exerciseMetadataRegistry';

interface WorkoutCardProps {
  workout: Workout;
  onStart: (workoutId: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStart }) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-border hover:border-cyan/40 transition-all flex flex-col justify-between space-y-6 bg-navy/85 shadow-hunter-glow">
      <div className="flex justify-between items-start">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-semibold">
            {workout.category}
          </span>
          <h3 className="text-xl font-display font-bold text-text-primary mt-2">{workout.title}</h3>
          <p className="text-xs text-text-secondary mt-1 flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> {workout.durationEstMin} min</span>
            <span className="flex items-center gap-1"><Dumbbell className="w-3.5 h-3.5 text-secondary" /> {workout.exercises.length} exercises</span>
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-navy-elevated text-xs font-mono text-gold border border-gold/30 font-semibold">
          {workout.difficulty}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-mono text-text-muted uppercase">Included Movement Patterns</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {workout.exercises.map((ex) => {
            const meta = getExerciseMetadataByName(ex.name);
            const thumb = (ex as any).images?.start || meta?.images?.start || (meta ? getRepDBImageUrls(meta.slug).start : null);

            return (
              <div key={ex.id} className="bg-navy-elevated/70 p-2 rounded-xl border border-border/60 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {thumb && (
                    <img
                      src={thumb}
                      alt={ex.name}
                      className="w-8 h-8 rounded-lg object-contain bg-navy border border-border/60 shrink-0 p-0.5"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-semibold text-text-primary truncate">{ex.name}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted shrink-0">{ex.setsDefault}x{ex.repsDefault}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => onStart(workout.id)}
        className="w-full py-3 rounded-xl btn-hunter-primary text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4 fill-current" />
        START WORKOUT SESSION
      </button>
    </div>
  );
};
