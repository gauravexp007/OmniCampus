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
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Student } from '../../types';
import { cn } from '../../lib/utils';
import { SKETCH_STUDENT } from '../../utils/sketchAvatars';

export const StudentsModule: React.FC = () => {
  const { students, courses, results, addStudent, deleteStudent, role } = useERP();
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
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Student Directory</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {students.length} {students.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Student registrations, academic records, and department enrollment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {students.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {(role === 'Admin' || role === 'Faculty') && (
            <button
              id="add-student-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, enrollment ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand focus:bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            aria-label="Filter by department"
            className="w-full sm:w-44 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-700"
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
            className="w-full sm:w-36 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-700"
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

      {/* Main List / Table */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Enrollment ID</th>
                  <th className="px-4 py-3">Department & Program</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">CGPA</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Fee Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.name}</p>
                          <p className="text-[11px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {student.enrollmentNo}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{student.department}</p>
                      <p className="text-[10px] text-slate-400">{student.program}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">Sem {student.semester}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {getStudentCalculatedCGPA(student) === 'Pending' ? (
                        <span className="text-[11px] font-normal text-slate-400 italic">Pending Exams</span>
                      ) : (
                        <span className="text-brand font-bold">{getStudentCalculatedCGPA(student)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-semibold text-[11px]',
                          student.attendancePct >= 75 ? 'text-emerald-600' : 'text-rose-600'
                        )}
                      >
                        {student.attendancePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-semibold',
                          student.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        )}
                      >
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          title="View Details"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(role === 'Admin' || role === 'Faculty') && (
                          <button
                            onClick={() => deleteStudent(student.id)}
                            title="Delete Student"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Student Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedDepartment !== 'All'
              ? 'No students match your active filter criteria.'
              : 'There are no students in the database. Add a new student record to get started.'}
          </p>
          {(role === 'Admin' || role === 'Faculty') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Student</span>
            </button>
          )}
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Enrollment ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={newStudent.enrollmentNo}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, enrollmentNo: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@university.edu"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={newStudent.department}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, department: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
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
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 cursor-pointer"
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
                      className="w-full mt-1.5 px-2.5 py-1.5 text-xs bg-white border border-brand rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
                      autoFocus
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={newStudent.semester}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, semester: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue / Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Drawer/Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Student Profile</h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-light text-brand font-bold text-base flex items-center justify-center">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedStudent.name}</h4>
                  <p className="text-slate-400 font-mono text-[11px]">
                    {selectedStudent.enrollmentNo}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Program:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.program}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Semester:</span>
                  <span className="font-semibold text-slate-800">
                    Semester {selectedStudent.semester}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CGPA:</span>
                  <span className="font-semibold text-slate-800">
                    {getStudentCalculatedCGPA(selectedStudent)} {getStudentCalculatedCGPA(selectedStudent) !== 'Pending' ? '/ 4.0' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attendance:</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedStudent.attendancePct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee Status:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedStudent.feeStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
