import React from 'react';
import { Check, Dumbbell, Zap, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { PrescribedExerciseTarget, WorkoutSetLog, AdaptiveSuggestion } from '../../types/fitness';

interface SetLoggingPanelProps {
  activeExercise: PrescribedExerciseTarget;
  sets: WorkoutSetLog[];
  adaptiveFeedback?: AdaptiveSuggestion | null;
  onUpdateSet: (index: number, field: 'weightKg' | 'repsCompleted' | 'rpeScore', value: number) => void;
  onToggleLogSet: (index: number) => void;
  sessionRpe: number;
  onUpdateSessionRpe: (rpe: number) => void;
}

export const SetLoggingPanel: React.FC<SetLoggingPanelProps> = ({
  activeExercise,
  sets,
  adaptiveFeedback,
  onUpdateSet,
  onToggleLogSet,
  sessionRpe,
  onUpdateSessionRpe
}) => {
  const baseline = activeExercise.baseline;
  const targetWeight = activeExercise.prescribedWeightKg || 70.0;
  const targetReps = activeExercise.targetReps || 8;
  const hasPrevious = baseline && baseline.lastWorkingWeightKg > 0;
  const weightDelta = hasPrevious ? Number((targetWeight - baseline.lastWorkingWeightKg).toFixed(1)) : 0;

  return (
    <div className="bg-surface-container/50 rounded-2xl border border-border/80 p-4 sm:p-5 flex flex-col h-full space-y-4 overflow-y-auto overflow-x-hidden min-w-0">
      {/* Exercise Target & Baseline Strip */}
      <div className="space-y-2 border-b border-border/40 pb-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-mono text-primary font-semibold truncate">
            {activeExercise.targetMuscle}
          </span>
          <span className="text-[11px] font-mono text-gold border border-gold/30 px-2 py-0.5 rounded-md shrink-0">
            Rest: {activeExercise.restSeconds || 90}s
          </span>
        </div>

        <h3 className="text-lg font-display font-bold text-text-primary tracking-tight truncate">
          {activeExercise.name}
        </h3>

        {/* Prescription vs Baseline Box */}
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-border space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between gap-1 text-primary">
            <span className="flex items-center gap-1 font-semibold shrink-0">
              <Sparkles className="w-3.5 h-3.5" /> Target:
            </span>
            <strong className="truncate text-right">{activeExercise.targetSets || 4}×{targetReps} @ {targetWeight}kg</strong>
          </div>

          {hasPrevious ? (
            <div className="flex items-center justify-between gap-1 text-secondary pt-1 border-t border-border/40 text-[11px]">
              <span className="flex items-center gap-1 shrink-0">
                <TrendingUp className="w-3 h-3" /> Prev:
              </span>
              <span className="truncate text-right">
                {baseline.lastWorkingWeightKg}k×{baseline.lastWorkingReps} @ RPE {baseline.lastWorkingRpe}
                {weightDelta > 0 && <strong className="text-success ml-1 font-bold">(+{weightDelta}k)</strong>}
                {weightDelta === 0 && <span className="text-text-muted ml-1">(hold)</span>}
                {weightDelta < 0 && <strong className="text-warning ml-1">({weightDelta}k)</strong>}
              </span>
            </div>
          ) : (
            <div className="text-[10px] text-text-muted italic pt-1 border-t border-border/40">
              Initial session baseline prescription
            </div>
          )}
        </div>
      </div>

      {/* Autoregulation Advice Banner */}
      {adaptiveFeedback && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono animate-fade-in shrink-0 ${
            adaptiveFeedback.suggestedAction === 'INCREASE_WEIGHT'
              ? 'bg-primary/10 border-primary/40 text-text-primary'
              : adaptiveFeedback.suggestedAction === 'DELOAD_INTENSITY' || adaptiveFeedback.suggestedAction === 'REDUCE_WEIGHT'
              ? 'bg-warning/10 border-warning/40 text-text-primary'
              : 'bg-surface-elevated/80 border-border text-text-secondary'
          }`}
        >
          <Zap
            className={`w-4 h-4 mt-0.5 shrink-0 ${
              adaptiveFeedback.suggestedAction === 'INCREASE_WEIGHT'
                ? 'text-primary'
                : adaptiveFeedback.suggestedAction === 'DELOAD_INTENSITY'
                ? 'text-warning'
                : 'text-gold'
            }`}
          />
          <div className="space-y-0.5 min-w-0">
            <p className="font-bold text-text-primary uppercase text-[10px] flex flex-wrap items-center gap-1.5">
              <span>Autoregulation</span>
              <span className="px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted text-[9px] truncate max-w-full">
                {adaptiveFeedback.trigger.replace(/_/g, ' ')}
              </span>
            </p>
            <p className="text-[11px] leading-relaxed break-words">{adaptiveFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Set-by-Set Logging Table */}
      <div className="space-y-2 flex-1 min-w-0">
        <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-text-muted uppercase px-1">
          <span className="col-span-2">Set</span>
          <span className="col-span-3">Weight</span>
          <span className="col-span-3">Reps</span>
          <span className="col-span-3">RPE</span>
          <span className="col-span-1 text-right">Log</span>
        </div>

        {sets.map((setRecord, idx) => {
          const e1rm = Math.round(setRecord.weightKg * (1 + Math.min(12, setRecord.repsCompleted) / 30.0));

          return (
            <div
              key={idx}
              className={`grid grid-cols-12 gap-1 items-center p-1.5 rounded-xl border transition-all min-w-0 ${
                setRecord.completed
                  ? 'bg-success/10 border-success/30 text-text-primary shadow-sm'
                  : 'bg-surface-elevated/30 border-border/40 text-text-secondary'
              }`}
            >
              {/* Set # & Target */}
              <div className="col-span-2 font-mono text-xs min-w-0">
                <span className="font-bold text-text-primary block truncate">S{idx + 1}</span>
                <span className="text-[9px] text-text-muted block truncate">
                  {setRecord.targetWeightKg || targetWeight}k
                </span>
              </div>

              {/* Actual Weight */}
              <div className="col-span-3 min-w-0">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={setRecord.weightKg}
                    onChange={(e) => onUpdateSet(idx, 'weightKg', Number(e.target.value))}
                    className="w-full bg-surface border border-border/60 rounded-lg pl-1.5 pr-4 py-1 text-xs text-text-primary font-mono outline-none focus:border-primary"
                  />
                  <span className="absolute right-1 top-1 text-[9px] text-text-muted font-mono pointer-events-none">k</span>
                </div>
              </div>

              {/* Actual Reps */}
              <div className="col-span-3 min-w-0">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={setRecord.repsCompleted}
                    onChange={(e) => onUpdateSet(idx, 'repsCompleted', Number(e.target.value))}
                    className="w-full bg-surface border border-border/60 rounded-lg pl-1.5 pr-4 py-1 text-xs text-text-primary font-mono outline-none focus:border-primary"
                  />
                  <span className="absolute right-1 top-1 text-[9px] text-text-muted font-mono pointer-events-none">r</span>
                </div>
              </div>

              {/* RPE & RIR */}
              <div className="col-span-3 min-w-0">
                <select
                  value={setRecord.rpeScore || 8.0}
                  onChange={(e) => onUpdateSet(idx, 'rpeScore', Number(e.target.value))}
                  className="w-full bg-surface border border-border/60 rounded-lg px-1 py-1 text-[10px] text-gold font-mono outline-none focus:border-gold truncate"
                >
                  <option value={6.0}>RPE 6 (4 RIR)</option>
                  <option value={7.0}>RPE 7 (3 RIR)</option>
                  <option value={7.5}>RPE 7.5</option>
                  <option value={8.0}>RPE 8 (2 RIR)</option>
                  <option value={8.5}>RPE 8.5</option>
                  <option value={9.0}>RPE 9 (1 RIR)</option>
                  <option value={9.5}>RPE 9.5</option>
                  <option value={10.0}>RPE 10 (0 RIR)</option>
                </select>
                {setRecord.completed && (
                  <span className="text-[9px] font-mono text-primary block mt-0.5 truncate">
                    1RM: {e1rm}k
                  </span>
                )}
              </div>

              {/* Log Button */}
              <div className="col-span-1 text-right min-w-0 flex justify-end">
                <button
                  onClick={() => onToggleLogSet(idx)}
                  title={setRecord.completed ? 'Set logged (click to edit)' : 'Click to log set'}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    setRecord.completed
                      ? 'bg-success text-background shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                      : 'bg-surface-container border border-border text-text-muted hover:text-text-primary hover:border-primary'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Session Exertion Selector */}
      <div className="border-t border-border/40 pt-3 flex items-center justify-between font-mono text-xs shrink-0 gap-2">
        <span className="text-text-muted text-[11px] shrink-0">Exertion:</span>
        <select
          value={sessionRpe}
          onChange={(e) => onUpdateSessionRpe(Number(e.target.value))}
          className="bg-surface-elevated border border-border rounded-lg px-2 py-1 text-xs text-gold font-mono outline-none min-w-0 truncate"
        >
          <option value={6.0}>RPE 6.0 (Light)</option>
          <option value={7.0}>RPE 7.0 (Moderate)</option>
          <option value={8.0}>RPE 8.0 (Standard)</option>
          <option value={9.0}>RPE 9.0 (High)</option>
          <option value={10.0}>RPE 10.0 (Max)</option>
        </select>
      </div>
    </div>
  );
};
