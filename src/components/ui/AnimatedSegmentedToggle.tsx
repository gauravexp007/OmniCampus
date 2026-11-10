import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface AnimatedSegmentedToggleProps<T extends string | number> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md' | 'lg';
  layoutId?: string;
  enableHoverConfetti?: boolean;
  className?: string;
}

/**
 * Animated Segmented Toggle Button UI
 * Features fluid spring layout pill transition, active highlight morphing, and tactile feedback.
 * Fully optimized with high contrast visibility in both light mode and dark mode.
 */
export function AnimatedSegmentedToggle<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
  layoutId = 'segmented-toggle-highlight',
  className,
}: AnimatedSegmentedToggleProps<T>) {
  const sizeStyles = {
    sm: 'p-0.5 text-xs rounded-lg gap-0.5',
    md: 'p-1 text-xs rounded-xl gap-1',
    lg: 'p-1.5 text-sm rounded-xl gap-1.5',
  };

  const buttonSizeStyles = {
    sm: 'px-2.5 py-1 rounded-md text-[11px] gap-1.5',
    md: 'px-3 py-1.5 rounded-lg text-xs gap-1.5',
    lg: 'px-4 py-2 rounded-lg text-sm gap-2',
  };

  return (
    <div
      role="radiogroup"
      data-segmented-toggle="true"
      className={cn(
        'inline-flex items-center bg-slate-100 dark:bg-[#1e2229] border border-slate-200/90 dark:border-[#373e4b] shadow-2xs select-none transition-colors',
        sizeStyles[size],
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap focus:outline-hidden',
              buttonSizeStyles[size],
              isSelected
                ? 'text-slate-900 dark:text-white font-extrabold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold'
            )}
          >
            {/* Sliding Fluid Background Pill with Spring Physics */}
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: 'spring',
                  stiffness: 480,
                  damping: 32,
                  mass: 0.8,
                }}
                className="absolute inset-0 bg-white dark:bg-[#2d3442] rounded-lg shadow-xs border border-slate-200/80 dark:border-[#475569] -z-10"
              />
            )}

            {option.icon && (
              <span
                className={cn(
                  'shrink-0 transition-transform duration-200',
                  isSelected ? 'text-brand dark:text-[#a3f7bf] scale-105' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {option.icon}
              </span>
            )}

            <span>{option.label}</span>

            {option.badge !== undefined && (
              <span
                className={cn(
                  'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold',
                  isSelected
                    ? 'bg-brand/10 dark:bg-[#a3f7bf]/20 text-brand dark:text-[#a3f7bf]'
                    : 'bg-slate-200 dark:bg-[#353d4c] text-slate-600 dark:text-slate-300'
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
