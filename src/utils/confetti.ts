import confetti from 'canvas-confetti';
import type React from 'react';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  scalar?: number;
  shapes?: ('square' | 'circle' | 'star')[];
}

const DEFAULT_CONFETTI_COLORS = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#fbbf24', // yellow
];

// Helper to calculate normalized (0-1) viewport coordinates from element or MouseEvent
const getNormalizedOrigin = (
  target: HTMLElement | MouseEvent | React.MouseEvent | { clientX: number; clientY: number }
): { x: number; y: number } => {
  if ('clientX' in target && 'clientY' in target) {
    return {
      x: Math.max(0, Math.min(1, target.clientX / window.innerWidth)),
      y: Math.max(0, Math.min(1, target.clientY / window.innerHeight)),
    };
  }

  if (target instanceof HTMLElement) {
    const rect = target.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.innerWidth)),
      y: Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.innerHeight)),
    };
  }

  return { x: 0.5, y: 0.5 };
};

// Debounce map for hover events to avoid rapid multiple bursts on mouse move
const hoverDebounceMap = new WeakMap<HTMLElement, number>();

/**
 * Dribbble-style confetti hover burst - removed per user request.
 * Safely stubbed to a no-op to eliminate any confetti hover effect across all modules.
 */
export const fireHoverConfetti = (
  _target?: HTMLElement | React.MouseEvent | MouseEvent,
  _options: ConfettiOptions = {}
) => {
  // Confetti hover effect removed
};

/**
 * Trigger full celebratory burst (e.g., for successful submissions, saving grades, marking attendance)
 */
export const fireCelebrationConfetti = (
  target?: HTMLElement | React.MouseEvent | MouseEvent,
  options: ConfettiOptions = {}
) => {
  const origin = target ? getNormalizedOrigin(target) : { x: 0.5, y: 0.5 };

  try {
    // Multi-angle festive explosion
    confetti({
      particleCount: options.particleCount ?? 45,
      spread: options.spread ?? 80,
      startVelocity: options.startVelocity ?? 28,
      ticks: options.ticks ?? 200,
      gravity: 0.9,
      origin: options.origin ?? origin,
      colors: options.colors ?? DEFAULT_CONFETTI_COLORS,
      shapes: options.shapes ?? ['circle', 'square', 'star'],
      disableForReducedMotion: true,
      zIndex: 9999,
    });

    // Secondary delayed sparkle burst
    setTimeout(() => {
      confetti({
        particleCount: 20,
        spread: 60,
        startVelocity: 15,
        ticks: 140,
        gravity: 0.7,
        origin,
        colors: options.colors ?? DEFAULT_CONFETTI_COLORS,
        shapes: ['star', 'circle'],
        scalar: 0.6,
        disableForReducedMotion: true,
        zIndex: 9999,
      });
    }, 150);
  } catch (err) {
    console.debug('Confetti celebration skipped:', err);
  }
};
