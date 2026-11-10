import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Download,
  QrCode,
  ShieldCheck,
  X,
  Eye,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ExamRecord } from '../../types';

export const ExamsModule: React.FC = () => {
  const { exams, addExam, toggleExamHallTicket, deleteExam, role, currentUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamForTicket, setSelectedExamForTicket] = useState<ExamRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New exam form state
  const [newExam, setNewExam] = useState({
    examCode: '',
    courseCode: '',
    courseTitle: '',
    examType: 'Mid-Term Exam' as ExamRecord['examType'],
    date: '2026-10-15',
    time: '10:00 AM - 01:00 PM',
    durationMinutes: 180,
    venue: 'Examination Hall 1',
    chiefInvigilator: 'Dr. Arthur Pendelton',
  });

  const filteredExams = exams.filter((e) => {
    return (
      e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.examCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.courseTitle.trim()) return;

    addExam({
      examCode:
        newExam.examCode.trim().toUpperCase() ||
        `EXAM-${Math.floor(100 + Math.random() * 900)}`,
      courseCode:
        newExam.courseCode.trim().toUpperCase() ||
        `CS-${Math.floor(100 + Math.random() * 900)}`,
      courseTitle: newExam.courseTitle.trim(),
      examType: newExam.examType,
      date: newExam.date,
      time: newExam.time,
      durationMinutes: Number(newExam.durationMinutes) || 180,
      venue: newExam.venue.trim() || 'Central Hall',
      totalRegistered: 45,
      chiefInvigilator: newExam.chiefInvigilator.trim() || 'Controller of Exams',
      hallTicketStatus: 'Released',
    });

    setIsAddModalOpen(false);
    setNewExam({
      examCode: '',
      courseCode: '',
      courseTitle: '',
      examType: 'Mid-Term Exam',
      date: '2026-10-15',
      time: '10:00 AM - 01:00 PM',
      durationMinutes: 180,
      venue: 'Examination Hall 1',
      chiefInvigilator: 'Dr. Arthur Pendelton',
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {role === 'Student' ? 'Examinations & Hall Tickets' : 'Examination Management & Hall Tickets'}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {exams.length} {exams.length === 1 ? 'Exam' : 'Exams'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'Student'
              ? 'Check exam schedules, reporting timings, seat locations, and download your biometric hall ticket.'
              : 'Semester exam schedules, hall ticket generation, invigilation duty, and venue allocation.'}
          </p>
        </div>

        {role !== 'Student' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exams by subject title, course code, or exam ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
          />
        </div>
      </div>

      {/* Exams List */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-brand">
                    {exam.courseCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {exam.examType}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mb-3">{exam.courseTitle}</h4>

                <div className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.time} ({exam.durationMinutes} mins)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.venue}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedExamForTicket(exam)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{role === 'Student' ? 'View Hall Ticket' : 'Hall Ticket'}</span>
                </button>

                {role === 'Admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExamHallTicket(exam.id)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                    >
                      {exam.hallTicketStatus === 'Released' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Scheduled Examinations</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {role === 'Student'
              ? 'No exams are currently published for your academic program.'
              : 'There are no active examination schedules. Add an exam slot to get started.'}
          </p>
          {role !== 'Student' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule First Exam</span>
            </button>
          )}
        </div>
      )}

      {/* Add Exam Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Schedule Examination</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExam} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Computing"
                    value={newExam.courseTitle}
                    onChange={(e) => setNewExam({ ...newExam, courseTitle: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-301"
                    value={newExam.courseCode}
                    onChange={(e) => setNewExam({ ...newExam, courseCode: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={newExam.examType}
                    onChange={(e) =>
                      setNewExam({ ...newExam, examType: e.target.value as ExamRecord['examType'] })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    <option value="Mid-Term Exam">Mid-Term Exam</option>
                    <option value="End-Semester Theory">End-Semester Theory</option>
                    <option value="Practical Viva">Practical Viva</option>
                    <option value="Supplementary">Supplementary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newExam.date}
                    onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    value={newExam.time}
                    onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Venue / Examination Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Examination Hall B"
                    value={newExam.venue}
                    onChange={(e) => setNewExam({ ...newExam, venue: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Hall Ticket Modal */}
      {selectedExamForTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <h3 className="text-sm font-bold text-slate-900">Official Biometric Hall Ticket</h3>
              </div>
              <button
                onClick={() => setSelectedExamForTicket(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/70 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono text-[10px] text-slate-400">EXAMINATION PASS</p>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedExamForTicket.courseTitle}</h4>
                  <p className="text-[11px] font-mono text-brand font-semibold">{selectedExamForTicket.courseCode}</p>
                </div>
                <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">CANDIDATE</span>
                  <span className="font-semibold text-slate-800">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STUDENT ID</span>
                  <span className="font-mono font-semibold text-slate-800">{currentUser.idNumber || 'STU-2026-CS'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DATE & TIME</span>
                  <span className="font-semibold text-slate-800">{selectedExamForTicket.date}</span>
                  <span className="block text-slate-600 text-[10px]">{selectedExamForTicket.time}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">VENUE</span>
                  <span className="font-semibold text-slate-800">{selectedExamForTicket.venue}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedExamForTicket(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Digital Hall Ticket downloaded as PDF.');
                  setSelectedExamForTicket(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
