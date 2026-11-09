import React, { useEffect, useState } from 'react';
import { Clock, Plus, RotateCcw, X } from 'lucide-react';

interface RestTimerBarProps {
  initialSeconds: number;
  onTimerComplete: () => void;
  onCancel: () => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  initialSeconds,
  onTimerComplete,
  onCancel
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
    setTotalSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimerComplete();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onTimerComplete]);

  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100) : 100;
  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const addTime = (extra: number) => {
    setSecondsRemaining((prev) => prev + extra);
    setTotalSeconds((prev) => prev + extra);
  };

  return (
    <div className="bg-gradient-to-r from-gold/10 via-surface-elevated to-gold/10 border border-gold/40 rounded-2xl p-4 shadow-xl space-y-2 animate-fade-in font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gold font-bold">
          <Clock className="w-4 h-4 animate-spin-slow" />
          <span>Active Inter-Set Rest Period</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => addTime(30)}
            className="px-2 py-1 rounded-lg bg-surface border border-border text-[11px] text-text-secondary hover:text-text-primary flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> 30s
          </button>
          <button
            onClick={onCancel}
            title="Skip Rest Timer"
            className="p-1 rounded-lg text-text-muted hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-display font-bold text-gold tracking-tight">{formatted}</span>
        <span className="text-[11px] text-text-muted">Target Recovery</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border/40">
        <div
          className="h-full bg-gold transition-all duration-1000 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
