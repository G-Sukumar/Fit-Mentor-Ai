import React from 'react';
import { Eye, Video, Compass } from 'lucide-react';

interface CameraViewSwitcherProps {
  activeView: 'front' | 'side' | 'isometric' | 'free';
  onSelectView: (view: 'front' | 'side' | 'isometric') => void;
}

export const CameraViewSwitcher: React.FC<CameraViewSwitcherProps> = ({ activeView, onSelectView }) => {
  return (
    <div className="inline-flex items-center gap-1 bg-surface-elevated/80 backdrop-blur-md p-1 rounded-xl border border-border/80 shadow-lg font-mono text-xs">
      <button
        onClick={() => onSelectView('front')}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
          activeView === 'front'
            ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Front</span>
      </button>

      <button
        onClick={() => onSelectView('side')}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
          activeView === 'side'
            ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <Video className="w-3.5 h-3.5" />
        <span>Side Profile</span>
      </button>

      <button
        onClick={() => onSelectView('isometric')}
        className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
          activeView === 'isometric'
            ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
            : 'text-text-muted hover:text-text-primary'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span>Isometric</span>
      </button>
    </div>
  );
};
