import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { TimetableSlot } from '../../types';
import {
  TimetableDay,
  TIMETABLE_DAYS,
  PASTEL_PALETTES,
  parseTimeToMinutes,
} from './TimetableTypes';

interface TimetableDayViewProps {
  selectedDay: TimetableDay;
  onSelectDay: (day: TimetableDay) => void;
  slots: TimetableSlot[];
  onSlotClick: (slot: TimetableSlot) => void;
  onSlotEdit: (slot: TimetableSlot) => void;
  onSlotDelete: (id: string) => void;
  onAddAtSlot: (day: TimetableDay, timeStr: string) => void;
  canEdit: boolean;
  categoryFilter: string | null;
  batchFilter: string;
}

export const TimetableDayView: React.FC<TimetableDayViewProps> = ({
  selectedDay,
  onSelectDay,
  slots,
  onSlotClick,
  onSlotEdit,
  onSlotDelete,
  onAddAtSlot,
  canEdit,
  categoryFilter,
  batchFilter,
}) => {
  // Filter for active day
  const daySlots = slots
    .filter((slot) => {
      if (slot.day !== selectedDay) return false;
      if (categoryFilter && slot.type !== categoryFilter) return false;
      if (
        batchFilter !== 'ALL' &&
        slot.batch &&
        slot.batch !== 'All Batches' &&
        slot.batch !== batchFilter
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = parseTimeToMinutes(a.time).start;
      const timeB = parseTimeToMinutes(b.time).start;
      return timeA - timeB;
    });

  return (
    <div className="space-y-4">
      {/* Day Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TIMETABLE_DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = slots.filter((s) => s.day === day).length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-brand text-white border-brand shadow-sm scale-102'
                  : 'bg-white dark:bg-[#333333] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#525252] hover:bg-slate-50 dark:hover:bg-[#3d3d3d]'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-[#444444] text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Timeline Cards */}
      {daySlots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <AnimatePresence>
            {daySlots.map((slot) => {
              const pal =
                PASTEL_PALETTES[slot.colorTheme || 'pastel-blue'] ||
                PASTEL_PALETTES['pastel-blue'];

              return (
                <motion.div
                  key={slot.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  data-timetable-card="true"
                  data-attendance-card="true"
                  style={{
                    '--card-dark-color': pal.darkMatchingColor,
                    backgroundColor: pal.previewColor,
                    color: pal.darkMatchingColor,
                    borderColor: `${pal.darkMatchingColor}35`,
                  } as React.CSSProperties}
                  onClick={() => onSlotClick(slot)}
                  className={`timetable-card rounded-3xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] cursor-pointer ${pal.borderLight} ${pal.borderDark}`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="text-xs font-mono font-black px-2.5 py-1 rounded-xl"
                          style={{ backgroundColor: `${pal.darkMatchingColor}18`, color: pal.darkMatchingColor }}
                        >
                          {slot.courseCode}
                        </span>
                        <span
                          className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg uppercase"
                          style={{ backgroundColor: `${pal.darkMatchingColor}12`, color: pal.darkMatchingColor }}
                        >
                          {slot.type}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4
                      className="text-base sm:text-lg font-black tracking-tight leading-snug my-1.5"
                      style={{ color: pal.darkMatchingColor }}
                    >
                      {slot.courseTitle}
                    </h4>

                    {/* Class - Prominently Displayed as Big Text WITHOUT Block Layout */}
                    <div
                      className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 mb-2.5"
                      style={{ color: pal.darkMatchingColor }}
                    >
                      <GraduationCap className="w-5 h-5 shrink-0" style={{ color: pal.darkMatchingColor }} />
                      <span>Class: {slot.batch || 'CS-A'}</span>
                    </div>

                    {/* Metadata lines */}
                    <div
                      className="space-y-1.5 pt-2 border-t text-xs font-bold"
                      style={{ borderColor: `${pal.darkMatchingColor}20`, color: pal.darkMatchingColor }}
                    >
                      <div className="flex items-center gap-2 font-bold" style={{ color: pal.darkMatchingColor }}>
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: pal.darkMatchingColor }} />
                        <span>{slot.time}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold" style={{ color: pal.darkMatchingColor }}>
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: pal.darkMatchingColor }} />
                        <span>{slot.room}</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold" style={{ color: pal.darkMatchingColor }}>
                        <User className="w-3.5 h-3.5 shrink-0" style={{ color: pal.darkMatchingColor }} />
                        <span>{slot.instructor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Actions */}
                  {canEdit && (
                    <div
                      className="flex items-center justify-end pt-3 mt-3 border-t"
                      style={{ borderColor: `${pal.darkMatchingColor}20` }}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSlotEdit(slot)}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          title="Edit Class Block"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSlotDelete(slot.id)}
                          className="p-1.5 rounded-lg bg-white/80 dark:bg-black/40 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Class Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#383838] text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            No Scheduled Sessions for {selectedDay}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enjoy an open research and self-study day, or add class blocks to this day&apos;s schedule.
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => onAddAtSlot(selectedDay, '09:00 AM - 10:30 AM')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class for {selectedDay}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
