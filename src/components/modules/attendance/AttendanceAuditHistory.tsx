import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Search,
  Users,
  Building2,
  Calendar,
  Download,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Filter,
  RefreshCw,
  BookOpen,
  Eye,
  CalendarDays,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { AttendanceRecord, FacultyAttendanceRecord, StudentAttendanceRecord, Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { StudentMonthlyAttendanceVisualizer } from './StudentMonthlyAttendanceVisualizer';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & AI',
  'Electronics & Robotics',
  'Biomedical Engineering',
  'Mechanical & Aerospace',
  'School of Management',
];

export const AttendanceAuditHistory: React.FC = () => {
  const {
    attendanceRecords,
    facultyAttendanceRecords,
    studentAttendanceRecords,
    students,
    role,
  } = useERP();

  // Filters State
  const [attendeeType, setAttendeeType] = useState<'all' | 'students' | 'faculties'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Single Student Monthly Visualizer
  const [visualizerStudent, setVisualizerStudent] = useState<Student | null>(null);

  // Helper to open visualizer for student record
  const handleOpenStudentVisualizer = (rec: StudentAttendanceRecord) => {
    const existing = students.find(
      (s) => s.id === rec.studentId || s.enrollmentNo.toLowerCase() === rec.enrollmentNo.toLowerCase()
    );
    if (existing) {
      setVisualizerStudent(existing);
    } else {
      setVisualizerStudent({
        id: rec.studentId || `stud-${rec.enrollmentNo}`,
        name: rec.studentName,
        enrollmentNo: rec.enrollmentNo,
        email: `${rec.enrollmentNo.toLowerCase()}@university.edu`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        program: 'B.Tech CSE',
        department: rec.department,
        semester: 6,
        section: 'A',
        attendancePercentage: 88,
        enrolledCourses: [rec.courseCode],
      });
    }
  };

  // Details Modal
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<
    | { type: 'student'; data: StudentAttendanceRecord }
    | { type: 'faculty'; data: FacultyAttendanceRecord }
    | { type: 'session'; data: AttendanceRecord }
    | null
  >(null);

  // Filtered Student Records
  const filteredStudentRecords = useMemo(() => {
    const ind = studentAttendanceRecords.filter((rec) => {
      if (selectedDepartment !== 'All Departments' && rec.department !== selectedDepartment) {
        return false;
      }
      if (selectedDate && rec.date !== selectedDate) {
        return false;
      }
      if (statusFilter === 'present' && rec.status !== 'Present') return false;
      if (statusFilter === 'absent' && rec.status !== 'Absent') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rec.studentName.toLowerCase().includes(q) ||
          rec.enrollmentNo.toLowerCase().includes(q) ||
          rec.courseTitle.toLowerCase().includes(q) ||
          rec.courseCode.toLowerCase().includes(q) ||
          (rec.remarks && rec.remarks.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });

    const sess = attendanceRecords.filter((rec) => {
      if (selectedDepartment !== 'All Departments' && rec.department && rec.department !== selectedDepartment) {
        return false;
      }
      if (selectedDate && rec.date !== selectedDate) {
        return false;
      }
      if (statusFilter === 'present' && rec.presentStudents === 0) return false;
      if (statusFilter === 'absent' && rec.absentStudents === 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rec.courseTitle.toLowerCase().includes(q) ||
          rec.courseCode.toLowerCase().includes(q) ||
          rec.instructor.toLowerCase().includes(q) ||
          rec.hallNo.toLowerCase().includes(q) ||
          rec.topicCovered.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });

    return { individual: ind, sessions: sess };
  }, [studentAttendanceRecords, attendanceRecords, selectedDepartment, selectedDate, statusFilter, searchQuery]);

  // Filtered Faculty Records
  const filteredFacultyRecords = useMemo(() => {
    return facultyAttendanceRecords.filter((rec) => {
      if (selectedDepartment !== 'All Departments' && rec.department !== selectedDepartment) {
        return false;
      }
      if (selectedDate && rec.date !== selectedDate) {
        return false;
      }
      if (statusFilter === 'present' && rec.status !== 'Present' && rec.status !== 'In Lecture') {
        return false;
      }
      if (statusFilter === 'absent' && rec.status !== 'Absent') {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          rec.facultyName.toLowerCase().includes(q) ||
          rec.employeeId.toLowerCase().includes(q) ||
          rec.department.toLowerCase().includes(q) ||
          rec.designation.toLowerCase().includes(q) ||
          (rec.assignedLecture && rec.assignedLecture.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [facultyAttendanceRecords, selectedDepartment, selectedDate, statusFilter, searchQuery]);

  // Metrics
  const totalStudentEntries =
    filteredStudentRecords.individual.length + filteredStudentRecords.sessions.length;
  const totalFacultyEntries = filteredFacultyRecords.length;
  const totalRecordsShown =
    attendeeType === 'all'
      ? totalStudentEntries + totalFacultyEntries
      : attendeeType === 'students'
      ? totalStudentEntries
      : totalFacultyEntries;

  // Export CSV
  const handleExportCSV = () => {
    const rows: string[] = [];
    rows.push('Type,Name/Topic,ID/Code,Department,Date,Status/Turnout,Details');

    if (attendeeType === 'all' || attendeeType === 'students') {
      filteredStudentRecords.individual.forEach((r) => {
        rows.push(
          `Student,"${r.studentName}","${r.enrollmentNo}","${r.department}","${r.date}","${r.status}","${r.courseCode}: ${r.courseTitle}"`
        );
      });
      filteredStudentRecords.sessions.forEach((s) => {
        rows.push(
          `Class Session,"${s.courseTitle}","${s.courseCode}","${s.department}","${s.date}","${s.presentStudents}/${s.totalStudents} Present","Instructor: ${s.instructor}"`
        );
      });
    }

    if (attendeeType === 'all' || attendeeType === 'faculties') {
      filteredFacultyRecords.forEach((f) => {
        rows.push(
          `Faculty,"${f.facultyName}","${f.employeeId}","${f.department}","${f.date}","${f.status}","${f.designation}"`
        );
      });
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-audit-${selectedDepartment.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* FILTER BAR: SEPARATE STUDENTS & FACULTIES, CHOOSE DEPARTMENT & DATE */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Attendee Type Separation (All, Students, Faculties) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setAttendeeType('all')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                attendeeType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <span>All Attendees</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                {studentAttendanceRecords.length + attendanceRecords.length + facultyAttendanceRecords.length}
              </span>
            </button>

            {/* SEPARATE: STUDENTS FILTER BUTTON (BRAND COLOR) */}
            <button
              type="button"
              onClick={() => setAttendeeType('students')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                attendeeType === 'students'
                  ? 'bg-brand text-white shadow-2xs font-bold'
                  : 'text-brand hover:bg-brand-light'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Students</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  attendeeType === 'students' ? 'bg-white/20 text-white' : 'bg-brand-light text-brand'
                )}
              >
                {studentAttendanceRecords.length + attendanceRecords.length}
              </span>
            </button>

            {/* SEPARATE: FACULTIES FILTER BUTTON (PURPLE COLOR) */}
            <button
              type="button"
              onClick={() => setAttendeeType('faculties')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer',
                attendeeType === 'faculties'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-purple-700 hover:bg-purple-50'
              )}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Faculties</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  attendeeType === 'faculties' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                )}
              >
                {facultyAttendanceRecords.length}
              </span>
            </button>
          </div>

          {/* Quick status selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('present')}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border',
                statusFilter === 'present'
                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              )}
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('absent')}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border',
                statusFilter === 'absent'
                  ? 'bg-rose-600 text-white border-rose-600 font-bold'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              )}
            >
              Absent
            </button>
          </div>
        </div>

        {/* Row 2: Department Selection, Date Filter, and Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Department Selection Filter */}
          <div className="sm:col-span-4 relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="flex-1">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="sm:col-span-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-transparent text-slate-800 font-medium focus:outline-hidden text-xs"
              />
            </div>
          </div>

          {/* Date Reset & Export */}
          <div className="sm:col-span-2 flex items-center gap-1">
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-2 py-1 rounded text-[11px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Clear Date
              </button>
            )}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={totalRecordsShown === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendee or course..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AUDIT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {totalRecordsShown === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Attendance Records Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Attendance records will appear here as soon as teachers mark students in the Classroom Register, or faculty log their daily duty.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Attendee / Course Details</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Date & Slot</th>
                  <th className="py-2.5 px-3 text-center">Status / Turnout</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Individual Students */}
                {(attendeeType === 'all' || attendeeType === 'students') &&
                  filteredStudentRecords.individual.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <GraduationCap className="w-3 h-3" />
                          <span>Student</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleOpenStudentVisualizer(rec)}
                          className="text-left group cursor-pointer focus:outline-hidden"
                          title={`Click to view ${rec.studentName}'s monthly attendance`}
                        >
                          <p className="font-bold text-slate-900 group-hover:text-brand group-hover:underline transition-colors flex items-center gap-1.5">
                            <span>{rec.studentName}</span>
                            <CalendarDays className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {rec.enrollmentNo} • {rec.courseCode}: {rec.courseTitle}
                          </p>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{rec.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <p className="font-medium text-slate-800">{rec.date}</p>
                        <p className="text-[11px] text-slate-400">{rec.timeSlot || '09:00 AM'}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {rec.status === 'Present' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Present</span>
                          </span>
                        ) : rec.status === 'Absent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>Absent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Late</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailRecord({ type: 'student', data: rec })}
                          className="p-1 rounded text-slate-400 hover:text-brand cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                {/* 2. Faculty Records */}
                {(attendeeType === 'all' || attendeeType === 'faculties') &&
                  filteredFacultyRecords.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Award className="w-3 h-3" />
                          <span>Faculty</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{f.facultyName}</p>
                        <p className="text-[11px] text-slate-500">
                          {f.employeeId} • {f.designation}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{f.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <p className="font-medium text-slate-800">{f.date}</p>
                        <p className="text-[11px] text-slate-400">{f.checkInTime || '08:30 AM'}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {f.status === 'Present' || f.status === 'In Lecture' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Present</span>
                          </span>
                        ) : f.status === 'Absent' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>Absent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>{f.status}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailRecord({ type: 'faculty', data: f })}
                          className="p-1 rounded text-slate-400 hover:text-purple-600 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                {/* 3. Class Sessions */}
                {(attendeeType === 'all' || attendeeType === 'students') &&
                  filteredStudentRecords.sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          <BookOpen className="w-3 h-3" />
                          <span>Lecture Session</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{s.courseTitle}</p>
                        <p className="text-[11px] text-slate-500">
                          {s.courseCode} • {s.instructor}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.department}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <p className="font-medium text-slate-800">{s.date}</p>
                        <p className="text-[11px] text-slate-400">{s.timeSlot}</p>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>{s.presentStudents} / {s.totalStudents} Present</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailRecord({ type: 'session', data: s })}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedDetailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">Attendance Audit Verification</h4>
              <button
                type="button"
                onClick={() => setSelectedDetailRecord(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">
                  {selectedDetailRecord.type === 'student'
                    ? selectedDetailRecord.data.studentName
                    : selectedDetailRecord.type === 'faculty'
                    ? selectedDetailRecord.data.facultyName
                    : selectedDetailRecord.data.courseTitle}
                </p>
                <p className="text-slate-500 mt-0.5">
                  {selectedDetailRecord.type === 'student'
                    ? `${selectedDetailRecord.data.enrollmentNo} • ${selectedDetailRecord.data.courseCode}`
                    : selectedDetailRecord.type === 'faculty'
                    ? `${selectedDetailRecord.data.employeeId} • ${selectedDetailRecord.data.designation}`
                    : `${selectedDetailRecord.data.courseCode} • Instructor: ${selectedDetailRecord.data.instructor}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 bg-slate-50 rounded border">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Date</p>
                  <p className="font-semibold">{selectedDetailRecord.data.date}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Department</p>
                  <p className="font-semibold">{selectedDetailRecord.data.department}</p>
                </div>
              </div>

              {selectedDetailRecord.type === 'student' && (
                <div className="p-2.5 bg-indigo-50/50 rounded border border-indigo-100 text-slate-700">
                  <p className="text-[10px] text-indigo-700 uppercase font-bold">Instructor & Venue</p>
                  <p className="font-medium mt-0.5">
                    Marked by: {selectedDetailRecord.data.facultyName || 'Faculty Instructor'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedDetailRecord.data.remarks || 'Recorded in regular session'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY ATTENDANCE VISUALIZER MODAL */}
      {visualizerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="max-w-4xl w-full my-auto">
            <StudentMonthlyAttendanceVisualizer
              initialStudent={visualizerStudent}
              isModal
              onClose={() => setVisualizerStudent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
