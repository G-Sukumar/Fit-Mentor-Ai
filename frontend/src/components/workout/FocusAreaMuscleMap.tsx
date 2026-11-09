/**
 * FitMentor AI — Focus Area Muscle Map
 *
 * Simplified SVG human silhouette that highlights primary (cyan) and
 * secondary (violet) muscle regions based on the bodyRegion field.
 *
 * Body region routing:
 *   chest      → pectoralis polygon (front torso upper)
 *   back       → posterior torso polygon
 *   shoulder   → deltoid ellipses (left + right)
 *   arm        → bicep / tricep cylinders
 *   forearm    → forearm rectangles
 *   core       → abdominal / oblique polygon
 *   leg        → quad / hamstring polygons
 *   glute      → glute polygon (rear)
 */

import React from 'react';
import { ExerciseMuscle } from '../../data/exerciseMetadataRegistry';

interface FocusAreaMuscleMapProps {
  primaryMuscles: ExerciseMuscle[];
  secondaryMuscles: ExerciseMuscle[];
  className?: string;
}

// Colour constants from the Kinetic Horizon theme
const PRIMARY_FILL   = 'rgba(34, 211, 238, 0.35)';
const PRIMARY_STROKE = '#22d3ee';
const SECONDARY_FILL   = 'rgba(139, 92, 246, 0.25)';
const SECONDARY_STROKE = '#8b5cf6';
const BODY_FILL    = 'rgba(15, 23, 42, 0.85)';
const BODY_STROKE  = 'rgba(38, 50, 68, 0.9)';

// SVG viewBox: 0 0 120 240  (120 wide × 240 tall)
// All coordinates are proportional to that viewBox.

type RegionKey =
  | 'chest' | 'back' | 'shoulder' | 'arm' | 'forearm'
  | 'core' | 'leg' | 'glute';

// Region polygons/shapes — each returns an SVG element
const REGION_SHAPES: Record<RegionKey, { front: boolean; d: string }[]> = {
  // ── Chest (front upper torso) ────────────────────────────────────
  chest: [
    { front: true, d: 'M 44 72 L 76 72 L 78 95 L 42 95 Z' },
  ],
  // ── Core / Abs (front lower torso) ──────────────────────────────
  core: [
    { front: true,  d: 'M 44 95 L 76 95 L 74 122 L 46 122 Z' },
  ],
  // ── Back (posterior torso) ───────────────────────────────────────
  back: [
    { front: false, d: 'M 44 72 L 76 72 L 78 115 L 42 115 Z' },
  ],
  // ── Shoulders (bilateral) ───────────────────────────────────────
  shoulder: [
    { front: true, d: 'M 35 72 L 44 72 L 44 88 L 35 84 Z' }, // left
    { front: true, d: 'M 76 72 L 85 72 L 85 84 L 76 88 Z' }, // right
  ],
  // ── Upper arms (biceps/triceps) ─────────────────────────────────
  arm: [
    { front: true, d: 'M 31 86 L 38 84 L 40 108 L 33 110 Z' }, // left
    { front: true, d: 'M 82 84 L 89 86 L 87 110 L 80 108 Z' }, // right
  ],
  // ── Forearms ───────────────────────────────────────────────────
  forearm: [
    { front: true, d: 'M 29 110 L 36 109 L 37 128 L 30 128 Z' }, // left
    { front: true, d: 'M 84 109 L 91 110 L 90 128 L 83 128 Z' }, // right
  ],
  // ── Quadriceps / Hamstrings ─────────────────────────────────────
  leg: [
    { front: true, d: 'M 46 125 L 59 125 L 57 170 L 44 170 Z' }, // left quad
    { front: true, d: 'M 61 125 L 74 125 L 76 170 L 63 170 Z' }, // right quad
  ],
  // ── Glutes ─────────────────────────────────────────────────────
  glute: [
    { front: false, d: 'M 44 120 L 76 120 L 78 145 L 42 145 Z' },
  ],
};

// Build a set of region keys that are active for primary / secondary
function buildActiveRegions(muscles: ExerciseMuscle[]): Set<RegionKey> {
  const regions = new Set<RegionKey>();
  muscles.forEach((m) => {
    if (m.bodyRegion in REGION_SHAPES) {
      regions.add(m.bodyRegion as RegionKey);
    }
  });
  return regions;
}

// ─── Base body silhouette paths ──────────────────────────────────────────────

// FRONT SILHOUETTE
const FRONT_BODY_PATHS = [
  // Head
  'M 60 28 m -13 0 a 13 13 0 1 0 26 0 a 13 13 0 1 0 -26 0',
  // Neck
  'M 54 41 L 66 41 L 68 52 L 52 52 Z',
  // Upper torso (shoulders + chest)
  'M 34 52 L 86 52 L 90 125 L 30 125 Z',
  // Lower torso / hips
  'M 42 122 L 78 122 L 80 140 L 40 140 Z',
  // Left leg
  'M 40 138 L 59 138 L 57 210 L 38 210 Z',
  // Right leg
  'M 61 138 L 80 138 L 82 210 L 63 210 Z',
  // Left upper arm
  'M 29 52 L 38 52 L 42 105 L 33 107 Z',
  // Right upper arm
  'M 91 52 L 82 52 L 78 105 L 87 107 Z',
  // Left forearm
  'M 27 107 L 36 106 L 38 130 L 29 130 Z',
  // Right forearm
  'M 93 107 L 84 106 L 82 130 L 91 130 Z',
  // Left hand
  'M 25 130 L 36 130 L 37 140 L 24 140 Z',
  // Right hand
  'M 95 130 L 84 130 L 83 140 L 96 140 Z',
  // Left foot
  'M 36 210 L 57 210 L 57 218 L 34 218 Z',
  // Right foot
  'M 63 210 L 84 210 L 86 218 L 63 218 Z',
];

