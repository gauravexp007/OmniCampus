import React, { useState, useMemo } from 'react';
import {
  Bell,
  Search,
  Plus,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Filter,
  Eye,
  Megaphone,
  X,
  Send,
  Building,
  Lock,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AnnouncementItem, FacultyMember } from '../../types';
import { FacultySearchSelector } from '../common/FacultySearchSelector';
import { cn } from '../../lib/utils';
import { ConfettiButton } from '../ui/ConfettiButton';

export interface NoticesModuleProps {
  initialAssignedFacultyId?: string;
}

export const NoticesModule: React.FC<NoticesModuleProps> = ({ initialAssignedFacultyId }) => {
  const {
    announcements,
    addAnnouncement,
    deleteAnnouncement,
    role,
    faculty,
    currentUser,
  } = useERP();

  const isAdmin = role === 'Admin';
  const isFaculty = role === 'Faculty';
  const facultyId = currentUser?.idNumber || currentUser?.employeeId || '';

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>(
    initialAssignedFacultyId || 'ALL'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'faculty' | 'assigned'>('all');

  // Modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [viewingNotice, setViewingNotice] = useState<AnnouncementItem | null>(null);

  // New notice form state
  const [newNotice, setNewNotice] = useState<{
    title: string;
    category: AnnouncementItem['category'];
    priority: AnnouncementItem['priority'];
    date: string;
    snippet: string;
    targetAudience: 'All Campus' | 'All Faculty' | 'Specific Faculty';
    assignedFacultyId: string;
    assignedFacultyName: string;
  }>({
    title: '',
    category: 'Administrative',
    priority: 'Normal',
    date: new Date().toISOString().split('T')[0],
    snippet: '',
    targetAudience: initialAssignedFacultyId ? 'Specific Faculty' : 'All Campus',
    assignedFacultyId: initialAssignedFacultyId || '',
    assignedFacultyName: '',
  });

  // Filter notices
  const filteredNotices = useMemo(() => {
    return announcements.filter((notice) => {
      // 1. Role / Audience filtering
      if (isFaculty && activeTab === 'assigned') {
        const isAssignedToMe =
          notice.assignedFacultyId &&
          facultyId &&
          notice.assignedFacultyId.toLowerCase() === facultyId.toLowerCase();
        if (!isAssignedToMe) return false;
      }

      if (activeTab === 'faculty') {
        const isForFaculty =
          notice.targetAudience === 'All Faculty' ||
          notice.targetAudience === 'Specific Faculty' ||
          notice.category === 'Administrative';
        if (!isForFaculty) return false;
      }

      // 2. Faculty Filter (Admin selection)
      if (selectedFacultyFilter !== 'ALL') {
        const matchFaculty =
          notice.assignedFacultyId?.toLowerCase() === selectedFacultyFilter.toLowerCase();
        if (!matchFaculty) return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'All' && notice.category !== selectedCategory) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = notice.title.toLowerCase().includes(q);
        const matchSnippet = notice.snippet.toLowerCase().includes(q);
        const matchAuthor = notice.author.toLowerCase().includes(q);
        const matchFacId = notice.assignedFacultyId?.toLowerCase().includes(q);
        const matchFacName = notice.assignedFacultyName?.toLowerCase().includes(q);
        if (!matchTitle && !matchSnippet && !matchAuthor && !matchFacId && !matchFacName) {
          return false;
        }
      }

      return true;
    });
  }, [announcements, isFaculty, activeTab, facultyId, selectedFacultyFilter, selectedCategory, searchQuery]);

  const handleOpenPublish = (preselectFaculty?: FacultyMember) => {
    if (preselectFaculty) {
      setNewNotice({
        title: '',
        category: 'Administrative',
        priority: 'Normal',
        date: new Date().toISOString().split('T')[0],
        snippet: '',
        targetAudience: 'Specific Faculty',
        assignedFacultyId: preselectFaculty.employeeId,
        assignedFacultyName: preselectFaculty.name,
      });
    }
    setIsPublishModalOpen(true);
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title.trim() || !newNotice.snippet.trim()) return;

    addAnnouncement({
      title: newNotice.title.trim(),
      category: newNotice.category,
      priority: newNotice.priority,
      date: newNotice.date || new Date().toISOString().split('T')[0],
      author: currentUser.name || 'University Administration',
      snippet: newNotice.snippet.trim(),
      readCount: 0,
      targetAudience: newNotice.targetAudience,
      assignedFacultyId:
        newNotice.targetAudience === 'Specific Faculty'
          ? newNotice.assignedFacultyId
          : undefined,
      assignedFacultyName:
        newNotice.targetAudience === 'Specific Faculty'
          ? newNotice.assignedFacultyName
          : undefined,
    });

    setIsPublishModalOpen(false);
    setNewNotice({
      title: '',
      category: 'Administrative',
      priority: 'Normal',
      date: new Date().toISOString().split('T')[0],
      snippet: '',
      targetAudience: 'All Campus',
      assignedFacultyId: '',
      assignedFacultyName: '',
    });
  };

  const priorityStyles = {
    Urgent: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    High: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Normal: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#1f242e] rounded-2xl p-5 border border-slate-200 dark:border-[#373e4b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center font-bold shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Notices & Administrative Circulars
              </h1>
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-brand/10 text-brand">
                {announcements.length} Total
              </span>
            </div>
            {isFaculty && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Logged in as Faculty ID:{' '}
                <strong className="text-slate-800 dark:text-white font-mono">
                  {facultyId || 'FAC-2026-ACTIVE'}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Admin Publish Action */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleOpenPublish()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:brightness-105 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice to Faculty</span>
          </button>
        )}
      </div>

      {/* Tabs & Controls Filter Bar */}
      <div className="bg-white dark:bg-[#1f242e] rounded-xl p-3 border border-slate-200 dark:border-[#373e4b] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            All Notices
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faculty')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer',
              activeTab === 'faculty'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            Faculty Circulars
          </button>

          {isFaculty && (
            <button
              type="button"
              onClick={() => setActiveTab('assigned')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                activeTab === 'assigned'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
              )}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assigned to My ID</span>
            </button>
          )}
        </div>

        {/* Search & Faculty Filter */}
        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap flex-1 lg:max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, content, or faculty ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#181d26] border border-slate-200 dark:border-[#373e4b] rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand font-medium"
            />
          </div>

          {/* Admin Faculty Search Selector Filter */}
          {isAdmin && (
            <div className="w-full sm:w-64">
              <FacultySearchSelector
                facultyList={faculty}
                selectedFacultyId={selectedFacultyFilter}
                onSelectFaculty={(fac) => {
                  setSelectedFacultyFilter(fac ? fac.employeeId : 'ALL');
                }}
                showAllOption={true}
                allOptionLabel="All Target Faculties"
                onSelectAll={() => setSelectedFacultyFilter('ALL')}
                placeholder="Filter by Faculty ID..."
                size="sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white dark:bg-[#1f242e] rounded-xl border border-slate-200 dark:border-[#373e4b] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Notices Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery || selectedFacultyFilter !== 'ALL'
              ? 'No notices match your active query or faculty filter.'
              : 'There are currently no active administrative circulars.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredNotices.map((notice) => {
            const isAssignedDirectly =
              notice.assignedFacultyId &&
              facultyId &&
              notice.assignedFacultyId.toLowerCase() === facultyId.toLowerCase();

            return (
              <div
                key={notice.id}
                className={cn(
                  'rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm bg-white dark:bg-[#1f242e]',
                  isAssignedDirectly
                    ? 'border-indigo-300 dark:border-indigo-700/80 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-[#373e4b]'
                )}
              >
                <div className="space-y-2.5">
                  {/* Category, Priority & Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {notice.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border',
                          priorityStyles[notice.priority]
                        )}
                      >
                        {notice.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notice.date}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {notice.title}
                  </h3>

                  {/* Assigned Faculty Identifier Badge */}
                  {notice.assignedFacultyId && (
                    <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Faculty ID at front of name */}
                        <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700 shrink-0">
                          [{notice.assignedFacultyId}]
                        </span>
                        <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
                          {notice.assignedFacultyName || 'Assigned Faculty'}
                        </span>
                      </div>

                      {/* Faculty ID at end corner */}
                      <span className="font-mono text-[9px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                        {notice.assignedFacultyId}
                      </span>
                    </div>
                  )}

                  {/* Notice Content Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {notice.snippet}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#373e4b] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    Issued by: {notice.author}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewingNotice(notice)}
                      className="p-1 rounded-lg text-slate-500 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="View full notice"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => deleteAnnouncement(notice.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Notice Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-300 dark:border-[#384252] shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#373e4b]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Publish & Assign Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="space-y-3.5">
              {/* Notice Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Syllabus Submission Deadline"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newNotice.category}
                    onChange={(e) =>
                      setNewNotice({
                        ...newNotice,
                        category: e.target.value as AnnouncementItem['category'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  >
                    <option value="Administrative">Administrative</option>
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Campus Life">Campus Life</option>
                    <option value="Placement">Placement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newNotice.priority}
                    onChange={(e) =>
                      setNewNotice({
                        ...newNotice,
                        priority: e.target.value as AnnouncementItem['priority'],
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              {/* Target Audience Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#141820] rounded-xl border border-slate-200 dark:border-[#373e4b]">
                  {(['All Campus', 'All Faculty', 'Specific Faculty'] as const).map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() =>
                        setNewNotice({
                          ...newNotice,
                          targetAudience: aud,
                        })
                      }
                      className={cn(
                        'py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center cursor-pointer',
                        newNotice.targetAudience === aud
                          ? 'bg-white dark:bg-[#252c38] text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      )}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Faculty Assignment with FacultySearchSelector */}
              {newNotice.targetAudience === 'Specific Faculty' && (
                <div className="p-3 bg-slate-50 dark:bg-[#141820] rounded-xl border border-slate-200 dark:border-[#373e4b] space-y-1.5 animate-in fade-in duration-150">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Assign to Specific Faculty Member
                  </label>
                  <FacultySearchSelector
                    facultyList={faculty}
                    selectedFacultyId={newNotice.assignedFacultyId}
                    onSelectFaculty={(fac) => {
                      if (fac) {
                        setNewNotice({
                          ...newNotice,
                          assignedFacultyId: fac.employeeId,
                          assignedFacultyName: fac.name,
                        });
                      } else {
                        setNewNotice({
                          ...newNotice,
                          assignedFacultyId: '',
                          assignedFacultyName: '',
                        });
                      }
                    }}
                    placeholder="Search faculty by name or ID..."
                    size="sm"
                  />
                  {newNotice.assignedFacultyId && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Notice will be delivered to Faculty ID [{newNotice.assignedFacultyId}] ({newNotice.assignedFacultyName})
                    </p>
                  )}
                </div>
              )}

              {/* Message Content */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed notice instructions, deadlines, and room or department details..."
                  value={newNotice.snippet}
                  onChange={(e) => setNewNotice({ ...newNotice, snippet: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand font-medium resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#373e4b]">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#373e4b] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#252c38]"
                >
                  Cancel
                </button>
                <ConfettiButton
                  type="submit"
                  variant="brand"
                  size="sm"
                  enableClickCelebration={true}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Notice</span>
                </ConfettiButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Notice Detail Modal */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-300 dark:border-[#384252] shadow-2xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#373e4b]">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {viewingNotice.category}
              </span>
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {viewingNotice.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Published on {viewingNotice.date}</span>
                <span>•</span>
                <span>By {viewingNotice.author}</span>
              </div>

              {viewingNotice.assignedFacultyId && (
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Assigned Faculty
                    </span>
                    <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                      [{viewingNotice.assignedFacultyId}] {viewingNotice.assignedFacultyName || 'Assigned Member'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {viewingNotice.assignedFacultyId}
                  </span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141820] border border-slate-200 dark:border-[#373e4b] text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {viewingNotice.snippet}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
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
