import React from 'react';

interface BadgeProps {
  className?: string;
  size?: number;
}

/** Original FitMentor AI Hunter Shield Emblem */
export const FitMentorShieldEmblem: React.FC<BadgeProps> = ({ className = '', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] ${className}`}
  >
    <path
      d="M24 4L7 11V22C7 32.5 14.3 42.2 24 45C33.7 42.2 41 32.5 41 22V11L24 4Z"
      fill="url(#emblem_bg_grad)"
      stroke="url(#emblem_stroke_grad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 10L14 15V22.5C14 29.5 18.2 36 24 38.5C29.8 36 34 29.5 34 22.5V15L24 10Z"
      fill="url(#emblem_inner_grad)"
      stroke="#22D3EE"
      strokeWidth="1.5"
    />
    <path
      d="M24 14V34M17 21L24 16L31 21M19 28L24 24L29 28"
      stroke="#F1F5FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="emblem_bg_grad" x1="24" y1="4" x2="24" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0B1730" />
        <stop offset="1" stopColor="#050912" />
      </linearGradient>
      <linearGradient id="emblem_stroke_grad" x1="7" y1="4" x2="41" y2="45" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="emblem_inner_grad" x1="24" y1="10" x2="24" y2="38.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" stopOpacity="0.8" />
        <stop offset="1" stopColor="#081225" stopOpacity="0.9" />
      </linearGradient>
    </defs>
  </svg>
);

/** Level Hunter Crest (Diamond Faceted Crest) */
export const HunterLevelCrest: React.FC<BadgeProps> = ({ className = '', size = 38 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] ${className}`}
  >
    <polygon
      points="20,2 38,12 32,34 20,38 8,34 2,12"
      fill="url(#crest_outer_grad)"
      stroke="url(#crest_stroke_grad)"
      strokeWidth="1.8"
    />
    <polygon
      points="20,7 33,15 28,31 20,34 12,31 7,15"
      fill="url(#crest_inner_grad)"
      stroke="#38BDF8"
      strokeWidth="1.2"
    />
    <path
      d="M20 12L24 18L20 28L16 18L20 12Z"
      fill="url(#crest_core_grad)"
      stroke="#F1F5FF"
      strokeWidth="1.2"
    />
    <defs>
      <linearGradient id="crest_outer_grad" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E293B" />
        <stop offset="1" stopColor="#0B132B" />
      </linearGradient>
      <linearGradient id="crest_stroke_grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE" />
        <stop offset="0.5" stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="crest_inner_grad" x1="20" y1="7" x2="20" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1D4ED8" stopOpacity="0.7" />
        <stop offset="1" stopColor="#0F172A" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="crest_core_grad" x1="20" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#818CF8" />
      </linearGradient>
    </defs>
  </svg>
);

/** Blue Shield Achievement Badge */
export const ShieldAchievementBadge: React.FC<BadgeProps> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_0_10px_rgba(59,130,246,0.4)] ${className}`}
  >
    <path
      d="M18 3L6 8.5V17C6 24.8 11.1 32 18 34C24.9 32 30 24.8 30 17V8.5L18 3Z"
      fill="#0B1730"
      stroke="#3B82F6"
      strokeWidth="1.6"
    />
    <path
      d="M13 18L16.5 21.5L23.5 14.5"
      stroke="#22D3EE"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Violet Week Warrior Crest */
export const WarriorCrestBadge: React.FC<BadgeProps> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_0_10px_rgba(139,92,246,0.4)] ${className}`}
  >
    <polygon
      points="18,2 23,12 34,13 25,21 28,32 18,26 8,32 11,21 2,13 13,12"
      fill="#1A103C"
      stroke="#8B5CF6"
      strokeWidth="1.6"
    />
    <polygon
      points="18,9 21,15 28,15 22,20 24,27 18,23 12,27 14,20 8,15 15,15"
      fill="#4C1D95"
      stroke="#A78BFA"
      strokeWidth="1.2"
    />
  </svg>
);

/** Gold Strength Gain Badge */
export const GoldStrengthBadge: React.FC<BadgeProps> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_0_10px_rgba(212,175,106,0.4)] ${className}`}
  >
    <polygon
      points="18,3 31,10.5 31,25.5 18,33 5,25.5 5,10.5"
      fill="#291F08"
      stroke="#D4AF6A"
      strokeWidth="1.6"
    />
    <path
      d="M13 20L18 14L23 20M18 15V24"
      stroke="#FDE68A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Shadow Athlete Dark Violet Crest */
export const ShadowAthleteBadge: React.FC<BadgeProps> = ({ className = '', size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`drop-shadow-[0_0_12px_rgba(139,92,246,0.5)] ${className}`}
  >
    <path
      d="M18 2L5 8V18C5 26.5 10.6 32.5 18 35C25.4 32.5 31 26.5 31 18V8L18 2Z"
      fill="#0F0926"
      stroke="#8B5CF6"
      strokeWidth="1.6"
    />
    <path
      d="M18 8L22 14L28 16L23 21L24 27L18 23L12 27L13 21L8 16L14 14L18 8Z"
      fill="#3B1768"
      stroke="#C084FC"
      strokeWidth="1.2"
    />
    <circle cx="18" cy="18" r="2.5" fill="#22D3EE" />
  </svg>
);

/** Quest Gold Goblet / Trophy Icon */
export const GoldGobletIcon: React.FC<BadgeProps> = ({ className = '', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 text-gold drop-shadow-[0_0_8px_rgba(212,175,106,0.5)] ${className}`}
  >
    <path
      d="M6 3H18V9C18 12.3 15.3 15 12 15C8.7 15 6 12.3 6 9V3Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15V19M8 21H16M6 6H3C3 7.7 4.3 9 6 9M18 6H21C21 7.7 19.7 9 18 9"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

