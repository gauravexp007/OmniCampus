import React, { useState } from 'react';
import {
  CalendarCheck2,
  Users,
  GraduationCap,
  Award,
  ShieldCheck,
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { FacultyAttendanceRegister } from './attendance/FacultyAttendanceRegister';
import { StudentAttendanceDashboard } from './attendance/StudentAttendanceDashboard';
import { AttendanceAuditHistory } from './attendance/AttendanceAuditHistory';
import { StudentMonthlyAttendanceVisualizer } from './attendance/StudentMonthlyAttendanceVisualizer';
import { FacultyAttendanceRecord } from '../../types';
import { AnimatedSegmentedToggle } from '../ui/AnimatedSegmentedToggle';
import { ConfettiButton } from '../ui/ConfettiButton';

export const AttendanceModule: React.FC = () => {
  const { role, currentUser, addFacultyAttendanceRecord } = useERP();

  // Active Tab:
  // Faculty & Admin default to 'register' (the 1-click relational marking table)
  // Student defaults to 'dashboard' (their total attendance with present & absent)
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard' | 'monthly' | 'history'>(
    role === 'Student' ? 'dashboard' : 'register'
  );

  // Faculty Duty Check-In Modal State
  const [isFacultyDutyModalOpen, setIsFacultyDutyModalOpen] = useState(false);
  const [facultyDutyForm, setFacultyDutyForm] = useState({
    facultyName: currentUser?.name || 'Dr. Marcus Vance',
    employeeId: currentUser?.employeeId || 'EMP-FAC-084',
    department: currentUser?.department || 'Computer Science & AI',
    designation: 'Professor',
    date: new Date().toISOString().split('T')[0],
    status: 'Present' as FacultyAttendanceRecord['status'],
    checkInTime: '08:30 AM',
    assignedLecture: 'CS-301: Distributed Systems',
    lectureRoom: 'Turing Hall 301',
    leaveReason: '',
  });

  const handleFacultyDutySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFacultyAttendanceRecord({
      id: `fac-att-${Date.now()}`,
      facultyId: currentUser?.id || 'fac-01',
      facultyName: facultyDutyForm.facultyName,
      employeeId: facultyDutyForm.employeeId,
      department: facultyDutyForm.department,
      designation: facultyDutyForm.designation,
      date: facultyDutyForm.date,
      status: facultyDutyForm.status,
      checkInTime: facultyDutyForm.checkInTime,
      assignedLecture: facultyDutyForm.assignedLecture,
      lectureRoom: facultyDutyForm.lectureRoom,
      leaveReason: facultyDutyForm.leaveReason,
    });
    setIsFacultyDutyModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER: TITLE & ROLE BADGE (Clutter-free, extra descriptive text removed) */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-brand-light text-brand border border-brand/20">
              <CalendarCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Campus Attendance Management
              </h2>
            </div>
          </div>
        </div>

        {/* Right side: Role badge & Quick Duty button for faculty */}
        <div className="flex items-center gap-2 shrink-0">
          {role === 'Admin' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Admin: Read-Only Audit</span>
            </span>
          ) : role === 'Faculty' ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Faculty: Authorized Marker</span>
              </span>
              <ConfettiButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFacultyDutyModalOpen(true)}
                enableClickCelebration={false}
                className="bg-brand-light text-brand border-brand/20 hover:bg-brand-lighter"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Duty Check-In</span>
              </ConfettiButton>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-light text-brand border border-brand/20">
              <GraduationCap className="w-4 h-4 text-brand" />
              <span>Student Portal</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. NAVIGATION TABS (ANIMATED SEGMENTED TOGGLE) */}
      <div className="border-b border-slate-200 dark:border-[#373e4b] pb-3 flex items-center justify-between flex-wrap gap-2">
        <AnimatedSegmentedToggle
          value={activeTab}
          onChange={(val) => setActiveTab(val as typeof activeTab)}
          layoutId="attendance-nav-pill"
          size="md"
          options={[
            ...(role === 'Faculty' || role === 'Admin'
              ? [
                  {
                    value: 'register' as const,
                    label: 'Classroom Register',
                    icon: <BookOpen className="w-3.5 h-3.5" />,
                  },
                ]
              : [
                  {
                    value: 'dashboard' as const,
                    label: 'My Attendance Summary',
                    icon: <GraduationCap className="w-3.5 h-3.5" />,
                  },
                ]),
            {
              value: 'monthly' as const,
              label:
                role === 'Student'
                  ? 'Monthly Visual Calendar'
                  : 'Monthly Student Record Visualizer',
              icon: <CalendarIcon className="w-3.5 h-3.5" />,
            },
            {
              value: 'history' as const,
              label:
                role === 'Admin'
                  ? 'Multi-Department Audit Records'
                  : 'Campus Attendance Records',
              icon: <CalendarCheck2 className="w-3.5 h-3.5" />,
            },
          ]}
        />
      </div>

      {/* 3. ACTIVE CONTENT RENDER */}
      {activeTab === 'register' && (role === 'Faculty' || role === 'Admin') && <FacultyAttendanceRegister />}

      {activeTab === 'dashboard' && <StudentAttendanceDashboard />}

      {activeTab === 'monthly' && <StudentMonthlyAttendanceVisualizer />}

      {activeTab === 'history' && <AttendanceAuditHistory />}

      {/* FACULTY DUTY MODAL */}
      {isFacultyDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Award className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-900">Faculty Daily Duty Log</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsFacultyDutyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFacultyDutySubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  disabled
                  value={facultyDutyForm.facultyName}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={facultyDutyForm.date}
                    onChange={(e) =>
                      setFacultyDutyForm({ ...facultyDutyForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={facultyDutyForm.status}
                    onChange={(e) =>
                      setFacultyDutyForm({
                        ...facultyDutyForm,
                        status: e.target.value as FacultyAttendanceRecord['status'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Present">Present (On Campus)</option>
                    <option value="In Lecture">In Lecture</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Lecture</label>
                <input
                  type="text"
                  value={facultyDutyForm.assignedLecture}
                  onChange={(e) =>
                    setFacultyDutyForm({ ...facultyDutyForm, assignedLecture: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFacultyDutyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Duty Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
