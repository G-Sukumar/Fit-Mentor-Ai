import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Search,
  Sparkles,
  ExternalLink,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Dumbbell,
  Zap,
  ArrowUpRight,
  RotateCcw,
  Play,
  CheckCircle2,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Image as ImageIcon,
  Columns,
  Eye,
  Pause,
} from 'lucide-react';
import {
  EXERCISE_METADATA_REGISTRY,
  ExerciseMetadata,
  getExerciseMetadata,
  getExerciseMetadataByName,
  getExerciseMetadataBySlug,
  getRepDBImageUrls,
} from '../../data/exerciseMetadataRegistry';
import { getExercise3DConfig } from '../../config/exercise3DRegistry';
import { Exercise3DCanvas } from './Exercise3DViewer/Exercise3DCanvas';
import { FocusAreaMuscleMap } from './FocusAreaMuscleMap';

interface RepDB3DStudioProps {
  initialExerciseId?: string;
  onSelectForWorkout?: (exerciseId: string) => void;
}

type BodyPartFilter = 'ALL' | 'chest' | 'back' | 'shoulders' | 'upper_arms' | 'upper_legs' | 'lower_legs' | 'core';
type MechanicFilter = 'ALL' | 'COMPOUND' | 'ISOLATION';
type ForceFilter = 'ALL' | 'push' | 'pull' | 'dynamic';
type PoseMode = 'LOOP' | 'START_POSE' | 'PEAK_CONTRACTION';

