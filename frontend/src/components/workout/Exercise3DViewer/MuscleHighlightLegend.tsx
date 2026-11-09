import React from 'react';
import { Layers } from 'lucide-react';

interface MuscleHighlightLegendProps {
  primaryMuscles: { name: string; color: string }[];
  secondaryMuscles: { name: string; color: string }[];
}

export const MuscleHighlightLegend: React.FC<MuscleHighlightLegendProps> = ({
  primaryMuscles,
  secondaryMuscles
}) => {
  return (
    <div className="bg-surface-elevated/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border/80 shadow-lg flex flex-wrap items-center gap-3 text-xs font-mono">
      <span className="text-text-muted flex items-center gap-1 text-[11px] uppercase font-semibold">
        <Layers className="w-3.5 h-3.5 text-primary" /> Muscle Target:
      </span>

      {/* Primary Active Muscles */}
      {primaryMuscles.map((m) => (
        <span
          key={m.name}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/40 text-primary font-semibold text-[11px]"
        >
          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#22d3ee]" />
          {m.name} (Primary)
        </span>
      ))}

      {/* Secondary Stabilizers */}
      {secondaryMuscles.map((m) => (
        <span
          key={m.name}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/40 text-secondary text-[11px]"
        >
          <span className="w-2 h-2 rounded-full bg-secondary" />
          {m.name}
        </span>
      ))}
    </div>
  );
};
