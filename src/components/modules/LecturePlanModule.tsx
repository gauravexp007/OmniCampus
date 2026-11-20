import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  Plus,
  Check,
  X,
  Pencil,
  Trash2,
  Send,
  Calendar,
  BookOpen,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Lock,
  User,
  Save,
  Filter,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { LecturePlanItem, LecturePlanStatus } from '../../types';
import { cn } from '../../lib/utils';

type StatusFilter = 'all' | LecturePlanStatus;

interface SubjectOption {
  code: string;
  name: string;
}

const CS_SEMESTER_SUBJECTS: Record<number, SubjectOption[]> = {
  1: [
    { code: 'CS101', name: 'Engineering Mathematics I' },
    { code: 'CS102', name: 'Programming for Problem Solving' },
    { code: 'CS103', name: 'Digital Logic & Fundamentals' },
    { code: 'CS104', name: 'Engineering Physics' },
    { code: 'CS105', name: 'C Programming Lab' },
    { code: 'CS106', name: 'Computer Hardware & Workshop Lab' },
  ],
  2: [
    { code: 'CS201', name: 'Engineering Mathematics II' },
    { code: 'CS202', name: 'Data Structures & Algorithms' },
    { code: 'CS203', name: 'Object-Oriented Programming' },
    { code: 'CS204', name: 'Discrete Mathematics' },
    { code: 'CS205', name: 'Data Structures Lab' },
    { code: 'CS206', name: 'Object-Oriented Programming Lab' },
  ],
  3: [
    { code: 'CS301', name: 'Computer Organization & Architecture' },
    { code: 'CS302', name: 'Operating Systems' },
    { code: 'CS303', name: 'Database Management Systems' },
    { code: 'CS304', name: 'Theory of Computation' },
    { code: 'CS305', name: 'Operating Systems Lab' },
    { code: 'CS306', name: 'DBMS Lab' },
  ],
  4: [
    { code: 'CS401', name: 'Design & Analysis of Algorithms' },
    { code: 'CS402', name: 'Computer Networks' },
    { code: 'CS403', name: 'Software Engineering' },
    { code: 'CS404', name: 'Microprocessors & Interfacing' },
    { code: 'CS405', name: 'Algorithms Lab' },
    { code: 'CS406', name: 'Computer Networks Lab' },
  ],
  5: [
    { code: 'CS501', name: 'Compiler Design' },
    { code: 'CS502', name: 'Artificial Intelligence' },
    { code: 'CS503', name: 'Web Technologies' },
    { code: 'CS504', name: 'Computer Graphics' },
    { code: 'CS505', name: 'Web Technologies Lab' },
    { code: 'CS506', name: 'Artificial Intelligence Lab' },
  ],
  6: [
    { code: 'CS601', name: 'Machine Learning' },
    { code: 'CS602', name: 'Cloud Computing' },
    { code: 'CS603', name: 'Information & Network Security' },
    { code: 'CS604', name: 'Mobile Application Development' },
    { code: 'CS605', name: 'Machine Learning Lab' },
    { code: 'CS606', name: 'Cloud & Security Lab' },
  ],
  7: [
    { code: 'CS701', name: 'Data Warehouse' },
    { code: 'CS702', name: 'Deep Learning' },
    { code: 'CS703', name: 'Distributed System' },
    { code: 'CS704', name: 'Big Data' },
    { code: 'CS705', name: 'Deep Learning Lab' },
    { code: 'CS706', name: 'Minor Project Lab' },
  ],
  8: [
    { code: 'CS801', name: 'Natural Language Processing' },
    { code: 'CS802', name: 'Blockchain & Decentralized Systems' },
    { code: 'CS803', name: 'Internet of Things' },
    { code: 'CS804', name: 'Software Testing & Quality Assurance' },
    { code: 'CS805', name: 'Major Project & Dissertation' },
    { code: 'CS806', name: 'Industrial Training Seminar' },
  ],
};

const getSubjectsForSemester = (sem: string | number | undefined): SubjectOption[] => {
  const num = typeof sem === 'number' ? sem : Number(sem);
  if (!Number.isFinite(num) || !CS_SEMESTER_SUBJECTS[num]) return [];
  return CS_SEMESTER_SUBJECTS[num];
};

const formatDisplayDate = (isoDate: string): { main: string; weekday: string } => {
  if (!isoDate) return { main: 'No Date', weekday: '' };
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { main: isoDate, weekday: '' };
  }
  return {
    main: parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    weekday: parsed.toLocaleDateString('en-IN', { weekday: 'short' }),
  };
};

