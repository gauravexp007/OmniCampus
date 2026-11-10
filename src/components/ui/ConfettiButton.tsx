import React, { useRef } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';
import { fireCelebrationConfetti } from '../../utils/confetti';

export interface ConfettiButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'brand' | 'success' | 'outline' | 'secondary' | 'ghost' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  enableHoverConfetti?: boolean;
  enableClickCelebration?: boolean;
  className?: string;
}

export const ConfettiButton: React.FC<ConfettiButtonProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  enableHoverConfetti = false,
  enableClickCelebration = true,
  className,
  onMouseEnter,
  onClick,
  disabled,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && enableClickCelebration && buttonRef.current) {
      fireCelebrationConfetti(buttonRef.current);
    }
    onClick?.(e);
  };

  const variantStyles = {
    brand:
      'bg-brand hover:bg-brand-hover text-white shadow-xs border border-transparent focus:ring-2 focus:ring-brand/30',
    primary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs border border-transparent focus:ring-2 focus:ring-indigo-300',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border border-transparent focus:ring-2 focus:ring-emerald-300',
    rose:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-transparent focus:ring-2 focus:ring-rose-300',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 focus:ring-2 focus:ring-slate-300',
    outline:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-brand/20',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-transparent focus:ring-2 focus:ring-slate-200',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs font-semibold rounded-lg gap-1.5',
    md: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-4 py-2 text-sm font-bold rounded-xl gap-2',
  };

  return (
    <motion.button
      ref={buttonRef}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
