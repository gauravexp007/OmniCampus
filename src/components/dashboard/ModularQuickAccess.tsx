import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarCheck2,
  FileSpreadsheet,
  CalendarDays,
  BookOpen,
  Award,
  GraduationCap,
  DollarSign,
  Library,
  Building2,
  HardDrive,
  ArrowRight,
  Compass,
  TrendingUp,
  Square,
  RectangleHorizontal,
  CircleDot,
  Sliders,
  RotateCcw,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Check,
  ChevronRight,
  ArrowUpDown,
  MoreVertical,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { ERPModuleId } from '../../types';
import { cn } from '../../lib/utils';
import { AnimatedSegmentedToggle } from '../ui/AnimatedSegmentedToggle';
import {
  useDashboardLayout,
  QuickAccessTileFormat,
  LayoutPresetId,
  QuickAccessModuleId,
} from '../../context/DashboardLayoutContext';

interface ModularQuickAccessProps {
  onNavigate: (module: ERPModuleId) => void;
  compactMode?: boolean;
}

type TabFilter = 'all' | 'academics';

interface QuickActionTileMeta {
  id: QuickAccessModuleId;
  title: string;
  subtitle: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  glowColor: string;
  hoverBorder: string;
  hoverShadow: string;
  badgeBg: string;
  badgeText: string;
  isAcademicCore: boolean;
}

