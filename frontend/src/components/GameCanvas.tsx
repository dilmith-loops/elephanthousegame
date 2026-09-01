'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { Player, PopsicleItem, SplashParticle, ScorePopup, FaceMouthState } from '../types/game';
import { FLAVORS, drawPopsicle } from '../lib/sprites';
import { sound } from '../lib/audio';
import { api } from '../lib/api';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  StopCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  Camera,
  AlertTriangle,
  Flame,
  Award,
  Pause,
  Play,
  X
} from 'lucide-react';

interface Props {
  player: Player;
  isPaused?: boolean;
  onEndGame: (finalScore: number) => void;
  onOpenLeaderboard: () => void;
  onChangePlayer: () => void;
}

// Intercept C++ WASM INFO logs so Next.js dev overlay does not mistake them for JavaScript runtime errors
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].startsWith('INFO:') ||
        args[0].includes('TensorFlow Lite') ||
        args[0].includes('XNNPACK') ||
        args[0].includes('face_landmarker'))
    ) {
      console.info(...args);
      return;
    }
    origError.apply(console, args);
  };
}

// Global Singleton for FaceLandmarker to avoid React StrictMode double-mount destruction
let globalLandmarker: FaceLandmarker | null = null;
let globalLandmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (globalLandmarker) return globalLandmarker;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!globalLandmarkerPromise) {
    globalLandmarkerPromise = (async () => {
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(`${basePath}/wasm`);
      } catch (localWasmErr) {
        console.warn('Local WASM fallback to CDN:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
      }

      const modelUrls = [
        `${basePath}/models/face_landmarker.task`,
        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
      ];

      for (const modelPath of modelUrls) {
        try {
          globalLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: 'GPU'
            },
            runningMode: 'VIDEO',
            numFaces: 1
          });
          if (globalLandmarker) return globalLandmarker;
        } catch (gpuErr) {
          console.warn(`GPU delegate failed for ${modelPath}, trying CPU:`, gpuErr);
          try {
            globalLandmarker = await FaceLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: modelPath,
                delegate: 'CPU'
              },
              runningMode: 'VIDEO',
              numFaces: 1
            });
            if (globalLandmarker) return globalLandmarker;
          } catch (cpuErr) {
            console.warn(`CPU delegate failed for ${modelPath}:`, cpuErr);
          }
        }
      }

      if (!globalLandmarker) {
        throw new Error('Could not initialize FaceLandmarker on this device.');
      }
      return globalLandmarker;
    })();
  }
  return globalLandmarkerPromise;
}

