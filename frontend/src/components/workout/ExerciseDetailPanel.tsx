/**
 * FitMentor AI — Exercise Detail Panel
 *
 * Full-screen overlay modal that shows:
 *   LEFT  → Animated 3D/2D exercise viewer (Exercise3DCanvas)
 *   RIGHT → Exercise metadata, muscles, prescription, instructions,
 *            technique cues, focus area muscle map
 *
 * Design language: Kinetic Horizon dark glassmorphism system
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  Dumbbell,
  Target,
  Clock,
  Layers,
  ChevronRight,
  Zap,
  Info,
  ListOrdered,
  Sparkles,
  BadgeCheck,
  Box,
  Image as ImageIcon,
} from 'lucide-react';
import { ExerciseMetadata, resolveExerciseMetadata, getRepDBImageUrls } from '../../data/exerciseMetadataRegistry';
import { getExercise3DConfig } from '../../config/exercise3DRegistry';
import { Exercise3DCanvas } from './Exercise3DViewer/Exercise3DCanvas';
import { FocusAreaMuscleMap } from './FocusAreaMuscleMap';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExerciseDetailPanelProps {
  /** Exercise ID — the panel resolves full metadata from registry */
  exerciseId: string;
  /** Optional name fallback when ID is not yet in the registry */
  exerciseName?: string;
  /** Whether the panel is visible */
  isOpen: boolean;
  /** Close / back callback */
  onClose: () => void;
  /**
   * Optional CTA — "Begin Exercise" / "Start Session" callback.
   * When provided, a prominent CTA button is shown.
   */
  onBeginExercise?: (exerciseId: string) => void;
}

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<string, { label: string; classes: string }> = {
  BEGINNER:     { label: 'Beginner',     classes: 'bg-success/10 border-success/40 text-success'  },
  INTERMEDIATE: { label: 'Intermediate', classes: 'bg-gold/10 border-gold/40 text-gold'          },
  ADVANCED:     { label: 'Advanced',     classes: 'bg-error/10 border-error/40 text-error'        },
};

// ─── Small Stat Pill ──────────────────────────────────────────────────────────

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}> = ({ icon, label, value, accent = 'text-primary' }) => (
  <div className="flex flex-col gap-0.5 bg-surface-elevated/60 border border-border/60 rounded-xl px-3 py-2.5 text-center min-w-0">
    <span className={`flex justify-center ${accent}`}>{icon}</span>
    <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">{label}</span>
    <span className={`text-sm font-display font-bold ${accent}`}>{value}</span>
  </div>
);

// ─── Section Heading ──────────────────────────────────────────────────────────

