import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Plus,
  Trash2,
  Download,
  X,
  Eye,
  CheckCircle,
  Calculator,
  BookOpen,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ResultRecord } from '../../types';
import { cn } from '../../lib/utils';
import { SGPAProgressionChart } from './results/SGPAProgressionChart';
import { ConfettiButton } from '../ui/ConfettiButton';

interface SubjectMarkEntry {
  subjectName: string;
  credits: number;
  marks: number;
}

const DEFAULT_SUBJECTS: Record<string, SubjectMarkEntry[]> = {
  'Computer Science & AI': [
    { subjectName: 'Data Structures & Algorithms', credits: 4, marks: 88 },
    { subjectName: 'Operating Systems & Concurrency', credits: 4, marks: 91 },
    { subjectName: 'Database Management Systems', credits: 3, marks: 84 },
    { subjectName: 'Computer Networks & Security', credits: 3, marks: 86 },
  ],
  'Electronics & Robotics': [
    { subjectName: 'Digital Signal Processing', credits: 4, marks: 85 },
    { subjectName: 'Microcontrollers & Embedded Systems', credits: 4, marks: 82 },
    { subjectName: 'Robotic Kinematics & Control', credits: 3, marks: 88 },
    { subjectName: 'VLSI Circuit Design', credits: 3, marks: 79 },
  ],
  'Biomedical Engineering': [
    { subjectName: 'Biomedical Signal Processing', credits: 4, marks: 87 },
    { subjectName: 'Physiological Modeling', credits: 4, marks: 84 },
    { subjectName: 'Medical Imaging Systems', credits: 3, marks: 90 },
    { subjectName: 'Neural Engineering & Implants', credits: 3, marks: 82 },
  ],
  'Mechanical & Aerospace': [
    { subjectName: 'Thermodynamics & Heat Transfer', credits: 4, marks: 83 },
    { subjectName: 'Aerodynamics & Flight Dynamics', credits: 4, marks: 86 },
    { subjectName: 'Solid Mechanics & FEA', credits: 3, marks: 80 },
    { subjectName: 'Propulsion & Combustion', credits: 3, marks: 85 },
  ],
  'School of Management': [
    { subjectName: 'Financial Analytics & Corporate Finance', credits: 4, marks: 89 },
    { subjectName: 'Strategic Management & Leadership', credits: 4, marks: 92 },
    { subjectName: 'Marketing Management & Consumer Insights', credits: 3, marks: 86 },
    { subjectName: 'Operations & Supply Chain Management', credits: 3, marks: 84 },
  ],
};

const getGradePointFromMarks = (marks: number): { point: number; grade: ResultRecord['grade'] } => {
  if (marks >= 90) return { point: 4.0, grade: 'A+' };
  if (marks >= 80) return { point: 3.7, grade: 'A' };
  if (marks >= 70) return { point: 3.3, grade: 'B+' };
  if (marks >= 60) return { point: 3.0, grade: 'B' };
  if (marks >= 50) return { point: 2.0, grade: 'C' };
  return { point: 0.0, grade: 'F' };
};

