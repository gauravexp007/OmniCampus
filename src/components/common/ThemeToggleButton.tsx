import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';

interface ThemeToggleButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Animated Day/Night Toggle Switch inspired by Dribbble:
 * https://dribbble.com/shots/27032115-Toggle-Button-UI-Animation
 * 
 * Features:
 * - Fluid spring-animated sun/moon knob with 360° rotation
 * - Day sky with organic fluffy floating clouds & radiant sun aura
 * - Night cosmos with glowing craters, twinkling stars & deep starlight gradient
 * - Tactile press feedback and complete keyboard accessibility
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  className,
  size = 'md',
  showLabel = false,
}) => {
  const { isDarkMode, toggleDarkMode } = useERP();

  // Size configurations
  const dimensions = {
    sm: { width: 58, height: 30, knobSize: 22, travel: 28 },
    md: { width: 68, height: 34, knobSize: 26, travel: 34 },
    lg: { width: 80, height: 40, knobSize: 32, travel: 40 },
  }[size];

  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        onClick={toggleDarkMode}
        className={cn(
          'relative rounded-full p-1 cursor-pointer overflow-hidden transition-all duration-300',
          'focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
          'shadow-xs hover:shadow-md active:scale-95 group'
        )}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {/* Sky Track Background (Day vs Night Gradient) */}
        <motion.div
          className="absolute inset-0 transition-colors duration-500"
          initial={false}
          animate={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #27323a 0%, #435055 50%, #29a19c 100%)'
              : 'linear-gradient(135deg, #38BDF8 0%, #60A5FA 50%, #93C5FD 100%)',
          }}
          style={{
            boxShadow: isDarkMode
              ? 'inset 0 2px 4px rgba(0, 0, 0, 0.6), inset 0 -1px 2px rgba(255, 255, 255, 0.1)'
              : 'inset 0 2px 4px rgba(0, 0, 0, 0.15), inset 0 -2px 3px rgba(255, 255, 255, 0.6)',
          }}
        />

        {/* --- NIGHT ELEMENTS: Twinkling Stars & Constellation --- */}
        <AnimatePresence>
          {isDarkMode && (
            <motion.div
              key="night-stars"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Primary 4-pointed sparkle star */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1.5 left-2.5 text-amber-200"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </motion.div>

              {/* Secondary soft star */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
                className="absolute bottom-2 left-4 text-white"
              >
                <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </motion.div>

              {/* Tiny starlight specks */}
              <span className="absolute top-4 left-6 w-1 h-1 rounded-full bg-blue-200 shadow-[0_0_3px_#bfdbfe]" />
              <span className="absolute bottom-2.5 left-7 w-0.5 h-0.5 rounded-full bg-amber-100" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- DAY ELEMENTS: Fluffy Floating Clouds --- */}
        <AnimatePresence>
          {!isDarkMode && (
            <motion.div
              key="day-clouds"
              initial={{ opacity: 0, x: 12, y: 4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 16, y: 6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute right-1 bottom-0.5 pointer-events-none"
            >
              {/* Back subtle cloud puff */}
              <div className="absolute -top-3 right-3 w-4 h-4 rounded-full bg-white/70 blur-[0.5px]" />
              {/* Front main cloud puffs */}
              <div className="relative flex items-end">
                <div className="w-4 h-4 rounded-full bg-white/95 -mr-1.5 shadow-2xs" />
                <div className="w-5 h-5 rounded-full bg-white -mr-1.5 shadow-2xs" />
                <div className="w-3.5 h-3.5 rounded-full bg-white/90" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ANIMATED SLIDING KNOB (Sun morphing into Moon) --- */}
        <motion.div
          className="relative rounded-full flex items-center justify-center z-10"
          style={{
            width: `${dimensions.knobSize}px`,
            height: `${dimensions.knobSize}px`,
          }}
          initial={false}
          animate={{
            x: isDarkMode ? dimensions.travel : 0,
            rotate: isDarkMode ? 360 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 480,
            damping: 30,
            mass: 0.8,
          }}
        >
          {/* Knob Outer Body */}
          <div
            className={cn(
              'w-full h-full rounded-full relative overflow-hidden transition-all duration-300',
              isDarkMode
                ? 'bg-gradient-to-tr from-slate-300 via-slate-100 to-white shadow-[0_0_12px_rgba(224,231,255,0.85)]'
                : 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 shadow-[0_0_14px_rgba(251,191,36,0.9)]'
            )}
          >
            {/* Sun Aura & Radiant Ring */}
            {!isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200"
              >
                {/* Subtle internal core highlight */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-white/60 blur-[0.6px]" />
              </motion.div>
            )}

            {/* Moon Surface with Detailed Craters */}
            {isDarkMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full"
              >
                {/* Crater 1 (Top Right) */}
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300/80 shadow-[inset_1px_1px_1px_rgba(71,85,105,0.5)]"
                />
                {/* Crater 2 (Bottom Left) */}
                <span
                  className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-300/70 shadow-[inset_1px_1px_1px_rgba(71,85,105,0.4)]"
                />
                {/* Crater 3 (Bottom Center) */}
                <span
                  className="absolute bottom-1 right-2.5 w-1 h-1 rounded-full bg-slate-300/60 shadow-[inset_0.5px_0.5px_1px_rgba(71,85,105,0.3)]"
                />
                {/* Moon crescent sheen */}
                <div className="absolute top-0.5 left-0.5 w-full h-full rounded-full border-t border-l border-white/80 pointer-events-none" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </button>

      {/* Optional Side Label */}
      {showLabel && (
        <span
          onClick={toggleDarkMode}
          className="text-xs font-semibold cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
};
