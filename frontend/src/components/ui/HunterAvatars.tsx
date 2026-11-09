import React, { useState } from 'react';
import { HunterAvatar, AuraFrame } from '../../types/progression';

interface AvatarIconProps {
  avatarType?: string;
  imageSrc?: string;
  avatarRankNumber?: number;
  size?: number;
  className?: string;
  showRankBadge?: boolean;
}

export const AVATAR_IMAGE_MAP: Record<string, string> = {
  kamish: '/avatars/rank_10_kamish_avatar.png',
  sung_il_hwan: '/avatars/rank_9_sung_il_hwan_avatar.png',
  baran: '/avatars/rank_8_baran_avatar.png',
  rakan: '/avatars/rank_7_rakan_avatar.png',
  bellion: '/avatars/rank_6_bellion_avatar.png',
  absolute_being: '/avatars/rank_5_absolute_being_avatar.png',
  the_rulers: '/avatars/rank_4_the_rulers_avatar.png',
  ashborn: '/avatars/rank_3_ashborn_avatar.png',
  antares: '/avatars/rank_2_antares_avatar.png',
  sung_jinwoo: '/avatars/rank_1_sung_jinwoo_avatar.png',
  // Backward-compatibility aliases
  novice: '/avatars/rank_10_kamish_avatar.png',
  vanguard: '/avatars/rank_9_sung_il_hwan_avatar.png',
  phantom: '/avatars/rank_8_baran_avatar.png',
  slayer: '/avatars/rank_7_rakan_avatar.png',
  striker: '/avatars/rank_6_bellion_avatar.png',
  athlete: '/avatars/rank_6_bellion_avatar.png',
  titan: '/avatars/rank_5_absolute_being_avatar.png',
  blademaster: '/avatars/rank_4_the_rulers_avatar.png',
  sovereign: '/avatars/rank_2_antares_avatar.png',
  monarch: '/avatars/rank_1_sung_jinwoo_avatar.png',
};

export const AVATAR_BANNER_MAP: Record<string, string> = {
  kamish: '/avatars/rank_10_kamish_banner.png',
  sung_il_hwan: '/avatars/rank_9_sung_il_hwan_banner.png',
  baran: '/avatars/rank_8_baran_banner.png',
  rakan: '/avatars/rank_7_rakan_banner.png',
  bellion: '/avatars/rank_6_bellion_banner.png',
  absolute_being: '/avatars/rank_5_absolute_being_banner.png',
  the_rulers: '/avatars/rank_4_the_rulers_banner.png',
  ashborn: '/avatars/rank_3_ashborn_banner.png',
  antares: '/avatars/rank_2_antares_banner.png',
  sung_jinwoo: '/avatars/rank_1_sung_jinwoo_banner.png',
};

export const AVATAR_CREST_MAP: Record<string, string> = {
  kamish: '/avatars/rank_10_kamish_crest.png',
  sung_il_hwan: '/avatars/rank_9_sung_il_hwan_crest.png',
  baran: '/avatars/rank_8_baran_crest.png',
  rakan: '/avatars/rank_7_rakan_crest.png',
  bellion: '/avatars/rank_6_bellion_crest.png',
  absolute_being: '/avatars/rank_5_absolute_being_crest.png',
  the_rulers: '/avatars/rank_4_the_rulers_crest.png',
  ashborn: '/avatars/rank_3_ashborn_crest.png',
  antares: '/avatars/rank_2_antares_crest.png',
  sung_jinwoo: '/avatars/rank_1_sung_jinwoo_crest.png',
};