export const ModularQuickAccess: React.FC<ModularQuickAccessProps> = ({
  onNavigate,
  compactMode = false,
}) => {
  const {
    students,
    courses,
    attendanceRecords,
    timetableSlots,
    exams,
    results,
    transactions,
    role,
  } = useERP();

  const {
    isEditMode,
    toggleEditMode,
    tileConfigs,
    orderedTileIds,
    setTileFormat,
    toggleTileVisibility,
    moveTile,
    reorderTiles,
    applyPreset,
    resetLayout,
    bigSquaresCount,
    smallBarsCount,
    smallCirclesCount,
    placement,
  } = useDashboardLayout();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;

    const updatePosition = () => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 12;
      const desiredWidth = Math.min(300, viewportWidth - margin * 2);

      let left = rect.right - desiredWidth;
      if (left < margin) {
        left = margin;
      }
      if (left + desiredWidth > viewportWidth - margin) {
        left = Math.max(margin, viewportWidth - margin - desiredWidth);
      }

      let top = rect.bottom + 8;
      let maxHeight = viewportHeight - top - margin;
      if (maxHeight < 220 && rect.top > 220) {
        maxHeight = Math.min(450, rect.top - margin - 8);
        top = Math.max(margin, rect.top - maxHeight - 8);
      } else {
        maxHeight = Math.min(480, maxHeight);
      }

      setDropdownPosition({
        top,
        left,
        width: desiredWidth,
        maxHeight,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Section ordering: can move Squares and Bars up and down
  const [sectionOrder, setSectionOrder] = useState<('squares' | 'circles' | 'bars')[]>([
    'squares',
    'circles',
    'bars',
  ]);

  // Real-time live context values
  const avgAttendance =
    attendanceRecords.length > 0
      ? Math.round(
          attendanceRecords.reduce(
            (sum, a) => sum + (a.presentStudents / (a.totalStudents || 1)) * 100,
            0
          ) / attendanceRecords.length
        )
      : null;

  const totalFeeRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const tileMetadata: Record<QuickAccessModuleId, QuickActionTileMeta> = {
    attendance: {
      id: 'attendance',
      title: 'Attendance',
      subtitle: role === 'Student' ? 'My Lecture Logs' : 'Take Attendance',
      metric: avgAttendance !== null ? `${avgAttendance}%` : `${attendanceRecords.length} Logs`,
      icon: CalendarCheck2,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80',
      glowColor: 'from-indigo-500/25',
      hoverBorder: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(99,102,241,0.22)]',
      badgeBg: 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-200/90 dark:border-indigo-800/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      isAcademicCore: true,
    },
    exams: {
      id: 'exams',
      title: 'Examination',
      subtitle: role === 'Student' ? 'Hall Tickets' : 'Schedule & Venues',
      metric: `${exams.length} Exams`,
      icon: FileSpreadsheet,
      iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80',
      glowColor: 'from-amber-500/25',
      hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.22)]',
      badgeBg: 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-200/90 dark:border-amber-800/60',
      badgeText: 'text-amber-800 dark:text-amber-300',
      isAcademicCore: true,
    },
    timetable: {
      id: 'timetable',
      title: 'Timetable',
      subtitle: 'Weekly Periods',
      metric: `${timetableSlots.length} Slots`,
      icon: CalendarDays,
      iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/80',
      glowColor: 'from-sky-500/25',
      hoverBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(14,165,233,0.22)]',
      badgeBg: 'bg-sky-50/90 dark:bg-sky-950/60 border-sky-200/90 dark:border-sky-800/60',
      badgeText: 'text-sky-800 dark:text-sky-300',
      isAcademicCore: true,
    },
    academics: {
      id: 'academics',
      title: 'Assignments',
      subtitle: 'Courses & Syllabus',
      metric: `${courses.length} Courses`,
      icon: BookOpen,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80',
      glowColor: 'from-emerald-500/25',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.22)]',
      badgeBg: 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200/90 dark:border-emerald-800/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      isAcademicCore: true,
    },
    results: {
      id: 'results',
      title: 'Results',
      subtitle: 'SGPA & CGPA Chart',
      metric: results.length > 0 && results[0].cgpa ? `${results[0].cgpa} CGPA` : `${results.length} Marks`,
      icon: Award,
      iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/80',
      glowColor: 'from-purple-500/25',
      hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(168,85,247,0.22)]',
      badgeBg: 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-200/90 dark:border-purple-800/60',
      badgeText: 'text-purple-700 dark:text-purple-300',
      isAcademicCore: true,
    },
    performance: {
      id: 'performance',
      title: 'Performance',
      subtitle: role === 'Student' ? 'My Analytics Dossier' : 'Student Reports & Cohort',
      metric: 'Analytics & KPIs',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80',
      glowColor: 'from-emerald-500/25',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.22)]',
      badgeBg: 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200/90 dark:border-emerald-800/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      isAcademicCore: true,
    },
    students: {
      id: 'students',
      title: 'Students',
      subtitle: 'Roster & CGPA',
      metric: `${students.length} Scholars`,
      icon: GraduationCap,
      iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80',
      glowColor: 'from-rose-500/25',
      hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(244,63,94,0.22)]',
      badgeBg: 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200/90 dark:border-rose-800/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
      isAcademicCore: false,
    },
    finance: {
      id: 'finance',
      title: 'Finance',
      subtitle: 'Fees & Invoices',
      metric: `$${(totalFeeRevenue / 1000).toFixed(0)}k`,
      icon: DollarSign,
      iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/80',
      glowColor: 'from-teal-500/25',
      hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(20,184,166,0.22)]',
      badgeBg: 'bg-teal-50/90 dark:bg-teal-950/60 border-teal-200/90 dark:border-teal-800/60',
      badgeText: 'text-teal-800 dark:text-teal-300',
      isAcademicCore: false,
    },
    library: {
      id: 'library',
      title: 'Library',
      subtitle: 'Books & Catalog',
      metric: 'Catalog',
      icon: Library,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200/80 dark:border-cyan-800/80',
      glowColor: 'from-cyan-500/25',
      hoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(6,182,212,0.22)]',
      badgeBg: 'bg-cyan-50/90 dark:bg-cyan-950/60 border-cyan-200/90 dark:border-cyan-800/60',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      isAcademicCore: false,
    },
    hostel: {
      id: 'hostel',
      title: 'Hostel',
      subtitle: 'Rooms & Wings',
      metric: 'Housing',
      icon: Building2,
      iconBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/80 dark:border-orange-800/80',
      glowColor: 'from-orange-500/25',
      hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(249,115,22,0.22)]',
      badgeBg: 'bg-orange-50/90 dark:bg-orange-950/60 border-orange-200/90 dark:border-orange-800/60',
      badgeText: 'text-orange-800 dark:text-orange-300',
      isAcademicCore: false,
    },
    userfiles: {
      id: 'userfiles',
      title: 'Storage',
      subtitle: 'Vault & Docs',
      metric: 'Cloud Files',
      icon: HardDrive,
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
      glowColor: 'from-slate-600/20',
      hoverBorder: 'hover:border-slate-500 dark:hover:border-slate-400',
      hoverShadow: 'hover:shadow-[0_12px_28px_-6px_rgba(71,85,105,0.22)]',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      badgeText: 'text-slate-800 dark:text-slate-200',
      isAcademicCore: false,
    },
  };

  // Filter based on academics vs all
  const filteredIds = orderedTileIds.filter((id) => {
    const meta = tileMetadata[id];
    if (!meta) return false;
    const config = tileConfigs[id];
    if (!config) return false;
    if (!isEditMode && !config.visible) return false;
    if (activeTab === 'academics') return meta.isAcademicCore;
    return true;
  });

  // Separate tiles by format for distinct visual clustering
  const bigSquareTiles = filteredIds.filter((id) => tileConfigs[id]?.format === 'square');
  const smallBarTiles = filteredIds.filter((id) => tileConfigs[id]?.format === 'bar');
  const smallCircleTiles = filteredIds.filter((id) => tileConfigs[id]?.format === 'circle');

  // Move section up/down inside Quick Access
  const moveSection = (sec: 'squares' | 'circles' | 'bars', direction: 'up' | 'down') => {
    const idx = sectionOrder.indexOf(sec);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const [removed] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, removed);
    setSectionOrder(newOrder);
  };

  // Helper to convert top tiles to circles so user can test hover morphing
  const makeSomeCirclesForTesting = () => {
    const toChange = filteredIds.slice(0, 4);
    toChange.forEach((id) => setTileFormat(id, 'circle'));
  };

  const makeAllSquares = () => {
    filteredIds.forEach((id) => setTileFormat(id, 'square'));
  };

  const makeAllBars = () => {
    filteredIds.forEach((id) => setTileFormat(id, 'bar'));
  };

  return (
    <div
      id="modular-quick-access-container"
      className={cn(
        'relative bg-white dark:bg-[#435055] rounded-3xl border border-slate-200/80 dark:border-[#55666d] p-4 sm:p-5 shadow-xs transition-all duration-300 space-y-3.5 overflow-visible',
        isMenuOpen ? 'z-40' : 'z-10',
        isEditMode && 'ring-2 ring-brand/50 shadow-md border-brand/50'
      )}
    >
      {/* Header Bar with Dedicated "Customize" Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shadow-2xs font-black">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Quick Access
              </h3>
              {/* Badge with clean theme-aware styling */}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#354146] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#55666d] shadow-2xs">
                {bigSquaresCount} Squares &bull; {smallBarsCount} Bars
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Dedicated Customize Button */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Tab Filter: All Modules vs Academics Only */}
          <AnimatedSegmentedToggle
            value={activeTab}
            onChange={(val) => setActiveTab(val as TabFilter)}
            layoutId="quick-access-tab-pill-v2"
            size="sm"
            options={[
              { value: 'all', label: 'All Modules' },
              { value: 'academics', label: 'Academics Only' },
            ]}
          />

          {/* If edit mode active, show a clean Done button */}
          {isEditMode && (
            <button
              type="button"
              id="quick-access-done-btn"
              onClick={toggleEditMode}
              className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black flex items-center gap-1.5 shadow-sm ring-2 ring-brand/30 cursor-pointer transition-all"
              title="Finish Quick Access customization"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Done</span>
            </button>
          )}

          {/* 3 VERTICAL DOTS AT RIGHT CORNER FOR ALL CUSTOMIZATION */}
          <div className="relative shrink-0 z-30" ref={menuRef}>
            <button
              type="button"
              id="quick-access-3dot-btn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={cn(
                'p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-xs',
                isMenuOpen
                  ? 'bg-slate-900 text-white dark:bg-brand border-transparent ring-2 ring-slate-900/20 dark:ring-brand/40'
                  : 'bg-white dark:bg-[#354146] hover:bg-slate-100 dark:hover:bg-[#435055] text-slate-800 dark:text-white border-slate-300 dark:border-[#55666d]'
              )}
              title="Quick Access Customization Menu"
              aria-label="Quick Access Customization Menu"
            >
              <MoreVertical className="w-4 h-4 text-slate-800 dark:text-white stroke-[2.5]" />
            </button>

            {/* Dropdown Menu for Customization - FIXED at TOP LAYER clamped inside viewport */}
            <AnimatePresence>
              {isMenuOpen && dropdownPosition && (
                <motion.div
                  ref={dropdownMenuRef}
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'fixed',
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    maxHeight: dropdownPosition.maxHeight,
                  }}
                  className="bg-white dark:bg-[#252b35] rounded-2xl shadow-2xl border-2 border-slate-300 dark:border-[#55666d] p-2.5 z-[9999] text-slate-900 dark:text-white backdrop-blur-xl ring-2 ring-black/15 overflow-y-auto"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#435055] flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#252b35]/95 backdrop-blur-sm -mt-1 pt-1 z-10">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Quick Access Customizer</span>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                      title="Close menu"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="py-2 space-y-1.5">
                    {/* PRIMARY CUSTOMIZE TILES BUTTON (Clean, without extra descriptions) */}
                    <button
                      type="button"
                      id="menu-toggle-quick-access-edit"
                      onClick={() => {
                        setIsMenuOpen(false);
                        toggleEditMode();
                      }}
                      className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white transition-all cursor-pointer shadow-md group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                          <Sliders className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-bold text-white">
                          {isEditMode ? 'Exit Customization' : 'Customize Tiles'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-white/20 px-1.5 py-0.5 rounded font-black">
                        {isEditMode ? 'Done' : 'Customize'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        applyPreset('all-squares');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#435055] transition-colors cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">All Large Squares</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        applyPreset('all-bars');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#435055] transition-colors cursor-pointer"
                    >
                      <RectangleHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">All Wide Bars</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        applyPreset('compact-circles');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#435055] transition-colors cursor-pointer"
                    >
                      <CircleDot className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Compact Circles</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        resetLayout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#435055] transition-colors cursor-pointer border-t border-slate-100 dark:border-[#435055] pt-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Reset Shortcuts Layout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Edit Mode Customization Control Center */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 bg-slate-100 dark:bg-[#1a202c] border-2 border-slate-300 dark:border-slate-700 rounded-2xl space-y-2.5 text-slate-900 dark:text-white text-xs shadow-sm overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  Quick Access Customizer
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => applyPreset('default-hybrid')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold text-[11px] border border-slate-300 dark:border-slate-600 shadow-2xs cursor-pointer transition-colors"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                >
                  Save & Exit
                </button>
              </div>
            </div>

            {/* Quick Shape & Move Controls (All custom up/down buttons are white in dark theme) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-2 flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-700 dark:text-slate-200">Section Flow:</span>
                <button
                  type="button"
                  onClick={() => moveSection('squares', 'up')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Move Squares Section Earlier"
                >
                  <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span className="text-slate-900 dark:text-white">Squares Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => moveSection('bars', 'up')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Move Bars Section Earlier"
                >
                  <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span className="text-slate-900 dark:text-white">Bars Up</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-700 dark:text-slate-200">Shapes:</span>
                <button
                  type="button"
                  onClick={makeSomeCirclesForTesting}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <CircleDot className="w-3.5 h-3.5 text-brand" />
                  <span className="text-slate-900 dark:text-white">Circles</span>
                </button>
                <button
                  type="button"
                  onClick={makeAllSquares}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Square className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span className="text-slate-900 dark:text-white">All Squares</span>
                </button>
                <button
                  type="button"
                  onClick={makeAllBars}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-50 dark:hover:bg-[#323d49] text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <RectangleHorizontal className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span className="text-slate-900 dark:text-white">All Bars</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          DYNAMIC TILES CONTAINER:
          Supports Big Squares, Small Rectangle Bars, and Circles (Hover to Morph)!
          Sections reorder dynamically based on sectionOrder
          ==================================================================== */}
      <div className="space-y-3.5 relative z-10">
        {sectionOrder.map((sectionKey) => {
          if (sectionKey === 'squares' && bigSquareTiles.length > 0) {
            return (
              <div key="squares-section" className="space-y-1.5">
                {isEditMode && (
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-200 px-1">
                    <span className="uppercase tracking-wider">Square Cards ({bigSquareTiles.length})</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection('squares', 'up')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Up"
                      >
                        <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection('squares', 'down')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Down"
                      >
                        <MoveDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {bigSquareTiles.map((id) => renderTile(id, 'square'))}
                </div>
              </div>
            );
          }

          if (sectionKey === 'circles' && smallCircleTiles.length > 0) {
            return (
              <div key="circles-section" className="space-y-1.5">
                {isEditMode && (
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-200 px-1">
                    <span className="uppercase tracking-wider">
                      Circles ({smallCircleTiles.length})
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection('circles', 'up')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Up"
                      >
                        <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection('circles', 'down')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Down"
                      >
                        <MoveDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "flex items-center flex-wrap p-3.5 bg-slate-100 dark:bg-[#354146] rounded-2xl border border-slate-200/90 dark:border-[#55666d] transition-all",
                  isEditMode ? "gap-x-8 gap-y-7 pt-7 pb-3" : "gap-3.5"
                )}>
                  {smallCircleTiles.map((id) => renderTile(id, 'circle'))}
                </div>
              </div>
            );
          }

          if (sectionKey === 'bars' && smallBarTiles.length > 0) {
            return (
              <div key="bars-section" className="space-y-1.5">
                {isEditMode && (
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-200 px-1">
                    <span className="uppercase tracking-wider">Rectangle Bars ({smallBarTiles.length})</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSection('bars', 'up')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Up"
                      >
                        <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection('bars', 'down')}
                        className="p-1.5 rounded-lg bg-white dark:bg-[#1a202c] text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#252c38] cursor-pointer shadow-2xs transition-colors flex items-center justify-center"
                        title="Move Section Down"
                      >
                        <MoveDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {smallBarTiles.map((id) => renderTile(id, 'bar'))}
                </div>
              </div>
            );
          }

          return null;
        })}

        {filteredIds.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs font-bold">
            No visible quick access tiles.
          </div>
        )}
      </div>
    </div>
  );

  // Helper renderer for each format
  function renderTile(id: QuickAccessModuleId, format: QuickAccessTileFormat) {
    const meta = tileMetadata[id];
    if (!meta) return null;
    const config = tileConfigs[id];
    const Icon = meta.icon;

    // Full in-card format controls for Square cards (Clean white-in-dark theme, high contrast)
    const renderSquareEditToolbar = () => {
      if (!isEditMode) return null;
      return (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-30 flex items-center gap-1 bg-white/95 dark:bg-[#1a202c]/95 backdrop-blur-md p-1 rounded-xl border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white"
        >
          {/* Move Up */}
          <button
            type="button"
            title="Move Earlier"
            onClick={() => moveTile(id, 'up')}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <MoveUp className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
          </button>
          {/* Move Down */}
          <button
            type="button"
            title="Move Later"
            onClick={() => moveTile(id, 'down')}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <MoveDown className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
          </button>
          {/* Format: Circle */}
          <button
            type="button"
            title="Make Circle"
            onClick={() => setTileFormat(id, 'circle')}
            className={cn(
              'p-1 rounded-lg transition-colors font-bold cursor-pointer border border-slate-200 dark:border-slate-600',
              config?.format === 'circle'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white'
            )}
          >
            <CircleDot className="w-3.5 h-3.5" />
          </button>
          {/* Format: Square */}
          <button
            type="button"
            title="Make Square"
            onClick={() => setTileFormat(id, 'square')}
            className={cn(
              'p-1 rounded-lg transition-colors font-bold cursor-pointer border border-slate-200 dark:border-slate-600',
              config?.format === 'square'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white'
            )}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          {/* Format: Bar */}
          <button
            type="button"
            title="Make Rectangle Bar"
            onClick={() => setTileFormat(id, 'bar')}
            className={cn(
              'p-1 rounded-lg transition-colors font-bold cursor-pointer border border-slate-200 dark:border-slate-600',
              config?.format === 'bar'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white'
            )}
          >
            <RectangleHorizontal className="w-3.5 h-3.5" />
          </button>
          {/* Visibility */}
          <button
            type="button"
            title={config?.visible ? 'Hide Tile' : 'Show Tile'}
            onClick={() => toggleTileVisibility(id)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
          >
            {config?.visible ? (
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </button>
        </div>
      );
    };

    // Compact centered toolbar dedicated to Circles - NEVER overlaps neighboring circles!
    const renderCircleEditToolbar = () => {
      if (!isEditMode) return null;
      return (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white dark:bg-[#1a202c] p-0.5 rounded-lg border border-slate-300 dark:border-slate-600 shadow-md text-slate-900 dark:text-white whitespace-nowrap"
        >
          <button
            type="button"
            title="Move Earlier"
            onClick={() => moveTile(id, 'up')}
            className="p-1 rounded bg-slate-100 dark:bg-[#252c38] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#323d49] border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center"
          >
            <MoveUp className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title="Move Later"
            onClick={() => moveTile(id, 'down')}
            className="p-1 rounded bg-slate-100 dark:bg-[#252c38] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#323d49] border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center"
          >
            <MoveDown className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title="Convert to Square Card"
            onClick={() => setTileFormat(id, 'square')}
            className="p-1 rounded bg-slate-100 dark:bg-[#252c38] text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-[#323d49] border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center"
          >
            <Square className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
        </div>
      );
    };

    // Toolbar for Bar format - cleanly integrated into the flex row
    const renderBarEditToolbar = () => {
      if (!isEditMode) return null;
      return (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 bg-slate-100/90 dark:bg-[#1a202c]/90 backdrop-blur-md p-1 rounded-xl border border-slate-300 dark:border-slate-600 shadow-xs text-slate-900 dark:text-white shrink-0 ml-auto"
        >
          <button
            type="button"
            title="Move Earlier"
            onClick={() => moveTile(id, 'up')}
            className="p-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <MoveUp className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title="Move Later"
            onClick={() => moveTile(id, 'down')}
            className="p-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <MoveDown className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title="Make Circle"
            onClick={() => setTileFormat(id, 'circle')}
            className="p-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <CircleDot className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title="Make Square"
            onClick={() => setTileFormat(id, 'square')}
            className="p-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 transition-all cursor-pointer"
          >
            <Square className="w-3 h-3 text-slate-900 dark:text-white" />
          </button>
          <button
            type="button"
            title={config?.visible ? 'Hide Tile' : 'Show Tile'}
            onClick={() => toggleTileVisibility(id)}
            className="p-1 rounded-lg bg-white dark:bg-[#252c38] hover:bg-slate-200 dark:hover:bg-[#323d49] border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
          >
            {config?.visible ? (
              <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <EyeOff className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            )}
          </button>
        </div>
      );
    };

    // 1. BIG SQUARE FORMAT
    if (format === 'square') {
      return (
        <motion.div
          key={id}
          layout
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isEditMode) onNavigate(id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (!isEditMode) {
                e.preventDefault();
                onNavigate(id);
              }
            }
          }}
          className={cn(
            'group relative overflow-hidden p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-[#55666d] bg-white dark:bg-[#354146]',
            'transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 select-none',
            'flex flex-col items-center justify-center text-center gap-2 shadow-2xs min-h-[135px] sm:min-h-[150px] w-full',
            meta.hoverBorder,
            meta.hoverShadow
          )}
        >
          {/* Edit Toolbar when Edit Mode is active */}
          {renderSquareEditToolbar()}

          {/* Radial Corner Glow */}
          <div
            className={cn(
              'absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br to-transparent blur-xl pointer-events-none',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
              meta.glowColor
            )}
          />

          {/* Large Centered Logo/Icon */}
          <div
            className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 shadow-xs mx-auto',
              'transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-md',
              isEditMode
                ? 'rounded-2xl ring-2 ring-brand/40'
                : 'rounded-2xl',
              meta.iconBg
            )}
          >
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
          </div>

          {/* Tile Name Only */}
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-200 text-center max-w-full px-1 mt-1 leading-snug break-words">
            {meta.title}
          </span>
        </motion.div>
      );
    }

    // 2. SMALL RECTANGLE BAR FORMAT
    if (format === 'bar') {
      return (
        <motion.div
          key={id}
          layout
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!isEditMode) onNavigate(id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (!isEditMode) {
                e.preventDefault();
                onNavigate(id);
              }
            }
          }}
          className={cn(
            'group relative overflow-hidden text-left px-3.5 py-3 rounded-2xl cursor-pointer neumorph-bar select-none',
            'flex items-center justify-between gap-3 transition-all duration-200 bg-white dark:bg-[#354146] border border-slate-200/90 dark:border-[#55666d]'
          )}
        >
          {/* Left: Prominent Icon & Tile Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'w-9 h-9 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all duration-300',
                isEditMode
                  ? 'rounded-xl ring-2 ring-brand/30'
                  : 'rounded-xl',
                meta.iconBg
              )}
            >
              <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors duration-150 truncate">
              {meta.title}
            </span>
          </div>

          {/* Right side: Either edit toolbar or Chevron */}
          {isEditMode ? (
            renderBarEditToolbar()
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
          )}
        </motion.div>
      );
    }

    // 3. SMALL CIRCLE FORMAT - With non-overlapping compact centered controls & dark-mode white buttons
    if (format === 'circle') {
      return (
        <motion.div
          key={id}
          layout
          className={cn(
            "relative inline-flex flex-col items-center group select-none transition-all",
            isEditMode ? "min-w-[76px] cursor-default" : "cursor-pointer"
          )}
          onClick={() => {
            if (!isEditMode) onNavigate(id);
          }}
        >
          {/* Dedicated Non-Overlapping Compact Pill Controls above circle */}
          {renderCircleEditToolbar()}

          {/* Outer Circle Button */}
          <button
            type="button"
            onClick={() => {
              if (isEditMode) {
                setTileFormat(id, 'square');
              } else {
                onNavigate(id);
              }
            }}
            className={cn(
              'w-14 h-14 flex items-center justify-center shrink-0 relative transition-all duration-300 ease-out cursor-pointer',
              isEditMode
                ? 'rounded-full group-hover:rounded-2xl hover:scale-105 shadow-md ring-2 ring-brand/40 bg-white dark:bg-[#252c38] text-slate-900 dark:text-white'
                : 'rounded-full neumorph-circle'
            )}
            title={
              isEditMode
                ? 'Click to convert into Square Card'
                : `${meta.title} - ${meta.metric}`
            }
          >
            {/* Inner Icon */}
            <div
              className={cn(
                'w-9 h-9 flex items-center justify-center shrink-0 transition-all duration-300 ease-out',
                isEditMode
                  ? 'rounded-full group-hover:rounded-xl'
                  : 'rounded-full',
                meta.iconBg
              )}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {!isEditMode && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-brand text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#435055]">
                &bull;
              </span>
            )}
          </button>

          {/* Title label */}
          <span className="text-[11px] font-extrabold text-slate-900 dark:text-white mt-1.5 text-center truncate max-w-[76px]">
            {meta.title}
          </span>
        </motion.div>
      );
    }

    return null;
  }
};
