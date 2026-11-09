import React, { useState } from 'react';
import { Activity, Brain, Clock3, Dumbbell, ShieldCheck } from 'lucide-react';

export interface RecommendationContext {
  sessionGoal: string;
  minutes: number;
  energy: string;
  painFree: boolean;
}

interface Props { onChange: (context: RecommendationContext) => void; }

export const AdaptiveRecommendationIntake: React.FC<Props> = ({ onChange }) => {
  const [context, setContext] = useState<RecommendationContext>({
    sessionGoal: 'strength', minutes: 45, energy: 'ready', painFree: true,
  });

  const update = (next: Partial<RecommendationContext>) => {
    const value = { ...context, ...next };
    setContext(value);
    onChange(value);
  };

  return (
    <section className="glass-card rounded-2xl p-5 border border-secondary/30 bg-gradient-to-br from-secondary/10 via-surface/90 to-primary/5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center"><Brain className="w-5 h-5" /></div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-secondary">Personalized session builder</p>
            <h3 className="text-xl font-display font-bold text-text-primary">What does your body need today?</h3>
            <p className="text-xs text-text-secondary mt-1">Recommendations adapt to your goal, available time, energy and safety check.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-success font-mono"><ShieldCheck className="w-4 h-4" /> Safety-aware inputs</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <label className="space-y-1.5"><span className="label-caps"><Dumbbell className="w-3.5 h-3.5" /> Focus</span><select value={context.sessionGoal} onChange={e => update({ sessionGoal: e.target.value })} className="input-control"><option value="strength">Build strength</option><option value="hypertrophy">Build muscle</option><option value="conditioning">Conditioning</option><option value="mobility">Mobility & recovery</option></select></label>
        <label className="space-y-1.5"><span className="label-caps"><Clock3 className="w-3.5 h-3.5" /> Time today</span><select value={context.minutes} onChange={e => update({ minutes: Number(e.target.value) })} className="input-control"><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="75">75+ minutes</option></select></label>
        <label className="space-y-1.5"><span className="label-caps"><Activity className="w-3.5 h-3.5" /> Energy level</span><select value={context.energy} onChange={e => update({ energy: e.target.value })} className="input-control"><option value="low">Low — recover</option><option value="steady">Steady — moderate</option><option value="ready">Ready — push me</option></select></label>
        <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-container/60 px-3 py-2.5 cursor-pointer self-end min-h-[42px]"><input type="checkbox" checked={context.painFree} onChange={e => update({ painFree: e.target.checked })} className="accent-cyan-400 w-4 h-4" /><span className="text-xs text-text-primary">No pain or movement restrictions</span></label>
      </div>
    </section>
  );
};
