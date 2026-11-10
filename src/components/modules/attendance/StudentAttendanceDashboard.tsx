import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  Bell,
  AlertTriangle,
  Award,
  Filter,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { motion } from 'motion/react';
import { StudentAttendanceRecord, Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { StudentMonthlyAttendanceVisualizer } from './StudentMonthlyAttendanceVisualizer';
import { MonthlyAttendanceDonutChart } from '../../common/MonthlyAttendanceDonutChart';
import {
  SpotlightCard,
  AnimatedCounter,
  triggerDribbbleConfetti,
} from '../../common/DribbbleAnimations';

export const StudentAttendanceDashboard: React.FC = () => {
  const {
    studentAttendanceRecords,
    addStudentAttendanceRecord,
    notifications,
    markNotificationAsRead,
    currentUser,
    students,
  } = useERP();

  // View Mode: Overview vs Monthly Visual Calendar
  const [viewMode, setViewMode] = useState<'overview' | 'monthly'>('overview');

  // Self Check-in Modal State
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInCourse, setCheckInCourse] = useState('CS-301');
  const [checkInRemarks, setCheckInRemarks] = useState('Attended lecture');

  // Filter state for history table
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Identify current student from context or active student
  // Check if currentUser matches a student in students or has enrollmentNo
  const activeStudent: Student = useMemo(() => {
    // Look for matching student in students array
    const matched = students.find(
      (s) =>
        (currentUser?.idNumber && s.enrollmentNo.toLowerCase() === currentUser.idNumber.toLowerCase()) ||
        (currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        s.name.toLowerCase() === (currentUser?.name || '').toLowerCase()
    );

    if (matched) return matched;

    // If no match but students exist, pick first
    if (students.length > 0) return students[0];

    // Fallback virtual student
    return {
      id: 'stu-default-084',
      enrollmentNo: currentUser?.idNumber || 'OMNI-2024-CS-084',
      name: currentUser?.name || 'Aria Chen',
      email: currentUser?.email || 'aria.chen@student.university.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: 'Computer Science & AI',
      program: 'B.Tech in Artificial Intelligence',
      semester: 6,
      section: 'CS-A',
      cgpa: 3.92,
      attendancePct: 92.5,
      feeStatus: 'Paid',
      status: 'Active',
      mentor: 'Dr. Marcus Vance',
      phone: '+1 (555) 234-8910',
      admissionYear: 2024,
      creditsEarned: 112,
    };
  }, [students, currentUser]);

  // Attendance records strictly belonging to this student
  const studentRecords = useMemo(() => {
    return studentAttendanceRecords.filter((r) => {
      const matchId = r.studentId && r.studentId === activeStudent.id;
      const matchRoll =
        r.enrollmentNo &&
        activeStudent.enrollmentNo &&
        r.enrollmentNo.toLowerCase() === activeStudent.enrollmentNo.toLowerCase();
      const matchName =
        r.studentName &&
        activeStudent.name &&
        r.studentName.toLowerCase() === activeStudent.name.toLowerCase();

      return matchId || matchRoll || matchName;
    });
  }, [studentAttendanceRecords, activeStudent]);

  // Notifications targeted to this student
  const studentNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (n.recipientRole && n.recipientRole !== 'Student' && n.recipientRole !== 'All') {
        return false;
      }
      if (n.recipientId && activeStudent.enrollmentNo && n.recipientId !== activeStudent.enrollmentNo) {
        return false;
      }
      return true;
    });
  }, [notifications, activeStudent]);

  // Total Calculations
  const totalClasses = studentRecords.length;
  const totalPresent = studentRecords.filter((r) => r.status === 'Present').length;
  const totalAbsent = studentRecords.filter((r) => r.status === 'Absent').length;
  const totalLate = studentRecords.filter((r) => r.status === 'Late').length;

  const attendanceRate =
    totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(1) : '100.0';

  const isEligible = Number(attendanceRate) >= 75.0;

  // Subject-wise grouping
  const courseBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        courseCode: string;
        courseTitle: string;
        total: number;
        present: number;
        absent: number;
        late: number;
      }
    >();

    studentRecords.forEach((r) => {
      const code = r.courseCode || 'GENERAL';
      const curr = map.get(code) || {
        courseCode: code,
        courseTitle: r.courseTitle || code,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
      };

      curr.total += 1;
      if (r.status === 'Present') curr.present += 1;
      else if (r.status === 'Absent') curr.absent += 1;
      else if (r.status === 'Late') curr.late += 1;

      map.set(code, curr);
    });

    return Array.from(map.values());
  }, [studentRecords]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return studentRecords.filter((r) => {
      if (statusFilter === 'present' && r.status !== 'Present') return false;
      if (statusFilter === 'absent' && r.status !== 'Absent') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.courseTitle.toLowerCase().includes(q) ||
          r.courseCode.toLowerCase().includes(q) ||
          (r.facultyName && r.facultyName.toLowerCase().includes(q)) ||
          r.date.includes(q)
        );
      }
      return true;
    });
  }, [studentRecords, statusFilter, searchQuery]);

  // Self Check In
  const handleSelfCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const courseTitleMap: Record<string, string> = {
      'CS-301': 'Distributed Database Systems',
      'CS-302': 'Neural Networks & Deep Learning',
      'CS-304': 'Operating Systems & Concurrency',
    };

    addStudentAttendanceRecord({
      id: `stu-att-${Date.now()}`,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      enrollmentNo: activeStudent.enrollmentNo,
      avatar: activeStudent.avatar,
      department: activeStudent.department,
      courseCode: checkInCourse,
      courseTitle: courseTitleMap[checkInCourse] || 'Distributed Database Systems',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '09:00 AM - 10:30 AM',
      status: 'Present',
      markedBy: 'Student',
      remarks: checkInRemarks,
      timestamp: Date.now(),
    });

    setIsCheckInModalOpen(false);
    triggerDribbbleConfetti(0.5, 0.4);
  };

  return (
    <div className="space-y-4">
      {/* 1. STUDENT HEADER & PROFILE BANNER */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => setViewMode(viewMode === 'monthly' ? 'overview' : 'monthly')}
            className="cursor-pointer group flex items-center gap-3.5"
            title="Click to view monthly attendance visualizer"
          >
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-12 h-12 rounded-full border-2 border-brand/30 group-hover:border-brand object-cover shrink-0 shadow-xs transition-all"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand group-hover:underline transition-colors flex items-center gap-1.5">
                  <span>{activeStudent.name}</span>
                  <span className="text-xs font-normal text-brand bg-brand-light px-2 py-0.5 rounded-full border border-brand/20">
                    {viewMode === 'monthly' ? 'Viewing Monthly Calendar' : 'Click for Monthly View'}
                  </span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-brand-light text-brand border border-brand/20">
                  {activeStudent.enrollmentNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                  Semester {activeStudent.semester} ({activeStudent.section})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeStudent.program} • {activeStudent.department}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="relative flex items-center gap-1 bg-slate-100 dark:bg-[#1e2229] p-1 rounded-xl border border-slate-200/80 dark:border-[#373e4b] shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className={cn(
                'relative z-10 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                viewMode === 'overview'
                  ? 'text-slate-900 dark:text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {viewMode === 'overview' && (
                <motion.div
                  layoutId="studentAttendanceTabPill"
                  className="absolute inset-0 bg-white dark:bg-[#2d3442] rounded-lg shadow-2xs border border-slate-200/60 dark:border-[#475569] -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              Summary Overview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={cn(
                'relative z-10 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                viewMode === 'monthly'
                  ? 'text-slate-900 dark:text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {viewMode === 'monthly' && (
                <motion.div
                  layoutId="studentAttendanceTabPill"
                  className="absolute inset-0 bg-white dark:bg-[#2d3442] rounded-lg shadow-2xs border border-slate-200/60 dark:border-[#475569] -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              Monthly Visual Calendar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:brightness-105 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mark Self Check-In</span>
          </button>
        </div>
      </div>

      {/* If viewMode is monthly, show the specialized visualizer */}
      {viewMode === 'monthly' ? (
        <StudentMonthlyAttendanceVisualizer initialStudent={activeStudent} />
      ) : (
        <>

      {/* 3. TOTAL ATTENDANCE KPI CARDS WITH EXPLICIT PRESENT & ABSENT SEPARATION */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Lectures Held */}
        <SpotlightCard
          spotlightColor="rgba(108, 125, 138, 0.15)"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Lectures
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              <AnimatedCounter value={totalClasses} />
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded sessions</p>
          </div>
          <span className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <BookOpen className="w-5 h-5" />
          </span>
        </SpotlightCard>

        {/* Total Present (Bold Emerald Green) */}
        <SpotlightCard
          spotlightColor="rgba(34, 197, 94, 0.2)"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/20 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Present
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
              <AnimatedCounter value={totalPresent} />
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium mt-0.5">Classes attended</p>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </SpotlightCard>

        {/* Total Absent (Bold Rose Red) */}
        <SpotlightCard
          spotlightColor="rgba(239, 68, 68, 0.2)"
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200/90 dark:border-rose-800/80 bg-rose-50/20 shadow-xs flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Total Absent
            </p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-0.5">
              <AnimatedCounter value={totalAbsent} />
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-500 font-medium mt-0.5">Classes missed</p>
          </div>
          <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-5 h-5" />
          </span>
        </SpotlightCard>

        {/* Overall Percentage */}
        <SpotlightCard
          spotlightColor={isEligible ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Attendance Rate
            </p>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded border',
                isEligible
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              )}
            >
              {isEligible ? 'Eligible (≥75%)' : 'Shortage (<75%)'}
            </span>
          </div>

          <div className="mt-2">
            <p
              className={cn(
                'text-2xl font-black font-mono',
                isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              )}
            >
              <AnimatedCounter value={Number(attendanceRate) || 0} decimals={1} suffix="%" />
            </p>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isEligible ? 'bg-emerald-500' : 'bg-rose-500'
                )}
                style={{ width: `${Math.min(100, Number(attendanceRate))}%` }}
              />
            </div>
          </div>
        </SpotlightCard>
      </div>

      {/* 3.5 CONCISE MONTHLY ATTENDANCE DONUT REPORT: (HOLIDAYS, SATURDAYS, SUNDAYS, ABSENT, PRESENT) */}
      <MonthlyAttendanceDonutChart
        student={activeStudent}
        records={studentAttendanceRecords}
      />

      {/* 4. COURSE-WISE ATTENDANCE BREAKDOWN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-light text-brand border border-brand/20">
              <BookOpen className="w-4 h-4" />
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              Course-Wise Attendance Summary
            </h4>
          </div>
          <span className="text-xs text-slate-500">Minimum 75% required for examination hall ticket</span>
        </div>

        {courseBreakdown.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No course records registered yet. Records marked by your teachers will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Course Code & Title</th>
                  <th className="py-2.5 px-3 text-center">Total Held</th>
                  <th className="py-2.5 px-3 text-center">
                    <span className="text-emerald-700 font-bold">Present (✅)</span>
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    <span className="text-rose-700 font-bold">Absent (❌)</span>
                  </th>
                  <th className="py-2.5 px-3 text-center">Percentage</th>
                  <th className="py-2.5 px-3 text-right">Examination Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseBreakdown.map((item) => {
                  const pct =
                    item.total > 0 ? ((item.present / item.total) * 100).toFixed(0) : '0';
                  const eligible = Number(pct) >= 75;

                  return (
                    <tr key={item.courseCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{item.courseCode}</p>
                        <p className="text-[11px] text-slate-500">{item.courseTitle}</p>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {item.total}
                      </td>

                      {/* Present Count in Emerald */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.present}</span>
                        </span>
                      </td>

                      {/* Absent Count in Rose */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>{item.absent}</span>
                        </span>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={cn(
                            'font-mono font-bold',
                            eligible ? 'text-emerald-700' : 'text-rose-700'
                          )}
                        >
                          {pct}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-right">
                        {eligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Exam Eligible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded border border-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Shortage Warning</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. DETAILED LECTURE ATTENDANCE HISTORY LOG */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Personal Attendance Record History
            </h4>
            <p className="text-xs text-slate-500">
              Complete chronological audit of every lecture marked by faculty instructors
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors',
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All ({studentRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('present')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1',
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Present ({totalPresent})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('absent')}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1',
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              )}
            >
              <XCircle className="w-3 h-3" />
              <span>Absent ({totalAbsent})</span>
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No attendance entries matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Course / Subject</th>
                  <th className="py-2.5 px-3 text-center">Attendance Status</th>
                  <th className="py-2.5 px-3">Marked By</th>
                  <th className="py-2.5 px-3 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{rec.date}</p>
                      <p className="text-[11px] text-slate-500">{rec.timeSlot || '09:00 AM'}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{rec.courseCode}</p>
                      <p className="text-[11px] text-slate-500">{rec.courseTitle}</p>
                    </td>

                    {/* Status Badge in High Contrast Emerald or Rose */}
                    <td className="py-3 px-3 text-center">
                      {rec.status === 'Present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Present</span>
                        </span>
                      ) : rec.status === 'Absent' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          <span>Absent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Late</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {rec.facultyName || (rec.markedBy === 'Faculty' ? 'Faculty Instructor' : 'Self Check-In')}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                      {rec.remarks || 'Regular classroom lecture'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}

      {/* SELF CHECK IN MODAL */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCheck className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Student Lecture Attendance Check-In
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckInModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSelfCheckIn} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student</label>
                <input
                  type="text"
                  disabled
                  value={`${activeStudent.name} (${activeStudent.enrollmentNo})`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course / Subject</label>
                <select
                  value={checkInCourse}
                  onChange={(e) => setCheckInCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="CS-301">CS-301: Distributed Database Systems</option>
                  <option value="CS-302">CS-302: Neural Networks & Deep Learning</option>
                  <option value="CS-304">CS-304: Operating Systems & Concurrency</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Notes</label>
                <input
                  type="text"
                  value={checkInRemarks}
                  onChange={(e) => setCheckInRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  Submit Self Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
