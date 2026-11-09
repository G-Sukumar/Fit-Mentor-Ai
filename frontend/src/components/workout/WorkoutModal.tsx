import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Dumbbell, AlertCircle, Loader2, Sparkles, TrendingUp, Zap, ShieldCheck, Award } from 'lucide-react';
import { Workout, WorkoutSetLog, PrescribedWorkoutPlan, AdaptiveSuggestion } from '../../types/fitness';
import { apiService } from '../../services/api';
import { progressionService } from '../../services/progressionService';

interface WorkoutModalProps {
  workout: Workout;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted?: () => void;
}

export const WorkoutModal: React.FC<WorkoutModalProps> = ({ workout, isOpen, onClose, onSessionCompleted }) => {
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);
  const [prescribedPlan, setPrescribedPlan] = useState<PrescribedWorkoutPlan | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [sessionCompletedSummary, setSessionCompletedSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active exercises set inputs state
  const [setInputs, setSetInputs] = useState<Record<string, WorkoutSetLog[]>>({});
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<Record<string, AdaptiveSuggestion>>({});
  const [sessionRpe, setSessionRpe] = useState<number>(8.0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Initialize session and fetch adaptive prescriptions when modal opens
  useEffect(() => {
    if (isOpen) {
      const initSession = async () => {
        setIsInitializing(true);
        setError(null);
        setSessionCompletedSummary(null);

        // Fetch tailored target prescriptions
        let prescribed: PrescribedWorkoutPlan | null = null;
        try {
          prescribed = await apiService.getPrescribedWorkout(workout.id);
          setPrescribedPlan(prescribed);
        } catch {
          // Fallback
        }

        // Initialize set inputs structure with prescribed targets
        const initialSets: Record<string, WorkoutSetLog[]> = {};
        const exercisesToUse = prescribed?.exercises || workout.exercises;

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

        // Start session on backend
        try {
          const res = await apiService.startWorkoutSession(workout.id);
          if (res.success && res.sessionLogId) {
            setSessionLogId(res.sessionLogId);
          }
        } catch (err: any) {
          setError('Running in local session mode.');
        }

        setElapsedSeconds(0);
        setTimerActive(true);
        setIsInitializing(false);
      };

      initSession();
    } else {
      setTimerActive(false);
    }
  }, [isOpen, workout]);

  if (!isOpen) return null;

  const handleToggleSet = async (exerciseId: string, setIndex: number) => {
    const exerciseSets = [...(setInputs[exerciseId] || [])];
    const targetSet = { ...exerciseSets[setIndex] };
    targetSet.completed = !targetSet.completed;
    exerciseSets[setIndex] = targetSet;

    setSetInputs({ ...setInputs, [exerciseId]: exerciseSets });

    // Send log to API and evaluate real-time autoregulation if completed
    if (targetSet.completed && sessionLogId) {
      try {
        // 1. Log set
        await apiService.logWorkoutSet(sessionLogId, {
          exerciseId,
          setNumber: targetSet.setNumber,
          repsCompleted: targetSet.repsCompleted,
          weightKg: targetSet.weightKg,
          rpeScore: targetSet.rpeScore,
          targetReps: targetSet.targetReps,
          targetWeightKg: targetSet.targetWeightKg
        });

        // 2. Evaluate adaptive autoregulation
        const autoRes = await apiService.autoregulateSet(sessionLogId, {
          exerciseId,
          setNumber: targetSet.setNumber,
          weightKg: targetSet.weightKg,
          repsCompleted: targetSet.repsCompleted,
          rpeScore: targetSet.rpeScore || 8.0,
          targetReps: targetSet.targetReps || targetSet.repsCompleted,
          targetWeightKg: targetSet.targetWeightKg || targetSet.weightKg
        });

        if (autoRes.success && autoRes.adaptation) {
          setAdaptiveFeedback((prev) => ({ ...prev, [exerciseId]: autoRes.adaptation }));

          // If next set exists and recommendation suggests weight adjustment, update next set
          if (setIndex + 1 < exerciseSets.length && !exerciseSets[setIndex + 1].completed) {
            const nextSet = { ...exerciseSets[setIndex + 1] };
            if (autoRes.adaptation.suggestedWeightKg) {
              nextSet.weightKg = autoRes.adaptation.suggestedWeightKg;
            }
            if (autoRes.adaptation.suggestedReps) {
              nextSet.repsCompleted = autoRes.adaptation.suggestedReps;
            }
            exerciseSets[setIndex + 1] = nextSet;
            setSetInputs({ ...setInputs, [exerciseId]: exerciseSets });
          }
        }
      } catch {
        // Fallback
      }
    }
  };

  const handleInputChange = (
    exerciseId: string, 
    setIndex: number, 
    field: 'repsCompleted' | 'weightKg' | 'rpeScore', 
    value: number
  ) => {
    const exerciseSets = [...(setInputs[exerciseId] || [])];
    exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: Math.max(0, value) };
    setSetInputs({ ...setInputs, [exerciseId]: exerciseSets });
  };

  // Live total volume & completed sets
  const totalVolumeKg = Object.values(setInputs).flatMap((sets) => sets).reduce((sum, s) => s.completed ? sum + (s.repsCompleted * s.weightKg) : sum, 0);
  const totalCompletedSets = Object.values(setInputs).flatMap((sets) => sets).filter((s) => s.completed).length;

  const handleCompleteSession = async () => {
    setIsCompleting(true);
    setTimerActive(false);

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
          summaryData = {
            ...summaryData,
            ...res.session
          };
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

  const handleCloseAfterSummary = () => {
    if (onSessionCompleted) onSessionCompleted();
    onClose();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] glass-card-elevated rounded-2xl border border-border flex flex-col overflow-hidden shadow-2xl">
        
        {/* ===================================================================
             MODAL HEADER
             =================================================================== */}
        <div className="p-6 border-b border-border/40 flex justify-between items-center bg-surface-container/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono text-success uppercase font-semibold">Adaptive Workout Session</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-[10px] font-mono text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> M5 Autoregulation Active
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-text-primary mt-1">{workout.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-elevated border border-gold/30 font-mono text-sm text-gold">
              <Clock className="w-4 h-4 text-gold animate-spin-slow" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================================================================
             SESSION SUMMARY MODAL (Rendered upon completion)
             =================================================================== */}
        {sessionCompletedSummary ? (
          <div className="p-8 space-y-6 overflow-y-auto flex-1 animate-fade-in text-center">
            <div className="w-16 h-16 rounded-2xl bg-success/20 border border-success/40 text-success flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-display font-bold text-text-primary">Workout Session Completed!</h3>
              <p className="text-xs text-text-secondary mt-1">Adaptive training analytics & progressive overload metrics recorded.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="glass-card p-4 rounded-xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Total Volume</span>
                <p className="text-xl font-display font-bold text-primary mt-1">{sessionCompletedSummary.totalVolumeKg?.toLocaleString()} kg</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Duration</span>
                <p className="text-xl font-display font-bold text-secondary mt-1">{sessionCompletedSummary.durationMinutes} min</p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Training Load</span>
                <p className="text-xl font-display font-bold text-gold mt-1">{sessionCompletedSummary.trainingLoadScore || Math.round(sessionRpe * sessionCompletedSummary.durationMinutes)} <span className="text-xs text-text-muted">AU</span></p>
              </div>

              <div className="glass-card p-4 rounded-xl border border-border">
                <span className="text-[10px] font-mono text-text-muted uppercase">Volume Density</span>
                <p className="text-xl font-display font-bold text-success mt-1">{sessionCompletedSummary.volumeDensityKgMin || (sessionCompletedSummary.totalVolumeKg / Math.max(1, sessionCompletedSummary.durationMinutes)).toFixed(1)} <span className="text-xs text-text-muted">kg/m</span></p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container/60 border border-primary/30 max-w-2xl mx-auto text-left font-mono text-xs text-text-secondary space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>AUTOREGULATION BASELINES UPDATED</span>
              </div>
              <p className="text-[11px] text-text-muted">Your latest e1RM performances have been persisted to calibrate next session target weights.</p>
            </div>

            <button
              onClick={handleCloseAfterSummary}
              className="px-8 py-3 rounded-xl bg-primary text-background font-display font-bold text-sm shadow-[0_0_20px_rgba(34,211,238,0.35)] hover:opacity-95 transition-all"
            >
              Return to Workout Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Live Volume Telemetry Bar */}
            <div className="bg-surface/80 px-6 py-3 border-b border-border/40 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1 text-secondary">
                  <Dumbbell className="w-4 h-4" /> Live Volume: <strong className="text-text-primary">{totalVolumeKg.toLocaleString()} kg</strong>
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Check className="w-4 h-4" /> Sets Completed: <strong className="text-text-primary">{totalCompletedSets}</strong>
                </span>
              </div>

              {/* Session RPE Global Selector */}
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-[11px]">Session Exertion:</span>
                <select
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(Number(e.target.value))}
                  className="bg-surface-elevated border border-border rounded-md px-2 py-1 text-xs text-gold font-mono outline-none"
                >
                  <option value={6.0}>RPE 6.0 (Light)</option>
                  <option value={7.0}>RPE 7.0 (Moderate)</option>
                  <option value={7.5}>RPE 7.5 (Solid)</option>
                  <option value={8.0}>RPE 8.0 (Standard Target)</option>
                  <option value={8.5}>RPE 8.5 (Hard)</option>
                  <option value={9.0}>RPE 9.0 (1 RIR)</option>
                  <option value={9.5}>RPE 9.5 (Near Limit)</option>
                  <option value={10.0}>RPE 10.0 (Max Exertion)</option>
                </select>
              </div>
            </div>

            {/* Exercises Set Inputs List */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {(prescribedPlan?.exercises || workout.exercises).map((ex: any) => {
                const feedback = adaptiveFeedback[ex.id];
                const baseline = ex.baseline;
                const targetWeight = ex.prescribedWeightKg || 70.0;
                const targetReps = ex.targetReps || ex.repsDefault || 8;
                const targetSets = ex.targetSets || ex.setsDefault || 4;

                const hasPrevious = baseline && baseline.lastWorkingWeightKg > 0;
                const weightDelta = hasPrevious ? Number((targetWeight - baseline.lastWorkingWeightKg).toFixed(1)) : 0;

                return (
                  <div key={ex.id} className="bg-surface-container/40 rounded-xl p-5 border border-border/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-display font-bold text-text-primary text-base">
                            {ex.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-[10px] font-mono text-text-muted">
                            {ex.targetMuscle} • {ex.movementType || 'Compound'}
                          </span>
                        </div>

                        {/* Prescribed Target vs Previous Session Comparison Strip */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Target: {targetSets} sets × {targetReps} reps @ {targetWeight} kg
                          </span>

                          {hasPrevious ? (
                            <span className="px-2.5 py-1 rounded-lg bg-surface-elevated border border-secondary/30 text-secondary flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3" />
                              Previous: {baseline.lastWorkingWeightKg}kg × {baseline.lastWorkingReps} @ RPE {baseline.lastWorkingRpe}
                              {weightDelta > 0 && (
                                <strong className="text-success ml-1 font-bold">(+{weightDelta}kg overload)</strong>
                              )}
                              {weightDelta === 0 && (
                                <span className="text-text-muted ml-1">(maintained)</span>
                              )}
                              {weightDelta < 0 && (
                                <strong className="text-warning ml-1">({weightDelta}kg deload)</strong>
                              )}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted">
                              Initial baseline session
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-mono text-gold border border-gold/30 bg-gold/5 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Rest: {ex.restSeconds || 90}s
                      </span>
                    </div>

                    {/* Adaptive Coach Feedback Banner */}
                    {feedback && (
                      <div className={`p-3 rounded-xl border flex items-start gap-3 text-xs animate-fade-in ${
                        feedback.suggestedAction === 'INCREASE_WEIGHT'
                          ? 'bg-primary/10 border-primary/40 text-text-primary'
                          : feedback.suggestedAction === 'DELOAD_INTENSITY' || feedback.suggestedAction === 'REDUCE_WEIGHT'
                          ? 'bg-warning/10 border-warning/40 text-text-primary'
                          : 'bg-surface-elevated/80 border-border text-text-secondary'
                      }`}>
                        <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${
                          feedback.suggestedAction === 'INCREASE_WEIGHT' ? 'text-primary' : feedback.suggestedAction === 'DELOAD_INTENSITY' ? 'text-warning' : 'text-gold'
                        }`} />
                        <div>
                          <p className="font-semibold text-text-primary font-mono text-[11px] uppercase flex items-center gap-2">
                            <span>Autoregulation Rule Feedback</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                              {feedback.trigger.replace(/_/g, ' ')}
                            </span>
                          </p>
                          <p className="text-xs mt-0.5 leading-relaxed">{feedback.message}</p>
                        </div>
                      </div>
                    )}

                    {/* Set Input Table */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-text-muted uppercase px-2">
                        <span className="col-span-2">Set / Target</span>
                        <span className="col-span-3">Actual Weight</span>
                        <span className="col-span-3">Actual Reps</span>
                        <span className="col-span-3">RPE (RIR)</span>
                        <span className="col-span-1 text-right">Log</span>
                      </div>

                      {(setInputs[ex.id] || []).map((setRecord, idx) => {
                        const rir = Math.max(0, 10 - (setRecord.rpeScore || 8.0));
                        const e1rm = Math.round(setRecord.weightKg * (1 + Math.min(12, setRecord.repsCompleted) / 30.0));

                        return (
                          <div
                            key={idx}
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-all ${
                              setRecord.completed
                                ? 'bg-success/10 border-success/30 text-text-primary'
                                : 'bg-surface-elevated/40 border-border/40 text-text-secondary'
                            }`}
                          >
                            <div className="col-span-2 font-mono text-xs">
                              <span className="font-semibold text-text-primary">Set {idx + 1}</span>
                              <span className="block text-[10px] text-text-muted">
                                {setRecord.targetWeightKg || targetWeight}k × {setRecord.targetReps || targetReps}
                              </span>
                            </div>

                            {/* Weight Input */}
                            <div className="col-span-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  step={0.5}
                                  value={setRecord.weightKg}
                                  onChange={(e) => handleInputChange(ex.id, idx, 'weightKg', Number(e.target.value))}
                                  className="w-full bg-surface border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary font-mono outline-none focus:border-primary pr-6"
                                />
                                <span className="absolute right-1.5 top-1 text-[10px] text-text-muted font-mono pointer-events-none">kg</span>
                              </div>
                            </div>

                            {/* Reps Input */}
                            <div className="col-span-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min={0}
                                  value={setRecord.repsCompleted}
                                  onChange={(e) => handleInputChange(ex.id, idx, 'repsCompleted', Number(e.target.value))}
                                  className="w-full bg-surface border border-border/60 rounded-md px-2 py-1 text-xs text-text-primary font-mono outline-none focus:border-primary pr-8"
                                />
                                <span className="absolute right-1.5 top-1 text-[10px] text-text-muted font-mono pointer-events-none">reps</span>
                              </div>
                            </div>

                            {/* RPE Selector with RIR */}
                            <div className="col-span-3">
                              <select
                                value={setRecord.rpeScore || 8.0}
                                onChange={(e) => handleInputChange(ex.id, idx, 'rpeScore', Number(e.target.value))}
                                className="w-full bg-surface border border-border/60 rounded-md px-1.5 py-1 text-xs text-gold font-mono outline-none focus:border-gold"
                              >
                                <option value={6.0}>RPE 6.0 (4 RIR)</option>
                                <option value={7.0}>RPE 7.0 (3 RIR)</option>
                                <option value={7.5}>RPE 7.5 (2.5 RIR)</option>
                                <option value={8.0}>RPE 8.0 (2 RIR)</option>
                                <option value={8.5}>RPE 8.5 (1.5 RIR)</option>
                                <option value={9.0}>RPE 9.0 (1 RIR)</option>
                                <option value={9.5}>RPE 9.5 (0.5 RIR)</option>
                                <option value={10.0}>RPE 10.0 (0 RIR)</option>
                              </select>
                              {setRecord.completed && (
                                <span className="text-[9px] font-mono text-primary block mt-0.5">
                                  e1RM: ~{e1rm}kg
                                </span>
                              )}
                            </div>

                            {/* Log Button */}
                            <div className="col-span-1 text-right">
                              <button
                                onClick={() => handleToggleSet(ex.id, idx)}
                                title={setRecord.completed ? "Set logged (click to edit)" : "Click to log set"}
                                className={`p-1.5 rounded-md text-xs transition-all ${
                                  setRecord.completed
                                    ? 'bg-success text-background shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                    : 'bg-surface-container border border-border text-text-muted hover:text-text-primary hover:border-primary'
                                }`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-border/40 bg-surface-container/60 flex justify-between items-center">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-xs font-mono text-text-secondary hover:text-text-primary">
                Cancel Session
              </button>

              <button
                onClick={handleCompleteSession}
                disabled={isCompleting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-background font-display font-bold text-xs shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:opacity-95 flex items-center gap-2"
              >
                {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Complete & Save Workout Session
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
