import React from 'react';

/**
 * AmbientBackgroundLight
 * Creates a luminous ambient light movement effect at the background with blur effects.
 * Moves smoothly with fluid 3D drifting animations, visible in both light and dark mode.
 */
export const AmbientBackgroundLight: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none transition-opacity duration-700"
    >
      {/* Light Movement Orb 1: Top-Left (Smoky Slate #7F8CAA / #393E46) */}
      <div
        className="absolute -top-[14%] -left-[8%] w-[620px] h-[620px] sm:w-[780px] sm:h-[780px] rounded-full 
          bg-linear-to-br from-[#7F8CAA]/35 via-[#7F8CAA]/18 to-transparent 
          dark:from-[#7F8CAA]/40 dark:via-[#393E46]/50 dark:to-transparent 
          blur-[90px] sm:blur-[130px] animate-ambient-drift-1"
      />

      {/* Light Movement Orb 2: Top-Right (Smoky Flame Glow) */}
      <div
        className="absolute top-[18%] -right-[10%] w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] rounded-full 
          bg-linear-to-bl from-[#7F8CAA]/30 via-[#A8B6D4]/20 to-transparent 
          dark:from-[#7F8CAA]/35 dark:via-[#393E46]/40 dark:to-transparent 
          blur-[90px] sm:blur-[120px] animate-ambient-drift-2"
        style={{ animationDelay: '-4s' }}
      />

      {/* Light Movement Orb 3: Bottom-Left (Deep Smoky Flame Drift) */}
      <div
        className="absolute -bottom-[12%] left-[18%] w-[640px] h-[640px] sm:w-[800px] sm:h-[800px] rounded-full 
          bg-linear-to-tr from-[#7F8CAA]/32 via-[#393E46]/40 to-transparent 
          dark:from-[#7F8CAA]/36 dark:via-[#393E46]/60 dark:to-transparent 
          blur-[100px] sm:blur-[140px] animate-ambient-drift-3"
        style={{ animationDelay: '-8s' }}
      />

      {/* Light Movement Orb 4: Center-Right Floating Smoky Shading */}
      <div
        className="absolute top-[48%] left-[42%] w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full 
          bg-linear-to-r from-[#A8B6D4]/24 via-[#7F8CAA]/20 to-transparent 
          dark:from-[#7F8CAA]/28 dark:via-[#393E46]/35 dark:to-transparent 
          blur-[80px] sm:blur-[110px] animate-ambient-drift-4"
        style={{ animationDelay: '-2s' }}
      />

      {/* Subtle Dynamic Caustic Shimmer Light Beam */}
      <div
        className="absolute inset-0 bg-radial from-white/[0.04] dark:from-[#a3f7bf]/[0.03] via-transparent to-transparent 
          pointer-events-none mix-blend-overlay animate-ambient-pulse"
      />
    </div>
  );
};
