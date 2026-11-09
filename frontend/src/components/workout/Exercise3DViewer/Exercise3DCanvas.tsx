import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Info, Sparkles, Box, Image as ImageIcon, Play, Pause, Columns } from 'lucide-react';
import { Exercise3DConfig } from '../../../config/exercise3DRegistry';
import { resolveExerciseMetadata, getRepDBImageUrls } from '../../../data/exerciseMetadataRegistry';
import { useExercise3DScene } from '../../../hooks/useExercise3DScene';
import { CameraViewSwitcher } from './CameraViewSwitcher';
import { Exercise3DControls } from './Exercise3DControls';
import { MuscleHighlightLegend } from './MuscleHighlightLegend';
import { ProceduralFallbackViewer } from './ProceduralFallbackViewer';

interface Exercise3DCanvasProps {
  config: Exercise3DConfig;
  defaultMode?: '3D_MODEL' | 'GITHUB_GESTURES';
}

export const Exercise3DCanvas: React.FC<Exercise3DCanvasProps> = ({
  config,
  defaultMode = 'GITHUB_GESTURES',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Visualizer Engine Mode: '3D_MODEL' (Three.js 3D Muscular Athlete) or 'GITHUB_GESTURES' (Official GitHub illustrated athlete)
  const [visualizerMode, setVisualizerMode] = useState<'3D_MODEL' | 'GITHUB_GESTURES'>(defaultMode);
  const [gesturePose, setGesturePose] = useState<'LOOP' | 'START' | 'PEAK' | 'SPLIT'>('LOOP');

  // Three.js 3D Scene hook
  const {
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    timelineProgress,
    scrubTimeline,
    activeCameraAngle,
    setCameraPreset,
    isWebGlSupported,
  } = useExercise3DScene({ config, canvasRef, containerRef });

  // Resolve metadata & RepDB GitHub illustrated gesture images
  const exerciseMeta = useMemo(() => {
    return resolveExerciseMetadata(config.exerciseId, config.name);
  }, [config.exerciseId, config.name]);

  const repdbImages = useMemo(() => {
    return exerciseMeta.images || getRepDBImageUrls(exerciseMeta.slug);
  }, [exerciseMeta]);

  // If WebGL is not supported and user selected 3D model, fall back gracefully to ProceduralFallbackViewer
  if (!isWebGlSupported && visualizerMode === '3D_MODEL') {
    return <ProceduralFallbackViewer config={config} initialMode="GITHUB_GESTURES" />;
  }

  // Determine current active pose in GitHub gestures loop: <0.5 start pose, >=0.5 peak contraction
  const activeLoopPose = timelineProgress < 0.5 ? 'start' : 'peak';

  return (
    <div className="flex flex-col h-full space-y-3 animate-fade-in">
      {/* 3D / Gesture Visual Stage Container */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-gradient-to-b from-[#0a0d14] to-[#0f172a] rounded-2xl border border-border/80 overflow-hidden shadow-2xl flex items-center justify-center group"
        style={{ minHeight: '380px', height: '100%' }}
      >
        {/* ===================================================================
             STAGE 1: Three.js 3D Muscular Human Athlete Canvas
             =================================================================== */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full block cursor-grab active:cursor-grabbing outline-none ${
            visualizerMode === '3D_MODEL' ? 'block' : 'hidden'
          }`}
        />

        {/* ===================================================================
             STAGE 2: Official GitHub Repo Illustrated Human Model Gestures
             =================================================================== */}
        {visualizerMode === 'GITHUB_GESTURES' && (
          <div className="w-full h-full relative flex items-center justify-center p-4">
            {gesturePose === 'SPLIT' ? (
              /* Side-by-Side Split View */
              <div className="w-full h-full grid grid-cols-2 gap-4 items-center">
                {/* Start Pose */}
                <div className="h-full glass-card p-4 rounded-xl border border-primary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
                      1. START POSE
                    </span>
                    <span className="text-text-muted">Setup & Alignment</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center max-h-[260px] w-full p-2">
                    <img
                      key={repdbImages.start}
                      src={repdbImages.start}
                      alt={`${config.name} Start Pose`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-text-secondary text-center truncate w-full">
                    Eccentric starting position with neutral joint stabilization
                  </p>
                </div>

                {/* Peak Contraction */}
                <div className="h-full glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold">
                      2. PEAK CONTRACTION
                    </span>
                    <span className="text-text-muted">Apex Contraction</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center max-h-[260px] w-full p-2">
                    <img
                      key={repdbImages.peak}
                      src={repdbImages.peak}
                      alt={`${config.name} Peak Pose`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-text-secondary text-center truncate w-full">
                    Full concentric shortening & maximal muscle recruitment
                  </p>
                </div>
              </div>
            ) : (
              /* Single Focused Illustrated Human Athlete with Animated Cadence */
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="flex-1 flex items-center justify-center max-h-[320px] w-full p-4 relative">
                  {/* Start Pose */}
                  <img
                    key={repdbImages.start}
                    src={repdbImages.start}
                    alt={`${config.name} Start Pose`}
                    className={`max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,211,238,0.25)] transition-opacity duration-500 absolute ${
                      gesturePose === 'START' || (gesturePose === 'LOOP' && activeLoopPose === 'start')
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  />

                  {/* Peak Pose */}
                  <img
                    key={repdbImages.peak}
                    src={repdbImages.peak}
                    alt={`${config.name} Peak Pose`}
                    className={`max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(139,92,246,0.25)] transition-opacity duration-500 absolute ${
                      gesturePose === 'PEAK' || (gesturePose === 'LOOP' && activeLoopPose === 'peak')
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  />
                </div>

                {/* Subtitle Telemetry Bar */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono text-text-muted px-4 py-2 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (gesturePose === 'START' || (gesturePose === 'LOOP' && activeLoopPose === 'start'))
                          ? 'bg-primary/20 text-primary border border-primary/40'
                          : 'bg-secondary/20 text-secondary border border-secondary/40'
                      }`}
                    >
                      {(gesturePose === 'START' || (gesturePose === 'LOOP' && activeLoopPose === 'start'))
                        ? '● 1. START SETUP POSE'
                        : '● 2. PEAK MUSCLE CONTRACTION'}
                    </span>
                    <span className="text-text-secondary text-[10px]">
                      {(gesturePose === 'START' || (gesturePose === 'LOOP' && activeLoopPose === 'start'))
                        ? 'Eccentric starting position'
                        : 'Concentric peak shortening'}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">
                    Official GitHub Model • {exerciseMeta.slug}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
             TOP-LEFT: Title & Muscle Legend Badge
             =================================================================== */}
        <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated/90 backdrop-blur-md border border-primary/40 text-xs font-mono text-primary shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">{config.name}</span>
            <span className="text-text-muted text-[10px]">
              • {visualizerMode === '3D_MODEL' ? '3D Muscular Athlete' : 'GitHub Human Gestures'}
            </span>
          </div>

          <MuscleHighlightLegend
            primaryMuscles={config.primaryMuscles}
            secondaryMuscles={config.secondaryMuscles}
          />
        </div>

        {/* ===================================================================
             TOP-RIGHT: Mode Switcher & Presets
             =================================================================== */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Engine Selector: 3D Model vs GitHub Gestures */}
          <div className="flex items-center gap-1 bg-surface-container/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg font-mono text-xs">
            <button
              onClick={() => setVisualizerMode('GITHUB_GESTURES')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                visualizerMode === 'GITHUB_GESTURES'
                  ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Official Illustrated Human Model from GitHub Repository"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>GitHub Gestures</span>
            </button>
            <button
              onClick={() => setVisualizerMode('3D_MODEL')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                visualizerMode === '3D_MODEL'
                  ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Interactive 3D Muscular Athlete Model"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Athlete</span>
            </button>
          </div>

          {/* If in 3D Mode: Camera preset angle switcher */}
          {visualizerMode === '3D_MODEL' && (
            <CameraViewSwitcher
              activeView={activeCameraAngle}
              onSelectView={setCameraPreset}
            />
          )}

          {/* If in GitHub Gestures Mode: Pose phase selector */}
          {visualizerMode === 'GITHUB_GESTURES' && (
            <div className="flex items-center gap-1 bg-surface-container/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg font-mono text-xs">
              <button
                onClick={() => setGesturePose('LOOP')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  gesturePose === 'LOOP'
                    ? 'bg-primary text-background font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Continuous Cadence Loop"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Loop</span>
              </button>
              <button
                onClick={() => setGesturePose('START')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  gesturePose === 'START'
                    ? 'bg-primary text-background font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Start Pose Setup"
              >
                Start
              </button>
              <button
                onClick={() => setGesturePose('PEAK')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  gesturePose === 'PEAK'
                    ? 'bg-primary text-background font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Peak Contraction"
              >
                Peak
              </button>
              <button
                onClick={() => setGesturePose('SPLIT')}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  gesturePose === 'SPLIT'
                    ? 'bg-secondary text-background font-bold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title="Side-by-Side Split View"
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
             BOTTOM: Interactive Playback & Cadence Controls Bar
             =================================================================== */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto max-w-xl mx-auto">
          <Exercise3DControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            speed={playbackSpeed}
            onSelectSpeed={setPlaybackSpeed}
            progress={timelineProgress}
            onScrub={scrubTimeline}
          />
        </div>
      </div>

      {/* Biomechanical Technique Form Cues */}
      <div className="bg-surface-container/60 p-3 rounded-xl border border-border flex items-start gap-2.5 text-xs font-mono shrink-0">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider block">
            Biomechanical Execution Guidelines:
          </span>
          <p className="text-text-secondary text-[11px] leading-relaxed truncate">
            {config.formCues.join(' • ')}
          </p>
        </div>
      </div>
    </div>
  );
};
