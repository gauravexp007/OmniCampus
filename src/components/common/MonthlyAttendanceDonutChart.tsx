import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  PieChart as PieChartIcon,
  ChevronDown,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, StudentAttendanceRecord } from '../../types';
import { cn } from '../../lib/utils';
import {
  calculateMonthAttendanceBreakdown,
  MonthlyCalendarBreakdown,
} from '../../utils/attendanceCalculator';
import { AnimatedCounter, SpotlightCard } from './DribbbleAnimations';

export interface MonthlyAttendanceDonutChartProps {
  student: Student | { id?: string; enrollmentNo?: string; name?: string; avatar?: string };
  records: StudentAttendanceRecord[];
  initialYear?: number;
  initialMonth?: number; // 0-indexed: 8 = September, 9 = October
  onMonthChange?: (year: number, month: number) => void;
  className?: string;
  compact?: boolean;
  showMonthNavigator?: boolean;
  title?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface DonutSliceItem {
  id: string;
  name: string;
  shortName: string;
  value: number;
  color: string;
  borderColor: string;
  badgeSymbol: string;
  textColor: string;
  bgLight: string;
  description: string;
}

export const MonthlyAttendanceDonutChart: React.FC<MonthlyAttendanceDonutChartProps> = ({
  student,
  records,
  initialYear = 2026,
  initialMonth = 8, // September by default
  onMonthChange,
  className,
  compact = false,
  showMonthNavigator = true,
  title,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [activeSliceIndex, setActiveSliceIndex] = useState<number | null>(null);
  const [showBreakdownPopover, setShowBreakdownPopover] = useState(false);

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

  // Calculate monthly stats using statutory reduction formula
  const breakdown: MonthlyCalendarBreakdown = useMemo(() => {
    return calculateMonthAttendanceBreakdown(selectedYear, selectedMonth, currentMonthRecords);
  }, [selectedYear, selectedMonth, currentMonthRecords]);

  // Construct slices for the donut chart from the monthly data
  const donutData = useMemo<DonutSliceItem[]>(() => {
    const slices: DonutSliceItem[] = [
      {
        id: 'present',
        name: 'Present',
        shortName: 'Pres',
        value: breakdown.presentsCount,
        color: '#22C55E', // Green
        borderColor: '#16A34A',
        badgeSymbol: '✓',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800',
        description: 'Attended scheduled lectures',
      },
      {
        id: 'absent',
        name: 'Absent',
        shortName: 'Abs',
        value: breakdown.absentsCount,
        color: '#EF4444', // Red
        borderColor: '#DC2626',
        badgeSymbol: '✕',
        textColor: 'text-rose-700 dark:text-rose-400',
        bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800',
        description: 'Unexcused / recorded missed sessions',
      },
      {
        id: 'saturdays',
        name: 'Saturdays',
        shortName: 'Sat',
        value: breakdown.saturdaysCount,
        color: '#94A3B8', // Grey
        borderColor: '#64748B',
        badgeSymbol: 'S',
        textColor: 'text-slate-700 dark:text-slate-300',
        bgLight: 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
        description: 'Non-working weekend days',
      },
      {
        id: 'sundays',
        name: 'Sundays',
        shortName: 'Sun',
        value: breakdown.sundaysCount,
        color: '#64748B', // Slate Grey
        borderColor: '#475569',
        badgeSymbol: 'S',
        textColor: 'text-slate-700 dark:text-slate-300',
        bgLight: 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700',
        description: 'Non-working weekend days',
      },
      {
        id: 'holidays',
        name: 'Holidays',
        shortName: 'Hol',
        value: breakdown.holidaysCount,
        color: '#F59E0B', // Amber
        borderColor: '#D97706',
        badgeSymbol: '★',
        textColor: 'text-amber-800 dark:text-amber-300',
        bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
        description: 'Official academic holidays',
      },
    ];

    // Optional: if working days have unmarked slots
    const markedWorkingDays = breakdown.presentsCount + breakdown.absentsCount;
    const unmarkedDays = Math.max(0, breakdown.netWorkingDays - markedWorkingDays);
    if (unmarkedDays > 0) {
      slices.push({
        id: 'unmarked',
        name: 'Scheduled / Unmarked',
        shortName: 'Sch',
        value: unmarkedDays,
        color: '#CBD5E1',
        borderColor: '#94A3B8',
        badgeSymbol: '—',
        textColor: 'text-slate-500 dark:text-slate-400',
        bgLight: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
        description: 'Remaining scheduled academic days',
      });
    }

    return slices.filter((s) => s.value > 0);
  }, [breakdown]);

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

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs transition-all',
        className
      )}
    >
      {/* 1. Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-600" />
            <span>{title || 'Monthly Attendance Breakdown (Donut View)'}</span>
            {student.name && (
              <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400 hidden md:inline">
                • {student.name}
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Concise distribution of Present, Absent, Weekends, and Holidays for {MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {showMonthNavigator && (
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[110px] text-center">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Corner Button: Detailed Days Breakdown Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBreakdownPopover(!showBreakdownPopover)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-2xs',
                showBreakdownPopover
                  ? 'bg-[#29a19c] text-white border-[#248f8a]'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#354146] dark:hover:bg-[#435055] text-slate-800 dark:text-white border-slate-200 dark:border-[#55666d]'
              )}
              title="View Detailed Monthly Days Breakdown"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Days Breakdown</span>
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-white/60 dark:bg-black/30">
                {breakdown.calculatedPercentage}%
              </span>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  showBreakdownPopover && 'rotate-180'
                )}
              />
            </button>

            {/* Popover overlay showing the 6 fields from image */}
            <AnimatePresence>
              {showBreakdownPopover && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowBreakdownPopover(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 z-40 w-[310px] sm:w-[360px] bg-white dark:bg-[#435055] rounded-2xl border border-slate-200 dark:border-[#55666d] shadow-2xl p-3.5 space-y-2.5 text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#55666d]">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-[#a3f7bf]">
                        {MONTH_NAMES[selectedMonth]} {selectedYear} &bull; Days Breakdown
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowBreakdownPopover(false)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#354146] text-slate-400 hover:text-slate-700 dark:hover:text-[#a3f7bf] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* 1. Holidays (Amber) */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                            Holidays (Amber)
                          </span>
                          <span className="text-sm font-black text-amber-800 dark:text-amber-300 mt-0.5 block">
                            {breakdown.holidaysCount} Days
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-[#FBBF24] border border-[#F59E0B] flex items-center justify-center text-amber-950 text-xs font-black shrink-0">
                          ★
                        </span>
                      </div>

                      {/* 2. Saturdays (Grey - Black text over grey background) */}
                      <div className="p-2.5 rounded-xl bg-[#CBD5E1] dark:bg-[#CBD5E1] border-2 border-slate-400 dark:border-slate-400 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black text-black uppercase tracking-wider block">
                            Saturdays (Grey)
                          </span>
                          <span className="text-sm font-black text-black mt-0.5 block">
                            {breakdown.saturdaysCount} Days
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-xs font-black text-white shadow-2xs">
                          S
                        </span>
                      </div>

                      {/* 3. Sundays (Grey - Black text over grey background) */}
                      <div className="p-2.5 rounded-xl bg-[#CBD5E1] dark:bg-[#CBD5E1] border-2 border-slate-400 dark:border-slate-400 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black text-black uppercase tracking-wider block">
                            Sundays (Grey)
                          </span>
                          <span className="text-sm font-black text-black mt-0.5 block">
                            {breakdown.sundaysCount} Days
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center text-xs font-black text-white shadow-2xs">
                          S
                        </span>
                      </div>

                      {/* 4. Absent (Red) */}
                      <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-700/60 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
                            Absent (Red)
                          </span>
                          <span className="text-sm font-black text-rose-700 dark:text-rose-400 mt-0.5 block">
                            {breakdown.absentsCount} Days
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-[#F87171] border border-[#EF4444] flex items-center justify-center text-white text-xs font-black shrink-0">
                          ✕
                        </span>
                      </div>

                      {/* 5. Present (Green) */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                            Present (Green)
                          </span>
                          <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                            {breakdown.presentsCount} Days
                          </span>
                        </div>
                        <span className="w-6 h-6 rounded-lg bg-[#4ADE80] border border-[#22C55E] flex items-center justify-center text-emerald-950 text-xs font-black shrink-0">
                          ✓
                        </span>
                      </div>

                      {/* 6. Present % */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl border flex items-center justify-between shadow-2xs',
                          breakdown.isEligible
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        )}
                      >
                        <div>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider block">
                            Present %
                          </span>
                          <span className="text-sm font-black font-mono mt-0.5 block">
                            {breakdown.calculatedPercentage}%
                          </span>
                        </div>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0',
                            breakdown.isEligible
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900 dark:text-rose-300'
                          )}
                        >
                          &ge;75%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. Concise Donut Chart with Center KPI & Interactive Legend */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
        {/* Donut Chart with Center KPI */}
        <div className="md:col-span-6 flex flex-col items-center justify-center relative min-h-[220px]">
          <div className="w-full h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={900}
                >
                  {donutData.map((entry, index) => (
                    <Cell
                      key={`slice-${entry.id}`}
                      fill={entry.color}
                      stroke={activeSliceIndex === index ? '#0F172A' : '#FFFFFF'}
                      strokeWidth={activeSliceIndex === index ? 3 : 1.5}
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      onMouseEnter={() => setActiveSliceIndex(index)}
                      onMouseLeave={() => setActiveSliceIndex(null)}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DonutSliceItem;
                      const pctOfMonth = ((data.value / breakdown.totalCalendarDays) * 100).toFixed(1);
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-700/80 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-md"
                              style={{ backgroundColor: data.color }}
                            />
                            <p className="font-extrabold text-sm">{data.name}</p>
                          </div>
                          <p className="text-slate-300">
                            <strong>{data.value}</strong> of {breakdown.totalCalendarDays} days ({pctOfMonth}%)
                          </p>
                          <p className="text-[11px] text-slate-400 italic">
                            {data.description}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Attendance
              </span>
              <p
                className={cn(
                  'text-3xl font-black font-mono leading-none my-0.5',
                  breakdown.isEligible
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-700 dark:text-rose-400'
                )}
              >
                <AnimatedCounter
                  value={breakdown.calculatedPercentage}
                  decimals={0}
                  suffix="%"
                />
              </p>
              <span
                className={cn(
                  'text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs',
                  breakdown.isEligible
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                )}
              >
                {breakdown.isEligible ? 'Eligible' : 'Shortfall'}
              </span>
            </div>
          </div>
        </div>

        {/* Donut Slices Legend & Distribution Details */}
        <div className="md:col-span-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span>Monthly Category</span>
            <span>Days / Month %</span>
          </div>

          <div className="space-y-1.5">
            {donutData.map((item, idx) => {
              const pct = ((item.value / breakdown.totalCalendarDays) * 100).toFixed(1);
              const isHovered = activeSliceIndex === idx;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveSliceIndex(idx)}
                  onMouseLeave={() => setActiveSliceIndex(null)}
                  className={cn(
                    'p-2 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer',
                    isHovered
                      ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <span className="font-extrabold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                        ({item.description})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-black text-slate-900 dark:text-white">
                      {item.value} <span className="text-[10px] font-normal text-slate-400">days</span>
                    </span>
                    <span className="text-[11px] text-slate-400 min-w-[42px] text-right font-semibold">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Statutory Reduction Formula Banner */}
      <div className="flex items-start sm:items-center gap-2 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
        <div className="leading-relaxed">
          <strong className="font-bold text-emerald-900 dark:text-emerald-100">
            Official Statutory Attendance Formula:
          </strong>{' '}
          <span className="text-slate-700 dark:text-slate-300">
            Total {breakdown.totalCalendarDays} Days − {breakdown.saturdaysCount} Sat −{' '}
            {breakdown.sundaysCount} Sun − {breakdown.holidaysCount} Hol ={' '}
            <strong className="text-slate-950 dark:text-white">{breakdown.netWorkingDays} Working Days</strong>.{' '}
            {breakdown.absentsCount > 0 ? `${breakdown.absentsCount} Absents ➔ ` : '0 Absents ➔ '}
            Calculated Net Present Rate:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm font-black">
              {breakdown.calculatedPercentage}%
            </strong>.
          </span>
        </div>
      </div>
    </div>
  );
};