export default function GameCanvas({
  player,
  isPaused = false,
  onEndGame,
  onOpenLeaderboard,
  onChangePlayer
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [loadingAI, setLoadingAI] = useState(true);
  const [loadingCamera, setLoadingCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [catches, setCatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameDuration, setGameDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ rank?: number; personal_best?: number } | null>(null);
  const [showEndGameConfirm, setShowEndGameConfirm] = useState(false);

  // Game Engine Refs
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastDetectTimestampRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const isPausedRef = useRef(isPaused || showEndGameConfirm);
  isPausedRef.current = isPaused || showEndGameConfirm;

  const popsiclesRef = useRef<PopsicleItem[]>([]);
  const particlesRef = useRef<SplashParticle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const mouthStateRef = useRef<FaceMouthState>({
    isDetected: false,
    mouthCenter: { x: 0, y: 0 },
    mouthWidth: 0,
    mouthHeight: 0,
    mar: 0,
    isTongueOut: false
  });
  const scoreRef = useRef(0);
  const catchesRef = useRef(0);
  const comboRef = useRef(0);
  const isGameOverRef = useRef(false);

  // Sound toggle
  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Periodic Active Player Heartbeat Ping
  useEffect(() => {
    if (!player.id) return;
    api.sendPlayerPing(player.id);
    const interval = setInterval(() => {
      api.sendPlayerPing(player.id);
    }, 25000);
    return () => clearInterval(interval);
  }, [player.id]);

  // Initialize MediaPipe Face Landmarker via Singleton
  useEffect(() => {
    let isMounted = true;

    getFaceLandmarker()
      .then((landmarker) => {
        if (isMounted) {
          faceLandmarkerRef.current = landmarker;
          setLoadingAI(false);
        }
      })
      .catch((err) => {
        console.error('Error initializing MediaPipe:', err);
        if (isMounted) {
          setCameraError('Face AI model could not be loaded. Please refresh the page.');
          setLoadingAI(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Camera
  useEffect(() => {
    let isMounted = true;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        setLoadingCamera(true);
        setCameraError(null);

        // Check if mediaDevices is supported (requires HTTPS on mobile)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera requires HTTPS. Please access via secure https:// domain.');
        }

        const isMobile = typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const idealW = isMobile ? 640 : 1280;
        const idealH = isMobile ? 480 : 720;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: idealW, max: 1280 },
              height: { ideal: idealH, max: 720 },
              frameRate: { ideal: 30, max: 60 }
            },
            audio: false
          });
        } catch {
          // Fallback to basic user camera constraint for all mobile devices
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
          });
        }

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
          videoRef.current.muted = true;
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
            } catch (playErr) {
              console.warn('Video auto-play handled:', playErr);
            }
            if (isMounted) {
              setLoadingCamera(false);
            }
          };
        }
      } catch (err: unknown) {
        console.error('Camera access error:', err);
        if (isMounted) {
          const errMsg = err instanceof Error ? err.message : '';
          setCameraError(
            errMsg.includes('HTTPS')
              ? errMsg
              : 'Please allow front camera access in your browser settings to play the Tongue Catch game.'
          );
          setLoadingCamera(false);
        }
      }
    }

    startCamera();
    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Countdown Loop before game start
  useEffect(() => {
    if (loadingAI || loadingCamera || cameraError || isPaused) return;

    if (countdown !== null && countdown > 0) {
      sound.playCountdown(false);
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sound.playCountdown(true);
      const timer = setTimeout(() => {
        setCountdown(null);
        const startTime = Date.now();
        setGameStartTime(startTime);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [countdown, loadingAI, loadingCamera, cameraError, isPaused]);

  // Handle Score & Particles on Catch
  const handleCatch = useCallback((popsicle: PopsicleItem, mouthPos: { x: number; y: number }) => {
    const pts = popsicle.points || 1;
    scoreRef.current += pts;
    catchesRef.current += 1;
    comboRef.current += 1;

    setScore(scoreRef.current);
    setCatches(catchesRef.current);
    setCombo(comboRef.current);
    setMaxCombo((prev) => Math.max(prev, comboRef.current));

    // Sound effect
    if (popsicle.type === 'golden_star') {
      sound.playGoldenCatch();
    } else if (comboRef.current > 2 && comboRef.current % 3 === 0) {
      sound.playCombo(comboRef.current);
    } else {
      sound.playCatch(pts);
    }

    // Spawn Juicy Particles
    const flavor = FLAVORS[popsicle.type];
    const particleColors = [flavor.primaryColor, flavor.secondaryColor, '#FFFFFF', '#FFEB3B'];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: mouthPos.x,
        y: mouthPos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 5,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }

    // Spawn Score Popup
    const popupText = pts > 1 ? `+${pts} ${flavor.name}!` : comboRef.current > 3 ? `+${pts} (${comboRef.current}x Combo!)` : `+${pts} Marks!`;
    scorePopupsRef.current.push({
      x: mouthPos.x,
      y: mouthPos.y - 20,
      text: popupText,
      color: flavor.primaryColor,
      alpha: 1,
      vy: -2.2
    });
  }, []);

  // End Game and Submit Score
  const endGame = useCallback(async () => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    setIsGameOver(true);

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    sound.playGameOver();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const elapsed = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
    setGameDuration(elapsed);
    setIsSubmitting(true);

    try {
      const res = await api.submitScore({
        user_id: player.id,
        score: scoreRef.current,
        popsicles_caught: catchesRef.current,
        duration_seconds: elapsed
      });
      setSubmissionResult({
        rank: res.rank,
        personal_best: res.personal_best
      });
      const newHigh = Math.max(player.highest_score || 0, scoreRef.current);
      localStorage.setItem(
        'eh_player',
        JSON.stringify({ ...player, highest_score: newHigh })
      );
      onEndGame(scoreRef.current);
    } catch (err) {
      console.error('Failed to submit score:', err);
      const newHigh = Math.max(player.highest_score || 0, scoreRef.current);
      localStorage.setItem(
        'eh_player',
        JSON.stringify({ ...player, highest_score: newHigh })
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [gameStartTime, onEndGame, player]);

  // Request End Game (Pauses gameplay & opens custom confirmation dialog)
  const handleRequestEndGame = () => {
    if (countdown !== null || isGameOver) return;
    pauseStartTimeRef.current = Date.now();
    setShowEndGameConfirm(true);
  };

  // Resume Game from End Game Dialog
  const handleResumeGame = () => {
    if (pauseStartTimeRef.current > 0) {
      const pausedDuration = Date.now() - pauseStartTimeRef.current;
      setGameStartTime((prev) => prev + pausedDuration);
      pauseStartTimeRef.current = 0;
    }
    setShowEndGameConfirm(false);
  };

  // Confirm End Game & Submit Score
  const handleConfirmEndGame = () => {
    setShowEndGameConfirm(false);
    endGame();
  };

  // Main AR Canvas Game Loop
  useEffect(() => {
    if (loadingAI || loadingCamera || countdown !== null || isGameOver) return;

    let lastTime = performance.now();
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!canvas || !video || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = (timestamp: number) => {
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      // Check if paused
      const currentlyPaused = isPausedRef.current;

      // Dynamic screen-adaptive canvas sizing
      const rect = container.getBoundingClientRect();
      const screenW = rect.width || window.innerWidth;
      const screenH = rect.height || window.innerHeight;

      if (canvas.width !== screenW || canvas.height !== screenH) {
        canvas.width = screenW;
        canvas.height = screenH;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Calculate object-fit: cover transform for camera feed
      const videoW = video.videoWidth || 1280;
      const videoH = video.videoHeight || 720;
      const videoAspect = videoW / videoH;
      const screenAspect = width / height;

      let renderW: number;
      let renderH: number;
      let offsetX: number;
      let offsetY: number;

      if (videoAspect > screenAspect) {
        renderH = height;
        renderW = height * videoAspect;
        offsetX = (width - renderW) / 2;
        offsetY = 0;
      } else {
        renderW = width;
        renderH = width / videoAspect;
        offsetX = 0;
        offsetY = (height - renderH) / 2;
      }

      // Draw Mirrored Camera Frame
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, -(offsetX + renderW - width), offsetY, renderW, renderH);
      ctx.restore();

      // Run Face Landmarker throttled to ~26 FPS to eliminate mobile CPU/GPU lag while maintaining 60 FPS camera canvas
      const landmarker = faceLandmarkerRef.current || globalLandmarker;
      const detectInterval = 38; // 38ms interval = ~26 detections/sec (smooth & lag-free)
      if (
        !currentlyPaused &&
        landmarker &&
        video.readyState >= 2 &&
        timestamp - lastDetectTimestampRef.current >= detectInterval
      ) {
        lastDetectTimestampRef.current = timestamp;
        lastVideoTimeRef.current = video.currentTime;

        try {
          const results = landmarker.detectForVideo(video, timestamp);
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];

            // Upper lip = 13, Lower lip = 14, Left corner = 78, Right corner = 308
            const upperLip = landmarks[13];
            const lowerLip = landmarks[14];
            const leftCorner = landmarks[78];
            const rightCorner = landmarks[308];

            const rawVx = (upperLip.x + lowerLip.x) / 2;
            const rawVy = (upperLip.y + lowerLip.y) / 2;
            const targetMouthX = (1 - rawVx) * renderW + offsetX;
            const targetMouthY = rawVy * renderH + offsetY + 10;

            const lipDistanceY = Math.abs(lowerLip.y - upperLip.y) * renderH;
            const lipDistanceX = Math.abs(rightCorner.x - leftCorner.x) * renderW;
            const mar = lipDistanceY / (lipDistanceX || 1);

            // Responsive mouth/tongue open threshold
            const open = mar > 0.22 || lipDistanceY > 16;
            setIsMouthOpen(open);

            // Smooth linear interpolation (LERP) for jitter-free tracking
            const prevMouth = mouthStateRef.current;
            const smoothX = prevMouth.isDetected
              ? prevMouth.mouthCenter.x + (targetMouthX - prevMouth.mouthCenter.x) * 0.6
              : targetMouthX;
            const smoothY = prevMouth.isDetected
              ? prevMouth.mouthCenter.y + (targetMouthY - prevMouth.mouthCenter.y) * 0.6
              : targetMouthY;

            mouthStateRef.current = {
              isDetected: true,
              mouthCenter: { x: smoothX, y: smoothY },
              mouthWidth: lipDistanceX,
              mouthHeight: lipDistanceY,
              mar: mar,
              isTongueOut: open
            };
          } else {
            mouthStateRef.current.isDetected = false;
            setIsMouthOpen(false);
          }
        } catch {
          // frame drops gracefully handled
        }
      }

      // Draw Mouth Target / Catch Glow Aura if detected
      const mouth = mouthStateRef.current;
      if (mouth.isDetected && !currentlyPaused) {
        ctx.save();
        if (mouth.isTongueOut) {
          const grad = ctx.createRadialGradient(
            mouth.mouthCenter.x,
            mouth.mouthCenter.y + 8,
            4,
            mouth.mouthCenter.x,
            mouth.mouthCenter.y + 8,
            48
          );
          grad.addColorStop(0, 'rgba(255, 64, 129, 0.7)');
          grad.addColorStop(0.5, 'rgba(255, 171, 0, 0.45)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(mouth.mouthCenter.x, mouth.mouthCenter.y + 8, 48, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('👅', mouth.mouthCenter.x, mouth.mouthCenter.y + 12);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(mouth.mouthCenter.x, mouth.mouthCenter.y + 6, 28, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // Spawn Falling Popsicles (Only when NOT paused)
      const now = timestamp;
      const spawnInterval = Math.max(650, 1400 - scoreRef.current * 20);
      if (!currentlyPaused && now - lastSpawnTimeRef.current > spawnInterval) {
        lastSpawnTimeRef.current = now;

        const rand = Math.random();
        let flavorType: keyof typeof FLAVORS = 'chocobar';
        if (rand < 0.28) flavorType = 'chocobar';
        else if (rand < 0.52) flavorType = 'berry_rocket';
        else if (rand < 0.74) flavorType = 'mango_pop';
        else if (rand < 0.88) flavorType = 'twister';
        else if (rand < 0.96) flavorType = 'wonder_cone';
        else flavorType = 'golden_star';

        const flavor = FLAVORS[flavorType];
        const spawnX = Math.random() * (width - 100) + 50;
        const fallSpeed = 130 + Math.random() * 80 + Math.min(110, scoreRef.current * 3);

        popsiclesRef.current.push({
          id: Math.random().toString(),
          type: flavorType,
          x: spawnX,
          y: -70,
          speed: fallSpeed,
          size: 65,
          rotation: (Math.random() - 0.5) * 0.4,
          rotationSpeed: (Math.random() - 0.5) * 0.8,
          points: flavor.points,
          caught: false,
          opacity: 1,
          flavorName: flavor.name,
          color: flavor.primaryColor
        });
      }

      // Update & Draw Popsicles
      const catchRadius = Math.max(42, (mouth.mouthWidth || 35) * 0.75);

      for (let i = popsiclesRef.current.length - 1; i >= 0; i--) {
        const item = popsiclesRef.current[i];

        if (!currentlyPaused) {
          item.y += item.speed * dt;
          item.rotation += item.rotationSpeed * dt;

          // Collision Check with Mouth/Tongue
          if (!item.caught && mouth.isDetected && mouth.isTongueOut) {
            const popsicleTipY = item.y + 20;
            const dist = Math.hypot(item.x - mouth.mouthCenter.x, popsicleTipY - mouth.mouthCenter.y);

            if (dist < catchRadius + 28) {
              item.caught = true;
              handleCatch(item, mouth.mouthCenter);
              popsiclesRef.current.splice(i, 1);
              continue;
            }
          }

          // Check if missed
          if (item.y > height + 80) {
            if (comboRef.current > 0) {
              comboRef.current = 0;
              setCombo(0);
            }
            popsiclesRef.current.splice(i, 1);
            continue;
          }
        }

        drawPopsicle(ctx, item.type, item.x, item.y, item.size, item.rotation, item.opacity);
      }

      // Update & Draw Splash Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (!currentlyPaused) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Update & Draw Score Popups
      for (let i = scorePopupsRef.current.length - 1; i >= 0; i--) {
        const sp = scorePopupsRef.current[i];
        if (!currentlyPaused) {
          sp.y += sp.vy;
          sp.alpha -= 0.025;

          if (sp.alpha <= 0) {
            scorePopupsRef.current.splice(i, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = sp.alpha;
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, sp.x, sp.y);
        ctx.restore();
      }

      if (!isGameOverRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [loadingAI, loadingCamera, countdown, isGameOver, handleCatch]);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] flex flex-col bg-slate-950 overflow-hidden select-none">
      {/* Hidden Video for Camera Stream (Invisible without display:none for iOS Safari decoding) */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none w-1 h-1"
      />

      {/* Top HUD Header */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3 md:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-extrabold text-sm md:text-base">
              {player.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs md:text-sm font-bold text-white max-w-[120px] md:max-w-[180px] truncate">
                {player.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/30 text-pink-300 font-bold border border-pink-500/40">
                Playing
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300 mt-0.5">
              <span className="font-extrabold text-amber-400 text-sm md:text-base tracking-wide flex items-center space-x-1">
                <span>{score}</span>
                <span className="text-[11px] uppercase font-bold text-amber-300">Marks</span>
              </span>
              {combo > 1 && (
                <span className="inline-flex items-center space-x-1 text-xs font-black text-rose-400 animate-pulse bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{combo}x Combo!</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="p-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 backdrop-blur-md border border-amber-500/30 transition-all flex items-center space-x-1 text-xs font-bold cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Rank</span>
          </button>

          <button
            onClick={handleRequestEndGame}
            disabled={countdown !== null || isGameOver}
            className="px-3.5 py-2 md:px-4 md:py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs md:text-sm shadow-lg shadow-red-600/30 flex items-center space-x-1.5 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <StopCircle className="w-4 h-4 fill-white" />
            <span>End Game</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport Container */}
      <div ref={containerRef} className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Loading Overlay */}
        {(loadingAI || loadingCamera) && !cameraError && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white p-6 text-center">
            <div className="w-16 h-16 relative mb-4">
              <div className="w-full h-full border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin"></div>
              <Camera className="w-6 h-6 text-pink-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-pink-400 mb-1">Starting Elephant House AR Camera</h2>
            <p className="text-xs text-slate-400 max-w-xs">
              {loadingAI ? 'Initializing Face & Tongue AI Tracking...' : 'Accessing front camera...'}
            </p>
          </div>
        )}

        {/* Camera Error Overlay */}
        {cameraError && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-lg text-white p-6 text-center">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mb-4 border border-red-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-extrabold text-red-400 mb-2">Camera Access Required</h2>
            <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
              {cameraError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl text-sm shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && !loadingAI && !loadingCamera && !cameraError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <div className="text-center animate-bounce">
              <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 drop-shadow-2xl">
                {countdown === 0 ? 'GO!' : countdown}
              </div>
              <p className="text-white text-sm md:text-base font-extrabold mt-3 drop-shadow-md">
                Open your mouth & stick out your tongue to catch popsicles! 👅🍦
              </p>
            </div>
          </div>
        )}

        {/* Paused Overlay Pill */}
        {isPaused && countdown === null && !isGameOver && (
          <div className="absolute top-20 inset-x-0 z-30 flex justify-center pointer-events-none px-4 animate-fade-in">
            <div className="px-5 py-2.5 rounded-full bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs font-black flex items-center space-x-2 shadow-xl">
              <Pause className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Game Paused — Resume when dialog closes</span>
            </div>
          </div>
        )}

        {/* Bottom Live Tongue Guidance Pill */}
        {countdown === null && !isGameOver && !isPaused && (
          <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
            <div
              className={`px-4 py-2 rounded-full backdrop-blur-md text-xs font-black flex items-center space-x-2 border transition-all duration-300 ${
                isMouthOpen
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50 scale-105 shadow-lg shadow-emerald-500/20'
                  : 'bg-black/60 text-slate-300 border-white/20'
              }`}
            >
              <span className="text-base">{isMouthOpen ? '👅' : '👄'}</span>
              <span>{isMouthOpen ? 'Mouth Open! Catching Active!' : 'Open mouth & stick out tongue!'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Over / Results Summary Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 text-center shadow-2xl border border-pink-500/30">
            <div className="w-20 h-20 mx-auto -mt-12 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 rounded-3xl p-1 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mt-4">
              Game Finished!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Great catch session, {player.name}! 🍦
            </p>

            {/* Score Showcase */}
            <div className="my-6 p-4 bg-gradient-to-br from-pink-50 to-amber-50 dark:from-pink-950/40 dark:to-amber-950/30 rounded-2xl border border-pink-200 dark:border-pink-800/40">
              <div className="text-xs uppercase tracking-wider font-extrabold text-pink-600 dark:text-pink-400">
                Your Total Score
              </div>
              <div className="text-5xl font-black bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent my-1">
                {score}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                Marks Earned
              </p>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-pink-200/60 dark:border-pink-800/40 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Caught</p>
                  <p className="font-black text-slate-800 dark:text-slate-200 text-sm mt-0.5">{catches} 🍦</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Max Combo</p>
                  <p className="font-black text-rose-500 text-sm mt-0.5">{maxCombo}x 🔥</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Time</p>
                  <p className="font-black text-slate-800 dark:text-slate-200 text-sm mt-0.5">{gameDuration}s ⏱️</p>
                </div>
              </div>
            </div>

            {/* Submission / Ranking Status */}
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400 my-3">
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving your marks to Elephant House Leaderboard...</span>
              </div>
            ) : (
              submissionResult && (
                <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-5">
                  <Award className="w-4 h-4" />
                  <span>
                    Score Saved! {submissionResult.rank ? `Leaderboard Rank: #${submissionResult.rank}` : 'Recorded successfully!'}
                  </span>
                </div>
              )
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setIsGameOver(false);
                  isGameOverRef.current = false;
                  scoreRef.current = 0;
                  catchesRef.current = 0;
                  comboRef.current = 0;
                  setScore(0);
                  setCatches(0);
                  setCombo(0);
                  setCountdown(3);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-extrabold rounded-2xl shadow-lg shadow-pink-500/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
                <Sparkles className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenLeaderboard}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>Leaderboard</span>
                </button>

                <button
                  onClick={onChangePlayer}
                  className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>Switch Player</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom End Game Confirmation Dialog */}
      {showEndGameConfirm && !isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleResumeGame}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-3.5 shadow-lg shadow-rose-500/10 animate-pulse">
                <StopCircle className="w-8 h-8" />
              </div>

              <h2 className="text-xl font-black text-white">
                End Current Game?
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Game is currently <strong className="text-amber-400">paused</strong>. Would you like to finish now and submit your score?
              </p>
            </div>

            {/* Current Session Stats Preview */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/70 text-center mb-5">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-base font-black text-pink-400">{score}</div>
              </div>
              <div className="border-x border-slate-700/80">
                <div className="text-[10px] uppercase font-bold text-slate-400">Caught</div>
                <div className="text-base font-black text-amber-400">{catches} 🍦</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Time</div>
                <div className="text-base font-black text-cyan-400">
                  {Math.max(1, Math.round((Date.now() - gameStartTime - (Date.now() - (pauseStartTimeRef.current || Date.now()))) / 1000))}s
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleResumeGame}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Keep Playing</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmEndGame}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <StopCircle className="w-4 h-4" />
                <span>End & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
