import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { Student, StudentAttendanceRecord } from '../../types';
import { cn } from '../../lib/utils';
import {
  calculateMonthAttendanceBreakdown,
  ACADEMIC_HOLIDAYS,
  MonthlyCalendarBreakdown,
} from '../../utils/attendanceCalculator';

export type BoxDisplayFilter = 'all' | 'present-absent-only';

export interface CurvedBoxAttendanceChartProps {
  student: Student | { id?: string; enrollmentNo?: string; name?: string; avatar?: string };
  records: StudentAttendanceRecord[];
  initialYear?: number;
  initialMonth?: number; // 0-indexed (8 = September, 9 = October)
  onMonthChange?: (year: number, month: number) => void;
  className?: string;
  compact?: boolean;
  showMonthNavigator?: boolean;
  defaultFilter?: BoxDisplayFilter;
}

interface DayBoxData {
  dayNum: number;
  dateStr: string;
  dayName: string;
  shortDate: string;
  statusType: 'Present' | 'Absent' | 'Weekend' | 'Holiday' | 'Unmarked';
  isSaturday: boolean;
  isSunday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  sessions: StudentAttendanceRecord[];
  presentCount: number;
  absentCount: number;
  courseCode?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CurvedBoxAttendanceChart: React.FC<CurvedBoxAttendanceChartProps> = ({
  student,
  records,
  initialYear = 2026,
  initialMonth = 8, // September by default
  onMonthChange,
  className,
  compact = false,
  showMonthNavigator = true,
  defaultFilter = 'all',
}) => {
  // Current month state
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);

  // Filter Option: Show All days vs Only Present & Absent (strictly matching user option)
  const [displayFilter, setDisplayFilter] = useState<BoxDisplayFilter>(defaultFilter);

  // Hovered box for interactive tooltip inspection
  const [hoveredBox, setHoveredBox] = useState<DayBoxData | null>(null);

  // Filter student-specific records
  const studentRecords = useMemo(() => {
    const sEnroll = (student.enrollmentNo || '').toLowerCase();
    const sId = (student.id || '').toLowerCase();
    const sName = (student.name || '').toLowerCase();

    return records.filter((r) => {
      const matchEnroll = r.enrollmentNo && r.enrollmentNo.toLowerCase() === sEnroll;
      const matchId = r.studentId && r.studentId.toLowerCase() === sId;
      const matchName = r.studentName && r.studentName.toLowerCase() === sName;
      return Boolean(matchEnroll || matchId || matchName);
    });
  }, [records, student]);

  // Records in currently selected month
  const currentMonthRecords = useMemo(() => {
    const ymPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return studentRecords.filter((r) => (r.date || '').startsWith(ymPrefix));
  }, [studentRecords, selectedYear, selectedMonth]);

  // Calculate monthly stats using the statutory reduction formula
  const breakdown: MonthlyCalendarBreakdown = useMemo(() => {
    return calculateMonthAttendanceBreakdown(selectedYear, selectedMonth, currentMonthRecords);
  }, [selectedYear, selectedMonth, currentMonthRecords]);

