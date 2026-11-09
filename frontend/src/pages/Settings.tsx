import React from 'react';
import { Settings, ShieldCheck, Database, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div>
        <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-bold uppercase tracking-wider">
          HUNTER OS PREFERENCES
        </span>
        <h2 className="text-3xl font-display font-bold text-text-primary mt-2">System & Engine Settings</h2>
        <p className="text-sm text-text-secondary mt-1">Application performance, biometrics engine, and telemetry configuration.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-navy/90">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-cyan" />
          <h3 className="font-display font-bold text-text-primary">System Telemetry Configuration</h3>
        </div>

        <div className="bg-navy-elevated p-4 rounded-xl space-y-2 font-mono text-xs text-text-secondary border border-border/60">
          <p><strong className="text-text-primary">Environment:</strong> Production / FitMentor RPG Core v2.0</p>
          <p><strong className="text-text-primary">Theme Token:</strong> Solo Leveling Dark Fantasy Theme</p>
          <p><strong className="text-text-primary">Biometrics Engine:</strong> HRV & Sleep Telemetry v1.4</p>
          <p><strong className="text-text-primary">Pose Vision API:</strong> MediaPipe Local Execution</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4 border border-border bg-navy/90">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-gold" />
          <h3 className="font-display font-bold text-text-primary">Privacy & Encrypted Local Storage</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          All biometrics processing, pose landmark analysis, and progression telemetry run entirely on local client runtime with client-side encrypted storage.
        </p>
      </div>
    </div>
  );
};
