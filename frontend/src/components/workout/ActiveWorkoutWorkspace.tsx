import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Dumbbell, Award, ShieldCheck, Loader2, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Workout, PrescribedWorkoutPlan, WorkoutSetLog, AdaptiveSuggestion, PrescribedExerciseTarget } from '../../types/fitness';
import { apiService } from '../../services/api';
import { progressionService } from '../../services/progressionService';
import { getExercise3DConfig } from '../../config/exercise3DRegistry';
import { ExerciseNavigationPanel } from './ExerciseNavigationPanel';
import { Exercise3DCanvas } from './Exercise3DViewer/Exercise3DCanvas';
import { SetLoggingPanel } from './SetLoggingPanel';
import { RestTimerBar } from './RestTimerBar';

interface ActiveWorkoutWorkspaceProps {
  workout: Workout;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted?: () => void;
  initialExerciseIndex?: number;
}

export const ActiveWorkoutWorkspace: React.FC<ActiveWorkoutWorkspaceProps> = ({
  workout,
  isOpen,
  onClose,
  onSessionCompleted,
  initialExerciseIndex = 0
}) => {
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);
  const [prescribedPlan, setPrescribedPlan] = useState<PrescribedWorkoutPlan | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(initialExerciseIndex || 0);
  const [setInputs, setSetInputs] = useState<Record<string, WorkoutSetLog[]>>({});
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<Record<string, AdaptiveSuggestion>>({});
  const [sessionRpe, setSessionRpe] = useState<number>(8.0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeRestSeconds, setActiveRestSeconds] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [sessionCompletedSummary, setSessionCompletedSummary] = useState<any | null>(null);

  // Active workout elapsed timer
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Initialize session and fetch prescriptions on open
  useEffect(() => {
    if (isOpen) {
      const initSession = async () => {
        setSessionCompletedSummary(null);
        setActiveExerciseIndex(initialExerciseIndex || 0);
        setActiveRestSeconds(null);

        // Fetch tailored target prescriptions
        let prescribed: PrescribedWorkoutPlan | null = null;
        try {
          prescribed = await apiService.getPrescribedWorkout(workout.id);
          setPrescribedPlan(prescribed);
        } catch {
          // Fallback
        }

        // Initialize sets for each exercise
        const exercisesToUse = prescribed?.exercises || workout.exercises;
        const initialSets: Record<string, WorkoutSetLog[]> = {};

        exercisesToUse.forEach((ex: any) => {
          const setsCount = ex.targetSets || ex.setsDefault || 4;
          const targetReps = ex.targetReps || ex.repsDefault || 8;
          const targetWeight = ex.prescribedWeightKg || 70.0;

          initialSets[ex.id] = Array.from({ length: setsCount }, (_, i) => ({
            exerciseId: ex.id,
            setNumber: i + 1,
            repsCompleted: targetReps,
            weightKg: targetWeight,
            rpeScore: 8.0,
            targetReps,
            targetWeightKg: targetWeight,
            completed: false
          }));
        });
        setSetInputs(initialSets);

        // Start backend session
        try {
          const res = await apiService.startWorkoutSession(workout.id);
          if (res.success && res.sessionLogId) {
            setSessionLogId(res.sessionLogId);
          }
        } catch {
          // Fallback
        }

        setElapsedSeconds(0);
        setIsTimerRunning(true);
      };

      initSession();
    } else {
      setIsTimerRunning(false);
    }
  }, [isOpen, workout?.id, initialExerciseIndex]);

  if (!isOpen) return null;

  const exercisesList: PrescribedExerciseTarget[] = prescribedPlan?.exercises || workout.exercises.map((ex: any) => ({
    id: ex.id,
    name: ex.name,
    category: ex.category || 'Compound',
    targetMuscle: ex.targetMuscle || 'Muscles',
    targetSets: ex.setsDefault || 4,
    targetReps: ex.repsDefault || 8,
    prescribedWeightKg: 70.0,
    targetRpe: 8.0,
    restSeconds: ex.restSeconds || 90
  }));

  const currentExercise = exercisesList[activeExerciseIndex] || exercisesList[0];
  const current3DConfig = currentExercise
    ? getExercise3DConfig(currentExercise.id, currentExercise.name)
    : getExercise3DConfig(undefined, 'Compound Exercise');
  const currentSets = currentExercise ? (setInputs[currentExercise.id] || []) : [];

  // Update specific set values
  const handleUpdateSet = (
    setIdx: number,
    field: 'weightKg' | 'repsCompleted' | 'rpeScore',
    value: number
  ) => {
    const updatedSets = [...currentSets];
    updatedSets[setIdx] = { ...updatedSets[setIdx], [field]: Math.max(0, value) };
    setSetInputs({ ...setInputs, [currentExercise.id]: updatedSets });
  };

  // Toggle log set & trigger autoregulation
  const handleToggleLogSet = async (setIdx: number) => {
    const updatedSets = [...currentSets];
    const targetSet = { ...updatedSets[setIdx] };
    targetSet.completed = !targetSet.completed;
    updatedSets[setIdx] = targetSet;
    setSetInputs({ ...setInputs, [currentExercise.id]: updatedSets });

    if (targetSet.completed && sessionLogId) {
      try {
        // 1. Log set in DB
        await apiService.logWorkoutSet(sessionLogId, {
          exerciseId: currentExercise.id,
          setNumber: targetSet.setNumber,
          repsCompleted: targetSet.repsCompleted,
          weightKg: targetSet.weightKg,
          rpeScore: targetSet.rpeScore,
          targetReps: targetSet.targetReps,
          targetWeightKg: targetSet.targetWeightKg
        });

        // 2. Evaluate autoregulation rule
        const autoRes = await apiService.autoregulateSet(sessionLogId, {
          exerciseId: currentExercise.id,
          setNumber: targetSet.setNumber,
          weightKg: targetSet.weightKg,
          repsCompleted: targetSet.repsCompleted,
          rpeScore: targetSet.rpeScore || 8.0,
          targetReps: targetSet.targetReps || targetSet.repsCompleted,
          targetWeightKg: targetSet.targetWeightKg || targetSet.weightKg
        });

        if (autoRes.success && autoRes.adaptation) {
          setAdaptiveFeedback((prev) => ({ ...prev, [currentExercise.id]: autoRes.adaptation }));

          // Update next pending set if load adjustment is recommended
          if (setIdx + 1 < updatedSets.length && !updatedSets[setIdx + 1].completed) {
            const nextSet = { ...updatedSets[setIdx + 1] };
            if (autoRes.adaptation.suggestedWeightKg) nextSet.weightKg = autoRes.adaptation.suggestedWeightKg;
            if (autoRes.adaptation.suggestedReps) nextSet.repsCompleted = autoRes.adaptation.suggestedReps;
            updatedSets[setIdx + 1] = nextSet;
            setSetInputs({ ...setInputs, [currentExercise.id]: updatedSets });
          }

          // Trigger rest timer
          const restTime = autoRes.adaptation.suggestedRestSeconds || currentExercise.restSeconds || 90;
          setActiveRestSeconds(restTime);
        }
      } catch {
        setActiveRestSeconds(currentExercise.restSeconds || 90);
      }
    }
  };

  // Live session calculations
  const allSets = Object.values(setInputs).flatMap((s) => s);
  const totalVolumeKg = allSets.reduce((sum, s) => s.completed ? sum + (s.repsCompleted * s.weightKg) : sum, 0);
  const totalCompletedSets = allSets.filter((s) => s.completed).length;

  const completedSetsMap: Record<string, number> = {};
  const totalSetsMap: Record<string, number> = {};
  exercisesList.forEach((ex) => {
    const s = setInputs[ex.id] || [];
    completedSetsMap[ex.id] = s.filter((item) => item.completed).length;
    totalSetsMap[ex.id] = s.length || ex.targetSets || 4;
  });

  // Complete workout session
  const handleCompleteWorkout = async () => {
    setIsCompleting(true);
    setIsTimerRunning(false);

    const durationMinutes = Math.max(1, Math.floor(elapsedSeconds / 60));
    const estCalories = Math.floor(durationMinutes * 8.5);

    let summaryData = {
      totalVolumeKg,
      durationMinutes,
      sessionRpe,
      trainingLoadScore: Number((sessionRpe * durationMinutes).toFixed(1)),
      volumeDensityKgMin: Number((totalVolumeKg / durationMinutes).toFixed(2))
    };

    if (sessionLogId) {
      progressionService.recordWorkoutCompletion(sessionLogId);
      try {
        const res = await apiService.completeWorkoutSession(sessionLogId, {
          durationMinutes,
          rpeScore: sessionRpe,
          totalCalories: estCalories
        });
        if (res.session) {
          summaryData = { ...summaryData, ...res.session };
        }
      } catch {
        // Fallback
      }
    } else {
      progressionService.recordWorkoutCompletion(`session_${Date.now()}`);
    }

    setSessionCompletedSummary(summaryData);
    setIsCompleting(false);
  };

  const handleFinishAndExit = () => {
    if (onSessionCompleted) onSessionCompleted();
    onClose();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/85 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-[1600px] h-[95vh] glass-card-elevated rounded-3xl border border-border flex flex-col overflow-hidden shadow-2xl">
        
        {/* ===================================================================
             TOP WORKSPACE HEADER BAR
             =================================================================== */}
        <div className="px-6 py-4 border-b border-border/60 bg-surface-container/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-xs font-mono text-success uppercase font-semibold">Active 3D Workout Session</span>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 3D Kinematic Engine Active
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-text-primary tracking-tight mt-0.5">
                {workout.title}
              </h2>
            </div>
          </div>

          {/* Center Telemetry Strip */}
          <div className="hidden md:flex items-center gap-6 font-mono text-xs">
            <span className="flex items-center gap-1.5 text-secondary">
              <Dumbbell className="w-4 h-4" /> Volume: <strong className="text-text-primary">{totalVolumeKg.toLocaleString()} kg</strong>
            </span>
            <span className="flex items-center gap-1.5 text-primary">
              <Check className="w-4 h-4" /> Sets Done: <strong className="text-text-primary">{totalCompletedSets}</strong>
            </span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated border border-gold/30 font-mono text-sm text-gold">
              <Clock className="w-4 h-4 text-gold animate-spin-slow" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            <button
              onClick={handleCompleteWorkout}
              disabled={isCompleting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-background font-display font-bold text-xs shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Complete Workout
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================
             MAIN 3-PANEL ACTIVE WORKSPACE CONTENT
             =================================================================== */}
        {sessionCompletedSummary ? (
          /* Session Completed Analytics Report */
          <div className="p-8 space-y-6 overflow-y-auto flex-1 animate-fade-in text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-success/20 border border-success/40 text-success flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.35)]">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl font-display font-bold text-text-primary">Workout Session Completed!</h3>
              <p className="text-xs text-text-secondary">
                Biomechanical movement completed and adaptive training telemetry recorded.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl w-full">
              <div className="glass-card p-5 rounded-2xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Total Volume</span>
                <p className="text-2xl font-display font-bold text-primary mt-1">{sessionCompletedSummary.totalVolumeKg?.toLocaleString()} kg</p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Duration</span>
                <p className="text-2xl font-display font-bold text-secondary mt-1">{sessionCompletedSummary.durationMinutes} min</p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Training Load</span>
                <p className="text-2xl font-display font-bold text-gold mt-1">
                  {sessionCompletedSummary.trainingLoadScore || Math.round(sessionRpe * sessionCompletedSummary.durationMinutes)} <span className="text-xs text-text-muted">AU</span>
                </p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Volume Density</span>
                <p className="text-2xl font-display font-bold text-success mt-1">
                  {sessionCompletedSummary.volumeDensityKgMin || (sessionCompletedSummary.totalVolumeKg / Math.max(1, sessionCompletedSummary.durationMinutes)).toFixed(1)} <span className="text-xs text-text-muted">kg/m</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan/10 border border-cyan/40 max-w-2xl w-full flex items-center justify-between font-mono text-xs shadow-hunter-glow">
              <div className="flex items-center gap-2 text-cyan font-bold">
                <CheckCircle2 className="w-5 h-5 text-cyan" />
                <span>+500 XP AWARDED • HUNTER LEVEL ASCENSION UPDATED</span>
              </div>
              <span className="text-gold font-bold">+500 XP</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container/60 border border-primary/30 max-w-2xl w-full text-left font-mono text-xs text-text-secondary space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>e1RM BASELINE INTELLIGENCE UPDATED</span>
              </div>
              <p className="text-[11px] text-text-muted">
                Your latest set performances and e1RMs have been persisted to calibrate next session starting prescriptions.
              </p>
            </div>

            <button
              onClick={handleFinishAndExit}
              className="px-8 py-3.5 rounded-2xl bg-primary text-background font-display font-bold text-sm shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:opacity-95 transition-all"
            >
              Return to Workout Hub
            </button>
          </div>
        ) : (
          /* 3-Column Layout: Left ~20% (col 2.5), Center ~55% (col 6.5), Right ~25% (col 3) */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden overflow-x-hidden w-full">
            
            {/* LEFT PANEL (~20% -> 3 cols on 12-grid): Routine Sequence */}
            <div className="lg:col-span-3 xl:col-span-3 h-full overflow-hidden min-w-0">
              <ExerciseNavigationPanel
                exercises={exercisesList}
                activeIndex={activeExerciseIndex}
                onSelectExercise={(idx) => {
                  setActiveExerciseIndex(idx);
                  setActiveRestSeconds(null);
                }}
                completedSetsMap={completedSetsMap}
                totalSetsMap={totalSetsMap}
              />
            </div>

            {/* CENTER FOCUS (~55% -> 6 cols on 12-grid): 3D/2D Exercise Visualizer */}
            <div className="lg:col-span-6 xl:col-span-6 h-full flex flex-col space-y-3 overflow-hidden min-w-0">
              <div className="flex-1 overflow-hidden min-w-0" style={{ minHeight: '380px' }}>
                <Exercise3DCanvas
                  key={currentExercise ? `${currentExercise.id}_${activeExerciseIndex}` : 'canvas_0'}
                  config={current3DConfig}
                />
              </div>

              {/* Active Rest Timer Bar if counting down */}
              {activeRestSeconds !== null && (
                <RestTimerBar
                  initialSeconds={activeRestSeconds}
                  onTimerComplete={() => setActiveRestSeconds(null)}
                  onCancel={() => setActiveRestSeconds(null)}
                />
              )}
            </div>

            {/* RIGHT PANEL (~25% -> 3 cols on 12-grid): Set Logging & Autoregulation */}
            <div className="lg:col-span-3 xl:col-span-3 h-full overflow-hidden min-w-0">
              {currentExercise && (
                <SetLoggingPanel
                  key={currentExercise.id || `set_${activeExerciseIndex}`}
                  activeExercise={currentExercise}
                  sets={currentSets}
                  adaptiveFeedback={adaptiveFeedback[currentExercise.id]}
                  onUpdateSet={handleUpdateSet}
                  onToggleLogSet={handleToggleLogSet}
                  sessionRpe={sessionRpe}
                  onUpdateSessionRpe={setSessionRpe}
                />
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
