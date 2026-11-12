import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Users,
  DollarSign,
  CalendarCheck2,
  Award,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  HelpCircle,
  HardDrive,
  Sliders,
  Settings,
  RotateCcw,
  Sparkles,
  ChevronRight,
  GripVertical,
  X,
  ArrowUpDown,
  ArrowLeftRight,
  Check,
  MoreVertical,
  LayoutGrid,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ERPModuleId } from '../../types';
import { ModularQuickAccess } from './ModularQuickAccess';
import { DashboardAnalyticsSection } from './DashboardAnalyticsSection';
import { AnimatedCounter } from '../common/DribbbleAnimations';
import {
  useDashboardLayout,
  DashboardPresetId,
} from '../../context/DashboardLayoutContext';
import { cn } from '../../lib/utils';
import {
  PASTEL_PALETTES,
  parseSingleTimeString,
  parseTimeToMinutes,
  formatMinutesToTime,
} from '../timetable/TimetableTypes';

interface OverviewDashboardProps {
  onNavigate: (module: ERPModuleId) => void;
  onOpenAiCopilot: () => void;
}

interface PrimaryStatBlock {
  id: string;
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  onClick: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNavigate,
  onOpenAiCopilot,
}) => {
  const {
    students,
    faculty,
    courses,
    attendanceRecords,
    timetableSlots,
    exams,
    results,
    transactions,
    admissions,
    role,
    currentUser,
  } = useERP();

  const {
    isEditMode,
    toggleEditMode,
    resetDashboardBlocks,
    applyDashboardPreset,
    applyPreset,
  } = useDashboardLayout();

  const totalFeeRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  // Student-specific metrics
  const studentResult = results[0];
  const avgAttendance =
    attendanceRecords.length > 0
      ? Math.round(
          attendanceRecords.reduce(
            (sum, a) => sum + (a.presentStudents / (a.totalStudents || 1)) * 100,
            0
          ) / attendanceRecords.length
        )
      : 92;

  // Compute the First Four Blocks (Two Up, Two Down) for each role
  const rawStatBlocks: PrimaryStatBlock[] = React.useMemo(() => {
    if (role === 'Student') {
      return [
        {
          id: 'courses',
          title: 'Registered Courses',
          value: courses.length || 6,
          tag: 'Enrolled Subjects',
          icon: BookOpen,
          iconColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-500/20',
          onClick: () => onNavigate('academics'),
        },
        {
          id: 'attendance',
          title: 'Overall Attendance',
          value: avgAttendance,
          suffix: '%',
          tag: `${attendanceRecords.length} Lectures Logged`,
          icon: CalendarCheck2,
          iconColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-500/20',
          onClick: () => onNavigate('attendance'),
        },
        {
          id: 'timetable',
          title: 'Weekly Classes',
          value: timetableSlots.length || 18,
          tag: 'Scheduled Periods',
          icon: CalendarDays,
          iconColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-500/20',
          onClick: () => onNavigate('timetable'),
        },
        {
          id: 'results',
          title: 'Cumulative GPA',
          value: studentResult ? Number(studentResult.cgpa) : 3.84,
          decimals: 2,
          tag: `${results.length} Semesters Evaluated`,
          icon: Award,
          iconColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-500/20',
          onClick: () => onNavigate('results'),
        },
      ];
    }

    if (role === 'Faculty') {
      return [
        {
          id: 'assigned_courses',
          title: 'Assigned Courses',
          value: courses.length || 4,
          tag: 'Curriculum Syllabi',
          icon: BookOpen,
          iconColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-500/20',
          onClick: () => onNavigate('academics'),
        },
        {
          id: 'attendance_registers',
          title: 'Attendance Registers',
          value: attendanceRecords.length || 24,
          tag: 'Lectures Verified',
          icon: CalendarCheck2,
          iconColor: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-500/20',
          onClick: () => onNavigate('attendance'),
        },
        {
          id: 'teaching_periods',
          title: 'Teaching Periods',
          value: timetableSlots.length || 14,
          tag: 'Weekly Sessions',
          icon: CalendarDays,
          iconColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-500/20',
          onClick: () => onNavigate('timetable'),
        },
        {
          id: 'grade_evaluations',
          title: 'Grade Evaluations',
          value: results.length || 38,
          tag: 'Submitted Gradebooks',
          icon: Award,
          iconColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-500/20',
          onClick: () => onNavigate('results'),
        },
      ];
    }

    // Admin Role
    return [
      {
        id: 'total_students',
        title: 'Total Students',
        value: students.length || 1248,
        tag: 'Active Scholars',
        icon: GraduationCap,
        iconColor: 'bg-rose-500/10 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-500/20',
        onClick: () => onNavigate('students'),
      },
      {
        id: 'faculty_directory',
        title: 'Faculty Directory',
        value: faculty.length || 86,
        tag: 'Academic Staff',
        icon: Users,
        iconColor: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-500/20',
        onClick: () => onNavigate('faculty'),
      },
      {
        id: 'admissions_intake',
        title: 'Admissions Intake',
        value: admissions.length || 342,
        tag: 'Intake Applications',
        icon: Users,
        iconColor: 'bg-amber-500/10 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-500/20',
        onClick: () => onNavigate('admissions'),
      },
      {
        id: 'tuition_revenue',
        title: 'Tuition Revenue',
        value: totalFeeRevenue || 284500,
        prefix: '$',
        tag: 'Verified Ledger',
        icon: DollarSign,
        iconColor: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-500/20',
        onClick: () => onNavigate('finance'),
      },
    ];
  }, [role, courses, avgAttendance, attendanceRecords, timetableSlots, studentResult, results, students, faculty, admissions, totalFeeRevenue, onNavigate]);

  // Hold & Drag Layout Customization State for the 4 Blocks
  const storageKey = `omnicampus_statblock_order_${role}`;
  const [blockOrder, setBlockOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) return parsed;
      }
    } catch {}
    return rawStatBlocks.map((b) => b.id);
  });

  useEffect(() => {
    // Sync order if default IDs changed for current role
    const currentIds = rawStatBlocks.map((b) => b.id);
    setBlockOrder((prev) => {
      const isIdentical =
        prev.length === currentIds.length &&
        prev.every((id, idx) => id === currentIds[idx]);
      if (isIdentical) return prev;
      const filtered = prev.filter((id) => currentIds.includes(id));
      const missing = currentIds.filter((id) => !filtered.includes(id));
      const next = [...filtered, ...missing];
      return next.length === 4 ? next : currentIds;
    });
  }, [role]);

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isCustomizationMenuOpen, setIsCustomizationMenuOpen] = useState(false);
  const customizationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        customizationMenuRef.current &&
        !customizationMenuRef.current.contains(e.target as Node)
      ) {
        setIsCustomizationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Graphs section customization (Order & Layout)
  const [graphOrder, setGraphOrder] = useState<'attendance-first' | 'marks-first'>(() => {
    try {
      return (localStorage.getItem('omnicampus_graphs_order') as any) || 'attendance-first';
    } catch {
      return 'attendance-first';
    }
  });

  const [graphLayout, setGraphLayout] = useState<'grid' | 'stacked'>(() => {
    try {
      return (localStorage.getItem('omnicampus_graphs_layout') as any) || 'grid';
    } catch {
      return 'grid';
    }
  });

  const handleGraphOrderChange = (order: 'attendance-first' | 'marks-first') => {
    setGraphOrder(order);
    try {
      localStorage.setItem('omnicampus_graphs_order', order);
    } catch {}
  };

  const handleGraphLayoutChange = (layout: 'grid' | 'stacked') => {
    setGraphLayout(layout);
    try {
      localStorage.setItem('omnicampus_graphs_layout', layout);
    } catch {}
  };

  // Handle reorder on drag drop
  const handleDrop = (sourceId: string, targetId: string) => {
    if (!sourceId || !targetId || sourceId === targetId) return;
    setBlockOrder((prev) => {
      const next = [...prev];
      const sourceIdx = next.indexOf(sourceId);
      const targetIdx = next.indexOf(targetId);
      if (sourceIdx !== -1 && targetIdx !== -1) {
        const [moved] = next.splice(sourceIdx, 1);
        next.splice(targetIdx, 0, moved);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // 1-Click Layout Swaps
  const swapTopBottom = () => {
    setBlockOrder((prev) => {
      if (prev.length < 4) return prev;
      // swap [0, 1, 2, 3] -> [2, 3, 0, 1]
      const next = [prev[2], prev[3], prev[0], prev[1]];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const swapLeftRight = () => {
    setBlockOrder((prev) => {
      if (prev.length < 4) return prev;
      // swap [0, 1, 2, 3] -> [1, 0, 3, 2]
      const next = [prev[1], prev[0], prev[3], prev[2]];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const resetBlockOrder = () => {
    const defaultIds = rawStatBlocks.map((b) => b.id);
    setBlockOrder(defaultIds);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  };

  // Ordered list of stat blocks based on user customization
  const orderedStatBlocks = React.useMemo(() => {
    const map = new Map(rawStatBlocks.map((b) => [b.id, b]));
    const result: PrimaryStatBlock[] = [];
    blockOrder.forEach((id) => {
      const block = map.get(id);
      if (block) result.push(block);
    });
    // Add any missing blocks
    rawStatBlocks.forEach((b) => {
      if (!result.includes(b)) result.push(b);
    });
    return result.slice(0, 4);
  }, [blockOrder, rawStatBlocks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =====================================================================
          CLEAN EXECUTIVE HEADER (Reduced text, clean badges & controls)
          ===================================================================== */}
      <div
        className={cn(
          'relative bg-white dark:bg-[#435055] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-[#55666d] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-visible transition-all',
          isCustomizationMenuOpen ? 'z-50' : 'z-20'
        )}
      >
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#a3f7bf]">
            Academic Year 2026–2027 &bull; Semester Term 8
          </p>
        </div>

        {/* Action Controls - Customization inside 3 vertical dots at right corner */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap relative z-20">
          <button
            onClick={() => onNavigate('userfiles')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#354146] hover:bg-slate-200 dark:hover:bg-[#4e5c61] text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-[#55666d]"
            title="Institutional Document Vault"
          >
            <HardDrive className="w-3.5 h-3.5 text-slate-600 dark:text-[#a3f7bf]" />
            <span>Vault</span>
          </button>

          <button
            onClick={onOpenAiCopilot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#354146] hover:bg-slate-200 dark:hover:bg-[#4e5c61] text-slate-800 dark:text-white text-xs font-bold transition-all border border-slate-200 dark:border-[#55666d] cursor-pointer"
            title="Campus Operations & Help Desk"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-[#a3f7bf]" />
            <span>Campus Desk</span>
          </button>

          {/* 3 VERTICAL DOTS AT RIGHT CORNER FOR ALL CUSTOMIZATION */}
          <div className="relative shrink-0 z-30" ref={customizationMenuRef}>
            <button
              type="button"
              id="dashboard-customization-3dot-btn"
              onClick={() => setIsCustomizationMenuOpen((prev) => !prev)}
              className={cn(
                'p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-xs',
                isCustomizationMenuOpen
                  ? 'bg-slate-900 text-white dark:bg-[#29a19c] border-transparent ring-2 ring-slate-900/20 dark:ring-[#29a19c]/40'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#354146] dark:hover:bg-[#4e5c61] text-slate-800 dark:text-white border-slate-200 dark:border-[#55666d]'
              )}
              title="Customization Options (Dashboard, KPI Blocks, Graphs & Presets)"
              aria-label="Customization Menu"
            >
              <MoreVertical className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Dropdown Menu for All Customization - Renders at TOP LAYER */}
            <AnimatePresence>
              {isCustomizationMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-84 bg-white dark:bg-[#252b35] rounded-2xl shadow-2xl border-2 border-slate-300 dark:border-[#55666d] p-2.5 z-[100] origin-top-right text-slate-900 dark:text-white backdrop-blur-xl ring-2 ring-black/10"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#435055] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#29a19c]" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Customization Center</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Top Layer</span>
                  </div>

                  <div className="py-2 space-y-1.5">
                    {/* 1. PRIMARY CUSTOMIZE BUTTON - HIGH VISIBILITY & INSTANT ACTION */}
                    <button
                      type="button"
                      id="menu-customize-dashboard-btn"
                      onClick={() => {
                        setIsCustomizationMenuOpen(false);
                        setIsCustomizeOpen(true);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-[#29a19c] dark:hover:bg-[#248f8a] text-white transition-all cursor-pointer shadow-md group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Sliders className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs font-black flex items-center justify-between text-white">
                          <span>Customize Dashboard</span>
                          <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded font-black">
                            Customize
                          </span>
                        </p>
                        <p className="text-[11px] text-white/80 truncate">
                          Reorder KPI blocks, graphs & layout presets
                        </p>
                      </div>
                    </button>

                    {/* 2. Customize Quick Access */}
                    <button
                      type="button"
                      id="menu-customize-quick-access-btn"
                      onClick={() => {
                        setIsCustomizationMenuOpen(false);
                        const el = document.getElementById('modular-quick-access-container');
                        el?.scrollIntoView({ behavior: 'smooth' });
                        const btn = document.getElementById('quick-access-3dot-btn');
                        btn?.click();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#354146] transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Customize Quick Access
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate">
                          Reorder shortcuts & hover morph shapes
                        </p>
                      </div>
                    </button>

                    {/* 3. Reset All Customizations */}
                    <button
                      type="button"
                      id="menu-reset-customizations-btn"
                      onClick={() => {
                        setIsCustomizationMenuOpen(false);
                        resetDashboardBlocks();
                        resetBlockOrder();
                        applyPreset('default-hybrid');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#354146] transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <RotateCcw className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          Reset All Layouts
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate">
                          Restore original factory dashboard layout
                        </p>
                      </div>
                    </button>

                    {/* 4. Full Settings */}
                    <button
                      type="button"
                      id="menu-all-settings-btn"
                      onClick={() => {
                        setIsCustomizationMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-[#354146] transition-colors cursor-pointer group border-t border-slate-100 dark:border-[#435055] pt-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#435055] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          All System Customizations
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-300 truncate">
                          Advanced appearance & layout settings
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* =====================================================================
          QUICK SETTINGS MODAL / POPUP
          Allows 1-click hold & drag reordering, swapping, presets, and tile formats
          ===================================================================== */}
      {/* =====================================================================
          UNIFIED DASHBOARD CUSTOMIZATION MODAL
          One single place for KPI blocks, Quick Access presets, and Graphs layout
          ===================================================================== */}
      <AnimatePresence>
        {isCustomizeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#435055] rounded-3xl border border-slate-200 dark:border-[#55666d] shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#55666d] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#29a19c] text-white flex items-center justify-center shadow-xs">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight">
                    Customization
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#354146] text-slate-400 hover:text-slate-700 dark:hover:text-[#a3f7bf] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: 4 KPI Blocks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a3f7bf]">
                    KPI Blocks Order
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {orderedStatBlocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#354146] border border-slate-200 dark:border-[#55666d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#29a19c] text-slate-700 dark:text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold truncate">{block.title}</span>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  ))}
                </div>

                {/* 1-Click Swap Buttons */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={swapLeftRight}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#354146] dark:hover:bg-[#4e5c61] text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#55666d] transition-all cursor-pointer text-slate-800 dark:text-white"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#29a19c]" />
                    <span>Swap Left ⇄ Right</span>
                  </button>

                  <button
                    type="button"
                    onClick={swapTopBottom}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#354146] dark:hover:bg-[#4e5c61] text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#55666d] transition-all cursor-pointer text-slate-800 dark:text-white"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#29a19c]" />
                    <span>Swap Top ⇄ Bottom</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetBlockOrder}
                    className="py-1.5 px-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
                    title="Reset order"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: Quick Access Layout Presets */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#55666d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a3f7bf]">
                    Quick Access Presets
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('default-hybrid')}
                    className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-[#354146] hover:bg-slate-100 dark:hover:bg-[#4e5c61] border border-slate-200 dark:border-[#55666d] hover:border-[#29a19c] dark:hover:border-[#29a19c] transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Hybrid</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all-squares')}
                    className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-[#354146] hover:bg-slate-100 dark:hover:bg-[#4e5c61] border border-slate-200 dark:border-[#55666d] hover:border-[#29a19c] dark:hover:border-[#29a19c] transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">All Squares</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all-bars')}
                    className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-[#354146] hover:bg-slate-100 dark:hover:bg-[#4e5c61] border border-slate-200 dark:border-[#55666d] hover:border-[#29a19c] dark:hover:border-[#29a19c] transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">All Bars</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('compact-circles')}
                    className="p-2.5 rounded-xl text-left bg-slate-50 dark:bg-[#354146] hover:bg-slate-100 dark:hover:bg-[#4e5c61] border border-slate-200 dark:border-[#55666d] hover:border-[#29a19c] dark:hover:border-[#29a19c] transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Circles</p>
                  </button>
                </div>
              </div>

              {/* SECTION 3: Analytics Layout */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#55666d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a3f7bf]">
                    Analytics Layout
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGraphOrderChange('attendance-first')}
                    className={cn(
                      'p-2.5 rounded-xl text-left transition-all cursor-pointer border',
                      graphOrder === 'attendance-first'
                        ? 'bg-emerald-50/40 dark:bg-[#29a19c]/25 border-emerald-500/80 dark:border-[#29a19c] ring-2 ring-[#29a19c]/30'
                        : 'bg-slate-50 dark:bg-[#354146] border-slate-200 dark:border-[#55666d] hover:bg-slate-100 dark:hover:bg-[#4e5c61]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Attendance First
                      </span>
                      {graphOrder === 'attendance-first' && (
                        <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-[#a3f7bf]" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGraphOrderChange('marks-first')}
                    className={cn(
                      'p-2.5 rounded-xl text-left transition-all cursor-pointer border',
                      graphOrder === 'marks-first'
                        ? 'bg-purple-50/40 dark:bg-[#29a19c]/25 border-purple-500/80 dark:border-[#29a19c] ring-2 ring-[#29a19c]/30'
                        : 'bg-slate-50 dark:bg-[#354146] border-slate-200 dark:border-[#55666d] hover:bg-slate-100 dark:hover:bg-[#4e5c61]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Marks First
                      </span>
                      {graphOrder === 'marks-first' && (
                        <Check className="w-3.5 h-3.5 text-purple-500 dark:text-[#a3f7bf]" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Toggle Stacked vs 2-Column Grid */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleGraphLayoutChange('grid')}
                    className={cn(
                      'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5',
                      graphLayout === 'grid'
                        ? 'bg-[#29a19c] text-white border-[#29a19c]'
                        : 'bg-slate-100 dark:bg-[#354146] text-slate-800 dark:text-white border-slate-200 dark:border-[#55666d] hover:bg-slate-200 dark:hover:bg-[#4e5c61]'
                    )}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGraphLayoutChange('stacked')}
                    className={cn(
                      'flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5',
                      graphLayout === 'stacked'
                        ? 'bg-[#29a19c] text-white border-[#29a19c]'
                        : 'bg-slate-100 dark:bg-[#354146] text-slate-800 dark:text-white border-slate-200 dark:border-[#55666d] hover:bg-slate-200 dark:hover:bg-[#4e5c61]'
                    )}
                  >
                    Stacked
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-[#55666d]">
                <button
                  type="button"
                  onClick={() => {
                    resetDashboardBlocks();
                    resetBlockOrder();
                    handleGraphOrderChange('attendance-first');
                    handleGraphLayoutChange('grid');
                    applyPreset('default-hybrid');
                  }}
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#29a19c] hover:bg-[#248f8a] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          INTERACTIVE CUSTOMIZATION BAR (When Edit Mode is active)
          ===================================================================== */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-brand/5 via-white to-slate-50 dark:from-[#27323a] dark:via-[#435055] dark:to-[#354146] rounded-3xl border-2 border-brand/50 shadow-md space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/80 dark:border-[#55666d]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#29a19c] text-white flex items-center justify-center shadow-xs">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Layout Customizer
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#354146] dark:hover:bg-[#4e5c61] text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1 border border-slate-300/70 dark:border-[#55666d] cursor-pointer"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Open Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetDashboardBlocks();
                      resetBlockOrder();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleEditMode}
                    className="px-3.5 py-1.5 rounded-xl bg-[#29a19c] hover:bg-[#248f8a] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save & Close
                  </button>
                </div>
              </div>

              {/* Quick Format Presets */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-[#a3f7bf]">
                    Block Reorder:
                  </span>
                  <button
                    type="button"
                    onClick={swapLeftRight}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 transition-all cursor-pointer shadow-2xs"
                  >
                    Swap Left ⇄ Right
                  </button>
                  <button
                    type="button"
                    onClick={swapTopBottom}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 transition-all cursor-pointer shadow-2xs"
                  >
                    Swap Top ⇄ Bottom
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
                    Quick Access Tiles:
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPreset('default-hybrid')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 shadow-2xs cursor-pointer"
                  >
                    Hybrid
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all-bars')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 shadow-2xs cursor-pointer"
                  >
                    All Bars
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('all-squares')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 shadow-2xs cursor-pointer"
                  >
                    All Squares
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('compact-circles')}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#CBD5E1] dark:bg-[#CBD5E1] hover:bg-slate-300 text-black dark:text-black border border-slate-400 shadow-2xs cursor-pointer"
                  >
                    Circles
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          SECTION 1: TOP ROW
          - Left (7 cols):
            1. First four blocks (2 up, 2 down) reduced to sleek rectangles with
               increased text size for titles (Image 1)
            2. Directly below the blocks: Timetable Section (Image 2), ending till Quick Access
          - Right (5 cols): Quick Access full width right to these
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* LEFT COLUMN: 4 RECTANGLE BLOCKS + TIMETABLE SECTION */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 relative">
          {/* FIRST FOUR BLOCKS (TWO UP, TWO DOWN) - REDUCED TO RECTANGLES WITH INCREASED TITLE TEXT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
            {orderedStatBlocks.map((block, idx) => {
              const Icon = block.icon;
              const isBeingDragged = draggedBlockId === block.id;
              const isDragOver = dragOverBlockId === block.id;

              return (
                <motion.div
                  layout
                  key={block.id}
                  draggable
                  onDragStart={(e) => {
                    try {
                      e.dataTransfer.setData('text/plain', block.id);
                    } catch {}
                    setDraggedBlockId(block.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverBlockId !== block.id) {
                      setDragOverBlockId(block.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverBlockId === block.id) {
                      setDragOverBlockId(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedBlockId) {
                      handleDrop(draggedBlockId, block.id);
                    }
                    setDraggedBlockId(null);
                    setDragOverBlockId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedBlockId(null);
                    setDragOverBlockId(null);
                  }}
                  onClick={block.onClick}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative overflow-hidden bg-white/95 dark:bg-[#435055]/95 backdrop-blur-xs rounded-2xl p-4 sm:p-4.5 border border-slate-200/90 dark:border-[#55666d]',
                    'shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between min-h-[120px] sm:min-h-[126px]',
                    isBeingDragged && 'opacity-40 ring-2 ring-brand scale-95',
                    isDragOver && 'ring-2 ring-brand border-brand bg-brand/5 dark:bg-brand/10'
                  )}
                >
                  {/* Drag Grip Indicator */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span
                      className="p-1 rounded-lg bg-slate-100 dark:bg-[#354146] text-slate-500 dark:text-slate-300 hover:text-[#29a19c] cursor-grab active:cursor-grabbing shadow-xs"
                      title="Hold and drag to change position"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Top Row: Title with dark same color shown in image (image_e2dda226.png) */}
                  <div className="flex items-start justify-between gap-2.5 relative z-10">
                    <span className="text-sm sm:text-base font-medium text-slate-500 dark:text-[#a3f7bf] tracking-tight leading-snug">
                      {block.title}
                    </span>
                    <div
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs',
                        block.iconColor
                      )}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>

                  {/* Middle: Bold Metric (Bright pure white) */}
                  <div className="my-1 relative z-10">
                    <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight tabular-nums">
                      <AnimatedCounter
                        value={block.value}
                        prefix={block.prefix}
                        suffix={block.suffix}
                        decimals={block.decimals}
                      />
                    </p>
                  </div>

                  {/* Bottom: Divider line + Label with SAME dark color as top title */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#a3f7bf] pt-1.5 border-t border-slate-100 dark:border-[#55666d] relative z-10">
                    <span className="font-medium text-slate-500 dark:text-[#a3f7bf] text-[11px] sm:text-xs">
                      {block.tag}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#a3f7bf] group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* TIMETABLE SECTION (Image 2) - Placed directly below the 4 blocks, ends till Quick Access */}
          <div className="bg-white dark:bg-[#435055] rounded-3xl border border-slate-200/90 dark:border-[#55666d] p-4.5 sm:p-5 shadow-xs flex flex-col justify-between space-y-3.5 flex-1 relative z-10 overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#55666d] pb-3 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-[#a3f7bf] flex items-center justify-center shadow-2xs font-bold shrink-0">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-white">
                      Class Schedule & Timetable
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-300">
                      Active academic periods for this term
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('timetable')}
                  className="px-3.5 py-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#29a19c] hover:bg-slate-300 dark:hover:bg-[#248f8a] text-black dark:text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-colors border border-slate-400 dark:border-[#29a19c] shadow-2xs"
                >
                  <span className="text-black dark:text-white font-black">Full Timetable</span>
                  <ChevronRight className="w-3.5 h-3.5 text-black dark:text-white" />
                </button>
              </div>

              {(() => {
                const previewSlots =
                  role === 'Faculty'
                    ? timetableSlots.filter((slot) => {
                        const facId = currentUser?.idNumber || currentUser?.employeeId || '';
                        const facName = currentUser?.name?.toLowerCase() || '';
                        if (slot.facultyId && facId && slot.facultyId.toLowerCase() === facId.toLowerCase()) {
                          return true;
                        }
                        if (slot.instructor && facName && slot.instructor.toLowerCase().includes(facName)) {
                          return true;
                        }
                        return false;
                      })
                    : timetableSlots;

                const DAY_INDEX: Record<string, number> = {
                  Sunday: 0,
                  Monday: 1,
                  Tuesday: 2,
                  Wednesday: 3,
                  Thursday: 4,
                  Friday: 5,
                  Saturday: 6,
                };

                const now = new Date();
                const currentDayIndex = now.getDay();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                // Sort upcoming lectures strictly according to current day and time
                const sortedUpcomingSlots = [...previewSlots].sort((a, b) => {
                  const dayA = DAY_INDEX[a.day] ?? 1;
                  const dayB = DAY_INDEX[b.day] ?? 1;

                  const startA = a.startTime ? parseSingleTimeString(a.startTime) : parseTimeToMinutes(a.time).start;
                  const startB = b.startTime ? parseSingleTimeString(b.startTime) : parseTimeToMinutes(b.time).start;
                  const endA = a.durationMinutes ? startA + a.durationMinutes : parseTimeToMinutes(a.time).end;
                  const endB = b.durationMinutes ? startB + b.durationMinutes : parseTimeToMinutes(b.time).end;

                  let diffA = (dayA - currentDayIndex + 7) % 7;
                  let diffB = (dayB - currentDayIndex + 7) % 7;

                  // If today and lecture has already ended, advance to next week
                  if (diffA === 0 && endA < currentMinutes) diffA = 7;
                  if (diffB === 0 && endB < currentMinutes) diffB = 7;

                  const totalMinA = diffA * 24 * 60 + startA;
                  const totalMinB = diffB * 24 * 60 + startB;

                  return totalMinA - totalMinB;
                });

                return sortedUpcomingSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {sortedUpcomingSlots.slice(0, 4).map((slot, index) => {
                      const pal =
                        PASTEL_PALETTES[slot.colorTheme || 'pastel-blue'] ||
                        PASTEL_PALETTES['pastel-blue'];

                      const isNextUpcoming = index === 0;
                      const slotDayIndex = DAY_INDEX[slot.day] ?? 1;
                      const isToday = slotDayIndex === currentDayIndex;

                      return (
                        <div
                          key={slot.id}
                          data-timetable-card="true"
                          data-attendance-card="true"
                          onClick={() => onNavigate('timetable')}
                          style={{
                            '--card-dark-color': pal.darkMatchingColor,
                            backgroundColor: pal.previewColor,
                            color: pal.darkMatchingColor,
                            borderColor: `${pal.darkMatchingColor}35`,
                          } as React.CSSProperties}
                          className={`timetable-card p-4 sm:p-4.5 rounded-2xl border text-xs transition-all cursor-pointer hover:shadow-lg hover:scale-[1.01] ${pal.borderLight} ${pal.borderDark} relative flex flex-col justify-between`}
                        >
                          <div>
                            {/* Top row: Course code, type, day & upcoming status badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="font-mono font-black text-xs px-2.5 py-0.5 rounded-md"
                                  style={{ backgroundColor: `${pal.darkMatchingColor}22`, color: pal.darkMatchingColor }}
                                >
                                  {slot.courseCode}
                                </span>
                                <span
                                  className="font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md"
                                  style={{ backgroundColor: `${pal.darkMatchingColor}18`, color: pal.darkMatchingColor }}
                                >
                                  {slot.type}
                                </span>
                                {isNextUpcoming && (
                                  <span
                                    data-force-white="true"
                                    className="force-white-badge inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-white font-black text-[10px] shadow-2xs"
                                    style={{ backgroundColor: pal.darkMatchingColor, color: '#ffffff' }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                                    Next Upcoming
                                  </span>
                                )}
                              </div>

                              <span
                                className="text-[11px] font-black px-2.5 py-0.5 rounded-md shadow-2xs"
                                style={{ backgroundColor: `${pal.darkMatchingColor}20`, color: pal.darkMatchingColor }}
                              >
                                {isToday ? `Today (${slot.day})` : slot.day}
                              </span>
                            </div>

                            {/* Lecture Name (Subject) - Bigger font size as requested */}
                            <h4
                              className="font-black text-base sm:text-lg tracking-tight leading-snug line-clamp-2 mb-2"
                              style={{ color: pal.darkMatchingColor }}
                            >
                              {slot.courseTitle}
                            </h4>

                            {/* Class - Prominently Displayed as Big Text WITHOUT Block Layout */}
                            <div
                              className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 mb-1.5"
                              style={{ color: pal.darkMatchingColor }}
                            >
                              <GraduationCap className="w-5 h-5 shrink-0" style={{ color: pal.darkMatchingColor }} />
                              <span>Class: {slot.batch || 'CS-A'}</span>
                            </div>

                            {/* Instructor */}
                            {slot.instructor && (
                              <div
                                className="text-xs sm:text-sm font-bold flex items-center gap-1.5 mb-2.5 opacity-90"
                                style={{ color: pal.darkMatchingColor }}
                              >
                                <Users className="w-4 h-4 shrink-0" style={{ color: pal.darkMatchingColor }} />
                                <span className="truncate max-w-[180px]">{slot.instructor}</span>
                              </div>
                            )}
                          </div>

                          {/* Detailed Time Details & Room */}
                          <div
                            className="flex items-center justify-between text-xs sm:text-sm pt-2.5 border-t font-bold"
                            style={{ borderColor: `${pal.darkMatchingColor}25`, color: pal.darkMatchingColor }}
                          >
                            <span className="flex items-center gap-1.5" style={{ color: pal.darkMatchingColor }}>
                              <Clock className="w-4 h-4 shrink-0" style={{ color: pal.darkMatchingColor }} />
                              <span>{slot.time}</span>
                              <span className="text-[10px] font-mono opacity-80">({slot.durationMinutes || 90}m)</span>
                            </span>
                            <span
                              className="font-black px-2.5 py-0.5 rounded-md text-xs shadow-2xs"
                              style={{ backgroundColor: `${pal.darkMatchingColor}18`, color: pal.darkMatchingColor }}
                            >
                              {slot.room}
                            </span>
                          </div>
                        </div>
                      );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 dark:text-[#818181] text-xs font-medium">
                  No timetable sessions registered yet.
                </div>
              );
            })()}
          </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-[#525252] flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-200 font-bold relative z-10">
              <span>Active Semester Timetable</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#CBD5E1] dark:bg-[#CBD5E1] text-black font-extrabold border border-slate-400">
                {timetableSlots.length} Total Sessions
              </span>
            </div>
          </div>
        </div>

        {/* QUICK ACCESS: FULL WIDTH RIGHT TO THESE FOUR BLOCKS & TIMETABLE */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col h-full">
          <ModularQuickAccess onNavigate={onNavigate} />
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ATTENDANCE AND MARKS GRAPHS
          Strictly DOWN/BELOW the top row (blocks, timetable & quick access)
          Can be moved up/down and toggled side-by-side or stacked
          ========================================================================= */}
      <div className="w-full">
        <DashboardAnalyticsSection
          onNavigate={onNavigate}
          graphOrder={graphOrder}
          onGraphOrderChange={handleGraphOrderChange}
          graphLayout={graphLayout}
          onGraphLayoutChange={handleGraphLayoutChange}
        />
      </div>

      {/* =========================================================================
          SECTION 3: UPCOMING EXAMINATIONS
          Clean cards positioned beneath the analytics graphs
          ========================================================================= */}
      <div className="w-full">
        <div className="bg-white dark:bg-[#435055] rounded-3xl border border-slate-200/90 dark:border-[#55666d] p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#55666d] pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-[#a3f7bf] flex items-center justify-center shadow-2xs font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    Upcoming Examinations
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300">
                    Academic assessments & hall venues
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="px-3.5 py-1.5 rounded-full bg-[#CBD5E1] dark:bg-[#29a19c] hover:bg-slate-300 dark:hover:bg-[#248f8a] text-black dark:text-white text-xs font-black flex items-center gap-1 cursor-pointer transition-colors border border-slate-400 dark:border-[#29a19c] shadow-2xs"
              >
                <span className="text-black dark:text-white font-black">All Exams</span>
                <ChevronRight className="w-3.5 h-3.5 text-black dark:text-white" />
              </button>
            </div>

            {exams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 bg-[#CBD5E1] dark:bg-[#CBD5E1] rounded-2xl border border-slate-400 flex items-center justify-between text-xs text-black shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {exam.courseCode}
                        </span>
                        <h4 className="font-black text-black truncate">
                          {exam.courseTitle}
                        </h4>
                      </div>
                      <p className="text-[11px] font-bold text-black mt-1">
                        {exam.date} &bull; {exam.time} &bull;{' '}
                        <span className="font-extrabold text-black">
                          {exam.venue}
                        </span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-black text-white shrink-0">
                      {exam.examType}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 dark:text-[#a3f7bf]/70 text-xs font-medium">
                No active exam schedules.
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-[#55666d] flex items-center justify-between text-[11px] text-slate-400 dark:text-[#a3f7bf]">
            <span>Hall Ticket Generation Ready</span>
            <span>{exams.length} Active Exams</span>
          </div>
        </div>
      </div>
    </div>
  );
};
