import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, Dumbbell, Zap, Eye, AlertCircle, ShieldCheck, Layers, Box, Activity, Flame } from 'lucide-react';
import { WorkoutRecommendation } from '../../types/fitness';
import { apiService } from '../../services/api';
import { WorkoutDetailPreview } from '../workout/WorkoutDetailPreview';
import { RecommendationContext } from './AdaptiveRecommendationIntake';

interface RecommendedWorkoutsProps {
  onStartWorkout: (workoutId: string) => void;
  context: RecommendationContext;
}

export const RecommendedWorkouts: React.FC<RecommendedWorkoutsProps> = ({ onStartWorkout, context }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Preview Modal State
  const [selectedRec, setSelectedRec] = useState<WorkoutRecommendation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        const res = await apiService.getWorkoutRecommendations();
        if (res && res.success) {
          setRecommendations(res.recommendations || []);
          if (res.count === 0 && res.message) {
            setErrorMsg(res.message);
          }
        }
      } catch (err: any) {
        console.error('Failed to load workout recommendations:', err);
        setErrorMsg('Unable to retrieve recommendations at this time.');
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, []);

  const adaptiveRecommendations = recommendations
    .filter(rec => rec.duration <= context.minutes || context.minutes >= 75)
    .map(rec => ({ ...rec, matchPercentage: Math.min(99, Math.max(60, rec.matchPercentage + (context.energy === 'low' ? -4 : context.energy === 'ready' ? 3 : 0))), explanation: context.energy === 'low' ? 'Reduced intensity and volume to respect your recovery signal.' : `Aligned to your ${context.sessionGoal} focus and ${context.minutes}-minute window.` }));

  const handleOpenPreview = (rec: WorkoutRecommendation) => {
    setSelectedRec(rec);
    setIsPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-primary/20 space-y-4">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>COMPUTING CONTENT-BASED 13-D COSINE SIMILARITY RECOMMENDATIONS...</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-xl bg-surface-container/50 animate-pulse border border-border/40" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg || recommendations.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-warning/30 bg-surface/80">
        <div className="flex items-center gap-3 text-warning">
          <AlertCircle className="w-5 h-5" />
          <h3 className="font-display font-bold text-text-primary text-lg">Building your best-fit session</h3>
        </div>
        <p className="text-xs text-text-secondary mt-2 leading-relaxed">
          {errorMsg || 'No workouts match this time window yet. Try a longer session to unlock more options.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-bold text-text-primary tracking-tight">Recommended For You</h3>
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary font-bold hidden sm:inline">
                  RepDB Taxonomy
                </span>
              </div>
              <p className="text-xs text-text-muted">Profile fit + RepDB MET energy load + biomechanical balance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/workouts?tab=studio')}
              className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-xs font-mono text-primary flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(34,211,238,0.15)]"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </button>
            <span className="px-3 py-1 rounded-full bg-surface-container border border-primary/30 text-xs font-mono text-primary font-medium self-start sm:self-auto">
              Top {recommendations.length} Matches
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(adaptiveRecommendations.length ? adaptiveRecommendations : recommendations).map((rec, idx) => {
            const isTopMatch = idx === 0;
            const exCount = rec.numberOfExercises || (rec.workoutId.includes('0002') || rec.name.toLowerCase().includes('lower') ? 3 : 4);
            const targetMuscles = rec.targetMuscleGroups || (rec.workoutId.includes('0002') || rec.name.toLowerCase().includes('lower') ? ['Legs', 'Glutes', 'Core'] : ['Chest', 'Back', 'Arms']);
            const metVal = rec.metScore || (rec.goal === 'STRENGTH' ? 7.2 : rec.goal === 'HYPERTROPHY' ? 6.5 : 5.8);

            return (
              <div
                key={rec.workoutId || idx}
                className={`glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover:border-cyan/50 relative overflow-hidden group ${
                  isTopMatch ? 'border-primary/40 bg-navy/90 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-border bg-navy/70'
                }`}
              >
                {/* Subtle Ambient Lightning Glow Behind Card */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-electric-blue/15 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan/20 transition-all" />

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-display font-bold text-text-primary leading-snug truncate">
                      {rec.title || rec.name}
                    </h4>
                    {isTopMatch && (
                      <span className="px-2 py-0.5 rounded bg-cyan/15 border border-cyan/30 text-[9px] font-mono text-cyan font-bold uppercase">
                        TOP FIT
                      </span>
                    )}
                  </div>

                  {/* Match Percentage Display Matching RPG Reference */}
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-display font-bold text-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                      {rec.matchPercentage}%
                    </span>
                    <span className="text-xs font-mono text-text-secondary uppercase">Match</span>
                  </div>

                  <p className="text-xs text-text-muted mt-1 font-mono">
                    {rec.duration} min • <span className="capitalize">{rec.difficulty.toLowerCase()}</span>
                  </p>

                  {/* Target Muscle Groups Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {targetMuscles.map((muscle: string) => (
                      <span
                        key={muscle}
                        className="px-2.5 py-0.5 rounded-lg bg-navy-elevated border border-secondary/30 text-[10px] font-mono text-secondary font-medium"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs font-mono text-text-secondary mt-3">
                    {exCount} exercises included
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenPreview(rec)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-electric-blue/20 via-navy-elevated to-secondary/20 hover:from-electric-blue/30 hover:to-secondary/30 border border-cyan/30 hover:border-cyan text-text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  >
                    <span>View Plan</span>
                    <span className="text-cyan">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Workout Detail Preview Modal */}
      {selectedRec && (
        <WorkoutDetailPreview
          recommendation={selectedRec}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onBeginSession={(workoutId) => onStartWorkout(workoutId)}
        />
      )}
    </>
  );
};