  // Construct day-by-day curved box list for the selected month
  const allDaysList = useMemo<DayBoxData[]>(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const list: DayBoxData[] = [];

    // Group current month records by day
    const dayRecordsMap = new Map<number, StudentAttendanceRecord[]>();
    currentMonthRecords.forEach((rec) => {
      const parts = (rec.date || '').split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const existing = dayRecordsMap.get(d) || [];
        existing.push(rec);
        dayRecordsMap.set(d, existing);
      }
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dow = dateObj.getDay(); // 0 = Sun, 6 = Sat
      const isSat = dow === 6;
      const isSun = dow === 0;
      const isWknd = isSat || isSun;

      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const monthDayKey = `${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const holidayName = ACADEMIC_HOLIDAYS[monthDayKey];
      const isHol = Boolean(holidayName);

      const daySessions = dayRecordsMap.get(day) || [];
      const hasSessions = daySessions.length > 0;
      const presentCount = daySessions.filter((s) => s.status === 'Present').length;
      const absentCount = daySessions.filter((s) => s.status === 'Absent').length;

      let statusType: DayBoxData['statusType'] = 'Unmarked';

      if (hasSessions) {
        if (absentCount > 0 && presentCount === 0) {
          statusType = 'Absent';
        } else if (presentCount > 0) {
          statusType = 'Present';
        } else {
          statusType = 'Present';
        }
      } else if (isWknd) {
        statusType = 'Weekend';
      } else if (isHol) {
        statusType = 'Holiday';
      } else {
        statusType = 'Unmarked';
      }

      list.push({
        dayNum: day,
        dateStr,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        shortDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        statusType,
        isSaturday: isSat,
        isSunday: isSun,
        isWeekend: isWknd,
        isHoliday: isHol,
        holidayName,
        sessions: daySessions,
        presentCount,
        absentCount,
        courseCode: daySessions[0]?.courseCode,
      });
    }

    return list;
  }, [selectedYear, selectedMonth, currentMonthRecords]);

  // Filtered day boxes based on option: All vs Only Present/Absent
  const displayedBoxes = useMemo<DayBoxData[]>(() => {
    if (displayFilter === 'present-absent-only') {
      return allDaysList.filter((b) => b.statusType === 'Present' || b.statusType === 'Absent');
    }
    return allDaysList;
  }, [allDaysList, displayFilter]);

  // Counts for quick legend
  const presentDaysCount = allDaysList.filter((b) => b.statusType === 'Present').length;
  const absentDaysCount = allDaysList.filter((b) => b.statusType === 'Absent').length;
  const weekendDaysCount = allDaysList.filter((b) => b.statusType === 'Weekend').length;
  const holidayDaysCount = allDaysList.filter((b) => b.statusType === 'Holiday').length;
  const unmarkedDaysCount = allDaysList.filter((b) => b.statusType === 'Unmarked').length;

  const handlePrevMonth = () => {
    let nextY = selectedYear;
    let nextM = selectedMonth - 1;
    if (nextM < 0) {
      nextM = 11;
      nextY -= 1;
    }
    setSelectedYear(nextY);
    setSelectedMonth(nextM);
    if (onMonthChange) onMonthChange(nextY, nextM);
  };

  const handleNextMonth = () => {
    let nextY = selectedYear;
    let nextM = selectedMonth + 1;
    if (nextM > 11) {
      nextM = 0;
      nextY += 1;
    }
    setSelectedYear(nextY);
    setSelectedMonth(nextM);
    if (onMonthChange) onMonthChange(nextY, nextM);
  };

  // Helper to get curved box background color strictly following user specification:
  // - Green color for Present
  // - Red for Absent
  // - Grey for Saturday or Sundays
  // - A color (Soft Amber / Purple) for Holidays
  // - Soft light slate for Unmarked working days
  const getBoxColorClasses = (status: DayBoxData['statusType']) => {
    switch (status) {
      case 'Present':
        // Soft rich green matching user image
        return 'bg-[#4ADE80] hover:bg-[#22C55E] dark:bg-[#22C55E] dark:hover:bg-[#16A34A] border-[#86EFAC] dark:border-[#15803D] shadow-xs';
      case 'Absent':
        // Red color for Absent
        return 'bg-[#F87171] hover:bg-[#EF4444] dark:bg-[#EF4444] dark:hover:bg-[#DC2626] border-[#FCA5A5] dark:border-[#B91C1C] shadow-xs';
      case 'Weekend':
        // Grey for Saturday or Sundays
        return 'bg-[#E2E8F0] hover:bg-[#CBD5E1] dark:bg-[#334155] dark:hover:bg-[#475569] border-[#CBD5E1]/60 dark:border-[#475569]/60';
      case 'Holiday':
        // Distinct color for Holidays (Soft Amber Gold)
        return 'bg-[#FBBF24] hover:bg-[#F59E0B] dark:bg-[#F59E0B] dark:hover:bg-[#D97706] border-[#FDE047] dark:border-[#B45309] shadow-xs';
      case 'Unmarked':
      default:
        // Clean neutral empty slot
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700/60';
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3.5 transition-all shadow-xs',
        className
      )}
    >
      {/* 1. TOP HEADER & FILTER TOGGLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
            <span>Monthly Attendance Curved Box View</span>
            <span className="text-[11px] font-mono font-normal text-slate-500 dark:text-slate-400">
              ({student.name})
            </span>
          </h4>

          {/* Quick Month / Year Navigator */}
          {showMonthNavigator && (
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 ml-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-bold text-slate-800 dark:text-slate-200 min-w-[100px] text-center">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 2. OPTION TOGGLE: ALL DAYS vs ONLY PRESENT / ABSENT */}
        <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setDisplayFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1',
              displayFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-extrabold border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
          >
            <span>All Days</span>
            <span className="text-[10px] opacity-75 font-mono">({allDaysList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayFilter('present-absent-only')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1',
              displayFilter === 'present-absent-only'
                ? 'bg-brand text-white shadow-2xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
            title="Show only recorded Present & Absent activity"
          >
            <Filter className="w-3 h-3" />
            <span>Only Present / Absent</span>
            <span className="text-[10px] px-1 py-0.2 rounded-full bg-white/20 font-mono">
              {presentDaysCount + absentDaysCount}
            </span>
          </button>
        </div>
      </div>

      {/* 2.5 STATUTORY ATTENDANCE SIMPLE CURVED BOX SUMMARY: (HOLIDAYS, SATURDAYS, SUNDAYS, ABSENT, PRESENT) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
        {/* 1. Holidays: Amber */}
        <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-700/60 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              Holidays (Amber)
            </span>
            <span className="text-base font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
              {breakdown.holidaysCount} Days
            </span>
          </div>
          <span className="w-5 h-5 rounded-lg bg-[#FBBF24] border border-[#F59E0B] flex items-center justify-center text-amber-950 text-[10px] font-black shrink-0 shadow-2xs">
            ★
          </span>
        </div>

        {/* 2. Saturdays: Grey (Black text over grey background) */}
        <div className="p-2.5 rounded-2xl bg-[#CBD5E1] dark:bg-[#CBD5E1] border-2 border-slate-400 dark:border-slate-400 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-black uppercase tracking-wider block">
              Saturdays (Grey)
            </span>
            <span className="text-base font-black text-black mt-0.5 block">
              {breakdown.saturdaysCount} Days
            </span>
          </div>
          <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-2xs">
            S
          </span>
        </div>

        {/* 3. Sundays: Grey (Black text over grey background) */}
        <div className="p-2.5 rounded-2xl bg-[#CBD5E1] dark:bg-[#CBD5E1] border-2 border-slate-400 dark:border-slate-400 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-black text-black uppercase tracking-wider block">
              Sundays (Grey)
            </span>
            <span className="text-base font-black text-black mt-0.5 block">
              {breakdown.sundaysCount} Days
            </span>
          </div>
          <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-[10px] font-black text-white shadow-2xs">
            S
          </span>
        </div>

        {/* 4. Absent: Red */}
        <div className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-700/60 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              Absent (Red)
            </span>
            <span className="text-base font-black text-rose-700 dark:text-rose-400 mt-0.5 block">
              {breakdown.absentsCount} Days
            </span>
          </div>
          <span className="w-5 h-5 rounded-lg bg-[#F87171] border border-[#EF4444] flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-2xs">
            ✕
          </span>
        </div>

        {/* 5. Present: Green */}
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/60 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Present (Green)
            </span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              {breakdown.presentsCount} Days
            </span>
          </div>
          <span className="w-5 h-5 rounded-lg bg-[#4ADE80] border border-[#22C55E] flex items-center justify-center text-emerald-950 text-[10px] font-black shrink-0 shadow-2xs">
            ✓
          </span>
        </div>

        {/* 6. Calculated Net Present % */}
        <div
          className={cn(
            'p-2.5 rounded-2xl border-2 flex items-center justify-between col-span-2 sm:col-span-1 shadow-2xs',
            breakdown.isEligible
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          )}
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider block">
              Present %
            </span>
            <span className="text-base font-black font-mono mt-0.5 block">
              {breakdown.calculatedPercentage}%
            </span>
          </div>
          <span
            className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0',
              breakdown.isEligible
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            )}
          >
            {breakdown.isEligible ? '≥75%' : '<75%'}
          </span>
        </div>
      </div>

      {/* 3. SIMPLE CURVED BOX VIEW (MATCHING THE UPLOADED HEATMAP IMAGE) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold px-0.5">
          <span>
            {displayFilter === 'present-absent-only'
              ? `Showing only days student was marked Present or Absent (${displayedBoxes.length} days recorded)`
              : `${MONTH_NAMES[selectedMonth]} ${selectedYear} Daily Breakdown (${allDaysList.length} calendar days)`}
          </span>
          <span className="text-[10px] text-slate-400">
            Hover over any curved box for details
          </span>
        </div>

        {displayedBoxes.length > 0 ? (
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-x-auto">
            {/* Curved Box Grid */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 items-center">
              {displayedBoxes.map((box) => {
                const colorClass = getBoxColorClasses(box.statusType);
                const isHovered = hoveredBox?.dayNum === box.dayNum;

                return (
                  <div
                    key={`day-box-${box.dayNum}`}
                    onMouseEnter={() => setHoveredBox(box)}
                    onMouseLeave={() => setHoveredBox(null)}
                    className={cn(
                      'relative group cursor-pointer transition-all duration-150',
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl border flex items-center justify-center font-bold text-[11px]',
                      colorClass,
                      isHovered ? 'scale-110 ring-2 ring-brand/40 shadow-md z-20' : 'hover:scale-105 shadow-2xs'
                    )}
                    title={`${box.shortDate} (${box.dayName}): ${box.statusType}`}
                  >
                    {/* Day number inside curved box */}
                    <span
                      className={cn(
                        'text-[10px] font-black',
                        box.statusType === 'Present'
                          ? 'text-emerald-950'
                          : box.statusType === 'Absent'
                          ? 'text-white'
                          : box.statusType === 'Weekend'
                          ? 'text-slate-600 dark:text-slate-300'
                          : box.statusType === 'Holiday'
                          ? 'text-amber-950'
                          : 'text-slate-500'
                      )}
                    >
                      {box.dayNum}
                    </span>

                    {/* Miniature status symbol on top-right */}
                    {box.statusType === 'Present' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-600 ring-1 ring-white" />
                    )}
                    {box.statusType === 'Absent' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-700 ring-1 ring-white" />
                    )}
                    {box.statusType === 'Holiday' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-1 ring-white" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No Present or Absent logs saved for {student.name} in {MONTH_NAMES[selectedMonth]} {selectedYear}.
            Switch to &ldquo;All Days&rdquo; to view the complete monthly calendar with weekends and holidays.
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE INSPECTION CARD FOR HOVERED / SELECTED BOX */}
      {hoveredBox ? (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-black',
                getBoxColorClasses(hoveredBox.statusType)
              )}
            />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">
                {hoveredBox.shortDate} ({hoveredBox.dayName}) &bull;{' '}
                <span
                  className={cn(
                    hoveredBox.statusType === 'Present'
                      ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                      : hoveredBox.statusType === 'Absent'
                      ? 'text-rose-700 dark:text-rose-400 font-extrabold'
                      : hoveredBox.statusType === 'Holiday'
                      ? 'text-amber-700 dark:text-amber-400 font-extrabold'
                      : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  {hoveredBox.statusType === 'Holiday'
                    ? `Academic Holiday: ${hoveredBox.holidayName}`
                    : hoveredBox.statusType === 'Weekend'
                    ? `${hoveredBox.dayName} (Non-Working Weekend Day)`
                    : hoveredBox.statusType}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {hoveredBox.sessions.length > 0
                  ? `${hoveredBox.sessions.length} lecture session(s) recorded: ${hoveredBox.sessions.map((s) => s.courseCode).join(', ')}`
                  : hoveredBox.statusType === 'Weekend' || hoveredBox.statusType === 'Holiday'
                  ? 'Non-working day (excluded from attendance calculation)'
                  : 'Unscheduled / No lecture attendance recorded'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {hoveredBox.dateStr}
            </span>
          </div>
        </motion.div>
      ) : (
        /* Explanatory color legend matching user requirements */
        <div className="flex flex-wrap items-center gap-3 text-xs pt-1 px-1">
          <span className="text-[11px] font-bold text-slate-400">Box Colors:</span>

          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <span className="w-3.5 h-3.5 rounded-md bg-[#4ADE80] border border-[#22C55E]" />
            <span>Present (Green)</span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F87171] border border-[#EF4444]" />
            <span>Absent (Red)</span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E2E8F0] dark:bg-[#334155] border border-slate-300 dark:border-slate-600" />
            <span>Sat / Sun (Grey)</span>
          </span>

          <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FBBF24] border border-[#F59E0B]" />
            <span>Holidays (Amber)</span>
          </span>

          <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <span>Unmarked</span>
          </span>
        </div>
      )}
    </div>
  );
};
