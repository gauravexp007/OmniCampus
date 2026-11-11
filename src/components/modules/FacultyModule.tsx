import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  Trash2,
  X,
  Eye,
  BookOpen,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { FacultyMember } from '../../types';
import { SKETCH_FACULTY } from '../../utils/sketchAvatars';

export const FacultyModule: React.FC = () => {
  const { faculty, courses, addFaculty, deleteFaculty, updateFaculty, role, setCurrentModule } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingAssignments, setIsEditingAssignments] = useState(false);

  // New faculty form state
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: 'Computer Science & AI',
    designation: 'Assistant Professor' as FacultyMember['designation'],
    specialization: '',
    officeRoom: '',
    phone: '',
    coursesAssigned: [] as string[],
  });

  const departments = [
    'All',
    'Computer Science & AI',
    'Electronics & Robotics',
    'Mechanical & Aerospace',
    'Biomedical Engineering',
    'School of Management',
  ];

  const designations: FacultyMember['designation'][] = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Department Chair',
    'Adjunct Fellow',
  ];

  // Available courses to assign from database or fallback catalog
  const catalogCourses = courses.length > 0
    ? courses
    : [
        { id: 'c1', code: 'CS-301', title: 'Distributed Database Systems', department: 'Computer Science & AI' },
        { id: 'c2', code: 'CS-302', title: 'Neural Networks & Deep Learning', department: 'Computer Science & AI' },
        { id: 'c3', code: 'CS-304', title: 'Operating Systems & Concurrency', department: 'Computer Science & AI' },
        { id: 'c4', code: 'ECE-201', title: 'Digital Signal Processing', department: 'Electronics & Robotics' },
        { id: 'c5', code: 'ROB-301', title: 'Autonomous Robotics & Control', department: 'Electronics & Robotics' },
        { id: 'c6', code: 'BME-210', title: 'Biomedical Signal Analysis', department: 'Biomedical Engineering' },
        { id: 'c7', code: 'BME-305', title: 'Neural Engineering & Implants', department: 'Biomedical Engineering' },
        { id: 'c8', code: 'AERO-401', title: 'Aerodynamics & Flight Dynamics', department: 'Mechanical & Aerospace' },
        { id: 'c9', code: 'MBA-101', title: 'Organizational Strategy', department: 'School of Management' },
      ];

  const filteredFaculty = faculty.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || f.department === selectedDept;
    return matchesQuery && matchesDept;
  });

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name.trim()) return;

    addFaculty({
      employeeId:
        newFaculty.employeeId.trim() ||
        `FAC-${newFaculty.department.substring(0, 2).toUpperCase()}-${Math.floor(
          100 + Math.random() * 900
        )}`,
      name: newFaculty.name.trim(),
      email:
        newFaculty.email.trim() ||
        `${newFaculty.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      avatar: SKETCH_FACULTY,
      department: newFaculty.department,
      designation: newFaculty.designation,
      specialization: newFaculty.specialization.trim() || 'Computer Science',
      coursesAssigned: newFaculty.coursesAssigned,
      weeklyHours: 14,
      publicationsCount: 4,
      rating: 4.8,
      status: 'Active',
      phone: newFaculty.phone.trim() || '+1 (555) 012-3456',
      officeRoom: newFaculty.officeRoom.trim() || 'Room 302, Academic Block',
      joinedYear: 2026,
    });

    setIsAddModalOpen(false);
    setNewFaculty({
      name: '',
      email: '',
      employeeId: '',
      department: 'Computer Science & AI',
      designation: 'Assistant Professor',
      specialization: '',
      officeRoom: '',
      phone: '',
      coursesAssigned: [],
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Faculty Directory</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {faculty.length} {faculty.length === 1 ? 'Member' : 'Members'}
            </span>
          </div>
        </div>

        {(role === 'Admin' || role === 'Faculty') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty name, specialization, or employee ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter by department"
            className="w-full sm:w-48 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty List / Grid */}
      {filteredFaculty.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFaculty.map((member) => (
            <div
              key={member.id}
              className="bg-white dark:bg-[#242424] rounded-xl border border-slate-200 dark:border-[#3d3d3d] p-4 shadow-xs hover:border-slate-300 dark:hover:border-[#555555] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{member.name}</h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{member.designation}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                      {member.employeeId}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                      FACULTY ID
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-[#383838]">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.specialization && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500 dark:text-slate-400">{member.specialization}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Assignment Quick Buttons */}
              {role === 'Admin' && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-[#383838]">
                  <button
                    type="button"
                    onClick={() => setCurrentModule('timetable')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold transition-colors cursor-pointer"
                    title={`Assign Timetable to ${member.name} (${member.employeeId})`}
                  >
                    <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">Assign Timetable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentModule('attendance')}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold transition-colors cursor-pointer"
                    title={`Assign Attendance Register to ${member.name} (${member.employeeId})`}
                  >
                    <CheckSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Assign Attendance</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-[#383838]">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                  Office: {member.officeRoom}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedFaculty(member)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {(role === 'Admin' || role === 'Faculty') && (
                    <button
                      onClick={() => deleteFaculty(member.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      title="Delete faculty member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Faculty Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedDept !== 'All'
              ? 'No faculty members match your active search.'
              : 'No faculty profiles currently exist. Add a faculty record to populate the directory.'}
          </p>
          {(role === 'Admin' || role === 'Faculty') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Faculty Member</span>
            </button>
          )}
        </div>
      )}

      {/* Add Faculty Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Faculty Member</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddFaculty} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FAC-2026-CS-01"
                    value={newFaculty.employeeId}
                    onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {departments
                      .filter((d) => d !== 'All')
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Designation
                  </label>
                  <select
                    value={newFaculty.designation}
                    onChange={(e) =>
                      setNewFaculty({
                        ...newFaculty,
                        designation: e.target.value as FacultyMember['designation'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {designations.map((desig) => (
                      <option key={desig} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="faculty@university.edu"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quantum Algorithms"
                    value={newFaculty.specialization}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, specialization: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Office / Laboratory Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 402, CS Tech Building"
                    value={newFaculty.officeRoom}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, officeRoom: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Assigned Teaching Subjects
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                    {catalogCourses.map((c) => {
                      const isChecked = newFaculty.coursesAssigned.includes(c.code);
                      return (
                        <label
                          key={c.code}
                          className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewFaculty({
                                  ...newFaculty,
                                  coursesAssigned: [...newFaculty.coursesAssigned, c.code],
                                });
                              } else {
                                setNewFaculty({
                                  ...newFaculty,
                                  coursesAssigned: newFaculty.coursesAssigned.filter(
                                    (code) => code !== c.code
                                  ),
                                });
                              }
                            }}
                            className="rounded text-brand focus:ring-brand"
                          />
                          <span className="truncate">{c.code}: {c.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Faculty Details Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Faculty Details</h3>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-base flex items-center justify-center">
                  {selectedFaculty.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedFaculty.name}</h4>
                  <p className="text-indigo-600 font-semibold">{selectedFaculty.designation}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee ID:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedFaculty.employeeId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedFaculty.department}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedFaculty.specialization}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Office Room:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedFaculty.officeRoom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedFaculty.email}</span>
                </div>
              </div>

              {/* Assigned Teaching Subjects (Admin Managed) */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Assigned Subjects (Attendance Marking):</span>
                  {role === 'Admin' && (
                    <button
                      type="button"
                      onClick={() => setIsEditingAssignments(!isEditingAssignments)}
                      className="text-[11px] text-brand hover:underline font-bold"
                    >
                      {isEditingAssignments ? 'Done Editing' : 'Edit Assigned Subjects'}
                    </button>
                  )}
                </div>

                {isEditingAssignments && role === 'Admin' ? (
                  <div className="space-y-1.5 pt-1 border-t border-slate-200">
                    <p className="text-[10px] text-slate-500">
                      Check the subjects this faculty member is permitted to mark attendance for:
                    </p>
                    <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-lg">
                      {catalogCourses.map((c) => {
                        const isAssigned = (selectedFaculty.coursesAssigned || []).includes(c.code);
                        return (
                          <label
                            key={c.code}
                            className={`flex items-center gap-2 p-1.5 rounded text-[11px] cursor-pointer ${
                              isAssigned ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                const current = selectedFaculty.coursesAssigned || [];
                                const updated = e.target.checked
                                  ? [...current, c.code]
                                  : current.filter((x) => x !== c.code);
                                const updatedFac = { ...selectedFaculty, coursesAssigned: updated };
                                setSelectedFaculty(updatedFac);
                                updateFaculty(updatedFac);
                              }}
                              className="rounded text-brand"
                            />
                            <span className="truncate">{c.code}: {c.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedFaculty.coursesAssigned && selectedFaculty.coursesAssigned.length > 0 ? (
                      selectedFaculty.coursesAssigned.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold"
                        >
                          {code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-amber-600 font-medium">
                        No subjects assigned yet by Admin
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFaculty(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
