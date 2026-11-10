import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Flame, Award, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================================================
// 1. ANIMATED COUNTER (ROLL-UP NUMERICAL EFFECT)
// ============================================================================

export interface AnimatedCounterProps {
  value: number;
  duration?: number; // in milliseconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);
  const startTimestampRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(0);
  const targetValueRef = useRef<number>(value);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    startValueRef.current = displayValue;
    targetValueRef.current = value;
    startTimestampRef.current = null;

    let animationFrameId: number;

    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };

    const step = (timestamp: number) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const progress = Math.min((timestamp - startTimestampRef.current) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = startValueRef.current + (targetValueRef.current - startValueRef.current) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValueRef.current);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, shouldReduceMotion]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn('tabular-nums font-mono', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

// ============================================================================
// 2. SPOTLIGHT CARD (CURSOR-FOLLOWING RADIAL GLOW & MAGNETIC SPRING LIFT)
// ============================================================================

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  hoverLift?: boolean;
  onClick?: () => void;
  id?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = 'rgba(108, 125, 138, 0.14)',
  hoverLift = true,
  onClick,
  id,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !spotlightRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(420px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
  };

  const handleMouseEnter = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '1';
    if (sheenRef.current) sheenRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (spotlightRef.current) spotlightRef.current.style.opacity = '0';
    if (sheenRef.current) sheenRef.current.style.opacity = '0';
  };

  return (
    <motion.div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverLift ? { y: -3, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } } : undefined}
      whileTap={onClick ? { scale: 0.985, transition: { duration: 0.08 } } : undefined}
      className={cn(
        'relative overflow-hidden transition-shadow duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Dynamic Cursor Spotlight Radial Overlay (Direct DOM styled, 0 React re-renders) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(420px circle at -1000px -1000px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {/* Ambient subtle light sheen border */}
      <div
        ref={sheenRef}
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/40 dark:border-white/10 opacity-0 transition-opacity duration-300 z-10"
      />
      <div className="relative z-0 h-full">{children}</div>
    </motion.div>
  );
};

// ============================================================================
// 3. FLUID TAB SLIDER (SHARED LAYOUT GLIDING PILL INDICATOR)
// ============================================================================

export interface FluidTabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.FC<{ className?: string }>;
  count?: number;
  badge?: string;
}

export interface FluidTabsProps<T extends string = string> {
  tabs: FluidTabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  layoutId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FluidTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'dribbble-fluid-tab',
  className,
  size = 'md',
}: FluidTabsProps<T>) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs backdrop-blur-xs select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative z-10 flex items-center gap-1.5 font-bold transition-colors cursor-pointer rounded-xl',
              size === 'sm' && 'px-2.5 py-1 text-xs',
              size === 'md' && 'px-3 py-1.5 text-xs sm:text-sm',
              size === 'lg' && 'px-4 py-2 text-sm',
              isActive
                ? 'text-slate-950 dark:text-white font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {Icon && (
              <Icon
                className={cn(
                  'w-3.5 h-3.5 transition-transform duration-200',
                  isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'opacity-70'
                )}
              />
            )}
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 34,
                }}
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-700 z-[-1]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// 4. ANIMATED PROGRESS RING (SPRING STROKE-DASHOFFSET)
// ============================================================================

export interface AnimatedProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
  className?: string;
}

export const AnimatedProgressRing: React.FC<AnimatedProgressRingProps> = ({
  value,
  size = 46,
  strokeWidth = 4,
  color = '#10B981',
  bgColor = '#E2E8F0',
  showText = true,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const targetOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 24,
            mass: 0.8,
          }}
        />
      </svg>
      {showText && (
        <span className="absolute text-[10px] font-black font-mono tracking-tighter">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
};

// ============================================================================
// 5. MAGNETIC BUTTON (SPRING BOUNCE & TACTILE FEEDBACK)
// ============================================================================

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  className?: string;
  glow?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  className,
  glow = false,
  onClick,
  ...rest
}) => {
  return (
    <motion.button
      whileHover={{ y: -1.5, scale: 1.015, transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.96, transition: { duration: 0.08 } }}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center font-bold rounded-2xl transition-all cursor-pointer shadow-2xs select-none',
        variant === 'primary' &&
          'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-2 text-xs sm:text-sm',
        variant === 'secondary' &&
          'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-4 py-2 text-xs sm:text-sm',
        variant === 'ghost' &&
          'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 text-xs',
        variant === 'glass' &&
          'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white px-3.5 py-1.5 text-xs',
        glow && 'ring-2 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
        className
      )}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
};

// ============================================================================
// 6. DRIBBBLE CONFETTI CELEBRATION TRIGGER
// ============================================================================

export const triggerDribbbleConfetti = (originX = 0.5, originY = 0.6) => {
  // Burst 1: High velocity pastel core
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { x: originX, y: originY },
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'],
    ticks: 200,
    gravity: 1.1,
    scalar: 0.9,
    shapes: ['circle', 'square'],
  });

  // Burst 2: Ambient slow-drift confetti
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: originX - 0.1, y: originY },
      colors: ['#34D399', '#60A5FA', '#A78BFA'],
    });
  }, 100);

  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: originX + 0.1, y: originY },
      colors: ['#FBBF24', '#F472B6', '#38BDF8'],
    });
  }, 150);
};

// ============================================================================
// 7. DRIBBBLE MOTION SHOWCASE FLOATING PILL / BADGE
// ============================================================================

export const DribbbleMotionIndicator: React.FC<{
  onCelebrate?: () => void;
  className?: string;
}> = () => null;
