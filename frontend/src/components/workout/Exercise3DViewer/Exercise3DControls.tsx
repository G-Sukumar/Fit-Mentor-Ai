import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity } from 'lucide-react';

interface Exercise3DControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSelectSpeed: (speed: number) => void;
  progress: number;
  onScrub: (progress: number) => void;
}

export const Exercise3DControls: React.FC<Exercise3DControlsProps> = ({
  isPlaying,
  onTogglePlay,
  speed,
  onSelectSpeed,
  progress,
  onScrub
}) => {
  // Determine movement phase from progress
  let phaseLabel = 'Eccentric (Lowering)';
  let phaseColor = 'text-primary';
  if (progress > 0.4 && progress < 0.6) {
    phaseLabel = 'Transition / Isometric Pause';
    phaseColor = 'text-gold';
  } else if (progress >= 0.6) {
    phaseLabel = 'Concentric (Drive / Squeeze)';
    phaseColor = 'text-success';
  }

  return (
    <div className="bg-surface-container/90 backdrop-blur-md p-3.5 rounded-2xl border border-border/80 shadow-xl space-y-2.5">
      {/* Timeline Scrubber & Phase */}
      <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-text-muted">Phase:</span>
          <strong className={phaseColor}>{phaseLabel}</strong>
        </div>
        <span className="text-text-muted">{Math.round(progress * 100)}%</span>
      </div>

      <div className="relative flex items-center group">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full h-1.5 bg-surface-elevated rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
        />
      </div>

      {/* Main Buttons */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Play/Pause & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="px-4 py-2 rounded-xl bg-primary text-background font-display font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.35)] hover:opacity-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause Demo
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play Demo
              </>
            )}
          </button>

          <button
            onClick={() => onScrub(0)}
            title="Reset Movement to Start"
            className="p-2 rounded-xl bg-surface-elevated text-text-muted hover:text-text-primary border border-border transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border font-mono text-xs">
          <span className="text-[10px] text-text-muted px-2 uppercase font-semibold">Speed:</span>
          {[0.5, 1.0, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => onSelectSpeed(s)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                speed === s
                  ? 'bg-secondary text-background font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
