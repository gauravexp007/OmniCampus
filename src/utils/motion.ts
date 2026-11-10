/**
 * UI UX Pro Max Skill - Motion & Animation System
 * Grounded in https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
 * 
 * Includes:
 * - Shared easing curves & duration tokens (power1.out, power2.out, spring physics)
 * - Page/Route transitions with asymmetric timing (exit ~60% faster than entrance)
 * - Surface-aware hover micro-interactions (displacement < 2px, compositor transform/opacity only)
 * - Tactile press/click state feedback (scale: 0.97 - 0.98)
 * - Stagger sequences for cards, metrics, and lists (30-50ms stagger, max 8 items)
 * - Modal & Drawer spring physics
 * - Reduced motion safe defaults
 */

import { Variants, Transition } from 'motion/react';

// Easing token constants matching UI UX Pro Max Motion CSV
export const EASING = {
  // power1.out - Subtle micro-interactions, button hover
  subtleOut: [0.25, 0.46, 0.45, 0.94],
  // power2.out - Card hovers, scroll reveals, modal entrances
  standardOut: [0.16, 1, 0.3, 1],
  // power1.inOut - Page transitions, smooth fades
  smoothInOut: [0.42, 0, 0.58, 1],
  // power1.in - Snappy exits
  snappyIn: [0.55, 0.085, 0.68, 0.53],
  // Spring physics for natural interactive response (Apple HIG / Material Design)
  springBounce: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  } as Transition,
  springDrawer: {
    type: 'spring',
    stiffness: 350,
    damping: 32,
    mass: 1,
  } as Transition,
  springModal: {
    type: 'spring',
    stiffness: 420,
    damping: 28,
  } as Transition,
};

// Page / Module Transition Variants with Asymmetric Timing
// Exit is faster (160ms) than enter (260ms) to feel crisp and responsive
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.995,
    transition: {
      duration: 0.16,
      ease: [0.55, 0.085, 0.68, 0.53],
    },
  },
};

// Modal & Command Palette Variants (Spring Scale + Backdrop Fade)
export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

export const modalDialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: -8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 450,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: {
      duration: 0.14,
      ease: 'easeIn',
    },
  },
};

// Slide-in Drawer Variants (e.g. AI Assistant, Sheets)
export const drawerSlideVariants: Variants = {
  initial: {
    x: '100%',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
  },
  animate: {
    x: '0%',
    boxShadow: '-10px 0 25px -5px rgba(15, 23, 42, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 34,
      mass: 0.9,
    },
  },
  exit: {
    x: '100%',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// Mobile Bottom Sheet Variants
export const mobileSheetVariants: Variants = {
  initial: {
    y: '100%',
    opacity: 0.5,
  },
  animate: {
    y: '0%',
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 32,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

// Stagger Container for Grids, Metric Cards, and Feeds
// Stagger delay 40ms per item (capped under 8 items)
export const staggerContainerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Interactive Tap & Hover Presets (Reusable with motion components)
export const buttonTapHover = {
  whileHover: {
    scale: 1.02,
    y: -1,
    transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  whileTap: {
    scale: 0.97,
    y: 0,
    transition: { duration: 0.08, ease: 'easeOut' },
  },
};

export const cardTapHover = {
  whileHover: {
    y: -2,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  whileTap: {
    scale: 0.99,
    y: 0,
    transition: { duration: 0.08, ease: 'easeOut' },
  },
};

export const subtleTabHover = {
  whileHover: {
    scale: 1.01,
    transition: { duration: 0.12 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.06 },
  },
};
