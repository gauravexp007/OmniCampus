import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CalendarCheck2,
  FileSpreadsheet,
  Award,
  FileCheck2,
  X,
  ChevronRight,
  GraduationCap,
  Users,
  UserCheck,
} from 'lucide-react';
import { ERPModuleId } from '../../types';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { modalBackdropVariants, mobileSheetVariants } from '../../utils/motion';

interface MobileBottomNavProps {
  currentModule: ERPModuleId;
  onSelectModule: (module: ERPModuleId) => void;
  onOpenAiCopilot: () => void;
}

type ActiveSheet = 'none' | 'academics' | 'exams';

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentModule,
  onSelectModule,
}) => {
  const { role, currentUser, courses, attendanceRecords, timetableSlots, exams, results } = useERP();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');

  const isAcademicsActive = ['academics', 'timetable', 'attendance', 'students'].includes(currentModule);
  const isExamsActive = ['exams', 'results'].includes(currentModule);
  const isDocumentsActive = currentModule === 'documents';
  const isDashboardActive = currentModule === 'dashboard';
  const isProfileActive = currentModule === 'profile';

  const handleNavClick = (target: 'dashboard' | 'academics' | 'exams' | 'documents' | 'profile') => {
    if (target === 'dashboard') {
      setActiveSheet('none');
      onSelectModule('dashboard');
    } else if (target === 'documents') {
      setActiveSheet('none');
      onSelectModule('documents');
    } else if (target === 'profile') {
      setActiveSheet('none');
      onSelectModule('profile');
    } else if (target === 'academics') {
      setActiveSheet(activeSheet === 'academics' ? 'none' : 'academics');
    } else if (target === 'exams') {
      setActiveSheet(activeSheet === 'exams' ? 'none' : 'exams');
    }
  };

  const navigateAndClose = (mod: ERPModuleId) => {
    setActiveSheet('none');
    onSelectModule(mod);
  };

  return (
    <>
      {/* Action Sheet Backdrop */}
      <AnimatePresence>
        {activeSheet !== 'none' && (
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
            onClick={() => setActiveSheet('none')}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Academics Bottom Sheet */}
      <AnimatePresence>
        {activeSheet === 'academics' && (
          <motion.div
            variants={mobileSheetVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-x-0 bottom-[65px] z-50 bg-white dark:bg-[#435055] rounded-t-2xl border-t border-slate-200 dark:border-[#55666d] shadow-2xl p-4 md:hidden max-h-[80vh] overflow-y-auto text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#55666d] mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-brand">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Academic Features</h3>
                  <p className="text-[11px] text-slate-500">Curriculum, lecture routines & attendance</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSheet('none')}
                className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Course Curriculum */}
            <button
              onClick={() => navigateAndClose('academics')}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                currentModule === 'academics'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Course Curriculum</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                      {courses.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Syllabus, modules, credits & instructors</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Timetable */}
            <button
              onClick={() => navigateAndClose('timetable')}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                currentModule === 'timetable'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Class Schedule & Timetable</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                      {timetableSlots.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Weekly routine, room numbers & class slots</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Attendance */}
            <button
              onClick={() => navigateAndClose('attendance')}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                currentModule === 'attendance'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Lecture Attendance</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {attendanceRecords.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {role === 'Faculty' ? 'Mark class attendance' : 'Check attendance percentages & sessions'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Students Directory (Admin / Faculty) */}
            {role !== 'Student' && (
              <button
                onClick={() => navigateAndClose('students')}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                  currentModule === 'students'
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs">Student Directory</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Student profiles, enrollment & status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Examination Bottom Sheet */}
    <AnimatePresence>
      {activeSheet === 'exams' && (
        <motion.div
          variants={mobileSheetVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-x-0 bottom-[65px] z-50 bg-white dark:bg-[#435055] rounded-t-2xl border-t border-slate-200 dark:border-[#55666d] shadow-2xl p-4 md:hidden max-h-[80vh] overflow-y-auto text-slate-900 dark:text-white"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#55666d] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-brand">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Examinations & Results</h3>
                <p className="text-[11px] text-slate-500">Dates, timetables, hall tickets & scorecards</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSheet('none')}
              className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* Exam Schedules & Dates */}
            <button
              onClick={() => navigateAndClose('exams')}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                currentModule === 'exams'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Exam Dates & Schedule</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                      {exams.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Exam dates, rooms, seating & hall tickets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Results & Grades */}
            <button
              onClick={() => navigateAndClose('results')}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all',
                currentModule === 'results'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">Results & Transcripts</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">
                      {results.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">CGPA scorecards, semester marks & grading</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Persistent Bottom Navigation Bar on Mobile with Palette 26567 */}
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[#27323a] border-t border-slate-200 dark:border-[#55666d] px-2 py-1.5 flex items-center justify-around md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.2)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      {/* 1. Insights Button */}
      <button
        id="mobile-nav-dashboard"
        onClick={() => handleNavClick('dashboard')}
        className={cn(
          'btn-press flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 min-w-0',
          isDashboardActive ? 'text-brand font-bold' : 'text-slate-500 hover:text-slate-800'
        )}
      >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5" />
            {isDashboardActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">Overview</span>
        </button>

        {/* 2. Academics Button */}
        <button
          id="mobile-nav-academics"
          onClick={() => handleNavClick('academics')}
          className={cn(
            'btn-press flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 min-w-0',
            isAcademicsActive || activeSheet === 'academics'
              ? 'text-brand font-bold'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <BookOpen className="w-5 h-5" />
            {isAcademicsActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">Academics</span>
        </button>

        {/* 3. Examination Button */}
        <button
          id="mobile-nav-examination"
          onClick={() => handleNavClick('exams')}
          className={cn(
            'btn-press flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 min-w-0',
            isExamsActive || activeSheet === 'exams'
              ? 'text-brand font-bold'
              : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <FileSpreadsheet className="w-5 h-5" />
            {isExamsActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">Exams</span>
        </button>

        {/* 4. Documents Button */}
        <button
          id="mobile-nav-documents"
          onClick={() => handleNavClick('documents')}
          className={cn(
            'btn-press flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 min-w-0',
            isDocumentsActive ? 'text-brand font-bold' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <FileCheck2 className="w-5 h-5" />
            {isDocumentsActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">Documents</span>
        </button>

        {/* 5. Profile Button (Bottom Right Corner) */}
        <button
          id="mobile-nav-profile"
          onClick={() => handleNavClick('profile')}
          className={cn(
            'btn-press flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative flex-1 min-w-0',
            isProfileActive ? 'text-brand font-bold' : 'text-slate-500 hover:text-slate-800'
          )}
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={cn(
                'w-5 h-5 rounded-full object-cover border transition-all',
                isProfileActive ? 'border-brand ring-2 ring-brand/30 scale-105' : 'border-slate-300'
              )}
            />
            {isProfileActive && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight truncate">Profile</span>
        </button>
      </nav>
    </>
  );
};
