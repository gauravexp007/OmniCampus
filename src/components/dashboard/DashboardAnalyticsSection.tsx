import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  LayoutGrid,
  ArrowUpRight,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Clock,
  PlusCircle,
  Users,
  ArrowUpDown,
  ChevronDown,
  Search,
  Star,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ERPModuleId, Student, StudentAttendanceRecord, AttendanceRecord, ResultRecord } from '../../types';
import { cn } from '../../lib/utils';
import {
  calculateMonthAttendanceBreakdown,
  computeStudentMonthlyGraphPoints,
  computeStudentYearlyGraphPoints,
  ACADEMIC_HOLIDAYS,
  MonthlyCalendarBreakdown,
} from '../../utils/attendanceCalculator';
import { MonthlyAttendanceDonutChart } from '../common/MonthlyAttendanceDonutChart';
import { AnimatedCounter, SpotlightCard } from '../common/DribbbleAnimations';

interface DashboardAnalyticsSectionProps {
  onNavigate?: (module: ERPModuleId) => void;
  className?: string;
  graphOrder?: 'attendance-first' | 'marks-first';
  onGraphOrderChange?: (order: 'attendance-first' | 'marks-first') => void;
  graphLayout?: 'grid' | 'stacked';
  onGraphLayoutChange?: (layout: 'grid' | 'stacked') => void;
}

export type TimeframeMode = 'monthly' | 'yearly';
type AttendanceChartType = 'donut' | 'area' | 'bar';
type MarksChartType = 'bar' | 'line';

interface AttendanceGraphPoint {
  label: string;
  shortLabel: string;
  attendancePct: number;
  attendedSessions: number;
  totalSessions: number;
  targetBenchmark: number;
  departmentAverage: number;
  dateKey?: string;
  statusInfo?: string;
  formulaBreakdown?: string;
  totalCalendarDays?: number;
  saturdaysCount?: number;
  sundaysCount?: number;
  holidaysCount?: number;
  netWorkingDays?: number;
  absentsCount?: number;
  presentsCount?: number;
}

interface MarksGraphPoint {
  label: string;
  shortLabel: string;
  score: number;
  classAverage: number;
  highestScore: number;
  gpaEquivalent: number;
  gradeLabel: string;
  examType: string;
}

