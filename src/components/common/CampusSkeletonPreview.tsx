import React from 'react';
import { motion } from 'motion/react';
import { WifiOff, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

interface CampusSkeletonPreviewProps {
  reason?: 'offline' | 'weak' | 'loading' | 'simulated';
  onRetry?: () => void;
  onDismiss?: () => void;
  isSimulated?: boolean;
}

export const CampusSkeletonPreview: React.FC<CampusSkeletonPreviewProps> = ({
  reason = 'loading',
  onRetry,
  onDismiss,
  isSimulated = false,
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#8fa9cb] p-3 sm:p-6 md:p-8 flex flex-col items-center justify-center font-sans antialiased overflow-x-hidden selection:bg-[#132c4e] selection:text-white">
      {/* Top Advisory Banner for Weak/Offline Network State */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl mb-4 bg-white/95 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl p-3.5 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-slate-800 z-10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            {reason === 'offline' ? (
              <WifiOff className="w-5 h-5 text-rose-600" />
            ) : reason === 'weak' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-2">
              <span>
                {reason === 'offline'
                  ? 'No Internet Connection Detected'
                  : reason === 'weak'
                  ? 'Slow / Weak Network Connection'
                  : isSimulated
                  ? 'Simulated Offline Skeleton Preview'
                  : 'Synchronizing University ERP Records...'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Offline Mode
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              {reason === 'offline'
                ? 'Your device appears disconnected from the internet. Displaying cached dashboard skeleton preview.'
                : 'Connection bandwidth is constrained. Displaying layout skeleton while university data streams in.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#132c4e] text-white hover:bg-[#1a3861] transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <span>Dismiss Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Skeleton Frame Matching image.png */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-5xl bg-[#edf2f8] border border-white/80 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 space-y-5 animate-pulse"
      >
        {/* 1. Top Navbar Skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 gap-3">
          {/* Left: Brand circle logo + 2 placeholder title bars */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#132c4e] shrink-0" />
            <div className="space-y-1.5">
              <div className="h-2 w-16 sm:w-20 bg-slate-300 rounded-full" />
              <div className="h-1.5 w-10 sm:w-14 bg-slate-200 rounded-full" />
            </div>
          </div>

          {/* Right: Search Pill + Action Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-44 sm:w-64 rounded-full border border-slate-300/80 bg-white/80 flex items-center px-3 gap-2">
              <div className="w-3.5 h-3.5 rounded-full border border-slate-400 shrink-0" />
              <div className="h-2 w-12 bg-slate-200 rounded-full" />
              <div className="h-2 w-20 bg-slate-100 rounded-full hidden sm:block" />
            </div>
            <div className="h-8 w-16 sm:w-24 rounded-full bg-[#132c4e] shrink-0" />
          </div>
        </div>

        {/* 2. Main Body Grid: Left Sidebar Rail + Center Content + Right Auxiliary Cards */}
        <div className="flex gap-4 sm:gap-6">
          {/* Left Vertical Rail: 4 Circle Icons */}
          <div className="flex flex-col items-center gap-3.5 pt-2 shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#132c4e]" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#4f80be]" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#99b9dd]" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border border-slate-200" />
          </div>

          {/* Center Main Dashboard Content Area */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Hero Banner: Dark Navy Card with Avatar Silhouette, 3 Lines, and White Circle Indicator */}
            <div className="bg-[#132c4e] rounded-2xl p-4 sm:p-5 flex items-center justify-between text-white shadow-sm">
              <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
                {/* User avatar circle */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90" />
                </div>
                {/* 3 Text Placeholder Lines */}
                <div className="space-y-2 min-w-0">
                  <div className="h-3 sm:h-3.5 w-28 sm:w-36 bg-[#8bb3dc] rounded-full" />
                  <div className="h-2.5 sm:h-3 w-40 sm:w-56 bg-[#4f80be] rounded-full" />
                  <div className="h-2 sm:h-2.5 w-20 sm:w-24 bg-[#4f80be] rounded-full" />
                </div>
              </div>
              {/* Clean White Circle Badge */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-xs shrink-0 ml-3" />
            </div>

            {/* Sub-filter / Action Bar with 2 dots, line, and right rounded button */}
            <div className="bg-white/80 rounded-2xl h-11 sm:h-12 flex items-center justify-between px-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#132c4e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#132c4e]" />
                <div className="h-3 w-20 sm:w-32 bg-[#132c4e] rounded-full ml-1" />
              </div>
              <div className="h-7 sm:h-8 px-4 sm:px-5 rounded-full bg-[#5287c8] flex items-center gap-1.5">
                <div className="h-2 w-4 sm:w-5 bg-white/50 rounded-full" />
                <div className="h-2 w-4 sm:w-5 bg-white/50 rounded-full" />
              </div>
            </div>

            {/* Two Medium Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Left White Card */}
              <div className="bg-white rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5287c8]" />
                    <div className="h-2.5 w-24 bg-slate-200 rounded-full" />
                    <div className="h-2.5 w-12 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-32 bg-slate-100 rounded-full pl-5" />
                </div>
                <div className="h-px bg-slate-100" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5287c8]" />
                    <div className="h-2.5 w-28 bg-slate-200 rounded-full" />
                    <div className="h-2.5 w-14 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-20 bg-slate-100 rounded-full pl-5" />
                </div>
              </div>

              {/* Right White Card */}
              <div className="bg-white rounded-2xl p-4 space-y-3.5 shadow-2xs">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5287c8]" />
                    <div className="h-2.5 w-24 bg-slate-200 rounded-full" />
                    <div className="h-2.5 w-12 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-32 bg-slate-100 rounded-full pl-5" />
                </div>
                <div className="h-px bg-slate-100" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5287c8]" />
                    <div className="h-2.5 w-28 bg-slate-200 rounded-full" />
                    <div className="h-2.5 w-14 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-20 bg-slate-100 rounded-full pl-5" />
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Colored Cards (Navy & Medium Blue) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Navy Card */}
              <div className="bg-[#132c4e] rounded-2xl p-4 text-white flex flex-col justify-between h-24 sm:h-28 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#5287c8] shrink-0" />
                  <div className="h-2.5 w-24 bg-white/90 rounded-full" />
                </div>
                <div className="h-2 w-36 bg-[#4f80be] rounded-full" />
                <div className="h-2.5 w-14 bg-[#5287c8] rounded-full" />
              </div>

              {/* Medium Blue Card */}
              <div className="bg-[#5287c8] rounded-2xl p-4 text-white flex flex-col justify-between h-24 sm:h-28 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#a3c3e8] shrink-0" />
                  <div className="h-2.5 w-24 bg-white rounded-full" />
                </div>
                <div className="h-2 w-40 bg-white/70 rounded-full" />
                <div className="h-2.5 w-20 bg-white/80 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Auxiliary Stack: 5 White Activity Cards */}
          <div className="w-48 sm:w-56 space-y-3 hidden md:flex md:flex-col shrink-0">
            {/* Card 1: Navy Circle */}
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#132c4e] shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-20 bg-[#132c4e] rounded-full" />
                <div className="h-2 w-14 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Card 2: Medium Blue Circle */}
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#5287c8] shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-20 bg-[#5287c8] rounded-full" />
                <div className="h-2 w-12 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Card 3: Light Blue Circle */}
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#a3c3e8] shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-20 bg-[#a3c3e8] rounded-full" />
                <div className="h-2 w-16 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Card 4: Navy Circle */}
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#132c4e] shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-20 bg-[#132c4e] rounded-full" />
                <div className="h-2 w-10 bg-slate-200 rounded-full" />
              </div>
            </div>

            {/* Card 5: Medium Blue Circle */}
            <div className="bg-white rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-[#5287c8] shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-2.5 w-20 bg-[#5287c8] rounded-full" />
                <div className="h-2 w-14 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
