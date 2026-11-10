import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Bell,
  Sparkles,
  HelpCircle,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Menu,
  ChevronRight,
  ChevronDown,
  Home,
  Palette,
  Settings as SettingsIcon,
} from 'lucide-react';
import { UserProfile, ERPModuleId } from '../../types';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

interface NavbarProps {
  user: UserProfile;
  onOpenSearch: () => void;
  onToggleAiDrawer: () => void;
  currentModule: ERPModuleId;
  onToggleSidebar?: () => void;
  onSelectModule?: (module: ERPModuleId) => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenSearch,
  onToggleAiDrawer,
  currentModule,
  onToggleSidebar,
  onSelectModule,
  isSidebarCollapsed,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('Fall 2026');
  const {
    notifications,
    clearNotifications,
    markNotificationAsRead,
    role,
    currentUser,
  } = useERP();

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter((n) => {
    if (!n.recipientRole || n.recipientRole === 'All') return true;
    if (role === 'Student') {
      if (n.recipientRole !== 'Student') return false;
      if (n.recipientId && currentUser.idNumber && n.recipientId !== currentUser.idNumber) {
        return false;
      }
      return true;
    }
    return n.recipientRole === role;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const moduleNames: Record<ERPModuleId, string> = {
    dashboard: 'Dashboard Overview',
    profile: 'User Profile & Account',
    students: 'Student Directory',
    faculty: 'Faculty Directory',
    admissions: 'Admissions Desk',
    academics: 'Academics & Syllabus',
    attendance: 'Attendance Register',
    timetable: 'Class Timetable',
    exams: 'Examinations',
    results: 'Results & Grades',
    performance: 'Performance Analytics',
    finance: 'Finance & Invoicing',
    library: 'Library Catalog',
    hostel: 'Hostel & Accommodations',
    hr: 'HR & Staffing',
    documents: 'Document Vault',
    userfiles: 'Cloud Storage',
    reports: 'Analytics Reports',
    settings: 'System Settings',
  };

  const getSectionName = (mod: ERPModuleId): string => {
    if (mod === 'dashboard') return 'Overview';
    if (['students', 'admissions', 'faculty'].includes(mod)) return 'Front Desk';
    if (['academics', 'timetable', 'attendance', 'exams', 'results', 'performance'].includes(mod)) return 'Academics';
    if (['finance', 'library', 'hostel'].includes(mod)) return 'Services';
    return 'Admin';
  };

  return (
    <header
      id="top-navbar"
      className="relative h-16 bg-[#E2E4E9] dark:bg-[#435055] border-b border-slate-300/60 dark:border-[#55666d] px-2 sm:px-3 md:px-5 flex items-center justify-between gap-1.5 sm:gap-2 z-30 shrink-0 sticky top-0 transition-colors duration-200"
    >
      {/* Left section: Toggle Hamburger + Breadcrumbs / Current Module */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink-0 relative z-10">
        {/* Sidebar Collapse Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            id="navbar-toggle-sidebar"
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-[#a3f7bf] hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#354146] transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Breadcrumb Trail */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-400 dark:text-[#8ea1a5] min-w-0 max-w-[180px] xl:max-w-[280px]">
          <button
            onClick={() => onSelectModule && onSelectModule('dashboard')}
            className="flex items-center gap-1 text-slate-500 dark:text-[#a3f7bf] hover:text-brand dark:hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Home</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-[#55666d] shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white truncate">{moduleNames[currentModule]}</span>
        </div>

        {/* Mobile & Tablet Current Module Chip */}
        <div className="lg:hidden flex items-center min-w-0">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/70 dark:bg-[#354146] border border-slate-300/70 dark:border-[#55666d] text-slate-800 dark:text-white text-xs font-bold truncate max-w-[120px] xs:max-w-[170px] sm:max-w-[220px] shadow-2xs">
            {moduleNames[currentModule]}
          </span>
        </div>
      </div>

      {/* Expanded Central Global Search Bar */}
      <div className="hidden md:flex flex-1 min-w-[100px] max-w-[200px] lg:max-w-xs xl:max-w-md mx-1 sm:mx-2 items-center relative z-10">
        <button
          id="global-search-trigger"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white/80 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#435055] text-slate-500 dark:text-[#a3f7bf] rounded-xl text-xs transition-all border border-slate-300/70 dark:border-[#55666d] cursor-pointer text-left shadow-2xs group"
        >
          <div className="flex items-center gap-2 min-w-0 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#a3f7bf]/70 shrink-0 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
            <span className="truncate font-normal text-slate-500 dark:text-slate-200">Search ERP...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-500 dark:text-[#a3f7bf] bg-slate-100 dark:bg-[#435055] border border-slate-200 dark:border-[#55666d] rounded-md shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Search (mobile), Term Selector, Theme Toggle, Campus Desk, Notifications, User Profile */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 relative z-10">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-[#a3f7bf] hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#4e5c61] bg-white/60 dark:bg-[#354146] border border-slate-300/70 dark:border-[#55666d] transition-colors shrink-0 shadow-2xs"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Academic Term Selector (Large 2XL screens only) */}
        <div className="hidden 2xl:flex items-center bg-white/80 dark:bg-[#354146] border border-slate-300/70 dark:border-[#55666d] rounded-full px-2.5 py-1 text-xs text-slate-700 dark:text-[#e5e5e5] shadow-2xs shrink-0">
          <Calendar className="w-3 h-3 mr-1 text-slate-500 dark:text-[#a3f7bf]" />
          <select
            id="term-selector"
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            aria-label="Academic Term"
            className="bg-transparent border-0 text-[11px] font-bold text-slate-800 dark:text-[#ffffff] focus:outline-hidden cursor-pointer"
          >
            <option value="Fall 2026" className="dark:bg-[#354146]">Fall 2026</option>
            <option value="Spring 2027" className="dark:bg-[#354146]">Spring 2027</option>
          </select>
        </div>

        {/* Animated Day/Night Toggle Switch */}
        <div className="shrink-0">
          <ThemeToggleButton size="sm" />
        </div>

        {/* Campus Operations & Help Desk */}
        <button
          id="ai-assistant-toggle-button"
          onClick={onToggleAiDrawer}
          title="Campus Operations & Institutional Guide"
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700 shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-200 shrink-0" />
          <span className="hidden lg:inline text-[11px]">Campus Desk</span>
        </button>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button
            id="notifications-button"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            className="p-2 rounded-full text-slate-600 dark:text-[#a3f7bf] hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#4e5c61] border border-slate-300/70 dark:border-[#55666d] bg-white/60 dark:bg-[#354146] transition-colors relative cursor-pointer shadow-2xs shrink-0"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white ring-2 ring-white dark:ring-[#435055]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : user.unreadNotifications > 0 ? (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-brand ring-2 ring-white dark:ring-[#435055]" />
            ) : null}
          </button>

          {/* Notification Menu Dropdown */}
          <AnimatePresence>
            {showNotificationMenu && (
              <motion.div
                id="notifications-dropdown"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#435055] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#55666d] py-2.5 z-50 origin-top-right text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between px-3.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">Notifications Center</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {userNotifications.length > 0 && (
                    <button
                      onClick={() => clearNotifications()}
                      className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {userNotifications.length === 0 ? (
                    <div className="p-5 text-center">
                      <p className="text-xs text-slate-500 font-semibold">No new notifications</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Attendance alerts and system notices will appear here.
                      </p>
                    </div>
                  ) : (
                    userNotifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markNotificationAsRead(item.id)}
                        className={`p-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                          !item.read ? 'bg-brand-light/60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {item.metadata?.status === 'Present' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : item.metadata?.status === 'Absent' ? (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                            )}
                            <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed pl-6">
                          {item.desc}
                        </p>
                        {item.metadata?.status && (
                          <div className="mt-1.5 pl-6 flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                item.metadata.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {item.metadata.status}
                            </span>
                            {item.metadata.courseCode && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {item.metadata.courseCode}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Account Menu with Settings & Profile */}
        <div className="relative shrink-0">
          <button
            id="navbar-profile-trigger"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 py-1 rounded-xl bg-white/60 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#4e5c61] transition-all cursor-pointer border border-slate-300/60 dark:border-[#55666d] shadow-2xs shrink-0"
            title={`Account: ${currentUser.name}`}
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-[#55666d]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#29a19c] border border-white dark:border-[#435055]" />
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none truncate max-w-[90px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-[#a3f7bf] leading-none mt-1">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#8ea1a5] hidden sm:block shrink-0" />
          </button>

          {/* User Dropdown Menu with Palette 27323a */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#435055] rounded-2xl shadow-xl border border-slate-200/90 dark:border-[#55666d] py-1.5 z-50 origin-top-right text-slate-900 dark:text-white"
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectModule && onSelectModule('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectModule && onSelectModule('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <div className="p-1 rounded-md bg-brand-light text-brand">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">Theme & Settings</span>
                      <span className="text-[10px] text-slate-400">Change theme color & options</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
