import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  CalendarCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  User,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Clock,
  Layers,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Printer,
  FileText,
  Building2,
  Users,
  Target,
  BarChart3,
  LayoutGrid,
  Info,
  Check,
  Eye,
  SlidersHorizontal,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { Student, ERPModuleId, UserRole } from '../../../types';
import { cn } from '../../../lib/utils';
import {
  computeStudentComprehensivePerformance,
  computeCohortAnalytics,
  ComprehensiveStudentPerformance,
  CohortAnalyticsSummary,
} from '../../../utils/performanceAnalyticsCalculator';
import { MonthlyAttendanceDonutChart } from '../../common/MonthlyAttendanceDonutChart';
import {
  AnimatedCounter,
  SpotlightCard,
  AnimatedProgressRing,
  triggerDribbbleConfetti,
} from '../../common/DribbbleAnimations';

const ProgressRing: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showText?: boolean;
}> = ({
  value,
  size = 44,
  strokeWidth = 4,
  color = '#10B981',
  bgColor = '#E2E8F0',
  showText = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
          className="dark:opacity-20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showText && (
        <span className="absolute text-[10px] font-black font-mono">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
};

interface StudentPerformanceAnalyticsDashboardProps {
  onNavigate?: (module: ERPModuleId) => void;
  className?: string;
}

type TimeHorizon = 'semester' | 'monthly' | 'yearly';
type ViewMode = 'individual' | 'cohort';
type RiskFilter = 'all' | 'at-risk' | 'declining' | 'honors';

export const StudentPerformanceAnalyticsDashboard: React.FC<
  StudentPerformanceAnalyticsDashboardProps
> = ({ onNavigate, className }) => {
  const {
    role,
    currentUser,
    students,
    faculty,
    courses,
    studentAttendanceRecords,
    results,
    isAuthLoading,
  } = useERP();

  // Print ref for PDF export
  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Time Horizon Filter: 'semester' | 'monthly' | 'yearly'
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('semester');

  // Faculty / Admin View Mode: 'individual' deep-dive vs 'cohort' class comparison
  const [viewMode, setViewMode] = useState<ViewMode>(
    role === 'Student' ? 'individual' : 'individual'
  );

  // Filter States for Faculty/Admin Search
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<number>(0); // 0 = all
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  // Active Selected Student for deep-dive report
  // Default to Aayush Verma ('230101010001') or first student with records
  const defaultStudentEnrollment = useMemo(() => {
    if (role === 'Student') {
      const match = students.find(
        (s) =>
          (currentUser?.idNumber && s.enrollmentNo.toLowerCase() === currentUser.idNumber.toLowerCase()) ||
          (currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          s.name.toLowerCase() === (currentUser?.name || '').toLowerCase()
      );
      return match ? match.enrollmentNo : students[0]?.enrollmentNo || '230101010001';
    }
    return '230101010001'; // Aayush Verma by default for faculty/admin
  }, [role, currentUser, students]);

  const [selectedEnrollment, setSelectedEnrollment] = useState<string>(defaultStudentEnrollment);

  // Keep student role locked to their own record for RBAC
  const effectiveEnrollment = role === 'Student' ? defaultStudentEnrollment : selectedEnrollment;

  // Resolved active student
  const activeStudent = useMemo<Student>(() => {
    const found = students.find(
      (s) =>
        s.enrollmentNo.toLowerCase() === effectiveEnrollment.toLowerCase() ||
        s.id === effectiveEnrollment
    );
    return found || students[0] || {
      id: 'std-230101010001',
      enrollmentNo: '230101010001',
      name: 'Aayush Verma',
      email: 'aayush.verma@students.omnicampus.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: 'Computer Science & AI',
      program: 'B.Tech Computer Science & AI',
      semester: 7,
      section: 'CS-A',
      cgpa: 3.84,
      attendancePct: 96.0,
      feeStatus: 'Paid',
      status: 'Active',
      mentor: 'Dr. Marcus Vance',
      phone: '+1 (555) 782-9012',
      admissionYear: 2023,
      creditsEarned: 132,
    };
  }, [students, effectiveEnrollment]);

  // Comprehensive Metrics for Active Student
  const studentMetrics: ComprehensiveStudentPerformance = useMemo(() => {
    return computeStudentComprehensivePerformance(
      activeStudent,
      studentAttendanceRecords,
      results,
      courses
    );
  }, [activeStudent, studentAttendanceRecords, results, courses]);

  // Cohort Analytics Summary (for Faculty Class-Wide View)
  const cohortAnalytics: CohortAnalyticsSummary = useMemo(() => {
    return computeCohortAnalytics(
      students,
      studentAttendanceRecords,
      results,
      courses,
      departmentFilter,
      semesterFilter
    );
  }, [students, studentAttendanceRecords, results, courses, departmentFilter, semesterFilter]);

  // Filtered Student List for Faculty/Admin Directory
  const filteredStudentsList = useMemo(() => {
    return students.filter((s) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.enrollmentNo.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q);

      // Department filter
      const matchDept = departmentFilter === 'all' || s.department === departmentFilter;

      // Semester filter
      const matchSem = semesterFilter === 0 || s.semester === semesterFilter;

      // Risk status filter
      let matchRisk = true;
      if (riskFilter === 'at-risk') {
        matchRisk = Number(s.attendancePct) < 75 || Number(s.cgpa) < 2.8;
      } else if (riskFilter === 'declining') {
        matchRisk = Number(s.cgpa) < 3.2;
      } else if (riskFilter === 'honors') {
        matchRisk = Number(s.cgpa) >= 3.75;
      }

      return matchSearch && matchDept && matchSem && matchRisk;
    });
  }, [students, searchQuery, departmentFilter, semesterFilter, riskFilter]);

  // Departments list for filter
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.department));
    return Array.from(set);
  }, [students]);

  // Assessment Component Breakdown for Donut Chart
  const assessmentDonutData = useMemo(() => {
    const subs = studentMetrics.subjectPerformances;
    const count = subs.length || 1;
    const internalAvg = Math.round((subs.reduce((acc, s) => acc + s.internalMarks, 0) / count) * 10) / 10;
    const midTermAvg = Math.round((subs.reduce((acc, s) => acc + s.midTermMarks, 0) / count) * 10) / 10;
    const endTermAvg = Math.round((subs.reduce((acc, s) => acc + s.endTermMarks, 0) / count) * 10) / 10;

    return [
      { name: 'Internal Assessment (30)', value: internalAvg, max: 30, color: '#6366F1' },
      { name: 'Mid-Term Exam (30)', value: midTermAvg, max: 30, color: '#F59E0B' },
      { name: 'End-Term Theory (40)', value: endTermAvg, max: 40, color: '#10B981' },
    ];
  }, [studentMetrics.subjectPerformances]);

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================

  // Export structured CSV / Excel report
  const handleExportCSV = () => {
    const rows = [
      ['UNIVERSITY ERP - STUDENT PERFORMANCE ANALYTICS DOSSIER'],
      [`Generated On: ${new Date().toLocaleString()}`],
      [`Student Name: ${activeStudent.name}`],
      [`Enrollment No: ${activeStudent.enrollmentNo}`],
      [`Department: ${activeStudent.department}`],
      [`Program: ${activeStudent.program}`],
      [`Semester: ${activeStudent.semester}`],
      [`Academic Advisor: ${activeStudent.mentor}`],
      [''],
      ['OVERALL PERFORMANCE KPIS'],
      ['Cumulative CGPA', `${studentMetrics.cgpa.toFixed(2)} / 4.00`],
      ['Latest SGPA', `${studentMetrics.latestSgpa.toFixed(2)} / 4.00`],
      ['Overall Attendance %', `${studentMetrics.overallAttendancePct}%`],
      ['Attended Sessions', studentMetrics.attendedSessions],
      ['Total Working Sessions', studentMetrics.totalWorkingSessions],
      ['Attendance Compliance Status', studentMetrics.isAttendanceEligible ? 'Eligible (>=75%)' : 'Shortfall (<75%)'],
      ['Average Subject Score', `${studentMetrics.averageScorePct}%`],
      ['Class Cohort Rank', `#${studentMetrics.rank} of ${studentMetrics.totalStudentsInCohort}`],
      ['Completed Assignments', `${studentMetrics.assignmentsSummary.completed} / ${studentMetrics.assignmentsSummary.total}`],
      [''],
      ['SUBJECT-WISE PERFORMANCE BREAKDOWN'],
      ['Course Code', 'Course Title', 'Credits', 'Internal (30)', 'Mid-Term (30)', 'End-Term (40)', 'Total (100)', 'Grade', 'GPA Equiv', 'Attendance %', 'Status'],
      ...studentMetrics.subjectPerformances.map((sp) => [
        sp.courseCode,
        sp.courseTitle,
        sp.credits,
        sp.internalMarks,
        sp.midTermMarks,
        sp.endTermMarks,
        sp.totalScore,
        sp.grade,
        sp.gpaEquivalent,
        `${sp.attendancePct}%`,
        sp.isWeakSubject ? 'Action Needed' : 'Proficient',
      ]),
      [''],
      ['SEMESTER PROGRESSION TRAJECTORY'],
      ['Semester', 'SGPA', 'CGPA', 'Credits Earned', 'Attendance %', 'Status'],
      ...studentMetrics.semesterProgression.map((sp) => [
        sp.semesterLabel,
        sp.sgpa > 0 ? sp.sgpa.toFixed(2) : 'N/A',
        sp.cgpa > 0 ? sp.cgpa.toFixed(2) : 'N/A',
        sp.creditsEarned,
        sp.attendancePct > 0 ? `${sp.attendancePct}%` : 'N/A',
        sp.status,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeStudent.name.replace(/\s+/g, '_')}_Performance_Dossier.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export printable formal institutional PDF
  const handlePrintPDF = () => {
    window.print();
  };

  // Loading state placeholder while syncing with database
  if (isAuthLoading) {
    return (
      <div className="space-y-5 animate-pulse p-4">
        <div className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6 animate-in fade-in duration-150', className)}>
      {/* ---------------------------------------------------- */}
      {/* 1. TOP HEADER & RBAC CONTROLS                        */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center font-black shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                Student Performance Analytics
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>University ERP Academic Evaluation System</span>
                <span aria-hidden="true">&bull;</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {role} Portal
                </span>
                <span aria-hidden="true">&bull;</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Database Synced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Faculty/Admin Mode Toggle: Individual Deep-Dive vs Cohort Comparison */}
          {role !== 'Student' && (
            <div className="relative inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('individual')}
                className={cn(
                  'relative z-10 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5',
                  viewMode === 'individual'
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {viewMode === 'individual' && (
                  <motion.div
                    layoutId="activePerformanceViewModePill"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <User className="w-3.5 h-3.5" />
                <span>Student Report</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cohort')}
                className={cn(
                  'relative z-10 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5',
                  viewMode === 'cohort'
                    ? 'text-slate-900 dark:text-white font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                )}
              >
                {viewMode === 'cohort' && (
                  <motion.div
                    layoutId="activePerformanceViewModePill"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200/60 dark:border-slate-700 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Users className="w-3.5 h-3.5" />
                <span>Class Comparison</span>
              </button>
            </div>
          )}

          {/* Time Horizon Switcher: Semester vs Monthly vs Yearly */}
          <div className="relative inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => setTimeHorizon('semester')}
              className={cn(
                'relative z-10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer',
                timeHorizon === 'semester'
                  ? 'text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              {timeHorizon === 'semester' && (
                <motion.div
                  layoutId="activePerformanceTimeHorizonPill"
                  className="absolute inset-0 bg-brand rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              Semester View
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('monthly')}
              className={cn(
                'relative z-10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer',
                timeHorizon === 'monthly'
                  ? 'text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              {timeHorizon === 'monthly' && (
                <motion.div
                  layoutId="activePerformanceTimeHorizonPill"
                  className="absolute inset-0 bg-brand rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              Monthly View
            </button>
            <button
              type="button"
              onClick={() => setTimeHorizon('yearly')}
              className={cn(
                'relative z-10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer',
                timeHorizon === 'yearly'
                  ? 'text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              )}
            >
              {timeHorizon === 'yearly' && (
                <motion.div
                  layoutId="activePerformanceTimeHorizonPill"
                  className="absolute inset-0 bg-brand rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              Yearly View
            </button>
          </div>

          {/* Export Options: CSV & PDF Transcript */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export detailed report to Excel / CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPDF}
            title="Print or save as official PDF Dossier"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-200" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. FACULTY FILTER & STUDENT SELECTOR DIRECTORY       */}
      {/* ---------------------------------------------------- */}
      {role !== 'Student' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                Faculty Student Directory & Risk Filters
              </h3>
              <span className="text-xs text-slate-400">
                ({filteredStudentsList.length} of {students.length} students enrolled)
              </span>
            </div>

            {/* Risk Category Filters */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setRiskFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border',
                  riskFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-slate-400'
                )}
              >
                All Students
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('at-risk')}
                className={cn(
                  'px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border flex items-center gap-1',
                  riskFilter === 'at-risk'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400'
                )}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Low Attendance (&lt;75%)</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('declining')}
                className={cn(
                  'px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border flex items-center gap-1',
                  riskFilter === 'declining'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400'
                )}
              >
                <ArrowDownRight className="w-3 h-3" />
                <span>Academic Focus Needed</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskFilter('honors')}
                className={cn(
                  'px-3 py-1 rounded-xl font-bold transition-all cursor-pointer border flex items-center gap-1',
                  riskFilter === 'honors'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400'
                )}
              >
                <Award className="w-3 h-3" />
                <span>Dean's List (CGPA &ge; 3.75)</span>
              </button>
            </div>
          </div>

          {/* Search Inputs & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search query */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or roll number..."
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <option value="all">All Academic Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <option value={0}>All Academic Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Inspected Student Selector */}
            <div>
              <select
                value={effectiveEnrollment}
                onChange={(e) => {
                  setSelectedEnrollment(e.target.value);
                  setViewMode('individual');
                }}
                className="w-full px-3.5 py-2 rounded-2xl bg-brand/10 dark:bg-brand/20 border border-brand/30 text-brand dark:text-brand-light text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
              >
                <optgroup label="Select Active Student For Deep Dive">
                  <option value="230101010001">⭐ Aayush Verma (230101010001)</option>
                  {students
                    .filter((s) => s.enrollmentNo !== '230101010001')
                    .map((s) => (
                      <option key={s.id} value={s.enrollmentNo}>
                        {s.name} ({s.enrollmentNo} - Sem {s.semester})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Quick Clickable Student Chips for Fast Switch OR Empty State */}
          {filteredStudentsList.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-500 font-semibold">
                No students match &ldquo;{searchQuery}&rdquo; with the selected department and semester filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDepartmentFilter('all');
                  setSemesterFilter(0);
                  setRiskFilter('all');
                }}
                className="px-3 py-1 rounded-xl bg-brand text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-brand/90 transition-all"
              >
                Reset Search &amp; Filters
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">
                Quick Switch:
              </span>
              {filteredStudentsList.slice(0, 7).map((s) => {
                const isSelected = s.enrollmentNo.toLowerCase() === effectiveEnrollment.toLowerCase();
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedEnrollment(s.enrollmentNo);
                      setViewMode('individual');
                    }}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer text-xs border',
                      isSelected
                        ? 'bg-brand text-white border-brand shadow-xs font-extrabold scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand/40'
                    )}
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                    <span>{s.name}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded font-mono',
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                      )}
                    >
                      CGPA {s.cgpa}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. COHORT CLASS-WIDE OVERVIEW VIEW (IF FACULTY SELECTED) */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'cohort' && role !== 'Student' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cohort KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Class Enrolled Cohort</span>
              <p className="text-2xl font-black text-slate-950 dark:text-white mt-1">
                {cohortAnalytics.totalStudents} Students
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {cohortAnalytics.department}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Average Attendance</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {cohortAnalytics.averageAttendancePct}%
              </p>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">
                Regulatory requirement &ge;75%
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">Cohort Average CGPA</span>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">
                {cohortAnalytics.averageCgpa.toFixed(2)} / 4.00
              </p>
              <span className="text-[11px] text-purple-600 mt-0.5 block">
                Grade A / Honors Benchmark
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                At-Risk Students (&lt;75%)
              </span>
              <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                {cohortAnalytics.atRiskCount} Flagged
              </p>
              <span className="text-[11px] text-rose-500 mt-0.5 block">
                Require academic counseling
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                Dean's List / High Achievers
              </span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {cohortAnalytics.honorsCount} Students
              </p>
              <span className="text-[11px] text-amber-600 mt-0.5 block">
                CGPA &ge; 3.75 &amp; Clean Attendance
              </span>
            </div>
          </div>

          {/* Cohort Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject-Wise Pass Rate & Average Marks */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    Subject Performance Distribution across Cohort
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Class average marks and pass percentages
                  </p>
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={cohortAnalytics.subjectAverages}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="courseCode" tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tickCount={6} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="averageMarks" name="Class Average Marks %" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="passRatePct" name="Pass Rate %" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Distribution across Cohort */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    Attendance Health Distribution
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cohort breakdown by statutory compliance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-800 block">Exemplary (&ge;85%)</span>
                  <p className="text-3xl font-black text-emerald-700 mt-1">
                    {cohortAnalytics.attendanceDistribution.high}
                  </p>
                  <span className="text-[11px] text-emerald-600">Students compliant</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 text-center">
                  <span className="text-xs font-bold text-indigo-800 block">Adequate (75%-84%)</span>
                  <p className="text-3xl font-black text-indigo-700 mt-1">
                    {cohortAnalytics.attendanceDistribution.adequate}
                  </p>
                  <span className="text-[11px] text-indigo-600">Meeting threshold</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-center">
                  <span className="text-xs font-bold text-rose-800 block">At-Risk (&lt;75%)</span>
                  <p className="text-3xl font-black text-rose-700 mt-1">
                    {cohortAnalytics.attendanceDistribution.atRisk}
                  </p>
                  <span className="text-[11px] text-rose-600">Shortfall flagged</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-white block">
                  Faculty Cohort Recommendations:
                </span>
                <p>
                  &bull; Schedule remedial lab sessions for students flagged in the At-Risk bucket before the upcoming Mid-Term examination.
                </p>
                <p>
                  &bull; Click any student in the directory above to open their detailed personalized performance dossier.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. INDIVIDUAL STUDENT DETAILED PERFORMANCE DOSSIER    */}
      {/* ---------------------------------------------------- */}
      {viewMode === 'individual' && (
        <motion.div
          ref={reportPrintRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* A. PERSONALIZED STUDENT PROFILE HERO BANNER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-300/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <img
                src={activeStudent.avatar}
                alt={activeStudent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand/30 shadow-xs shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg md:text-xl font-black text-slate-950 dark:text-white">
                    {activeStudent.name}
                  </h3>
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold">
                    {activeStudent.enrollmentNo}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2.5 py-0.5 rounded-lg font-bold border',
                      studentMetrics.isAttendanceEligible
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    )}
                  >
                    {studentMetrics.isAttendanceEligible ? 'Attendance Eligible' : 'Attendance Shortfall (<75%)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>{activeStudent.program}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Semester {activeStudent.semester} (Section {activeStudent.section})</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Mentor: {activeStudent.mentor}</span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Cohort Rank #{studentMetrics.rank} of {studentMetrics.totalStudentsInCohort}</span>
                </div>
              </div>
            </div>

            {/* Student Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => triggerDribbbleConfetti()}
                title="Celebrate academic progress and milestone achievements"
                className="px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-102 cursor-pointer active:scale-96"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Celebrate Standing</span>
              </button>

              {role === 'Student' ? (
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Personal Profile</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentUser.email}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setViewMode('cohort')}
                  className="px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:scale-102 active:scale-96"
                >
                  Back to Class Overview
                </button>
              )}
            </div>
          </div>

          {/* B. KPI CARDS: 5 ESSENTIAL ACADEMIC METRICS WITH DRIBBBLE SPOTLIGHT & COUNTERS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Overall Attendance */}
            <SpotlightCard
              spotlightColor={studentMetrics.isAttendanceEligible ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)'}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Overall Attendance
                </span>
                <AnimatedProgressRing
                  value={studentMetrics.overallAttendancePct}
                  size={42}
                  strokeWidth={4}
                  color={studentMetrics.isAttendanceEligible ? '#10B981' : '#F43F5E'}
                />
              </div>
              <p className={cn(
                'text-2xl md:text-3xl font-black mt-0.5',
                studentMetrics.isAttendanceEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              )}>
                <AnimatedCounter value={studentMetrics.overallAttendancePct} decimals={1} suffix="%" />
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{studentMetrics.attendedSessions} / {studentMetrics.totalWorkingSessions} Sessions</span>
                <span className={studentMetrics.isAttendanceEligible ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {studentMetrics.isAttendanceEligible ? '≥75% Req' : '<75% Min'}
                </span>
              </div>
            </SpotlightCard>

            {/* 2. Cumulative CGPA & Average Marks */}
            <SpotlightCard
              spotlightColor="rgba(139, 92, 246, 0.18)"
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  CGPA &amp; Standing
                </span>
                <AnimatedProgressRing
                  value={(studentMetrics.cgpa / 4.0) * 100}
                  size={42}
                  strokeWidth={4}
                  color="#8B5CF6"
                  showText={false}
                />
              </div>
              <p className="text-2xl md:text-3xl font-black text-purple-700 dark:text-purple-400 mt-0.5">
                <AnimatedCounter value={studentMetrics.cgpa} decimals={2} />
                <span className="text-xs text-slate-400 font-normal"> / 4.00</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Grade {studentMetrics.letterGrade}</span>
                <span className="font-bold text-purple-600">Avg {studentMetrics.averageScorePct}%</span>
              </div>
            </SpotlightCard>

            {/* 3. Highest Subject Score Achieved */}
            <SpotlightCard
              spotlightColor="rgba(99, 102, 241, 0.18)"
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1"
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Top Subject Score
              </span>
              <p className="text-2xl md:text-3xl font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
                <AnimatedCounter value={studentMetrics.highestScoreSubject.score} />
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </p>
              <div className="text-[11px] text-slate-500 truncate pt-1" title={studentMetrics.highestScoreSubject.subjectTitle}>
                {studentMetrics.highestScoreSubject.subjectCode} ({studentMetrics.highestScoreSubject.subjectTitle})
              </div>
            </SpotlightCard>

            {/* 4. Completed Assignments & Progress Ring */}
            <SpotlightCard
              spotlightColor="rgba(59, 130, 246, 0.18)"
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Assignments
                </span>
                <AnimatedProgressRing
                  value={studentMetrics.assignmentsSummary.completionRatePct}
                  size={42}
                  strokeWidth={4}
                  color="#3B82F6"
                />
              </div>
              <p className="text-2xl md:text-3xl font-black text-blue-700 dark:text-blue-400 mt-0.5">
                <AnimatedCounter value={studentMetrics.assignmentsSummary.completed} />
                <span className="text-xs text-slate-400 font-normal"> / {studentMetrics.assignmentsSummary.total}</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{studentMetrics.assignmentsSummary.completionRatePct}% Submitted</span>
                <span className="font-bold text-blue-600">{studentMetrics.assignmentsSummary.averageScorePct}% Avg</span>
              </div>
            </SpotlightCard>

            {/* 5. Performance Growth Delta */}
            <SpotlightCard
              spotlightColor={studentMetrics.growthDelta.sgpaChange >= 0 ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)'}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1 col-span-2 sm:col-span-1"
            >
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Semester Growth Delta
              </span>
              <p className={cn(
                'text-2xl md:text-3xl font-black mt-0.5 flex items-center gap-1',
                studentMetrics.growthDelta.sgpaChange >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              )}>
                {studentMetrics.growthDelta.sgpaChange >= 0 ? '+' : '-'}
                <AnimatedCounter value={Math.abs(studentMetrics.growthDelta.sgpaChange)} decimals={2} />
                <span className="text-xs text-slate-400 font-normal"> SGPA</span>
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                {studentMetrics.growthDelta.description}
              </div>
            </SpotlightCard>
          </div>

          {/* C. DIAGNOSTIC ALERTS & ADVISORY NOTICES */}
          {studentMetrics.alerts.length > 0 && (
            <div className="space-y-2.5">
              {studentMetrics.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs',
                    alert.severity === 'critical'
                      ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      {alert.severity === 'critical' ? (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Award className="w-5 h-5 text-emerald-600" />
                      )}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm">
                        {alert.title}
                      </h4>
                      <p className="mt-0.5 opacity-90 leading-relaxed">
                        {alert.message}
                      </p>
                      <p className="mt-1 font-semibold opacity-75">
                        <strong>Action Recommendation:</strong> {alert.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-auto">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-current shadow-2xs">
                      {alert.metricLabel}: {alert.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* D. VISUAL ANALYTICS ROW 1: CONCISE MONTHLY ATTENDANCE DONUT CHART & SUBJECT-WISE COMPARISON */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. ATTENDANCE ANALYTICS (CONCISE MONTHLY ATTENDANCE DONUT VIEW) */}
            <MonthlyAttendanceDonutChart
              student={activeStudent}
              records={studentAttendanceRecords}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4"
              title="Monthly Attendance Breakdown"
            />

            {/* 2. SUBJECT-WISE MARKS COMPARISON (STUDENT VS CLASS AVERAGE) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span>Subject-Wise Marks vs Class Average</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous evaluation &amp; end-semester score benchmarks
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {studentMetrics.subjectPerformances.length} Subjects Evaluated
                </span>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={studentMetrics.subjectPerformances}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="courseCode"
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="totalScore" name={`${activeStudent.name}'s Score`} fill="#6366F1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="classAverage" name="Class Average" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="highestScore" name="Top Achieved" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weak Subjects Identification Alert */}
              {studentMetrics.weakSubjects.length > 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Weak Subject Alert: Focus Required</span>
                  </div>
                  <p className="opacity-90">
                    {studentMetrics.weakSubjects.map((w) => `${w.courseCode} (${w.totalScore}%)`).join(', ')} falls below cohort expectation.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>All subjects maintain proficient standing above 70%. Excellent balanced mastery!</span>
                </div>
              )}
            </div>
          </div>

          {/* E. VISUAL ANALYTICS ROW 2: DYNAMIC HORIZON TRAJECTORY & ASSESSMENT DONUT CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. DYNAMIC TRAJECTORY CHART (SEMESTER / MONTHLY / YEARLY) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>
                      {timeHorizon === 'semester'
                        ? 'Semester-Wise SGPA Progression & CGPA Curve'
                        : timeHorizon === 'monthly'
                        ? 'Monthly Academic & Attendance Momentum'
                        : 'Multi-Year Growth & Credits Trajectory'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {timeHorizon === 'semester'
                      ? 'Progress across historical and active university semesters'
                      : timeHorizon === 'monthly'
                      ? 'Attendance turnout % & average subject score per month'
                      : 'Multi-year cumulative CGPA and completed degree credits'}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                  {timeHorizon === 'semester'
                    ? `Current CGPA: ${studentMetrics.cgpa.toFixed(2)}`
                    : timeHorizon === 'monthly'
                    ? `Latest Month: ${studentMetrics.monthlyProgress[studentMetrics.monthlyProgress.length - 1]?.attendancePct}% Att.`
                    : `Degree Credits: ${activeStudent.creditsEarned} / 160`}
                </span>
              </div>

              {/* Chart Canvas */}
              <div className="w-full h-72">
                {timeHorizon === 'semester' ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={studentMetrics.semesterProgression.filter((sp) => sp.status !== 'Upcoming')}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="sgpaGradDossier" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="semesterLabel" tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                      <YAxis domain={[2.5, 4.0]} tickCount={6} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                      <RechartsTooltip />
                      <Legend />
                      <ReferenceLine y={3.5} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Honors (3.50)', fill: '#10B981', fontSize: 10 }} />
                      <Area type="monotone" dataKey="sgpa" name="Semester SGPA" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#sgpaGradDossier)" dot={{ r: 4, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
                      <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#6366F1" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#6366F1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : timeHorizon === 'monthly' ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={studentMetrics.monthlyProgress}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="monthAttGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="monthName" tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                      <YAxis domain={[50, 100]} tickCount={6} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                      <RechartsTooltip />
                      <Legend />
                      <ReferenceLine y={75} stroke="#F43F5E" strokeDasharray="3 3" label={{ value: '75% Threshold', fill: '#F43F5E', fontSize: 10 }} />
                      <Area type="monotone" dataKey="attendancePct" name="Attendance Turnout %" stroke="#10B981" strokeWidth={2.5} fill="url(#monthAttGrad)" dot={{ r: 4, fill: '#10B981' }} />
                      <Line type="monotone" dataKey="averageMarks" name="Avg Subject Score %" stroke="#6366F1" strokeWidth={2} dot={{ r: 4, fill: '#6366F1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={studentMetrics.yearlyProgress}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="academicYear" tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }} />
                      <YAxis domain={[0, 4.0]} tickCount={5} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="cgpa" name="Cumulative CGPA" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Credits Completed: <strong>{activeStudent.creditsEarned} Credits</strong></span>
                <span>Degree Target: <strong>160 Credits</strong></span>
              </div>
            </div>

            {/* 4. ASSESSMENT COMPONENT BREAKDOWN DONUT CHART */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-indigo-600" />
                    <span>Evaluation Component Weightage Donut</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attained score distribution across syllabus components
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Continuous Assessment
                </span>
              </div>

              <div className="relative w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={assessmentDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {assessmentDonutData.map((entry, index) => (
                        <Cell key={`donut-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: number) => [`${val} pts`, 'Score Attained']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Central Score Callout */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-950 dark:text-white block">
                    {studentMetrics.averageScorePct}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Composite
                  </span>
                </div>
              </div>

              {/* Attained Component Summary Cards */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                {assessmentDonutData.map((comp) => (
                  <div
                    key={comp.name}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-[10px] text-slate-500 block truncate" title={comp.name}>
                      {comp.name.split('(')[0]}
                    </span>
                    <p className="text-sm font-black mt-0.5" style={{ color: comp.color }}>
                      {comp.value} / {comp.max}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {Math.round((comp.value / comp.max) * 100)}% attained
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VISUAL ANALYTICS ROW 3: ASSIGNMENTS & CONTINUOUS EVALUATION PROGRESS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Assignments &amp; Continuous Assessment Submissions</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Coding labs, research papers, and homework grading records
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-800">
                  {studentMetrics.assignmentsSummary.completed} / {studentMetrics.assignmentsSummary.total} Completed ({studentMetrics.assignmentsSummary.completionRatePct}%)
                </span>
              </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {studentMetrics.assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-xs flex items-start justify-between gap-3 shadow-2xs hover:border-brand/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] bg-brand text-white px-2 py-0.5 rounded-md">
                        {asg.courseCode}
                      </span>
                      <h5 className="font-bold text-slate-900 dark:text-white">
                        {asg.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Due: {asg.dueDate} {asg.submittedDate && `• Submitted: ${asg.submittedDate}`}
                    </p>
                    {asg.feedback && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 italic">
                        Feedback: &ldquo;{asg.feedback}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {asg.score !== undefined ? (
                      <div>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {asg.score} / {asg.maxScore}
                        </span>
                        <span className="block text-[10px] font-bold text-emerald-600">
                          Graded
                        </span>
                      </div>
                    ) : (
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-lg border',
                        asg.status === 'Submitted'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}>
                        {asg.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F. GRANULAR SUBJECT PERFORMANCE TABLE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand" />
                  <span>Curriculum Gradebook &amp; Subject Standing Detail</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comprehensive audit of internal assessments, mid-terms, final theory, and attendance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Subject / Code</th>
                    <th className="pb-3 text-center">Credits</th>
                    <th className="pb-3 text-center">Internal (30)</th>
                    <th className="pb-3 text-center">Mid-Term (30)</th>
                    <th className="pb-3 text-center">End-Term (40)</th>
                    <th className="pb-3 text-center">Total (100)</th>
                    <th className="pb-3 text-center">Grade</th>
                    <th className="pb-3 text-center">GPA</th>
                    <th className="pb-3 text-center">Attendance</th>
                    <th className="pb-3 text-right pr-2">Proficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentMetrics.subjectPerformances.map((sub) => (
                    <tr key={sub.courseCode} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pl-2">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {sub.courseTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {sub.courseCode} &bull; Instructor: {sub.instructor}
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {sub.credits}
                      </td>
                      <td className="py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {sub.internalMarks}
                      </td>
                      <td className="py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {sub.midTermMarks}
                      </td>
                      <td className="py-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {sub.endTermMarks}
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {sub.totalScore}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={cn(
                          'px-2 py-0.5 rounded-lg font-black text-xs border',
                          sub.grade === 'A+' || sub.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : sub.grade === 'B+' || sub.grade === 'B'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        )}>
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {sub.gpaEquivalent.toFixed(1)}
                      </td>
                      <td className="py-3 text-center font-bold">
                        <span className={sub.attendancePct >= 75 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                          {sub.attendancePct}%
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2">
                        {sub.isWeakSubject ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            Action Needed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-300">
                            <Check className="w-3 h-3" />
                            Proficient
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