export const HunterAvatarGraphic: React.FC<AvatarIconProps> = ({ 
  avatarType = 'bellion', 
  imageSrc,
  avatarRankNumber,
  size = 48, 
  className = '',
  showRankBadge = false
}) => {
  const [hasError, setHasError] = useState(false);
  const normalizedKey = avatarType.toLowerCase();
  const resolvedSrc = imageSrc || AVATAR_IMAGE_MAP[normalizedKey] || '/avatars/rank_6_bellion_avatar.png';

  if (!hasError && resolvedSrc) {
    return (
      <div 
        className={`relative overflow-hidden shrink-0 select-none bg-surface-dark border border-border/60 shadow-lg ${className}`}
        style={{ width: size, height: size, borderRadius: Math.max(8, Math.round(size * 0.22)) }}
      >
        <img 
          src={resolvedSrc} 
          alt={avatarType} 
          className="w-full h-full object-cover object-center transform transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
          loading="lazy"
        />
        {/* Subtle dark-fantasy inner rim light */}
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] ring-1 ring-inset ring-white/10" />

        {showRankBadge && avatarRankNumber && (
          <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-background/90 text-gold border border-gold/40 rounded text-[9px] font-mono font-extrabold shadow-sm">
            #{avatarRankNumber}
          </span>
        )}
      </div>
    );
  }

  // Graceful Dark-Fantasy Vector Graphic Fallback
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={`shrink-0 ${className}`}>
      <rect width="64" height="64" rx="14" fill="#081225" />
      <path d="M14 20L32 10L50 20V34C50 46 42 54 32 58C22 54 14 46 14 34V20Z" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <circle cx="32" cy="28" r="8" fill="#1E293B" stroke="#22D3EE" strokeWidth="1.5" />
      <path d="M26 44C26 38 29 36 32 36C35 36 38 38 38 44" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/** Full horizontal Solo Leveling style card banner */
export const HunterBannerCard: React.FC<{
  avatar: HunterAvatar;
  className?: string;
  onClick?: () => void;
}> = ({ avatar, className = '', onClick }) => {
  const normalizedKey = avatar.avatarType.toLowerCase();
  const bannerSrc = avatar.bannerSrc || AVATAR_BANNER_MAP[normalizedKey];

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-border/80 group cursor-pointer transition-all duration-300 hover:border-cyan/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] ${className}`}
      style={{ aspectRatio: '512/68' }}
    >
      {bannerSrc ? (
        <img 
          src={bannerSrc} 
          alt={avatar.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-surface-dark flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-2xl text-cyan">#{avatar.avatarRankNumber || 1}</span>
            <div>
              <h4 className="font-bold text-text-primary text-sm">{avatar.name}</h4>
              <p className="text-xs text-text-muted">{avatar.tagline}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan">{avatar.rank}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
    </div>
  );
};

/** Equipped Hunter Avatar with Aura Glow Frame & Rank Number */
export const EquippedAvatarBadge: React.FC<{
  avatar: HunterAvatar;
  aura: AuraFrame;
  size?: number;
  className?: string;
  onClick?: () => void;
}> = ({ avatar, aura, size = 48, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative inline-block rounded-2xl cursor-pointer group transition-all duration-300 ${aura?.glowClass || ''} ${className}`}
      title={`${avatar.name} (#${avatar.avatarRankNumber || 6} • ${avatar.rank}) • Click to open Hunter Armory`}
    >
      <div className={`rounded-2xl p-0.5 border ${aura?.borderClass || 'border-cyan/50'} transition-transform group-hover:scale-105`}>
        <HunterAvatarGraphic 
          avatarType={avatar.avatarType} 
          imageSrc={avatar.imageSrc}
          avatarRankNumber={avatar.avatarRankNumber}
          size={size} 
          className="rounded-[14px]" 
        />
      </div>

      {/* Rank Number Badge */}
      <span className="absolute -bottom-1 -right-1.5 px-1.5 py-0.2 bg-surface-dark text-cyan border border-cyan/60 rounded-full text-[10px] font-mono font-extrabold shadow-[0_0_8px_rgba(34,211,238,0.7)] flex items-center gap-0.5">
        #{avatar.avatarRankNumber || 6}
      </span>
    </div>
  );
};