import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Library,
  Utensils, 
  LineChart, 
  BrainCircuit, 
  HeartHandshake,
  Trophy,
  Award,
  Watch,
  User, 
  Settings,
  Menu,
  ChevronLeft,
  Sparkles,
  Zap
} from 'lucide-react';
import { FitMentorShieldEmblem } from '../ui/HunterBadges';

interface SidebarProps {
  onStartWorkout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onStartWorkout, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const primaryNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workouts', label: 'Workout', icon: Dumbbell },
    { to: '/workouts?tab=library', label: 'Exercise Library', icon: Library },
    { to: '/nutrition', label: 'Nutrition', icon: Utensils },
    { to: '/progress', label: 'Progress', icon: LineChart },
    { to: '/challenges', label: 'Challenges', icon: Trophy, badge: 'QUEST' },
    { to: '/achievements', label: 'Achievements', icon: Award },
    { to: '/ai-coach', label: 'AI Coach', icon: BrainCircuit, badge: 'AI' },
    { to: '/wearables', label: 'Wearables', icon: Watch },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const renderNavLink = (item: { to: string; label: string; icon: React.ElementType; badge?: string }) => {
    const Icon = item.icon;
    return (
      <div key={item.to} className="relative group">
        <NavLink
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 ${isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'} rounded-xl transition-all duration-200 text-sm ${
              isActive
                ? 'bg-gradient-to-r from-electric-blue/25 via-navy-elevated to-secondary/20 text-soft-white font-bold border border-cyan/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'text-text-secondary hover:text-soft-white hover:bg-surface-elevated/80 hover:border hover:border-border/60'
            }`
          }
        >
          <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
          {!isCollapsed && <span className="truncate text-xs tracking-wide">{item.label}</span>}
          {!isCollapsed && item.badge && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30 ml-auto">
              {item.badge}
            </span>
          )}
        </NavLink>

        {/* Hover Tooltip for Collapsed State */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-navy-elevated border border-cyan/30 text-soft-white text-xs font-mono font-medium shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap flex items-center gap-2">
            <span>{item.label}</span>
            {item.badge && <span className="text-[9px] text-cyan">({item.badge})</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'w-[72px]' : 'w-[260px]'
      } bg-sidebar border-r border-border glass-card flex flex-col z-40 hidden md:flex transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header */}
      <div className={`p-4 ${isCollapsed ? 'px-2' : 'px-5 py-4'} flex items-center justify-between border-b border-border min-h-[73px]`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <FitMentorShieldEmblem size={isCollapsed ? 32 : 36} />
          {!isCollapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-lg font-display font-bold text-soft-white tracking-tight flex items-center gap-1.5 truncate">
                FitMentor <span className="text-cyan font-mono text-[11px] px-1.5 py-0.2 rounded bg-cyan/15 border border-cyan/30">AI</span>
              </h1>
              <p className="text-[9px] text-text-muted tracking-widest uppercase font-mono font-semibold truncate">
                TRAIN · EVOLVE · BEYOND
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-text-muted hover:text-soft-white hover:bg-navy-elevated transition-colors shrink-0"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'} py-4 space-y-1 overflow-x-hidden`}>
        {primaryNavItems.map(renderNavLink)}
      </div>

      {/* Hunter Philosophy Bottom Card */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-navy-elevated to-background border border-border/80 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-cyan/5 to-secondary/10 opacity-70 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric-blue/20 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-text-muted uppercase">HUNTER CODE</p>
              <p className="text-xs font-display font-bold text-soft-white tracking-wider">
                DISCIPLINE BUILDS FREEDOM
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-border flex justify-center">
          <Zap className="w-4 h-4 text-cyan" />
        </div>
      )}
    </aside>
  );
};
