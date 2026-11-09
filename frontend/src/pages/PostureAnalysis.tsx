import React from 'react';
import { Camera, Video, ShieldCheck } from 'lucide-react';

export const PostureAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan font-bold uppercase tracking-wider">
          COMPUTER VISION FORM ARBITER
        </span>
        <h2 className="text-3xl font-display font-bold text-text-primary mt-2">Kinematic Posture & Form Checker</h2>
        <p className="text-sm text-text-secondary mt-1">Real-time landmark pose estimation and joint angle analysis.</p>
      </div>

      <div className="glass-card rounded-2xl p-8 text-center border border-cyan/30 bg-navy/90 space-y-6 max-w-2xl mx-auto shadow-hunter-glow">
        <div className="w-16 h-16 rounded-2xl bg-cyan/10 text-cyan border border-cyan/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Camera className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-display font-bold text-text-primary">Camera & Pose Pipeline Ready</h3>
          <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto">
            Position your camera to analyze shoulder symmetry, lumbar curvature, and knee alignment throughout your lifts.
          </p>
        </div>

        <div className="bg-navy-elevated border border-border/80 rounded-xl p-4 flex items-center justify-center gap-3 text-xs font-mono text-text-muted">
          <ShieldCheck className="w-4 h-4 text-cyan" />
          <span>Local Client-Side MediaPipe Processing • No Video Uploaded</span>
        </div>

        <button className="btn-hunter-primary px-6 py-3 rounded-xl flex items-center justify-center gap-2 mx-auto text-xs font-mono font-bold tracking-wider">
          <Video className="w-4 h-4 fill-current" />
          ENABLE LIVE TELEMETRY STREAM
        </button>
      </div>
    </div>
  );
};
