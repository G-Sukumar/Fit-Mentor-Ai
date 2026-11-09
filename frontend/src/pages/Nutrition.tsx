import React, { useState } from 'react';
import { Droplet, Plus, Utensils, Sparkles } from 'lucide-react';

export const NutritionPage: React.FC = () => {
  const [waterMl, setWaterMl] = useState(2250);
  const targetWaterMl = 3500;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-bold uppercase tracking-wider">
          METABOLIC NUTRITION TELEMETRY
        </span>
        <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Hunter Fueling & Macros</h2>
        <p className="text-sm text-text-secondary mt-1">Calibrated daily macro distribution, energy targets, and hydration telemetry.</p>
      </div>

      {/* Macro Rings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-cyan/30 bg-navy/90 space-y-2">
          <span className="text-xs font-mono text-text-muted uppercase">Protein</span>
          <p className="text-2xl font-display font-bold text-cyan">112g <span className="text-xs text-text-muted font-normal">/ 160g</span></p>
          <div className="w-full bg-navy-elevated h-2 rounded-full overflow-hidden border border-border/60">
            <div className="bg-cyan h-full rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: '70%' }} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-secondary/30 bg-navy/90 space-y-2">
          <span className="text-xs font-mono text-text-muted uppercase">Carbohydrates</span>
          <p className="text-2xl font-display font-bold text-secondary">185g <span className="text-xs text-text-muted font-normal">/ 220g</span></p>
          <div className="w-full bg-navy-elevated h-2 rounded-full overflow-hidden border border-border/60">
            <div className="bg-secondary h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ width: '84%' }} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gold/30 bg-navy/90 space-y-2">
          <span className="text-xs font-mono text-text-muted uppercase">Healthy Fats</span>
          <p className="text-2xl font-display font-bold text-gold">48g <span className="text-xs text-text-muted font-normal">/ 65g</span></p>
          <div className="w-full bg-navy-elevated h-2 rounded-full overflow-hidden border border-border/60">
            <div className="bg-gold h-full rounded-full shadow-[0_0_8px_rgba(212,175,106,0.5)]" style={{ width: '73%' }} />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-success/30 bg-navy/90 space-y-2">
          <span className="text-xs font-mono text-text-muted uppercase">Total Energy Target</span>
          <p className="text-2xl font-display font-bold text-success">1,940 <span className="text-xs text-text-muted font-normal">/ 2,400 kcal</span></p>
          <div className="w-full bg-navy-elevated h-2 rounded-full overflow-hidden border border-border/60">
            <div className="bg-success h-full rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: '80%' }} />
          </div>
        </div>
      </div>

      {/* Hydration & Meal AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Water Tracker */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-text-primary">Hydration Tracker</h3>
                <p className="text-xs text-text-secondary">Target: {(targetWaterMl / 1000).toFixed(1)}L Daily</p>
              </div>
            </div>
            <span className="text-2xl font-display font-bold text-primary font-mono font-semibold">
              {(waterMl / 1000).toFixed(2)}L
            </span>
          </div>

          <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (waterMl / targetWaterMl) * 100)}%` }}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setWaterMl((prev) => prev + 250)}
              className="flex-1 py-3 rounded-xl bg-surface-elevated border border-primary/40 text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> +250ml Glass
            </button>
            <button
              onClick={() => setWaterMl((prev) => prev + 500)}
              className="flex-1 py-3 rounded-xl bg-surface-elevated border border-primary/40 text-primary text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> +500ml Bottle
            </button>
          </div>
        </div>

        {/* AI Meal Recommender */}
        <div className="glass-card p-6 rounded-2xl space-y-4 border border-secondary/30">
          <div className="flex items-center gap-2 text-secondary">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-display font-bold text-text-primary">AI Meal Recommendation</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            To hit your remaining <strong className="text-text-primary">48g protein</strong> target for dinner:
          </p>
          <div className="bg-surface-container/60 border border-border/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-primary text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-secondary" /> Grilled Salmon & Quinoa Bowl
              </span>
              <span className="text-xs font-mono text-gold">480 kcal</span>
            </div>
            <p className="text-xs text-text-muted">200g Wild Salmon, 150g Cooked Quinoa, Steamed Asparagus, Olive Oil drizzle.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