const formatTimestamp = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const LecturePlanModule: React.FC = () => {
  const {
    role,
    currentUser,
    lecturePlans,
    addLecturePlan,
    updateLecturePlan,
    deleteLecturePlan,
    addNotification,
  } = useERP();

  const isFaculty = role === 'Faculty';
  const isAdmin = role === 'Admin';
  const isStudent = role === 'Student';

  const todayIso = new Date().toISOString().split('T')[0];

  // Filters (default to 'all' so every saved lecture plan is immediately visible)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Inline Quick-Add Row State (Faculty only — mirrors Image 1 `+` cells)
  const [isDateInputActive, setIsDateInputActive] = useState(false);
  const [isTopicInputActive, setIsTopicInputActive] = useState(false);
  const [newDate, setNewDate] = useState(todayIso);
  const [newTopic, setNewTopic] = useState('');
  const [newSemester, setNewSemester] = useState<string>('7');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const topicInputRef = useRef<HTMLInputElement>(null);

  // Inline Edit State (Faculty only)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editSemester, setEditSemester] = useState<string>('7');
  const [editSubjectName, setEditSubjectName] = useState<string>('');

  const activeFilterSubjects = useMemo(
    () => (semesterFilter === 'all' ? [] : getSubjectsForSemester(semesterFilter)),
    [semesterFilter]
  );

  const newRowSubjects = useMemo(() => getSubjectsForSemester(newSemester), [newSemester]);
  const editRowSubjects = useMemo(() => getSubjectsForSemester(editSemester), [editSemester]);

  // Cross (✕) Reason Box State (Faculty only -> directed to Admin)
  const [reasonTargetId, setReasonTargetId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [isSavingReason, setIsSavingReason] = useState(false);

  // Feedback banner
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'warning' | 'info', message: string) => {
    setFeedbackBanner({ type, message });
    window.setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Sort lecture plans chronologically by date, then createdAt
  const sortedPlans = useMemo(() => {
    return [...lecturePlans].sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });
  }, [lecturePlans]);

  // Filtered list for display
  const filteredPlans = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const matchedSubject =
      subjectFilter !== 'all'
        ? activeFilterSubjects.find((s) => s.name === subjectFilter)
        : undefined;

    return sortedPlans.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (semesterFilter !== 'all' && String(item.semester || '') !== semesterFilter) return false;
      if (subjectFilter !== 'all') {
        const titleMatches = (item.courseTitle || '').toLowerCase() === subjectFilter.toLowerCase();
        const codeMatches = matchedSubject
          ? (item.courseCode || '').toLowerCase() === matchedSubject.code.toLowerCase()
          : false;
        if (!titleMatches && !codeMatches) return false;
      }
      if (!q) return true;
      return (
        item.topicName.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q) ||
        (item.courseCode || '').toLowerCase().includes(q) ||
        (item.courseTitle || '').toLowerCase().includes(q) ||
        (item.facultyName || '').toLowerCase().includes(q) ||
        (isAdmin && (item.missedReason || '').toLowerCase().includes(q))
      );
    });
  }, [sortedPlans, statusFilter, semesterFilter, subjectFilter, activeFilterSubjects, searchQuery, isAdmin]);

  // Missed lectures directed to Admin
  const missedReports = useMemo(() => {
    return sortedPlans
      .filter((item) => item.status === 'missed')
      .sort((a, b) => (b.missedReportedAt || b.updatedAt || '').localeCompare(a.missedReportedAt || a.updatedAt || ''));
  }, [sortedPlans]);

  // Summary counts
  const counts = useMemo(() => {
    const total = lecturePlans.length;
    const completed = lecturePlans.filter((l) => l.status === 'completed').length;
    const missed = lecturePlans.filter((l) => l.status === 'missed').length;
    const pending = lecturePlans.filter((l) => l.status === 'pending').length;
    return { total, completed, missed, pending };
  }, [lecturePlans]);

  const activateDateAdd = () => {
    if (!isFaculty) return;
    setIsDateInputActive(true);
    setAddError(null);
    window.setTimeout(() => {
      dateInputRef.current?.focus();
    }, 30);
  };

  const activateTopicAdd = () => {
    if (!isFaculty) return;
    setIsTopicInputActive(true);
    setAddError(null);
    window.setTimeout(() => {
      topicInputRef.current?.focus();
    }, 30);
  };

  const handleQuickAddLecture = async (initialAction: 'pending' | 'completed' | 'open-reason' = 'pending') => {
    if (!isFaculty) return;
    if (!newDate.trim()) {
      setIsDateInputActive(true);
      setAddError('Please select a date of lecture.');
      return;
    }
    if (!newTopic.trim()) {
      setIsTopicInputActive(true);
      setAddError('Please enter the name of the lecture.');
      topicInputRef.current?.focus();
      return;
    }

    setAddError(null);
    setIsSubmittingNew(true);
    try {
      const selectedSubject = newRowSubjects.find((s) => s.name === newSubjectName);
      const effectiveSemester = newSemester ? Number(newSemester) : undefined;
      const created = await addLecturePlan({
        date: newDate.trim(),
        topicName: newTopic.trim(),
        courseCode: selectedSubject?.code || undefined,
        courseTitle: selectedSubject?.name || (newSubjectName || undefined),
        semester: effectiveSemester,
        department: currentUser.department || 'Computer Science & Engineering',
        status: initialAction === 'completed' ? 'completed' : 'pending',
        completedAt: initialAction === 'completed' ? new Date().toISOString() : undefined,
        facultyName: currentUser.name,
        facultyEmail: currentUser.email,
      });

      setNewTopic('');
      setIsTopicInputActive(false);
      setIsDateInputActive(false);

      if (created && initialAction === 'open-reason') {
        setReasonTargetId(created.id);
        setReasonText('');
        setReasonError(null);
        showFeedback('info', 'Lecture added. Please submit the reason why it could not be taken so Admin is notified.');
      } else if (initialAction === 'completed') {
        showFeedback('success', 'Lecture added and marked completed (✓).');
      } else {
        showFeedback('success', 'Lecture added to the lecture plan.');
      }
    } catch {
      setAddError('Could not save lecture plan entry. Please try again.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleMarkCompleted = async (item: LecturePlanItem) => {
    if (!isFaculty) return;
    // Close reason box if it was open for this item
    if (reasonTargetId === item.id) {
      setReasonTargetId(null);
      setReasonText('');
      setReasonError(null);
    }

    const nextStatus: LecturePlanStatus = item.status === 'completed' ? 'pending' : 'completed';
    await updateLecturePlan(item.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      missedReason: undefined,
      missedReportedAt: undefined,
    });

    if (nextStatus === 'completed') {
      showFeedback('success', `Marked "${item.topicName}" as completed (✓).`);
    } else {
      showFeedback('info', `Reset "${item.topicName}" status to pending.`);
    }
  };

  const handleOpenReasonBox = (item: LecturePlanItem) => {
    if (!isFaculty) return;
    if (reasonTargetId === item.id) {
      setReasonTargetId(null);
      setReasonError(null);
      return;
    }
    setEditingId(null);
    setReasonTargetId(item.id);
    setReasonText(item.missedReason || '');
    setReasonError(null);
  };

  const handleSubmitMissedReason = async (item: LecturePlanItem) => {
    if (!isFaculty) return;
    const trimmed = reasonText.trim();
    if (!trimmed) {
      setReasonError('Please enter the reason why you were unable to take this lecture.');
      return;
    }

    setIsSavingReason(true);
    setReasonError(null);
    try {
      const reportedAt = new Date().toISOString();
      await updateLecturePlan(item.id, {
        status: 'missed',
        missedReason: trimmed,
        missedReportedAt: reportedAt,
        completedAt: undefined,
        facultyName: currentUser.name,
        facultyEmail: currentUser.email,
      });

      // Direct notification to Admin
      addNotification({
        recipientRole: 'Admin',
        title: `Missed Lecture Reason • ${item.courseCode || formatDisplayDate(item.date).main}`,
        desc: `${currentUser.name} was unable to take "${item.topicName}" on ${formatDisplayDate(item.date).main}. Reason: ${trimmed}`,
        time: 'Just now',
        read: false,
        type: 'warning',
        metadata: {
          courseCode: item.courseCode,
          courseTitle: item.courseTitle || item.topicName,
          date: item.date,
          status: 'Missed',
          markedBy: currentUser.name,
        },
      });

      setReasonTargetId(null);
      setReasonText('');
      showFeedback('warning', `Marked "${item.topicName}" as not taken (✕) and sent reason directly to Admin.`);
    } catch {
      setReasonError('Unable to submit reason right now. Please try again.');
    } finally {
      setIsSavingReason(false);
    }
  };

  const startInlineEdit = (item: LecturePlanItem) => {
    if (!isFaculty) return;
    setReasonTargetId(null);
    setEditingId(item.id);
    setEditDate(item.date);
    setEditTopic(item.topicName);
    const semStr = item.semester ? String(item.semester) : '7';
    setEditSemester(semStr);
    const semSubjects = getSubjectsForSemester(semStr);
    const matchedByTitleOrCode = semSubjects.find(
      (s) =>
        (item.courseTitle && s.name.toLowerCase() === item.courseTitle.toLowerCase()) ||
        (item.courseCode && s.code.toLowerCase() === item.courseCode.toLowerCase())
    );
    setEditSubjectName(matchedByTitleOrCode?.name || '');
  };

  const saveInlineEdit = async (item: LecturePlanItem) => {
    if (!isFaculty) return;
    if (!editDate.trim() || !editTopic.trim()) return;
    const selectedSubject = editRowSubjects.find((s) => s.name === editSubjectName);
    await updateLecturePlan(item.id, {
      date: editDate.trim(),
      topicName: editTopic.trim(),
      courseCode: selectedSubject?.code || undefined,
      courseTitle: selectedSubject?.name || undefined,
      semester: editSemester ? Number(editSemester) : undefined,
    });
    setEditingId(null);
    showFeedback('success', 'Lecture plan entry updated.');
  };

  const handleDeleteRow = async (item: LecturePlanItem) => {
    if (!isFaculty) return;
    if (reasonTargetId === item.id) setReasonTargetId(null);
    if (editingId === item.id) setEditingId(null);
    await deleteLecturePlan(item.id);
    showFeedback('info', `Removed "${item.topicName}" from the lecture plan.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-10">
      {/* Header Banner */}
      <div className="theme-header-banner rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-light dark:bg-[#29a19c]/25 border border-brand/25 dark:border-[#a3f7bf]/30 flex items-center justify-center text-brand dark:text-[#a3f7bf] shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  Lecture Plan
                </h2>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border',
                    isFaculty
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                      : isAdmin
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                      : 'bg-slate-100 dark:bg-[#354146] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-[#55666d]'
                  )}
                >
                  {isFaculty ? (
                    <>
                      <Pencil className="w-3 h-3" />
                      Faculty Create &amp; Edit Access
                    </>
                  ) : isAdmin ? (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      Admin View &bull; Receives Missed Reasons
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Student Read-Only View
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-200 mt-1">
                {isFaculty
                  ? 'Add lecture dates and topic names below. Mark ✓ when a lecture is completed, or ✕ to submit a reason directly to Admin.'
                  : isAdmin
                  ? 'Review all planned lectures across faculty and inspect every reason submitted when a teacher was unable to take a lecture.'
                  : 'Track scheduled lecture dates, topic names, and completion updates published by your faculty.'}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#354146] border border-slate-200/90 dark:border-[#55666d] text-center min-w-[84px]">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-300 font-bold">
                Planned
              </p>
              <p className="text-lg font-extrabold text-slate-950 dark:text-white mt-0.5">
                {counts.total}
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/35 border border-emerald-500/25 text-center min-w-[84px]">
              <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-bold">
                Done (✓)
              </p>
              <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {counts.completed}
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/35 border border-rose-500/25 text-center min-w-[84px]">
              <p className="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300 font-bold">
                Missed (✕)
              </p>
              <p className="text-lg font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">
                {counts.missed}
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/35 border border-amber-500/25 text-center min-w-[84px]">
              <p className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 font-bold">
                Pending
              </p>
              <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                {counts.pending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              'rounded-2xl px-4 py-3 border flex items-center justify-between gap-3 text-sm font-bold shadow-xs',
              feedbackBanner.type === 'success' &&
                'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200',
              feedbackBanner.type === 'warning' &&
                'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-700/60 text-rose-800 dark:text-rose-200',
              feedbackBanner.type === 'info' &&
                'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-700/60 text-blue-800 dark:text-blue-200'
            )}
          >
            <div className="flex items-center gap-2.5">
              {feedbackBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : feedbackBanner.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 shrink-0" />
              )}
              <span>{feedbackBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN SECTION: Missed Lecture Reasons Directed to Admin */}
      {isAdmin && (
        <div className="bg-white dark:bg-[#435055] rounded-3xl border-2 border-rose-200/90 dark:border-rose-500/35 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-rose-50/80 dark:bg-rose-950/30 border-b border-rose-200/80 dark:border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white">
                  Faculty Missed Lecture Reasons (Directed to Admin)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Every time a faculty member marks ✕ on a lecture, their explanation appears here immediately.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-extrabold self-start sm:self-center">
              {missedReports.length} {missedReports.length === 1 ? 'Report' : 'Reports'}
            </span>
          </div>

          <div className="p-4 sm:p-5">
            {missedReports.length === 0 ? (
              <div className="py-6 text-center text-slate-500 dark:text-slate-300 text-sm">
                No missed lecture reasons have been submitted by faculty yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {missedReports.map((report) => {
                  const formatted = formatDisplayDate(report.date);
                  return (
                    <div
                      key={report.id}
                      className="rounded-2xl border border-rose-200/80 dark:border-rose-500/30 bg-slate-50/80 dark:bg-[#354146] p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                              <Calendar className="w-3 h-3" />
                              {formatted.main}
                            </span>
                            {(report.courseTitle || report.courseCode) && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-light/85 dark:bg-[#435055] text-brand-dark dark:text-slate-200 border border-brand/20 dark:border-[#55666d]">
                                {report.courseTitle || report.courseCode}
                              </span>
                            )}
                            {report.semester && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-[#435055] text-slate-700 dark:text-slate-200">
                                Sem {report.semester}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-extrabold text-slate-950 dark:text-white mt-1.5">
                            {report.topicName}
                          </p>
                        </div>
                        <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                          <X className="w-4 h-4 stroke-[3]" />
                        </span>
                      </div>

                      <div className="rounded-xl bg-white dark:bg-[#2c363b] border border-rose-200/70 dark:border-rose-500/25 p-3">
                        <p className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-300 font-extrabold mb-1">
                          Reason Submitted by Teacher
                        </p>
                        <p className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                          {report.missedReason || 'No reason provided.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-300 pt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                          <User className="w-3.5 h-3.5 text-brand dark:text-[#a3f7bf]" />
                          {report.facultyName}
                          {report.department ? ` • ${report.department}` : ''}
                        </span>
                        {report.missedReportedAt && (
                          <span>Reported {formatTimestamp(report.missedReportedAt)}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search, Filters & Faculty Quick Action Bar */}
      <div className="theme-section-card rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lecture topic, date, subject, or faculty..."
              className="w-full pl-10 pr-4 py-2 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="inline-flex items-center bg-brand-light/70 dark:bg-[#354146] p-1 rounded-xl border border-brand/20 dark:border-[#55666d]">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: '✓ Done' },
                  { id: 'missed', label: '✕ Missed' },
                ] as { id: StatusFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={cn(
                    'no-theme-btn px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                    statusFilter === tab.id
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-brand-dark/80 dark:text-slate-300 hover:text-brand-dark dark:hover:text-white'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Semester Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand dark:text-[#a3f7bf] shrink-0" />
              <select
                id="lecture-plan-semester-select"
                value={semesterFilter}
                onChange={(e) => {
                  const nextSem = e.target.value;
                  setSemesterFilter(nextSem);
                  setSubjectFilter('all');
                  if (nextSem !== 'all') {
                    setNewSemester(nextSem);
                    setNewSubjectName('');
                  }
                }}
                aria-label="Filter by semester"
                className="py-1.5 px-2.5 text-xs font-bold rounded-xl"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={String(sem)}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester-Specific CS Subject Dropdown */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand dark:text-[#a3f7bf] shrink-0" />
              <select
                id="lecture-plan-subject-select"
                value={subjectFilter}
                disabled={semesterFilter === 'all'}
                onChange={(e) => {
                  const nextSub = e.target.value;
                  setSubjectFilter(nextSub);
                  if (nextSub !== 'all' && semesterFilter !== 'all') {
                    setNewSemester(semesterFilter);
                    setNewSubjectName(nextSub);
                  }
                }}
                aria-label="Filter by subject"
                className="py-1.5 px-2.5 text-xs font-bold rounded-xl max-w-[230px] disabled:opacity-60"
              >
                {semesterFilter === 'all' ? (
                  <option value="all">Select Semester for Subjects</option>
                ) : (
                  <>
                    <option value="all">All Sem {semesterFilter} Subjects</option>
                    {activeFilterSubjects.map((sub) => (
                      <option key={sub.code} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Faculty Add Trigger */}
            {isFaculty && (
              <button
                type="button"
                onClick={() => {
                  setIsDateInputActive(true);
                  setIsTopicInputActive(true);
                  window.setTimeout(() => topicInputRef.current?.focus(), 40);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Lecture</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Notice when saved lecture plans exist outside current filter */}
        {lecturePlans.length > 0 && filteredPlans.length === 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap rounded-2xl px-4 py-2.5 bg-brand-light/70 dark:bg-[#354146] border border-brand/25 dark:border-[#55666d] text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {lecturePlans.length} saved {lecturePlans.length === 1 ? 'lecture plan' : 'lecture plans'} found, hidden by your active filter.
            </span>
            <button
              type="button"
              onClick={() => {
                setSemesterFilter('all');
                setSubjectFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-3 py-1 rounded-lg bg-brand hover:bg-brand-hover text-white font-extrabold cursor-pointer transition-colors"
            >
              Show All Lectures
            </button>
          </div>
        )}

        {/* =================================================================
            LECTURE PLAN LIST TABLE — 5-COLUMN STRUCTURE MATCHING IMAGE 1
            | S. No. | Date of Lecture | Name of Lecture | ✓ | ✕ |
            ================================================================= */}
        <div className="overflow-x-auto rounded-2xl border-2 border-slate-300 dark:border-[#62757d]">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#354146] text-slate-900 dark:text-white border-b-2 border-slate-300 dark:border-[#62757d]">
                <th className="w-20 px-3 py-3.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider border-r-2 border-slate-300 dark:border-[#62757d]">
                  S. No.
                </th>
                <th className="w-48 sm:w-56 px-4 py-3.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider border-r-2 border-slate-300 dark:border-[#62757d]">
                  Date of Lecture
                </th>
                <th className="px-4 py-3.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider border-r-2 border-slate-300 dark:border-[#62757d]">
                  Name of Lecture
                </th>
                <th
                  className="w-24 sm:w-28 px-3 py-3.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider border-r-2 border-slate-300 dark:border-[#62757d]"
                  title="Mark Lecture Completed"
                >
                  <span className="inline-flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span className="hidden sm:inline">Done</span>
                  </span>
                </th>
                <th
                  className="w-24 sm:w-28 px-3 py-3.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider"
                  title="Unable to Take Lecture (Opens Reason Box for Admin)"
                >
                  <span className="inline-flex items-center justify-center gap-1 text-rose-700 dark:text-rose-300">
                    <X className="w-4 h-4 stroke-[3]" />
                    <span className="hidden sm:inline">Missed</span>
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-slate-200 dark:divide-[#55666d] bg-white dark:bg-[#435055]">
              {filteredPlans.map((item, idx) => {
                const isEditing = isFaculty && editingId === item.id;
                const isReasonOpen = isFaculty && reasonTargetId === item.id;
                const formattedDate = formatDisplayDate(item.date);

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={cn(
                        'transition-colors',
                        item.status === 'completed' && 'bg-emerald-50/40 dark:bg-emerald-950/15',
                        item.status === 'missed' && 'bg-rose-50/40 dark:bg-rose-950/15',
                        item.status === 'pending' && 'hover:bg-slate-50/80 dark:hover:bg-[#3c484d]'
                      )}
                    >
                      {/* Column 1: S. No. */}
                      <td className="px-3 py-3.5 text-center font-extrabold text-sm sm:text-base text-slate-900 dark:text-white border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                        {idx + 1}.
                      </td>

                      {/* Column 2: Date of Lecture */}
                      <td className="px-4 py-3.5 text-center border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-bold"
                          />
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {formattedDate.main}
                            </span>
                            {formattedDate.weekday && (
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300">
                                {formattedDate.weekday}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Name of Lecture */}
                      <td className="px-4 py-3.5 border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTopic}
                              onChange={(e) => setEditTopic(e.target.value)}
                              placeholder="Enter lecture topic name..."
                              className="w-full px-3 py-1.5 text-sm font-bold"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(item);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                            />
                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                value={editSemester}
                                onChange={(e) => {
                                  setEditSemester(e.target.value);
                                  setEditSubjectName('');
                                }}
                                aria-label="Edit lecture semester"
                                className="px-2 py-1 text-xs font-bold rounded-lg"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                  <option key={sem} value={String(sem)}>
                                    Semester {sem}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={editSubjectName}
                                onChange={(e) => setEditSubjectName(e.target.value)}
                                aria-label="Edit lecture subject"
                                className="px-2 py-1 text-xs font-bold rounded-lg"
                              >
                                <option value="">Select Subject (Sem {editSemester})</option>
                                {editRowSubjects.map((sub) => (
                                  <option key={sub.code} value={sub.name}>
                                    {sub.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => saveInlineEdit(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand text-white text-xs font-bold cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-[#354146] text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p
                                className={cn(
                                  'text-sm sm:text-base font-extrabold text-slate-950 dark:text-white leading-snug',
                                  item.status === 'completed' && 'text-emerald-950 dark:text-emerald-100'
                                )}
                              >
                                {item.topicName}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-slate-500 dark:text-slate-300">
                                {(item.courseTitle || item.courseCode) && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-light/85 dark:bg-[#354146] text-brand-dark dark:text-[#a3f7bf] border border-brand/25 dark:border-[#55666d]">
                                    <BookOpen className="w-3 h-3" />
                                    {item.courseTitle || item.courseCode}
                                    {item.courseTitle && item.courseCode ? ` (${item.courseCode})` : ''}
                                  </span>
                                )}
                                {item.semester && (
                                  <span className="px-2 py-0.5 rounded-md bg-brand-light/65 dark:bg-[#354146] text-brand-dark dark:text-slate-200 border border-brand/20 dark:border-[#55666d]">
                                    Sem {item.semester}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.facultyName}
                                </span>
                              </div>

                              {/* Missed Reason inline note (Visible ONLY to Admin & Faculty; NOT Students) */}
                              {item.status === 'missed' && item.missedReason && !isStudent && (
                                <div className="mt-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 px-3 py-2 text-xs text-rose-900 dark:text-rose-100">
                                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-300 block mb-0.5">
                                    {isAdmin ? 'Reason Received from Faculty:' : 'Reason Sent to Admin:'}
                                  </span>
                                  <span>{item.missedReason}</span>
                                </div>
                              )}
                            </div>

                            {/* Faculty-only Edit / Delete controls */}
                            {isFaculty && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => startInlineEdit(item)}
                                  className="no-theme-btn p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-brand dark:hover:text-[#a3f7bf] hover:bg-brand-light/70 dark:hover:bg-[#354146] transition-colors cursor-pointer"
                                  title="Edit lecture"
                                  aria-label={`Edit ${item.topicName}`}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(item)}
                                  className="no-theme-btn p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                  title="Delete lecture"
                                  aria-label={`Delete ${item.topicName}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Tick (✓) — Lecture Completed */}
                      <td className="px-3 py-3.5 text-center border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                        {isFaculty ? (
                          <button
                            type="button"
                            onClick={() => handleMarkCompleted(item)}
                            className={cn(
                              'no-theme-btn w-11 h-11 rounded-xl inline-flex items-center justify-center border-2 transition-all cursor-pointer mx-auto',
                              item.status === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm scale-105'
                                : 'bg-white dark:bg-[#354146] border-slate-300 dark:border-[#62757d] text-slate-600 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            )}
                            title={
                              item.status === 'completed'
                                ? 'Completed (Click to reset to pending)'
                                : 'Mark lecture as completed'
                            }
                            aria-label={`Mark ${item.topicName} as completed`}
                            aria-pressed={item.status === 'completed'}
                          >
                            <Check className="w-6 h-6 stroke-[3]" />
                          </button>
                        ) : (
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl inline-flex items-center justify-center border-2 mx-auto',
                              item.status === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-[#354146]/60 border-slate-200 dark:border-[#55666d] text-slate-300 dark:text-slate-500'
                            )}
                            title={item.status === 'completed' ? 'Lecture Completed' : 'Not marked completed'}
                          >
                            <Check className="w-5 h-5 stroke-[3]" />
                          </div>
                        )}
                      </td>

                      {/* Column 5: Cross (✕) — Unable to Take Lecture (Opens Reason Box -> Admin) */}
                      <td className="px-3 py-3.5 text-center align-middle">
                        {isFaculty ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReasonBox(item)}
                            className={cn(
                              'no-theme-btn w-11 h-11 rounded-xl inline-flex items-center justify-center border-2 transition-all cursor-pointer mx-auto',
                              item.status === 'missed' || isReasonOpen
                                ? 'bg-rose-600 border-rose-600 text-white shadow-sm scale-105'
                                : 'bg-white dark:bg-[#354146] border-slate-300 dark:border-[#62757d] text-slate-600 dark:text-slate-200 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            )}
                            title={
                              item.status === 'missed'
                                ? 'Marked not taken — click to view/edit reason sent to Admin'
                                : 'Unable to take lecture — open reason box to notify Admin'
                            }
                            aria-label={`Mark ${item.topicName} not taken and provide reason for Admin`}
                            aria-pressed={item.status === 'missed'}
                          >
                            <X className="w-6 h-6 stroke-[3]" />
                          </button>
                        ) : (
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl inline-flex items-center justify-center border-2 mx-auto',
                              item.status === 'missed'
                                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-[#354146]/60 border-slate-200 dark:border-[#55666d] text-slate-300 dark:text-slate-500'
                            )}
                            title={item.status === 'missed' ? 'Lecture Not Taken' : 'Not marked missed'}
                          >
                            <X className="w-5 h-5 stroke-[3]" />
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Faculty Reason Box Row (Opens when Faculty clicks ✕) */}
                    {isReasonOpen && (
                      <tr className="bg-rose-50/90 dark:bg-[#2f393e]">
                        <td colSpan={5} className="p-4 sm:p-5 border-t border-rose-200 dark:border-rose-500/35">
                          <div className="max-w-3xl mx-auto space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
                                    Reason for Unable to Take Lecture (Directed to Admin)
                                  </h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Lecture: <span className="font-bold">{item.topicName}</span> &bull;{' '}
                                    {formattedDate.main}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setReasonTargetId(null);
                                  setReasonError(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
                                aria-label="Close reason box"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={reasonText}
                              onChange={(e) => {
                                setReasonText(e.target.value);
                                if (reasonError) setReasonError(null);
                              }}
                              placeholder="Enter why you were unable to take this lecture (e.g., medical leave, official academic duty, seminar conflict, emergency)..."
                              className="w-full p-3 text-sm rounded-xl"
                              autoFocus
                            />

                            {reasonError && (
                              <p className="text-xs font-bold text-rose-600 dark:text-rose-300">
                                {reasonError}
                              </p>
                            )}

                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300">
                                Submitting will mark this lecture as ✕ and deliver your reason directly to the Admin.
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReasonTargetId(null);
                                    setReasonError(null);
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#354146] border border-slate-300 dark:border-[#55666d] text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingReason}
                                  onClick={() => handleSubmitMissedReason(item)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-xs cursor-pointer transition-colors"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{isSavingReason ? 'Sending...' : 'Send Reason to Admin'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* FACULTY INLINE "+" ADD ROW — Faithful to Image 1: | N. | + | + | ✓ | ✕ | */}
              {isFaculty && (
                <tr className="bg-slate-50/70 dark:bg-[#3a464b]">
                  {/* S. No. */}
                  <td className="px-3 py-4 text-center font-extrabold text-sm sm:text-base text-slate-600 dark:text-slate-200 border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                    {filteredPlans.length + 1}.
                  </td>

                  {/* Date of Lecture (+) */}
                  <td className="px-4 py-3.5 text-center border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                    {isDateInputActive ? (
                      <input
                        ref={dateInputRef}
                        type="date"
                        value={newDate}
                        onChange={(e) => {
                          setNewDate(e.target.value);
                          setAddError(null);
                        }}
                        className="w-full px-2.5 py-2 text-xs sm:text-sm font-bold"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={activateDateAdd}
                        className="no-theme-btn w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-brand/35 dark:border-[#62757d] hover:border-brand dark:hover:border-[#a3f7bf] hover:bg-white dark:hover:bg-[#435055] text-slate-700 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                        title="Add Date of Lecture"
                        aria-label="Add Date of Lecture"
                      >
                        <Plus className="w-5 h-5 stroke-[2.75] text-brand-dark dark:text-[#a3f7bf] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-brand-dark/75 dark:text-slate-300">
                          {newDate ? formatDisplayDate(newDate).main : 'Date'}
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Name of Lecture (+) */}
                  <td className="px-4 py-3.5 border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                    {isTopicInputActive || newTopic ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            ref={topicInputRef}
                            type="text"
                            value={newTopic}
                            onChange={(e) => {
                              setNewTopic(e.target.value);
                              setAddError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleQuickAddLecture('pending');
                              }
                            }}
                            placeholder="Enter lecture topic name..."
                            className="flex-1 px-3 py-2 text-sm font-bold"
                          />
                          <button
                            type="button"
                            disabled={isSubmittingNew}
                            onClick={() => handleQuickAddLecture('pending')}
                            className="px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-xs font-extrabold cursor-pointer shrink-0 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={newSemester}
                            onChange={(e) => {
                              setNewSemester(e.target.value);
                              setNewSubjectName('');
                            }}
                            className="px-2 py-1 text-xs font-bold rounded-lg"
                            aria-label="Lecture semester"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <option key={sem} value={String(sem)}>
                                Semester {sem}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            className="px-2 py-1 text-xs font-bold rounded-lg"
                            aria-label="Lecture subject"
                          >
                            <option value="">Select Subject (Sem {newSemester})</option>
                            {newRowSubjects.map((sub) => (
                              <option key={sub.code} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {addError && (
                          <p className="text-xs font-bold text-rose-600 dark:text-rose-300">
                            {addError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={activateTopicAdd}
                        className="no-theme-btn w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-brand/35 dark:border-[#62757d] hover:border-brand dark:hover:border-[#a3f7bf] hover:bg-white dark:hover:bg-[#435055] text-slate-700 dark:text-slate-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                        title="Add Name of Lecture"
                        aria-label="Add Name of Lecture"
                      >
                        <Plus className="w-5 h-5 stroke-[2.75] text-brand-dark dark:text-[#a3f7bf] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-brand-dark/75 dark:text-slate-300">
                          Click + to add lecture name
                        </span>
                      </button>
                    )}
                  </td>

                  {/* Quick-Add Tick (✓) */}
                  <td className="px-3 py-3.5 text-center border-r-2 border-slate-200 dark:border-[#55666d] align-middle">
                    <button
                      type="button"
                      disabled={isSubmittingNew}
                      onClick={() => handleQuickAddLecture('completed')}
                      className="no-theme-btn w-11 h-11 rounded-xl inline-flex items-center justify-center border-2 border-slate-300 dark:border-[#62757d] bg-white dark:bg-[#354146] text-slate-700 dark:text-slate-100 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer mx-auto disabled:opacity-50"
                      title="Add lecture and mark Completed (✓)"
                      aria-label="Add lecture and mark completed"
                    >
                      <Check className="w-6 h-6 stroke-[3]" />
                    </button>
                  </td>

                  {/* Quick-Add Cross (✕) */}
                  <td className="px-3 py-3.5 text-center align-middle">
                    <button
                      type="button"
                      disabled={isSubmittingNew}
                      onClick={() => handleQuickAddLecture('open-reason')}
                      className="no-theme-btn w-11 h-11 rounded-xl inline-flex items-center justify-center border-2 border-slate-300 dark:border-[#62757d] bg-white dark:bg-[#354146] text-slate-700 dark:text-slate-100 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer mx-auto disabled:opacity-50"
                      title="Add lecture and enter reason for Admin (✕)"
                      aria-label="Add lecture and open reason box for Admin"
                    >
                      <X className="w-6 h-6 stroke-[3]" />
                    </button>
                  </td>
                </tr>
              )}

              {/* Empty state for non-faculty roles when no rows match */}
              {!isFaculty && filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#354146] border border-slate-200 dark:border-[#55666d] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-300">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                        {lecturePlans.length === 0
                          ? 'No lectures planned yet'
                          : 'No lectures match your current filter'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        {lecturePlans.length === 0
                          ? 'Only faculty members can create and edit lecture plan entries. Once added, they will appear here automatically.'
                          : 'Try clearing the search query or switching status/semester filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Role & Legend Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-300 pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-bold">
              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white inline-flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              Lecture Completed
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold">
              <span className="w-5 h-5 rounded-md bg-rose-600 text-white inline-flex items-center justify-center">
                <X className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              Unable to Take (Reason Directed to Admin)
            </span>
          </div>
          <span className="font-bold">
            {isFaculty
              ? 'Only Faculty can create, edit, or mark lectures.'
              : 'Read-only access — managed exclusively by Faculty.'}
          </span>
        </div>
      </div>
    </div>
  );
};
