import React from 'react';
import {
  Sparkles,
  Plus,
  Printer,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Filter,
  UserCheck,
} from 'lucide-react';
import { TimetableCategory, TIMETABLE_CATEGORIES, PASTEL_PALETTES } from './TimetableTypes';
import { FacultyMember } from '../../types';
import { FacultySearchSelector } from '../common/FacultySearchSelector';

interface TimetableHeaderProps {
  onOpenGenerator: () => void;
  onOpenAddModal: () => void;
  onPrint: () => void;
  selectedCategoryFilter: string | null;
  onSelectCategoryFilter: (categoryType: string | null) => void;
  selectedBatch: string;
  onSelectBatch: (batch: string) => void;
  availableBatches: string[];
  selectedFacultyFilter: string;
  onSelectFacultyFilter: (facId: string) => void;
  facultyList: FacultyMember[];
  conflictCount: number;
  onOpenConflicts?: () => void;
  viewMode: 'grid' | 'day' | 'agenda';
  onChangeViewMode: (mode: 'grid' | 'day' | 'agenda') => void;
  isAdmin: boolean;
  isFaculty: boolean;
  facultyId?: string;
  facultyName?: string;
  totalSlots: number;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  onOpenGenerator,
  onOpenAddModal,
  onPrint,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  selectedBatch,
  onSelectBatch,
  availableBatches,
  selectedFacultyFilter,
  onSelectFacultyFilter,
  facultyList,
  conflictCount,
  onOpenConflicts,
  viewMode,
  onChangeViewMode,
  isAdmin,
  isFaculty,
  facultyId,
  facultyName,
  totalSlots,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner & Title Row */}
      <div className="bg-white dark:bg-[#2b2b2b] rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-[#525252] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#1E3A8A] via-[#2563EB] to-[#60A5FA] text-white flex items-center justify-center shadow-md shrink-0">
            <CalendarDays className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {isFaculty ? 'My Teaching Timetable' : 'Weekly Timetable Schedule'}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#3d3d3d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#525252]">
                {totalSlots} {totalSlots === 1 ? 'Period' : 'Periods'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFaculty
                ? `Faculty ID: ${facultyId || 'Assigned'} · Assigned by University Administration (Read Only)`
                : isAdmin
                ? 'Administration Timetable Generator · Assign periods to faculty with unique IDs'
                : 'Monday to Friday academic schedule'}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Conflict Badge (Admin Only) */}
          {isAdmin && (
            conflictCount > 0 ? (
              <button
                type="button"
                onClick={onOpenConflicts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{conflictCount} Clash Alert{conflictCount > 1 ? 's' : ''}</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Clashes</span>
              </div>
            )
          )}

          {/* Admin Faculty Filter Selector (Admin can search & view schedule per faculty) */}
          {isAdmin && (
            <div className="w-56 sm:w-64">
              <FacultySearchSelector
                facultyList={facultyList}
                selectedFacultyId={selectedFacultyFilter}
                onSelectFaculty={(fac) => {
                  onSelectFacultyFilter(fac ? fac.employeeId : 'ALL');
                }}
                showAllOption={true}
                allOptionLabel="All Faculty Timetables"
                onSelectAll={() => onSelectFacultyFilter('ALL')}
                placeholder="Filter by Faculty..."
                size="sm"
              />
            </div>
          )}

          {/* Class Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#383838] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#525252]">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={selectedBatch}
              onChange={(e) => onSelectBatch(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-white border-none focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {availableBatches.map((b) => (
                <option key={b} value={b}>
                  {b.startsWith('Class') ? b : `Class: ${b}`}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#383838] p-1 rounded-xl border border-slate-200 dark:border-[#525252]">
            <button
              type="button"
              onClick={() => onChangeViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#4a4a4a] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              5-Day Grid
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('day')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-[#4a4a4a] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Day Focus
            </button>
          </div>

          {/* Print Schedule */}
          <button
            type="button"
            onClick={onPrint}
            title="Print Schedule"
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#383838] hover:bg-slate-200 dark:hover:bg-[#454545] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#525252] transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Auto-Generator Button (Admin Login Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenGenerator}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:opacity-95 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Auto-Generate</span>
            </button>
          )}

          {/* Add Block Button (Admin Login Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Block</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Top Category Tag Bar */}
      <div className="bg-white/95 dark:bg-[#2b2b2b] rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-[#525252] shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
              Category:
            </span>

            {/* "All" reset filter badge */}
            <button
              type="button"
              onClick={() => onSelectCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedCategoryFilter === null
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-slate-100 dark:bg-[#383838] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#525252] hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>

            {/* Pastel Category Badges */}
            {TIMETABLE_CATEGORIES.map((cat) => {
              const pal = PASTEL_PALETTES[cat.paletteKey];
              const isSelected = selectedCategoryFilter === cat.type;

              return (
                <button
                  key={cat.type}
                  type="button"
                  onClick={() => onSelectCategoryFilter(isSelected ? null : cat.type)}
                  style={{ backgroundColor: pal?.previewColor }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'ring-2 ring-slate-900 dark:ring-white border-transparent scale-103 shadow-xs'
                      : 'border-black/5 hover:opacity-90'
                  }`}
                >
                  <span className={pal?.textLight || 'text-slate-900'}>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            {isAdmin ? (
              <span>Only Admin can edit and assign timetable blocks</span>
            ) : (
              <span>Assigned teaching periods · Read only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