// REAR SILHOUETTE (mirrored, same paths — labels flipped)
const REAR_BODY_PATHS = FRONT_BODY_PATHS; // reuse same outline for simplicity

// ─── SVG Renderer ────────────────────────────────────────────────────────────

interface SilhouetteProps {
  primaryRegions: Set<RegionKey>;
  secondaryRegions: Set<RegionKey>;
  isFront: boolean;
  label: string;
}

const Silhouette: React.FC<SilhouetteProps> = ({
  primaryRegions, secondaryRegions, isFront, label,
}) => {
  // Determine which shapes to render based on front/rear perspective
  const allShapes = Object.entries(REGION_SHAPES) as [RegionKey, { front: boolean; d: string }[]][];

  const primaryShapes = allShapes.flatMap(([region, shapes]) =>
    primaryRegions.has(region)
      ? shapes.filter((s) => s.front === isFront)
      : []
  );

  const secondaryShapes = allShapes.flatMap(([region, shapes]) =>
    secondaryRegions.has(region)
      ? shapes.filter((s) => s.front === isFront)
      : []
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 120 230"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label={`${label} muscle map`}
      >
        <defs>
          {/* Glow filter for primary */}
          <filter id="glow-primary" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Glow filter for secondary */}
          <filter id="glow-secondary" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base body silhouette */}
        {(isFront ? FRONT_BODY_PATHS : REAR_BODY_PATHS).map((d, i) => (
          <path
            key={i}
            d={d}
            fill={BODY_FILL}
            stroke={BODY_STROKE}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
        ))}

        {/* Secondary muscle highlights (rendered first / under primary) */}
        {secondaryShapes.map((shape, i) => (
          <path
            key={`sec-${i}`}
            d={shape.d}
            fill={SECONDARY_FILL}
            stroke={SECONDARY_STROKE}
            strokeWidth={1.2}
            strokeLinejoin="round"
            filter="url(#glow-secondary)"
            className="transition-all duration-300"
          />
        ))}

        {/* Primary muscle highlights (rendered on top) */}
        {primaryShapes.map((shape, i) => (
          <path
            key={`pri-${i}`}
            d={shape.d}
            fill={PRIMARY_FILL}
            stroke={PRIMARY_STROKE}
            strokeWidth={1.5}
            strokeLinejoin="round"
            filter="url(#glow-primary)"
            className="transition-all duration-300"
          />
        ))}

        {/* View label at bottom */}
        <text
          x="60"
          y="226"
          textAnchor="middle"
          fontSize="6"
          fontFamily="monospace"
          fill="rgba(148, 163, 184, 0.6)"
          letterSpacing="1"
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

// ─── Public Component ─────────────────────────────────────────────────────────

export const FocusAreaMuscleMap: React.FC<FocusAreaMuscleMapProps> = ({
  primaryMuscles,
  secondaryMuscles,
  className = '',
}) => {
  const primaryRegions   = buildActiveRegions(primaryMuscles);
  const secondaryRegions = buildActiveRegions(secondaryMuscles);

  // Determine if we need front + rear views
  const hasFront =
    [...primaryRegions, ...secondaryRegions].some(
      (r) => ['chest', 'core', 'shoulder', 'arm', 'forearm', 'leg'].includes(r)
    );
  const hasRear =
    [...primaryRegions, ...secondaryRegions].some(
      (r) => ['back', 'glute'].includes(r)
    );

  // Render dual views when both sides are active
  const showDual = hasFront && hasRear;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Silhouette views */}
      <div
        className={`grid gap-3 ${showDual ? 'grid-cols-2' : 'grid-cols-1'}`}
        style={{ maxHeight: 200 }}
      >
        {(hasFront || !hasRear) && (
          <div className="bg-surface-container/50 rounded-xl border border-border/60 p-2 flex items-center justify-center" style={{ maxHeight: 200 }}>
            <Silhouette
              primaryRegions={primaryRegions}
              secondaryRegions={secondaryRegions}
              isFront={true}
              label="Front"
            />
          </div>
        )}
        {hasRear && (
          <div className="bg-surface-container/50 rounded-xl border border-border/60 p-2 flex items-center justify-center" style={{ maxHeight: 200 }}>
            <Silhouette
              primaryRegions={primaryRegions}
              secondaryRegions={secondaryRegions}
              isFront={false}
              label="Rear"
            />
          </div>
        )}
      </div>

      {/* Colour legend */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm border"
            style={{ background: PRIMARY_FILL, borderColor: PRIMARY_STROKE, boxShadow: `0 0 6px ${PRIMARY_STROKE}` }}
          />
          <span className="text-primary font-semibold">Primary</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm border"
            style={{ background: SECONDARY_FILL, borderColor: SECONDARY_STROKE }}
          />
          <span className="text-secondary">Secondary</span>
        </div>
      </div>

      {/* Muscle name lists */}
      <div className="space-y-1.5">
        {primaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {primaryMuscles.map((m) => (
              <span
                key={m.name}
                className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/40 text-primary text-[10px] font-mono font-semibold"
                style={{ boxShadow: '0 0 6px rgba(34,211,238,0.2)' }}
              >
                {m.name}
              </span>
            ))}
          </div>
        )}
        {secondaryMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {secondaryMuscles.map((m) => (
              <span
                key={m.name}
                className="px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/40 text-secondary text-[10px] font-mono"
              >
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
