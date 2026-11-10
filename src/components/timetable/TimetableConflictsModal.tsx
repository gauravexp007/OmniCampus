import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { TimetableConflict } from './TimetableTypes';
import { TimetableSlot } from '../../types';

interface TimetableConflictsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: TimetableConflict[];
  onEditSlot: (slot: TimetableSlot) => void;
  onDeleteSlot: (id: string) => void;
}

export const TimetableConflictsModal: React.FC<TimetableConflictsModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onEditSlot,
  onDeleteSlot,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18 }}
        className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#404040]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Schedule Conflict Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {conflicts.length} overlapping timetable period{conflicts.length === 1 ? '' : 's'} detected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#3d3d3d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {conflicts.length > 0 ? (
          <div className="space-y-3">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-extrabold">
                  <span className="capitalize">{conf.type.replace('_', ' ')}</span>
                  <span className="font-mono text-[10px] bg-amber-200/70 dark:bg-amber-800/60 px-2 py-0.5 rounded-md">
                    {conf.slotA.day}
                  </span>
                </div>

                <p className="text-amber-800 dark:text-amber-300 font-medium">
                  {conf.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                  {/* Slot A */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#4d4d4d] flex flex-col justify-between">
                    <div>
                      <span className="font-mono font-bold text-brand">{conf.slotA.courseCode}</span>
                      <p className="font-bold truncate mt-0.5">{conf.slotA.courseTitle}</p>
                      <p className="text-[10px] text-slate-400">{conf.slotA.time}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-100 dark:border-[#444444]">
                      <button
                        type="button"
                        onClick={() => {
                          onEditSlot(conf.slotA);
                          onClose();
                        }}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#444444] cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  </div>

                  {/* Slot B */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#353535] border border-slate-200 dark:border-[#4d4d4d] flex flex-col justify-between">
                    <div>
                      <span className="font-mono font-bold text-brand">{conf.slotB.courseCode}</span>
                      <p className="font-bold truncate mt-0.5">{conf.slotB.courseTitle}</p>
                      <p className="text-[10px] text-slate-400">{conf.slotB.time}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2 pt-1 border-t border-slate-100 dark:border-[#444444]">
                      <button
                        type="button"
                        onClick={() => {
                          onEditSlot(conf.slotB);
                          onClose();
                        }}
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#444444] cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No schedule clashes detected! All classrooms, laboratories, and faculty allocations are harmonious.
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-[#404040] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
};
