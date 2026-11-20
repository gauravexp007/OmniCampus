import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  FileSpreadsheet,
  Award,
  DollarSign,
  Library,
  Building2,
  Briefcase,
  FileCheck2,
  BarChart3,
  HardDrive,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { ERPModuleId, UserRole } from '../../types';
import { cn } from '../../lib/utils';
import { useERP } from '../../context/ERPContext';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import sidebarBackdropImg from '../../assets/images/sidebar_unsplash_backdrop.jpg';

interface SidebarProps {
  currentModule: ERPModuleId;
  onSelectModule: (module: ERPModuleId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  role?: UserRole;
}

export interface NavItem {
  id: ERPModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'accent' | 'warning';
  category: 'main' | 'frontdesk' | 'academic' | 'services' | 'management';
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard, category: 'main', roles: ['Admin', 'Faculty', 'Student'] },
  
  { id: 'students', label: 'Students', icon: GraduationCap, category: 'frontdesk', roles: ['Admin', 'Faculty'] },
  { id: 'admissions', label: 'Admissions Desk', icon: UserCheck, category: 'frontdesk', roles: ['Admin'] },
  { id: 'faculty', label: 'Faculty Directory', icon: Users, category: 'frontdesk', roles: ['Admin'] },
  
  { id: 'academics', label: 'Academics & Syllabus', icon: BookOpen, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'lectureplan', label: 'Lecture Plan', icon: ClipboardList, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'timetable', label: 'Class Timetable', icon: CalendarDays, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'attendance', label: 'Attendance Register', icon: CalendarCheck2, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'exams', label: 'Examinations', icon: FileSpreadsheet, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'results', label: 'Results & Grades', icon: Award, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'notices', label: 'Notices & Circulars', icon: Bell, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'performance', label: 'Performance Analytics', icon: TrendingUp, category: 'academic', roles: ['Admin', 'Faculty', 'Student'] },

  { id: 'finance', label: 'Finance & Invoicing', icon: DollarSign, category: 'services', roles: ['Admin'] },
  { id: 'library', label: 'Library Catalog', icon: Library, category: 'services', roles: ['Admin', 'Faculty'] },
  { id: 'hostel', label: 'Hostel & Rooms', icon: Building2, category: 'services', roles: ['Admin'] },
  
  { id: 'hr', label: 'HR & Staffing', icon: Briefcase, category: 'management', roles: ['Admin'] },
  { id: 'documents', label: 'Document Vault', icon: FileCheck2, category: 'management', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'userfiles', label: 'Cloud Storage', icon: HardDrive, category: 'management', roles: ['Admin', 'Faculty', 'Student'] },
  { id: 'reports', label: 'Analytics Reports', icon: BarChart3, category: 'management', roles: ['Admin'] },
  { id: 'settings', label: 'System Settings', icon: Settings, category: 'management', roles: ['Admin', 'Faculty', 'Student'] },
];

