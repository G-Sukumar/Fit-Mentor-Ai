import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Exercise3DConfig } from '../config/exercise3DRegistry';

interface UseExercise3DSceneProps {
  config: Exercise3DConfig;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useExercise3DScene({ config, canvasRef, containerRef }: UseExercise3DSceneProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [timelineProgress, setTimelineProgress] = useState(0.0);
  const [activeCameraAngle, setActiveCameraAngle] = useState<'front' | 'side' | 'isometric' | 'free'>(config.cameraViews.defaultView);
  const [isWebGlSupported, setIsWebGlSupported] = useState(true);

  // References for render loop & scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const speedRef = useRef<number>(1.0);
  const isPlayingRef = useRef<boolean>(true);

  // Joint references for procedural skeletal animation
  const rigRef = useRef<{
    rootGroup: THREE.Group;
    torso: THREE.Mesh;
    chestMesh: THREE.Mesh;
    head: THREE.Mesh;
    leftUpperArm: THREE.Group;
    leftForearm: THREE.Group;
    rightUpperArm: THREE.Group;
    rightForearm: THREE.Group;
    pelvis: THREE.Mesh;
    leftThigh: THREE.Group;
    leftShin: THREE.Group;
    rightThigh: THREE.Group;
    rightShin: THREE.Group;
    barbellGroup: THREE.Group;
    benchGroup: THREE.Group;
  } | null>(null);

  // Synchronize refs with state
  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Smooth camera transition target
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(...config.cameraViews[config.cameraViews.defaultView].position));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(...config.cameraViews[config.cameraViews.defaultView].target));

  // Change Camera Preset
  const setCameraPreset = useCallback((preset: 'front' | 'side' | 'isometric') => {
    setActiveCameraAngle(preset);
    const view = config.cameraViews[preset];
    if (view) {
      targetCamPosRef.current.set(...view.position);
      targetCamLookRef.current.set(...view.target);
    }
  }, [config]);

  // Scrub timeline to specific normalized position [0, 1]
  const scrubTimeline = useCallback((progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    setTimelineProgress(clamped);
    timeRef.current = clamped * (Math.PI * 2);
  }, []);

  // Main Scene Initialization — deferred until container has real layout dimensions
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL availability safely without exhausting browser context limit
    if (typeof window === 'undefined' || (!window.WebGLRenderingContext && !(window as any).WebGL2RenderingContext)) {
      setIsWebGlSupported(false);
      return;
    }

    let initialized = false;
    let rafId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cleanupScene: (() => void) | null = null;

    // --- Scene builder function ---
    const initScene = (w: number, h: number) => {
      if (initialized) return;
      initialized = true;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0d14);
      sceneRef.current = scene;

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      const initialView = config.cameraViews[config.cameraViews.defaultView];
      camera.position.set(...initialView.position);
      camera.lookAt(new THREE.Vector3(...initialView.target));
      cameraRef.current = camera;
      targetCamPosRef.current.set(...initialView.position);
      targetCamLookRef.current.set(...initialView.target);

      // 3. Renderer — sized to actual container with safe WebGL fallback
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          powerPreference: 'default'
        });
      } catch (err) {
        console.warn('WebGLRenderer initialization failed:', err);
        setIsWebGlSupported(false);
        return;
      }

      if (!renderer || !renderer.getContext() || (renderer.getContext().isContextLost && renderer.getContext().isContextLost())) {
        console.warn('WebGL context lost during renderer initialization');
        setIsWebGlSupported(false);
        return;
      }

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // 4. Lighting Rig (Neon Studio Dark Theme)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0x22d3ee, 2.2); // Cyan Key Light
      keyLight.position.set(4, 6, 5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x8b5cf6, 2.0); // Purple Rim Light
      rimLight.position.set(-4, 3, -4);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0x38bdf8, 1.2, 10);
      fillLight.position.set(0, 1, 3);
      scene.add(fillLight);

      // 5. Floor Grid
      const gridHelper = new THREE.GridHelper(10, 20, 0x22d3ee, 0x1e293b);
      gridHelper.position.y = 0;
      scene.add(gridHelper);

      // Subtle reflective floor circle
      const floorGeo = new THREE.CircleGeometry(4, 32);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.8,
        metalness: 0.2
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.01;
      floor.receiveShadow = true;
      scene.add(floor);

      // 6. Build High-Fidelity Anatomical Human Athlete Rig
      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      // --- Realistic Athlete Materials ---
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xc88b5c, // Natural warm athletic skin tone
        roughness: 0.58,
        metalness: 0.05,
      });

      const activeMuscleMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee, // Active cyan target muscle glow
        emissive: 0x0891b2,
        emissiveIntensity: 0.7,
        roughness: 0.35,
        metalness: 0.4,
      });

      const shortsMat = new THREE.MeshStandardMaterial({
        color: 0x18181b, // Deep charcoal athletic compression shorts
        roughness: 0.8,
        metalness: 0.1,
      });

      const waistbandMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Cyan performance trim
        roughness: 0.45,
        metalness: 0.3,
      });

      const shoeUpperMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Dark cross-trainer athletic upper
        roughness: 0.7,
        metalness: 0.2,
      });

      const shoeSoleMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc, // Pure white performance lifting sole
        roughness: 0.3,
        metalness: 0.1,
      });

      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x1e1b18, // Dark textured athletic hair
        roughness: 0.9,
        metalness: 0.05,
      });

      const chromeBarMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9, // Olympic chrome steel bar
        metalness: 0.95,
        roughness: 0.15,
      });

      const olympicPlateMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8, // Competition 20kg Olympic blue bumper plate
        roughness: 0.4,
        metalness: 0.35,
      });

      const plateRimMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Heavy-duty rubber outer rim
        roughness: 0.6,
        metalness: 0.2,
      });

      const collarMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, // Quick-release metal spring collar
        metalness: 0.9,
        roughness: 0.2,
      });

      const benchVinylMat = new THREE.MeshStandardMaterial({
        color: 0x090d16, // High-density vinyl gym bench upholstery
        roughness: 0.65,
        metalness: 0.2,
      });

      // --- 1. Torso & Muscular Core ---
      const torso = new THREE.Group();
      torso.position.y = 1.35;
      rootGroup.add(torso);

      // Main V-Taper Muscular Ribcage
      const ribcageGeo = new THREE.CylinderGeometry(0.25, 0.19, 0.48, 20);
      const ribcageMesh = new THREE.Mesh(ribcageGeo, skinMat);
      ribcageMesh.castShadow = true;
      torso.add(ribcageMesh);

      // Sculpted Pectoral Muscles (Left & Right Pec with central sternal groove)
      const isChestActive = config.movementPattern === 'BENCH_PRESS';
      const pecMaterial = isChestActive ? activeMuscleMat : skinMat;

      const pecLeftGeo = new THREE.BoxGeometry(0.18, 0.16, 0.09);
      const pecLeft = new THREE.Mesh(pecLeftGeo, pecMaterial);
      pecLeft.position.set(-0.1, 0.12, 0.14);
      pecLeft.rotation.y = 0.08;
      torso.add(pecLeft);

      const pecRightGeo = new THREE.BoxGeometry(0.18, 0.16, 0.09);
      const pecRight = new THREE.Mesh(pecRightGeo, pecMaterial);
      pecRight.position.set(0.1, 0.12, 0.14);
      pecRight.rotation.y = -0.08;
      torso.add(pecRight);

      const chestMesh = pecLeft; // Primary chest mesh reference for rig

      // Sculpted 6-Pack Abdominals Wall
      const isCoreActive = config.movementPattern === 'LEG_RAISE';
      const absMaterial = isCoreActive ? activeMuscleMat : skinMat;
      const absRows = [0.01, -0.08, -0.16];
      absRows.forEach((yPos) => {
        const abPackLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.065, 0.04), absMaterial);
        abPackLeft.position.set(-0.05, yPos, 0.13);
        torso.add(abPackLeft);

        const abPackRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.065, 0.04), absMaterial);
        abPackRight.position.set(0.05, yPos, 0.13);
        torso.add(abPackRight);
      });

      // Latissimus Dorsi Back Flairs (Left & Right)
      const isBackActive = config.movementPattern === 'BARBELL_ROW';
      const latMaterial = isBackActive ? activeMuscleMat : skinMat;
      const latLeft = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.12), latMaterial);
      latLeft.position.set(-0.21, 0.04, -0.04);
      latLeft.rotation.z = 0.12;
      torso.add(latLeft);

      const latRight = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.12), latMaterial);
      latRight.position.set(0.21, 0.04, -0.04);
      latRight.rotation.z = -0.12;
      torso.add(latRight);

      // --- 2. Head, Neck & Hair ---
      const neckGeo = new THREE.CylinderGeometry(0.08, 0.095, 0.16, 16);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.y = 0.3;
      torso.add(neckMesh);

      const headGroup = new THREE.Group();
      headGroup.position.y = 0.46;
      torso.add(headGroup);

      // Anatomical Cranium / Face
      const headGeo = new THREE.SphereGeometry(0.125, 24, 24);
      headGeo.scale(0.92, 1.15, 1.05);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.castShadow = true;
      headGroup.add(head);

      // Athletic Fade Hair Cap
      const hairGeo = new THREE.SphereGeometry(0.128, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55);
      hairGeo.scale(0.94, 1.18, 1.06);
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 0.03, -0.01);
      headGroup.add(hairMesh);

      // Jaw & Chin Definition
      const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.08), skinMat);
      jawMesh.position.set(0, -0.07, 0.08);
      headGroup.add(jawMesh);

      // --- 3. Pelvis & Compression Training Shorts ---
      const pelvis = new THREE.Group();
      pelvis.position.y = -0.32;
      torso.add(pelvis);

      const shortsGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.28, 20);
      const shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
      shortsMesh.castShadow = true;
      pelvis.add(shortsMesh);

      // Performance Cyan Waistband
      const waistbandGeo = new THREE.CylinderGeometry(0.203, 0.203, 0.04, 20);
      const waistbandMesh = new THREE.Mesh(waistbandGeo, waistbandMat);
      waistbandMesh.position.y = 0.12;
      pelvis.add(waistbandMesh);

      // --- 4. Shoulders & Arms ---
      const isShoulderActive = config.movementPattern === 'OVERHEAD_PRESS';
      const deltMaterial = isShoulderActive ? activeMuscleMat : skinMat;

      // -- Left Arm
      const leftUpperArm = new THREE.Group();
      leftUpperArm.position.set(-0.31, 0.22, 0);
      torso.add(leftUpperArm);

      // Rounded Deltoid Cap
      const leftDeltGeo = new THREE.SphereGeometry(0.105, 16, 16);
      leftDeltGeo.scale(1.0, 1.25, 1.0);
      const leftDeltMesh = new THREE.Mesh(leftDeltGeo, deltMaterial);
      leftDeltMesh.position.set(0, 0, 0);
      leftUpperArm.add(leftDeltMesh);

      // Muscular Bicep & Tricep Upper Arm
      const leftBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.068, 0.32, 16), skinMat);
      leftBicepMesh.position.y = -0.16;
      leftUpperArm.add(leftBicepMesh);

      const leftForearm = new THREE.Group();
      leftForearm.position.set(0, -0.32, 0);
      leftUpperArm.add(leftForearm);

      // Vascular Tapered Forearm
      const leftForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.3, 16), skinMat);
      leftForearmMesh.position.y = -0.15;
      leftForearm.add(leftForearmMesh);

      // Sculpted Athletic Hand gripping bar
      const leftHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.06), skinMat);
      leftHandMesh.position.set(0, -0.32, 0.01);
      leftForearm.add(leftHandMesh);

      // -- Right Arm
      const rightUpperArm = new THREE.Group();
      rightUpperArm.position.set(0.31, 0.22, 0);
      torso.add(rightUpperArm);

      // Right Deltoid Cap
      const rightDeltGeo = new THREE.SphereGeometry(0.105, 16, 16);
      rightDeltGeo.scale(1.0, 1.25, 1.0);
      const rightDeltMesh = new THREE.Mesh(rightDeltGeo, deltMaterial);
      rightDeltMesh.position.set(0, 0, 0);
      rightUpperArm.add(rightDeltMesh);

      // Right Bicep & Tricep
      const rightBicepMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.068, 0.32, 16), skinMat);
      rightBicepMesh.position.y = -0.16;
      rightUpperArm.add(rightBicepMesh);

      const rightForearm = new THREE.Group();
      rightForearm.position.set(0, -0.32, 0);
      rightUpperArm.add(rightForearm);

      const rightForearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.052, 0.3, 16), skinMat);
      rightForearmMesh.position.y = -0.15;
      rightForearm.add(rightForearmMesh);

      const rightHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.06), skinMat);
      rightHandMesh.position.set(0, -0.32, 0.01);
      rightForearm.add(rightHandMesh);

      // --- 5. Muscular Legs & Athletic Footwear ---
      const isLegActive = config.movementPattern === 'SQUAT' || config.movementPattern === 'ROMANIAN_DEADLIFT';
      const quadMaterial = isLegActive ? activeMuscleMat : skinMat;

      // -- Left Leg
      const leftThigh = new THREE.Group();
      leftThigh.position.set(-0.14, -0.12, 0);
      pelvis.add(leftThigh);

      // Shorts Leg Sleeve
      const leftShortSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.11, 0.16, 16), shortsMat);
      leftShortSleeve.position.y = -0.06;
      leftThigh.add(leftShortSleeve);

      // Muscular Quadricep (Vastus Medialis teardrop curve)
      const leftThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.082, 0.44, 16), quadMaterial);
      leftThighMesh.position.y = -0.22;
      leftThighMesh.castShadow = true;
      leftThigh.add(leftThighMesh);

      const leftShin = new THREE.Group();
      leftShin.position.set(0, -0.44, 0);
      leftThigh.add(leftShin);

      // Defined Gastrocnemius Calf
      const leftShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.058, 0.42, 16), skinMat);
      leftShinMesh.position.y = -0.21;
      leftShinMesh.castShadow = true;
      leftShin.add(leftShinMesh);

      // Cross-Trainer Athletic Shoe (Upper + Performance Sole)
      const leftShoe = new THREE.Group();
      leftShoe.position.set(0, -0.42, 0.04);
      leftShin.add(leftShoe);

      const leftShoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.22), shoeUpperMat);
      leftShoe.add(leftShoeUpper);

      const leftShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.23), shoeSoleMat);
      leftShoeSole.position.y = -0.045;
      leftShoe.add(leftShoeSole);

      // -- Right Leg
      const rightThigh = new THREE.Group();
      rightThigh.position.set(0.14, -0.12, 0);
      pelvis.add(rightThigh);

      const rightShortSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.11, 0.16, 16), shortsMat);
      rightShortSleeve.position.y = -0.06;
      rightThigh.add(rightShortSleeve);

      const rightThighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.108, 0.082, 0.44, 16), quadMaterial);
      rightThighMesh.position.y = -0.22;
      rightThighMesh.castShadow = true;
      rightThigh.add(rightThighMesh);

      const rightShin = new THREE.Group();
      rightShin.position.set(0, -0.44, 0);
      rightThigh.add(rightShin);

      const rightShinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.058, 0.42, 16), skinMat);
      rightShinMesh.position.y = -0.21;
      rightShinMesh.castShadow = true;
      rightShin.add(rightShinMesh);

      const rightShoe = new THREE.Group();
      rightShoe.position.set(0, -0.42, 0.04);
      rightShin.add(rightShoe);

      const rightShoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.22), shoeUpperMat);
      rightShoe.add(rightShoeUpper);

      const rightShoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.23), shoeSoleMat);
      rightShoeSole.position.y = -0.045;
      rightShoe.add(rightShoeSole);

      // --- 6. Competition Olympic Barbell & Calibrated Bumper Plates ---
      const barbellGroup = new THREE.Group();

      // Chrome Olympic Bar Shaft with Knurling
      const barShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 2.1, 16), chromeBarMat);
      barShaft.rotation.z = Math.PI / 2;
      barShaft.castShadow = true;
      barbellGroup.add(barShaft);

      // Rotating Olympic Sleeves
      const sleeveLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.4, 16), chromeBarMat);
      sleeveLeft.rotation.z = Math.PI / 2;
      sleeveLeft.position.x = -0.85;
      barbellGroup.add(sleeveLeft);

      const sleeveRight = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.4, 16), chromeBarMat);
      sleeveRight.rotation.z = Math.PI / 2;
      sleeveRight.position.x = 0.85;
      barbellGroup.add(sleeveRight);

      // Competition 20kg Blue Olympic Bumper Plates (Left & Right)
      const leftPlateBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 32), olympicPlateMat);
      leftPlateBody.rotation.z = Math.PI / 2;
      leftPlateBody.position.x = -0.78;
      barbellGroup.add(leftPlateBody);

      const leftPlateRim = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.02, 16, 32), plateRimMat);
      leftPlateRim.rotation.y = Math.PI / 2;
      leftPlateRim.position.x = -0.78;
      barbellGroup.add(leftPlateRim);

      const rightPlateBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 32), olympicPlateMat);
      rightPlateBody.rotation.z = Math.PI / 2;
      rightPlateBody.position.x = 0.78;
      barbellGroup.add(rightPlateBody);

      const rightPlateRim = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.02, 16, 32), plateRimMat);
      rightPlateRim.rotation.y = Math.PI / 2;
      rightPlateRim.position.x = 0.78;
      barbellGroup.add(rightPlateRim);

      // Spring Locking Collars
      const collarLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), collarMat);
      collarLeft.rotation.z = Math.PI / 2;
      collarLeft.position.x = -0.73;
      barbellGroup.add(collarLeft);

      const collarRight = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), collarMat);
      collarRight.rotation.z = Math.PI / 2;
      collarRight.position.x = 0.73;
      barbellGroup.add(collarRight);

      scene.add(barbellGroup);

      // --- 7. Heavy-Duty Gym Workout Bench ---
      const benchGroup = new THREE.Group();

      // Ergonomic Padded Vinyl Bench Pad
      const benchPad = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.11, 1.35), benchVinylMat);
      benchPad.position.set(0, 0.44, 0);
      benchPad.castShadow = true;
      benchGroup.add(benchPad);

      // Heavy Gauge Steel Bench Frame & Legs
      const benchFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
      const benchSpine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.25), benchFrameMat);
      benchSpine.position.set(0, 0.35, 0);
      benchGroup.add(benchSpine);

      const benchLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 16), benchFrameMat);
      benchLeg1.position.set(0, 0.22, 0.52);
      benchGroup.add(benchLeg1);

      const benchFoot1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.1), benchFrameMat);
      benchFoot1.position.set(0, 0.02, 0.52);
      benchGroup.add(benchFoot1);

      const benchLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 16), benchFrameMat);
      benchLeg2.position.set(0, 0.22, -0.52);
      benchGroup.add(benchLeg2);

      const benchFoot2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 0.1), benchFrameMat);
      benchFoot2.position.set(0, 0.02, -0.52);
      benchGroup.add(benchFoot2);

      scene.add(benchGroup);
      benchGroup.visible = config.movementPattern === 'BENCH_PRESS';

      rigRef.current = {
        rootGroup,
        torso: ribcageMesh,
        chestMesh,
        head,
        leftUpperArm,
        leftForearm,
        rightUpperArm,
        rightForearm,
        pelvis: shortsMesh,
        leftThigh,
        leftShin,
        rightThigh,
        rightShin,
        barbellGroup,
        benchGroup,
      };

      // 7. Resize Observer — keep renderer & camera synced to container
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const rw = container.clientWidth;
        const rh = container.clientHeight;
        if (rw === 0 || rh === 0) return;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      };

      window.addEventListener('resize', handleResize);

      // 8. Animation & Render Loop
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        animFrameIdRef.current = requestAnimationFrame(animate);

        const delta = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        // Update playback time if playing
        if (isPlayingRef.current) {
          timeRef.current += delta * speedRef.current * 1.6;
        }

        const cycle = timeRef.current % (Math.PI * 2);
        const progress = cycle / (Math.PI * 2);
        setTimelineProgress(progress);

        // Smooth camera interpolation
        if (camera) {
          camera.position.lerp(targetCamPosRef.current, 0.08);
          camera.lookAt(targetCamLookRef.current);
        }

        // Procedural Skeletal Inverse Kinematics / Articulation Curves
        const rig = rigRef.current;
        if (rig) {
          const pattern = config.movementPattern;
          const sinVal = Math.sin(cycle); // -1 to 1
          const normSin = (sinVal + 1) / 2; // 0 to 1 (0 = bottom / eccentric, 1 = apex)

          if (pattern === 'BENCH_PRESS') {
            // Horizontal supine orientation
            rig.rootGroup.position.set(0, 0.55, 0);
            rig.rootGroup.rotation.set(-Math.PI / 2, 0, 0);
            rig.benchGroup.visible = true;

            // Upper Arms flare & press
            const armAngle = THREE.MathUtils.lerp(-0.3, 0.6, normSin);
            rig.leftUpperArm.rotation.set(0, 0, armAngle);
            rig.rightUpperArm.rotation.set(0, 0, -armAngle);

            rig.leftForearm.rotation.set(0, 0, THREE.MathUtils.lerp(1.2, 0.2, normSin));
            rig.rightForearm.rotation.set(0, 0, THREE.MathUtils.lerp(-1.2, -0.2, normSin));

            // Barbell vertical path over chest
            const barY = THREE.MathUtils.lerp(0.68, 1.15, normSin);
            rig.barbellGroup.position.set(0, barY, 0.05);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else if (pattern === 'SQUAT') {
            // Standing back squat
            rig.rootGroup.position.set(0, 0, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;

            const squatDepth = THREE.MathUtils.lerp(-0.45, 0, normSin);
            rig.torso.position.y = 1.35 + squatDepth;
            rig.torso.rotation.x = THREE.MathUtils.lerp(0.35, 0.05, normSin); // Hip hinge lean

            // Thighs & Shins flexion
            const hipAngle = THREE.MathUtils.lerp(-1.3, -0.05, normSin);
            const kneeAngle = THREE.MathUtils.lerp(1.5, 0.1, normSin);

            rig.leftThigh.rotation.x = hipAngle;
            rig.rightThigh.rotation.x = hipAngle;
            rig.leftShin.rotation.x = kneeAngle;
            rig.rightShin.rotation.x = kneeAngle;

            // Arms holding bar behind neck
            rig.leftUpperArm.rotation.set(-0.6, 0, 0.8);
            rig.rightUpperArm.rotation.set(-0.6, 0, -0.8);
            rig.leftForearm.rotation.set(1.4, 0, 0);
            rig.rightForearm.rotation.set(1.4, 0, 0);

            // Bar resting on traps
            rig.barbellGroup.position.set(0, 1.4 + squatDepth, -0.06);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else if (pattern === 'BARBELL_ROW') {
            rig.rootGroup.position.set(0, 0, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;

            rig.torso.position.y = 1.05;
            rig.torso.rotation.x = 0.75; // 45 degree bent over torso

            // Rowing arms pull
            const pullAngle = THREE.MathUtils.lerp(-0.7, 0.3, normSin);
            rig.leftUpperArm.rotation.set(pullAngle, 0, 0.2);
            rig.rightUpperArm.rotation.set(pullAngle, 0, -0.2);
            rig.leftForearm.rotation.set(THREE.MathUtils.lerp(0.8, 1.4, normSin), 0, 0);
            rig.rightForearm.rotation.set(THREE.MathUtils.lerp(0.8, 1.4, normSin), 0, 0);

            const barY = THREE.MathUtils.lerp(0.45, 0.85, normSin);
            const barZ = THREE.MathUtils.lerp(0.45, 0.25, normSin);
            rig.barbellGroup.position.set(0, barY, barZ);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else if (pattern === 'OVERHEAD_PRESS') {
            rig.rootGroup.position.set(0, 0, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;

            rig.torso.position.y = 1.35;
            rig.torso.rotation.x = 0;

            // Standing press overhead
            const pressY = THREE.MathUtils.lerp(1.4, 2.15, normSin);
            rig.leftUpperArm.rotation.set(0, 0, THREE.MathUtils.lerp(0.3, 1.5, normSin));
            rig.rightUpperArm.rotation.set(0, 0, THREE.MathUtils.lerp(-0.3, -1.5, normSin));
            rig.leftForearm.rotation.set(THREE.MathUtils.lerp(1.2, 0.1, normSin), 0, 0);
            rig.rightForearm.rotation.set(THREE.MathUtils.lerp(1.2, 0.1, normSin), 0, 0);

            rig.barbellGroup.position.set(0, pressY, 0.05);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else if (pattern === 'ROMANIAN_DEADLIFT') {
            rig.rootGroup.position.set(0, 0, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;

            // Hip hinge
            const hingeAngle = THREE.MathUtils.lerp(1.1, 0.05, normSin);
            rig.torso.position.y = THREE.MathUtils.lerp(1.0, 1.35, normSin);
            rig.torso.rotation.x = hingeAngle;

            rig.leftThigh.rotation.x = THREE.MathUtils.lerp(-0.2, 0, normSin);
            rig.rightThigh.rotation.x = THREE.MathUtils.lerp(-0.2, 0, normSin);

            const barY = THREE.MathUtils.lerp(0.45, 0.95, normSin);
            const barZ = THREE.MathUtils.lerp(0.35, 0.15, normSin);
            rig.barbellGroup.position.set(0, barY, barZ);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else if (pattern === 'LEG_RAISE') {
            rig.rootGroup.position.set(0, 0.5, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;

            // Hanging arms overhead
            rig.leftUpperArm.rotation.set(0, 0, 2.8);
            rig.rightUpperArm.rotation.set(0, 0, -2.8);

            // Legs lifting to 90 deg
            const legLift = THREE.MathUtils.lerp(-1.5, 0, normSin);
            rig.leftThigh.rotation.x = legLift;
            rig.rightThigh.rotation.x = legLift;
            rig.leftShin.rotation.x = 0;
            rig.rightShin.rotation.x = 0;

            rig.barbellGroup.position.set(0, 2.3, 0);
            rig.barbellGroup.rotation.set(0, 0, 0);
          } else {
            // DEFAULT_COMPOUND — generic standing animation
            rig.rootGroup.position.set(0, 0, 0);
            rig.rootGroup.rotation.set(0, 0, 0);
            rig.benchGroup.visible = false;
            const armSwing = THREE.MathUtils.lerp(-0.3, 0.3, normSin);
            rig.leftUpperArm.rotation.set(armSwing, 0, 0.15);
            rig.rightUpperArm.rotation.set(-armSwing, 0, -0.15);
          }
        }

        renderer.render(scene, camera);
      };

      animFrameIdRef.current = requestAnimationFrame(animate);

      // Store cleanup for this scene
      cleanupScene = () => {
        window.removeEventListener('resize', handleResize);
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = null;
        }

        // Dispose geometries and materials
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            if (obj.geometry) obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });

        renderer.dispose();
        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        rigRef.current = null;
      };
    };

    // --- Try to init immediately if container already has size ---
    const immediateW = container.clientWidth;
    const immediateH = container.clientHeight;

    if (immediateW > 0 && immediateH > 0) {
      initScene(immediateW, immediateH);
    } else {
      // Container not yet laid out — defer via ResizeObserver
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0 && !initialized) {
            initScene(width, height);
            // Stop observing once initialized
            resizeObserver?.disconnect();
            resizeObserver = null;
          }
        }
      });
      resizeObserver.observe(container);

      // Safety fallback: also try after a few animation frames in case ResizeObserver is delayed
      let attempts = 0;
      const tryInit = () => {
        attempts++;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w > 0 && h > 0 && !initialized) {
          initScene(w, h);
          resizeObserver?.disconnect();
          resizeObserver = null;
        } else if (!initialized && attempts < 10) {
          rafId = requestAnimationFrame(tryInit);
        }
      };
      rafId = requestAnimationFrame(tryInit);
    }

    // 9. Thorough cleanup on unmount or config change
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resizeObserver?.disconnect();
      resizeObserver = null;
      cleanupScene?.();
    };
  }, [config]);

  return {
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    timelineProgress,
    scrubTimeline,
    activeCameraAngle,
    setCameraPreset,
    isWebGlSupported
  };
}
