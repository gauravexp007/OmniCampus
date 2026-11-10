import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Award,
} from 'lucide-react';
import { ERPModuleId } from '../../types';
import { useERP } from '../../context/ERPContext';
import { modalBackdropVariants, modalDialogVariants } from '../../utils/motion';

interface CommandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ERPModuleId) => void;
}

export const CommandDialog: React.FC<CommandDialogProps> = ({
  isOpen,
  onClose,
  onSelectModule,
}) => {
  const { students, faculty, courses, exams, role } = useERP();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(query.toLowerCase()) ||
      s.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.specialization.toLowerCase().includes(query.toLowerCase()) ||
      f.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredExams = exams.filter(
    (e) =>
      e.courseTitle.toLowerCase().includes(query.toLowerCase()) ||
      e.courseCode.toLowerCase().includes(query.toLowerCase()) ||
      e.examCode.toLowerCase().includes(query.toLowerCase())
  );

  const quickActions = [
    { label: 'Campus Insights & Overview', module: 'dashboard' as ERPModuleId, icon: Sparkles },
    { label: 'View Today’s Timetable', module: 'timetable' as ERPModuleId, icon: CalendarDays },
    { label: 'Check Lecture Attendance', module: 'attendance' as ERPModuleId, icon: BookOpen },
    { label: 'Verify Exam Schedules & Dates', module: 'exams' as ERPModuleId, icon: FileSpreadsheet },
    { label: 'Check Results & Grades', module: 'results' as ERPModuleId, icon: Award },
    ...(role === 'Admin'
      ? [
          { label: 'Go to Student Directory', module: 'students' as ERPModuleId, icon: GraduationCap },
          { label: 'Audit Fee Settlements & Invoices', module: 'finance' as ERPModuleId, icon: DollarSign },
          { label: 'Check Hostel Room Allocations', module: 'hostel' as ERPModuleId, icon: Building2 },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="command-palette-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4"
          onClick={onClose}
        >
          <motion.div
            id="command-palette-modal"
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-2xl bg-white dark:bg-[#435055] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#55666d] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-3 px-3.5 sm:px-4 py-3.5 border-b border-slate-200 dark:border-[#55666d]">
              <Search className="w-5 h-5 text-brand shrink-0" />
              <input
                id="command-search-input"
                type="text"
                placeholder="Search courses, exams, students, faculty, or actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#a3f7bf]/60 text-xs sm:text-sm focus:outline-hidden"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="btn-press p-1 rounded-lg text-slate-400 dark:text-[#a3f7bf]/80 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="text-[10px] font-semibold text-slate-400 dark:text-[#a3f7bf] px-1.5 py-0.2 bg-slate-100 dark:bg-[#354146] rounded border border-slate-200 dark:border-[#55666d] hidden sm:inline">
                ESC
              </span>
            </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Navigations */}
          {!query && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Navigation & Shortcuts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectModule(action.module);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#354146] text-slate-700 dark:text-[#e5e5e5] hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-[#29a19c]/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#354146] group-hover:bg-slate-200 dark:group-hover:bg-[#29a19c] text-slate-600 dark:text-[#a3f7bf] group-hover:text-slate-900 dark:group-hover:text-white shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold truncate">{action.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-[#a3f7bf]/70 group-hover:text-slate-900 dark:group-hover:text-[#a3f7bf] opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Courses */}
          {query && filteredCourses.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#a3f7bf] mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-[#a3f7bf]" />
                Academic Courses ({filteredCourses.length})
              </p>
              <div className="space-y-1">
                {filteredCourses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectModule('academics');
                      onClose();
                    }}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#354146] border border-transparent hover:border-slate-200 dark:hover:border-[#29a19c]/40 transition-all text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-[#29a19c]/20 text-indigo-700 dark:text-[#a3f7bf] font-bold text-[10px]">
                          {c.code}
                        </span>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{c.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#a3f7bf]/70 mt-0.5">
                        Instructor: {c.instructor} • {c.credits} Credits
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Exams */}
          {query && filteredExams.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                Examinations ({filteredExams.length})
              </p>
              <div className="space-y-1">
                {filteredExams.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onSelectModule('exams');
                      onClose();
                    }}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px]">
                          {e.examCode}
                        </span>
                        <p className="text-xs font-bold text-slate-800">{e.courseTitle}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {e.date} • {e.time} • {e.venue}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {e.examType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Students */}
          {query && filteredStudents.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                Students ({filteredStudents.length})
              </p>
              <div className="space-y-1">
                {filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onSelectModule('students');
                      onClose();
                    }}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.enrollmentNo} • {s.program}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Faculty */}
          {query && filteredFaculty.length > 0 && (
            <div>
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Faculty Members ({filteredFaculty.length})
              </p>
              <div className="space-y-1">
                {filteredFaculty.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      onSelectModule('faculty');
                      onClose();
                    }}
                    className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{f.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {f.designation} • {f.department}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query &&
            filteredStudents.length === 0 &&
            filteredFaculty.length === 0 &&
            filteredCourses.length === 0 &&
            filteredExams.length === 0 && (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs font-semibold text-slate-700">No records found for "{query}"</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try searching by course title, exam code, student name, or department.
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#354146] border-t border-slate-200 dark:border-[#55666d] flex items-center justify-between text-[10px] text-slate-500 dark:text-[#a3f7bf]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#29a19c]" />
            <span>OmniCampus Quick Search</span>
          </div>
          <span className="hidden sm:inline">Press <b>ESC</b> to close</span>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