const SectionHeading: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-text-muted uppercase tracking-widest">
    <span className="text-primary">{icon}</span>
    {title}
    <span className="flex-1 h-px bg-border/50" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ExerciseDetailPanel: React.FC<ExerciseDetailPanelProps> = ({
  exerciseId,
  exerciseName,
  isOpen,
  onClose,
  onBeginExercise,
}) => {
  const [activeTab, setActiveTab] = useState<'instructions' | 'cues' | 'focus'>('instructions');
  const [viewerMode, setViewerMode] = useState<'REPDB_GESTURES' | '3D_MODEL'>('REPDB_GESTURES');
  const [gesturePose, setGesturePose] = useState<'start' | 'peak'>('start');

  if (!isOpen) return null;

  // Resolve metadata from registry (with graceful fallback)
  const meta: ExerciseMetadata = resolveExerciseMetadata(exerciseId, exerciseName);

  // Always resolve the 3D config — uses existing getExercise3DConfig helper
  // which already has name-based fallback logic
  const config3D = getExercise3DConfig(exerciseId, meta.displayName);

  const difficultyConfig = DIFFICULTY_CONFIG[meta.difficulty] || DIFFICULTY_CONFIG['BEGINNER'];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-xl animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label={`Exercise detail: ${meta.displayName}`}
    >
      <div className="w-full max-w-[1400px] h-[94vh] glass-card-elevated rounded-3xl border border-border flex flex-col overflow-hidden shadow-2xl">

        {/* ═══════════════════════════════════════════════════════
             TOP HEADER BAR
             ═══════════════════════════════════════════════════════ */}
        <div className="px-5 py-3.5 border-b border-border/50 bg-surface-container/70 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-primary uppercase font-semibold">
                  Exercise Demo
                </span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${difficultyConfig.classes}`}>
                  {difficultyConfig.label}
                </span>
                {meta.animationAvailable ? (
                  <span className="px-2 py-0.5 rounded border border-success/40 bg-success/10 text-success text-[10px] font-mono flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Animated
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded border border-border bg-surface-container text-text-muted text-[10px] font-mono">
                    Kinematic Demo
                  </span>
                )}
              </div>
              <h2 className="text-xl font-display font-bold text-text-primary tracking-tight truncate">
                {meta.displayName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-all shrink-0"
            aria-label="Close exercise detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════
             MAIN CONTENT — 2 columns: viewer | info
             ═══════════════════════════════════════════════════════ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">

          {/* ── LEFT / CENTER: Animated Viewer (7 cols) ────────── */}
          <div className="lg:col-span-7 flex flex-col h-full p-4 gap-3 overflow-hidden border-r border-border/40">
            {/* Visualizer Engine Selector Strip */}
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border text-xs font-mono">
                <button
                  onClick={() => setViewerMode('REPDB_GESTURES')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewerMode === 'REPDB_GESTURES'
                      ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>RepDB Gestures</span>
                </button>
                <button
                  onClick={() => setViewerMode('3D_MODEL')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                    viewerMode === '3D_MODEL'
                      ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Muscular Athlete</span>
                </button>
              </div>

              {viewerMode === 'REPDB_GESTURES' && (
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border text-xs font-mono">
                  <button
                    onClick={() => setGesturePose('start')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      gesturePose === 'start'
                        ? 'bg-primary text-background font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Start Pose
                  </button>
                  <button
                    onClick={() => setGesturePose('peak')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      gesturePose === 'peak'
                        ? 'bg-primary text-background font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Peak Contraction
                  </button>
                </div>
              )}
            </div>

            {/* Viewer Stage */}
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-border bg-surface-elevated/40 relative">
              {viewerMode === '3D_MODEL' ? (
                <Exercise3DCanvas key={config3D.exerciseId} config={config3D} defaultMode="3D_MODEL" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
                  <div className="flex-1 flex items-center justify-center max-h-[420px] w-full">
                    <img
                      src={
                        gesturePose === 'start'
                          ? meta.images?.start || getRepDBImageUrls(meta.slug).start
                          : meta.images?.peak || getRepDBImageUrls(meta.slug).peak
                      }
                      alt={`${meta.displayName} ${gesturePose} pose`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,211,238,0.2)] animate-fade-in"
                    />
                  </div>

                  <div className="w-full flex items-center justify-between text-[11px] font-mono text-text-muted mt-2 pt-2 border-t border-border/40">
                    <span className="text-primary font-semibold">
                      {gesturePose === 'start' ? '● Start Setup Pose' : '● Peak Muscle Contraction'}
                    </span>
                    <span>Official RepDB Dataset • {meta.slug}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category + Movement Type strip */}
            <div className="flex items-center gap-2 flex-wrap font-mono text-xs shrink-0">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold">
                {meta.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-elevated border border-border text-text-muted">
                {meta.movementType}
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-elevated border border-border text-text-muted">
                Tempo {meta.tempo.eccentric}-{meta.tempo.pause}-{meta.tempo.concentric}
              </span>
            </div>
          </div>

          {/* ── RIGHT: Info Panel (5 cols) ─────────────────────── */}
          <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 overscroll-contain">

              {/* ── Prescription Stats ───────────────────────── */}
              <div>
                <SectionHeading icon={<Zap className="w-3.5 h-3.5" />} title="Prescription" />
                <div className="grid grid-cols-4 gap-2 mt-3">
                  <StatPill
                    icon={<Layers className="w-3.5 h-3.5" />}
                    label="Sets"
                    value={String(meta.recommendedSets)}
                    accent="text-primary"
                  />
                  <StatPill
                    icon={<Target className="w-3.5 h-3.5" />}
                    label="Rep Range"
                    value={meta.repRange}
                    accent="text-secondary"
                  />
                  <StatPill
                    icon={<Clock className="w-3.5 h-3.5" />}
                    label="Rest"
                    value={`${meta.restSeconds}s`}
                    accent="text-gold"
                  />
                  <StatPill
                    icon={<Dumbbell className="w-3.5 h-3.5" />}
                    label="Equipment"
                    value={meta.equipment === 'FULL_GYM' ? 'Gym' : meta.equipment === 'DUMBBELLS' ? 'DBs' : 'BW'}
                    accent="text-text-secondary"
                  />
                </div>
                <p className="text-[11px] font-mono text-text-muted mt-2">
                  {meta.equipmentLabel}
                </p>
              </div>

              {/* ── Muscle Targets ───────────────────────────── */}
              <div>
                <SectionHeading icon={<Target className="w-3.5 h-3.5" />} title="Muscle Targets" />
                <div className="mt-3 space-y-2">
                  <div>
                    <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1.5">Primary</p>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.primaryMuscles.map((m) => (
                        <span
                          key={m.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/40 text-primary text-[11px] font-mono font-semibold"
                          style={{ boxShadow: '0 0 8px rgba(34,211,238,0.15)' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_#22d3ee]" />
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest mb-1.5">Secondary</p>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.secondaryMuscles.map((m) => (
                        <span
                          key={m.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/10 border border-secondary/40 text-secondary text-[11px] font-mono"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Tabs: Instructions / Cues / Focus Area ──── */}
              <div className="space-y-3">
                {/* Tab buttons */}
                <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-border font-mono text-xs">
                  {(
                    [
                      { key: 'instructions', label: 'How To Perform', icon: <ListOrdered className="w-3 h-3" /> },
                      { key: 'cues',         label: 'Technique Cues', icon: <BadgeCheck className="w-3 h-3" /> },
                      { key: 'focus',        label: 'Focus Area',     icon: <Layers className="w-3 h-3" />     },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                        activeTab === tab.key
                          ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                          : 'text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="animate-fade-in min-h-[160px]">

                  {/* Instructions tab */}
                  {activeTab === 'instructions' && (
                    <ol className="space-y-2.5">
                      {meta.instructions.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-xs font-sans text-text-secondary leading-relaxed"
                        >
                          <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/40 text-primary flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Technique Cues tab */}
                  {activeTab === 'cues' && (
                    <div className="space-y-2.5">
                      {meta.formCues.map((cue, i) => (
                        <div
                          key={i}
                          className="flex gap-3 p-3 rounded-xl bg-surface-container/50 border border-border/50 text-xs font-sans text-text-secondary leading-relaxed"
                        >
                          <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{cue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Focus Area tab */}
                  {activeTab === 'focus' && (
                    <FocusAreaMuscleMap
                      primaryMuscles={meta.primaryMuscles}
                      secondaryMuscles={meta.secondaryMuscles}
                    />
                  )}
                </div>
              </div>

            </div>

            {/* ── CTA Footer ─────────────────────────────────── */}
            {onBeginExercise && (
              <div className="shrink-0 px-5 py-4 border-t border-border/40 bg-surface-container/60">
                <button
                  onClick={() => onBeginExercise(exerciseId)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-background font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:opacity-95 transition-all"
                  id="begin-exercise-cta"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Begin Exercise
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