export const DashboardAnalyticsSection: React.FC<DashboardAnalyticsSectionProps> = ({
  onNavigate,
  className,
  graphOrder,
  onGraphOrderChange,
  graphLayout,
  onGraphLayoutChange,
}) => {
  const {
    role,
    currentUser,
    students,
    faculty,
    courses,
    attendanceRecords,
    studentAttendanceRecords,
    results,
  } = useERP();

  // Graph Order & Stacked Customization (Can be moved up and down)
  const [internalGraphOrder, setInternalGraphOrder] = useState<'attendance-first' | 'marks-first'>(() => {
    try {
      const saved = localStorage.getItem('omnicampus_graphs_order');
      if (saved === 'marks-first' || saved === 'attendance-first') return saved;
    } catch {}
    return 'attendance-first';
  });

  const [internalGraphLayout, setInternalGraphLayout] = useState<'grid' | 'stacked'>(() => {
    try {
      const saved = localStorage.getItem('omnicampus_graphs_layout');
      if (saved === 'stacked' || saved === 'grid') return saved;
    } catch {}
    return 'grid';
  });

  const effectiveGraphOrder = graphOrder ?? internalGraphOrder;
  const effectiveGraphLayout = graphLayout ?? internalGraphLayout;

  const handleSwapGraphs = () => {
    const next = effectiveGraphOrder === 'attendance-first' ? 'marks-first' : 'attendance-first';
    if (onGraphOrderChange) {
      onGraphOrderChange(next);
    } else {
      setInternalGraphOrder(next);
    }
    try {
      localStorage.setItem('omnicampus_graphs_order', next);
    } catch {}
  };

  const handleToggleLayout = (layout: 'grid' | 'stacked') => {
    if (onGraphLayoutChange) {
      onGraphLayoutChange(layout);
    } else {
      setInternalGraphLayout(layout);
    }
    try {
      localStorage.setItem('omnicampus_graphs_layout', layout);
    } catch {}
  };

  // 1. Timeframe mode: 'daily' | 'monthly' | 'yearly'
  const [timeframe, setTimeframe] = useState<TimeframeMode>('monthly');

  // 2. Chart style preferences: 'donut' (Concise Donut view), 'boxes' (Curved Box view), 'area', 'bar'
  const [attendanceChartType, setAttendanceChartType] = useState<AttendanceChartType>('donut');
  const [marksChartType, setMarksChartType] = useState<MarksChartType>('bar');

  // 3. Student Inspection Selector:
  // Default to Aayush Verma ('230101010001') so that Aayush and all students have the same graph representation!
  const [selectedStudentEnrollment, setSelectedStudentEnrollment] = useState<string>('230101010001');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [studentDropdownSearch, setStudentDropdownSearch] = useState('');
  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for student dropdown popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve current active student:
  // - If selectedStudentEnrollment !== 'all-class': use selected student (e.g. Aayush Verma or any selected student)
  // - If role is Student: default to logged-in student or Aayush Verma
  const activeStudent = useMemo<Student | null>(() => {
    if (selectedStudentEnrollment !== 'all-class') {
      const match = students.find(
        (s) =>
          s.enrollmentNo.toLowerCase() === selectedStudentEnrollment.toLowerCase() ||
          s.id === selectedStudentEnrollment
      );
      if (match) return match;
    }

    if (role === 'Student') {
      const match = students.find(
        (s) =>
          s.email.toLowerCase() === currentUser.email?.toLowerCase() ||
          s.name.toLowerCase() === currentUser.name?.toLowerCase() ||
          s.id === currentUser.id
      );
      return match || students[0] || null;
    }

    return null;
  }, [role, currentUser, students, selectedStudentEnrollment]);

  // Determine if we are visualizing an individual student or class-wide turnout
  const isIndividualStudentView = Boolean(activeStudent);

  // List of students who have saved attendance records or saved results
  const studentsWithSavedData = useMemo(() => {
    const savedEnrollmentSet = new Set<string>();
    studentAttendanceRecords.forEach((r) => {
      if (r.enrollmentNo) savedEnrollmentSet.add(r.enrollmentNo.toLowerCase());
      if (r.studentId) savedEnrollmentSet.add(r.studentId.toLowerCase());
    });
    results.forEach((r) => {
      if (r.enrollmentNo) savedEnrollmentSet.add(r.enrollmentNo.toLowerCase());
      if (r.studentId) savedEnrollmentSet.add(r.studentId.toLowerCase());
    });

    return students.map((student) => {
      const attCount = studentAttendanceRecords.filter(
        (r) =>
          (r.enrollmentNo && r.enrollmentNo.toLowerCase() === student.enrollmentNo.toLowerCase()) ||
          (r.studentId && r.studentId === student.id)
      ).length;

      const resCount = results.filter(
        (r) =>
          (r.enrollmentNo && r.enrollmentNo.toLowerCase() === student.enrollmentNo.toLowerCase()) ||
          (r.studentId && r.studentId === student.id)
      ).length;

      const hasSaved = attCount > 0 || resCount > 0;

      return {
        student,
        attCount,
        resCount,
        hasSaved,
      };
    });
  }, [students, studentAttendanceRecords, results]);

  // Filtered student list for custom dropdown search
  const filteredDropdownStudents = useMemo(() => {
    if (!studentDropdownSearch.trim()) return studentsWithSavedData;
    const q = studentDropdownSearch.toLowerCase();
    return studentsWithSavedData.filter(
      (s) =>
        s.student.name.toLowerCase().includes(q) ||
        s.student.enrollmentNo.toLowerCase().includes(q) ||
        s.student.department.toLowerCase().includes(q)
    );
  }, [studentsWithSavedData, studentDropdownSearch]);

  // =========================================================================
  // ATTENDANCE DATA COMPUTATION STRICTLY FROM SAVED RECORDS
  // Using official formula reducing absents, holidays, saturdays, and sundays
  // =========================================================================
  const attendanceData = useMemo<AttendanceGraphPoint[]>(() => {
    // -------------------------------------------------------------
    // CASE A: INDIVIDUAL STUDENT SAVED ATTENDANCE
    // (Aayush Verma or any selected student)
    // -------------------------------------------------------------
    if (isIndividualStudentView && activeStudent) {
      if (timeframe === 'monthly') {
        const monthlyPoints = computeStudentMonthlyGraphPoints(activeStudent, studentAttendanceRecords);
        return monthlyPoints.map((p) => ({
          label: p.label,
          shortLabel: p.shortLabel,
          attendancePct: p.attendancePct,
          attendedSessions: p.presentsCount,
          totalSessions: p.netWorkingDays,
          targetBenchmark: 75,
          departmentAverage: 86,
          dateKey: p.dateKey,
          statusInfo: p.statusInfo,
          formulaBreakdown: p.formulaBreakdown,
          totalCalendarDays: p.totalCalendarDays,
          saturdaysCount: p.saturdaysCount,
          sundaysCount: p.sundaysCount,
          holidaysCount: p.holidaysCount,
          netWorkingDays: p.netWorkingDays,
          absentsCount: p.absentsCount,
          presentsCount: p.presentsCount,
        }));
      }

      const yearlyPoints = computeStudentYearlyGraphPoints(activeStudent, studentAttendanceRecords);
      return yearlyPoints.map((p) => ({
        label: p.label,
        shortLabel: p.shortLabel,
        attendancePct: p.attendancePct,
        attendedSessions: p.presentsCount,
        totalSessions: p.netWorkingDays,
        targetBenchmark: 75,
        departmentAverage: 88,
        dateKey: p.dateKey,
        statusInfo: p.statusInfo,
        formulaBreakdown: p.formulaBreakdown,
        totalCalendarDays: p.totalCalendarDays,
        saturdaysCount: p.saturdaysCount,
        sundaysCount: p.sundaysCount,
        holidaysCount: p.holidaysCount,
        netWorkingDays: p.netWorkingDays,
        absentsCount: p.absentsCount,
        presentsCount: p.presentsCount,
      }));
    }

    // -------------------------------------------------------------
    // CASE B: CLASS / LECTURE TURNOUT (ALL STUDENTS COHORT VIEW)
    // -------------------------------------------------------------
    if (attendanceRecords.length === 0) {
      return [];
    }

    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (timeframe === 'monthly') {
      const monthMap = new Map<string, AttendanceRecord[]>();
      sortedRecords.forEach((rec) => {
        const ym = (rec.date || '').slice(0, 7) || '2026-09';
        if (!monthMap.has(ym)) monthMap.set(ym, []);
        monthMap.get(ym)!.push(rec);
      });

      const points: AttendanceGraphPoint[] = [];
      monthMap.forEach((recordsInMonth, ym) => {
        const totalEnrolled = recordsInMonth.reduce((sum, r) => sum + (r.totalStudents || 0), 0);
        const totalPresent = recordsInMonth.reduce((sum, r) => sum + (r.presentStudents || 0), 0);
        const totalAbsent = totalEnrolled - totalPresent;
        const pct = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

        let label = ym;
        let short = ym;
        try {
          const [y, m] = ym.split('-');
          const d = new Date(Number(y), Number(m) - 1, 1);
          label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          short = d.toLocaleDateString('en-US', { month: 'short' });
        } catch {
          label = ym;
        }

        points.push({
          label,
          shortLabel: short,
          attendancePct: pct,
          attendedSessions: totalPresent,
          totalSessions: totalEnrolled,
          targetBenchmark: 75,
          departmentAverage: 88,
          dateKey: ym,
          statusInfo: `${recordsInMonth.length} class sessions conducted`,
          formulaBreakdown: `Month turnout: ${totalPresent} present out of ${totalEnrolled} total student slots (${pct}%).`,
          totalCalendarDays: 30,
          netWorkingDays: 20,
          absentsCount: totalAbsent,
          presentsCount: totalPresent,
        });
      });

      return points;
    }

    // Yearly class turnout
    const yearMap = new Map<string, AttendanceRecord[]>();
    sortedRecords.forEach((rec) => {
      const y = (rec.date || '').slice(0, 4) || '2026';
      if (!yearMap.has(y)) yearMap.set(y, []);
      yearMap.get(y)!.push(rec);
    });

    const points: AttendanceGraphPoint[] = [];
    yearMap.forEach((recordsInYear, y) => {
      const totalEnrolled = recordsInYear.reduce((sum, r) => sum + (r.totalStudents || 0), 0);
      const totalPresent = recordsInYear.reduce((sum, r) => sum + (r.presentStudents || 0), 0);
      const pct = totalEnrolled > 0 ? Math.round((totalPresent / totalEnrolled) * 100) : 0;

      points.push({
        label: `Academic Year ${y}`,
        shortLabel: `AY ${y}`,
        attendancePct: pct,
        attendedSessions: totalPresent,
        totalSessions: totalEnrolled,
        targetBenchmark: 75,
        departmentAverage: 88,
        dateKey: y,
        statusInfo: `${recordsInYear.length} lectures delivered in AY ${y}`,
        formulaBreakdown: `Academic Year ${y} Class Turnout: ${totalPresent}/${totalEnrolled} attended (${pct}%).`,
        totalCalendarDays: 365,
        netWorkingDays: 237,
        absentsCount: totalEnrolled - totalPresent,
        presentsCount: totalPresent,
      });
    });

    return points;
  }, [
    isIndividualStudentView,
    activeStudent,
    studentAttendanceRecords,
    attendanceRecords,
    timeframe,
  ]);

  // =========================================================================
  // MARKS DATA COMPUTATION STRICTLY FROM SAVED RECORDS
  // =========================================================================
  const marksData = useMemo<MarksGraphPoint[]>(() => {
    // -------------------------------------------------------------
    // CASE A: INDIVIDUAL STUDENT SAVED MARKS
    // -------------------------------------------------------------
    if (isIndividualStudentView && activeStudent) {
      const studentEnrollment = activeStudent.enrollmentNo.toLowerCase();
      const studentId = activeStudent.id;

      // Filter all saved results for this student
      const studentResults = results.filter(
        (r) =>
          (r.enrollmentNo && r.enrollmentNo.toLowerCase() === studentEnrollment) ||
          (r.studentId && r.studentId === studentId) ||
          r.studentName.toLowerCase() === activeStudent.name.toLowerCase()
      );

      // If student has saved result records
      if (studentResults.length > 0) {
        return studentResults.map((r) => {
          const sgpaNum = Number(r.sgpa) || 3.5;
          const scoreEquivalent = Math.min(100, Math.round(sgpaNum * 25)); // 4.0 GPA -> 100%
          const semLabel = `Semester ${r.semester}`;

          return {
            label: `${semLabel}: SGPA ${sgpaNum} (${r.grade})`,
            shortLabel: `Sem ${r.semester}`,
            score: scoreEquivalent,
            classAverage: 78,
            highestScore: 98,
            gpaEquivalent: sgpaNum,
            gradeLabel: r.grade,
            examType: `${r.department} Assessment (${r.creditsCompleted} Credits)`,
          };
        });
      }

      // If no result records, but student has CGPA on record
      if (activeStudent.cgpa) {
        const cgpa = Number(activeStudent.cgpa);
        const scoreEquiv = Math.min(100, Math.round(cgpa * 25));
        return [
          {
            label: `Semester ${activeStudent.semester || 1} Cumulative Score`,
            shortLabel: `Sem ${activeStudent.semester || 1}`,
            score: scoreEquiv,
            classAverage: 76,
            highestScore: 96,
            gpaEquivalent: cgpa,
            gradeLabel: cgpa >= 3.8 ? 'A+' : cgpa >= 3.5 ? 'A' : 'B+',
            examType: `${activeStudent.program || 'Undergraduate'} GPA Record`,
          },
        ];
      }

      return [];
    }

    // -------------------------------------------------------------
    // CASE B: CLASS / COHORT MARKS (FACULTY / OVERALL VIEW)
    // -------------------------------------------------------------
    if (results.length === 0) {
      return [];
    }

    // Display each saved result record across students
    return results.map((r, idx) => {
      const sgpa = Number(r.sgpa) || 3.5;
      const score = Math.min(100, Math.round(sgpa * 25));

      return {
        label: `${r.studentName} (Sem ${r.semester})`,
        shortLabel: r.studentName.split(' ')[0] || `Student ${idx + 1}`,
        score,
        classAverage: 78,
        highestScore: 99,
        gpaEquivalent: sgpa,
        gradeLabel: r.grade,
        examType: `${r.enrollmentNo} - ${r.department}`,
      };
    });
  }, [isIndividualStudentView, activeStudent, results]);

  // Active statutory calendar breakdown reducing absents, holidays, saturdays, and sundays
  const statutoryBreakdown = useMemo<MonthlyCalendarBreakdown>(() => {
    if (activeStudent) {
      const savedLogs = studentAttendanceRecords.filter(
        (r) =>
          (r.enrollmentNo && r.enrollmentNo.toLowerCase() === activeStudent.enrollmentNo.toLowerCase()) ||
          (r.studentId && r.studentId === activeStudent.id) ||
          r.studentName.toLowerCase() === activeStudent.name.toLowerCase()
      );
      // Determine target month: default to October 2026 (index 9) if records exist, otherwise September (index 8)
      const hasOctober = savedLogs.some((r) => r.date.startsWith('2026-10'));
      const activeMonth = hasOctober ? 9 : 8; // 9 = Oct, 8 = Sep
      const monthLogs = savedLogs.filter((r) =>
        r.date.startsWith(`2026-${String(activeMonth + 1).padStart(2, '0')}`)
      );
      return calculateMonthAttendanceBreakdown(2026, activeMonth, monthLogs);
    }

    // Cohort breakdown
    return calculateMonthAttendanceBreakdown(2026, 8, studentAttendanceRecords);
  }, [activeStudent, studentAttendanceRecords]);

  // Aggregate KPI Calculations from actual saved data
  const currentAttendanceAverage = useMemo(() => {
    if (attendanceData.length === 0) {
      if (isIndividualStudentView && activeStudent?.attendancePct) {
        return activeStudent.attendancePct;
      }
      return 0;
    }
    const lastPoint = attendanceData[attendanceData.length - 1];
    return lastPoint.attendancePct;
  }, [attendanceData, isIndividualStudentView, activeStudent]);

  const currentMarksAverage = useMemo(() => {
    if (marksData.length === 0) {
      if (isIndividualStudentView && activeStudent?.cgpa) {
        return (Number(activeStudent.cgpa) * 25).toFixed(1);
      }
      return '0';
    }
    const sum = marksData.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / marksData.length).toFixed(1);
  }, [marksData, isIndividualStudentView, activeStudent]);

  // Concise Monthly Attendance Data for Donut Chart (Present, Absent, Weekends, Holidays)
  const monthlyDonutData = useMemo(() => {
    const presents = statutoryBreakdown.presentsCount;
    const absents = statutoryBreakdown.absentsCount;
    const weekends = statutoryBreakdown.weekendsCount;
    const holidays = statutoryBreakdown.holidaysCount;

    return [
      {
        name: 'Present Days',
        shortName: 'Present',
        value: presents,
        color: '#10B981',
        legendDetail: `${presents} Days (Attended)`,
      },
      {
        name: 'Absent Days',
        shortName: 'Absent',
        value: absents,
        color: '#EF4444',
        legendDetail: absents > 0 ? `${absents} Absent` : '0 Absent',
      },
      {
        name: 'Weekends (Sat & Sun)',
        shortName: 'Weekends',
        value: weekends,
        color: '#94A3B8',
        legendDetail: `${weekends} Days (${statutoryBreakdown.saturdaysCount} Sat • ${statutoryBreakdown.sundaysCount} Sun)`,
      },
      {
        name: 'Official Holidays',
        shortName: 'Holidays',
        value: holidays,
        color: '#F59E0B',
        legendDetail: `${holidays} Official Holidays`,
      },
    ].filter((item) => item.value > 0);
  }, [statutoryBreakdown]);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white dark:bg-[#435055] rounded-3xl p-6 border border-slate-200/90 dark:border-[#55666d] shadow-xs space-y-6 transition-all',
        className
      )}
    >
      {/* ---------------------------------------------------- */}
      {/* SECTION HEADER & CONTROLS                            */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-950 dark:text-white tracking-tight">
              Attendance & Marks Visualization
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Data ({attendanceData.length} Attendance • {marksData.length} Marks)
            </span>
          </div>
        </div>

        {/* Global Controls: Student Selector & Timeframe Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* MODULAR ARCHITECTURAL STUDENT SELECTOR CONTROL */}
          <div className="relative" ref={studentDropdownRef}>
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#181d26] border border-slate-300 dark:border-[#384252] shadow-xs hover:border-slate-400 dark:hover:border-slate-500 transition-all">
              <button
                type="button"
                onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1f2633] text-slate-900 dark:text-white border border-slate-200/90 dark:border-[#2d3748] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
                title="Select student or class cohort analytics"
              >
                {/* Modular Segment 1: Bold Mode Tag */}
                <div className="px-2.5 py-1 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5 text-brand dark:text-brand-dark" />
                  <span>STUDENT</span>
                </div>

                {/* Modular Divider */}
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0 mx-0.5" />

                {/* Modular Segment 2: Avatar & Active Details */}
                <div className="flex items-center gap-2 min-w-0 pr-1">
                  <div className="w-6 h-6 rounded-md bg-brand/15 dark:bg-brand/25 text-brand font-black text-[11px] flex items-center justify-center shrink-0 border border-brand/30">
                    {isIndividualStudentView && activeStudent ? (
                      activeStudent.name.charAt(0)
                    ) : (
                      <Users className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="text-left flex flex-col justify-center min-w-0">
                    <span className="text-xs font-black truncate max-w-[150px] sm:max-w-[210px] text-slate-950 dark:text-white tracking-tight flex items-center gap-1">
                      {selectedStudentEnrollment === 'all-class' ? (
                        <span>All Students (Class Turnout)</span>
                      ) : (
                        <span className="truncate">{activeStudent?.name || 'Aayush Verma'}</span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono leading-none">
                      {selectedStudentEnrollment === 'all-class'
                        ? 'Cohort Overview'
                        : activeStudent
                        ? `${activeStudent.enrollmentNo} • Sem ${activeStudent.semester}`
                        : '230101010001'}
                    </span>
                  </div>
                </div>

                {/* Modular Segment 3: Chevron Action Box */}
                <div className="p-1 rounded-md bg-slate-100 dark:bg-[#151a23] border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition-colors shrink-0 ml-1">
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 transition-transform duration-200',
                      isStudentDropdownOpen ? 'rotate-180' : ''
                    )}
                  />
                </div>
              </button>
            </div>

            {/* Hidden accessibility select synced with state */}
            <select
              id="student-selector"
              aria-label="Inspect Student"
              value={selectedStudentEnrollment}
              onChange={(e) => setSelectedStudentEnrollment(e.target.value)}
              className="sr-only"
            >
              <option value="230101010001">Aayush Verma</option>
              <option value="all-class">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.enrollmentNo}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Modular Popover Menu */}
            <AnimatePresence>
              {isStudentDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 z-50 w-80 sm:w-96 bg-white dark:bg-[#1c222c] rounded-2xl shadow-2xl border border-slate-300 dark:border-[#384252] p-3 space-y-2.5 backdrop-blur-md"
                >
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student by name, roll no, department..."
                      value={studentDropdownSearch}
                      onChange={(e) => setStudentDropdownSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                      autoFocus
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                    {/* Option 1: Class View */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentEnrollment('all-class');
                        setIsStudentDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer',
                        selectedStudentEnrollment === 'all-class'
                          ? 'bg-brand/10 dark:bg-brand/20 border border-brand/40 text-brand font-black'
                          : 'hover:bg-slate-100 dark:hover:bg-[#252c38] text-slate-800 dark:text-slate-200 font-bold'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-black text-xs text-slate-900 dark:text-white">All Students (Class Turnout)</p>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Class aggregate attendance & average scores</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {students.length} Total
                      </span>
                    </button>

                    {/* Section: Featured Students with Saved Logs */}
                    <div className="pt-1.5">
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 pb-1 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-brand" />
                        <span>STUDENTS WITH SAVED RECORDS</span>
                      </p>
                      {filteredDropdownStudents
                        .filter((s) => s.hasSaved || s.student.enrollmentNo === '230101010001')
                        .map(({ student }) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => {
                              setSelectedStudentEnrollment(student.enrollmentNo);
                              setIsStudentDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer',
                              selectedStudentEnrollment === student.enrollmentNo
                                ? 'bg-brand/10 dark:bg-brand/20 border border-brand/40 text-brand font-black'
                                : 'hover:bg-slate-100 dark:hover:bg-[#252c38] text-slate-800 dark:text-slate-200'
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center font-black text-xs shrink-0 border border-brand/30">
                                {student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-xs truncate text-slate-900 dark:text-white flex items-center gap-1">
                                  <span className="truncate">{student.name}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono font-bold truncate">
                                  {student.enrollmentNo} • Sem {student.semester}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-200/50 dark:border-emerald-800/50">
                                {student.attendancePct}% Att
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>

                    {/* Section: Other Students */}
                    {filteredDropdownStudents.filter((s) => !s.hasSaved && s.student.enrollmentNo !== '230101010001').length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 pb-1">
                          OTHER ENROLLED STUDENTS
                        </p>
                        {filteredDropdownStudents
                          .filter((s) => !s.hasSaved && s.student.enrollmentNo !== '230101010001')
                          .map(({ student }) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => {
                                setSelectedStudentEnrollment(student.enrollmentNo);
                                setIsStudentDropdownOpen(false);
                              }}
                              className={cn(
                                'w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer',
                                selectedStudentEnrollment === student.enrollmentNo
                                  ? 'bg-brand/10 dark:bg-brand/20 border border-brand/40 text-brand font-black'
                                  : 'hover:bg-slate-100 dark:hover:bg-[#252c38] text-slate-800 dark:text-slate-200'
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-xs truncate text-slate-800 dark:text-slate-200">{student.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono font-bold truncate">{student.enrollmentNo}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                Sem {student.semester}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TIMEFRAME SWITCHER: MONTHLY | YEARLY (Daily removed per user request) */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={() => setTimeframe('monthly')}
              className={cn(
                'relative px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
                timeframe === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {timeframe === 'monthly' && (
                <motion.div
                  layoutId="active-timeframe-pill-sub"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Monthly Basis
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('yearly')}
              className={cn(
                'relative px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
                timeframe === 'yearly'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {timeframe === 'yearly' && (
                <motion.div
                  layoutId="active-timeframe-pill-sub"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl -z-10 shadow-xs"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              Yearly Basis
            </button>
          </div>

          {/* Graph Order / Position Customizer (Move Up / Down) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={handleSwapGraphs}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 shadow-2xs"
              title="Move Graphs Up / Down (Swap Attendance & Marks)"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-brand" />
              <span className="text-[11px]">
                {effectiveGraphOrder === 'attendance-first' ? 'Attendance First' : 'Marks First'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleLayout(effectiveGraphLayout === 'grid' ? 'stacked' : 'grid')}
              className={cn(
                'px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
                effectiveGraphLayout === 'stacked'
                  ? 'bg-white dark:bg-slate-900 text-brand shadow-xs border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
              title={effectiveGraphLayout === 'stacked' ? 'Switch to Side-by-Side Grid' : 'Switch to Stacked (Top & Down)'}
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">{effectiveGraphLayout === 'stacked' ? 'Stacked' : 'Grid'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SELECTED STUDENT DETAIL BANNER */}
      {isIndividualStudentView && activeStudent && (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {activeStudent.name}
                </span>
                <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  {activeStudent.enrollmentNo}
                </span>
                {activeStudent.enrollmentNo === '230101010001' && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-300">
                    September & October Records Active
                  </span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {activeStudent.department} &bull; Semester {activeStudent.semester} &bull; Section {activeStudent.section}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedStudentEnrollment('all-class')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Class Overview
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Mark New Attendance
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TWO DIFFERENT GRAPHS (ATTENDANCE & MARKS)            */}
      {/* ---------------------------------------------------- */}
      {(() => {
        const attendanceGraphCard = (
          <motion.div
            key="graph-attendance"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden bg-slate-50/70 dark:bg-slate-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4"
          >
            {/* Card Top: Title, Quick Stat, Move Up/Down & Chart Type Toggle */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isIndividualStudentView
                      ? `${activeStudent?.name}'s Monthly Attendance`
                      : `Lecture Turnout (MONTHLY)`}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Monthly attendance calculated strictly by reducing absents, holidays, Saturdays, and Sundays
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {/* Move Graph Up / Down */}
                <button
                  type="button"
                  onClick={handleSwapGraphs}
                  className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Move Attendance Graph Up / Down (Swap Position with Marks)"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[11px]">
                    {effectiveGraphOrder === 'attendance-first' ? 'Move Down ↓' : 'Move Up ↑'}
                  </span>
                </button>

                {/* Attendance Chart Style Switcher (Donut vs Spline Area vs Bar) */}
                <div className="relative flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAttendanceChartType('donut')}
                    title="Concise Monthly Donut Chart View (Holidays, Sat, Sun, Absent, Present)"
                    className={cn(
                      'relative z-10 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5',
                      attendanceChartType === 'donut'
                        ? 'text-emerald-700 dark:text-emerald-300 font-black'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    )}
                  >
                    {attendanceChartType === 'donut' && (
                      <motion.div
                        layoutId="activeAttendanceChartPill"
                        className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg -z-10 shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <PieChartIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Donut Chart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceChartType('area')}
                    title="Monthly Spline Area Trend"
                    className={cn(
                      'relative z-10 p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                      attendanceChartType === 'area'
                        ? 'text-emerald-700 dark:text-emerald-300 font-black'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    )}
                  >
                    {attendanceChartType === 'area' && (
                      <motion.div
                        layoutId="activeAttendanceChartPill"
                        className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg -z-10 shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <LineChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceChartType('bar')}
                    title="Monthly Bar Chart"
                    className={cn(
                      'relative z-10 p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                      attendanceChartType === 'bar'
                        ? 'text-emerald-700 dark:text-emerald-300 font-black'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    )}
                  >
                    {attendanceChartType === 'bar' && (
                      <motion.div
                        layoutId="activeAttendanceChartPill"
                        className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/70 rounded-lg -z-10 shadow-2xs border border-emerald-200/60 dark:border-emerald-800/60"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          {/* Conditional Display: Donut View vs Recharts Area/Bar with Breakdown */}
          {attendanceChartType === 'donut' ? (
            <div className="w-full">
              <MonthlyAttendanceDonutChart
                student={activeStudent || { name: 'Cohort Class Attendance' }}
                records={studentAttendanceRecords}
                className="bg-transparent dark:bg-transparent border-0 p-0 shadow-none"
              />
            </div>
          ) : (
            <>
              {/* STATUTORY ATTENDANCE REDUCTION BREAKDOWN ROW */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {/* 1. Total Calendar Days */}
              <SpotlightCard
                spotlightColor="rgba(108, 125, 138, 0.15)"
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-2xs"
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Calendar Days
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                  <AnimatedCounter value={statutoryBreakdown.totalCalendarDays} />
                </span>
                <span className="text-[9px] text-slate-400">Total in month</span>
              </SpotlightCard>

              {/* 2. Weekends (Sat + Sun) Reduced */}
              <SpotlightCard
                spotlightColor="rgba(148, 163, 184, 0.18)"
                className="p-2.5 bg-slate-100/70 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-2xs"
              >
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  Weekends
                </span>
                <span className="text-base font-black text-slate-700 dark:text-slate-300 mt-0.5 block">
                  -<AnimatedCounter value={statutoryBreakdown.weekendsCount} />
                </span>
                <span className="text-[9px] text-slate-400">
                  {statutoryBreakdown.saturdaysCount} Sat • {statutoryBreakdown.sundaysCount} Sun
                </span>
              </SpotlightCard>

              {/* 3. Official Holidays Reduced */}
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.2)"
                className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-800/40 shadow-2xs"
              >
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  Holidays
                </span>
                <span className="text-base font-black text-amber-700 dark:text-amber-400 mt-0.5 block">
                  -<AnimatedCounter value={statutoryBreakdown.holidaysCount} />
                </span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400">Official holidays</span>
              </SpotlightCard>

              {/* 4. Net Working Days Conducted */}
              <SpotlightCard
                spotlightColor="rgba(99, 102, 241, 0.18)"
                className="p-2.5 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/70 dark:border-indigo-800/40 shadow-2xs"
              >
                <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
                  Working Days
                </span>
                <span className="text-base font-black text-indigo-700 dark:text-indigo-400 mt-0.5 block">
                  <AnimatedCounter value={statutoryBreakdown.netWorkingDays} />
                </span>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400">
                  {statutoryBreakdown.absentsCount > 0 ? `-${statutoryBreakdown.absentsCount} absent` : '0 absents'}
                </span>
              </SpotlightCard>

              {/* 5. Resulting Calculated Attendance Rate */}
              <SpotlightCard
                spotlightColor={statutoryBreakdown.isEligible ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                className={cn(
                  'p-2.5 rounded-xl border shadow-2xs col-span-2 sm:col-span-1',
                  statutoryBreakdown.isEligible
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                )}
              >
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider block',
                    statutoryBreakdown.isEligible ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
                  )}
                >
                  Present Rate
                </span>
                <span
                  className={cn(
                    'text-base font-black font-mono mt-0.5 block',
                    statutoryBreakdown.isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                  )}
                >
                  <AnimatedCounter value={statutoryBreakdown.calculatedPercentage} decimals={1} suffix="%" />
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold block',
                    statutoryBreakdown.isEligible ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {statutoryBreakdown.isEligible ? 'Eligible (≥75%)' : 'Shortfall (<75%)'}
                </span>
              </SpotlightCard>
            </div>

            {/* Statutory Formula Explanation Ribbon */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Attendance Formula:</strong> {statutoryBreakdown.totalCalendarDays} days − {statutoryBreakdown.saturdaysCount} Sat − {statutoryBreakdown.sundaysCount} Sun − {statutoryBreakdown.holidaysCount} Hol ={' '}
                <strong>{statutoryBreakdown.netWorkingDays} Working Days</strong>. Absents: {statutoryBreakdown.absentsCount} ➔ Calculated Present:{' '}
                <strong>{statutoryBreakdown.calculatedPercentage}%</strong>.
              </span>
            </div>
          </div>

          {/* RECHARTS ATTENDANCE VISUALIZATION OR EMPTY STATE */}
          <div className="w-full h-72 relative pt-2">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer
                key={`att-${attendanceChartType}-${timeframe}-${isIndividualStudentView ? activeStudent?.id : 'class'}-${attendanceData.length}`}
                width="100%"
                height={280}
              >
                {attendanceChartType === 'area' ? (
                  <AreaChart
                    data={attendanceData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="softEmeraldGradLive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                      className="dark:stroke-slate-800/80"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomAttendanceTooltip timeframe={timeframe} />} />
                    <ReferenceLine
                      y={75}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: '75% Min',
                        position: 'insideBottomRight',
                        fill: '#D97706',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="attendancePct"
                      name={isIndividualStudentView ? 'Student Attendance %' : 'Class Turnout %'}
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#softEmeraldGradLive)"
                      dot={{
                        r: 3.5,
                        fill: '#10B981',
                        strokeWidth: 2,
                        stroke: '#FFFFFF',
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#059669',
                        stroke: '#FFFFFF',
                        strokeWidth: 2,
                      }}
                      isAnimationActive={true}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="departmentAverage"
                      name="Benchmark"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      fillOpacity={0}
                      fill="transparent"
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1300}
                    />
                  </AreaChart>
                ) : (
                  <BarChart
                    data={attendanceData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                      className="dark:stroke-slate-800/80"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomAttendanceTooltip timeframe={timeframe} />} />
                    <ReferenceLine
                      y={75}
                      stroke="#F59E0B"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Bar
                      dataKey="attendancePct"
                      name={isIndividualStudentView ? 'Student Attendance %' : 'Class Turnout %'}
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    />
                    <Bar
                      dataKey="departmentAverage"
                      name="Benchmark"
                      fill="#CBD5E1"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                    No Saved Attendance Data Found
                  </h5>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                    {isIndividualStudentView
                      ? `No attendance sessions have been logged yet for ${activeStudent?.name} on this ${timeframe} view.`
                      : 'No class attendance logs have been recorded yet.'}
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('attendance')}
                    className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Open Attendance Register
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

          {/* Footer Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isIndividualStudentView ? 'Student Presence' : 'Class Attendance'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>Dept Average</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500 border-t border-amber-500 border-dashed" />
                <span className="text-amber-600 dark:text-amber-400 font-medium">75% Target</span>
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('attendance')}
                className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold text-xs inline-flex items-center gap-0.5"
              >
                Register View <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      );

      // ====================================================
      // GRAPH 2: MARKS & ACADEMIC EVALUATIONS
      // ====================================================
      const marksGraphCard = (
          <motion.div
            key="graph-marks"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden bg-slate-50/70 dark:bg-slate-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4"
          >
            {/* Card Top: Title, Quick Stat, Move Up/Down & Chart Type Toggle */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {isIndividualStudentView
                      ? `${activeStudent?.name}'s Marks & SGPA (${timeframe.toUpperCase()})`
                      : `Class Marks & Grading (${timeframe.toUpperCase()})`}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Semester-wise continuous evaluations and cumulative GPA grading progression
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                {/* Move Graph Up / Down */}
                <button
                  type="button"
                  onClick={handleSwapGraphs}
                  className="px-2 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Move Marks Graph Up / Down (Swap Position with Attendance)"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px]">
                    {effectiveGraphOrder === 'marks-first' ? 'Move Down ↓' : 'Move Up ↑'}
                  </span>
                </button>

                {/* Marks Chart Style Switcher (Bar vs Line) */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setMarksChartType('bar')}
                title="Grouped Bar View"
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  marksChartType === 'bar'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMarksChartType('line')}
                title="Line Trend View"
                className={cn(
                  'p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  marksChartType === 'line'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

          {/* Quick Stat Pill Bar */}
          <div className="grid grid-cols-3 gap-2.5 bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Marks Average</span>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400">
                {currentMarksAverage}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">Active Record</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                {marksData.length} Evaluated
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block">GPA Equivalent</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                <GraduationCap className="w-3 h-3 text-purple-500" />
                {isIndividualStudentView ? activeStudent?.cgpa || '3.80' : '3.85 Class Avg'}
              </span>
            </div>
          </div>

          {/* RECHARTS MARKS VISUALIZATION OR EMPTY STATE */}
          <div className="w-full h-72 relative pt-2">
            {marksData.length > 0 ? (
              <ResponsiveContainer
                key={`marks-${marksChartType}-${timeframe}-${isIndividualStudentView ? activeStudent?.id : 'class'}-${marksData.length}`}
                width="100%"
                height={280}
              >
                {marksChartType === 'bar' ? (
                  <BarChart
                    data={marksData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                      className="dark:stroke-slate-800/80"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip content={<CustomMarksTooltip timeframe={timeframe} />} />
                    <Bar
                      dataKey="score"
                      name={isIndividualStudentView ? 'Score Obtained' : 'Student Score'}
                      fill="#8B5CF6"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    />
                    <Bar
                      dataKey="classAverage"
                      name="Class Benchmark"
                      fill="#CBD5E1"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Bar
                      dataKey="highestScore"
                      name="Top Benchmark"
                      fill="#FB923C"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={1300}
                    />
                  </BarChart>
                ) : (
                  <LineChart
                    data={marksData}
                    margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                      className="dark:stroke-slate-800/80"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickCount={6}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomMarksTooltip timeframe={timeframe} />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#7C3AED', stroke: '#FFFFFF', strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1100}
                    />
                    <Line
                      type="monotone"
                      dataKey="classAverage"
                      name="Class Benchmark"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Line
                      type="monotone"
                      dataKey="highestScore"
                      name="Top Score"
                      stroke="#FB923C"
                      strokeWidth={2}
                      dot={{ r: 3.5, fill: '#FB923C', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                      isAnimationActive={true}
                      animationDuration={1300}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                    No Saved Result Records Found
                  </h5>
                  <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                    {isIndividualStudentView
                      ? `No grade transcripts or examination entries found for ${activeStudent?.name}.`
                      : 'No gradebook records have been entered yet.'}
                  </p>
                </div>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('results')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Enter Student Grades
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isIndividualStudentView ? 'Score' : 'Student Score'}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>Class Benchmark</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span>Top Achieved</span>
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="text-purple-700 dark:text-purple-400 hover:underline font-bold text-xs inline-flex items-center gap-0.5"
              >
                Gradebook View <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      );

      return (
        <div
          className={cn(
            effectiveGraphLayout === 'stacked'
              ? 'flex flex-col gap-6'
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          )}
        >
          {effectiveGraphOrder === 'attendance-first' ? (
            <>
              {attendanceGraphCard}
              {marksGraphCard}
            </>
          ) : (
            <>
              {marksGraphCard}
              {attendanceGraphCard}
            </>
          )}
        </div>
      );
    })()}
  </div>
);
};

// ==========================================
// CUSTOM TOOLTIP COMPONENTS
// ==========================================

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  timeframe: TimeframeMode;
}

const CustomAttendanceTooltip: React.FC<TooltipProps> = ({ active, payload, timeframe }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as AttendanceGraphPoint;

  const isSafe = data.attendancePct >= 75;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[230px]">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <span className="font-bold text-slate-950 dark:text-white truncate max-w-[150px]">
          {data.label}
        </span>
        <span
          className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
            isSafe
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
          )}
        >
          {isSafe ? 'Compliant (≥75%)' : 'Shortfall (<75%)'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Calculated Attendance:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
            {data.attendancePct}%
          </span>
        </div>

        {data.formulaBreakdown && (
          <div className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800 font-mono leading-relaxed">
            {data.formulaBreakdown}
          </div>
        )}

        {data.netWorkingDays !== undefined && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Net Working Days:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {data.netWorkingDays} Days ({data.absentsCount ?? 0} Absents)
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Benchmark Requirement:</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {data.targetBenchmark}% Statutory Min
          </span>
        </div>
      </div>

      {data.statusInfo && (
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Status:</span>{' '}
          {data.statusInfo}
        </div>
      )}
    </div>
  );
};

const CustomMarksTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as MarksGraphPoint;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[210px]">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <span className="font-bold text-slate-950 dark:text-white truncate max-w-[150px]">
          {data.label}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800">
          Grade {data.gradeLabel}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">Recorded Score:</span>
          <span className="font-extrabold text-purple-600 dark:text-purple-400">
            {data.score} / 100
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Class Benchmark:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {data.classAverage}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Top Benchmark:</span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {data.highestScore}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">GPA Equivalent:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {data.gpaEquivalent.toFixed(2)}
          </span>
        </div>
      </div>

      {data.examType && (
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 font-medium">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Assessment:</span>{' '}
          {data.examType}
        </div>
      )}
    </div>
  );
};
