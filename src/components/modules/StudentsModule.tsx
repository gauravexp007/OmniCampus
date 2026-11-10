import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  GraduationCap,
  Mail,
  Trash2,
  Eye,
  X,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Phone,
  UserCheck,
  CreditCard,
  Award,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Student } from '../../types';
import { cn } from '../../lib/utils';
import { SKETCH_STUDENT } from '../../utils/sketchAvatars';

export const StudentsModule: React.FC = () => {
  const { students, courses, results, addStudent, deleteStudent, updateStudent, role } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<number | 'All'>('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomProgram, setIsCustomProgram] = useState(false);
  const [customProgramInput, setCustomProgramInput] = useState('');

  // Dynamically calculate student's CGPA from their academic results and marks
  const getStudentCalculatedCGPA = (student: Student) => {
    const studentResults = results.filter(
      (r) =>
        (r.enrollmentNo && r.enrollmentNo.toLowerCase() === student.enrollmentNo.toLowerCase()) ||
        (r.studentName && r.studentName.toLowerCase() === student.name.toLowerCase()) ||
        (r.studentId && r.studentId === student.id)
    );

    if (studentResults.length === 0) {
      return student.cgpa && student.cgpa > 0 ? Number(student.cgpa).toFixed(2) : 'Pending';
    }

    let totalWeighted = 0;
    let totalCredits = 0;
    studentResults.forEach((r) => {
      const credits = r.creditsCompleted || 20;
      const sgpa = Number(r.sgpa) || 0;
      totalWeighted += sgpa * credits;
      totalCredits += credits;
    });

    if (totalCredits === 0) {
      const avg =
        studentResults.reduce((acc, r) => acc + (Number(r.cgpa || r.sgpa) || 0), 0) /
        studentResults.length;
      return avg.toFixed(2);
    }

    return (totalWeighted / totalCredits).toFixed(2);
  };

  // Get results for selected student in 360 overview
  const getSelectedStudentResults = (student: Student) => {
    return results.filter(
      (r) =>
        (r.enrollmentNo && r.enrollmentNo.toLowerCase() === student.enrollmentNo.toLowerCase()) ||
        (r.studentName && r.studentName.toLowerCase() === student.name.toLowerCase()) ||
        (r.studentId && r.studentId === student.id)
    );
  };

  // New student form state
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    enrollmentNo: '',
    department: 'Computer Science & AI',
    program: 'B.Tech in Computer Science',
    semester: 1,
    attendancePct: 95.0,
    feeStatus: 'Paid' as const,
    phone: '',
  });

  const departments = [
    'All',
    'Computer Science & AI',
    'Electronics & Robotics',
    'Mechanical & Aerospace',
    'Biomedical Engineering',
    'School of Management',
  ];

  const filteredStudents = students.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || s.department === selectedDepartment;
    const matchesSem = selectedSemester === 'All' || Number(s.semester) === Number(selectedSemester);
    return matchesQuery && matchesDept && matchesSem;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;

    addStudent({
      enrollmentNo:
        newStudent.enrollmentNo.trim() ||
        `STU-2026-${newStudent.department.substring(0, 2).toUpperCase()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
      name: newStudent.name.trim(),
      email:
        newStudent.email.trim() ||
        `${newStudent.name.toLowerCase().replace(/\s+/g, '.')}@student.university.edu`,
      avatar: SKETCH_STUDENT,
      department: newStudent.department,
      program: newStudent.program,
      semester: Number(newStudent.semester) || 1,
      section: 'A',
      cgpa: 0, // Automatically calculated by analysis of examination marks and results
      attendancePct: Number(newStudent.attendancePct) || 90,
      feeStatus: newStudent.feeStatus,
      status: 'Active',
      mentor: 'Prof. Marcus Vance',
      phone: newStudent.phone.trim() || '+1 (555) 019-2834',
      admissionYear: 2026,
      creditsEarned: 24,
    });

    setIsAddModalOpen(false);
    setIsCustomProgram(false);
    setCustomProgramInput('');
    setNewStudent({
      name: '',
      email: '',
      enrollmentNo: '',
      department: 'Computer Science & AI',
      program: 'B.Tech in Computer Science',
      semester: 1,
      attendancePct: 95.0,
      feeStatus: 'Paid',
      phone: '',
    });
  };

  const handleToggleFeeStatus = (student: Student) => {
    const updatedStatus = student.feeStatus === 'Paid' ? 'Overdue' : 'Paid';
    const updatedStudent: Student = {
      ...student,
      feeStatus: updatedStatus,
    };
    updateStudent(updatedStudent);
    setSelectedStudent(updatedStudent);
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Enrollment,Name,Department,Program,Semester,CGPA,Attendance,Fee Status']
        .concat(
          students.map(
            (s) =>
              `${s.enrollmentNo},"${s.name}","${s.department}","${s.program}",${s.semester},${getStudentCalculatedCGPA(s)},${s.attendancePct}%,${s.feeStatus}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Students_Directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl p-4 md:p-5 border border-slate-200 dark:border-[#373e4b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand/10 dark:bg-brand/25 text-brand flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Directory</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-[#2c3342] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#373e4b]">
                  {students.length} {students.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage registrations, 360° academic dossiers, attendance percentages, and fee status.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Zone: Uniquely Identifiable Primary Button & Secondary Tools */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {students.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#2c3342] dark:hover:bg-[#373e4b] text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer border border-slate-200/80 dark:border-[#373e4b]"
              title="Download CSV database export"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {/* DEDICATED PRIMARY ADD STUDENT BUTTON - Uniquely Identifiable with Emerald High-Contrast Theme */}
          {(role === 'Admin' || role === 'Faculty') && (
            <button
              id="add-student-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20 transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Add New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Quick-Selector & Filter Controls Bar */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl p-4 border border-slate-200 dark:border-[#373e4b] shadow-xs space-y-3">
        {/* Row 1: Interactive Student 360° Quick-Selector Bar */}
        <div className="bg-gradient-to-r from-indigo-50/70 via-slate-50 to-brand/5 dark:from-[#202530] dark:to-[#222938] rounded-xl p-3 border border-indigo-100 dark:border-[#373e4b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Interactive Student Quick Selector
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Select any student directly from this list to immediately open their 360° overview and academic records.
              </span>
            </div>
          </div>

          <div className="w-full sm:w-72 shrink-0">
            <select
              aria-label="Interactive option to select student for overview"
              value={selectedStudent ? selectedStudent.id : ''}
              onChange={(e) => {
                const target = students.find((s) => s.id === e.target.value);
                if (target) {
                  setSelectedStudent(target);
                }
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-[#1a1f29] border-2 border-indigo-500/40 hover:border-indigo-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer shadow-xs transition-colors"
            >
              <option value="" disabled>
                ⚡ Choose student for 360° Overview...
              </option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.enrollmentNo}) - Sem {s.semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Search Query & Filtering by Department / Semester */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, enrollment ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand focus:bg-white dark:focus:bg-[#181c24] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              aria-label="Filter by department"
              className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              aria-label="Filter by semester"
              className="w-full sm:w-36 px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main List / Table */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1e232d] border-b border-slate-200 dark:border-[#373e4b] text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Enrollment ID</th>
                  <th className="px-4 py-3.5">Department & Program</th>
                  <th className="px-4 py-3.5">Semester</th>
                  <th className="px-4 py-3.5">CGPA</th>
                  <th className="px-4 py-3.5">Attendance</th>
                  <th className="px-4 py-3.5">Fee Status</th>
                  <th className="px-4 py-3.5 text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#373e4b] text-slate-700 dark:text-slate-300">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-indigo-50/40 dark:hover:bg-[#2c3342]/60 transition-colors cursor-pointer group"
                    title="Click row to open 360° Student Overview"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/25 text-brand flex items-center justify-center font-extrabold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand transition-colors">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                      {student.enrollmentNo}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 dark:text-slate-200 font-semibold">{student.department}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{student.program}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                      Sem {student.semester}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {getStudentCalculatedCGPA(student) === 'Pending' ? (
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 italic">
                          Pending Exams
                        </span>
                      ) : (
                        <span className="text-brand font-extrabold bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-md">
                          {getStudentCalculatedCGPA(student)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-bold text-[11px] px-2 py-0.5 rounded-md inline-block',
                          student.attendancePct >= 75
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50'
                        )}
                      >
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wide uppercase',
                          student.feeStatus === 'Paid'
                            ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60'
                            : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/60'
                        )}
                      >
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* UNIQUELY IDENTIFIABLE OVERVIEW BUTTON */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer border border-indigo-200 dark:border-indigo-800/60"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>360° Overview</span>
                        </button>

                        {(role === 'Admin' || role === 'Faculty') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStudent(student.id);
                            }}
                            title="Delete Student Record"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1e232d] text-slate-400 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Student Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedDepartment !== 'All'
              ? 'No students match your active search or filter criteria.'
              : 'There are no students registered yet in the campus database.'}
          </p>
          {(role === 'Admin' || role === 'Faculty') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Student</span>
            </button>
          )}
        </div>
      )}

      {/* PERSISTENT FLOATING QUICK ADD BUTTON (Never get lost in long tables) */}
      {(role === 'Admin' || role === 'Faculty') && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
          title="Quick Add Student from anywhere"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Student</span>
        </button>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#373e4b]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Student</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Create a university enrollment record with automatic ID generation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c3342]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enrollment ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newStudent.enrollmentNo}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, enrollmentNo: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={newStudent.department}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, department: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  >
                    {departments
                      .filter((d) => d !== 'All')
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Degree Program
                  </label>
                  <select
                    value={isCustomProgram ? 'CUSTOM' : newStudent.program}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomProgram(true);
                        setCustomProgramInput('');
                      } else {
                        setIsCustomProgram(false);
                        setNewStudent({ ...newStudent, program: e.target.value });
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 cursor-pointer"
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
                    <optgroup label="Undergraduate & Postgraduate Programs">
                      <option value="B.Tech in Computer Science">B.Tech in Computer Science</option>
                      <option value="B.Tech in Artificial Intelligence">B.Tech in Artificial Intelligence</option>
                      <option value="B.Tech in Electronics & Robotics">B.Tech in Electronics & Robotics</option>
                      <option value="B.Tech in Mechanical & Aerospace">B.Tech in Mechanical & Aerospace</option>
                      <option value="B.Tech in Biomedical Engineering">B.Tech in Biomedical Engineering</option>
                      <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                      <option value="M.Tech in Data Science & Cloud">M.Tech in Data Science & Cloud</option>
                      <option value="B.Sc in Applied Mathematics">B.Sc in Applied Mathematics</option>
                    </optgroup>
                    <option value="CUSTOM">+ Enter Custom Course / Program</option>
                  </select>

                  {isCustomProgram && (
                    <input
                      type="text"
                      placeholder="Type custom course or program name..."
                      value={customProgramInput}
                      onChange={(e) => {
                        setCustomProgramInput(e.target.value);
                        setNewStudent({ ...newStudent, program: e.target.value });
                      }}
                      className="w-full mt-1.5 px-2.5 py-1.5 text-xs bg-white dark:bg-[#181b22] border border-emerald-500 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, semester: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fee Status
                  </label>
                  <select
                    value={newStudent.feeStatus}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        feeStatus: e.target.value as 'Paid' | 'Overdue',
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue / Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#373e4b]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#373e4b] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#2c3342] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE 360° STUDENT OVERVIEW & DOSSIER MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#373e4b]">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 dark:bg-brand/25 text-brand font-extrabold text-xl flex items-center justify-center shadow-inner">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      Active Student
                    </span>
                  </div>
                  <p className="text-slate-400 dark:text-slate-500 font-mono text-xs mt-0.5">
                    Enrollment ID: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedStudent.enrollmentNo}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c3342] transition-colors"
                title="Close Overview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Analytical KPI Metric Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200/80 dark:border-[#373e4b]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-1">
                  <Award className="w-3.5 h-3.5 text-brand" />
                  <span>Current CGPA</span>
                </div>
                <div className="text-base font-extrabold text-brand">
                  {getStudentCalculatedCGPA(selectedStudent)}{' '}
                  <span className="text-[10px] font-normal text-slate-400">/ 4.0</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200/80 dark:border-[#373e4b]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Attendance</span>
                </div>
                <div
                  className={cn(
                    'text-base font-extrabold',
                    selectedStudent.attendancePct >= 75 ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {selectedStudent.attendancePct}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200/80 dark:border-[#373e4b]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Semester</span>
                </div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  Sem {selectedStudent.semester}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200/80 dark:border-[#373e4b]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fee Status</span>
                </div>
                <div
                  className={cn(
                    'text-xs font-extrabold px-2 py-0.5 rounded-md inline-block uppercase tracking-wider',
                    selectedStudent.feeStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  )}
                >
                  {selectedStudent.feeStatus}
                </div>
              </div>
            </div>

            {/* Academic & Personal Dossier Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Left Column: Academic Details */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#1e232d] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#373e4b]">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4 text-brand" />
                  <span>Academic Profile</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {selectedStudent.department}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Program:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {selectedStudent.program}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Section:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Section {selectedStudent.section || 'A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Admission Year:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.admissionYear || 2026}
                  </span>
                </div>
              </div>

              {/* Right Column: Contact & Mentor */}
              <div className="space-y-2 bg-slate-50 dark:bg-[#1e232d] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#373e4b]">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Advisory & Contact</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Assigned Mentor:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.mentor || 'Prof. Marcus Vance'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Student Email:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {selectedStudent.email}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-[#2f3744]">
                  <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStudent.phone || '+1 (555) 019-2834'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Campus Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Good Standing</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Examination & Marks Records for this Student */}
            <div className="bg-slate-50 dark:bg-[#1e232d] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#373e4b] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-brand" />
                  <span>Examination & Grades Snapshot</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {getSelectedStudentResults(selectedStudent).length} Record(s) Found
                </span>
              </div>

              {getSelectedStudentResults(selectedStudent).length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {getSelectedStudentResults(selectedStudent).map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between bg-white dark:bg-[#252b35] p-2.5 rounded-lg border border-slate-200/60 dark:border-[#2f3744] text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {res.examTitle || 'Semester Examination'}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-2">Sem {res.semester}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded">
                          SGPA: {res.sgpa}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {res.creditsCompleted || 20} Credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 py-2 italic text-center">
                  No published exam transcripts on file. SGPA will automatically sync after grading.
                </p>
              )}
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#373e4b]">
              <div className="flex items-center gap-2">
                {(role === 'Admin' || role === 'Faculty') && (
                  <button
                    type="button"
                    onClick={() => handleToggleFeeStatus(selectedStudent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#373e4b] hover:bg-slate-100 dark:hover:bg-[#2c3342] text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      Toggle Fee Status to {selectedStudent.feeStatus === 'Paid' ? 'Overdue' : 'Paid'}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
