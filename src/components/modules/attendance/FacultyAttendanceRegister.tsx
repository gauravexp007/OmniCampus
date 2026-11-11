import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  Calendar,
  BookOpen,
  Lock,
  UserPlus,
  Sparkles,
  GraduationCap,
  CalendarDays,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { Student } from '../../../types';
import { cn } from '../../../lib/utils';
import { StudentMonthlyAttendanceVisualizer } from './StudentMonthlyAttendanceVisualizer';
import { ConfettiButton } from '../../ui/ConfettiButton';
import { AnimatedSegmentedToggle } from '../../ui/AnimatedSegmentedToggle';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science & AI',
  'Electronics & Robotics',
  'Biomedical Engineering',
  'Mechanical & Aerospace',
  'School of Management',
];

const DEFAULT_COURSES: Record<string, { code: string; title: string }[]> = {
  'Computer Science & AI': [
    { code: 'CS-301', title: 'Distributed Database Systems' },
    { code: 'CS-302', title: 'Neural Networks & Deep Learning' },
    { code: 'CS-304', title: 'Operating Systems & Concurrency' },
  ],
  'Electronics & Robotics': [
    { code: 'ECE-201', title: 'Digital Signal Processing' },
    { code: 'ROB-301', title: 'Autonomous Robotics & Control' },
  ],
  'Biomedical Engineering': [
    { code: 'BME-210', title: 'Biomedical Signal Analysis' },
    { code: 'BME-305', title: 'Neural Engineering & Implants' },
  ],
  'Mechanical & Aerospace': [
    { code: 'AERO-401', title: 'Aerodynamics & Flight Dynamics' },
    { code: 'MECH-301', title: 'Advanced Thermodynamics' },
  ],
  'School of Management': [
    { code: 'MBA-101', title: 'Organizational Strategy' },
    { code: 'FIN-202', title: 'Corporate Finance & Analytics' },
  ],
};

