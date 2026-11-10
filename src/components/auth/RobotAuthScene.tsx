import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lottie } from 'lottie-react';
import { cn } from '../../lib/utils';

export type AnimationScene = 'robot' | 'welcome' | 'study' | 'studying';

interface RobotAuthSceneProps {
  focusedField?: 'email' | 'password' | 'name' | 'general' | null;
  authMode?: 'signin' | 'signup';
  className?: string;
  activeScene?: AnimationScene;
  onSceneChange?: (scene: AnimationScene) => void;
}

export const RobotAuthScene: React.FC<RobotAuthSceneProps> = ({
  focusedField = null,
  className,
  activeScene: propActiveScene,
  onSceneChange,
}) => {
  const robotSvgRef = useRef<SVGSVGElement>(null);
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);

  // Active scene: 'robot' (1) -> 'welcome' (2) -> 'study' (3) -> 'studying' (4) -> loops back to 'robot' (1)
  const [internalScene, setInternalScene] = useState<AnimationScene>('robot');
  const activeScene = propActiveScene ?? internalScene;

  const setActiveScene = (updater: AnimationScene | ((prev: AnimationScene) => AnimationScene)) => {
    const next = typeof updater === 'function' ? updater(activeScene) : updater;
    if (propActiveScene === undefined) {
      setInternalScene(next);
    }
    onSceneChange?.(next);
  };

  // Lottie animation data for scenes 2, 3, and 4
  const [welcomeData, setWelcomeData] = useState<unknown>(null);
  const [studyData, setStudyData] = useState<unknown>(null);
  const [studyingData, setStudyingData] = useState<unknown>(null);

  // Robot internal animation state flags
  const [isBlinking, setIsBlinking] = useState(false);
  const [scanPulse, setScanPulse] = useState(false);

  // Animation frame and timing refs
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sceneRef = useRef<AnimationScene>('robot');
  sceneRef.current = activeScene;

  // Preload Lottie JSON files immediately
  useEffect(() => {
    // 1. Preload Welcome Animation (Scene 2)
    fetch('/welcome-animation.json')
      .then((res) => {
        if (!res.ok) throw new Error('Local welcome json failed');
        return res.json();
      })
      .then((data) => setWelcomeData(data))
      .catch((err) => {
        console.warn('Falling back to remote Welcome CDN:', err);
        fetch('https://assets-v2.lottiefiles.com/a/94c7b73c-1163-11ee-8a5e-6b8fc5c6abab/ITFeQFRsNW.json')
          .then((r) => r.json())
          .then((d) => setWelcomeData(d))
          .catch((e) => console.error('Welcome Lottie fetch error:', e));
      });

    // 2. Preload Study Animation (Scene 3 - Qr5M6uHmNh)
    fetch('/study-animation.json')
      .then((res) => {
        if (!res.ok) throw new Error('Local study json failed');
        return res.json();
      })
      .then((data) => setStudyData(data))
      .catch((err) => {
        console.warn('Falling back to remote Study CDN:', err);
        fetch('https://assets-v2.lottiefiles.com/a/0a33a03e-116f-11ee-961f-fb96c55b04a6/CZHKrVkjEG.json')
          .then((r) => r.json())
          .then((d) => setStudyData(d))
          .catch((e) => console.error('Study Lottie fetch error:', e));
      });

    // 3. Preload Studying Animation (Scene 4 - SYVjZJCscj)
    fetch('/studying-animation.json')
      .then((res) => {
        if (!res.ok) throw new Error('Local studying json failed');
        return res.json();
      })
      .then((data) => setStudyingData(data))
      .catch((err) => {
        console.warn('Falling back to remote Studying CDN:', err);
        fetch('https://assets-v2.lottiefiles.com/a/6db2344c-1172-11ee-8f24-13c8ce80eb2d/3Et0d6JMow.json')
          .then((r) => r.json())
          .then((d) => setStudyingData(d))
          .catch((e) => console.error('Studying Lottie fetch error:', e));
      });
  }, []);

  // 4-Stage Timer & Loop: 10s per animation, repeats from 1 once reaching 4
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveScene((current) => {
        if (current === 'robot') return 'welcome';
        if (current === 'welcome') return 'study';
        if (current === 'study') return 'studying';
        return 'robot';
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [activeScene]);

  // Click handler to manually navigate to any of the 4 animation bars
  const selectScene = (target: AnimationScene) => {
    setActiveScene(target);
  };

  // ZERO-RERENDER HIGH-PERFORMANCE CURSOR TRACKING FOR ROBOT
  // Direct DOM ref mutation for buttery smooth tracking with no timer lag
  useEffect(() => {
    let ticking = false;
    let lastEvent: MouseEvent | Touch | null = null;

    const updateEyeTransforms = () => {
      ticking = false;
      if (!lastEvent || !robotSvgRef.current) return;

      const rect = robotSvgRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width * 0.5;
      const robotCenterY = rect.top + rect.height * 0.33;

      const dx = lastEvent.clientX - robotCenterX;
      const dy = lastEvent.clientY - robotCenterY;
      const dist = Math.hypot(dx, dy);

      const maxEyeRadius = 14;
      const angle = Math.atan2(dy, dx);
      const eyeMagnitude = Math.min(maxEyeRadius, dist / 22);

      const targetEyeX = Math.cos(angle) * eyeMagnitude;
      const targetEyeY = Math.sin(angle) * (eyeMagnitude * 0.75);

      const maxSpan = Math.max(window.innerWidth, window.innerHeight) * 0.65;
      const normX = Math.max(-1, Math.min(1, dx / maxSpan));
      const normY = Math.max(-1, Math.min(1, dy / maxSpan));
      const rx = -normY * 11;
      const ry = normX * 16;

      if (leftEyeRef.current) {
        leftEyeRef.current.style.transform = `translate(${targetEyeX}px, ${targetEyeY}px)`;
      }
      if (rightEyeRef.current) {
        rightEyeRef.current.style.transform = `translate(${targetEyeX}px, ${targetEyeY}px)`;
      }
      if (headRef.current) {
        headRef.current.style.transform = `translate(${normX * 6}px, ${normY * 4}px) rotateY(${ry}deg) rotateX(${rx}deg)`;
      }
    };

    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (sceneRef.current !== 'robot') return;

      if ('touches' in e && e.touches.length > 0) {
        lastEvent = e.touches[0];
      } else if ('clientX' in e) {
        lastEvent = e as MouseEvent;
      }

      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateEyeTransforms);
      }
    };

    window.addEventListener('mousemove', handlePointer, { passive: true });
    window.addEventListener('touchmove', handlePointer, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointer);
      window.removeEventListener('touchmove', handlePointer);
    };
  }, []);

  // Periodic natural blinking for robot
  useEffect(() => {
    if (activeScene !== 'robot') return;

    const blinkInterval = setInterval(() => {
      if (focusedField === 'password') return;
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [focusedField, activeScene]);

  // Form field focus scanpulse
  useEffect(() => {
    if (focusedField === 'email' || focusedField === 'name') {
      setScanPulse(true);
      const timer = setTimeout(() => setScanPulse(false), 800);
      return () => clearTimeout(timer);
    }
  }, [focusedField]);

  const isCoveringEyes = focusedField === 'password';

  return (
    <div
      id="robot-auth-viewport"
      className={cn(
        'w-full h-full flex flex-col items-center justify-center relative select-none pointer-events-none',
        className
      )}
    >
      {/* Subtle Blue Grid Background Behind Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Dynamic Atmospheric Glows adapting to the current scene */}
      {activeScene === 'robot' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] bg-cyan-400/18 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700" />
          <div className="absolute bottom-1/4 left-1/3 w-[260px] sm:w-[420px] h-[260px] sm:h-[420px] bg-blue-500/18 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700" />
        </>
      )}
      {activeScene === 'welcome' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-emerald-400/18 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
          <div className="absolute bottom-1/4 left-1/3 w-[280px] sm:w-[440px] h-[280px] sm:h-[440px] bg-teal-400/18 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
        </>
      )}
      {activeScene === 'study' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-violet-400/20 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
          <div className="absolute bottom-1/4 left-1/3 w-[280px] sm:w-[440px] h-[280px] sm:h-[440px] bg-fuchsia-400/18 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
        </>
      )}
      {activeScene === 'studying' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-amber-400/20 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
          <div className="absolute bottom-1/4 left-1/3 w-[280px] sm:w-[440px] h-[280px] sm:h-[440px] bg-rose-400/18 rounded-full blur-[110px] pointer-events-none transition-opacity duration-700" />
        </>
      )}

      {/* =========================================================================
          FOUR CLEAN LOADING BARS (One for each animation, no text clutter)
          ========================================================================= */}
      <div
        id="four-animation-loading-bars"
        className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[420px] xl:max-w-[480px] mb-2 sm:mb-3 lg:mb-5 pointer-events-auto z-20 px-2"
      >
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:gap-3.5 w-full">
          {/* Loading Bar 1: Robot */}
          <button
            type="button"
            onClick={() => selectScene('robot')}
            title="Animation 1: Robot"
            className="group relative w-full h-1 sm:h-1.5 lg:h-2 rounded-full bg-slate-300/80 hover:bg-slate-300 shadow-inner overflow-hidden cursor-pointer p-0 border-0 focus:outline-none transition-colors"
          >
            <div
              key={activeScene === 'robot' ? 'robot-active' : 'robot-static'}
              className={cn(
                'h-full rounded-full relative',
                activeScene === 'robot'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-auth-progress-fill'
                  : (activeScene === 'welcome' || activeScene === 'study' || activeScene === 'studying')
                  ? 'bg-cyan-500/70 w-full'
                  : 'bg-transparent w-0'
              )}
            />
          </button>

          {/* Loading Bar 2: Welcome */}
          <button
            type="button"
            onClick={() => selectScene('welcome')}
            title="Animation 2: Welcome"
            className="group relative w-full h-1 sm:h-1.5 lg:h-2 rounded-full bg-slate-300/80 hover:bg-slate-300 shadow-inner overflow-hidden cursor-pointer p-0 border-0 focus:outline-none transition-colors"
          >
            <div
              key={activeScene === 'welcome' ? 'welcome-active' : 'welcome-static'}
              className={cn(
                'h-full rounded-full relative',
                activeScene === 'welcome'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] animate-auth-progress-fill'
                  : (activeScene === 'study' || activeScene === 'studying')
                  ? 'bg-emerald-500/70 w-full'
                  : 'bg-transparent w-0'
              )}
            />
          </button>

          {/* Loading Bar 3: Study */}
          <button
            type="button"
            onClick={() => selectScene('study')}
            title="Animation 3: Study"
            className="group relative w-full h-1 sm:h-1.5 lg:h-2 rounded-full bg-slate-300/80 hover:bg-slate-300 shadow-inner overflow-hidden cursor-pointer p-0 border-0 focus:outline-none transition-colors"
          >
            <div
              key={activeScene === 'study' ? 'study-active' : 'study-static'}
              className={cn(
                'h-full rounded-full relative',
                activeScene === 'study'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-auth-progress-fill'
                  : activeScene === 'studying'
                  ? 'bg-violet-500/70 w-full'
                  : 'bg-transparent w-0'
              )}
            />
          </button>

          {/* Loading Bar 4: Studying */}
          <button
            type="button"
            onClick={() => selectScene('studying')}
            title="Animation 4: Studying"
            className="group relative w-full h-1 sm:h-1.5 lg:h-2 rounded-full bg-slate-300/80 hover:bg-slate-300 shadow-inner overflow-hidden cursor-pointer p-0 border-0 focus:outline-none transition-colors"
          >
            <div
              key={activeScene === 'studying' ? 'studying-active' : 'studying-static'}
              className={cn(
                'h-full rounded-full relative',
                activeScene === 'studying'
                  ? 'bg-gradient-to-r from-amber-400 to-rose-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-auth-progress-fill'
                  : 'bg-transparent w-0'
              )}
            />
          </button>
        </div>
      </div>

      {/* Scalable Container ensuring animations are clearly visible and responsive */}
      <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[460px] xl:max-w-[520px] 2xl:max-w-[560px] max-h-[min(45vh,380px)] lg:max-h-[min(65vh,560px)] aspect-square flex items-center justify-center p-1 sm:p-2 lg:p-4 pointer-events-auto">
        <AnimatePresence mode="wait">
          {activeScene === 'robot' ? (
            /* =====================================================================
               ANIMATION 1: INTERACTIVE 3D ROBOT WITH CURSOR-TRACKING EYES
               ===================================================================== */
            <motion.div
              key="scene-robot-interactive"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                filter: 'blur(8px)',
                transition: { duration: 0.4 },
              }}
              transition={{
                y: {
                  duration: 4.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                opacity: { duration: 0.35 },
                scale: { duration: 0.35 },
              }}
              className="w-full h-full flex items-center justify-center"
              style={{ perspective: 1000 }}
            >
              {/* Parallax Head Tilt Container (Driven directly by ref for 0 rerenders) */}
              <div
                ref={headRef}
                className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <svg
                  ref={robotSvgRef}
                  viewBox="0 0 320 320"
                  className="w-full h-full max-w-full max-h-full drop-shadow-[0_16px_36px_rgba(6,182,212,0.3)]"
                >
                  <defs>
                    <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="60%" stopColor="#F1F5F9" />
                      <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>

                    <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0B132B" />
                      <stop offset="50%" stopColor="#050C1A" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    <radialGradient id="robotCyanEye" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#A5F3FC" />
                      <stop offset="40%" stopColor="#22D3EE" />
                      <stop offset="80%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0891B2" />
                    </radialGradient>

                    <linearGradient id="robotCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#67E8F9" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>

                    <linearGradient id="robotJointGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>

                    <filter id="robotNeonGlow" x="-25%" y="-25%" width="150%" height="150%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="robotSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* FLOATING HOVER THRUSTER BASE & SHADOW */}
                  <g id="hover-pedestal">
                    <ellipse cx="160" cy="295" rx="52" ry="9" fill="#020617" opacity="0.65" />
                    <ellipse
                      cx="160"
                      cy="274"
                      rx="36"
                      ry="7"
                      fill="none"
                      stroke="#22D3EE"
                      strokeWidth="3.5"
                      opacity="0.85"
                      filter="url(#robotNeonGlow)"
                    />
                    <ellipse cx="160" cy="274" rx="20" ry="4" fill="#67E8F9" opacity="0.9" filter="url(#robotSoftGlow)" />
                    <path d="M142 258 L178 258 L170 273 L150 273 Z" fill="url(#robotJointGrad)" />
                  </g>

                  {/* ROBOT TORSO / BODY */}
                  <g id="robot-torso">
                    <path
                      d="M115 190 C115 175, 205 175, 205 190 C205 242, 192 262, 160 262 C128 262, 115 242, 115 190 Z"
                      fill="url(#robotBodyGrad)"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M126 195 C126 230, 138 250, 160 250 C182 250, 194 230, 194 195"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      opacity="0.6"
                    />
                    <g id="chest-core" filter="url(#robotNeonGlow)">
                      <circle cx="160" cy="216" r="14" fill="#082F49" stroke="#38BDF8" strokeWidth="2" />
                      <circle
                        cx="160"
                        cy="216"
                        r="9"
                        fill="url(#robotCoreGrad)"
                        className={scanPulse ? 'animate-ping' : ''}
                      />
                      <circle cx="160" cy="216" r="4" fill="#FFFFFF" />
                      <path d="M156 216 L164 216 M160 212 L160 220" stroke="#082F49" strokeWidth="1.5" />
                    </g>
                    <rect x="135" y="193" width="12" height="4" rx="2" fill="#0284C7" />
                    <rect x="173" y="193" width="12" height="4" rx="2" fill="#0284C7" />
                  </g>

                  {/* ARTICULATED ARMS */}
                  <g id="robot-arms">
                    {isCoveringEyes ? (
                      <g id="left-arm-covering">
                        <circle cx="106" cy="190" r="10" fill="url(#robotJointGrad)" />
                        <path
                          d="M106 190 Q92 145, 126 126"
                          fill="none"
                          stroke="url(#robotBodyGrad)"
                          strokeWidth="16"
                          strokeLinecap="round"
                        />
                        <ellipse cx="132" cy="122" rx="14" ry="10" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="127" cy="118" r="3" fill="#38BDF8" />
                        <circle cx="134" cy="117" r="3" fill="#38BDF8" />
                        <circle cx="140" cy="120" r="3" fill="#38BDF8" />
                      </g>
                    ) : (
                      <g id="left-arm-resting">
                        <circle cx="106" cy="190" r="9" fill="url(#robotJointGrad)" />
                        <path
                          d="M106 190 Q88 214, 102 238"
                          fill="none"
                          stroke="url(#robotBodyGrad)"
                          strokeWidth="15"
                          strokeLinecap="round"
                        />
                        <ellipse cx="102" cy="240" rx="9" ry="8" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="102" cy="240" r="3" fill="#38BDF8" />
                      </g>
                    )}

                    {isCoveringEyes ? (
                      <g id="right-arm-covering">
                        <circle cx="214" cy="190" r="10" fill="url(#robotJointGrad)" />
                        <path
                          d="M214 190 Q228 145, 194 126"
                          fill="none"
                          stroke="url(#robotBodyGrad)"
                          strokeWidth="16"
                          strokeLinecap="round"
                        />
                        <ellipse cx="188" cy="122" rx="14" ry="10" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="180" cy="120" r="3" fill="#38BDF8" />
                        <circle cx="186" cy="117" r="3" fill="#38BDF8" />
                        <circle cx="193" cy="118" r="3" fill="#38BDF8" />
                      </g>
                    ) : (
                      <g id="right-arm-resting">
                        <circle cx="214" cy="190" r="9" fill="url(#robotJointGrad)" />
                        <path
                          d="M214 190 Q232 214, 218 238"
                          fill="none"
                          stroke="url(#robotBodyGrad)"
                          strokeWidth="15"
                          strokeLinecap="round"
                        />
                        <ellipse cx="218" cy="240" rx="9" ry="8" fill="url(#robotBodyGrad)" stroke="#94A3B8" strokeWidth="1.5" />
                        <circle cx="218" cy="240" r="3" fill="#38BDF8" />
                      </g>
                    )}
                  </g>

                  {/* NECK GIMBAL */}
                  <g id="robot-neck">
                    <rect x="146" y="162" width="28" height="15" rx="4" fill="#334155" stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="152" y1="162" x2="152" y2="177" stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="160" y1="162" x2="160" y2="177" stroke="#38BDF8" strokeWidth="1.5" />
                    <line x1="168" y1="162" x2="168" y2="177" stroke="#38BDF8" strokeWidth="1.5" />
                  </g>

                  {/* ROBOT HEAD ASSEMBLY */}
                  <g id="robot-head-group">
                    <g id="left-ear">
                      <path d="M72 108 L92 115" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
                      <ellipse cx="70" cy="106" rx="8" ry="12" fill="url(#robotJointGrad)" stroke="#38BDF8" strokeWidth="1.5" />
                      <circle cx="70" cy="106" r="4" fill="#A5F3FC" filter="url(#robotSoftGlow)" />
                    </g>

                    <g id="right-ear">
                      <path d="M248 108 L228 115" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
                      <ellipse cx="250" cy="106" rx="8" ry="12" fill="url(#robotJointGrad)" stroke="#38BDF8" strokeWidth="1.5" />
                      <circle cx="250" cy="106" r="4" fill="#A5F3FC" filter="url(#robotSoftGlow)" />
                    </g>

                    <g id="top-antenna">
                      <path d="M160 52 L160 36" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="160" cy="32" r="7" fill="url(#robotJointGrad)" stroke="#38BDF8" strokeWidth="1.5" />
                      <circle cx="160" cy="32" r="3.5" fill="#67E8F9" filter="url(#robotNeonGlow)" />
                    </g>

                    <rect
                      x="88"
                      y="50"
                      width="144"
                      height="120"
                      rx="48"
                      fill="url(#robotBodyGrad)"
                      stroke="#94A3B8"
                      strokeWidth="2"
                    />

                    <path
                      d="M112 58 C132 54, 188 54, 208 58 C192 64, 128 64, 112 58 Z"
                      fill="#FFFFFF"
                      opacity="0.8"
                    />

                    {/* DARK VISOR SCREEN */}
                    <rect
                      x="100"
                      y="66"
                      width="120"
                      height="88"
                      rx="36"
                      fill="url(#robotVisorGrad)"
                      stroke="#38BDF8"
                      strokeWidth="2"
                    />

                    <rect
                      x="103"
                      y="69"
                      width="114"
                      height="82"
                      rx="33"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="1"
                      opacity="0.5"
                    />

                    <line x1="106" y1="84" x2="214" y2="84" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.25" />
                    <line x1="106" y1="98" x2="214" y2="98" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.25" />
                    <line x1="106" y1="112" x2="214" y2="112" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.25" />
                    <line x1="106" y1="126" x2="214" y2="126" stroke="#0ea5e9" strokeWidth="0.5" opacity="0.25" />

                    {scanPulse && (
                      <line
                        x1="104"
                        y1="105"
                        x2="216"
                        y2="105"
                        stroke="#22D3EE"
                        strokeWidth="2.5"
                        filter="url(#robotNeonGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* EYE CURSOR TRACKING (Direct ref manipulation) */}
                    {isCoveringEyes ? (
                      <g id="privacy-eyes-shield">
                        <path
                          d="M125 106 Q135 102, 145 106"
                          fill="none"
                          stroke="#22D3EE"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          filter="url(#robotSoftGlow)"
                        />
                        <path
                          d="M175 106 Q185 102, 195 106"
                          fill="none"
                          stroke="#22D3EE"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          filter="url(#robotSoftGlow)"
                        />
                        <g transform="translate(152, 116) scale(0.65)" filter="url(#robotSoftGlow)">
                          <rect x="2" y="8" width="20" height="14" rx="3" fill="#22D3EE" />
                          <path d="M6 8 V5 A6 6 0 0 1 18 5 V8" fill="none" stroke="#22D3EE" strokeWidth="2.5" />
                          <circle cx="12" cy="14" r="2" fill="#0369A1" />
                        </g>
                      </g>
                    ) : isBlinking ? (
                      <g id="blinking-eyes">
                        <line
                          x1="125"
                          y1="105"
                          x2="147"
                          y2="105"
                          stroke="#22D3EE"
                          strokeWidth="4"
                          strokeLinecap="round"
                          filter="url(#robotNeonGlow)"
                        />
                        <line
                          x1="173"
                          y1="105"
                          x2="195"
                          y2="105"
                          stroke="#22D3EE"
                          strokeWidth="4"
                          strokeLinecap="round"
                          filter="url(#robotNeonGlow)"
                        />
                      </g>
                    ) : (
                      <g id="cursor-tracking-eyes">
                        {/* Left Eye */}
                        <g id="left-eye-socket" transform="translate(136, 105)">
                          <ellipse cx="0" cy="0" rx="19" ry="19" fill="#020617" stroke="#0369A1" strokeWidth="1" />
                          <g ref={leftEyeRef} className="transition-transform duration-75 ease-out">
                            <circle cx="0" cy="0" r="14" fill="url(#robotCyanEye)" filter="url(#robotNeonGlow)" />
                            <circle cx="0" cy="0" r="10" fill="#082F49" />
                            <circle cx="0" cy="0" r="6.5" fill="#38BDF8" filter="url(#robotSoftGlow)" />
                            <circle cx="-3" cy="-3.5" r="2.8" fill="#FFFFFF" />
                            <circle cx="3" cy="2.5" r="1.4" fill="#FFFFFF" opacity="0.8" />
                          </g>
                        </g>

                        {/* Right Eye */}
                        <g id="right-eye-socket" transform="translate(184, 105)">
                          <ellipse cx="0" cy="0" rx="19" ry="19" fill="#020617" stroke="#0369A1" strokeWidth="1" />
                          <g ref={rightEyeRef} className="transition-transform duration-75 ease-out">
                            <circle cx="0" cy="0" r="14" fill="url(#robotCyanEye)" filter="url(#robotNeonGlow)" />
                            <circle cx="0" cy="0" r="10" fill="#082F49" />
                            <circle cx="0" cy="0" r="6.5" fill="#38BDF8" filter="url(#robotSoftGlow)" />
                            <circle cx="-3" cy="-3.5" r="2.8" fill="#FFFFFF" />
                            <circle cx="3" cy="2.5" r="1.4" fill="#FFFFFF" opacity="0.8" />
                          </g>
                        </g>
                      </g>
                    )}

                    {/* Digital Mouth */}
                    <g id="digital-mouth" transform="translate(160, 134)" filter="url(#robotSoftGlow)">
                      <rect x="-14" y="-1.5" width="28" height="3" rx="1.5" fill="#0284C7" />
                      <rect
                        x="-7"
                        y="-2.5"
                        width="14"
                        height="5"
                        rx="2"
                        fill="#38BDF8"
                        className={scanPulse ? 'animate-pulse' : ''}
                      />
                    </g>

                    {/* Visor Reflection Arc */}
                    <path
                      d="M108 76 Q128 72, 150 74"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.3"
                    />
                  </g>
                </svg>
              </div>
            </motion.div>
          ) : activeScene === 'welcome' ? (
            /* =====================================================================
               ANIMATION 2: LOTTIEFILES WELCOME ANIMATION (Growing Starting Effect)
               ===================================================================== */
            <motion.div
              key="scene-welcome-growing"
              initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
              transition={{
                duration: 0.9,
                type: 'spring',
                stiffness: 115,
                damping: 15,
                mass: 0.85,
              }}
              className="w-full h-full flex items-center justify-center relative pointer-events-auto"
            >
              {/* Luminous Pulsing Halo Behind Welcome Animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-teal-500/15 rounded-full blur-[70px] pointer-events-none" />

              {welcomeData ? (
                <Lottie
                  src={welcomeData}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(52,211,153,0.35)]"
                />
              ) : (
                <iframe
                  src="https://embed.lottiefiles.com/animation/e7aDyISq44"
                  title="Welcome Animation"
                  className="w-full h-full border-0 relative z-10"
                />
              )}
            </motion.div>
          ) : activeScene === 'study' ? (
            /* =====================================================================
               ANIMATION 3: LOTTIEFILES STUDY ANIMATION (Growing Starting Effect)
               ===================================================================== */
            <motion.div
              key="scene-study-growing"
              initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
              transition={{
                duration: 0.9,
                type: 'spring',
                stiffness: 115,
                damping: 15,
                mass: 0.85,
              }}
              className="w-full h-full flex items-center justify-center relative pointer-events-auto"
            >
              {/* Radiant Violet / Purple Halo behind Study Animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/25 via-purple-500/20 to-fuchsia-500/15 rounded-full blur-[75px] pointer-events-none" />

              {studyData ? (
                <Lottie
                  src={studyData}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(168,85,247,0.35)]"
                />
              ) : (
                <iframe
                  src="https://embed.lottiefiles.com/animation/Qr5M6uHmNh"
                  title="Study Animation"
                  className="w-full h-full border-0 relative z-10"
                />
              )}
            </motion.div>
          ) : activeScene === 'studying' ? (
            /* =====================================================================
               ANIMATION 4: LOTTIEFILES STUDYING ANIMATION (Growing Starting Effect)
               ===================================================================== */
            <motion.div
              key="scene-studying-growing"
              initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.85, opacity: 0, filter: 'blur(12px)' }}
              transition={{
                duration: 0.9,
                type: 'spring',
                stiffness: 115,
                damping: 15,
                mass: 0.85,
              }}
              className="w-full h-full flex items-center justify-center relative pointer-events-auto"
            >
              {/* Atmospheric Amber & Rose Halo behind Studying Animation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-orange-500/18 to-rose-500/15 rounded-full blur-[75px] pointer-events-none" />

              {studyingData ? (
                <Lottie
                  src={studyingData}
                  loop={true}
                  autoplay={true}
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(245,158,11,0.35)]"
                />
              ) : (
                <iframe
                  src="https://embed.lottiefiles.com/animation/SYVjZJCscj"
                  title="Studying Animation"
                  className="w-full h-full border-0 relative z-10"
                />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
