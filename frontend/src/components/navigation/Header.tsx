import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Award, 
  User, 
  Home,
  Settings, 
  LogOut, 
  ChevronDown, 
  Flame, 
  Zap, 
  ShieldCheck, 
  LineChart, 
  BrainCircuit, 
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { UserProfile } from '../../types/fitness';
import { useAuth } from '../../context/AuthContext';
import { HunterAvatarGraphic } from '../ui/HunterAvatars';
import { progressionService, ALL_HUNTER_AVATARS, getHunterRank } from '../../services/progressionService';

interface HeaderProps {
  user?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({ user: propUser }) => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const user = authUser || propUser || {
    id: 'u_sukumar_01',
    email: 'sukumar@fitmentor.ai',
    fullName: 'Sukumar',
    age: 26,
    gender: 'Male',
    heightCm: 180,
    weightKg: 78,
    targetWeightKg: 75,
    fitnessGoal: 'Hypertrophy & Lean Recomp',
    activityLevel: 'Active',
    experienceLevel: 'Intermediate',
    streakDays: 14,
  };

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [progressionState, setProgressionState] = useState(() => progressionService.getPersistedState(user?.id));

  useEffect(() => {
    const handleUpdate = () => setProgressionState(progressionService.getPersistedState(user?.id));
    window.addEventListener('fitmentor_progression_updated', handleUpdate);
    return () => window.removeEventListener('fitmentor_progression_updated', handleUpdate);
  }, [user?.id]);

  const currentLevel = 1 + Math.floor((progressionState.bonusXp || 0) / 1000);
  const currentRank = getHunterRank(currentLevel);

  const currentAvatar = ALL_HUNTER_AVATARS.find(a => a.id === progressionState.equippedAvatarId) 
    || ALL_HUNTER_AVATARS.find(a => a.id === 'kamish_10') 
    || ALL_HUNTER_AVATARS[0];


  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [bgTheme, setBgTheme] = useState<'kinetic' | 'studio' | 'stealth'>(() => {
    return (localStorage.getItem('fitmentor_bg_theme') as any) || 'kinetic';
  });

  const changeBgTheme = (newTheme: 'kinetic' | 'studio' | 'stealth') => {
    setBgTheme(newTheme);
    localStorage.setItem('fitmentor_bg_theme', newTheme);
    window.dispatchEvent(new Event('fitmentor_bg_theme_change'));
  };

  const handleNavigate = (path: string) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const notifications = [
    {
      id: 1,
      title: 'Posture Score Improved',
      time: '10m ago',
      desc: 'Form accuracy hit 94% on Barbell Back Squats.',
      icon: Sparkles,
      color: 'text-primary',
    },
    {
      id: 2,
      title: 'Personal Record Alert',
      time: '2h ago',
      desc: 'New 1RM projected: 110 kg Incline Bench.',
      icon: Flame,
      color: 'text-amber-400',
    },
    {
      id: 3,
      title: 'Wearable Sync Complete',
      time: '1d ago',
      desc: 'Galaxy Watch 6 updated sleep recovery data.',
      icon: Zap,
      color: 'text-indigo-400',
    }
  ];