export const RepDB3DStudio: React.FC<RepDB3DStudioProps> = ({
  initialExerciseId = 'e0000000-0000-0000-0000-000000000001',
  onSelectForWorkout,
}) => {
  const allExercises = useMemo(() => Object.values(EXERCISE_METADATA_REGISTRY), []);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(initialExerciseId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bodyPartFilter, setBodyPartFilter] = useState<BodyPartFilter>('ALL');
  const [mechanicFilter, setMechanicFilter] = useState<MechanicFilter>('ALL');
  const [forceFilter, setForceFilter] = useState<ForceFilter>('ALL');
  const [poseMode, setPoseMode] = useState<PoseMode>('LOOP');
  const [activeTab, setActiveTab] = useState<'tips' | 'relations' | 'anatomy'>('tips');

  // RepDB Engine & Gesture Visualizer States
  const [visualizerEngine, setVisualizerEngine] = useState<'REPDB_GESTURES' | '3D_MODEL'>('REPDB_GESTURES');
  const [sideBySide, setSideBySide] = useState<boolean>(false);
  const [gesturePhase, setGesturePhase] = useState<'start' | 'peak'>('start');
  const [repCounter, setRepCounter] = useState<number>(1);
  const [isMotionRunning, setIsMotionRunning] = useState<boolean>(true);
  const [motionProgress, setMotionProgress] = useState<number>(0);

  // Repetition animation loop for RepDB gestures
  useEffect(() => {
    if (poseMode === 'START_POSE') {
      setGesturePhase('start');
      return;
    }
    if (poseMode === 'PEAK_CONTRACTION') {
      setGesturePhase('peak');
      return;
    }
    if (poseMode === 'LOOP' && isMotionRunning) {
      const stepMs = 50;
      const cycleDuration = 3200; // 3.2 seconds per rep cycle
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed = (elapsed + stepMs) % cycleDuration;
        const progress = elapsed / cycleDuration;
        setMotionProgress(progress);

        if (progress < 0.48) {
          setGesturePhase('start');
        } else {
          setGesturePhase('peak');
        }

        if (elapsed < stepMs) {
          setRepCounter((prev) => (prev % 12) + 1);
        }
      }, stepMs);

      return () => clearInterval(interval);
    }
  }, [poseMode, isMotionRunning]);

  // Currently inspected exercise
  const currentExercise: ExerciseMetadata = useMemo(() => {
    return getExerciseMetadata(selectedExerciseId) || allExercises[0];
  }, [selectedExerciseId, allExercises]);

  // 3D configuration
  const current3DConfig = useMemo(() => {
    return getExercise3DConfig(currentExercise.exerciseId, currentExercise.displayName);
  }, [currentExercise]);

  // Filtered exercise list for left browser rail
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ex.displayName.toLowerCase().includes(q);
        const matchesSlug = ex.slug.toLowerCase().includes(q);
        const matchesMuscle = ex.primaryMuscles.some((m) => m.name.toLowerCase().includes(q));
        if (!matchesName && !matchesSlug && !matchesMuscle) return false;
      }
      if (bodyPartFilter !== 'ALL' && ex.bodyPart !== bodyPartFilter) return false;
      if (mechanicFilter !== 'ALL' && ex.movementType !== mechanicFilter) return false;
      if (forceFilter !== 'ALL' && ex.forceType !== forceFilter) return false;
      return true;
    });
  }, [allExercises, searchQuery, bodyPartFilter, mechanicFilter, forceFilter]);

  // Resolve relation entities
  const relationData = useMemo(() => {
    const rels = currentExercise.relations || {};
    const alternatives = (rels.alternatives || [])
      .map((item) => getExerciseMetadata(item.id) || getExerciseMetadataByName(item.name))
      .filter((m): m is ExerciseMetadata => !!m);

    const progression = rels.progression
      ? (getExerciseMetadata(rels.progression.id) || getExerciseMetadataByName(rels.progression.name))
      : undefined;
    const regression = rels.regression
      ? (getExerciseMetadata(rels.regression.id) || getExerciseMetadataByName(rels.regression.name))
      : undefined;

    return { alternatives, progression, regression };
  }, [currentExercise]);

  // Estimated caloric expenditure per hour (based on MET & standard 75kg reference bodyweight)
  const estCaloriesPerHour = Math.round(currentExercise.met * 75 * 0.0175 * 60);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header & RepDB Dataset Reference Banner ──────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-mono text-primary font-semibold">
              <Box className="w-3.5 h-3.5" />
              <span>RepDB 3D Exercise Studio</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-[11px] font-mono text-secondary">
              <Activity className="w-3 h-3" />
              <span>Kinematic 3D Engine & MET Biomechanics</span>
            </span>
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            Interactive Biomechanical 3D Visualizer
          </h2>
          <p className="text-xs text-text-secondary max-w-2xl">
            Explore precise skeletal movement loops, apex contraction poses, metabolic equivalent scores (MET),
            and biomechanical relationships directly powered by the RepDB open exercise taxonomy.
          </p>
        </div>

        {/* RepDB attribution badge & external links */}
        <div className="flex items-center gap-2 shrink-0 bg-surface-container/80 p-3 rounded-xl border border-border/80">
          <div className="text-right">
            <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Dataset Standard</div>
            <div className="text-xs font-mono font-bold text-primary">RepDB • exercise-dataset.com</div>
          </div>
          <a
            href="https://repdb.co/preview/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 transition-all flex items-center gap-1 text-xs font-mono"
            title="Inspect Official RepDB Preview"
          >
            <span>repdb.co</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ── Main Studio Grid (Catalog Rail + 3D Stage) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        {/* ==============================================================
             LEFT: EXERCISE CATALOG & FILTER RAIL (4 Cols)
             ============================================================== */}
        <div className="lg:col-span-4 flex flex-col space-y-4 glass-card p-4 rounded-2xl border border-border">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search exercise, slug, or muscle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-elevated border border-border/80 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted uppercase">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-primary" /> Body Region
              </span>
              <span>{filteredExercises.length} items</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'Chest', value: 'chest' },
                { label: 'Back', value: 'back' },
                { label: 'Shoulders', value: 'shoulders' },
                { label: 'Arms', value: 'upper_arms' },
                { label: 'Legs', value: 'upper_legs' },
                { label: 'Core', value: 'core' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setBodyPartFilter(pill.value as BodyPartFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                    bodyPartFilter === pill.value
                      ? 'bg-primary text-background font-bold shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'bg-surface-elevated/60 text-text-secondary hover:text-text-primary border border-border/40'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Mechanics & Force type filter row */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <select
                value={mechanicFilter}
                onChange={(e) => setMechanicFilter(e.target.value as MechanicFilter)}
                className="bg-surface-elevated border border-border/80 rounded-lg px-2 py-1 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Mechanics</option>
                <option value="COMPOUND">Compound</option>
                <option value="ISOLATION">Isolation</option>
              </select>

              <select
                value={forceFilter}
                onChange={(e) => setForceFilter(e.target.value as ForceFilter)}
                className="bg-surface-elevated border border-border/80 rounded-lg px-2 py-1 text-[11px] font-mono text-text-secondary focus:outline-none focus:border-primary"
              >
                <option value="ALL">All Forces</option>
                <option value="push">Push Force</option>
                <option value="pull">Pull Force</option>
                <option value="dynamic">Dynamic Force</option>
              </select>
            </div>
          </div>

          {/* Exercise list items */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[560px] pr-1">
            {filteredExercises.map((ex) => {
              const isSelected = ex.exerciseId === selectedExerciseId;
              const repdbThumb = ex.images?.start || getRepDBImageUrls(ex.slug).start;

              return (
                <div
                  key={ex.exerciseId}
                  onClick={() => setSelectedExerciseId(ex.exerciseId)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'bg-surface-container/60 border-border/60 hover:border-primary/40 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Official RepDB Gesture Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-surface-elevated/90 border border-border/80 flex items-center justify-center overflow-hidden shrink-0 p-1 group-hover:border-primary/50 transition-colors">
                      <img
                        src={repdbThumb}
                        alt={ex.displayName}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.opacity = '0.3';
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          MET {ex.met.toFixed(1)}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated border border-border text-text-muted uppercase">
                          {ex.forceType}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated border border-border text-text-muted">
                          {ex.movementType}
                        </span>
                      </div>
                      <h4
                        className={`font-display font-bold text-sm mt-0.5 truncate ${
                          isSelected ? 'text-primary' : 'text-text-primary'
                        }`}
                      >
                        {ex.displayName}
                      </h4>
                      <p className="text-[10px] font-mono text-text-muted truncate mt-0.5">
                        {ex.slug}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-primary translate-x-0.5' : 'text-text-muted'
                      }`}
                    />
                  </div>

                  {/* Primary target muscles */}
                  <div className="flex flex-wrap gap-1 mt-2 pl-1">
                    {ex.primaryMuscles.map((m) => (
                      <span
                        key={m.name}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-primary/20 text-text-secondary"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredExercises.length === 0 && (
              <div className="text-center py-12 text-text-muted text-xs font-mono space-y-2">
                <Info className="w-6 h-6 mx-auto text-text-muted" />
                <p>No exercises match your filter criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* ==============================================================
             RIGHT: 3D INTERACTIVE STAGE & REPB TELEMETRY (8 Cols)
             ============================================================== */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Top Bar for Selected Exercise */}
          <div className="glass-card p-4 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-[10px] font-bold">
                  {currentExercise.category}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  slug: <span className="text-text-primary font-semibold">{currentExercise.slug}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-secondary uppercase">
                  {currentExercise.equipmentLabel}
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mt-1">
                {currentExercise.displayName}
              </h3>
            </div>

            {/* Visualizer Mode & Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Visualizer Engine Selector */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border shrink-0 font-mono text-xs">
                <button
                  onClick={() => setVisualizerEngine('REPDB_GESTURES')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    visualizerEngine === 'REPDB_GESTURES'
                      ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Official RepDB Dataset Illustrated Gestures"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>RepDB Gestures</span>
                </button>
                <button
                  onClick={() => setVisualizerEngine('3D_MODEL')}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    visualizerEngine === '3D_MODEL'
                      ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Sculpted 3D Muscular Athlete Model"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Athlete</span>
                </button>
              </div>

              {/* Pose / Loop Mode selector */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border shrink-0 font-mono text-xs">
                <button
                  onClick={() => {
                    setPoseMode('LOOP');
                    setSideBySide(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    poseMode === 'LOOP' && !sideBySide
                      ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Continuous Repetition Cadence Loop"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Loop</span>
                </button>
                <button
                  onClick={() => {
                    setPoseMode('START_POSE');
                    setSideBySide(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    poseMode === 'START_POSE' && !sideBySide
                      ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="RepDB Start Pose Setup"
                >
                  Start
                </button>
                <button
                  onClick={() => {
                    setPoseMode('PEAK_CONTRACTION');
                    setSideBySide(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    poseMode === 'PEAK_CONTRACTION' && !sideBySide
                      ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="RepDB Peak Contraction / Apex"
                >
                  Peak
                </button>
                {visualizerEngine === 'REPDB_GESTURES' && (
                  <button
                    onClick={() => setSideBySide(!sideBySide)}
                    className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      sideBySide
                        ? 'bg-secondary text-background font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Toggle Side-by-Side Start & Peak View"
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Visualizer Canvas & Gesture Stage */}
          <div className="h-[430px] rounded-2xl overflow-hidden border border-primary/20 shadow-2xl relative bg-surface-elevated/40">
            {visualizerEngine === '3D_MODEL' ? (
              <>
                <Exercise3DCanvas key={current3DConfig.exerciseId} config={current3DConfig} defaultMode="3D_MODEL" />

                {/* 3D Mode Overlay Badge */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-surface/85 backdrop-blur-md border border-primary/30 text-[10px] font-mono text-primary font-bold shadow-lg flex items-center gap-1.5">
                    <Box className="w-3 h-3" />
                    <span>REAL 3D MUSCULAR ATHLETE • {poseMode.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </>
            ) : (
              /* RepDB Official Illustrated Gestures Engine */
              <div className="w-full h-full relative flex items-center justify-center p-4">
                {sideBySide ? (
                  /* Side-by-Side View (Start & Peak) */
                  <div className="w-full h-full grid grid-cols-2 gap-4 items-center">
                    {/* Start Pose */}
                    <div className="h-full glass-card p-4 rounded-xl border border-primary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                      <div className="w-full flex items-center justify-between text-[11px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
                          1. START POSE
                        </span>
                        <span className="text-text-muted">Setup & Alignment</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center max-h-[300px] w-full p-2">
                        <img
                          src={currentExercise.images?.start || getRepDBImageUrls(currentExercise.slug).start}
                          alt={`${currentExercise.displayName} Start Pose`}
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-text-secondary text-center truncate w-full">
                        Eccentric starting position with neutral joint stabilization
                      </p>
                    </div>

                    {/* Peak Pose */}
                    <div className="h-full glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                      <div className="w-full flex items-center justify-between text-[11px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold">
                          2. PEAK CONTRACTION
                        </span>
                        <span className="text-text-muted">Apex Contraction</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center max-h-[300px] w-full p-2">
                        <img
                          src={currentExercise.images?.peak || getRepDBImageUrls(currentExercise.slug).peak}
                          alt={`${currentExercise.displayName} Peak Pose`}
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <p className="text-[10px] font-mono text-text-secondary text-center truncate w-full">
                        Full concentric shortening & maximal muscle recruitment
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Single Focused Gesture with Animated Motion Cadence */
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    {/* Top Status Telemetry Bar */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono font-bold shadow-lg flex items-center gap-1.5 ${
                            gesturePhase === 'start'
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-secondary/20 border-secondary text-secondary'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>
                            {gesturePhase === 'start'
                              ? 'PHASE 1: ECCENTRIC SETUP POSE'
                              : 'PHASE 2: CONCENTRIC PEAK CONTRACTION'}
                          </span>
                        </span>
                      </div>

                      {poseMode === 'LOOP' && (
                        <div className="flex items-center gap-2 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full border border-border shadow-lg">
                          <span className="text-[10px] font-mono text-text-muted uppercase">Rep Cadence</span>
                          <span className="text-xs font-mono font-bold text-gold">
                            REP {repCounter < 10 ? `0${repCounter}` : repCounter}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Active Gesture Illustration Image */}
                    <div className="flex-1 flex items-center justify-center max-h-[340px] w-full p-4">
                      <img
                        key={gesturePhase}
                        src={
                          gesturePhase === 'start'
                            ? currentExercise.images?.start || getRepDBImageUrls(currentExercise.slug).start
                            : currentExercise.images?.peak || getRepDBImageUrls(currentExercise.slug).peak
                        }
                        alt={`${currentExercise.displayName} ${gesturePhase} gesture`}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,211,238,0.2)] animate-fade-in transition-all duration-300"
                      />
                    </div>

                    {/* Bottom Controls & RepDB Dataset Credit */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20">
                      {poseMode === 'LOOP' ? (
                        <button
                          onClick={() => setIsMotionRunning(!isMotionRunning)}
                          className="px-3 py-1.5 rounded-lg bg-surface/90 hover:bg-surface border border-border text-xs font-mono text-text-primary flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md"
                        >
                          {isMotionRunning ? <Pause className="w-3 h-3 text-gold" /> : <Play className="w-3 h-3 text-primary" />}
                          <span>{isMotionRunning ? 'Pause Motion' : 'Resume Motion'}</span>
                        </button>
                      ) : (
                        <div className="text-[10px] font-mono text-text-muted bg-surface/80 px-2.5 py-1 rounded-md border border-border">
                          Static Pose Inspection
                        </div>
                      )}

                      <div className="text-[10px] font-mono text-text-muted bg-surface/80 backdrop-blur-md px-3 py-1 rounded-full border border-border flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span>Official RepDB GitHub Dataset • 512px Vector WebP</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RepDB Biomechanical Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: MET Score */}
            <div className="glass-card p-3 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">MET Score</span>
                <Activity className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="mt-1">
                <span className="text-xl font-display font-bold text-primary">
                  {currentExercise.met.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono text-text-muted ml-1">METs</span>
              </div>
              <span className="text-[9px] font-mono text-text-muted mt-0.5">
                Metabolic Equivalent Index
              </span>
            </div>

            {/* Metric 2: Est. Energy Burn */}
            <div className="glass-card p-3 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Est. Burn Rate</span>
                <Flame className="w-3.5 h-3.5 text-gold" />
              </div>
              <div className="mt-1">
                <span className="text-xl font-display font-bold text-gold">
                  {estCaloriesPerHour}
                </span>
                <span className="text-[10px] font-mono text-text-muted ml-1">kcal/hr</span>
              </div>
              <span className="text-[9px] font-mono text-text-muted mt-0.5">
                Standard 75kg Athlete Load
              </span>
            </div>

            {/* Metric 3: Movement & Force */}
            <div className="glass-card p-3 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Biomechanics</span>
                <Dumbbell className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="mt-1">
                <span className="text-sm font-display font-bold text-secondary uppercase">
                  {currentExercise.movementType}
                </span>
                <div className="text-[10px] font-mono text-text-primary capitalize">
                  {currentExercise.forceType} force
                </div>
              </div>
              <span className="text-[9px] font-mono text-text-muted mt-0.5">
                Tempo: {currentExercise.tempo.eccentric}-{currentExercise.tempo.pause}-{currentExercise.tempo.concentric}
              </span>
            </div>

            {/* Metric 4: Safety & Constraints */}
            <div className="glass-card p-3 rounded-xl border border-border flex flex-col justify-between">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[10px] font-mono uppercase tracking-wider">Safety Tags</span>
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {(currentExercise.safetyTags || ['neutral_spine']).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-success/10 border border-success/30 text-success uppercase"
                  >
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
              <span className="text-[9px] font-mono text-text-muted mt-0.5">
                Joint Integrity Guardrails
              </span>
            </div>
          </div>

          {/* Deep Dive Tabs: Technique Tips, Relations Matrix, Anatomy Map */}
          <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
            {/* Tab header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('tips')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeTab === 'tips'
                      ? 'bg-primary text-background shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  RepDB Technique & Form
                </button>
                <button
                  onClick={() => setActiveTab('relations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeTab === 'relations'
                      ? 'bg-primary text-background shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Relations Network ({relationData.alternatives.length + (relationData.progression ? 1 : 0) + (relationData.regression ? 1 : 0)})
                </button>
                <button
                  onClick={() => setActiveTab('anatomy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                    activeTab === 'anatomy'
                      ? 'bg-primary text-background shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Muscle Anatomy Map
                </button>
              </div>

              {onSelectForWorkout && (
                <button
                  onClick={() => onSelectForWorkout(currentExercise.exerciseId)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-background font-display font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:opacity-95 transition-all"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>Use in Workout</span>
                </button>
              )}
            </div>

            {/* Tab 1: Tips & Form Cues */}
            {activeTab === 'tips' && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* RepDB Tips Banner */}
                {currentExercise.tips && currentExercise.tips.length > 0 && (
                  <div className="bg-surface-elevated/70 p-3.5 rounded-xl border border-primary/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-primary font-mono font-bold text-[11px] uppercase">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>RepDB Coach Tips (tips_en):</span>
                    </div>
                    <ul className="space-y-1.5 pl-4 list-disc text-text-secondary">
                      {currentExercise.tips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Form Cues */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-text-muted uppercase">
                    Execution Cues:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentExercise.formCues.map((cue, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-surface-container/50 border border-border/40 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span className="text-text-secondary">{cue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Instructions */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-text-muted uppercase">
                    Step-by-Step Instructions:
                  </span>
                  <ol className="space-y-2 pl-2">
                    {currentExercise.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-text-secondary">
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Tab 2: Relations Network (Progression, Regression, Alternatives) */}
            {activeTab === 'relations' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-text-secondary">
                  Tap any linked movement below to instantly inspect its 3D kinematics, MET energy index, and biomechanics.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Progression */}
                  <div className="glass-card p-3 rounded-xl border border-secondary/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-secondary font-mono text-[11px] font-bold uppercase">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Progression (Level Up)</span>
                    </div>
                    {relationData.progression ? (
                      <button
                        onClick={() => setSelectedExerciseId(relationData.progression!.exerciseId)}
                        className="w-full text-left p-2.5 rounded-lg bg-surface-elevated hover:bg-secondary/10 border border-border hover:border-secondary/50 transition-all group"
                      >
                        <div className="font-display font-bold text-xs text-text-primary group-hover:text-secondary">
                          {relationData.progression.displayName}
                        </div>
                        <div className="text-[10px] font-mono text-text-muted mt-0.5">
                          MET {relationData.progression.met.toFixed(1)} • {relationData.progression.difficulty}
                        </div>
                      </button>
                    ) : (
                      <div className="text-[11px] font-mono text-text-muted italic p-2">
                        Apex movement in progression ladder.
                      </div>
                    )}
                  </div>

                  {/* Regression */}
                  <div className="glass-card p-3 rounded-xl border border-gold/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-gold font-mono text-[11px] font-bold uppercase">
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regression (Deload / Scale)</span>
                    </div>
                    {relationData.regression ? (
                      <button
                        onClick={() => setSelectedExerciseId(relationData.regression!.exerciseId)}
                        className="w-full text-left p-2.5 rounded-lg bg-surface-elevated hover:bg-gold/10 border border-border hover:border-gold/50 transition-all group"
                      >
                        <div className="font-display font-bold text-xs text-text-primary group-hover:text-gold">
                          {relationData.regression.displayName}
                        </div>
                        <div className="text-[10px] font-mono text-text-muted mt-0.5">
                          MET {relationData.regression.met.toFixed(1)} • {relationData.regression.difficulty}
                        </div>
                      </button>
                    ) : (
                      <div className="text-[11px] font-mono text-text-muted italic p-2">
                        Foundational baseline movement.
                      </div>
                    )}
                  </div>

                  {/* Alternatives */}
                  <div className="glass-card p-3 rounded-xl border border-primary/40 space-y-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-primary font-mono text-[11px] font-bold uppercase">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Equipment Swaps ({relationData.alternatives.length})</span>
                    </div>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                      {relationData.alternatives.map((alt) => (
                        <button
                          key={alt.exerciseId}
                          onClick={() => setSelectedExerciseId(alt.exerciseId)}
                          className="w-full text-left p-2 rounded-lg bg-surface-elevated hover:bg-primary/10 border border-border hover:border-primary/50 transition-all group"
                        >
                          <div className="font-display font-bold text-xs text-text-primary group-hover:text-primary">
                            {alt.displayName}
                          </div>
                          <div className="text-[9px] font-mono text-text-muted">
                            {alt.equipmentLabel} • MET {alt.met.toFixed(1)}
                          </div>
                        </button>
                      ))}
                      {relationData.alternatives.length === 0 && (
                        <div className="text-[11px] font-mono text-text-muted italic p-2">
                          No direct equipment alternatives registered.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Muscle Anatomy Map */}
            {activeTab === 'anatomy' && (
              <div className="space-y-3 animate-fade-in">
                <FocusAreaMuscleMap
                  primaryMuscles={currentExercise.primaryMuscles}
                  secondaryMuscles={currentExercise.secondaryMuscles}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
