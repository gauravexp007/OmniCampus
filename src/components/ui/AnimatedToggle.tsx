import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AnimatedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: 'brand' | 'emerald' | 'indigo' | 'blue';
  showIcons?: boolean;
  triggerConfettiOnActivate?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * High-fidelity Animated Toggle Switch
 * Directly inspired by https://dribbble.com/shots/27032115-Toggle-Button-UI-Animation
 * Features spring-physics sliding thumb, squash & stretch morphing, inner glow, and micro-icons.
 */
export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  activeColor = 'brand',
  showIcons = true,
  triggerConfettiOnActivate = false,
  disabled = false,
  className,
}) => {
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (disabled) return;
    const nextState = !checked;
    onChange(nextState);
  };

  // Dimensions & scaling per size
  const sizeMap = {
    sm: {
      track: 'w-10 h-5 p-0.5 rounded-full',
      knob: 'w-4 h-4',
      knobTranslate: 20, // px
      iconSize: 10,
    },
    md: {
      track: 'w-13 h-7 p-1 rounded-full',
      knob: 'w-5 h-5',
      knobTranslate: 24, // px
      iconSize: 12,
    },
    lg: {
      track: 'w-16 h-8 p-1 rounded-full',
      knob: 'w-6 h-6',
      knobTranslate: 32, // px
      iconSize: 14,
    },
  };

  const activeColorMap = {
    brand: 'bg-brand border-brand/80 shadow-[0_0_12px_rgba(79,70,229,0.35)]',
    emerald: 'bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
    indigo: 'bg-indigo-600 border-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.35)]',
    blue: 'bg-blue-600 border-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.35)]',
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex items-center shrink-0 border transition-colors duration-250 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand/30',
          currentSize.track,
          checked
            ? activeColorMap[activeColor]
            : 'bg-slate-200 hover:bg-slate-300/80 border-slate-300/70 shadow-inner'
        )}
      >
        {/* Animated fluid spring sliding thumb */}
        <motion.div
          animate={{
            x: checked ? currentSize.knobTranslate : 0,
            scaleX: [1, 1.14, 1], // Organic squash-and-stretch physics
            scaleY: [1, 0.92, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 520,
            damping: 28,
            mass: 0.6,
          }}
          className={cn(
            'rounded-full bg-white shadow-md flex items-center justify-center pointer-events-none',
            currentSize.knob
          )}
        >
          {showIcons && (
            <motion.div
              key={checked ? 'checked-icon' : 'unchecked-icon'}
              initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="text-slate-700"
            >
              {checked ? (
                <Check
                  className="text-brand font-black"
                  style={{ width: currentSize.iconSize, height: currentSize.iconSize }}
                />
              ) : (
                <X
                  className="text-slate-400 font-bold"
                  style={{ width: currentSize.iconSize, height: currentSize.iconSize }}
                />
              )}
            </motion.div>
          )}
        </motion.div>
      </button>

      {(label || description) && (
        <div className="flex flex-col cursor-pointer" onClick={handleToggle}>
          {label && <span className="text-xs font-bold text-slate-800 leading-tight">{label}</span>}
          {description && (
            <span className="text-[11px] text-slate-500 leading-tight mt-0.5">{description}</span>
          )}
        </div>
      )}
    </div>
  );
};
