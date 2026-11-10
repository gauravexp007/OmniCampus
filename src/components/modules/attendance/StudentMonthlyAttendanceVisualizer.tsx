import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  Filter,
  GraduationCap,
  Award,
  AlertTriangle,
  ShieldCheck,
  Building2,
  X,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { motion } from 'motion/react';
import { Student, StudentAttendanceRecord } from '../../../types';
import { cn } from '../../../lib/utils';
import {
  calculateMonthAttendanceBreakdown,
  computeStudentMonthlyGraphPoints,
  computeStudentDailyGraphPoints,
  ACADEMIC_HOLIDAYS,
} from '../../../utils/attendanceCalculator';
import { MonthlyAttendanceDonutChart } from '../../common/MonthlyAttendanceDonutChart';

interface StudentMonthlyAttendanceVisualizerProps {
  initialStudent?: Student;
  onClose?: () => void;
  isModal?: boolean;
}

export const StudentMonthlyAttendanceVisualizer: React.FC<StudentMonthlyAttendanceVisualizerProps> = ({
  initialStudent,
  onClose,
  isModal = false,
}) => {
  const {
    students,
    studentAttendanceRecords,
    addStudentAttendanceRecord,
    deleteStudentAttendanceRecord,
  } = useERP();

  // Current selected student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudent?.id || (students.length > 0 ? students[0].id : '')
  );

  // Selected Month & Year (Default to current: September 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 0-indexed: 8 = September

  // Selected Day for drill-down inspection
  const [inspectedDay, setInspectedDay] = useState<number | null>(null);

  // Active student object
  const activeStudent = useMemo(() => {
    return (
      students.find((s) => s.id === selectedStudentId) ||
      initialStudent ||
      students[0] || {
        id: 'std-101',
        name: 'Aria Chen',
        enrollmentNo: 'OMNI-2024-CS-084',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        department: 'Computer Science & AI',
        program: 'B.Tech in Artificial Intelligence',
        semester: 6,
        section: 'CS-A',
        cgpa: 3.92,
        attendancePct: 96.4,
        feeStatus: 'Paid',
        status: 'Active',
        mentor: 'Dr. Marcus Vance',
        phone: '+1 (555) 234-8910',
        admissionYear: 2023,
        creditsEarned: 112,
      }
    );
  }, [students, selectedStudentId, initialStudent]);

  // Quick 1-click day attendance marker
  const handleMarkDayAttendance = (dayNum: number, status: 'Present' | 'Absent') => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const existing = monthlyStudentRecords.filter((r) => r.date === dateStr);
    existing.forEach((r) => deleteStudentAttendanceRecord(r.id));

    addStudentAttendanceRecord({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      enrollmentNo: activeStudent.enrollmentNo,
      avatar: activeStudent.avatar,
      department: activeStudent.department,
      courseCode: 'CS-301',
      courseTitle: 'Distributed Database Systems',
      date: dateStr,
      timeSlot: '09:00 AM - 10:30 AM',
      status,
      markedBy: 'Faculty',
      facultyName: 'Dr. Marcus Vance',
      remarks: status === 'Present' ? 'Lecture attendance recorded' : 'Lecture absence recorded',
      timestamp: Date.now(),
    });
  };

  const handleClearDayAttendance = (dayNum: number) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const existing = monthlyStudentRecords.filter((r) => r.date === dateStr);
    existing.forEach((r) => deleteStudentAttendanceRecord(r.id));
  };

  // Today string for comparison
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Month navigation helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
    setInspectedDay(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
    setInspectedDay(null);
  };

  const isNextMonthDisabled = selectedYear >= 2027 && selectedMonth >= 11;

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Starting day of week (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  }, [selectedYear, selectedMonth]);

  // All attendance records for this student in this specific month
  const monthlyStudentRecords = useMemo(() => {
    const targetMonthStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return studentAttendanceRecords.filter((rec) => {
      const matchStudent =
        (rec.studentId && rec.studentId === activeStudent.id) ||
        (rec.enrollmentNo &&
          activeStudent.enrollmentNo &&
          rec.enrollmentNo.toLowerCase() === activeStudent.enrollmentNo.toLowerCase()) ||
        (rec.studentName &&
          activeStudent.name &&
          rec.studentName.toLowerCase() === activeStudent.name.toLowerCase());

      return matchStudent && rec.date.startsWith(targetMonthStr);
    });
  }, [studentAttendanceRecords, activeStudent, selectedYear, selectedMonth]);

  // Map records by day of month (1 to 31)
  const dayRecordsMap = useMemo(() => {
    const map = new Map<number, StudentAttendanceRecord[]>();
    monthlyStudentRecords.forEach((rec) => {
      const parts = rec.date.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        const existing = map.get(d) || [];
        existing.push(rec);
        map.set(d, existing);
      }
    });
    return map;
  }, [monthlyStudentRecords]);

  // Monthly stats calculations strictly reducing absents, holidays, saturdays, sundays
  const monthlyBreakdown = useMemo(() => {
    return calculateMonthAttendanceBreakdown(selectedYear, selectedMonth, monthlyStudentRecords);
  }, [selectedYear, selectedMonth, monthlyStudentRecords]);

  // Backward compatibility alias for existing references
  const monthlyStats = useMemo(() => {
    return {
      totalSessions: monthlyBreakdown.totalRecordedSessions,
      presentCount: monthlyBreakdown.presentsCount,
      absentCount: monthlyBreakdown.absentsCount,
      lateCount: monthlyBreakdown.lateCount,
      rate: String(monthlyBreakdown.calculatedPercentage),
      isEligible: monthlyBreakdown.isEligible,
    };
  }, [monthlyBreakdown]);

  // Inspected day records
  const inspectedDayRecords = useMemo(() => {
    if (inspectedDay === null) return null;
    return dayRecordsMap.get(inspectedDay) || [];
  }, [inspectedDay, dayRecordsMap]);

  // Personal graph mode: 'donut' (Concise Donut view) vs 'monthly' (comparison across months)
  const [personalGraphMode, setPersonalGraphMode] = useState<'donut' | 'monthly'>('donut');

  // All historical attendance records saved for this active student
  const allStudentHistoricalRecords = useMemo(() => {
    return studentAttendanceRecords
      .filter((rec) => {
        const matchStudent =
          (rec.studentId && rec.studentId === activeStudent.id) ||
          (rec.enrollmentNo &&
            activeStudent.enrollmentNo &&
            rec.enrollmentNo.toLowerCase() === activeStudent.enrollmentNo.toLowerCase()) ||
          (rec.studentName &&
            activeStudent.name &&
            rec.studentName.toLowerCase() === activeStudent.name.toLowerCase());
        return matchStudent;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [studentAttendanceRecords, activeStudent]);

  // Overall student attendance rate across all saved sessions
  const overallStudentAttendanceRate = useMemo(() => {
    if (allStudentHistoricalRecords.length === 0) {
      return activeStudent.attendancePct ? Number(activeStudent.attendancePct).toFixed(1) : '100.0';
    }
    const present = allStudentHistoricalRecords.filter((r) => r.status === 'Present').length;
    const late = allStudentHistoricalRecords.filter((r) => r.status === 'Late').length;
    return (((present + late * 0.5) / allStudentHistoricalRecords.length) * 100).toFixed(1);
  }, [allStudentHistoricalRecords, activeStudent]);

  // Personal Monthly Comparison: Groups all records by month (e.g. September, October for Aayush Verma)
  // using formula reducing absents, holidays, saturday, sundays
  const personalMonthlyChartData = useMemo(() => {
    return computeStudentMonthlyGraphPoints(activeStudent, studentAttendanceRecords);
  }, [activeStudent, studentAttendanceRecords]);

  // Personal Daily Trend for the currently viewed month
  const personalDailyChartData = useMemo(() => {
    const ym = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return computeStudentDailyGraphPoints(activeStudent, studentAttendanceRecords, ym);
  }, [activeStudent, studentAttendanceRecords, selectedYear, selectedMonth]);

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-xs relative', isModal ? 'p-5' : 'p-4')}>
      {/* Corner Cross Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer z-10 border border-slate-200/60 hover:border-slate-300 shadow-2xs"
          aria-label="Close"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* 1. HEADER & CONTROLS */}
      <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100', onClose && 'pr-12')}>
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-light text-brand border border-brand/20">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Monthly Attendance Visualizer
            </h3>
          </div>
        </div>

        {/* Student Selector & Month Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Student Selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                setInspectedDay(null);
              }}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              {students.map((stu) => (
                <option key={stu.id} value={stu.id}>
                  {stu.name} ({stu.enrollmentNo})
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year Navigator */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-bold text-slate-800 min-w-[120px] text-center">
              {monthNames[selectedMonth]} {selectedYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isNextMonthDisabled}
              className={cn(
                'p-1 rounded transition-colors',
                isNextMonthDisabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'hover:bg-white text-slate-600 hover:text-slate-900 cursor-pointer'
              )}
              title={isNextMonthDisabled ? 'Future months cannot be selected' : 'Next Month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. STUDENT PROFILE & MONTH STATS SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
        {/* Student Mini Card */}
        <div className="lg:col-span-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center gap-3">
          <img
            src={activeStudent.avatar}
            alt={activeStudent.name}
            className="w-11 h-11 rounded-full border border-slate-200 object-cover shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 text-sm truncate">{activeStudent.name}</p>
            </div>
            <p className="text-[11px] font-mono text-slate-500 truncate">{activeStudent.enrollmentNo}</p>
            <p className="text-[10px] text-slate-600 truncate mt-0.5">
              {activeStudent.department} • Sem {activeStudent.semester}
            </p>
          </div>
        </div>

        {/* Monthly Summary Badges with Explicit Reduction Formula */}
        <div className="lg:col-span-8 flex flex-col gap-2">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {/* 1. Calendar Days in Month */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Days
              </span>
              <span className="text-lg font-black text-slate-900 mt-0.5 block">
                {monthlyBreakdown.totalCalendarDays}
              </span>
              <span className="text-[9px] text-slate-400">Calendar days</span>
            </div>

            {/* 2. Weekends (Sat + Sun) Reduced */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                Weekends
              </span>
              <span className="text-lg font-black text-slate-700 mt-0.5 block">
                -{monthlyBreakdown.weekendsCount}
              </span>
              <span className="text-[9px] text-slate-400">
                {monthlyBreakdown.saturdaysCount} Sat • {monthlyBreakdown.sundaysCount} Sun
              </span>
            </div>

            {/* 3. Academic Holidays Reduced */}
            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Holidays
              </span>
              <span className="text-lg font-black text-amber-700 mt-0.5 block">
                -{monthlyBreakdown.holidaysCount}
              </span>
              <span className="text-[9px] text-amber-600 truncate block">
                {monthlyBreakdown.holidaysCount > 0 ? 'Official holidays' : 'No holidays'}
              </span>
            </div>

            {/* 4. Net Working Days Conducted */}
            <div className="p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-200 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                Working Days
              </span>
              <span className="text-lg font-black text-indigo-700 mt-0.5 block">
                {monthlyBreakdown.netWorkingDays}
              </span>
              <span className="text-[9px] text-indigo-600">
                {monthlyBreakdown.absentsCount > 0 ? `-${monthlyBreakdown.absentsCount} absent` : '0 absents'}
              </span>
            </div>

            {/* 5. Resulting Calculated Attendance Rate */}
            <div
              className={cn(
                'p-2.5 rounded-xl border shadow-2xs col-span-2 sm:col-span-1',
                monthlyBreakdown.isEligible
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : 'bg-rose-50/60 border-rose-300'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider block',
                  monthlyBreakdown.isEligible ? 'text-emerald-800' : 'text-rose-800'
                )}
              >
                Attendance %
              </span>
              <span
                className={cn(
                  'text-lg font-black font-mono mt-0.5 block',
                  monthlyBreakdown.isEligible ? 'text-emerald-700' : 'text-rose-700'
                )}
              >
                {monthlyBreakdown.calculatedPercentage}%
              </span>
              <span
                className={cn(
                  'text-[9px] font-bold block',
                  monthlyBreakdown.isEligible ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {monthlyBreakdown.isEligible ? 'Eligible (≥75%)' : 'Shortfall (<75%)'}
              </span>
            </div>
          </div>

          {/* Statutory Formula Explanation Ribbon */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/50 border border-emerald-200/80 text-[11px] text-emerald-900">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Statutory Attendance Formula:</span>
            <span className="text-slate-600">
              Total {monthlyBreakdown.totalCalendarDays} days − {monthlyBreakdown.saturdaysCount} Sat −{' '}
              {monthlyBreakdown.sundaysCount} Sun − {monthlyBreakdown.holidaysCount} Hol ={' '}
              <strong className="text-slate-900">{monthlyBreakdown.netWorkingDays} Working Days</strong>.
              Absents: {monthlyBreakdown.absentsCount} ➔ Rate:{' '}
              <strong className="text-emerald-700">{monthlyBreakdown.calculatedPercentage}%</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* 2.5 PERSONALIZED ATTENDANCE REPORT & CONCISE DONUT VIEW */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              Personalized Attendance Analytics & Concise Donut View ({activeStudent.name})
            </h5>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/60">
              {overallStudentAttendanceRate}% Cumulative ({allStudentHistoricalRecords.length} Saved Sessions)
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {/* Toggle: Concise Donut View vs Monthly Comparison */}
            <div className="relative inline-flex items-center p-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setPersonalGraphMode('donut')}
                className={cn(
                  'relative z-10 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1',
                  personalGraphMode === 'donut'
                    ? 'text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {personalGraphMode === 'donut' && (
                  <motion.div
                    layoutId="activePersonalGraphModePill"
                    className="absolute inset-0 bg-brand rounded-md shadow-2xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Donut Chart View</span>
              </button>
              <button
                type="button"
                onClick={() => setPersonalGraphMode('monthly')}
                className={cn(
                  'relative z-10 px-2.5 py-1 rounded-md transition-colors cursor-pointer',
                  personalGraphMode === 'monthly'
                    ? 'text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {personalGraphMode === 'monthly' && (
                  <motion.div
                    layoutId="activePersonalGraphModePill"
                    className="absolute inset-0 bg-brand rounded-md shadow-2xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <span>Monthly Comparison ({personalMonthlyChartData.length} Mos)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content container: Concise Donut Chart or Monthly Bar Chart */}
        <div>
          {personalGraphMode === 'donut' ? (
            <MonthlyAttendanceDonutChart
              student={activeStudent}
              records={studentAttendanceRecords}
              initialYear={selectedYear}
              initialMonth={selectedMonth}
              onMonthChange={(y, m) => {
                setSelectedYear(y);
                setSelectedMonth(m);
              }}
              className="bg-white/80 border-slate-200/90 shadow-none p-3.5"
            />
          ) : (
            <div className="w-full h-36 pt-1">
              {personalMonthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={personalMonthlyChartData} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="shortLabel" tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tickCount={4} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip content={<PersonalMonthlyTooltip />} />
                    <ReferenceLine y={75} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1.5} />
                    <Bar dataKey="attendancePct" name="Attendance %" fill="#10B981" radius={[6, 6, 0, 0]} isAnimationActive={true} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-white/60 rounded-xl border border-dashed border-slate-200">
                  No monthly attendance records saved yet for {activeStudent.name}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. SIMPLE & VISUALIZED MONTHLY CALENDAR GRID */}
      <div className="mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-800 text-sm">
            Attendance Calendar for {monthNames[selectedMonth]} {selectedYear}
          </span>

          {/* Color Coding Legend Matching Exact Requirements */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Present: Light Green fill with Dark Green Boundary */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#DCFCE7] border-2 border-[#15803D] text-[#15803D] font-extrabold text-[11px] shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-[#15803D] text-white flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
              <span>Present (Green)</span>
            </div>

            {/* Absent: Light Red fill with Dark Red Boundary */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FEE4E2] border-2 border-[#B42318] text-[#B42318] font-extrabold text-[11px] shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-[#B42318] text-white flex items-center justify-center text-[9px] font-black">
                ✕
              </span>
              <span>Absent (Red)</span>
            </div>

            {/* Saturday & Sunday: Light Grey fill with Grey Boundary */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#F2F4F7] border-2 border-[#98A2B3] text-slate-700 font-extrabold text-[11px] shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-[#98A2B3] text-white flex items-center justify-center text-[9px] font-black">
                ●
              </span>
              <span>Sat / Sun (Grey)</span>
            </div>

            {/* Holidays: Soft Amber fill with Amber Boundary */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FEF3C7] border-2 border-[#F59E0B] text-amber-900 font-extrabold text-[11px] shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[9px] font-black">
                ★
              </span>
              <span>Holidays (Amber)</span>
            </div>

            {/* No Class / Unmarked: White card with steel-slate circular badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-[11px] shadow-2xs">
              <span className="w-4 h-4 rounded-full bg-[#6C7D8A] text-white flex items-center justify-center text-[9px] font-black">
                21
              </span>
              <span>No Class</span>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black text-slate-600 uppercase tracking-wider mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
          {/* Empty offset days for start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[86px] sm:min-h-[96px] rounded-2xl bg-slate-50/40 border border-slate-100"
            />
          ))}

          {/* Actual days in month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isWeekend =
              new Date(selectedYear, selectedMonth, dayNum).getDay() === 0 ||
              new Date(selectedYear, selectedMonth, dayNum).getDay() === 6;
            const isFuture = dateStr > todayStr;
            const dayRecords = dayRecordsMap.get(dayNum) || [];
            const hasRecords = dayRecords.length > 0;

            const monthDayKey = `${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const holidayName = ACADEMIC_HOLIDAYS[monthDayKey];
            const isHoliday = Boolean(holidayName);

            const allPresent = hasRecords && dayRecords.every((r) => r.status === 'Present');
            const anyAbsent = hasRecords && dayRecords.some((r) => r.status === 'Absent');
            const isInspected = inspectedDay === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  setInspectedDay(inspectedDay === dayNum ? null : dayNum);
                }}
                className={cn(
                  'min-h-[86px] sm:min-h-[96px] p-2 sm:p-2.5 rounded-2xl transition-all flex flex-col justify-between relative cursor-pointer select-none group shadow-2xs',
                  // Status border & background rules:
                  // 1. Present: green (light green with dark green boundary)
                  allPresent
                    ? 'bg-[#DCFCE7] border-2 border-[#15803D] text-emerald-950 hover:brightness-98'
                    // 2. Absent: red for absent (light red with dark red boundary)
                    : anyAbsent
                    ? 'bg-[#FEE4E2] border-2 border-[#B42318] text-rose-950 hover:brightness-98'
                    // 3. Holiday: distinct amber color for holidays
                    : isHoliday
                    ? 'bg-[#FEF3C7] border-2 border-[#F59E0B] text-amber-950 hover:brightness-98'
                    // 4. Weekend: grey for Saturday or Sundays
                    : isWeekend
                    ? 'bg-[#F2F4F7] border-2 border-[#98A2B3] text-slate-700 hover:brightness-98'
                    // 5. Unmarked / No Class: clean white card with subtle border
                    : isFuture
                    ? 'bg-white/90 border border-dashed border-slate-300 text-slate-400 hover:border-slate-400'
                    : 'bg-white border border-slate-300/80 text-slate-600 hover:border-slate-400 hover:shadow-xs',
                  isInspected ? 'ring-2 ring-slate-900 ring-offset-2 z-10' : ''
                )}
              >
                {/* Top Row: Date Number circular badge & icons */}
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shrink-0 shadow-2xs transition-transform group-hover:scale-105',
                      // Day circle badge styling:
                      allPresent
                        ? 'bg-[#15803D] text-white'
                        : anyAbsent
                        ? 'bg-[#B42318] text-white'
                        : isHoliday
                        ? 'bg-[#F59E0B] text-white'
                        : isWeekend
                        ? 'bg-[#98A2B3] text-white'
                        : 'bg-[#6C7D8A] text-white font-black' // Steel slate circular badge with white digits!
                    )}
                  >
                    {dayNum}
                  </div>

                  {/* Top-right subtle icons */}
                  {allPresent && (
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                  )}
                  {anyAbsent && (
                    <XCircle className="w-4 h-4 text-[#B42318] shrink-0" />
                  )}
                </div>

                {/* Bottom Row: Status Label */}
                <div className="pt-1">
                  {allPresent ? (
                    <div className="text-center">
                      <span className="block text-[10px] sm:text-[11px] font-black text-[#15803D] uppercase tracking-wide">
                        Present
                      </span>
                      {dayRecords[0]?.courseCode && (
                        <span className="block text-[8px] font-mono text-emerald-800 truncate">
                          {dayRecords[0].courseCode}
                        </span>
                      )}
                    </div>
                  ) : anyAbsent ? (
                    <div className="text-center">
                      <span className="block text-[10px] sm:text-[11px] font-black text-[#B42318] uppercase tracking-wide">
                        Absent
                      </span>
                      {dayRecords[0]?.courseCode && (
                        <span className="block text-[8px] font-mono text-rose-800 truncate">
                          {dayRecords[0].courseCode}
                        </span>
                      )}
                    </div>
                  ) : isHoliday ? (
                    <span className="block text-[9px] sm:text-[10px] font-extrabold text-amber-900 text-center truncate">
                      {holidayName}
                    </span>
                  ) : isWeekend ? (
                    <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500 text-center">
                      Weekend
                    </span>
                  ) : isFuture ? (
                    <span className="block text-[9px] sm:text-[10px] font-medium text-slate-400 text-center italic">
                      Scheduled
                    </span>
                  ) : (
                    /* Matches image exactly: "No Class" */
                    <span className="block text-[10px] sm:text-[11px] font-medium text-slate-400 text-center">
                      No Class
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DAY DRILL-DOWN INSPECTION DETAILS & 1-CLICK ATTENDANCE MARKING */}
      {inspectedDay !== null && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Selected Calendar Day</span>
              <h4 className="font-extrabold text-sm text-slate-900">
                {monthNames[selectedMonth]} {inspectedDay}, {selectedYear}
              </h4>
            </div>

            {/* Quick 1-Click Action Buttons to mark attendance or reset */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkDayAttendance(inspectedDay, 'Present')}
                className="px-3 py-1.5 rounded-xl bg-[#DCFCE7] hover:bg-emerald-200 text-[#15803D] border-2 border-[#15803D] font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Mark Present: fills completely light green with dark green boundary"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkDayAttendance(inspectedDay, 'Absent')}
                className="px-3 py-1.5 rounded-xl bg-[#FEE4E2] hover:bg-rose-200 text-[#B42318] border-2 border-[#B42318] font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Mark Absent: fills completely light red with dark red boundary"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark Absent</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearDayAttendance(inspectedDay)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Reset to No Class"
              >
                <span>Reset (No Class)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectedDay(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close inspection"
                aria-label="Close inspection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session Details if Records Exist */}
          {inspectedDayRecords && inspectedDayRecords.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 block">
                Recorded Lecture Sessions ({inspectedDayRecords.length})
              </span>
              {inspectedDayRecords.map((r) => (
                <div
                  key={r.id}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {r.courseCode}: {r.courseTitle}
                      </span>
                      <span className="text-[11px] text-slate-400">({r.timeSlot || '09:00 AM'})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Faculty: {r.facultyName || 'Course Instructor'} • {r.remarks || 'Lecture record verified'}
                    </p>
                  </div>

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border shrink-0',
                      r.status === 'Present'
                        ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                        : 'bg-[#FEE4E2] text-[#B42318] border-[#B42318]'
                    )}
                  >
                    {r.status === 'Present' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#B42318]" />
                    )}
                    <span>{r.status}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>
                {new Date(selectedYear, selectedMonth, inspectedDay).getDay() === 0 ||
                new Date(selectedYear, selectedMonth, inspectedDay).getDay() === 6
                  ? 'Weekend - Non-instructional day. You can still mark attendance above if an extra class was conducted.'
                  : ACADEMIC_HOLIDAYS[`${String(selectedMonth + 1).padStart(2, '0')}-${String(inspectedDay).padStart(2, '0')}`]
                  ? `Academic Holiday: ${ACADEMIC_HOLIDAYS[`${String(selectedMonth + 1).padStart(2, '0')}-${String(inspectedDay).padStart(2, '0')}`]}. You can record compensatory lectures using the buttons above.`
                  : 'No attendance marked yet for this day. Click "Mark Present" or "Mark Absent" to immediately record status.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5. FULL MONTH SESSIONS TABLE */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800 mb-2">
          Detailed List of Past Month Sessions ({monthNames[selectedMonth]} {selectedYear})
        </h4>

        {monthlyStudentRecords.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-slate-100">
            No attendance records found for {activeStudent.name} in {monthNames[selectedMonth]} {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Course / Subject</th>
                  <th className="py-2 px-3">Slot</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyStudentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono font-medium text-slate-800">{rec.date}</td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-900">{rec.courseCode}</p>
                      <p className="text-[11px] text-slate-500">{rec.courseTitle}</p>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{rec.timeSlot || '09:00 AM'}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border',
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        )}
                      >
                        {rec.status === 'Present' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-700" />
                        )}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {rec.facultyName || 'Prof. Marcus Vance'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface PersonalTooltipProps {
  active?: boolean;
  payload?: any[];
}

const PersonalMonthlyTooltip: React.FC<PersonalTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isCompliant = (data.attendancePct ?? 0) >= 75;

  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[210px]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
        <span className="font-extrabold text-slate-900">{data.label}</span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-bold',
            isCompliant
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          )}
        >
          {isCompliant ? 'Eligible (≥75%)' : 'Shortfall (<75%)'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500 text-[11px]">Attendance Rate:</span>
        <span className="font-extrabold text-emerald-600 text-sm">{data.attendancePct}%</span>
      </div>
      {data.formulaBreakdown ? (
        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-mono">
          {data.formulaBreakdown}
        </div>
      ) : (
        <div className="text-[10px] text-slate-400">
          {data.presentCount} present, {data.absentsCount ?? 0} absent
        </div>
      )}
      <div className="text-[10px] text-slate-400">
        Working days attendance: {data.workingDaysAttendancePct ?? data.attendancePct}%
      </div>
    </div>
  );
};

const PersonalDailyTooltip: React.FC<PersonalTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 min-w-[210px]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
        <span className="font-extrabold text-slate-900">{data.label || data.dateKey || data.date}</span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-bold',
            data.status === 'Absent'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          )}
        >
          {data.status || (data.attendancePct >= 75 ? 'Eligible' : 'Shortfall')}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500 text-[11px]">Cumulative Rate:</span>
        <span className="font-extrabold text-emerald-600 text-sm">{data.attendancePct}%</span>
      </div>
      {data.formulaBreakdown && (
        <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100 font-mono">
          {data.formulaBreakdown}
        </div>
      )}
      <div className="text-[10px] text-slate-400">
        {data.statusInfo || `${data.presentsCount ?? data.attended} present so far`}
      </div>
    </div>
  );
};
