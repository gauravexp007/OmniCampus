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
} from 'lucide-react';
import { ERPModuleId, UserRole } from '../../types';
import { cn } from '../../lib/utils';
import { useERP } from '../../context/ERPContext';
import { ThemeToggleButton } from '../common/ThemeToggleButton';

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
        'relative hidden md:flex flex-col h-full bg-[#6C7D8A] border-r border-[#586976] text-white transition-all duration-300 ease-in-out select-none z-30 shrink-0 shadow-xs overflow-x-hidden',
        isCollapsed ? 'w-[70px]' : 'w-[250px]'
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        'h-16 flex items-center border-b border-[#586976]/60 transition-all duration-200 overflow-hidden shrink-0 relative z-10',
        isCollapsed ? 'justify-center px-1' : 'justify-between px-4'
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white text-[#6C7D8A] shadow-xs shrink-0 font-bold transition-transform duration-200 hover:scale-105">
            <StarlineBurstIcon className="w-5 h-5 text-[#6C7D8A]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap">
              <span className="font-extrabold text-white text-base tracking-tight truncate">
                Starline
              </span>
              <span className="text-[10px] font-semibold text-slate-200 uppercase tracking-wider">
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
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
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
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className={cn('py-2 transition-all duration-200 shrink-0 overflow-hidden relative z-10', isCollapsed ? 'px-1' : 'px-3')}>
        <button
          id="nav-item-profile-top"
          onClick={() => onSelectModule('profile')}
          className={cn(
            'group relative flex items-center w-full rounded-2xl transition-all duration-200 text-left cursor-pointer border overflow-hidden',
            currentModule === 'profile'
              ? 'bg-white dark:bg-[#435055] text-slate-950 dark:text-white border-white dark:border-[#55666d] shadow-xs font-bold'
              : 'border-white/20 bg-white/15 dark:bg-[#27323a]/60 hover:bg-white/25 dark:hover:bg-[#435055] text-white backdrop-blur-xs',
            isCollapsed ? 'justify-center p-2 w-11 h-11 mx-auto' : 'p-2.5 gap-2.5'
          )}
          title={isCollapsed ? `Profile: ${currentUser.name}` : undefined}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/80 shrink-0"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 bg-white border-[#29a19c]"
              title="Online"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left">
              <p
                className={cn(
                  'text-xs truncate font-bold',
                  currentModule === 'profile' ? 'text-slate-950 dark:text-[#a3f7bf]' : 'text-white'
                )}
              >
                {currentUser.name}
              </p>
              <p
                className={cn(
                  'text-[10px] truncate',
                  currentModule === 'profile' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-200'
                )}
              >
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
                <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-200/80 mb-1 overflow-hidden whitespace-nowrap">
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
                        'group relative flex items-center rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer select-none overflow-hidden',
                        isActive
                          ? 'text-slate-950 dark:text-[#a3f7bf] font-extrabold'
                          : 'text-white/90 hover:text-white',
                        isCollapsed
                          ? 'w-11 h-11 mx-auto justify-center p-0 shrink-0'
                          : 'w-full px-3.5 py-2.5 justify-between'
                      )}
                    >
                      {/* Dribbble Gliding Pill Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          transition={{
                            type: 'spring',
                            stiffness: 450,
                            damping: 34,
                          }}
                          className="absolute inset-0 bg-white dark:bg-[#435055] rounded-2xl shadow-md border border-white/40 dark:border-[#29a19c]/40 z-0"
                        />
                      )}

                      {isCollapsed ? (
                        /* When shrinked: show ONLY logo icon, zero text, zero overflow */
                        <div className="relative z-10 flex items-center justify-center w-full h-full">
                          <Icon
                            className={cn(
                              'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isActive ? 'text-[#6C7D8A] dark:text-[#a3f7bf]' : 'text-slate-200 group-hover:text-white'
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
                                isActive ? 'text-[#6C7D8A] dark:text-[#a3f7bf]' : 'text-slate-200 group-hover:text-white'
                              )}
                            />
                            <span className="truncate whitespace-nowrap overflow-hidden font-medium">
                              {item.label}
                            </span>
                          </div>

                          {item.badge && (
                            <span
                              className={cn(
                                'relative z-10 px-1.5 py-0.2 rounded-md text-[10px] font-bold shrink-0 shadow-2xs whitespace-nowrap',
                                isActive
                                  ? 'bg-[#6C7D8A] dark:bg-[#29a19c] text-white'
                                  : item.badgeVariant === 'accent'
                                  ? 'bg-white text-[#6C7D8A] dark:bg-[#29a19c] dark:text-white'
                                  : 'bg-white/20 text-white border border-white/20 dark:border-[#55666d]'
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
        'p-3 border-t border-white/15 bg-black/10 flex items-center gap-2 shrink-0 transition-all duration-200 overflow-hidden relative z-10',
        isCollapsed ? 'justify-center px-1' : 'justify-between'
      )}>
        {!isCollapsed && (
          <span className="text-[11px] font-semibold text-white/80 whitespace-nowrap overflow-hidden">
            Theme Mode
          </span>
        )}
        <ThemeToggleButton size="sm" />
      </div>
    </aside>
  );
};
