import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Maximize2,
  Minimize2,
  Coffee,
  Clock,
  Radio,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface StudyVideoSceneProps {
  focusedField?: 'email' | 'password' | 'name' | 'general' | null;
  authMode?: 'signin' | 'signup';
  className?: string;
}

export const StudyVideoScene: React.FC<StudyVideoSceneProps> = ({
  focusedField = null,
  authMode = 'signin',
  className,
}) => {
  // Video playback & environment states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isWindowOpen, setIsWindowOpen] = useState(true);
  const [isLampOn, setIsLampOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Kid eye & head tracking coordinates
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // relative to viewport
  const [relativeParallax, setRelativeParallax] = useState({ x: 0, y: 0 }); // normalized -1 to 1
  const [pupilOffset, setPupilOffset] = useState({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });
  const [isBlinking, setIsBlinking] = useState(false);

  // Time elapsed for video playback UI
  const [elapsedSeconds, setElapsedSeconds] = useState(1542); // 25m 42s
  const [clockDegrees, setClockDegrees] = useState(0);

  // Web Audio Context reference for gentle ambient lofi study soundscape
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lofiNodesRef = useRef<{ masterGain: GainNode | null; oscillators: OscillatorNode[] }>({
    masterGain: null,
    oscillators: [],
  });

  // Track global cursor pointer position
  useEffect(() => {
    let animFrame: number;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const clientX = e.clientX;
        const clientY = e.clientY;
        setMousePos({ x: clientX, y: clientY });

        // Calculate relative parallax (-1 to 1) based on window center
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const normX = Math.max(-1, Math.min(1, (clientX - centerX) / (centerX || 1)));
        const normY = Math.max(-1, Math.min(1, (clientY - centerY) / (centerY || 1)));
        setRelativeParallax({ x: normX, y: normY });

        // Compute eye pupil angles & distance
        if (svgRef.current) {
          const svgRect = svgRef.current.getBoundingClientRect();
          if (svgRect.width > 0 && svgRect.height > 0) {
            // Scaled SVG coordinates: SVG viewBox is 500 x 600
            // Kid face is centered roughly at SVG (250, 310)
            // Left eye center in SVG: (230, 305)
            // Right eye center in SVG: (270, 305)
            const scaleX = svgRect.width / 500;
            const scaleY = svgRect.height / 600;

            const leftEyeScreenX = svgRect.left + 230 * scaleX;
            const leftEyeScreenY = svgRect.top + 305 * scaleY;
            const rightEyeScreenX = svgRect.left + 270 * scaleX;
            const rightEyeScreenY = svgRect.top + 305 * scaleY;

            // Maximum eyeball travel radius inside socket (SVG units)
            const maxTravel = 5.5;

            // Compute left pupil offset
            const dxL = clientX - leftEyeScreenX;
            const dyL = clientY - leftEyeScreenY;
            const angleL = Math.atan2(dyL, dxL);
            const distL = Math.min(maxTravel, Math.hypot(dxL, dyL) / 35);
            const leftX = Math.cos(angleL) * distL;
            const leftY = Math.sin(angleL) * distL;

            // Compute right pupil offset
            const dxR = clientX - rightEyeScreenX;
            const dyR = clientY - rightEyeScreenY;
            const angleR = Math.atan2(dyR, dxR);
            const distR = Math.min(maxTravel, Math.hypot(dxR, dyR) / 35);
            const rightX = Math.cos(angleR) * distR;
            const rightY = Math.sin(angleR) * distR;

            setPupilOffset({
              left: { x: leftX, y: leftY },
              right: { x: rightX, y: rightY },
            });
          }
        }
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // Periodic natural eye blink cycle (every 3.5 to 5.5 seconds)
  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    let openTimer: NodeJS.Timeout;

    const scheduleNextBlink = () => {
      const delay = Math.random() * 2000 + 3500;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        openTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 160);
      }, delay);
    };

    scheduleNextBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
    };
  }, []);

  // Elapsed video playhead ticker & wall clock rotation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => (prev >= 3600 ? 0 : prev + 1));
      setClockDegrees((prev) => (prev + 6) % 360);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Audio synthesizer for warm ambient lofi study soundscape
  const toggleAudio = useCallback(() => {
    if (!isMuted) {
      // Mute audio
      if (lofiNodesRef.current.masterGain) {
        lofiNodesRef.current.masterGain.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.2);
      }
      setIsMuted(true);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 1.2);

      // Low pass filter for soft cozy lofi warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // Generate a rich, dreamy pentatonic chord (D min9: D3, F3, A3, C4, E4)
      const freqs = [146.83, 174.61, 220.0, 261.63, 329.63];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f + (Math.random() * 0.4 - 0.2), ctx.currentTime);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.04 / freqs.length, ctx.currentTime);

        // Gentle tremolo LFO for tape flutter
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.2 + i * 0.05, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.008, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(subGain.gain);
        lfo.start();

        osc.connect(subGain);
        subGain.connect(filter);
        osc.start();
        oscs.push(osc);
      });

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      lofiNodesRef.current = {
        masterGain,
        oscillators: oscs,
      };

      setIsMuted(false);
    } catch (err) {
      console.warn('Audio synthesis initialization notice:', err);
      setIsMuted(true);
    }
  }, [isMuted]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioCtxRef.current) {
          audioCtxRef.current.close();
        }
      } catch {
        // Safe cleanup ignore
      }
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Parallax offsets (relative motion)
  const skyOffsetX = relativeParallax.x * -8;
  const skyOffsetY = relativeParallax.y * -4;
  const windowFrameOffsetX = relativeParallax.x * -4;
  const windowFrameOffsetY = relativeParallax.y * -2;
  const shelfOffsetX = relativeParallax.x * 3;
  const shelfOffsetY = relativeParallax.y * 2;
  const kidHeadOffsetX = relativeParallax.x * 6;
  const kidHeadOffsetY = relativeParallax.y * 4;
  const deskOffsetX = relativeParallax.x * 2;
  const particlesOffsetX = relativeParallax.x * 12;

  return (
    <div
      ref={containerRef}
      id="animated-study-video-container"
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-900 shadow-2xl transition-all duration-300 select-none group',
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full h-full min-h-[460px] md:min-h-[560px] lg:min-h-[620px]',
        className
      )}
    >
      {/* 1. TOP VIDEO HEADER OVERLAY */}
      <div className="relative z-30 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-transparent text-white backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          {/* Live indicator dot */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>LIVE 1080P</span>
          </div>

          <div className="hidden xs:flex flex-col">
            <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
              Campus Focus Lounge
              <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-slate-400">Library Desk #4 • Interactive Room</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Window open/close toggle badge */}
          <button
            type="button"
            onClick={() => setIsWindowOpen(!isWindowOpen)}
            title={isWindowOpen ? 'Close Campus Window' : 'Open Campus Window'}
            className={cn(
              'btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border shadow-xs',
              isWindowOpen
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/30 hover:bg-sky-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
            )}
          >
            <span>Window {isWindowOpen ? 'Open' : 'Closed'}</span>
          </button>

          {/* Day / Night ambient lighting toggle */}
          <button
            type="button"
            onClick={() => setIsNightMode(!isNightMode)}
            title={isNightMode ? 'Switch to Daytime' : 'Switch to Lofi Night Mode'}
            className="btn-press p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            {isNightMode ? <Moon className="w-3.5 h-3.5 text-indigo-300" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            title={isMuted ? 'Play Lofi Study Beats' : 'Mute Soundscape'}
            className={cn(
              'btn-press p-1.5 rounded-lg border transition-colors',
              !isMuted
                ? 'bg-brand/30 text-brand-light border-brand/50 shadow-xs animate-pulse'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/60'
            )}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. THE ANIMATED STUDY SCENE (Vector SVG Canvas with Dynamic Eye Tracking and Relative Window Motion) */}
      <div className="absolute inset-0 z-10 w-full h-full flex items-center justify-center overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 500 600"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Daytime Sky Gradient */}
            <linearGradient id="daySky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#fed7aa" />
            </linearGradient>

            {/* Night Sky Gradient */}
            <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="60%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>

            {/* Room Wall Gradient */}
            <linearGradient id="roomWallDay" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="roomWallNight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Desk Lamp Volumetric Light Glow */}
            <radialGradient id="lampGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity={isNightMode ? '0.75' : '0.45'} />
              <stop offset="40%" stopColor="#fef08a" stopOpacity={isNightMode ? '0.25' : '0.12'} />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </radialGradient>

            {/* Desk Surface Wood Gradient */}
            <linearGradient id="deskWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="25%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Laptop Screen Glow */}
            <linearGradient id="laptopGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Kid Hair Gradient */}
            <linearGradient id="kidHair" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Kid Hoodie Gradient */}
            <linearGradient id="kidHoodie" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>

            {/* Clip Path for the Study Arched Window */}
            <clipPath id="windowArchClip">
              <path d="M 120 180 Q 250 60 380 180 L 380 340 L 120 340 Z" />
            </clipPath>
          </defs>

          {/* ROOM WALL BACKGROUND */}
          <rect
            x="0"
            y="0"
            width="500"
            height="600"
            fill={isNightMode ? 'url(#roomWallNight)' : 'url(#roomWallDay)'}
          />

          {/* LAYER 1: STUDY ROOM ARCHED WINDOW WITH RELATIVE MOTION */}
          <g transform={`translate(${windowFrameOffsetX}, ${windowFrameOffsetY})`}>
            {/* Outer Window Frame Trim */}
            <path
              d="M 116 178 Q 250 56 384 178 L 384 344 L 116 344 Z"
              fill={isNightMode ? '#1e293b' : '#cbd5e1'}
              stroke={isNightMode ? '#334155' : '#94a3b8'}
              strokeWidth="4"
            />

            {/* WINDOW CLIPPED INTERIOR: SKY, CLOUDS, AND CAMPUS CLOCK TOWER */}
            <g clipPath="url(#windowArchClip)">
              {/* Sky Background with Parallax relative to cursor */}
              <g transform={`translate(${skyOffsetX}, ${skyOffsetY})`}>
                <rect
                  x="80"
                  y="40"
                  width="340"
                  height="320"
                  fill={isNightMode ? 'url(#nightSky)' : 'url(#daySky)'}
                />

                {/* Night Stars or Day Clouds */}
                {isNightMode ? (
                  <g opacity="0.85">
                    {/* Crescent Moon */}
                    <circle cx="320" cy="110" r="16" fill="#fef08a" />
                    <circle cx="326" cy="106" r="14" fill="#1e1b4b" />
                    {/* Twinkling Stars */}
                    <circle cx="150" cy="110" r="1.5" fill="#ffffff" />
                    <circle cx="190" cy="90" r="2" fill="#ffffff" opacity="0.9" />
                    <circle cx="270" cy="85" r="1.5" fill="#fde68a" />
                    <circle cx="220" cy="140" r="1.2" fill="#ffffff" />
                    <circle cx="350" cy="145" r="1.8" fill="#ffffff" />
                  </g>
                ) : (
                  <g opacity="0.9">
                    {/* Golden Morning Sun */}
                    <circle cx="160" cy="120" r="22" fill="#fde047" opacity="0.8" />
                    {/* Drifting Clouds */}
                    <path
                      d="M 220 120 Q 240 100 265 115 Q 290 100 310 120 Q 325 130 305 140 L 225 140 Z"
                      fill="#ffffff"
                      opacity="0.85"
                    />
                    <path
                      d="M 140 160 Q 155 145 175 155 Q 195 145 210 160 L 140 160 Z"
                      fill="#ffffff"
                      opacity="0.7"
                    />
                  </g>
                )}

                {/* Distant Campus Library Clock Tower with Clock Hands */}
                <g transform="translate(230, 160)">
                  {/* Tower base */}
                  <rect x="-24" y="50" width="48" height="130" fill={isNightMode ? '#1e1b4b' : '#94a3b8'} />
                  {/* Tower spire roof */}
                  <polygon points="-28,50 0,0 28,50" fill={isNightMode ? '#312e81' : '#64748b'} />
                  {/* Spire cross */}
                  <line x1="0" y1="-8" x2="0" y2="4" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="-4" y1="-3" x2="4" y2="-3" stroke="#f59e0b" strokeWidth="2" />
                  {/* Tower Clock Face */}
                  <circle cx="0" cy="75" r="12" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
                  {/* Clock Hands */}
                  <line
                    x1="0"
                    y1="75"
                    x2={Math.sin((clockDegrees * Math.PI) / 180) * 8}
                    y2={75 - Math.cos((clockDegrees * Math.PI) / 180) * 8}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line x1="0" y1="75" x2="5" y2="75" stroke="#ef4444" strokeWidth="1" />
                </g>

                {/* Distant Campus Trees & Greenery */}
                <path
                  d="M 110 320 Q 140 260 170 320 Q 200 250 240 320 Q 280 255 330 320 Q 370 270 400 320 Z"
                  fill={isNightMode ? '#064e3b' : '#10b981'}
                  opacity="0.8"
                />
              </g>

              {/* WINDOW PANES: OPENING AND CLOSING MECHANICS WITH RELATIVE MOTION */}
              {/* Left Window Pane Sash */}
              <g
                className="transition-all duration-700 ease-out"
                style={{
                  transformOrigin: '120px 240px',
                  transform: isWindowOpen
                    ? 'perspective(400px) rotateY(-72deg) scaleX(0.35)'
                    : 'perspective(400px) rotateY(0deg) scaleX(1)',
                }}
              >
                <rect
                  x="120"
                  y="120"
                  width="130"
                  height="220"
                  fill={isNightMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.35)'}
                  stroke={isNightMode ? '#475569' : '#94a3b8'}
                  strokeWidth="3"
                />
                {/* Diagonal Glass Reflection */}
                <line x1="130" y1="140" x2="230" y2="240" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
                <line x1="140" y1="180" x2="210" y2="250" stroke="#ffffff" strokeWidth="1" opacity="0.2" />
                {/* Pane Divider */}
                <line x1="120" y1="220" x2="250" y2="220" stroke={isNightMode ? '#475569' : '#94a3b8'} strokeWidth="2" />
              </g>

              {/* Right Window Pane Sash */}
              <g
                className="transition-all duration-700 ease-out"
                style={{
                  transformOrigin: '380px 240px',
                  transform: isWindowOpen
                    ? 'perspective(400px) rotateY(72deg) scaleX(0.35)'
                    : 'perspective(400px) rotateY(0deg) scaleX(1)',
                }}
              >
                <rect
                  x="250"
                  y="120"
                  width="130"
                  height="220"
                  fill={isNightMode ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.35)'}
                  stroke={isNightMode ? '#475569' : '#94a3b8'}
                  strokeWidth="3"
                />
                <line x1="270" y1="140" x2="360" y2="230" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
                <line x1="250" y1="220" x2="380" y2="220" stroke={isNightMode ? '#475569' : '#94a3b8'} strokeWidth="2" />
              </g>

              {/* Gentle Window Breeze & Fluttering Curtains when open */}
              {isWindowOpen && (
                <g opacity="0.6">
                  {/* Floating breeze wind streamlines */}
                  <path
                    d="M 140 180 Q 180 170 210 185 T 250 175"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                  <path
                    d="M 280 200 Q 310 190 340 205"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                </g>
              )}
            </g>

            {/* Window Sill */}
            <rect
              x="110"
              y="338"
              width="280"
              height="12"
              rx="3"
              fill={isNightMode ? '#334155' : '#94a3b8'}
            />
          </g>

          {/* LAYER 2: WALL SHELF WITH BOOKS, PLANT, AND TICKING WALL CLOCK */}
          <g transform={`translate(${shelfOffsetX}, ${shelfOffsetY})`}>
            {/* Wooden Wall Shelf */}
            <rect x="30" y="100" width="90" height="8" rx="2" fill="#78350f" />
            <polygon points="36,108 46,128 50,108" fill="#451a03" />
            <polygon points="100,108 110,128 114,108" fill="#451a03" />

            {/* Colorful Books on Shelf */}
            <rect x="36" y="65" width="12" height="35" rx="1" fill="#ef4444" />
            <rect x="50" y="60" width="14" height="40" rx="1" fill="#3b82f6" />
            <rect x="66" y="68" width="10" height="32" rx="1" fill="#10b981" />
            {/* Leaning Book */}
            <g transform="translate(80, 72) rotate(18)">
              <rect x="0" y="0" width="12" height="34" rx="1" fill="#f59e0b" />
            </g>

            {/* Small Potted Ivy Plant */}
            <g transform="translate(100, 85)">
              <path d="M 0 15 L 4 0 L 16 0 L 20 15 Z" fill="#d97706" />
              {/* Green Leaves */}
              <circle cx="6" cy="-2" r="5" fill="#22c55e" />
              <circle cx="14" cy="-4" r="6" fill="#16a34a" />
              <path d="M 18 4 Q 24 14 20 22" stroke="#15803d" strokeWidth="1.5" fill="none" />
              <circle cx="20" cy="20" r="3" fill="#22c55e" />
            </g>

            {/* Study Wall Clock */}
            <g transform="translate(425, 95)">
              <circle cx="0" cy="0" r="24" fill="#ffffff" stroke={isNightMode ? '#475569' : '#cbd5e1'} strokeWidth="3" />
              {/* Hour Marks */}
              <circle cx="0" cy="-18" r="1.5" fill="#1e293b" />
              <circle cx="18" cy="0" r="1.5" fill="#1e293b" />
              <circle cx="0" cy="18" r="1.5" fill="#1e293b" />
              <circle cx="-18" cy="0" r="1.5" fill="#1e293b" />
              {/* Hour Hand */}
              <line x1="0" y1="0" x2="8" y2="-8" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Minute Hand */}
              <line
                x1="0"
                y1="0"
                x2={Math.sin((clockDegrees * Math.PI) / 180) * 14}
                y2={-Math.cos((clockDegrees * Math.PI) / 180) * 14}
                stroke="#4f46e5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
            </g>
          </g>

          {/* LAYER 3: DESK LAMP CONE OF VOLUMETRIC LIGHT */}
          {isLampOn && (
            <polygon
              points="415,225 150,450 490,450"
              fill="url(#lampGlow)"
              style={{ mixBlendMode: isNightMode ? 'screen' : 'multiply' }}
            />
          )}

          {/* LAYER 4: THE STUDYING KID (BODY, HEAD, HAIR, AND INTERACTIVE EYES) */}
          <g
            id="kid-studying-character"
            transform={`translate(${kidHeadOffsetX}, ${kidHeadOffsetY})`}
            className="transition-transform duration-100 ease-out"
          >
            {/* Kid Torso & Hoodie Sweater */}
            <path
              d="M 185 410 Q 250 375 315 410 L 330 490 L 170 490 Z"
              fill="url(#kidHoodie)"
            />
            {/* White T-shirt collar showing */}
            <polygon points="238,390 262,390 250,405" fill="#ffffff" />

            {/* Left Arm resting on desk */}
            <path
              d="M 185 415 Q 160 450 190 465 L 220 460"
              fill="none"
              stroke="#4338ca"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Left Hand holding page */}
            <circle cx="215" cy="458" r="9" fill="#fed7aa" />

            {/* Right Arm holding study pencil */}
            <path
              d="M 315 415 Q 340 445 305 465 L 275 462"
              fill="none"
              stroke="#4338ca"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Right Hand */}
            <circle cx="280" cy="460" r="9" fill="#fed7aa" />
            {/* Yellow Pencil in Hand */}
            <g transform="translate(282, 452) rotate(-35)">
              <rect x="0" y="0" width="5" height="24" rx="1" fill="#f59e0b" />
              <polygon points="0,24 5,24 2.5,29" fill="#fed7aa" />
              <polygon points="1.5,27 3.5,27 2.5,29" fill="#1e293b" />
            </g>

            {/* Kid Neck */}
            <rect x="238" y="360" width="24" height="32" rx="4" fill="#fcd34d" />

            {/* Kid Head & Face */}
            <ellipse cx="250" cy="315" rx="50" ry="54" fill="#fed7aa" />
            {/* Rosy Cheeks */}
            <circle cx="216" cy="330" r="8" fill="#fda4af" opacity="0.6" />
            <circle cx="284" cy="330" r="8" fill="#fda4af" opacity="0.6" />

            {/* Cute Ears */}
            <ellipse cx="198" cy="315" rx="7" ry="11" fill="#fed7aa" />
            <ellipse cx="198" cy="315" rx="4" ry="6" fill="#fbcfe8" />
            <ellipse cx="302" cy="315" rx="7" ry="11" fill="#fed7aa" />
            <ellipse cx="302" cy="315" rx="4" ry="6" fill="#fbcfe8" />

            {/* Eyebrows with Focus Reaction */}
            <g>
              <path
                d={
                  focusedField === 'password'
                    ? 'M 218 288 Q 230 292 242 289' // focused / curious peek
                    : 'M 218 290 Q 230 286 242 290' // normal warm arch
                }
                stroke="#1e293b"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={
                  focusedField === 'password'
                    ? 'M 258 289 Q 270 292 282 288'
                    : 'M 258 290 Q 270 286 282 290'
                }
                stroke="#1e293b"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* THE EYES: ACCURATE CURSOR-FOLLOWING PUPILS & BLINKING EYELIDS */}
            {/* LEFT EYE */}
            <g id="kid-left-eye">
              {/* Eye Socket White Sclera */}
              <ellipse cx="230" cy="305" rx="13" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Eye Iris + Pupil + Specular Gloss Highlights (tracks cursor pointer!) */}
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.left.x}, ${pupilOffset.left.y})`}>
                  {/* Iris */}
                  <circle cx="230" cy="305" r="7.8" fill="#1e293b" />
                  <circle cx="230" cy="305" r="5.5" fill="#0f172a" />
                  {/* Inner iris colored ring (vibrant hazel/ocean) */}
                  <circle cx="230" cy="305" r="3.8" fill="#3b82f6" opacity="0.35" />
                  {/* Specular White Highlights */}
                  <circle cx="228" cy="302" r="2.2" fill="#ffffff" />
                  <circle cx="232.5" cy="307" r="1.1" fill="#ffffff" opacity="0.9" />
                </g>
              ) : (
                /* Blinking closed eyelid line */
                <path d="M 218 305 Q 230 312 242 305" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
              )}
            </g>

            {/* RIGHT EYE */}
            <g id="kid-right-eye">
              {/* Eye Socket White Sclera */}
              <ellipse cx="270" cy="305" rx="13" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

              {/* Eye Iris + Pupil + Specular Gloss Highlights (tracks cursor pointer!) */}
              {!isBlinking ? (
                <g transform={`translate(${pupilOffset.right.x}, ${pupilOffset.right.y})`}>
                  {/* Iris */}
                  <circle cx="270" cy="305" r="7.8" fill="#1e293b" />
                  <circle cx="270" cy="305" r="5.5" fill="#0f172a" />
                  <circle cx="270" cy="305" r="3.8" fill="#3b82f6" opacity="0.35" />
                  {/* Specular White Highlights */}
                  <circle cx="268" cy="302" r="2.2" fill="#ffffff" />
                  <circle cx="272.5" cy="307" r="1.1" fill="#ffffff" opacity="0.9" />
                </g>
              ) : (
                <path d="M 258 305 Q 270 312 282 305" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
              )}
            </g>

            {/* Cute Small Nose */}
            <path d="M 248 322 Q 252 327 254 324" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Gentle Smile / Focused Mouth */}
            <path
              d={
                focusedField === 'password'
                  ? 'M 244 340 Q 250 345 256 340' // playful little grin
                  : 'M 243 338 Q 250 343 257 338' // peaceful study smile
              }
              stroke="#7c2d12"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Kid's Stylish Hair (Swaying tufts) */}
            <g>
              {/* Back Hair */}
              <path
                d="M 200 310 Q 192 250 250 245 Q 308 250 300 310 Z"
                fill="url(#kidHair)"
              />
              {/* Front Bangs & Side Locks */}
              <path
                d="M 195 285 Q 220 260 250 268 Q 285 260 305 285 Q 295 275 280 278 Q 260 270 240 278 Q 215 272 195 285 Z"
                fill="#334155"
              />
              {/* Playful Top Hair Tuft */}
              <path
                d="M 245 248 Q 248 230 258 234 Q 252 245 255 249"
                fill="#1e293b"
              />
            </g>
          </g>

          {/* LAYER 5: THE STUDY DESK, BOOKS, MUG, LAPTOP, AND LAMP */}
          <g id="study-desk-surface" transform={`translate(${deskOffsetX}, 0)`}>
            {/* Main Desk Bevel & Wood Surface */}
            <rect x="0" y="440" width="500" height="28" fill="url(#deskWood)" />
            <rect x="0" y="468" width="500" height="132" fill="#78350f" />
            {/* Front Desk Edge Highlight */}
            <line x1="0" y1="440" x2="500" y2="440" stroke="#fcd34d" strokeWidth="1.5" opacity="0.6" />

            {/* Open Study Notebook on Desk */}
            <g transform="translate(195, 436)">
              {/* White Notebook Pages */}
              <polygon points="0,8 55,2 55,42 0,48" fill="#f8fafc" />
              <polygon points="55,2 110,8 110,48 55,42" fill="#ffffff" />
              {/* Spine Binding */}
              <line x1="55" y1="2" x2="55" y2="42" stroke="#cbd5e1" strokeWidth="2" />
              {/* Handwritten Study Lines / Formulas */}
              <line x1="10" y1="14" x2="45" y2="14" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="10" y1="20" x2="48" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="10" y1="26" x2="42" y2="26" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="62" y1="14" x2="100" y2="14" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 2" />
              <line x1="62" y1="20" x2="95" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
              {/* Small Red Bookmark Ribbon */}
              <line x1="55" y1="2" x2="55" y2="46" stroke="#ef4444" strokeWidth="2" />
            </g>

            {/* Stack of Thick Campus Textbooks (Algorithms, Quantum Physics) */}
            <g transform="translate(25, 410)">
              {/* Bottom Book: Algorithms */}
              <rect x="0" y="18" width="85" height="14" rx="2" fill="#2563eb" />
              <rect x="80" y="20" width="4" height="10" fill="#f8fafc" />
              {/* Middle Book: Data Systems */}
              <rect x="5" y="6" width="76" height="12" rx="2" fill="#059669" />
              <rect x="76" y="8" width="4" height="8" fill="#f8fafc" />
              {/* Top Book: AI Neural Nets */}
              <rect x="10" y="-4" width="68" height="10" rx="2" fill="#d97706" />
              <rect x="74" y="-2" width="3" height="6" fill="#f8fafc" />
            </g>

            {/* Ceramic Coffee / Tea Mug with Steaming Vapor */}
            <g transform="translate(130, 424)">
              {/* Mug Body */}
              <rect x="0" y="0" width="22" height="24" rx="4" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              {/* Mug Handle */}
              <path d="M 22 4 Q 30 12 22 20" stroke="#e2e8f0" strokeWidth="3" fill="none" />
              {/* University Logo on Mug */}
              <circle cx="11" cy="12" r="4" fill="#4f46e5" opacity="0.8" />
              {/* Rising Animated Steam */}
              {isPlaying && (
                <g className="animate-pulse" opacity="0.6">
                  <path d="M 6 -4 Q 10 -12 6 -20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <path d="M 14 -4 Q 10 -14 16 -24" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </g>
              )}
            </g>

            {/* Sleek Laptop with Glowing Screen */}
            <g transform="translate(325, 416)">
              {/* Screen Shell */}
              <polygon points="12,0 78,0 84,36 6,36" fill="#1e293b" />
              {/* Screen Display Glow */}
              <polygon points="16,3 74,3 79,33 11,33" fill="url(#laptopGlow)" />
              {/* Code lines on screen */}
              <line x1="22" y1="10" x2="50" y2="10" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
              <line x1="22" y1="16" x2="65" y2="16" stroke="#fef08a" strokeWidth="1.2" opacity="0.9" />
              <line x1="22" y1="22" x2="45" y2="22" stroke="#a7f3d0" strokeWidth="1.2" opacity="0.9" />
              <line x1="22" y1="28" x2="58" y2="28" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />
              {/* Base Keyboard */}
              <polygon points="0,36 90,36 96,44 -6,44" fill="#334155" />
              <rect x="36" y="38" width="18" height="3" rx="1" fill="#64748b" />
            </g>

            {/* Articulated Brass Desk Lamp (Clickable!) */}
            <g
              transform="translate(425, 290)"
              className="cursor-pointer group/lamp"
              onClick={() => setIsLampOn(!isLampOn)}
              title="Click lamp to toggle light"
            >
              {/* Heavy Lamp Base */}
              <ellipse cx="0" cy="150" rx="20" ry="6" fill="#92400e" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Articulated Rods */}
              <line x1="0" y1="150" x2="10" y2="80" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
              <circle cx="10" cy="80" r="4" fill="#b45309" />
              <line x1="10" y1="80" x2="-20" y2="30" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
              <circle cx="-20" cy="30" r="4" fill="#b45309" />
              {/* Lamp Shade Head */}
              <path d="M -35 25 L -5 10 L 0 35 L -35 38 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Light Bulb */}
              <circle cx="-16" cy="32" r="5" fill={isLampOn ? '#fef08a' : '#94a3b8'} />
            </g>
          </g>

          {/* LAYER 6: FLOATING STUDY PARTICLES & DUST MOTES (PARALLAX MOTION) */}
          <g transform={`translate(${particlesOffsetX}, 0)`} opacity="0.75">
            <text x="70" y="280" fill="#fde047" fontSize="12" opacity="0.6" className="animate-bounce font-mono">
              ∑
            </text>
            <text x="390" y="260" fill="#60a5fa" fontSize="14" opacity="0.5" className="animate-pulse font-mono">
              π
            </text>
            <text x="140" y="390" fill="#a78bfa" fontSize="12" opacity="0.5" className="font-mono">
              ∫
            </text>
            <circle cx="180" cy="270" r="1.5" fill="#fef08a" opacity="0.8" />
            <circle cx="340" cy="310" r="2" fill="#ffffff" opacity="0.6" />
            <circle cx="280" cy="230" r="1" fill="#fef08a" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* 3. INTERACTIVE STUDY VIDEO STATUS BADGE & MOUSE TRACKING HINT */}
      <div className="relative z-30 px-3 sm:px-4 py-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-md bg-slate-900/70 text-slate-300 text-[10px] font-medium border border-slate-700/50 backdrop-blur-xs flex items-center gap-1.5 pointer-events-auto">
            <Sparkles className="w-3 h-3 text-brand" />
            <span>Eyes follow your cursor live</span>
          </div>
          {focusedField && (
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-brand/20 text-brand-light text-[10px] font-semibold border border-brand/30 animate-pulse">
              Observing {focusedField}...
            </span>
          )}
        </div>

        {/* Ambient Mood Tag */}
        <span className="text-[10px] text-slate-400 font-mono bg-slate-900/70 px-2 py-0.5 rounded border border-slate-800">
          {isNightMode ? 'Cozy Midnight' : 'Sunny Campus Day'}
        </span>
      </div>

      {/* 4. BOTTOM VIDEO CONTROLS & TIMELINE BAR */}
      <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent text-white backdrop-blur-xs border-t border-slate-800/40">
        {/* Animated timeline scrubber */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-3 relative group/scrub cursor-pointer">
          <div
            className="h-full bg-gradient-to-r from-brand via-indigo-400 to-sky-400 transition-all duration-300 rounded-full"
            style={{ width: `${(elapsedSeconds % 120) * (100 / 120)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause Study Animation' : 'Resume Study Animation'}
              className="btn-press p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Timecode */}
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatTime(elapsedSeconds)}</span>
              <span className="text-slate-500">/ 60:00</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Resolution indicator */}
            <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
              HD 60FPS
            </span>

            {/* Fullscreen / expand */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand Video Scene'}
              className="btn-press p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