export const FacultyAttendanceRegister: React.FC = () => {
  const {
    students,
    courses,
    faculty,
    role,
    addStudent,
    studentAttendanceRecords,
    markStudentAttendanceSingle,
    currentUser,
  } = useERP();

  // Today's ISO date string
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Class Session Configuration State
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS-301');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 10:30 AM');
  const [venue, setVenue] = useState<string>('Turing Hall 301');

  // Assigned Faculty selection (Admin can select any registered Faculty by unique ID)
  const [assignedFacultyId, setAssignedFacultyId] = useState<string>(() => {
    if (role === 'Faculty') {
      return currentUser?.idNumber || currentUser?.employeeId || '';
    }
    return faculty[0]?.employeeId || '';
  });

  useEffect(() => {
    if (role === 'Faculty') {
      const myId = currentUser?.idNumber || currentUser?.employeeId || '';
      if (myId) setAssignedFacultyId(myId);
    } else if (role === 'Admin') {
      if (!assignedFacultyId && faculty.length > 0) {
        setAssignedFacultyId(faculty[0].employeeId);
      }
    }
  }, [role, currentUser, faculty, assignedFacultyId]);

  const currentAssignedFaculty = useMemo(() => {
    if (role === 'Faculty') {
      return {
        id: currentUser?.uid || 'fac-user',
        employeeId: currentUser?.idNumber || currentUser?.employeeId || 'FAC-2026-ACTIVE',
        name: currentUser?.name || 'Faculty Member',
        department: currentUser?.department || 'Computer Science & AI',
      };
    }
    const found = faculty.find((f) => f.employeeId === assignedFacultyId);
    if (found) return found;
    return (
      faculty[0] || {
        id: 'fac-default',
        employeeId: assignedFacultyId || 'FAC-2026-ACTIVE',
        name: 'Faculty Member',
        department: 'Academics',
      }
    );
  }, [role, currentUser, faculty, assignedFacultyId]);

  // Past date check: past dates can be viewed only and cannot be edited
  const isPastDate = selectedDate < todayStr;

  // Filter & Search inside roster
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent' | 'unmarked'>('all');

  // Quick Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    enrollmentNo: '',
    email: '',
    program: 'B.Tech in Computer Science',
    semester: 1,
    section: 'A',
    department: 'Computer Science & AI',
  });

  // Monthly Visualizer Modal State for a single student
  const [visualizerStudent, setVisualizerStudent] = useState<Student | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'present' | 'absent' | 'info' } | null>(null);

  const showToast = (text: string, type: 'present' | 'absent' | 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Date selection validator: future dates cannot be chosen
  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    if (newDate > todayStr) {
      showToast('Future dates cannot be chosen for attendance.', 'info');
      setSelectedDate(todayStr);
      return;
    }
    setSelectedDate(newDate);
  };

  // Available courses (from live database or institutional catalogue)
  const availableCourses = useMemo(() => {
    if (courses.length > 0) {
      if (selectedDept !== 'All' && selectedDept !== 'All Departments') {
        const matching = courses.filter((c) => c.department === selectedDept);
        if (matching.length > 0) return matching;
      }
      return courses;
    }
    const fallback =
      selectedDept === 'All' || selectedDept === 'All Departments'
        ? Object.values(DEFAULT_COURSES).flat()
        : DEFAULT_COURSES[selectedDept] || [
            { code: 'CS-301', title: 'Distributed Database Systems' },
            { code: 'GEN-101', title: 'General University Lecture' },
          ];
    return fallback;
  }, [courses, selectedDept]);

  // Keep selectedCourseCode synced with available courses
  useEffect(() => {
    if (availableCourses.length > 0) {
      const exists = availableCourses.some(
        (c) => c.code.toLowerCase() === selectedCourseCode.toLowerCase()
      );
      if (!exists) {
        setSelectedCourseCode(availableCourses[0].code);
      }
    }
  }, [availableCourses, selectedCourseCode]);

  const selectedCourseTitle = useMemo(() => {
    const found = availableCourses.find(
      (c) => c.code.toLowerCase() === selectedCourseCode.toLowerCase()
    );
    return found ? found.title : availableCourses[0]?.title || 'Distributed Database Systems';
  }, [availableCourses, selectedCourseCode]);

  // Students enrolled in selected department and filtered strictly by selected semester
  const departmentStudents = useMemo(() => {
    return students.filter((s) => {
      const matchDept =
        selectedDept === 'All' ||
        selectedDept === 'All Departments' ||
        s.department === selectedDept;
      const matchSem =
        selectedSemester === 'all'
          ? true
          : Number(s.semester) === Number(selectedSemester);
      return matchDept && matchSem;
    });
  }, [students, selectedDept, selectedSemester]);

  // Lookup attendance records for this date and course
  const sessionRecordsMap = useMemo(() => {
    const map = new Map<string, { status: 'Present' | 'Absent' | 'Late'; id: string; time: number }>();
    studentAttendanceRecords.forEach((r) => {
      if (r.date === selectedDate && r.courseCode.toLowerCase() === selectedCourseCode.toLowerCase()) {
        const key = (r.studentId || r.enrollmentNo || '').toLowerCase();
        map.set(key, { status: r.status, id: r.id, time: r.timestamp || Date.now() });
      }
    });
    return map;
  }, [studentAttendanceRecords, selectedDate, selectedCourseCode]);

  // Filtered roster based on search and status
  const filteredRoster = useMemo(() => {
    return departmentStudents.filter((stu) => {
      const rec = sessionRecordsMap.get(stu.id.toLowerCase()) || sessionRecordsMap.get(stu.enrollmentNo.toLowerCase());
      const currentStatus = rec ? rec.status : 'Unmarked';

      if (filterStatus === 'present' && currentStatus !== 'Present') return false;
      if (filterStatus === 'absent' && currentStatus !== 'Absent') return false;
      if (filterStatus === 'unmarked' && currentStatus !== 'Unmarked') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          stu.name.toLowerCase().includes(q) ||
          stu.enrollmentNo.toLowerCase().includes(q) ||
          stu.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [departmentStudents, sessionRecordsMap, filterStatus, searchQuery]);

  // Session Statistics
  const sessionStats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let unmarkedCount = 0;

    departmentStudents.forEach((stu) => {
      const rec = sessionRecordsMap.get(stu.id.toLowerCase()) || sessionRecordsMap.get(stu.enrollmentNo.toLowerCase());
      if (rec?.status === 'Present') presentCount++;
      else if (rec?.status === 'Absent') absentCount++;
      else unmarkedCount++;
    });

    const total = departmentStudents.length;
    const markedTotal = presentCount + absentCount;
    const ratePct = markedTotal > 0 ? ((presentCount / markedTotal) * 100).toFixed(0) : '0';

    return { total, presentCount, absentCount, unmarkedCount, ratePct };
  }, [departmentStudents, sessionRecordsMap]);

  // Single Click Handlers (Guarded: Past dates cannot be edited)
  const handleMarkAttendance = (student: Student, status: 'Present' | 'Absent') => {
    if (isPastDate) {
      showToast('Past attendance records can be viewed only and cannot be edited.', 'info');
      return;
    }

    const facultyName = currentAssignedFaculty.name || 'Faculty Member';
    const facultyId = currentAssignedFaculty.employeeId;
    markStudentAttendanceSingle({
      student,
      courseCode: selectedCourseCode,
      courseTitle: selectedCourseTitle,
      department: selectedDept,
      date: selectedDate,
      timeSlot,
      status,
      facultyName,
      facultyId,
      venue,
    });

    showToast(
      `Marked ${student.name} as ${status}. Notification sent to student.`,
      status === 'Present' ? 'present' : 'absent'
    );
  };

  // Batch mark all (Guarded: Past dates cannot be edited)
  const handleMarkAll = (status: 'Present' | 'Absent') => {
    if (isPastDate) {
      showToast('Past attendance records can be viewed only and cannot be edited.', 'info');
      return;
    }
    if (departmentStudents.length === 0) return;

    const facultyName = currentAssignedFaculty.name || 'Faculty Member';
    const facultyId = currentAssignedFaculty.employeeId;
    departmentStudents.forEach((student) => {
      markStudentAttendanceSingle({
        student,
        courseCode: selectedCourseCode,
        courseTitle: selectedCourseTitle,
        department: selectedDept,
        date: selectedDate,
        timeSlot,
        status,
        facultyName,
        facultyId,
        venue,
      });
    });

    showToast(
      `Marked all ${departmentStudents.length} students as ${status}. Notifications dispatched.`,
      status === 'Present' ? 'present' : 'absent'
    );
  };

  // Add individual student form submit
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.enrollmentNo.trim()) return;

    const targetDept =
      selectedDept !== 'All Departments' && selectedDept !== 'All'
        ? selectedDept
        : newStudentForm.department || 'Computer Science & AI';

    addStudent({
      id: `stu-${Date.now()}`,
      name: newStudentForm.name.trim(),
      enrollmentNo: newStudentForm.enrollmentNo.trim().toUpperCase(),
      email:
        newStudentForm.email.trim() ||
        `${newStudentForm.name.toLowerCase().replace(/\s+/g, '.')}@student.university.edu`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      department: targetDept,
      program: newStudentForm.program,
      semester: Number(newStudentForm.semester),
      section: newStudentForm.section || 'A',
      cgpa: 3.75,
      attendancePct: 95.0,
      feeStatus: 'Paid',
      status: 'Active',
      mentor: currentUser?.name || 'Prof. Marcus Vance',
      phone: '+1 (555) 019-2834',
      admissionYear: 2026,
      creditsEarned: 24,
    });

    setIsAddStudentModalOpen(false);
    setNewStudentForm({
      name: '',
      enrollmentNo: '',
      email: '',
      program: 'B.Tech in Computer Science',
      semester: 1,
      section: 'A',
      department: 'Computer Science & AI',
    });

    showToast(`Added student to ERP roster for ${targetDept}`, 'info');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={cn(
            'fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200',
            toastMessage.type === 'present'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : toastMessage.type === 'absent'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          )}
        >
          {toastMessage.type === 'present' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === 'absent' ? (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. LECTURE & CLASSROOM SESSION CONFIGURATION BAR */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-[#373e4b] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#373e4b]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand/10 dark:bg-brand/25 text-brand">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Classroom Attendance Register
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Roster Management Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {departmentStudents.length > 0 && (
              <button
                type="button"
                onClick={() => setVisualizerStudent(departmentStudents[0])}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#2c3342] dark:hover:bg-[#373e4b] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#373e4b] text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <CalendarDays className="w-3.5 h-3.5 text-brand" />
                <span>Monthly Visualizer</span>
              </button>
            )}

            {/* DEDICATED PRIMARY ADD STUDENT BUTTON - UNIQUELY IDENTIFIABLE WITH EMERALD STYLING */}
            <button
              type="button"
              id="attendance-register-add-student-btn"
              onClick={() => {
                setNewStudentForm((prev) => ({
                  ...prev,
                  semester: selectedSemester !== 'all' ? selectedSemester : 1,
                  department:
                    selectedDept !== 'All' && selectedDept !== 'All Departments'
                      ? selectedDept
                      : 'Computer Science & AI',
                }));
                setIsAddStudentModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20 transition-all cursor-pointer group"
              title="Add a new student directly to this attendance register roster"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Add Student to Register</span>
            </button>
          </div>
        </div>

        {/* Assigned Faculty Selector */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Users className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {role === 'Admin' ? 'Assign Attendance Register to Faculty' : 'Assigned Faculty Register'}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-extrabold border border-indigo-200 dark:border-indigo-700">
                  ID: {currentAssignedFaculty.employeeId}
                </span>
              </div>
            </div>
          </div>

          {role === 'Admin' ? (
            <div className="flex items-center gap-2 min-w-[280px] sm:w-auto">
              <label htmlFor="assigned-faculty-select" className="text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                Select Faculty ID:
              </label>
              <select
                id="assigned-faculty-select"
                value={assignedFacultyId}
                onChange={(e) => setAssignedFacultyId(e.target.value)}
                className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#252b35] text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-brand cursor-pointer shadow-2xs"
              >
                {faculty.length === 0 ? (
                  <option value="">No registered faculty in database</option>
                ) : (
                  faculty.map((fac) => (
                    <option key={fac.id || fac.employeeId} value={fac.employeeId}>
                      [{fac.employeeId}] {fac.name} — {fac.department}
                    </option>
                  ))
                )}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Instructor: <strong className="text-slate-900 dark:text-white">{currentAssignedFaculty.name}</strong>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                Assigned
              </span>
            </div>
          )}
        </div>

        {/* Session Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4 text-xs">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) =>
                setSelectedSemester(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Course Code & Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Course / Subject
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {availableCourses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Date
              </label>
              {selectedDate !== todayStr && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-[10px] text-brand font-semibold hover:underline cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>
            <input
              type="date"
              max={todayStr}
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand cursor-pointer"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand cursor-pointer"
            >
              <option value="09:00 AM - 10:30 AM">09:00 AM - 10:30 AM</option>
              <option value="10:45 AM - 12:15 PM">10:45 AM - 12:15 PM</option>
              <option value="01:30 PM - 03:00 PM">01:30 PM - 03:00 PM</option>
              <option value="03:15 PM - 04:45 PM">03:15 PM - 04:45 PM</option>
            </select>
          </div>

          {/* Lecture Room */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Hall / Room
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Turing Hall 301"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {/* HISTORICAL VIEW-ONLY WARNING */}
      {isPastDate && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">
              Viewing historical attendance for {selectedDate}. Past date attendance can be viewed only and cannot be edited.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1 rounded-lg bg-white dark:bg-[#252b35] border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer shrink-0"
          >
            Return to Today ({todayStr})
          </button>
        </div>
      )}

      {/* 2. LIVE CLASS STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Enrolled */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl p-3.5 border border-slate-200 dark:border-[#373e4b] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Enrolled in Class
            </p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {sessionStats.total}
            </p>
          </div>
          <span className="p-2.5 rounded-xl bg-brand/10 dark:bg-brand/25 text-brand">
            <Users className="w-5 h-5" />
          </span>
        </div>

        {/* Present */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl p-3.5 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Marked Present
            </p>
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {sessionStats.presentCount}
            </p>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </span>
        </div>

        {/* Absent */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl p-3.5 border border-rose-200 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
              Marked Absent
            </p>
            <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">
              {sessionStats.absentCount}
            </p>
          </div>
          <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-5 h-5" />
          </span>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl p-3.5 border border-slate-200 dark:border-[#373e4b] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Turnout
            </p>
            <p className="text-xl font-extrabold text-brand mt-0.5">
              {sessionStats.ratePct}%
            </p>
          </div>
          <span className="p-2.5 rounded-xl bg-brand/10 dark:bg-brand/25 text-brand">
            <GraduationCap className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* 3. ROSTER FILTER & BATCH ACTION BAR */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl p-3.5 border border-slate-200 dark:border-[#373e4b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter enrolled student by name, roll no..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-[#181c24] focus:ring-2 focus:ring-brand text-xs"
          />
        </div>

        {/* Status Filter Segmented Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mr-1">Show:</span>
          <AnimatedSegmentedToggle
            value={filterStatus}
            onChange={(val) => setFilterStatus(val as typeof filterStatus)}
            layoutId="attendance-status-filter-pill"
            size="sm"
            options={[
              {
                value: 'all' as const,
                label: `All (${departmentStudents.length})`,
              },
              {
                value: 'present' as const,
                label: `Present (${sessionStats.presentCount})`,
                icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
              },
              {
                value: 'absent' as const,
                label: `Absent (${sessionStats.absentCount})`,
                icon: <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
              },
              {
                value: 'unmarked' as const,
                label: `Unmarked (${sessionStats.unmarkedCount})`,
              },
            ]}
          />
        </div>

        {/* Batch Shortcuts */}
        <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0">
          <ConfettiButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('Present')}
            disabled={departmentStudents.length === 0 || isPastDate}
            enableClickCelebration={true}
            className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
            title={isPastDate ? 'Past attendance records cannot be edited' : 'Mark all enrolled students present'}
          >
            <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Mark All Present</span>
          </ConfettiButton>

          <ConfettiButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('Absent')}
            disabled={departmentStudents.length === 0 || isPastDate}
            enableClickCelebration={false}
            className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300 font-bold cursor-pointer"
            title={isPastDate ? 'Past attendance records cannot be edited' : 'Mark all enrolled students absent'}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
            <span>Mark All Absent</span>
          </ConfettiButton>
        </div>
      </div>

      {/* 4. THE RELATIONAL TABLE */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs overflow-hidden">
        {departmentStudents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1e232d] text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              No Students Enrolled in {selectedDept}
              {selectedSemester !== 'all' ? ` for Semester ${selectedSemester}` : ''}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              {selectedSemester !== 'all'
                ? `No students found matching Semester ${selectedSemester}. Switch semester filter or add a student to this semester.`
                : 'Add enrolled students to track daily attendance sessions.'}
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setNewStudentForm((prev) => ({
                    ...prev,
                    semester: selectedSemester !== 'all' ? selectedSemester : 1,
                  }));
                  setIsAddStudentModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {selectedSemester !== 'all'
                    ? `+ Add Student to Semester ${selectedSemester}`
                    : '+ Add Student to Attendance Roster'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1e232d] border-b border-slate-200 dark:border-[#373e4b] text-slate-600 dark:text-slate-300 font-extrabold tracking-wider uppercase text-[11px]">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Program & Section</th>
                  <th className="py-3 px-4">Status for this Class</th>
                  <th className="py-3 px-4 text-center">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#373e4b]">
                {filteredRoster.map((student) => {
                  const rec =
                    sessionRecordsMap.get(student.id.toLowerCase()) ||
                    sessionRecordsMap.get(student.enrollmentNo.toLowerCase());
                  const currentStatus = rec ? rec.status : 'Unmarked';

                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        'transition-colors',
                        currentStatus === 'Present'
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/35'
                          : currentStatus === 'Absent'
                          ? 'bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/50 dark:hover:bg-rose-950/35'
                          : 'hover:bg-slate-50 dark:hover:bg-[#2c3344]'
                      )}
                    >
                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setVisualizerStudent(student)}
                          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
                          title={`Click on ${student.name} to view 1-month visualized attendance`}
                        >
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#373e4b] object-cover shrink-0 group-hover:ring-2 group-hover:ring-brand transition-all shadow-2xs"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand dark:group-hover:text-brand-light transition-colors flex items-center gap-1.5">
                              <span>{student.name}</span>
                              <CalendarDays className="w-3.5 h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                              {student.enrollmentNo}
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Program & Section */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{student.program}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Semester {student.semester} • Section {student.section || 'A'}
                        </p>
                      </td>

                      {/* Status for this Class */}
                      <td className="py-3 px-4">
                        {currentStatus === 'Present' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            <span>Present</span>
                          </span>
                        ) : currentStatus === 'Absent' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                            <span>Absent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200/90 dark:bg-[#1a1f28] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#373e4b]">
                            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Unmarked</span>
                          </span>
                        )}
                      </td>

                      {/* ATTENDANCE ACTION: IF PAST DATE -> LOCKED (VIEW ONLY), IF TODAY -> HIGH-CONTRAST BUTTONS */}
                      <td className="py-3 px-4 text-center">
                        {isPastDate ? (
                          <div
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e232d] text-slate-500 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-[#373e4b]"
                            title="Past attendance records can be viewed only and cannot be edited"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Locked (View Only)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-center p-1 rounded-xl bg-slate-100 dark:bg-[#1c212b] border border-slate-200 dark:border-[#373e4b] shadow-2xs">
                            {/* 1-Click PRESENT Button */}
                            <button
                              type="button"
                              onClick={() => {
                                handleMarkAttendance(student, 'Present');
                              }}
                              className={cn(
                                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95',
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs font-black ring-1 ring-emerald-500'
                                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-200 font-bold'
                              )}
                              title={`Mark ${student.name} as Present`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Present</span>
                            </button>

                            {/* 1-Click ABSENT Button */}
                            <button
                              type="button"
                              onClick={() => handleMarkAttendance(student, 'Absent')}
                              className={cn(
                                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95',
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs font-black ring-1 ring-rose-500'
                                  : 'text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-800 dark:hover:text-rose-200 font-bold'
                              )}
                              title={`Mark ${student.name} as Absent`}
                            >
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>Absent</span>
                            </button>
                          </div>
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

      {/* PERSISTENT FLOATING QUICK ADD BUTTON FOR ATTENDANCE REGISTER */}
      <button
        type="button"
        onClick={() => {
          setNewStudentForm((prev) => ({
            ...prev,
            semester: selectedSemester !== 'all' ? selectedSemester : 1,
            department:
              selectedDept !== 'All' && selectedDept !== 'All Departments'
                ? selectedDept
                : 'Computer Science & AI',
          }));
          setIsAddStudentModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
        title="Quick Add Student to Register"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Student to Register</span>
      </button>

      {/* QUICK ADD STUDENT MODAL */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#252b35] rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-[#373e4b]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#373e4b]">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Enroll New Student to {selectedDept}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  placeholder="e.g. Liam Sterling"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Enrollment / Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentForm.enrollmentNo}
                  onChange={(e) =>
                    setNewStudentForm({ ...newStudentForm, enrollmentNo: e.target.value })
                  }
                  placeholder="e.g. OMNI-2026-CS-150"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  placeholder="e.g. liam.sterling@student.university.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course / Degree Program
                </label>
                <select
                  value={newStudentForm.program}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, program: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 cursor-pointer"
                >
                  {courses.length > 0 && (
                    <optgroup label="Registered Academic Courses">
                      {courses.map((c) => (
                        <option key={c.id} value={`${c.code}: ${c.title}`}>
                          {c.code}: {c.title} ({c.department})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Degree Programs & Majors">
                    <option value="B.Tech in Computer Science">B.Tech in Computer Science</option>
                    <option value="B.Tech in Artificial Intelligence">B.Tech in Artificial Intelligence</option>
                    <option value="B.Tech in Electronics & Robotics">B.Tech in Electronics & Robotics</option>
                    <option value="B.Tech in Mechanical & Aerospace">B.Tech in Mechanical & Aerospace</option>
                    <option value="B.Tech in Biomedical Engineering">B.Tech in Biomedical Engineering</option>
                    <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                    <option value="M.Tech in Data Science & Cloud">M.Tech in Data Science & Cloud</option>
                    <option value="B.Sc in Applied Mathematics">B.Sc in Applied Mathematics</option>
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={newStudentForm.semester}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, semester: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#1e232d] text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.section}
                    onChange={(e) =>
                      setNewStudentForm({ ...newStudentForm, section: e.target.value })
                    }
                    placeholder="CS-A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d] text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#373e4b]">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#373e4b] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-[#1e232d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-md"
                >
                  Save Student to ERP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MONTHLY ATTENDANCE VISUALIZER MODAL FOR SINGLE STUDENT */}
      {visualizerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
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