  return (
    <header className="flex justify-between items-center h-16 px-6 lg:px-10 border-b border-border/50 glass-card sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-80 lg:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises, nutrition, AI cues..."
          className="w-full bg-surface-container/60 border border-border/80 rounded-lg pl-10 pr-12 py-1.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder-text-muted outline-none text-text-primary transition-all"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-border/60 rounded px-1.5 py-0.5 bg-surface text-[10px] font-mono text-text-muted">
          <span>Ctrl</span><span>K</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Button & Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileMenuOpen(false);
            }}
            className="relative text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-surface-elevated/60"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background animate-ping" />
            )}
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card bg-surface-elevated/95 border border-border/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-primary/20 text-primary rounded-full border border-primary/30">
                      {unreadNotifications} new
                    </span>
                  )}
                </div>
                {unreadNotifications > 0 && (
                  <button 
                    onClick={() => setUnreadNotifications(0)}
                    className="text-[11px] text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const IconComp = n.icon;
                  return (
                    <div 
                      key={n.id}
                      className="p-2.5 rounded-xl bg-surface/50 hover:bg-surface-container/60 border border-border/40 transition-colors flex gap-3 items-start"
                    >
                      <div className={`p-2 rounded-lg bg-surface-elevated border border-border/60 ${n.color} shrink-0 mt-0.5`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                          <span className="text-[10px] font-mono text-text-muted">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Section with Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-surface-elevated/70 border border-transparent hover:border-border/60 transition-all cursor-pointer group outline-none"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate max-w-[120px]">
                {user.fullName}
              </p>
              <span className="text-[10px] font-mono text-cyan font-medium flex items-center justify-end gap-1">
                <Award className="w-3 h-3 text-gold" />
                {currentRank} • Lv. {currentLevel}
              </span>
            </div>

            <div className="relative">
              <HunterAvatarGraphic 
                avatarType={currentAvatar.avatarType} 
                imageSrc={currentAvatar.imageSrc} 
                avatarRankNumber={currentAvatar.avatarRankNumber}
                size={38} 
                className="rounded-xl border border-cyan/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              />
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-background/95 text-gold border border-gold/50 rounded text-[8px] font-mono font-extrabold shadow-sm">
                #{currentAvatar.avatarRankNumber || 10}
              </span>
            </div>

            <ChevronDown 
              className={`w-4 h-4 text-text-muted group-hover:text-text-primary transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180 text-primary' : ''
              }`} 
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 glass-card bg-surface-elevated/95 border border-border/80 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
              {/* Header Info Banner */}
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <div className="relative shrink-0">
                  <HunterAvatarGraphic 
                    avatarType={currentAvatar.avatarType} 
                    imageSrc={currentAvatar.imageSrc} 
                    avatarRankNumber={currentAvatar.avatarRankNumber}
                    size={48} 
                    className="rounded-xl border border-cyan/40 shadow-lg"
                    showRankBadge
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{user.fullName}</h4>
                    <span className="text-[10px] font-mono text-gold font-bold">#{currentAvatar.avatarRankNumber || 10}</span>
                  </div>
                  <p className="text-xs text-cyan truncate font-mono font-semibold">{currentAvatar.name} ({currentAvatar.rank})</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan/15 text-cyan border border-cyan/30">
                      <Award className="w-3 h-3 text-gold" />
                      Lv. {currentLevel} • {currentRank} Hunter
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Fitness Stats Summary */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-surface/60 border border-border/40 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> Streak
                  </span>
                  <span className="text-xs font-bold text-text-primary mt-0.5 font-mono">{user.streakDays || 0} Days</span>
                </div>
                <div className="flex flex-col items-center border-x border-border/40 px-1">
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-400" /> Level
                  </span>
                  <span className="text-xs font-bold text-cyan mt-0.5 font-mono">LVL {currentLevel}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Status
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">Active</span>
                </div>
              </div>


              {/* Navigation Options */}
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate('/')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-container hover:text-primary transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-surface-container text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <Home className="w-4 h-4" />
                  </div>
                  <span>Home Page (Intro)</span>
                </button>

                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-container hover:text-primary transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-surface-container text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => handleNavigate('/progress')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-container hover:text-primary transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-surface-container text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <LineChart className="w-4 h-4" />
                  </div>
                  <span>Analytics & Progress</span>
                </button>

                <button
                  onClick={() => handleNavigate('/ai-coach')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-container hover:text-primary transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-surface-container text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <span className="flex-1">AI Coach Workspace</span>
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                </button>

                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-primary hover:bg-surface-container hover:text-primary transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-surface-container text-text-secondary group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span>Settings & Preferences</span>
                </button>
              </div>

              {/* Background Theme Selector */}
              <div className="pt-2.5 mt-2 border-t border-border/50">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" /> Background Vibe
                  </span>
                  <span className="text-[9px] text-primary/80 font-mono capitalize">{bgTheme}</span>
                </p>
                <div className="grid grid-cols-3 gap-1 bg-surface-container/60 p-1 rounded-xl border border-border/60">
                  <button
                    onClick={() => changeBgTheme('kinetic')}
                    className={`py-1 px-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                      bgTheme === 'kinetic'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Kinetic
                  </button>
                  <button
                    onClick={() => changeBgTheme('studio')}
                    className={`py-1 px-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                      bgTheme === 'studio'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Studio
                  </button>
                  <button
                    onClick={() => changeBgTheme('stealth')}
                    className={`py-1 px-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                      bgTheme === 'stealth'
                        ? 'bg-primary text-background font-bold shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Stealth
                  </button>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="pt-2 mt-2 border-t border-border/50">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-all font-medium group text-left"
                >
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

