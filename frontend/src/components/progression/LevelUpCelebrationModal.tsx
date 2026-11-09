import React from 'react';
import { Sparkles, Zap, CheckCircle2, X, Award, Shield, ArrowRight } from 'lucide-react';
import { HunterAvatar, LevelRewardMilestone, HunterRank } from '../../types/progression';
import { HunterAvatarGraphic } from '../ui/HunterAvatars';
import { HunterLevelCrest } from '../ui/HunterBadges';

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  rank: HunterRank;
  reward?: LevelRewardMilestone;
  onEquipAvatar?: (avatarId: string) => void;
  onOpenArmory?: () => void;
}

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  rank,
  reward,
  onEquipAvatar,
  onOpenArmory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl animate-fade-in">
      {/* Shockwave Glow Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-electric-blue/30 via-cyan/20 to-secondary/30 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative glass-card-elevated rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cyan/50 shadow-[0_0_50px_rgba(34,211,238,0.35)] space-y-6 text-center z-10 overflow-hidden bg-navy/95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-soft-white hover:bg-navy-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Level Up Top Badge */}
        <div className="flex flex-col items-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/15 border border-cyan/40 text-xs font-mono font-bold text-cyan uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span>LEVEL ASCENSION COMPLETE</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-display font-extrabold text-soft-white tracking-tight leading-none mt-2">
            LEVEL <span className="text-gradient-cyan-violet">{newLevel}</span>
          </h2>

          <div className="flex items-center gap-2 mt-1">
            <HunterLevelCrest size={24} />
            <span className="text-sm font-mono text-cyan font-bold">{rank}</span>
          </div>
        </div>

        {/* Centerpiece: Unlocked Avatar / Reward Showcase */}
        {reward && (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-navy-elevated to-background border border-cyan/30 space-y-4 relative overflow-hidden">
            <div className="text-[10px] font-mono tracking-wider text-text-muted uppercase font-bold">
              NEW REWARD UNLOCKED
            </div>

            {/* Avatar Visual if available */}
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-navy border border-cyan/50 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
                <HunterAvatarGraphic 
                  avatarType={
                    reward.avatar?.avatarType || 
                    (newLevel >= 60 ? 'sung_jinwoo' : newLevel >= 55 ? 'antares' : newLevel >= 50 ? 'ashborn' : newLevel >= 42 ? 'the_rulers' : newLevel >= 35 ? 'absolute_being' : 'bellion')
                  } 
                  imageSrc={reward.avatar?.imageSrc}
                  avatarRankNumber={reward.avatar?.avatarRankNumber}
                  size={84} 
                  showRankBadge
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-display font-bold text-soft-white">
                {reward.rewardName}
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
                {reward.perkDescription || 'New cosmetic ascension tier added to your Hunter Armory.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
          {reward?.avatar && onEquipAvatar ? (
            <button
              onClick={() => {
                onEquipAvatar(reward.avatar!.id);
                onClose();
              }}
              className="w-full sm:w-auto btn-hunter-primary px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>EQUIP AVATAR NOW</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full sm:w-auto btn-hunter-primary px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>CLAIM REWARD</span>
            </button>
          )}

          {onOpenArmory && (
            <button
              onClick={() => {
                onClose();
                onOpenArmory();
              }}
              className="w-full sm:w-auto btn-hunter-secondary px-5 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <span>HUNTER ARMORY</span>
              <ArrowRight className="w-4 h-4 text-cyan" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

