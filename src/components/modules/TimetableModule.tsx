import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  User,
  GraduationCap,
  X,
  BookOpen,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { TimetableSlot } from '../../types';
import {
  TimetableDay,
  detectTimetableConflicts,
  formatMinutesToTime,
  parseTimeToMinutes,
  parseSingleTimeString,
  PASTEL_PALETTES,
} from '../timetable/TimetableTypes';
import { TimetableHeader } from '../timetable/TimetableHeader';
import { TimetableGrid } from '../timetable/TimetableGrid';
import { TimetableDayView } from '../timetable/TimetableDayView';
import { TimetableBlockModal } from '../timetable/TimetableBlockModal';
import { TimetableGeneratorModal } from '../timetable/TimetableGeneratorModal';
import { TimetableConflictsModal } from '../timetable/TimetableConflictsModal';

export const TimetableModule: React.FC = () => {
  const {
    timetableSlots,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    batchSetTimetableSlots,
    role,
    faculty,
    currentUser,
  } = useERP();

  const isAdmin = role === 'Admin';
  const isFaculty = role === 'Faculty';
  const canEdit = isAdmin; // Strictly Admin only!

  // Faculty identity
  const currentFacultyId =
    currentUser?.idNumber || currentUser?.employeeId || currentUser?.facultyId || '';
  const currentFacultyEmail = currentUser?.email?.toLowerCase().trim() || '';
  const currentFacultyName = currentUser?.name?.toLowerCase().trim() || '';

  // Filters & Views
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'day' | 'agenda'>('grid');
  const [selectedDay, setSelectedDay] = useState<TimetableDay>('Monday');

  // Modals
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isConflictsOpen, setIsConflictsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Partial<TimetableSlot> | null>(null);
  const [viewingSlotDetail, setViewingSlotDetail] = useState<TimetableSlot | null>(null);

  // Available batches
  const availableBatches = useMemo(() => {
    const set = new Set<string>();
    timetableSlots.forEach((s) => {
      if (s.batch && s.batch !== 'All Batches') set.add(s.batch);
    });
    return Array.from(set);
  }, [timetableSlots]);

  // Active slots filtered according to Role & Selection
  // Faculty only sees periods assigned to them by Admin!
  const visibleSlots = useMemo(() => {
    if (isFaculty) {
      return timetableSlots.filter((slot) => {
        if (slot.facultyId && currentFacultyId && slot.facultyId.toLowerCase() === currentFacultyId.toLowerCase()) {
          return true;
        }
        if (slot.facultyEmail && currentFacultyEmail && slot.facultyEmail.toLowerCase() === currentFacultyEmail) {
          return true;
        }
        if (slot.instructor && currentFacultyName) {
          const slotInst = slot.instructor.toLowerCase();
          if (slotInst.includes(currentFacultyName) || currentFacultyName.includes(slotInst)) {
            return true;
          }
        }
        return false;
      });
    }

    if (isAdmin && selectedFacultyFilter !== 'ALL') {
      return timetableSlots.filter(
        (slot) => slot.facultyId === selectedFacultyFilter || slot.instructor === selectedFacultyFilter
      );
    }

    return timetableSlots;
  }, [
    timetableSlots,
    isFaculty,
    isAdmin,
    currentFacultyId,
    currentFacultyEmail,
    currentFacultyName,
    selectedFacultyFilter,
  ]);

  // Detected conflicts
  const conflicts = useMemo(() => {
    return detectTimetableConflicts(timetableSlots);
  }, [timetableSlots]);

  // Handler: Click empty slot to add (Admin only)
  const handleAddAtSlot = (day: TimetableDay, timeStr: string) => {
    if (!isAdmin) return;
    setSelectedDay(day);
    setEditingSlot({
      day,
      time: timeStr,
      courseCode: '',
      courseTitle: '',
      instructor: faculty[0]?.name || 'Faculty Member',
      facultyId: faculty[0]?.employeeId || '',
      facultyEmail: faculty[0]?.email || '',
      room: 'Hall 101',
      batch: selectedBatch !== 'ALL' ? selectedBatch : 'Class CS-A',
      type: 'Lecture',
      colorTheme: 'pastel-blue',
      durationMinutes: 90,
    });
    setIsBlockModalOpen(true);
  };

  // Handler: Click slot
  const handleSlotClick = (slot: TimetableSlot) => {
    if (isAdmin) {
      setEditingSlot(slot);
      setIsBlockModalOpen(true);
    } else {
      setViewingSlotDetail(slot);
    }
  };

  // Handler: Save slot (Admin only)
  const handleSaveSlot = (slotData: Omit<TimetableSlot, 'id'> & { id?: string }) => {
    if (!isAdmin) return;
    if (slotData.id) {
      updateTimetableSlot(slotData.id, slotData);
    } else {
      addTimetableSlot(slotData);
    }
    setIsBlockModalOpen(false);
    setEditingSlot(null);
  };

  // Handler: Delete slot (Admin only)
  const handleDeleteSlot = (id: string) => {
    if (!isAdmin) return;
    deleteTimetableSlot(id);
    if (editingSlot?.id === id) {
      setIsBlockModalOpen(false);
      setEditingSlot(null);
    }
  };

  // Handler: Resize slot duration (Admin only)
  const handleResizeSlot = (id: string, newDuration: number) => {
    if (!isAdmin) return;
    const slot = timetableSlots.find((s) => s.id === id);
    if (!slot) return;

    let startMin = 9 * 60;
    if (slot.startTime) {
      startMin = parseSingleTimeString(slot.startTime);
    } else if (slot.time) {
      const parsed = parseTimeToMinutes(slot.time);
      startMin = parsed.start;
    }

    const endMin = startMin + newDuration;
    const newTime = `${formatMinutesToTime(startMin)} - ${formatMinutesToTime(endMin)}`;

    updateTimetableSlot(id, {
      durationMinutes: newDuration,
      time: newTime,
      startTime: formatMinutesToTime(startMin),
      endTime: formatMinutesToTime(endMin),
    });
  };

  // Handler: Move slot (Admin only)
  const handleMoveSlot = (id: string, newDay: TimetableDay, newStartTimeMinutes: number) => {
    if (!isAdmin) return;
    const slot = timetableSlots.find((s) => s.id === id);
    if (!slot) return;

    const duration = slot.durationMinutes || 90;
    const newEndTimeMinutes = newStartTimeMinutes + duration;
    const newTime = `${formatMinutesToTime(newStartTimeMinutes)} - ${formatMinutesToTime(
      newEndTimeMinutes
    )}`;

    updateTimetableSlot(id, {
      day: newDay,
      time: newTime,
      startTime: formatMinutesToTime(newStartTimeMinutes),
      endTime: formatMinutesToTime(newEndTimeMinutes),
    });
  };

  // Handler: Apply generated schedule (Admin only)
  const handleApplyGeneratedSchedule = (
    newSlots: TimetableSlot[],
    mode: 'replace' | 'merge'
  ) => {
    if (!isAdmin) return;
    if (mode === 'replace') {
      batchSetTimetableSlots(newSlots);
    } else {
      batchSetTimetableSlots([...newSlots, ...timetableSlots]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-in fade-in duration-200">
      {/* Timetable Header */}
      <TimetableHeader
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenAddModal={() => {
          if (!isAdmin) return;
          setEditingSlot({
            day: 'Monday',
            time: '09:00 AM - 10:30 AM',
            courseCode: '',
            courseTitle: '',
            instructor: faculty[0]?.name || 'Faculty Member',
            facultyId: faculty[0]?.employeeId || '',
            facultyEmail: faculty[0]?.email || '',
            room: 'Hall 101',
            batch: 'Class CS-A',
            type: 'Lecture',
            colorTheme: 'pastel-blue',
            durationMinutes: 90,
          });
          setIsBlockModalOpen(true);
        }}
        onPrint={handlePrint}
        selectedCategoryFilter={selectedCategoryFilter}
        onSelectCategoryFilter={(cat) => setSelectedCategoryFilter(cat)}
        selectedBatch={selectedBatch}
        onSelectBatch={(b) => setSelectedBatch(b)}
        availableBatches={availableBatches}
        selectedFacultyFilter={selectedFacultyFilter}
        onSelectFacultyFilter={(fId) => setSelectedFacultyFilter(fId)}
        facultyList={faculty}
        conflictCount={conflicts.length}
        onOpenConflicts={() => setIsConflictsOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        isAdmin={isAdmin}
        isFaculty={isFaculty}
        facultyId={currentFacultyId}
        facultyName={currentUser?.name}
        totalSlots={visibleSlots.length}
      />

      {/* Faculty Notice: Read-only assigned schedule */}
      {isFaculty && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#2b2b2b] border border-slate-200 dark:border-[#4d4d4d] flex items-center justify-between text-xs text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              Assigned to {currentUser?.name} [{currentFacultyId || 'FAC-OFFICIAL'}]. Timetable is managed exclusively by University Administration.
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            Read Only
          </span>
        </div>
      )}

      {/* Main View: 5-Day Grid vs Day Focus */}
      {visibleSlots.length > 0 ? (
        viewMode === 'grid' ? (
          <TimetableGrid
            slots={visibleSlots}
            onSlotClick={handleSlotClick}
            onSlotEdit={handleSlotClick}
            onSlotDelete={handleDeleteSlot}
            onSlotResize={handleResizeSlot}
            onSlotMove={handleMoveSlot}
            onAddAtSlot={handleAddAtSlot}
            canEdit={canEdit}
            categoryFilter={selectedCategoryFilter}
            batchFilter={selectedBatch}
          />
        ) : (
          <TimetableDayView
            selectedDay={selectedDay}
            onSelectDay={(day) => setSelectedDay(day)}
            slots={visibleSlots}
            onSlotClick={handleSlotClick}
            onSlotEdit={handleSlotClick}
            onSlotDelete={handleDeleteSlot}
            onAddAtSlot={handleAddAtSlot}
            canEdit={canEdit}
            categoryFilter={selectedCategoryFilter}
            batchFilter={selectedBatch}
          />
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#383838] text-slate-400 flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {isFaculty ? 'No Teaching Periods Assigned Yet' : 'No Scheduled Periods'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isFaculty
              ? `There are no active timetable periods assigned to your faculty ID (${currentFacultyId || 'Faculty'}). Contact Academic Administration to assign your teaching slots.`
              : 'Add schedule periods or run the timetable generator to assign courses across faculty members.'}
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingSlot({
                  day: 'Monday',
                  time: '09:00 AM - 10:30 AM',
                  courseCode: '',
                  courseTitle: '',
                  instructor: faculty[0]?.name || 'Faculty Member',
                  facultyId: faculty[0]?.employeeId || '',
                  facultyEmail: faculty[0]?.email || '',
                  room: 'Hall 101',
                  batch: 'Class CS-A',
                  type: 'Lecture',
                  colorTheme: 'pastel-blue',
                  durationMinutes: 90,
                });
                setIsBlockModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-brand text-white text-xs font-bold hover:bg-brand-hover cursor-pointer"
            >
              <span>Add Schedule Period</span>
            </button>
          )}
        </div>
      )}

      {/* Admin Only: Auto-Generator Modal */}
      {isAdmin && (
        <TimetableGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          onApplySchedule={handleApplyGeneratedSchedule}
          existingCount={timetableSlots.length}
          facultyList={faculty}
        />
      )}

      {/* Admin Only: Add / Edit Block Modal with Interactive Clock */}
      {isAdmin && (
        <TimetableBlockModal
          isOpen={isBlockModalOpen}
          onClose={() => {
            setIsBlockModalOpen(false);
            setEditingSlot(null);
          }}
          onSave={handleSaveSlot}
          onDelete={handleDeleteSlot}
          initialSlot={editingSlot}
          allSlots={timetableSlots}
          facultyList={faculty}
        />
      )}

      {/* Admin Only: Conflict Inspector Modal */}
      {isAdmin && (
        <TimetableConflictsModal
          isOpen={isConflictsOpen}
          onClose={() => setIsConflictsOpen(false)}
          conflicts={conflicts}
          onEditSlot={(slot) => {
            setEditingSlot(slot);
            setIsBlockModalOpen(true);
          }}
          onDeleteSlot={handleDeleteSlot}
        />
      )}

      {/* Faculty / Student Read-Only Detail Modal */}
      <AnimatePresence>
        {viewingSlotDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#404040]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-brand text-white">
                    {viewingSlotDetail.courseCode}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {viewingSlotDetail.type}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingSlotDetail(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#3d3d3d]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">
                  {viewingSlotDetail.courseTitle}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#404040] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Day & Time</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingSlotDetail.day} · {viewingSlotDetail.time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Room / Venue</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingSlotDetail.room}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Assigned Faculty</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingSlotDetail.instructor} {viewingSlotDetail.facultyId ? `(${viewingSlotDetail.facultyId})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Class</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {viewingSlotDetail.batch}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#404040] flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingSlotDetail(null)}
                  className="px-5 py-2 rounded-2xl bg-brand text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