export const ResultsModule: React.FC = () => {
  const { results, students, addResult, deleteResult, role, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New result form state
  const [newResult, setNewResult] = useState({
    studentName: '',
    enrollmentNo: '',
    department: 'Computer Science & AI',
    semester: 6,
    status: 'Published' as ResultRecord['status'],
  });

  const [subjectMarks, setSubjectMarks] = useState<SubjectMarkEntry[]>(
    DEFAULT_SUBJECTS['Computer Science & AI']
  );

  const departments = [
    'Computer Science & AI',
    'Electronics & Robotics',
    'Mechanical & Aerospace',
    'Biomedical Engineering',
    'School of Management',
  ];

  // Automatic Academic Analysis: SGPA, CGPA, Credits, Backlogs calculated from subject marks
  const calculationSummary = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    let backlogs = 0;

    subjectMarks.forEach((sub) => {
      const cred = Math.max(1, Number(sub.credits) || 1);
      const m = Math.max(0, Math.min(100, Number(sub.marks) || 0));
      const { point, grade } = getGradePointFromMarks(m);
      if (grade === 'F') backlogs += 1;
      totalCredits += cred;
      totalPoints += point * cred;
    });

    const calculatedSGPA = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;

    // Cumulative CGPA calculation including previous published semesters for this student
    const existingStudentResults = results.filter(
      (r) =>
        r.enrollmentNo &&
        newResult.enrollmentNo &&
        r.enrollmentNo.toLowerCase() === newResult.enrollmentNo.trim().toLowerCase()
    );

    let priorCredits = 0;
    let priorPoints = 0;
    existingStudentResults.forEach((r) => {
      const cr = Number(r.creditsCompleted) || 20;
      const s = Number(r.sgpa) || 0;
      priorCredits += cr;
      priorPoints += s * cr;
    });

    const cumulativeCredits = priorCredits + totalCredits;
    const cumulativePoints = priorPoints + totalPoints;
    const calculatedCGPA =
      cumulativeCredits > 0
        ? Number((cumulativePoints / cumulativeCredits).toFixed(2))
        : calculatedSGPA;

    // Overall Letter Grade derived from SGPA
    let overallGrade: ResultRecord['grade'] = 'F';
    if (calculatedSGPA >= 3.8) overallGrade = 'A+';
    else if (calculatedSGPA >= 3.5) overallGrade = 'A';
    else if (calculatedSGPA >= 3.0) overallGrade = 'B+';
    else if (calculatedSGPA >= 2.5) overallGrade = 'B';
    else if (calculatedSGPA >= 2.0) overallGrade = 'C';

    const totalMarks = subjectMarks.reduce((acc, sub) => acc + (Number(sub.marks) || 0), 0);
    const avgPercentage = subjectMarks.length > 0 ? (totalMarks / subjectMarks.length).toFixed(1) : '0';

    return {
      sgpa: calculatedSGPA,
      cgpa: calculatedCGPA,
      totalCredits,
      totalPoints,
      avgPercentage,
      backlogs,
      grade: overallGrade,
      priorSemestersCount: existingStudentResults.length,
    };
  }, [subjectMarks, newResult.enrollmentNo, results]);

  const handleResetDepartmentSubjects = () => {
    if (DEFAULT_SUBJECTS[newResult.department]) {
      setSubjectMarks(DEFAULT_SUBJECTS[newResult.department]);
    }
  };

  const handleStudentSelect = (selectedEnrollment: string) => {
    const found = students.find((s) => s.enrollmentNo === selectedEnrollment);
    if (found) {
      setNewResult({
        ...newResult,
        studentName: found.name,
        enrollmentNo: found.enrollmentNo,
        department: found.department,
        semester: found.semester,
      });
      if (DEFAULT_SUBJECTS[found.department]) {
        setSubjectMarks(DEFAULT_SUBJECTS[found.department]);
      }
    }
  };

  const handleSubjectChange = (
    index: number,
    field: keyof SubjectMarkEntry,
    value: string | number
  ) => {
    setSubjectMarks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSubjectRow = () => {
    setSubjectMarks((prev) => [
      ...prev,
      { subjectName: `Elective Subject ${prev.length + 1}`, credits: 3, marks: 80 },
    ]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    if (subjectMarks.length <= 1) return;
    setSubjectMarks((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredResults = results.filter((r) => {
    return (
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.studentName.trim()) return;

    addResult({
      studentId: `std-${Date.now()}`,
      studentName: newResult.studentName.trim(),
      enrollmentNo:
        newResult.enrollmentNo.trim() ||
        `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      department: newResult.department,
      semester: Number(newResult.semester) || 1,
      sgpa: calculationSummary.sgpa,
      cgpa: calculationSummary.cgpa,
      grade: calculationSummary.grade,
      backlogs: calculationSummary.backlogs,
      creditsCompleted: calculationSummary.totalCredits,
      status: newResult.status,
      rank: 1,
    });

    setIsAddModalOpen(false);
    setNewResult({
      studentName: '',
      enrollmentNo: '',
      department: 'Computer Science & AI',
      semester: 6,
      status: 'Published',
    });
    setSubjectMarks(DEFAULT_SUBJECTS['Computer Science & AI']);
  };

  const handleExportGazette = () => {
    if (results.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Enrollment,Student Name,Department,Semester,SGPA,CGPA,Grade,Status']
        .concat(
          results.map(
            (r) =>
              `${r.enrollmentNo},"${r.studentName}","${r.department}",${r.semester},${r.sgpa},${r.cgpa},${r.grade},${r.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Semester_Results_Gazette.csv');
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
            <h2 className="text-lg font-bold text-slate-900">
              {role === 'Student' ? 'My Grades & Transcripts' : 'Results & Grade Management'}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {results.length} {results.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'Student'
              ? 'View semester SGPA, cumulative CGPA, and official transcript records.'
              : 'Grade point moderation, marks entry, and official gazette publication.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <ConfettiButton
              variant="outline"
              size="sm"
              onClick={handleExportGazette}
              enableClickCelebration={false}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Gazette</span>
            </ConfettiButton>
          )}

          {role !== 'Student' && (
            <ConfettiButton
              variant="brand"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              enableClickCelebration={false}
            >
              <Plus className="w-4 h-4" />
              <span>Enter Grade / Marks</span>
            </ConfettiButton>
          )}
        </div>
      </div>

      {/* 8-Semester SGPA Progression Chart */}
      <SGPAProgressionChart />

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, enrollment ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
          />
        </div>
      </div>

      {/* Results Table */}
      {filteredResults.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Enrollment</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3">SGPA</th>
                  <th className="px-4 py-3">CGPA</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  {role !== 'Student' && <th className="px-4 py-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{result.studentName}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {result.enrollmentNo}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{result.department}</td>
                    <td className="px-4 py-3 font-medium">Sem {result.semester}</td>
                    <td className="px-4 py-3 font-bold text-brand">{result.sgpa}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{result.cgpa}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {result.status}
                      </span>
                    </td>
                    {role !== 'Student' && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteResult(result.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Result"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
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
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Examination Results Published</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {role === 'Student'
              ? 'Semester results and grade sheets have not been published yet.'
              : 'No results recorded yet. Enter marks or import grades to populate the gazette.'}
          </p>
          {role !== 'Student' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Enter First Grade</span>
            </button>
          )}
        </div>
      )}

      {/* Add Grade Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand/10 text-brand">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Enter Student Examination Marks & Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Input course-level scores. Real-time weighted SGPA, cumulative CGPA, and letter grades are calculated automatically.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleAddResult} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Student Quick Selector */}
              {students.length > 0 && (
                <div className="bg-brand-light/60 p-3 rounded-xl border border-brand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Quick Student Auto-Fill</span>
                      <p className="text-[10px] text-slate-500">Select an existing registered student to populate credentials and calculate cumulative CGPA.</p>
                    </div>
                  </div>
                  <select
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="sm:w-80 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand cursor-pointer shadow-2xs font-medium"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      -- Choose a registered student --
                    </option>
                    {students.map((s) => (
                      <option key={s.id} value={s.enrollmentNo}>
                        {s.name} ({s.enrollmentNo}) - {s.department} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Basic Student Credentials 4-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aria Chen"
                    value={newResult.studentName}
                    onChange={(e) => setNewResult({ ...newResult, studentName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Enrollment ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STU-2024-CS-084"
                    value={newResult.enrollmentNo}
                    onChange={(e) => setNewResult({ ...newResult, enrollmentNo: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand text-slate-800 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={newResult.department}
                    onChange={(e) => {
                      const newDept = e.target.value;
                      setNewResult({ ...newResult, department: newDept });
                      if (DEFAULT_SUBJECTS[newDept]) {
                        setSubjectMarks(DEFAULT_SUBJECTS[newDept]);
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand text-slate-800"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={newResult.semester}
                    onChange={(e) =>
                      setNewResult({ ...newResult, semester: Number(e.target.value) })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Broader, Compact Subject Course Marks Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {/* Header Toolbar */}
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-slate-800">
                      Subject Examination Marks & Credits
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                      {subjectMarks.length} Courses
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand/10 text-brand">
                      {calculationSummary.totalCredits} Total Credits
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDepartmentSubjects}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Reset subjects to department curriculum default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Standard Courses</span>
                    </button>
                    <ConfettiButton
                      type="button"
                      variant="brand"
                      size="sm"
                      onClick={handleAddSubjectRow}
                      enableClickCelebration={false}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Subject</span>
                    </ConfettiButton>
                  </div>
                </div>

                {/* Table Column Headers */}
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-5">Subject / Course Name</div>
                  <div className="col-span-2 text-center">Credits</div>
                  <div className="col-span-2 text-center">Marks (0–100)</div>
                  <div className="col-span-1 text-center">Grade Point</div>
                  <div className="col-span-1 text-right pr-2">Action</div>
                </div>

                {/* Subject Rows (Generous max-h with zero cramping) */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {subjectMarks.map((sub, idx) => {
                    const { point, grade } = getGradePointFromMarks(sub.marks);
                    const isFailing = grade === 'F';
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center px-3 sm:px-4 py-2 hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Index */}
                        <div className="hidden sm:flex col-span-1 justify-center text-xs font-semibold text-slate-400">
                          {idx + 1}
                        </div>

                        {/* Subject Title */}
                        <div className="col-span-1 sm:col-span-5">
                          <input
                            type="text"
                            value={sub.subjectName}
                            onChange={(e) =>
                              handleSubjectChange(idx, 'subjectName', e.target.value)
                            }
                            placeholder="Course title..."
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand text-slate-800 font-medium placeholder:text-slate-400"
                          />
                        </div>

                        {/* Credits */}
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-start sm:justify-center gap-1.5">
                          <span className="sm:hidden text-[10px] font-semibold text-slate-500 w-16">Credits:</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={sub.credits}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'credits', Number(e.target.value))
                              }
                              title="Course Credit Hours (1 to 6)"
                              className="w-14 px-2 py-1.5 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-brand text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-[11px] font-medium text-slate-500">cr</span>
                          </div>
                        </div>

                        {/* Marks */}
                        <div className="col-span-1 sm:col-span-2 flex items-center justify-start sm:justify-center gap-1.5">
                          <span className="sm:hidden text-[10px] font-semibold text-slate-500 w-16">Marks:</span>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={sub.marks}
                              onChange={(e) =>
                                handleSubjectChange(idx, 'marks', Number(e.target.value))
                              }
                              placeholder="0–100"
                              className={cn(
                                "w-16 px-2 py-1.5 text-center text-xs font-black rounded-lg focus:bg-white focus:border-brand border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                isFailing
                                  ? "bg-rose-50 border-rose-300 text-rose-700"
                                  : "bg-slate-50 border-slate-200 text-slate-900"
                              )}
                            />
                            <span className="text-[11px] font-medium text-slate-400">/ 100</span>
                          </div>
                        </div>

                        {/* Grade Point & Letter */}
                        <div className="col-span-1 sm:col-span-1 flex items-center justify-start sm:justify-center">
                          <span className="sm:hidden text-[10px] font-semibold text-slate-500 w-16">Grade:</span>
                          <span
                            className={cn(
                              'px-2 py-1 rounded-md text-[11px] font-bold text-center border shrink-0',
                              isFailing
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : point >= 3.8
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : point >= 3.0
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            )}
                          >
                            {point.toFixed(1)} {grade}
                          </span>
                        </div>

                        {/* Delete Row Action */}
                        <div className="col-span-1 sm:col-span-1 flex items-center justify-end pr-1">
                          {subjectMarks.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubjectRow(idx)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete subject row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="w-6" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Broader, Compact Automatic Academic Analysis Section */}
              <div className="bg-brand-light/60 p-4 rounded-xl border border-brand/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-slate-900">
                      Automatic Academic Analysis (Calculated)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                    <span>Average Marks: <strong className="text-slate-900">{calculationSummary.avgPercentage}%</strong></span>
                    <span>Total Points: <strong className="text-slate-900">{calculationSummary.totalPoints.toFixed(1)} pts</strong></span>
                    <span className="text-brand font-semibold">Based on {subjectMarks.length} Course Subjects</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {/* SGPA Card */}
                  <div className="bg-white p-3 rounded-xl border border-brand/20 shadow-2xs hover:shadow-xs transition-shadow">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SEMESTER SGPA</p>
                    <p className="text-xl sm:text-2xl font-black text-brand tracking-tight mt-0.5">
                      {calculationSummary.sgpa.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Sem {newResult.semester} Grade Point</p>
                  </div>

                  {/* CGPA Card */}
                  <div className="bg-white p-3 rounded-xl border border-brand/20 shadow-2xs hover:shadow-xs transition-shadow">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CUMULATIVE CGPA</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {calculationSummary.cgpa.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {calculationSummary.priorSemestersCount > 0
                        ? `Aggregated (${calculationSummary.priorSemestersCount + 1} Sems)`
                        : 'First Semester Basis'}
                    </p>
                  </div>

                  {/* Overall Grade Card */}
                  <div className="bg-white p-3 rounded-xl border border-brand/20 shadow-2xs hover:shadow-xs transition-shadow">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SEMESTER GRADE</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight mt-0.5">
                      {calculationSummary.grade}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {calculationSummary.totalCredits} Earned Credits
                    </p>
                  </div>

                  {/* Backlogs Card */}
                  <div className="bg-white p-3 rounded-xl border border-brand/20 shadow-2xs hover:shadow-xs transition-shadow">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">BACKLOGS</p>
                    <p
                      className={cn(
                        'text-xl sm:text-2xl font-black tracking-tight mt-0.5',
                        calculationSummary.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'
                      )}
                    >
                      {calculationSummary.backlogs}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {calculationSummary.backlogs === 0 ? 'All Courses Cleared' : 'Requires Retake'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Publication Status & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-700 shrink-0">
                    Publication Status:
                  </label>
                  <select
                    value={newResult.status}
                    onChange={(e) =>
                      setNewResult({
                        ...newResult,
                        status: e.target.value as ResultRecord['status'],
                      })
                    }
                    className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 font-medium"
                  >
                    <option value="Published">Published to Student Portal</option>
                    <option value="Under Moderation">Under Moderation</option>
                    <option value="Withheld">Withheld</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <ConfettiButton
                    type="submit"
                    variant="brand"
                    size="md"
                    enableClickCelebration={true}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save Result Record</span>
                  </ConfettiButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
