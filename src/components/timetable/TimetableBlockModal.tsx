import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  MapPin,
  User,
  GraduationCap,
  Trash2,
  AlertTriangle,
  Palette,
  Check,
  BookOpen,
} from 'lucide-react';
import { TimetableSlot, FacultyMember } from '../../types';
import {
  TimetableDay,
  TIMETABLE_DAYS,
  PASTEL_PALETTES,
  formatMinutesToTime,
  parseSingleTimeString,
} from './TimetableTypes';
import { InteractiveClockPicker } from './InteractiveClockPicker';
import { FacultySearchSelector } from '../common/FacultySearchSelector';

interface TimetableBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialSlot?: Partial<TimetableSlot> | null;
  allSlots: TimetableSlot[];
  facultyList: FacultyMember[];
}

export const TimetableBlockModal: React.FC<TimetableBlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialSlot,
  allSlots,
  facultyList,
}) => {
  const isEditing = Boolean(initialSlot?.id);

  const [day, setDay] = useState<TimetableDay>((initialSlot?.day as TimetableDay) || 'Monday');
  const [courseCode, setCourseCode] = useState<string>(initialSlot?.courseCode || '');
  const [courseTitle, setCourseTitle] = useState<string>(initialSlot?.courseTitle || '');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    initialSlot?.facultyId || (facultyList[0]?.employeeId || '')
  );
  const [instructor, setInstructor] = useState<string>(
    initialSlot?.instructor || (facultyList[0]?.name || 'Faculty Member')
  );
  const [room, setRoom] = useState<string>(initialSlot?.room || 'Hall 101');
  const [batch, setBatch] = useState<string>(initialSlot?.batch || 'Class CS-A');
  const [type, setType] = useState<TimetableSlot['type']>(initialSlot?.type || 'Lecture');
  const [colorTheme, setColorTheme] = useState<string>(initialSlot?.colorTheme || 'pastel-blue');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialSlot?.durationMinutes || 90);

  // Time in minutes from midnight
  const [startTimeMinutes, setStartTimeMinutes] = useState<number>(() => {
    if (initialSlot?.startTime) {
      return parseSingleTimeString(initialSlot.startTime);
    }
    if (initialSlot?.time) {
      const parts = initialSlot.time.split('-');
      if (parts[0]) return parseSingleTimeString(parts[0]);
    }
    return 9 * 60; // 09:00 AM default
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // When initialSlot or facultyList updates
  useEffect(() => {
    if (initialSlot) {
      setDay((initialSlot.day as TimetableDay) || 'Monday');
      setCourseCode(initialSlot.courseCode || '');
      setCourseTitle(initialSlot.courseTitle || '');
      setRoom(initialSlot.room || 'Hall 101');
      setBatch(initialSlot.batch || 'Class CS-A');
      setType(initialSlot.type || 'Lecture');
      setColorTheme(initialSlot.colorTheme || 'pastel-blue');
      setDurationMinutes(initialSlot.durationMinutes || 90);

      // Match faculty
      if (initialSlot.facultyId) {
        setSelectedFacultyId(initialSlot.facultyId);
        setInstructor(initialSlot.instructor || '');
      } else if (initialSlot.instructor) {
        const matched = facultyList.find(
          (f) => f.name.toLowerCase() === initialSlot.instructor?.toLowerCase()
        );
        if (matched) {
          setSelectedFacultyId(matched.employeeId);
          setInstructor(matched.name);
        } else {
          setInstructor(initialSlot.instructor);
        }
      }

      if (initialSlot.startTime) {
        setStartTimeMinutes(parseSingleTimeString(initialSlot.startTime));
      } else if (initialSlot.time) {
        const parts = initialSlot.time.split('-');
        if (parts[0]) setStartTimeMinutes(parseSingleTimeString(parts[0]));
      }
    } else if (facultyList.length > 0 && !selectedFacultyId) {
      setSelectedFacultyId(facultyList[0].employeeId);
      setInstructor(facultyList[0].name);
    }
  }, [initialSlot, facultyList]);

  // Derived formatted times
  const endTimeMinutes = startTimeMinutes + durationMinutes;
  const startTimeDisplay = formatMinutesToTime(startTimeMinutes);
  const endTimeDisplay = formatMinutesToTime(endTimeMinutes);
  const fullTimeDisplay = `${startTimeDisplay} - ${endTimeDisplay}`;

  // Handle faculty selection change
  const handleFacultyChange = (empId: string) => {
    setSelectedFacultyId(empId);
    const fac = facultyList.find((f) => f.employeeId === empId);
    if (fac) {
      setInstructor(fac.name);
    }
  };

  // Real-time conflict check
  const conflictingSlot = allSlots.find((s) => {
    if (initialSlot?.id && s.id === initialSlot.id) return false;
    if (s.day !== day) return false;

    const parts = s.time.split('-');
    const sStart = parts[0] ? parseSingleTimeString(parts[0]) : 9 * 60;
    const sEnd = parts[1] ? parseSingleTimeString(parts[1]) : sStart + (s.durationMinutes || 90);

    const overlaps = Math.max(startTimeMinutes, sStart) < Math.min(endTimeMinutes, sEnd);
    if (!overlaps) return false;

    const sameFaculty =
      (selectedFacultyId && s.facultyId && selectedFacultyId === s.facultyId) ||
      (instructor && s.instructor && instructor.trim().toLowerCase() === s.instructor.trim().toLowerCase());

    const sameRoom = room && s.room && room.trim().toLowerCase() === s.room.trim().toLowerCase();

    return sameFaculty || sameRoom;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) return;

    const matchedFaculty = facultyList.find((f) => f.employeeId === selectedFacultyId);

    onSave({
      id: initialSlot?.id,
      day,
      time: fullTimeDisplay,
      startTime: startTimeDisplay,
      endTime: endTimeDisplay,
      durationMinutes,
      courseCode: courseCode.trim().toUpperCase() || 'CRS-101',
      courseTitle: courseTitle.trim(),
      facultyId: selectedFacultyId || matchedFaculty?.employeeId || '',
      facultyEmail: matchedFaculty?.email || '',
      instructor: instructor.trim() || matchedFaculty?.name || 'Faculty Member',
      room: room.trim() || 'Room 101',
      batch: batch.trim() || 'All Batches',
      type,
      colorTheme,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.16 }}
        className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] shadow-2xl max-w-2xl w-full p-5 sm:p-7 space-y-5 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-[#404040]">
          <div>
            <h3 className="text-lg font-black tracking-tight">
              {isEditing ? 'Edit Schedule Period' : 'Add Schedule Period'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Admin assignment to faculty · Monday through Friday
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean, Simple Form with Bigger Fields */}
        <form onSubmit={handleSubmit} className="space-y-4.5">
          {/* Day of Week - Clean Large Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Day of Week
            </label>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {TIMETABLE_DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-center border ${
                    day === d
                      ? 'bg-brand text-white border-brand shadow-xs scale-102'
                      : 'bg-slate-50 dark:bg-[#353535] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#525252] hover:bg-slate-100'
                  }`}
                >
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Title & Code - Large Comfortable Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Subject Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full py-3 px-4 text-sm font-semibold bg-slate-50 dark:bg-[#383838] border border-slate-200 dark:border-[#525252] rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                placeholder="e.g. CS-301"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full py-3 px-4 text-sm font-mono font-bold uppercase bg-slate-50 dark:bg-[#383838] border border-slate-200 dark:border-[#525252] rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand shadow-2xs"
              />
            </div>
          </div>

          {/* Assigned Faculty - Unique ID Dropdown (Admin Only Assigns) */}
          <div className="p-4 rounded-3xl bg-slate-50/90 dark:bg-[#333333] border border-slate-200 dark:border-[#4d4d4d] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-brand" />
                <span>Assign to Faculty Member</span>
              </label>
              {selectedFacultyId && (
                <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                  {selectedFacultyId}
                </span>
              )}
            </div>

            <FacultySearchSelector
              facultyList={facultyList}
              selectedFacultyId={selectedFacultyId}
              onSelectFaculty={(fac) => {
                if (fac) {
                  setSelectedFacultyId(fac.employeeId);
                  setInstructor(fac.name);
                }
              }}
              placeholder="Search faculty by name or ID..."
              size="md"
            />
          </div>

          {/* Interactive Clock Time Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Select Time & Duration (Visual Clock)
            </label>
            <InteractiveClockPicker
              startTimeMinutes={startTimeMinutes}
              durationMinutes={durationMinutes}
              onChangeStartTime={(min) => setStartTimeMinutes(min)}
              onChangeDuration={(dur) => setDurationMinutes(dur)}
            />
          </div>

          {/* Session Type, Room & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Session Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as TimetableSlot['type'];
                  setType(newType);
                  if (newType === 'Lecture') setColorTheme('pastel-blue');
                  else if (newType === 'Lab') setColorTheme('pastel-teal');
                  else if (newType === 'Seminar') setColorTheme('pastel-pink');
                  else if (newType === 'Tutorial') setColorTheme('pastel-yellow');
                  else if (newType === 'Break') setColorTheme('pastel-peach');
                }}
                className="w-full py-3 px-3.5 text-xs font-bold bg-slate-50 dark:bg-[#383838] border border-slate-200 dark:border-[#525252] rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand"
              >
                <option value="Lecture">Lecture (Theory)</option>
                <option value="Lab">Laboratory (Practical)</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Seminar">Seminar</option>
                <option value="Break">Campus Recess</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Room / Venue</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 301"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full py-3 px-3.5 text-xs font-semibold bg-slate-50 dark:bg-[#383838] border border-slate-200 dark:border-[#525252] rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Class</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Class CS-A, Class 101"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full py-3 px-3.5 text-xs font-semibold bg-slate-50 dark:bg-[#383838] border border-slate-200 dark:border-[#525252] rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          {/* Soft Pastel Color Palette */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand" />
                <span>Soft Pastel Color Theme</span>
              </label>
              <span className="text-xs font-bold text-slate-400">
                {PASTEL_PALETTES[colorTheme]?.name || 'Pastel'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap p-3 rounded-2xl bg-slate-50 dark:bg-[#353535] border border-slate-200/80 dark:border-[#444444]">
              {Object.values(PASTEL_PALETTES).map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  title={pal.name}
                  onClick={() => setColorTheme(pal.id)}
                  style={{ backgroundColor: pal.previewColor }}
                  className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center border ${
                    colorTheme === pal.id
                      ? 'scale-115 ring-3 ring-slate-800 dark:ring-white border-transparent shadow-sm'
                      : 'border-slate-300/80 dark:border-slate-600 hover:scale-105'
                  }`}
                >
                  {colorTheme === pal.id && <Check className="w-4 h-4 text-slate-800" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clash Notice if any */}
          {conflictingSlot && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Schedule Overlap Alert</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Overlaps with &quot;{conflictingSlot.courseCode}&quot; ({conflictingSlot.time}) for {conflictingSlot.instructor}.
                </p>
              </div>
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#404040] flex items-center justify-between">
            {isEditing && onDelete ? (
              showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-500 font-bold">Confirm delete?</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (initialSlot?.id) onDelete(initialSlot.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Period</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-[#525252] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#383838] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-sm transition-all cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Assign to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
