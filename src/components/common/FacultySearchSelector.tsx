import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, User, Building, Users } from 'lucide-react';
import { FacultyMember } from '../../types';
import { cn } from '../../lib/utils';

export interface FacultySearchSelectorProps {
  facultyList: FacultyMember[];
  selectedFacultyId: string;
  onSelectFaculty: (faculty: FacultyMember | null) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  allowClear?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showAllOption?: boolean;
  allOptionLabel?: string;
  onSelectAll?: () => void;
  id?: string;
}

/**
 * FacultySearchSelector
 * A production-grade, modular search selector for faculty members.
 * Implements real-time filtering with:
 * - Faculty ID displayed at the front of the name: [FAC-YYYY-ID]
 * - Faculty ID displayed as a highlighted badge at the end corner
 * Designed for attendance, timetable, notices, and administrative workflows.
 */
export const FacultySearchSelector: React.FC<FacultySearchSelectorProps> = ({
  facultyList,
  selectedFacultyId,
  onSelectFaculty,
  placeholder = 'Search faculty by name or ID...',
  label,
  className,
  allowClear = false,
  size = 'md',
  showAllOption = false,
  allOptionLabel = 'All Faculty Members',
  onSelectAll,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When opening, focus the search input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Selected faculty member
  const selectedFaculty = useMemo(() => {
    if (!selectedFacultyId || selectedFacultyId === 'ALL') return null;
    return facultyList.find(
      (f) =>
        f.employeeId.toLowerCase() === selectedFacultyId.toLowerCase() ||
        f.id.toLowerCase() === selectedFacultyId.toLowerCase()
    ) || null;
  }, [facultyList, selectedFacultyId]);

  // Filtered faculty list based on search query
  const filteredFaculty = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return facultyList;
    return facultyList.filter((f) => {
      const matchName = f.name.toLowerCase().includes(q);
      const matchId = f.employeeId.toLowerCase().includes(q);
      const matchDept = f.department.toLowerCase().includes(q);
      const matchDesig = f.designation?.toLowerCase().includes(q);
      return matchName || matchId || matchDept || matchDesig;
    });
  }, [facultyList, searchQuery]);

  const sizeStyles = {
    sm: 'text-xs py-1.5 px-2.5 rounded-lg',
    md: 'text-xs py-2 px-3 rounded-xl',
    lg: 'text-sm py-2.5 px-3.5 rounded-xl',
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
        >
          {label}
        </label>
      )}

      {/* Main Trigger Field */}
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          'w-full flex items-center justify-between gap-2 border bg-white dark:bg-[#1f2633] border-slate-300 dark:border-[#373e4b] shadow-2xs hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer select-none',
          sizeStyles[size],
          isOpen ? 'ring-2 ring-brand/30 border-brand dark:border-brand' : ''
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedFaculty ? (
            <>
              {/* Faculty ID Shown at the Front of Name */}
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                [{selectedFaculty.employeeId}]
              </span>

              {/* Faculty Name */}
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {selectedFaculty.name}
              </span>

              <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate hidden sm:inline">
                • {selectedFaculty.department}
              </span>
            </>
          ) : showAllOption && selectedFacultyId === 'ALL' ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                [ALL]
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {allOptionLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400">
              <Search className="w-3.5 h-3.5" />
              <span className="truncate">{placeholder}</span>
            </div>
          )}
        </div>

        {/* Right Corner: Faculty ID Corner Badge if selected + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedFaculty && (
            <span
              className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hidden md:inline"
              title="Assigned Faculty Identifier"
            >
              {selectedFaculty.employeeId}
            </span>
          )}

          {allowClear && selectedFaculty && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectFaculty(null);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200',
              isOpen ? 'rotate-180 text-brand' : ''
            )}
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#1a202c] rounded-xl shadow-xl border border-slate-300 dark:border-[#384252] p-2 space-y-2 backdrop-blur-md animate-in fade-in duration-150 max-w-full sm:min-w-[340px]">
          {/* Live Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search faculty name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1" role="listbox">
            {/* Optional All Faculty Item */}
            {showAllOption && (
              <button
                type="button"
                onClick={() => {
                  if (onSelectAll) onSelectAll();
                  else onSelectFaculty(null);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer',
                  selectedFacultyId === 'ALL'
                    ? 'bg-brand/10 dark:bg-brand/20 border border-brand/40 text-brand font-black'
                    : 'hover:bg-slate-100 dark:hover:bg-[#252c38] text-slate-800 dark:text-slate-200 font-bold'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-xs text-slate-900 dark:text-white">
                      [ALL] {allOptionLabel}
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      View records across all faculty members
                    </p>
                  </div>
                </div>
                {selectedFacultyId === 'ALL' && <Check className="w-3.5 h-3.5 text-brand" />}
              </button>
            )}

            {filteredFaculty.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No faculty members match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredFaculty.map((fac) => {
                const isSelected =
                  selectedFacultyId.toLowerCase() === fac.employeeId.toLowerCase() ||
                  selectedFacultyId.toLowerCase() === fac.id.toLowerCase();

                return (
                  <button
                    key={fac.id || fac.employeeId}
                    type="button"
                    onClick={() => {
                      onSelectFaculty(fac);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer border',
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#222834] text-slate-800 dark:text-slate-200'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-md bg-brand/10 dark:bg-brand/20 text-brand font-black text-xs flex items-center justify-center shrink-0 border border-brand/20">
                        {fac.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        {/* Faculty ID Shown at the Front of Name */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700">
                            [{fac.employeeId}]
                          </span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {fac.name}
                          </span>
                        </div>

                        {/* Designation & Department */}
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {fac.designation} • {fac.department}
                        </p>
                      </div>
                    </div>

                    {/* Faculty ID Shown at the End Corner While Searching */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                        {fac.employeeId}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
