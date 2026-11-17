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
          'theme-dropdown-trigger w-full flex items-center justify-between gap-2 border shadow-2xs transition-all cursor-pointer select-none',
          sizeStyles[size],
          isOpen ? 'ring-2 ring-brand/30 border-brand-solid' : ''
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedFaculty ? (
            <>
              {/* Faculty ID Shown at the Front of Name */}
              <span className="theme-dropdown-badge font-mono text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0">
                [{selectedFaculty.employeeId}]
              </span>

              {/* Faculty Name */}
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {selectedFaculty.name}
              </span>

              <span className="text-[11px] text-slate-500 dark:text-slate-300 truncate hidden sm:inline">
                • {selectedFaculty.department}
              </span>
            </>
          ) : showAllOption && selectedFacultyId === 'ALL' ? (
            <div className="flex items-center gap-2">
              <span className="theme-dropdown-badge font-mono text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0">
                [ALL]
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white truncate">
                {allOptionLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-brand" />
              <span className="truncate">{placeholder}</span>
            </div>
          )}
        </div>

        {/* Right Corner: Faculty ID Corner Badge if selected + Chevron */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {selectedFaculty && (
            <span
              className="theme-dropdown-badge font-mono text-[9px] font-black px-1.5 py-0.5 rounded border hidden md:inline"
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
              'w-3.5 h-3.5 text-slate-500 dark:text-slate-300 transition-transform duration-200',
              isOpen ? 'rotate-180 text-brand' : ''
            )}
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="theme-dropdown-panel absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl shadow-xl border p-2 space-y-2 backdrop-blur-md animate-in fade-in duration-150 max-w-full sm:min-w-[340px]">
          {/* Live Search Input Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-brand absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search faculty name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-white/90 dark:bg-[#141820]/80 border border-brand/30 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand"
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
                  'theme-dropdown-item w-full flex items-center justify-between p-2 rounded-lg text-left text-xs cursor-pointer border',
                  selectedFacultyId === 'ALL'
                    ? 'theme-dropdown-item-active font-black'
                    : 'border-transparent font-bold'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="theme-dropdown-badge w-6 h-6 rounded-md border flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-black text-xs">
                      [ALL] {allOptionLabel}
                    </span>
                    <p className="text-[10px] opacity-75">
                      View records across all faculty members
                    </p>
                  </div>
                </div>
                {selectedFacultyId === 'ALL' && <Check className="w-3.5 h-3.5" />}
              </button>
            )}

            {filteredFaculty.length === 0 ? (
              <div className="p-4 text-center opacity-70 text-xs">
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
                      'theme-dropdown-item w-full flex items-center justify-between gap-2 p-2 rounded-lg text-left text-xs cursor-pointer border',
                      isSelected
                        ? 'theme-dropdown-item-active'
                        : 'border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="theme-dropdown-badge w-7 h-7 rounded-md font-black text-xs flex items-center justify-center shrink-0 border">
                        {fac.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        {/* Faculty ID Shown at the Front of Name */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="theme-dropdown-badge font-mono text-[10px] font-black px-1.5 py-0.2 rounded border">
                            [{fac.employeeId}]
                          </span>
                          <span className="font-extrabold text-xs truncate">
                            {fac.name}
                          </span>
                        </div>

                        {/* Designation & Department */}
                        <p className="text-[10px] opacity-75 truncate mt-0.5">
                          {fac.designation} • {fac.department}
                        </p>
                      </div>
                    </div>

                    {/* Faculty ID Shown at the End Corner While Searching */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="theme-dropdown-badge font-mono text-[10px] font-black px-2 py-0.5 rounded-md border shadow-2xs">
                        {fac.employeeId}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
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
