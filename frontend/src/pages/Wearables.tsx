import React from 'react';
import { Watch, RefreshCw, CheckCircle2 } from 'lucide-react';
import { mockWearable } from '../data/mockData';

export const WearablesPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-bold uppercase tracking-wider">
          TELEMETRY SYNCHRONIZATION
        </span>
        <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Wearables & Smartwatch Integration</h2>
        <p className="text-sm text-text-secondary mt-1">Real-time biometrics stream from WearOS, Galaxy Watch, and Apple Watch.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-cyan/30 bg-navy/90 space-y-6 max-w-xl shadow-hunter-glow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 text-cyan border border-cyan/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Watch className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-text-primary">{mockWearable.deviceName}</h3>
              <p className="text-xs text-text-secondary font-mono">Battery: {mockWearable.batteryLevelPercent}% • Synced {mockWearable.lastSyncedAt}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-cyan/15 border border-cyan/40 text-xs font-mono text-cyan flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan" /> CONNECTED
          </span>
        </div>

        <div className="pt-4 border-t border-border/40 flex justify-between items-center">
          <span className="text-xs text-text-muted font-mono">Telemetry rate: 1 Hz telemetry loop</span>
          <button className="px-4 py-2 rounded-xl bg-navy-elevated border border-cyan/30 text-cyan text-xs font-mono font-bold flex items-center gap-2 hover:bg-cyan/10 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Force Sync Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};
