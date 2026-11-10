import React from 'react';
import { motion } from 'motion/react';
import { WifiOff, RefreshCw, AlertTriangle, ArrowRight, GraduationCap } from 'lucide-react';
import { GradientGreyBackground } from './GradientGreyBackground';

interface CampusSkeletonPreviewProps {
  reason?: 'offline' | 'weak' | 'loading' | 'simulated';
  onRetry?: () => void;
  onDismiss?: () => void;
  isSimulated?: boolean;
}

/**
 * CampusSkeletonPreview
 * 
 * An authentic, full-application skeleton loader for OmniCampus ERP.
 * Matches the actual dashboard layout (Navbar, Sidebar rail, Metric KPI cards,
 * schedule blocks, and directory table) with hardware-accelerated shimmer effects
 * in both light and dark modes.
 */
export const CampusSkeletonPreview: React.FC<CampusSkeletonPreviewProps> = ({
  reason = 'loading',
  onRetry,
  onDismiss,
  isSimulated = false,
}) => {
  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-slate-100 dark:bg-[#181b20] font-sans text-slate-900 dark:text-[#f8fafc] antialiased flex flex-col">
      {/* Background Gradient Shade */}
      <GradientGreyBackground />

      {/* Optional Advisory Toast for Weak/Offline Network State */}
      {(reason === 'offline' || reason === 'weak' || isSimulated) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-50 bg-white/90 dark:bg-[#222834]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#373e4b] px-4 py-2.5 shadow-sm flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              {reason === 'offline' ? (
                <WifiOff className="w-4 h-4 text-rose-500" />
              ) : reason === 'weak' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              ) : (
                <RefreshCw className="w-4 h-4 text-brand animate-spin" />
              )}
            </span>
            <div className="min-w-0">
              <span className="font-extrabold text-slate-900 dark:text-white mr-2">
                {reason === 'offline'
                  ? 'Offline Cached Preview'
                  : reason === 'weak'
                  ? 'Weak Connection Detected'
                  : 'Synchronizing University ERP Records...'}
              </span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                {reason === 'offline'
                  ? 'Displaying offline application skeleton while connection recovers.'
                  : 'Streaming real-time campus datasets and permissions.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand text-white font-bold hover:brightness-105 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#2c3342] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>Dismiss</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Top Navbar Skeleton */}
      <header className="relative z-10 h-16 border-b border-slate-200 dark:border-[#373e4b] bg-white/70 dark:bg-[#202530]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/20 dark:bg-brand/30 flex items-center justify-center animate-pulse">
            <GraduationCap className="w-5 h-5 text-brand" />
          </div>
          <div className="space-y-1.5 hidden sm:block">
            <div className="h-3.5 w-28 bg-slate-200 dark:bg-[#343b48] rounded-md animate-pulse" />
            <div className="h-2 w-20 bg-slate-100 dark:bg-[#282f3c] rounded-md animate-pulse" />
          </div>
        </div>

        {/* Search bar placeholder */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="h-9 w-full bg-slate-100 dark:bg-[#282f3c] border border-slate-200 dark:border-[#373e4b] rounded-xl flex items-center px-3 gap-2 animate-pulse">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-300 dark:bg-[#3e4858]" />
            <div className="h-2.5 w-40 bg-slate-200 dark:bg-[#343b48] rounded-md" />
          </div>
        </div>

        {/* User profile and notification pills */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-[#343b48] animate-pulse" />
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-[#343b48] animate-pulse" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-[#343b48] rounded-xl animate-pulse hidden sm:block" />
        </div>
      </header>

      {/* Main Skeleton Body (Sidebar + Canvas) */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* Left Sidebar Skeleton Rail */}
        <aside className="w-16 md:w-56 border-r border-slate-200 dark:border-[#373e4b] bg-white/50 dark:bg-[#1c212b]/60 backdrop-blur-xs p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-2 pt-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-slate-100 dark:bg-[#282f3c] flex items-center px-3 gap-3 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-4 h-4 rounded-md bg-slate-300 dark:bg-[#3e4858] shrink-0" />
                <div className="h-2.5 w-24 bg-slate-200 dark:bg-[#343b48] rounded-md hidden md:block" />
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-slate-200/60 dark:border-[#373e4b] hidden md:block">
            <div className="h-10 rounded-xl bg-slate-100 dark:bg-[#282f3c] animate-pulse" />
          </div>
        </aside>

        {/* Main Canvas Area Skeleton */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="max-w-[1440px] mx-auto space-y-6">
            {/* Top Greeting / Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-[#252b35]/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-300 dark:bg-[#3e4858] rounded-lg animate-pulse" />
                <div className="h-3 w-64 bg-slate-200 dark:bg-[#343b48] rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-[#343b48] animate-pulse" />
                <div className="h-9 w-32 rounded-xl bg-emerald-600/30 animate-pulse" />
              </div>
            </div>

            {/* 4 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 dark:bg-[#252b35]/90 rounded-2xl p-4 border border-slate-200 dark:border-[#373e4b] shadow-xs space-y-3 animate-pulse"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-200 dark:bg-[#343b48] rounded-md" />
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-[#343b48]" />
                  </div>
                  <div className="h-7 w-20 bg-slate-300 dark:bg-[#3e4858] rounded-lg" />
                  <div className="h-2 w-32 bg-slate-100 dark:bg-[#282f3c] rounded-md" />
                </div>
              ))}
            </div>

            {/* Content Split: 2 Large Analytical / Schedule Containers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 cols: Main Schedule / Directory Table Skeleton */}
              <div className="lg:col-span-2 bg-white/80 dark:bg-[#252b35]/90 rounded-2xl p-5 border border-slate-200 dark:border-[#373e4b] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#373e4b]">
                  <div className="h-4 w-36 bg-slate-300 dark:bg-[#3e4858] rounded-md animate-pulse" />
                  <div className="h-7 w-24 bg-slate-200 dark:bg-[#343b48] rounded-lg animate-pulse" />
                </div>

                {/* Table placeholder rows */}
                <div className="space-y-3 pt-1">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-[#202530] border border-slate-100 dark:border-[#2f3744] flex items-center justify-between px-4 gap-3 animate-pulse"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-[#343b48]" />
                        <div className="space-y-1">
                          <div className="h-2.5 w-28 bg-slate-300 dark:bg-[#3e4858] rounded-md" />
                          <div className="h-2 w-20 bg-slate-200 dark:bg-[#343b48] rounded-md" />
                        </div>
                      </div>
                      <div className="h-2.5 w-20 bg-slate-200 dark:bg-[#343b48] rounded-md hidden sm:block" />
                      <div className="h-5 w-16 bg-slate-200 dark:bg-[#343b48] rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 1 col: Quick Access & Side Blocks */}
              <div className="bg-white/80 dark:bg-[#252b35]/90 rounded-2xl p-5 border border-slate-200 dark:border-[#373e4b] shadow-xs space-y-4">
                <div className="h-4 w-32 bg-slate-300 dark:bg-[#3e4858] rounded-md animate-pulse" />
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-18 rounded-xl bg-slate-50 dark:bg-[#202530] border border-slate-100 dark:border-[#2f3744] p-3 flex flex-col justify-between animate-pulse"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#343b48]" />
                      <div className="h-2 w-14 bg-slate-300 dark:bg-[#3e4858] rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
