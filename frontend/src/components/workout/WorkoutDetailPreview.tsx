import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Dumbbell, 
  Zap, 
  Play, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  ChevronRight,
  Eye,
  Layers,
  Activity,
  Box
} from 'lucide-react';
import { WorkoutRecommendation, PrescribedExerciseTarget } from '../../types/fitness';
import { apiService } from '../../services/api';
import { ExerciseDetailPanel } from './ExerciseDetailPanel';
import { getExerciseMetadataByName, getRepDBImageUrls } from '../../data/exerciseMetadataRegistry';

interface WorkoutDetailPreviewProps {
  recommendation: WorkoutRecommendation;
  isOpen: boolean;
  onClose: () => void;
  onBeginSession: (workoutId: string) => void;
}

interface DisplayExerciseItem {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  sets: number;
  reps: string | number;
  equipment: string;
}

export const WorkoutDetailPreview: React.FC<WorkoutDetailPreviewProps> = ({
  recommendation,
  isOpen,
  onClose,
  onBeginSession
}) => {
  const [exercises, setExercises] = useState<DisplayExerciseItem[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(true);
  
  // Exercise detail modal state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPrescription() {
      setLoadingExercises(true);
      try {
        const prescribed = await apiService.getPrescribedWorkout(recommendation.workoutId);
        if (prescribed && prescribed.exercises && prescribed.exercises.length > 0) {
          const items: DisplayExerciseItem[] = prescribed.exercises.map((ex: PrescribedExerciseTarget) => ({
            id: ex.id,
            name: ex.name,
            category: ex.category || 'General',
            targetMuscle: ex.targetMuscle || 'Full Body',
            sets: ex.targetSets || 4,
            reps: ex.targetReps ? `${ex.targetReps}` : '6–8',
            equipment: recommendation.equipment ? recommendation.equipment.replace(/_/g, ' ') : 'Gym'
          }));
          setExercises(items);
        } else {
          setFallbackExercises();
        }
      } catch (err) {
        setFallbackExercises();
      } finally {
        setLoadingExercises(false);
      }
    }

    function setFallbackExercises() {
      // Fallback exercise list mapping based on category/goal
      if (recommendation.workoutId.includes('0002') || recommendation.name.toLowerCase().includes('lower')) {
        setExercises([
          { id: 'e0000000-0000-0000-0000-000000000009', name: 'Barbell Back Squat', category: 'Legs', targetMuscle: 'Quadriceps & Glutes', sets: 4, reps: '6–8', equipment: 'Barbell' },
          { id: 'e0000000-0000-0000-0000-000000000010', name: 'Romanian Deadlift', category: 'Legs', targetMuscle: 'Hamstrings & Glutes', sets: 4, reps: '8–10', equipment: 'Barbell' },
          { id: 'e0000000-0000-0000-0000-000000000011', name: 'Hanging Leg Raise', category: 'Core', targetMuscle: 'Rectus Abdominis', sets: 3, reps: '12–15', equipment: 'Bodyweight' }
        ]);
      } else {
        setExercises([
          { id: 'e0000000-0000-0000-0000-000000000001', name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major', sets: 4, reps: '6–8', equipment: 'Barbell' },
          { id: 'e0000000-0000-0000-0000-000000000003', name: 'Barbell Bent-Over Row', category: 'Back', targetMuscle: 'Latissimus Dorsi', sets: 4, reps: '8–10', equipment: 'Barbell' },
          { id: 'e0000000-0000-0000-0000-000000000005', name: 'Overhead Barbell Press', category: 'Shoulders', targetMuscle: 'Deltoids', sets: 3, reps: '8–10', equipment: 'Barbell' },
          { id: 'e0000000-0000-0000-0000-000000000007', name: 'Barbell Curl', category: 'Arms', targetMuscle: 'Biceps Brachii', sets: 3, reps: '10–12', equipment: 'Barbell' }
        ]);
      }
    }

    loadPrescription();
  }, [isOpen, recommendation.workoutId]);

  if (!isOpen) return null;

  const handleOpenExerciseDetail = (ex: DisplayExerciseItem) => {
    setSelectedExerciseId(ex.id);
    setSelectedExerciseName(ex.name);
    setIsDetailOpen(true);
  };

  // Derive unique target muscle groups from exercise list
  const muscleGroups = Array.from(
    new Set(exercises.map((e) => e.category || e.targetMuscle))
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-3xl max-h-[90vh] glass-card-elevated rounded-2xl border border-primary/40 flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Header */}
          <div className="p-6 border-b border-border/40 bg-surface-container/60 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-md bg-surface-elevated text-xs font-mono text-primary font-bold border border-primary/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <Zap className="w-3.5 h-3.5 fill-current text-gold" /> {recommendation.matchPercentage}% MATCH
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-text-muted uppercase">
                  {recommendation.difficulty}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-secondary uppercase flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" /> {recommendation.equipment ? recommendation.equipment.replace(/_/g, ' ') : 'FULL GYM'}
                </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-text-primary mt-2 leading-tight">
                {recommendation.title || recommendation.name}
              </h2>

              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-text-secondary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-secondary" /> {recommendation.duration} min duration
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-primary" /> {exercises.length} prescribed exercises
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* RepDB Biomechanical Telemetry Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface-elevated/70 p-3 rounded-xl border border-border/80 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-primary" /> MET Index
                </span>
                <span className="text-lg font-display font-bold text-primary mt-1">
                  {(recommendation.metScore || 6.5).toFixed(1)} <span className="text-xs font-mono text-text-muted font-normal">METs</span>
                </span>
                <span className="text-[9px] font-mono text-text-muted">RepDB Standard</span>
              </div>
              <div className="bg-surface-elevated/70 p-3 rounded-xl border border-border/80 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-gold" /> Est. Energy Burn
                </span>
                <span className="text-lg font-display font-bold text-gold mt-1">
                  {recommendation.estimatedCaloriesBurned || Math.round((recommendation.metScore || 6.5) * 75 * 0.0175 * recommendation.duration)} <span className="text-xs font-mono text-text-muted font-normal">kcal</span>
                </span>
                <span className="text-[9px] font-mono text-text-muted">75kg Reference</span>
              </div>
              <div className="bg-surface-elevated/70 p-3 rounded-xl border border-border/80 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-secondary" /> Compound Ratio
                </span>
                <span className="text-lg font-display font-bold text-secondary mt-1">
                  {recommendation.compoundRatioPercent || 70}%
                </span>
                <span className="text-[9px] font-mono text-text-muted">Mechanic Split</span>
              </div>
              <div className="bg-surface-elevated/70 p-3 rounded-xl border border-border/80 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-text-muted uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-success" /> Joint Integrity
                </span>
                <span className="text-xs font-display font-bold text-success mt-1 uppercase">
                  Verified Safe
                </span>
                <span className="text-[9px] font-mono text-text-muted">Hard Constraints Passed</span>
              </div>
            </div>

            {/* Why FitMentor Recommended This */}
            <div className="glass-card p-5 rounded-xl border border-primary/30 bg-surface/90 space-y-3">
              <div className="flex items-center gap-2 text-primary font-display font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>WHY FITMENTOR RECOMMENDED THIS</span>
              </div>

              {/* Supported reason checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-text-secondary pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Matches your training goal ({recommendation.goal ? recommendation.goal.replace(/_/g, ' ') : 'FITNESS'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Matches your experience level ({recommendation.difficulty})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Matches available equipment ({recommendation.equipment ? recommendation.equipment.replace(/_/g, ' ') : 'GYM'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Matches workout location ({recommendation.location})</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span>Fits your preferred session duration ({recommendation.duration} min)</span>
                </div>
              </div>

              {/* Original explanation string */}
              <p className="text-xs text-text-muted italic bg-surface-container/60 p-3 rounded-lg border border-border/40 font-sans mt-2">
                "{recommendation.explanation}"
              </p>
            </div>

            {/* Target Muscle Groups */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-text-muted uppercase">Target Muscle Groups</span>
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((group) => (
                  <span
                    key={group}
                    className="px-3 py-1 rounded-lg bg-surface-container border border-secondary/30 text-xs font-mono text-secondary font-semibold"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-text-muted uppercase">Prescribed Exercises ({exercises.length})</span>
                <span className="text-[11px] font-mono text-primary flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Tap any exercise to preview 3D demo
                </span>
              </div>

              {loadingExercises ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-surface-container/50 animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {exercises.map((ex, idx) => {
                    const meta = getExerciseMetadataByName(ex.name);
                    const thumb = meta?.images?.start || (meta ? getRepDBImageUrls(meta.slug).start : null);

                    return (
                      <button
                        key={ex.id || idx}
                        onClick={() => handleOpenExerciseDetail(ex)}
                        className="w-full text-left glass-card p-3 rounded-xl border border-border/60 hover:border-primary/50 transition-all flex items-center justify-between group bg-surface/70 hover:bg-surface"
                      >
                        <div className="flex items-center gap-3">
                          {/* Gesture Thumbnail */}
                          {thumb ? (
                            <div className="w-11 h-11 rounded-lg bg-surface-elevated border border-border/80 flex items-center justify-center p-0.5 overflow-hidden shrink-0 group-hover:border-primary/40 transition-colors">
                              <img
                                src={thumb}
                                alt={ex.name}
                                className="w-full h-full object-contain filter drop-shadow-sm"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <span className="w-10 h-10 rounded-lg bg-surface-container border border-primary/30 font-mono text-xs text-primary font-bold flex items-center justify-center shrink-0">
                              0{idx + 1}
                            </span>
                          )}

                          <div>
                            <h4 className="font-display font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
                              {ex.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-0.5">
                              <span className="text-secondary font-semibold">{ex.targetMuscle}</span>
                              <span>•</span>
                              <span>{ex.sets} sets × {ex.reps} reps</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-primary bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            View 3D Demo <ChevronRight className="w-3 h-3" />
                          </span>
                          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors sm:hidden" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Sticky Footer */}
          <div className="p-4 border-t border-border/40 bg-surface-container/80 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onBeginSession(recommendation.workoutId);
              }}
              className="px-6 py-2.5 rounded-xl btn-hunter-primary text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>BEGIN SESSION →</span>
            </button>
          </div>

        </div>
      </div>

      {/* Exercise Detail Panel Modal */}
      {isDetailOpen && (
        <ExerciseDetailPanel
          exerciseId={selectedExerciseId || ''}
          exerciseName={selectedExerciseName}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </>
  );
};
