import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  Move,
  GripVertical,
  Minus,
  Maximize2,
} from 'lucide-react';
import { TimetableSlot } from '../../types';
import {
  TimetableDay,
  TIMETABLE_DAYS,
  PASTEL_PALETTES,
  generateTimeSlots,
  parseTimeToMinutes,
  formatMinutesToTime,
  parseSingleTimeString,
  SlotTime,
} from './TimetableTypes';

interface TimetableGridProps {
  slots: TimetableSlot[];
  onSlotClick: (slot: TimetableSlot) => void;
  onSlotEdit: (slot: TimetableSlot) => void;
  onSlotDelete: (id: string) => void;
  onSlotResize: (id: string, newDuration: number) => void;
  onSlotMove: (id: string, newDay: TimetableDay, newStartTimeMinutes: number) => void;
  onAddAtSlot: (day: TimetableDay, timeStr: string) => void;
  canEdit: boolean;
  categoryFilter: string | null;
  batchFilter: string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  onSlotClick,
  onSlotEdit,
  onSlotDelete,
  onSlotResize,
  onSlotMove,
  onAddAtSlot,
  canEdit,
  categoryFilter,
  batchFilter,
}) => {
  // Grid configuration: 08:00 to 17:00 with 30-min increments
  const startHour = 8;
  const endHour = 17;
  const intervalMinutes = 30;
  const timeSlots = generateTimeSlots(startHour, endHour, intervalMinutes);

  // Drag and drop state
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ day: TimetableDay; slotTime: string } | null>(
    null
  );

  // Active filter
  const filteredSlots = slots.filter((slot) => {
    if (categoryFilter && slot.type !== categoryFilter) return false;
    if (batchFilter !== 'ALL' && slot.batch && slot.batch !== 'All Batches' && slot.batch !== batchFilter) {
      return false;
    }
    return true;
  });

  // Calculate top offset and height for a block within a day column
  // Row height in pixels for 30 minutes
  const ROW_HEIGHT_PX = 56;
  const startDayMinutes = startHour * 60; // 480 mins

  const getSlotPosition = (slot: TimetableSlot) => {
    let startMin = 9 * 60;
    let endMin = 10 * 60 + 30;

    if (slot.startTime) {
      startMin = parseSingleTimeString(slot.startTime);
    } else if (slot.time) {
      const parsed = parseTimeToMinutes(slot.time);
      startMin = parsed.start;
      endMin = parsed.end;
    }

    const duration = slot.durationMinutes || (endMin - startMin > 0 ? endMin - startMin : 90);

    // Calculate vertical offset relative to 08:00 AM start
    const minutesFromStart = Math.max(0, startMin - startDayMinutes);
    const topPx = (minutesFromStart / 30) * ROW_HEIGHT_PX;
    const heightPx = Math.max(48, (duration / 30) * ROW_HEIGHT_PX - 6);

    return { topPx, heightPx, duration, startMin };
  };

  // Group slots by Day
  const slotsByDay: Record<TimetableDay, TimetableSlot[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  };

  filteredSlots.forEach((slot) => {
    const dayName = slot.day as TimetableDay;
    if (slotsByDay[dayName]) {
      slotsByDay[dayName].push(slot);
    }
  });

  return (
    <div className="relative bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200/90 dark:border-[#525252] shadow-sm overflow-hidden flex flex-col">
      {/* Scrollable Container with sticky header & sticky time column */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 relative z-10">
        <div className="min-w-[860px] relative">
          {/* =====================================================================
              COLUMN HEADERS: TIME + MONDAY TO FRIDAY (Sat & Sun strictly excluded)
              ===================================================================== */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] sm:grid-cols-[90px_repeat(5,1fr)] border-b border-slate-200 dark:border-[#404040] bg-slate-50/90 dark:bg-[#333333] sticky top-0 z-20 backdrop-blur-xs">
            {/* Top-left corner */}
            <div className="p-3 text-center border-r border-slate-200 dark:border-[#404040] flex items-center justify-center">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                TIME
              </span>
            </div>

            {/* Day columns */}
            {TIMETABLE_DAYS.map((day) => {
              const dayCount = slotsByDay[day]?.length || 0;
              const isToday =
                new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

              return (
                <div
                  key={day}
                  className={`p-3 text-center border-r last:border-r-0 border-slate-200 dark:border-[#404040] ${
                    isToday ? 'bg-brand/5 dark:bg-brand/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      {day}
                    </span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-brand" title="Today" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                    {dayCount} {dayCount === 1 ? 'Class' : 'Classes'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* =====================================================================
              MAIN TIMETABLE GRID CANVAS (Time slots & absolute scheduled blocks)
              ===================================================================== */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] sm:grid-cols-[90px_repeat(5,1fr)] relative">
            {/* TIME COLUMN (LEFT) */}
            <div className="border-r border-slate-200 dark:border-[#404040] bg-slate-50/50 dark:bg-[#2f2f2f] select-none">
              {timeSlots.map((slot) => (
                <div
                  key={slot.timeStr24}
                  style={{ height: `${ROW_HEIGHT_PX}px` }}
                  className="px-2 text-right text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#383838] flex items-start justify-end pt-1"
                >
                  <span>{slot.timeDisplay.replace(':00', '')}</span>
                </div>
              ))}
            </div>

            {/* 5 DAY COLUMNS (MONDAY TO FRIDAY) */}
            {TIMETABLE_DAYS.map((day) => {
              const daySlots = slotsByDay[day] || [];

              return (
                <div
                  key={day}
                  className="border-r last:border-r-0 border-slate-200 dark:border-[#404040] relative"
                  style={{ height: `${timeSlots.length * ROW_HEIGHT_PX}px` }}
                >
                  {/* Empty Slot Row Dividers & Click-to-Add Targets */}
                  {timeSlots.map((slot) => {
                    const isDragTarget =
                      dragOverTarget?.day === day && dragOverTarget?.slotTime === slot.timeStr24;

                    return (
                      <div
                        key={slot.timeStr24}
                        style={{ height: `${ROW_HEIGHT_PX}px` }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (
                            dragOverTarget?.day !== day ||
                            dragOverTarget?.slotTime !== slot.timeStr24
                          ) {
                            setDragOverTarget({ day, slotTime: slot.timeStr24 });
                          }
                        }}
                        onDragLeave={() => {
                          if (
                            dragOverTarget?.day === day &&
                            dragOverTarget?.slotTime === slot.timeStr24
                          ) {
                            setDragOverTarget(null);
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedSlotId) {
                            onSlotMove(draggedSlotId, day, slot.totalMinutes);
                          }
                          setDraggedSlotId(null);
                          setDragOverTarget(null);
                        }}
                        onClick={() => {
                          if (canEdit) {
                            onAddAtSlot(day, slot.timeDisplay);
                          }
                        }}
                        className={`group/cell border-b border-slate-100 dark:border-[#383838] transition-colors relative cursor-pointer ${
                          isDragTarget
                            ? 'bg-brand/20 ring-2 ring-brand ring-inset'
                            : 'hover:bg-slate-50/80 dark:hover:bg-[#333333]'
                        }`}
                      >
                        {/* Hover Plus Icon affordance */}
                        {canEdit && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity pointer-events-none">
                            <span className="w-6 h-6 rounded-full bg-slate-200/90 dark:bg-[#4a4a4a] text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* ABSOLUTE SCHEDULE BLOCKS WITH SOFT PASTEL PALETTE */}
                  <AnimatePresence>
                    {daySlots.map((slot) => {
                      const { topPx, heightPx, duration } = getSlotPosition(slot);
                      const pal =
                        PASTEL_PALETTES[slot.colorTheme || 'pastel-blue'] ||
                        PASTEL_PALETTES['pastel-blue'];
                      const isBeingDragged = draggedSlotId === slot.id;

                      return (
                        <motion.div
                          layout
                          key={slot.id}
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.16 }}
                          draggable={canEdit}
                          onDragStart={(e) => {
                            try {
                              e.dataTransfer.setData('text/plain', slot.id);
                            } catch {}
                            setDraggedSlotId(slot.id);
                          }}
                          onDragEnd={() => {
                            setDraggedSlotId(null);
                            setDragOverTarget(null);
                          }}
                          data-timetable-card="true"
                          data-attendance-card="true"
                          style={{
                            top: `${topPx + 3}px`,
                            height: `${heightPx}px`,
                            '--card-dark-color': pal.darkMatchingColor,
                            backgroundColor: pal.previewColor,
                            color: pal.darkMatchingColor,
                            borderColor: `${pal.darkMatchingColor}35`,
                          } as React.CSSProperties}
                          className={`timetable-card absolute left-1 right-1 rounded-2xl border transition-all duration-150 p-2 sm:p-2.5 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md cursor-pointer group select-none z-10 ${
                            pal.borderLight
                          } ${pal.borderDark} ${
                            isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-slate-800' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSlotClick(slot);
                          }}
                        >
                          {/* Top Row: Course Code, Type Badge & Class */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${pal.darkMatchingColor}18`, color: pal.darkMatchingColor }}
                              >
                                {slot.courseCode}
                              </span>
                              <span
                                className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: `${pal.darkMatchingColor}12`, color: pal.darkMatchingColor }}
                              >
                                {slot.type}
                              </span>
                              {slot.batch && (
                                <span
                                  className="text-[10px] sm:text-xs font-black tracking-tight"
                                  style={{ color: pal.darkMatchingColor }}
                                >
                                  Class: {slot.batch}
                                </span>
                              )}
                            </div>

                            {/* Duration Badge */}
                            <span
                              className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${pal.darkMatchingColor}18`, color: pal.darkMatchingColor }}
                            >
                              {duration}m
                            </span>
                          </div>

                          {/* Center: Course Title (Bigger, Bold, Solid Dark Matching Color) */}
                          <div className="my-auto py-1">
                            <h4
                              className="text-[13px] sm:text-sm font-black tracking-tight leading-snug line-clamp-2"
                              style={{ color: pal.darkMatchingColor }}
                            >
                              {slot.courseTitle}
                            </h4>
                          </div>

                          {/* Bottom Row: Room, Instructor, and Hover Quick Actions */}
                          <div
                            className="pt-1 border-t flex items-center justify-between gap-1 text-[10px] font-bold"
                            style={{ borderColor: `${pal.darkMatchingColor}20`, color: pal.darkMatchingColor }}
                          >
                            <div className="flex items-center gap-2 truncate font-bold" style={{ color: pal.darkMatchingColor }}>
                              <span className="flex items-center gap-1 truncate" style={{ color: pal.darkMatchingColor }}>
                                <MapPin className="w-3 h-3 shrink-0" style={{ color: pal.darkMatchingColor }} />
                                <span className="truncate">{slot.room}</span>
                              </span>
                              <span className="hidden sm:flex items-center gap-1 truncate font-medium" style={{ color: pal.darkMatchingColor }}>
                                <User className="w-3 h-3 shrink-0" style={{ color: pal.darkMatchingColor }} />
                                <span className="truncate">{slot.instructor}</span>
                              </span>
                            </div>

                            {/* Quick Hover Controls (Edit, Delete, Resize) */}
                            {canEdit && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-black/60 rounded-lg p-0.5 shadow-xs shrink-0"
                              >
                                {/* Quick -30m resize */}
                                <button
                                  type="button"
                                  title="Decrease duration by 30 mins"
                                  onClick={() => {
                                    if (duration > 30) {
                                      onSlotResize(slot.id, duration - 30);
                                    }
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>

                                {/* Quick +30m resize */}
                                <button
                                  type="button"
                                  title="Extend duration by 30 mins"
                                  onClick={() => {
                                    onSlotResize(slot.id, duration + 30);
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>

                                {/* Edit modal */}
                                <button
                                  type="button"
                                  title="Edit Block"
                                  onClick={() => onSlotEdit(slot)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <Pencil className="w-2.5 h-2.5" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  title="Delete Block"
                                  onClick={() => onSlotDelete(slot.id)}
                                  className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Bottom Resize Drag Grip Handle */}
                          {canEdit && (
                            <div
                              title="Hold and drag to reschedule"
                              className="absolute bottom-0 inset-x-0 h-1 bg-black/10 dark:bg-white/10 hover:bg-brand cursor-ns-resize transition-colors"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