export const StarlineBurstIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0L14.2 8.3L22.5 6.1L16.4 12L22.5 17.9L14.2 15.7L12 24L9.8 15.7L1.5 17.9L7.6 12L1.5 6.1L9.8 8.3Z" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  role = 'Admin' as UserRole,
}) => {
  const { currentUser } = useERP();
  const categories = [
    { key: 'main', label: 'Main Menu' },
    { key: 'frontdesk', label: 'Front Desk & Members' },
    { key: 'academic', label: 'Academic & Schedules' },
    { key: 'services', label: 'Facility & Services' },
    { key: 'management', label: 'Administration' },
  ];

  const currentRole: UserRole = role || 'Admin';
  const filteredItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside
      id="sidebar-navigation"
      className={cn(
        'relative hidden md:flex flex-col h-full bg-gray-200 dark:bg-slate-900 border-r border-gray-300 dark:border-white/15 text-black dark:text-white transition-all duration-300 ease-in-out select-none z-30 shrink-0 shadow-xs overflow-hidden',
        isCollapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      {/* Background Layer: Super-light theme grey in Light Mode, Full-bleed Pattern in Dark Mode */}
      <div aria-hidden="true" className="sidebar-backdrop-layer">
        <img
          src={sidebarBackdropImg}
          alt=""
          referrerPolicy="no-referrer"
          className="sidebar-backdrop-img"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="sidebar-backdrop-scrim" />
      </div>

      {/* Brand Header */}
      <div className={cn(
        'h-16 flex items-center border-b border-gray-300/90 dark:border-white/15 transition-all duration-200 overflow-hidden shrink-0 relative z-10',
        isCollapsed ? 'justify-center px-1' : 'justify-between px-4'
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-300/90 dark:bg-white/15 border border-gray-400/60 dark:border-white/20 text-black dark:text-white shadow-xs shrink-0 font-bold transition-transform duration-200 hover:scale-105">
            <StarlineBurstIcon className="w-5 h-5 text-black dark:text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap">
              <span className="font-extrabold text-black dark:text-white text-base tracking-tight truncate">
                Starline
              </span>
              <span className="text-[10px] font-semibold text-black/75 dark:text-slate-200 uppercase tracking-wider">
                {role} Campus
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        {!isCollapsed && (
          <button
            id="sidebar-toggle-button"
            onClick={onToggleCollapse}
            className="no-theme-btn p-1.5 rounded-lg text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer shrink-0"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* When collapsed: small centered toggle button right under brand */}
      {isCollapsed && (
        <div className="flex justify-center pt-2 pb-1 shrink-0 overflow-hidden relative z-10">
          <button
            id="sidebar-toggle-button-collapsed"
            onClick={onToggleCollapse}
            className="no-theme-btn p-1 rounded-lg text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className={cn('py-2.5 transition-all duration-200 shrink-0 overflow-hidden relative z-10', isCollapsed ? 'px-1' : 'px-3')}>
        <button
          id="nav-item-profile-top"
          onClick={() => onSelectModule('profile')}
          className={cn(
            'no-theme-btn group relative flex items-center w-full rounded-2xl transition-all duration-200 text-left cursor-pointer border overflow-hidden',
            currentModule === 'profile'
              ? 'bg-gray-300/95 dark:bg-white/20 text-black dark:text-white border-gray-400/80 dark:border-white/35 shadow-sm font-bold backdrop-blur-md'
              : 'border-gray-300/90 dark:border-white/20 bg-white/55 dark:bg-white/[0.08] hover:bg-gray-300/60 dark:hover:bg-white/[0.15] hover:border-gray-400/80 dark:hover:border-white/35 text-black dark:text-white backdrop-blur-md shadow-xs',
            isCollapsed ? 'justify-center p-1.5 w-11 h-11 mx-auto' : 'p-2.5 gap-3'
          )}
          title={isCollapsed ? `Profile: ${currentUser.name}` : undefined}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className={cn(
                'w-9 h-9 rounded-xl object-cover shrink-0 transition-transform duration-200 group-hover:scale-105',
                currentModule === 'profile'
                  ? 'ring-2 ring-black/40 dark:ring-white/75'
                  : 'ring-2 ring-gray-400/70 dark:ring-white/50'
              )}
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-emerald-400 border-white dark:border-slate-900"
              title="Online"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left">
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-xs truncate font-extrabold tracking-tight text-black dark:text-white">
                  {currentUser.name}
                </p>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 bg-gray-300/80 dark:bg-white/15 text-black dark:text-white/95">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] truncate mt-0.5 text-black/75 dark:text-slate-200/85">
                {currentUser.email}
              </p>
            </div>
          )}
        </button>
      </div>

      {/* Navigation List Organized in Clean Structure */}
      <div className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-3 scrollbar-thin transition-all duration-200 relative z-10',
        isCollapsed ? 'px-1' : 'px-3'
      )}>
        {categories.map((cat) => {
          const items = filteredItems.filter((i) => i.category === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="space-y-1 overflow-hidden">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-black/70 dark:text-slate-200/80 mb-1 overflow-hidden whitespace-nowrap">
                  {cat.label}
                </p>
              )}

              <div className="space-y-1 overflow-hidden">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => onSelectModule(item.id)}
                      whileTap={{ scale: 0.96 }}
                      className={cn(
                        'no-theme-btn group relative flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none overflow-hidden',
                        isActive
                          ? 'text-black dark:text-white font-extrabold'
                          : 'text-black dark:text-white/90 hover:bg-black/[0.06] dark:hover:bg-white/10 hover:text-black dark:hover:text-white',
                        isCollapsed
                          ? 'w-11 h-11 mx-auto justify-center p-0 shrink-0'
                          : 'w-full px-3.5 py-2.5 justify-between'
                      )}
                    >
                      {/* Gliding Pill Indicator (Neutral Grey in Light Mode, Frosted Glass in Dark Mode) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 34,
                          }}
                          className="absolute inset-0 bg-gray-300/95 dark:bg-white/20 rounded-2xl shadow-xs dark:shadow-md border border-gray-400/75 dark:border-white/30 dark:backdrop-blur-md z-0"
                        />
                      )}

                      {isCollapsed ? (
                        /* When shrinked: show ONLY logo icon, zero text, zero overflow */
                        <div className="relative z-10 flex items-center justify-center w-full h-full">
                          <Icon
                            className={cn(
                              'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isActive
                                ? 'text-black dark:text-white'
                                : 'text-black/80 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white'
                            )}
                          />
                        </div>
                      ) : (
                        /* When extended: show logo and label name */
                        <>
                          <div className="relative z-10 flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={cn(
                                'w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                isActive
                                  ? 'text-black dark:text-white'
                                  : 'text-black/80 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white'
                              )}
                            />
                            <span className="truncate whitespace-nowrap overflow-hidden font-semibold text-black dark:text-white">
                              {item.label}
                            </span>
                          </div>

                          {item.badge && (
                            <span
                              className={cn(
                                'relative z-10 px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 shadow-2xs whitespace-nowrap',
                                isActive
                                  ? 'bg-black/15 dark:bg-white/25 text-black dark:text-white'
                                  : 'bg-gray-300/80 dark:bg-white/20 text-black dark:text-white border border-gray-400/60 dark:border-white/20'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Clean Floating Tooltip when collapsed */}
                      {isCollapsed && (
                        <div className="fixed left-[76px] px-2.5 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap border border-white/10">
                          {item.label}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer with Animated Dark Mode Toggle */}
      <div className={cn(
        'p-3 border-t border-gray-300/90 dark:border-white/15 bg-gray-200/45 dark:bg-black/25 flex items-center gap-2 shrink-0 transition-all duration-200 overflow-hidden relative z-10 backdrop-blur-xs',
        isCollapsed ? 'justify-center px-1' : 'justify-between'
      )}>
        {!isCollapsed && (
          <span className="text-[11px] font-bold text-black dark:text-white/90 whitespace-nowrap overflow-hidden">
            Theme Mode
          </span>
        )}
        <ThemeToggleButton size="sm" />
      </div>
    </aside>
  );
};
