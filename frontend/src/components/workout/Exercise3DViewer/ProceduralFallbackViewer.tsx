import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, Sparkles, Target, Info, Box, Image as ImageIcon, Columns, CheckCircle2 } from 'lucide-react';
import { Exercise3DConfig } from '../../../config/exercise3DRegistry';
import { resolveExerciseMetadata, getRepDBImageUrls } from '../../../data/exerciseMetadataRegistry';

interface ProceduralFallbackViewerProps {
  config: Exercise3DConfig;
  initialMode?: 'HUMAN_2D' | 'GITHUB_GESTURES';
}

export const ProceduralFallbackViewer: React.FC<ProceduralFallbackViewerProps> = ({
  config,
  initialMode = 'GITHUB_GESTURES',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewing Engine Mode: 'HUMAN_2D' (anatomical muscular athlete) or 'GITHUB_GESTURES' (official GitHub illustrated athlete)
  const [engineMode, setEngineMode] = useState<'HUMAN_2D' | 'GITHUB_GESTURES'>(initialMode);
  const [gesturePose, setGesturePose] = useState<'LOOP' | 'START' | 'PEAK' | 'SPLIT'>('LOOP');

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [timelineProgress, setTimelineProgress] = useState<number>(0.0);

  const isPlayingRef = useRef<boolean>(true);
  const speedRef = useRef<number>(1.0);
  const progressRef = useRef<number>(0.0);
  const animFrameIdRef = useRef<number | null>(null);

  // Resolve metadata & RepDB GitHub illustrated gesture images
  const exerciseMeta = useMemo(() => {
    return resolveExerciseMetadata(config.exerciseId, config.name);
  }, [config.exerciseId, config.name]);

  const repdbImages = useMemo(() => {
    return exerciseMeta.images || getRepDBImageUrls(exerciseMeta.slug);
  }, [exerciseMeta]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  const handleScrub = useCallback((newProgress: number) => {
    const clamped = Math.max(0, Math.min(1, newProgress));
    progressRef.current = clamped;
    setTimelineProgress(clamped);
  }, []);

  // 2D Canvas Anatomical Muscular Athlete Render Loop
  useEffect(() => {
    if (engineMode !== 'HUMAN_2D') return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const exName = config.name.toLowerCase();
    const movePat = (config.movementPattern || '').toUpperCase();
    const cycleDurationSec = config.durationSec || 4.0;
    let lastTime = performance.now();

    const renderFrame = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlayingRef.current) {
        let nextProgress = progressRef.current + (deltaSec * speedRef.current) / cycleDurationSec;
        if (nextProgress > 1.0) nextProgress %= 1.0;
        progressRef.current = nextProgress;
        setTimelineProgress(nextProgress);
      }

      const p = progressRef.current; // 0 to 1
      const phaseRad = p * Math.PI * 2;
      const moveCycle = (Math.sin(phaseRad - Math.PI / 2) + 1) / 2; // Smooth 0 -> 1 -> 0

      // Reset transform & clear canvas
      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, width, height);

      // 1. Background Grid (Kinetic Horizon Dark)
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Ground Line
      const groundY = height * 0.85;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.08, groundY);
      ctx.lineTo(width * 0.92, groundY);
      ctx.stroke();

      const cx = width / 2;
      const cy = height / 2;

      // Kinematic Body Centers
      let head = { x: cx, y: cy - 110 };
      let shoulder = { x: cx, y: cy - 70 };
      let hip = { x: cx, y: cy + 30 };
      let kneeL = { x: cx - 24, y: cy + 100 };
      let kneeR = { x: cx + 24, y: cy + 100 };
      let ankleL = { x: cx - 24, y: groundY };
      let ankleR = { x: cx + 24, y: groundY };
      let elbowL = { x: cx - 48, y: cy - 30 };
      let elbowR = { x: cx + 48, y: cy - 30 };
      let wristL = { x: cx - 48, y: cy + 20 };
      let wristR = { x: cx + 48, y: cy + 20 };
      let bar = { x1: cx - 95, y1: cy + 20, x2: cx + 95, y2: cy + 20 };
      let isLyingOnBench = false;
      let isHanging = false;
      let phaseText = p < 0.5 ? 'ECCENTRIC PHASE (DESCENT)' : 'CONCENTRIC PHASE (ASCENT)';

      // Kinematic joint trajectory calculations
      if (movePat === 'BENCH_PRESS' || (exName.includes('press') && (exName.includes('bench') || exName.includes('chest') || exName.includes('incline')))) {
        isLyingOnBench = true;
        const benchY = cy + 25;
        head = { x: cx - 115, y: benchY - 14 };
        shoulder = { x: cx - 72, y: benchY - 14 };
        hip = { x: cx + 32, y: benchY - 14 };
        kneeL = { x: cx + 76, y: benchY + 30 };
        kneeR = { x: cx + 76, y: benchY + 30 };
        ankleL = { x: cx + 76, y: groundY };
        ankleR = { x: cx + 76, y: groundY };

        const pressHeight = 75 * moveCycle;
        const barY = benchY - 45 - pressHeight;
        const elbowY = benchY + 16 - 38 * (1 - moveCycle);

        elbowL = { x: cx - 72, y: elbowY };
        elbowR = { x: cx - 72, y: elbowY };
        wristL = { x: cx - 72, y: barY };
        wristR = { x: cx - 72, y: barY };
        bar = { x1: cx - 72, y1: barY - 85, x2: cx - 72, y2: barY + 85 };

      } else if (movePat === 'SQUAT' || exName.includes('squat')) {
        const drop = 65 * moveCycle;
        hip = { x: cx - 25 * moveCycle, y: cy + 20 + drop };
        head = { x: cx - 15 * moveCycle, y: cy - 120 + drop };
        shoulder = { x: cx - 18 * moveCycle, y: cy - 80 + drop };
        kneeL = { x: cx + 35 * moveCycle, y: cy + 90 + drop * 0.4 };
        kneeR = { x: cx + 35 * moveCycle, y: cy + 90 + drop * 0.4 };
        ankleL = { x: cx - 10, y: groundY };
        ankleR = { x: cx + 10, y: groundY };

        const barY = shoulder.y;
        wristL = { x: shoulder.x - 30, y: barY };
        wristR = { x: shoulder.x + 30, y: barY };
        bar = { x1: shoulder.x - 90, y1: barY, x2: shoulder.x + 90, y2: barY };

      } else if (movePat === 'BARBELL_ROW' || exName.includes('row')) {
        hip = { x: cx - 40, y: cy + 20 };
        shoulder = { x: cx + 45, y: cy - 25 };
        head = { x: cx + 75, y: cy - 35 };
        kneeL = { x: cx - 30, y: cy + 90 };
        kneeR = { x: cx - 30, y: cy + 90 };
        ankleL = { x: cx - 35, y: groundY };
        ankleR = { x: cx - 35, y: groundY };

        const pullProgress = moveCycle;
        const pullY = (cy + 60) - pullProgress * 55;
        const pullX = (cx + 10) + pullProgress * 15;
        elbowL = { x: cx + 10, y: pullY - 30 };
        elbowR = { x: cx + 10, y: pullY - 30 };
        wristL = { x: pullX, y: pullY };
        wristR = { x: pullX, y: pullY };
        bar = { x1: pullX, y1: pullY - 80, x2: pullX, y2: pullY + 80 };

      } else if (movePat === 'OVERHEAD_PRESS' || exName.includes('overhead') || (exName.includes('press') && exName.includes('shoulder'))) {
        const pressH = 80 * moveCycle;
        const barY = (cy - 60) - pressH;
        elbowL = { x: cx - 40, y: cy - 20 - pressH * 0.4 };
        elbowR = { x: cx + 40, y: cy - 20 - pressH * 0.4 };
        wristL = { x: cx - 35, y: barY };
        wristR = { x: cx + 35, y: barY };
        bar = { x1: cx - 90, y1: barY, x2: cx + 90, y2: barY };
        phaseText = p < 0.5 ? 'ECCENTRIC PHASE (LOWERING)' : 'CONCENTRIC PHASE (PRESS)';

      } else if (movePat === 'ROMANIAN_DEADLIFT' || exName.includes('romanian') || (exName.includes('deadlift') && !exName.includes('conventional'))) {
        const hingeDepth = 70 * moveCycle;
        const torsoTilt  = 65 * moveCycle;

        head     = { x: cx + torsoTilt * 0.8,  y: cy - 115 + hingeDepth * 0.3 };
        shoulder = { x: cx + torsoTilt,         y: cy -  75 + hingeDepth * 0.35 };
        hip      = { x: cx - hingeDepth * 0.55, y: cy +  25 };

        kneeL = { x: cx - 18, y: cy + 90 };
        kneeR = { x: cx + 18, y: cy + 90 };
        ankleL = { x: cx - 18, y: groundY };
        ankleR = { x: cx + 18, y: groundY };

        const barDropY = (cy - 10) + hingeDepth * 0.9;
        const barX     = shoulder.x + 10;
        elbowL = { x: barX - 5, y: barDropY - 25 };
        elbowR = { x: barX - 5, y: barDropY - 25 };
        wristL = { x: barX,     y: barDropY };
        wristR = { x: barX,     y: barDropY };
        bar    = { x1: barX, y1: barDropY - 80, x2: barX, y2: barDropY + 80 };

        phaseText = p < 0.5 ? 'ECCENTRIC — HIP HINGE & STRETCH' : 'CONCENTRIC — HIP DRIVE TO LOCKOUT';

      } else if (movePat === 'LEG_RAISE' || exName.includes('leg raise') || exName.includes('hanging')) {
        isHanging = true;
        phaseText = p < 0.5 ? 'ECCENTRIC — CONTROLLED LOWER' : 'CONCENTRIC — ABDOMINAL LIFT';

        const barHeight = cy - 145;
        elbowL = { x: cx - 28, y: barHeight + 20 };
        elbowR = { x: cx + 28, y: barHeight + 20 };
        wristL = { x: cx - 25, y: barHeight };
        wristR = { x: cx + 25, y: barHeight };
        bar = { x1: cx - 55, y1: barHeight - 4, x2: cx + 55, y2: barHeight - 4 };

        shoulder = { x: cx, y: barHeight + 35 };
        head     = { x: cx, y: barHeight + 18 };
        hip      = { x: cx, y: barHeight + 105 };

        const legLift = 80 * moveCycle;
        const kneeX   = 18;
        kneeL = { x: cx - kneeX * (1 - moveCycle * 0.4), y: hip.y + 55 - legLift * 0.7 };
        kneeR = { x: cx + kneeX * (1 - moveCycle * 0.4), y: hip.y + 55 - legLift * 0.7 };
        ankleL = { x: cx - kneeX * (1 - moveCycle * 0.6), y: hip.y + 115 - legLift };
        ankleR = { x: cx + kneeX * (1 - moveCycle * 0.6), y: hip.y + 115 - legLift };

      } else {
        const travel = 50 * moveCycle;
        shoulder = { x: cx, y: cy - 70 - travel * 0.2 };
        elbowL = { x: cx - 40, y: cy - 20 - travel * 0.5 };
        elbowR = { x: cx + 40, y: cy - 20 - travel * 0.5 };
        wristL = { x: cx - 35, y: cy + 20 - travel };
        wristR = { x: cx + 35, y: cy + 20 - travel };
        bar = { x1: cx - 85, y1: cy + 20 - travel, x2: cx + 85, y2: cy + 20 - travel };
      }

      // --- Draw Gym Equipment Underneath Athlete ---
      if (isLyingOnBench) {
        // High-density padded vinyl bench
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 135, cy + 20, 190, 16, [4, 4, 4, 4]);
        ctx.fill();
        ctx.stroke();

        // Steel bench legs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy + 36);
        ctx.lineTo(cx - 100, groundY);
        ctx.moveTo(cx + 40, cy + 36);
        ctx.lineTo(cx + 40, groundY);
        ctx.stroke();
      }

      if (isHanging) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(bar.x1, bar.y1);
        ctx.lineTo(bar.x1, bar.y1 - 25);
        ctx.moveTo(bar.x2, bar.y2);
        ctx.lineTo(bar.x2, bar.y2 - 25);
        ctx.stroke();
      }

      // =====================================================================
      // DRAW ANATOMICAL MUSCULAR HUMAN ATHLETE (NO STICK FIGURE SKELETON)
      // =====================================================================
      const skinColor = '#c88b5c';
      const skinShade = '#a86f44';
      const targetGlowColor = '#22d3ee';
      const secondaryGlowColor = '#8b5cf6';

      // 1. Muscular Legs & Shorts
      // Athletic compression shorts (Pelvis / Hips)
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(hip.x - 22, hip.y - 12, 44, 28, [6, 6, 4, 4]);
      ctx.fill();
      ctx.stroke();

      // Thighs (Volumetric muscular polygon with quad teardrop)
      const isQuadTarget = movePat === 'SQUAT' || movePat === 'ROMANIAN_DEADLIFT';
      ctx.fillStyle = isQuadTarget ? 'rgba(34, 211, 238, 0.4)' : skinColor;
      ctx.strokeStyle = isQuadTarget ? targetGlowColor : skinShade;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hip.x - 8, hip.y + 12);
      ctx.lineTo(kneeL.x, kneeL.y);
      ctx.moveTo(hip.x + 8, hip.y + 12);
      ctx.lineTo(kneeR.x, kneeR.y);
      ctx.stroke();

      // Calves / Shins (Volumetric Gastrocnemius)
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(kneeL.x, kneeL.y);
      ctx.lineTo(ankleL.x, ankleL.y - 6);
      ctx.moveTo(kneeR.x, kneeR.y);
      ctx.lineTo(ankleR.x, ankleR.y - 6);
      ctx.stroke();

      // Athletic Cross-Trainer Shoes (Upper + White Sole)
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      [ankleL, ankleR].forEach((ankle) => {
        ctx.beginPath();
        ctx.roundRect(ankle.x - 10, ankle.y - 8, 20, 8, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();
      });

      // 2. Muscular Torso & Sculpted Chest
      const isChestTarget = movePat === 'BENCH_PRESS';
      const isLatTarget = movePat === 'BARBELL_ROW';

      // V-Taper Ribcage / Core (Sculpted Muscular Polygon)
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = skinShade;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shoulder.x - 26, shoulder.y);
      ctx.lineTo(shoulder.x + 26, shoulder.y);
      ctx.lineTo(hip.x + 18, hip.y - 6);
      ctx.lineTo(hip.x - 18, hip.y - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Pectoral Muscle Plates (Left & Right Pec)
      const pecMatFill = isChestTarget ? 'rgba(34, 211, 238, 0.55)' : skinColor;
      const pecMatStroke = isChestTarget ? targetGlowColor : skinShade;
      ctx.fillStyle = pecMatFill;
      ctx.strokeStyle = pecMatStroke;
      ctx.lineWidth = 2;
      ctx.shadowColor = isChestTarget ? targetGlowColor : 'transparent';
      ctx.shadowBlur = isChestTarget ? 14 : 0;

      // Left Pec
      ctx.beginPath();
      ctx.roundRect(shoulder.x - 22, shoulder.y + 4, 20, 16, [4, 4, 6, 6]);
      ctx.fill();
      ctx.stroke();

      // Right Pec
      ctx.beginPath();
      ctx.roundRect(shoulder.x + 2, shoulder.y + 4, 20, 16, [4, 4, 6, 6]);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Defined 6-Pack Abdominals Grid
      ctx.strokeStyle = 'rgba(168, 111, 68, 0.6)';
      ctx.lineWidth = 1.5;
      [shoulder.y + 24, shoulder.y + 32, shoulder.y + 40].forEach((yPos) => {
        ctx.beginPath();
        ctx.moveTo(shoulder.x - 8, yPos);
        ctx.lineTo(shoulder.x + 8, yPos);
        ctx.stroke();
      });

      // 3. Head, Neck & Athletic Hair
      // Muscular Neck
      ctx.fillStyle = skinColor;
      ctx.strokeStyle = skinShade;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(head.x, head.y + 12);
      ctx.lineTo(shoulder.x, shoulder.y);
      ctx.stroke();

      // Cranium / Face (Contoured Head Profile)
      ctx.lineWidth = 2;
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.ellipse(head.x, head.y, 14, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Athletic Fade Hair Cap
      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.arc(head.x, head.y - 4, 14.5, Math.PI, Math.PI * 2);
      ctx.fill();

      // 4. Muscular Arms (Volumetric Deltoids, Biceps & Forearms)
      const isShoulderTarget = movePat === 'OVERHEAD_PRESS';
      const armGlow = isShoulderTarget ? targetGlowColor : skinShade;

      // Rounded Deltoid Shoulder Caps
      ctx.fillStyle = isShoulderTarget ? 'rgba(34, 211, 238, 0.6)' : skinColor;
      ctx.strokeStyle = armGlow;
      ctx.lineWidth = 2;
      ctx.shadowColor = isShoulderTarget ? targetGlowColor : 'transparent';
      ctx.shadowBlur = isShoulderTarget ? 12 : 0;
      ctx.beginPath();
      ctx.arc(shoulder.x - 26, shoulder.y + 2, 9, 0, Math.PI * 2);
      ctx.arc(shoulder.x + 26, shoulder.y + 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Upper Arms (Volumetric Bicep/Tricep cylinders)
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = isShoulderTarget ? targetGlowColor : skinColor;
      ctx.beginPath();
      ctx.moveTo(shoulder.x - 26, shoulder.y + 2);
      ctx.lineTo(elbowL.x, elbowL.y);
      ctx.moveTo(shoulder.x + 26, shoulder.y + 2);
      ctx.lineTo(elbowR.x, elbowR.y);
      ctx.stroke();

      // Forearms (Muscular tapering)
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(elbowL.x, elbowL.y);
      ctx.lineTo(wristL.x, wristL.y);
      ctx.moveTo(elbowR.x, elbowR.y);
      ctx.lineTo(wristR.x, wristR.y);
      ctx.stroke();

      // Sculpted Hands gripping bar
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(wristL.x, wristL.y, 5, 0, Math.PI * 2);
      ctx.arc(wristR.x, wristR.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // 5. Competition Olympic Barbell & Calibrated Bumper Plates
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bar.x1, bar.y1);
      ctx.lineTo(bar.x2, bar.y2);
      ctx.stroke();

      // Blue Competition 20kg Olympic Bumper Plates & Metal Collars
      ctx.fillStyle = '#1d4ed8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;

      // Left Plate
      ctx.beginPath();
      ctx.roundRect(bar.x1 - 8, bar.y1 - 24, 10, 48, [3, 3, 3, 3]);
      ctx.fill();
      ctx.stroke();

      // Right Plate
      ctx.beginPath();
      ctx.roundRect(bar.x2 - 2, bar.y2 - 24, 10, 48, [3, 3, 3, 3]);
      ctx.fill();
      ctx.stroke();

      // Spring Collars
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bar.x1 + 3, bar.y1 - 7, 5, 14);
      ctx.fillRect(bar.x2 - 8, bar.y2 - 7, 5, 14);

      // Telemetry Status Badge on Canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(16, height - 38, 270, 24, [6, 6, 6, 6]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      ctx.font = '10px monospace';
      ctx.fillText(`● ${phaseText}`, 26, height - 22);

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [config, engineMode]);

  // Animated Cadence Loop for GitHub Repo Gestures Mode
  useEffect(() => {
    if (engineMode !== 'GITHUB_GESTURES' || gesturePose !== 'LOOP') return;

    const cycleDurationSec = config.durationSec || 4.0;
    let lastTime = performance.now();
    let frameId: number;

    const updateLoop = (currentTime: number) => {
      const deltaSec = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlayingRef.current) {
        let next = progressRef.current + (deltaSec * speedRef.current) / cycleDurationSec;
        if (next > 1.0) next %= 1.0;
        progressRef.current = next;
        setTimelineProgress(next);
      }

      frameId = requestAnimationFrame(updateLoop);
    };

    frameId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(frameId);
  }, [engineMode, gesturePose, config.durationSec]);

  // Determine current active pose in GitHub gestures loop: <0.5 start pose, >=0.5 peak contraction
  const activeLoopPose = timelineProgress < 0.5 ? 'start' : 'peak';

  return (
    <div className="flex flex-col h-full space-y-3 animate-fade-in">
      {/* Visualizer Stage Container */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-gradient-to-b from-[#0a0d14] to-[#0f172a] rounded-2xl border border-border/80 overflow-hidden shadow-2xl flex items-center justify-center group"
        style={{ minHeight: '380px', height: '100%' }}
      >
        {/* ===================================================================
             ENGINE 1: 2D Anatomical Muscular Athlete Canvas (Never Skeleton)
             =================================================================== */}
        {engineMode === 'HUMAN_2D' && (
          <canvas ref={canvasRef} className="w-full h-full block outline-none" />
        )}

        {/* ===================================================================
             ENGINE 2: Official GitHub Repo Illustrated Human Model Gestures
             =================================================================== */}
        {engineMode === 'GITHUB_GESTURES' && (
          <div className="w-full h-full relative flex items-center justify-center p-4">
            {gesturePose === 'SPLIT' ? (
              /* Side-by-Side Split View */
              <div className="w-full h-full grid grid-cols-2 gap-4 items-center">
                {/* Start Pose Card */}
                <div className="h-full glass-card p-4 rounded-xl border border-primary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
                      1. START POSE
                    </span>
                    <span className="text-text-muted">Setup & Alignment</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center max-h-[260px] w-full p-2">
                    <img
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

                {/* Peak Contraction Card */}
                <div className="h-full glass-card p-4 rounded-xl border border-secondary/30 flex flex-col items-center justify-between relative overflow-hidden bg-surface/80">
                  <div className="w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/30 text-secondary font-bold">
                      2. PEAK CONTRACTION
                    </span>
                    <span className="text-text-muted">Apex Contraction</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center max-h-[260px] w-full p-2">
                    <img
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
                  {/* Start Image */}
                  <img
                    src={repdbImages.start}
                    alt={`${config.name} Start Setup`}
                    className={`max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,211,238,0.25)] transition-opacity duration-500 absolute ${
                      gesturePose === 'START' || (gesturePose === 'LOOP' && activeLoopPose === 'start')
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  />

                  {/* Peak Image */}
                  <img
                    src={repdbImages.peak}
                    alt={`${config.name} Peak Contraction`}
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
            <span className="text-text-muted text-[10px]">• Human Exercise Model</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
            {config.primaryMuscles.map((m) => (
              <span
                key={m.name}
                className="px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/40 text-[10px] font-mono text-primary flex items-center gap-1"
              >
                <Target className="w-3 h-3" /> {m.name}
              </span>
            ))}
            {config.secondaryMuscles.map((m) => (
              <span
                key={m.name}
                className="px-2.5 py-0.5 rounded-lg bg-secondary/10 border border-secondary/40 text-[10px] font-mono text-secondary"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* ===================================================================
             TOP-RIGHT: Dual-Engine Switcher (Human Model vs GitHub Repo Gestures)
             =================================================================== */}
        <div className="absolute top-4 right-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Engine Selector */}
          <div className="flex items-center gap-1 bg-surface-container/90 backdrop-blur-md p-1 rounded-xl border border-border shadow-lg font-mono text-xs">
            <button
              onClick={() => setEngineMode('GITHUB_GESTURES')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                engineMode === 'GITHUB_GESTURES'
                  ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Official Illustrated Human Model from GitHub Repository"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>GitHub Gestures</span>
            </button>
            <button
              onClick={() => setEngineMode('HUMAN_2D')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                engineMode === 'HUMAN_2D'
                  ? 'bg-primary text-background font-bold shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Sculpted Anatomical Muscular Athlete"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Muscular Athlete</span>
            </button>
          </div>

          {/* If GitHub gestures is active, show Pose Phase Selector */}
          {engineMode === 'GITHUB_GESTURES' && (
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
          <div className="bg-surface-elevated/90 backdrop-blur-md border border-border/80 rounded-xl p-2 sm:p-2.5 flex items-center gap-3 shadow-2xl">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-lg bg-primary text-background flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.4)] hover:opacity-95 transition-all shrink-0"
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {/* Timeline Scrub Slider */}
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={timelineProgress}
                onChange={(e) => handleScrub(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] font-mono text-text-muted shrink-0 w-8 text-right">
                {Math.round(timelineProgress * 100)}%
              </span>
            </div>

            {/* Speed Buttons */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-border shrink-0">
              {[0.5, 1.0, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    playbackSpeed === spd
                      ? 'bg-primary text-background font-bold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
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
