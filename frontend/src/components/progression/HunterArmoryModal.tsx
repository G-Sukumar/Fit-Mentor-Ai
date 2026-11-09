import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Sparkles, 
  Award, 
  Zap, 
  CheckCircle2, 
  Lock, 
  Crown, 
  Flame, 
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { ProgressionProfile, HunterAvatar, AuraFrame, HunterTitle } from '../../types/progression';
import { HunterAvatarGraphic, EquippedAvatarBadge } from '../ui/HunterAvatars';
import { HunterLevelCrest } from '../ui/HunterBadges';

interface HunterArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  progression: ProgressionProfile;
  onEquipAvatar: (avatarId: string) => void;
  onEquipAura: (auraId: string) => void;
  onEquipTitle: (titleId: string) => void;
  onSimulateLevelUp: () => void;
}

export const HunterArmoryModal: React.FC<HunterArmoryModalProps> = ({
  isOpen,
  onClose,
  progression,
  onEquipAvatar,
  onEquipAura,
  onEquipTitle,
  onSimulateLevelUp
}) => {
  const [activeTab, setActiveTab] = useState<'avatars' | 'auras' | 'titles' | 'roadmap'>('avatars');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative glass-card-elevated rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-border/80 shadow-[0_0_40px_rgba(0,0,0,0.8)] space-y-6 bg-navy/95 max-h-[90vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-4">
            <EquippedAvatarBadge 
              avatar={progression.equippedAvatar} 
              aura={progression.equippedAura} 
              size={56} 
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-cyan uppercase font-bold px-2 py-0.5 rounded bg-cyan/15 border border-cyan/30">
                  HUNTER ARMORY & WARDROBE
                </span>
                <span className="text-xs font-mono text-gold font-bold">
                  Lv. {progression.level} • {progression.hunterRank}
                </span>
              </div>
              <h2 className="text-2xl font-display font-bold text-soft-white mt-1">
                {progression.equippedAvatar.name}
              </h2>
              <p className="text-xs text-text-secondary font-mono">
                Active Title: <span className="text-cyan font-semibold">"{progression.equippedTitle.title}"</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Instant Test Ascension Button */}
            <button
              onClick={onSimulateLevelUp}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-electric-blue/20 to-secondary/20 hover:from-electric-blue/30 hover:to-secondary/30 border border-cyan/30 text-cyan text-xs font-mono font-bold transition-all"
              title="Add 1,000 XP to level up immediately and earn your next reward"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Level Up (+1,000 XP)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-soft-white hover:bg-navy-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('avatars')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'avatars'
                ? 'bg-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-text-secondary hover:text-soft-white hover:bg-navy-elevated'
            }`}
          >
            <span>Hunter Avatars ({progression.allAvatars.filter(a => a.isUnlocked).length}/{progression.allAvatars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('auras')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'auras'
                ? 'bg-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-text-secondary hover:text-soft-white hover:bg-navy-elevated'
            }`}
          >
            <span>Aura Frames ({progression.allAuras.filter(a => a.isUnlocked).length}/{progression.allAuras.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('titles')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'titles'
                ? 'bg-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-text-secondary hover:text-soft-white hover:bg-navy-elevated'
            }`}
          >
            <span>Titles ({progression.allTitles.filter(t => t.isUnlocked).length}/{progression.allTitles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                : 'text-text-secondary hover:text-soft-white hover:bg-navy-elevated'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Ascension Roadmap</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: AVATARS */}
          {activeTab === 'avatars' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {progression.allAvatars.map((avatar) => {
                const isEquipped = avatar.id === progression.equippedAvatar.id;

                return (
                  <div
                    key={avatar.id}
                    className={`glass-card p-4 rounded-2xl flex flex-col justify-between space-y-3.5 border transition-all ${
                      isEquipped
                        ? 'border-cyan bg-cyan/10 shadow-[0_0_25px_rgba(34,211,238,0.3)] ring-1 ring-cyan/60'
                        : avatar.isUnlocked
                        ? 'border-border hover:border-cyan/40 bg-navy-elevated/70'
                        : 'border-border/40 opacity-55 bg-navy/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar Portrait with Rank # */}
                      <div className="relative shrink-0">
                        <HunterAvatarGraphic 
                          avatarType={avatar.avatarType} 
                          imageSrc={avatar.imageSrc}
                          avatarRankNumber={avatar.avatarRankNumber}
                          size={64} 
                          className="rounded-2xl border border-cyan/30 shadow-md"
                        />
                        <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 bg-background/95 text-gold border border-gold/50 rounded-md text-[10px] font-mono font-black shadow-md">
                          #{avatar.avatarRankNumber || 1}
                        </span>
                      </div>

                      {/* Info & Crest */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono text-cyan font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan/15 border border-cyan/30">
                            {avatar.rank}
                          </span>
                          <span className="text-[10px] font-mono text-text-muted">
                            Req. Lv. {avatar.requiredLevel}
                          </span>
                        </div>
                        <h4 className="text-base font-display font-extrabold text-soft-white truncate mt-1">
                          {avatar.name}
                        </h4>
                        <p className="text-xs text-text-secondary leading-snug line-clamp-1">
                          {avatar.tagline}
                        </p>
                      </div>

                      {/* Crest Emblem on Card if available */}
                      {avatar.crestSrc && (
                        <div className="w-10 h-10 rounded-xl bg-navy/80 border border-border/60 p-1 flex items-center justify-center shrink-0">
                          <img src={avatar.crestSrc} alt="crest" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-text-muted italic bg-navy/60 p-2.5 rounded-xl border border-border/40 leading-relaxed">
                      "{avatar.lore}"
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                      {avatar.isUnlocked ? (
                        isEquipped ? (
                          <div className="w-full py-2 rounded-xl bg-cyan/20 border border-cyan/50 text-cyan text-xs font-mono font-bold flex items-center justify-center gap-1.5">
                            <UserCheck className="w-4 h-4" /> CURRENTLY EQUIPPED
                          </div>
                        ) : (
                          <button
                            onClick={() => onEquipAvatar(avatar.id)}
                            className="w-full py-2.5 rounded-xl btn-hunter-primary font-mono text-xs font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                          >
                            EQUIP AVATAR
                          </button>
                        )
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl bg-navy/40 border border-border/30 flex items-center justify-between text-xs font-mono text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-text-muted" /> Locked
                          </span>
                          <span>Unlocks in {Math.max(1, avatar.requiredLevel - progression.level)} Levels</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: AURAS & FRAMES */}
          {activeTab === 'auras' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progression.allAuras.map((aura) => {
                const isEquipped = aura.id === progression.equippedAura.id;

                return (
                  <div
                    key={aura.id}
                    className={`glass-card p-5 rounded-2xl flex items-center justify-between gap-4 border transition-all ${
                      isEquipped
                        ? 'border-cyan bg-cyan/10 shadow-cyan-glow'
                        : aura.isUnlocked
                        ? 'border-border hover:border-cyan/40 bg-navy-elevated/70'
                        : 'border-border/40 opacity-55 bg-navy/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Aura Frame Preview */}
                      <div className={`p-1 rounded-2xl border ${aura.borderClass} ${aura.glowClass} shrink-0`}>
                        <HunterAvatarGraphic avatarType={progression.equippedAvatar.avatarType} size={46} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-display font-bold text-soft-white">{aura.name}</h4>
                          <span className="text-[10px] font-mono text-text-muted">Lv. {aura.requiredLevel}+</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{aura.description}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {aura.isUnlocked ? (
                        isEquipped ? (
                          <span className="text-xs font-mono text-cyan font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <button
                            onClick={() => onEquipAura(aura.id)}
                            className="px-4 py-2 rounded-xl btn-hunter-secondary text-xs font-mono font-bold uppercase"
                          >
                            Equip
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-mono text-text-muted flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Lv. {aura.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: TITLES */}
          {activeTab === 'titles' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {progression.allTitles.map((title) => {
                const isEquipped = title.id === progression.equippedTitle.id;

                return (
                  <div
                    key={title.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isEquipped
                        ? 'border-cyan bg-cyan/15 text-soft-white'
                        : title.isUnlocked
                        ? 'border-border bg-navy-elevated/70 hover:border-cyan/30'
                        : 'border-border/40 opacity-50 bg-navy/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className={`w-4 h-4 ${isEquipped ? 'text-cyan' : 'text-gold'}`} />
                      <div>
                        <p className="text-xs font-display font-bold text-soft-white">"{title.title}"</p>
                        <span className="text-[10px] font-mono text-text-muted">{title.category} • Lv. {title.requiredLevel}</span>
                      </div>
                    </div>

                    <div>
                      {title.isUnlocked ? (
                        isEquipped ? (
                          <span className="text-[10px] font-mono text-cyan font-bold uppercase">Equipped</span>
                        ) : (
                          <button
                            onClick={() => onEquipTitle(title.id)}
                            className="px-3 py-1 rounded-lg bg-navy hover:bg-cyan hover:text-background text-cyan text-xs font-mono border border-cyan/30 transition-colors"
                          >
                            Equip
                          </button>
                        )
                      ) : (
                        <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Lv. {title.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: ASCENSION ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary leading-relaxed">
                Every level gained rewards you with permanent prestige cosmetics, avatars, aura frames, and training perks.
              </p>

              <div className="space-y-2.5 pt-2">
                {progression.availableRewards.map((milestone) => {
                  const isReached = progression.level >= milestone.level;

                  return (
                    <div
                      key={milestone.level}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isReached
                          ? 'border-cyan/40 bg-navy/90'
                          : 'border-border/40 opacity-60 bg-navy/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs shrink-0 border ${
                          isReached ? 'bg-cyan/20 border-cyan text-cyan' : 'bg-navy border-border text-text-muted'
                        }`}>
                          {milestone.level}
                        </div>
                        <div>
                          <h4 className="text-xs font-display font-bold text-soft-white">{milestone.rewardName}</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5">{milestone.perkDescription}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isReached ? (
                          <span className="text-[11px] font-mono text-cyan font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> In {milestone.level - progression.level} lvls
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

