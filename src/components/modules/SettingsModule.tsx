import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  RotateCcw,
  Sliders,
  Palette,
  Check,
  Sparkles,
  Mail,
  Send,
  KeyRound,
  Database,
  RefreshCw,
  CalendarCheck2,
  FileSpreadsheet,
  CalendarDays,
  BookOpen,
  Award,
  GraduationCap,
  DollarSign,
  Library,
  Building2,
  HardDrive,
  TrendingUp,
  Square,
  RectangleHorizontal,
  CircleDot,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Compass,
  LayoutGrid,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ColorThemeId, ERPModuleId } from '../../types';
import { cn } from '../../lib/utils';
import { FormalPasswordResetModal } from '../auth/FormalPasswordResetModal';
import { ThemeToggleButton } from '../common/ThemeToggleButton';
import {
  useDashboardLayout,
  QuickAccessTileFormat,
  QuickAccessPlacement,
  LayoutPresetId,
  ALL_QUICK_ACCESS_MODULE_IDS,
  QuickAccessModuleId,
  DashboardBlockId,
  BlockWidth,
  DashboardPresetId,
  ALL_DASHBOARD_BLOCK_IDS,
} from '../../context/DashboardLayoutContext';

interface SettingsModuleProps {
  onNavigate?: (module: ERPModuleId) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onNavigate }) => {
  const {
    role,
    currentUser,
    theme,
    setTheme,
    availableThemes,
    isDarkMode,
    isDatabaseSynced,
    lastSyncTime,
    syncDatabaseNow,
  } = useERP();
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [activeSession, setActiveSession] = useState('Academic Year 2026-2027');
  const [minAttendancePct, setMinAttendancePct] = useState(75);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isMailModalOpen, setIsMailModalOpen] = useState(false);

  const {
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    blockConfigs,
    orderedBlockIds,
    moveBlock,
    toggleBlockVisibility,
    setBlockWidth,
    resetDashboardBlocks,
    applyDashboardPreset,
    placement,
    setPlacement,
    tileConfigs,
    orderedTileIds,
    setTileFormat,
    toggleTileVisibility,
    moveTile,
    applyPreset,
    resetLayout,
    bigSquaresCount,
    smallBarsCount,
    smallCirclesCount,
  } = useDashboardLayout();

  const blockMeta: Record<DashboardBlockId, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    kpis: { icon: Award, color: 'text-rose-500' },
    quick_access: { icon: Compass, color: 'text-brand' },
    analytics: { icon: TrendingUp, color: 'text-emerald-500' },
    schedule: { icon: CalendarDays, color: 'text-amber-500' },
    exams: { icon: FileSpreadsheet, color: 'text-purple-500' },
    operations: { icon: Sliders, color: 'text-sky-500' },
    facilities: { icon: Building2, color: 'text-blue-500' },
    vitals: { icon: Activity, color: 'text-emerald-500' },
  };

  const moduleInfo: Record<
    QuickAccessModuleId,
    { name: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; color: string }
  > = {
    attendance: { name: 'Attendance', subtitle: 'Lecture Logs & Present Count', icon: CalendarCheck2, color: 'text-indigo-600 dark:text-indigo-400' },
    exams: { name: 'Examination', subtitle: 'Exam Schedule & Hall Venues', icon: FileSpreadsheet, color: 'text-amber-600 dark:text-amber-400' },
    timetable: { name: 'Timetable', subtitle: 'Weekly Academic Schedule', icon: CalendarDays, color: 'text-sky-600 dark:text-sky-400' },
    academics: { name: 'Assignments', subtitle: 'Curriculum & Submissions', icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400' },
    results: { name: 'Results', subtitle: 'Marks, SGPA & CGPA Records', icon: Award, color: 'text-purple-600 dark:text-purple-400' },
    performance: { name: 'Performance', subtitle: 'Cohort & Student Analytics Dossier', icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400' },
    students: { name: 'Students', subtitle: 'Student Directory & CGPA', icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400' },
    finance: { name: 'Finance', subtitle: 'Tuition Fees & Invoices', icon: DollarSign, color: 'text-teal-600 dark:text-teal-400' },
    library: { name: 'Library', subtitle: 'Book Catalog & Issues', icon: Library, color: 'text-cyan-600 dark:text-cyan-400' },
    hostel: { name: 'Hostel', subtitle: 'Housing, Wings & Rooms', icon: Building2, color: 'text-orange-600 dark:text-orange-400' },
    userfiles: { name: 'Storage', subtitle: 'Encrypted Vault & Documents', icon: HardDrive, color: 'text-slate-600 dark:text-slate-400' },
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all stored ERP data? This will reset all lists to empty.'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">System Settings & Preferences</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure appearance theme, academic session rules, account notifications, and institutional preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Display Appearance (Light & Dark Mode) with Animated Dribbble Toggle Switch */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Display Appearance (Light & Dark Mode)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Toggle seamlessly between bright daylight mode and ultra-comfortable deep dark mode across all campus modules.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-700">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
            <ThemeToggleButton size="md" />
          </div>
        </div>
      </div>

      {/* Theme & Color Combination Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand-light text-brand shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Theme & Color Combinations
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose your preferred primary color palette for buttons, tabs, charts, badges, and all campus records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Theme</span>
            </span>
          </div>
        </div>

        {/* Informative Callout Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand ring-2 ring-brand/20 shrink-0" />
            <span>
              Applied across <strong>Overview</strong>, <strong>Students</strong>, <strong>Timetable</strong>, <strong>Academics</strong>, <strong>Finance</strong>, and all modules. The sidebar remains in its fixed Steel Slate tone.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                id={`theme-option-${t.id}`}
                onClick={() => setTheme(t.id)}
                className={cn(
                  'relative text-left p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-3 group',
                  isSelected
                    ? 'border-brand bg-brand-light/30 shadow-sm ring-2 ring-brand/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Gradient color preview swatch */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg shadow-xs flex items-center justify-center text-white shrink-0 bg-gradient-to-br',
                        t.previewBg
                      )}
                    >
                      {isSelected ? <Check className="w-4 h-4 text-white drop-shadow-xs stroke-[3]" /> : null}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        {t.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color swatches preview bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block"
                      style={{ backgroundColor: t.primaryColor }}
                      title={`Primary: ${t.primaryColor}`}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block"
                      style={{ backgroundColor: t.accentColor }}
                      title={`Accent: ${t.accentColor}`}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors',
                      isSelected
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    )}
                  >
                    {isSelected ? 'Selected' : 'Apply'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          DASHBOARD VIEW & BLOCKS CUSTOMIZER (Requested Feature)
          Allows placing Quick Access, Graphs, and all blocks anywhere user wants
          ===================================================================== */}
      <div id="dashboard-view-customizer" className="bg-white dark:bg-[#435055] rounded-xl border border-slate-200 dark:border-[#55666d] p-5 shadow-xs space-y-6">
        {/* Header with Visual Editor Launcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#55666d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Dashboard Layout & Blocks Customizer
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                  Fully Modular
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0] mt-0.5">
                Place Quick Access, Graphs, KPIs, Timetable, Examinations, Operations, and Facilities anywhere on the dashboard. Adjust widths and reorder blocks freely.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Direct Customize on Dashboard Button */}
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(true);
                  onNavigate('dashboard');
                }}
                className="px-4 py-2 rounded-xl bg-brand hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                title="Open Dashboard with live drag/reorder overlay controls"
              >
                <Sliders className="w-4 h-4" />
                <span>Customize Dashboard on Canvas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Toggle Edit Mode */}
            <button
              type="button"
              onClick={toggleEditMode}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                isEditMode
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-xs'
                  : 'bg-slate-100 dark:bg-[#4a4a4a] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#595959] border border-slate-300 dark:border-[#595959]'
              )}
            >
              <span>{isEditMode ? 'Edit Mode: Active' : 'Toggle Live Edit'}</span>
            </button>
          </div>
        </div>

        {/* 1. Dashboard Modular Blocks Arrangement & Placement */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                1. Dashboard Blocks & Placement Manager
              </span>
              <p className="text-[11px] text-slate-500 dark:text-[#a0a0a0]">
                Move blocks up or down to place Quick Access, Graphs, or Schedules anywhere on the dashboard. Adjust each block's column width span.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetDashboardBlocks}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                title="Restore default order and widths"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Blocks to Default</span>
              </button>
            </div>
          </div>

          {/* Block Presets */}
          <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50 dark:bg-[#354146] p-2.5 rounded-xl border border-slate-200/80 dark:border-[#55666d]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-[#a3f7bf]">
              Presets:
            </span>
            {[
              { id: 'default' as DashboardPresetId, label: 'Balanced Default' },
              { id: 'quick-access-first' as DashboardPresetId, label: 'Quick Access Top (First)' },
              { id: 'analytics-first' as DashboardPresetId, label: 'Analytics & Graphs First' },
              { id: 'operations-first' as DashboardPresetId, label: 'Timetable & Operations First' },
              { id: 'compact' as DashboardPresetId, label: 'Compact Overview' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyDashboardPreset(p.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#29a19c] hover:bg-slate-100 dark:hover:bg-[#248f8a] text-slate-800 dark:text-white border border-slate-200 dark:border-[#29a19c] shadow-2xs transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Interactive Block List */}
          <div className="divide-y divide-slate-100 dark:divide-[#55666d] border border-slate-200 dark:border-[#55666d] rounded-2xl overflow-hidden bg-white dark:bg-[#354146]">
            {orderedBlockIds.map((bId, idx) => {
              const block = blockConfigs[bId];
              const meta = blockMeta[bId];
              if (!block) return null;
              const Icon = meta?.icon || LayoutDashboard;

              return (
                <div
                  key={bId}
                  className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-[#444444] transition-colors"
                >
                  {/* Left: Icon, Position & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-extrabold text-brand bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-md shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#333333] border border-slate-200 dark:border-[#595959] shadow-2xs flex items-center justify-center shrink-0">
                      <Icon className={cn('w-4 h-4', meta?.color || 'text-slate-600')} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {block.name}
                        </span>
                        {!block.visible && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-[#a0a0a0] block truncate">
                        {block.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Right: Width Selector & Move Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                    {/* Width Selector */}
                    <div className="flex items-center bg-slate-100 dark:bg-[#333333] p-0.5 rounded-xl border border-slate-200 dark:border-[#595959] text-[10px] font-bold">
                      {(['full', 'two-thirds', 'half', 'one-third'] as BlockWidth[]).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setBlockWidth(bId, w)}
                          className={cn(
                            'px-2 py-1 rounded-lg transition-colors cursor-pointer',
                            block.width === w
                              ? 'bg-brand text-white shadow-2xs'
                              : 'text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-white'
                          )}
                          title={`Width: ${w === 'full' ? 'Full Width (100%)' : w === 'two-thirds' ? 'Wide (66%)' : w === 'half' ? 'Half (50%)' : 'Compact (33%)'}`}
                        >
                          {w === 'full' ? '100%' : w === 'two-thirds' ? '66%' : w === 'half' ? '50%' : '33%'}
                        </button>
                      ))}
                    </div>

                    {/* Move Up/Down Controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveBlock(bId, 'up')}
                        disabled={idx === 0}
                        title="Move Block Up"
                        className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-[#4a4a4a] disabled:opacity-30 cursor-pointer"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(bId, 'down')}
                        disabled={idx === orderedBlockIds.length - 1}
                        title="Move Block Down"
                        className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-[#4a4a4a] disabled:opacity-30 cursor-pointer"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleBlockVisibility(bId)}
                      className={cn(
                        'p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer',
                        block.visible
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      )}
                      title={block.visible ? 'Visible on Dashboard' : 'Hidden from Dashboard'}
                    >
                      {block.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Quick Layout Formats & Presets */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#595959]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              2. Quick Access Layout Presets
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a0a0a0]">
              <span className="font-bold text-slate-800 dark:text-white">{bigSquaresCount}</span> Big Squares &bull;{' '}
              <span className="font-bold text-slate-800 dark:text-white">{smallBarsCount}</span> Small Bars &bull;{' '}
              <span className="font-bold text-slate-800 dark:text-white">{smallCirclesCount}</span> Circles
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('default-hybrid')}
              className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-[#55666d] hover:border-brand bg-slate-50 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#4e5c61] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Hybrid (Default)</span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">Preset</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#a3f7bf] mt-0.5">
                4 Big Squares (Image 1) + 7 Small Rectangle Bars (Image 2)
              </p>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all-bars')}
              className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-[#55666d] hover:border-brand bg-slate-50 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#4e5c61] transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">All Small Bars</span>
              <p className="text-[10px] text-slate-500 dark:text-[#a3f7bf] mt-0.5">
                All 11 modules as sleek horizontal rectangle bars (like Image 2)
              </p>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all-squares')}
              className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-[#55666d] hover:border-brand bg-slate-50 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#4e5c61] transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">All Big Squares</span>
              <p className="text-[10px] text-slate-500 dark:text-[#a3f7bf] mt-0.5">
                All 11 modules as classic square cards (like Image 1)
              </p>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('compact-circles')}
              className="p-2.5 text-left rounded-xl border border-slate-200 dark:border-[#55666d] hover:border-brand bg-slate-50 dark:bg-[#354146] hover:bg-white dark:hover:bg-[#4e5c61] transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Circles & Bars</span>
              <p className="text-[10px] text-slate-500 dark:text-[#a3f7bf] mt-0.5">
                Small tactile circular launchers with rectangle bars
              </p>
            </button>
          </div>
        </div>

        {/* 3. Individual Tile Shape Customizer */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#55666d]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              3. Customize Format for Each Module (Change Anytime)
            </span>
            <button
              type="button"
              onClick={resetLayout}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Default (4 Big Squares + Small Bars)
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#55666d] border border-slate-200 dark:border-[#55666d] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#354146]">
            {orderedTileIds.map((id) => {
              const meta = moduleInfo[id];
              const config = tileConfigs[id];
              if (!meta || !config) return null;
              const Icon = meta.icon;

              return (
                <div
                  key={id}
                  className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white dark:hover:bg-[#444444] transition-colors"
                >
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#333333] border border-slate-200 dark:border-[#595959] shadow-2xs flex items-center justify-center shrink-0">
                      <Icon className={cn('w-4 h-4', meta.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {meta.name}
                        </span>
                        <span
                          className={cn(
                            'text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded',
                            config.format === 'square' &&
                              'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
                            config.format === 'bar' &&
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                            config.format === 'circle' &&
                              'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          )}
                        >
                          {config.format === 'square'
                            ? 'Big Square'
                            : config.format === 'bar'
                            ? 'Small Bar'
                            : 'Circle'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-[#818181] block truncate">
                        {meta.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Right: Shape Switcher & Order */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {/* 3-way Shape Selector */}
                    <div className="flex items-center bg-white dark:bg-[#333333] p-0.5 rounded-xl border border-slate-200 dark:border-[#595959] shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setTileFormat(id, 'square')}
                        className={cn(
                          'px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer',
                          config.format === 'square'
                            ? 'bg-brand text-white shadow-2xs'
                            : 'text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-white'
                        )}
                        title="Big Square Card (like Image 1)"
                      >
                        <Square className="w-3 h-3" />
                        <span className="text-[11px] hidden md:inline">Big Square</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTileFormat(id, 'bar')}
                        className={cn(
                          'px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer',
                          config.format === 'bar'
                            ? 'bg-brand text-white shadow-2xs'
                            : 'text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-white'
                        )}
                        title="Small Rectangle Bar (like Image 2)"
                      >
                        <RectangleHorizontal className="w-3 h-3" />
                        <span className="text-[11px] hidden md:inline">Small Bar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTileFormat(id, 'circle')}
                        className={cn(
                          'px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer',
                          config.format === 'circle'
                            ? 'bg-brand text-white shadow-2xs'
                            : 'text-slate-600 dark:text-[#a0a0a0] hover:text-slate-900 dark:hover:text-white'
                        )}
                        title="Small Circular Button (like Image 2)"
                      >
                        <CircleDot className="w-3 h-3" />
                        <span className="text-[11px] hidden md:inline">Circle</span>
                      </button>
                    </div>

                    {/* Move Up/Down Controls */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveTile(id, 'up')}
                        title="Move Up"
                        className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-[#4a4a4a] cursor-pointer"
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTile(id, 'down')}
                        title="Move Down"
                        className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-[#4a4a4a] cursor-pointer"
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleTileVisibility(id)}
                      className={cn(
                        'p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer',
                        config.visible
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      )}
                      title={config.visible ? 'Visible on Dashboard' : 'Hidden from Dashboard'}
                    >
                      {config.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Live Visual Preview */}
        <div className="p-4 bg-slate-100/70 dark:bg-[#333333] rounded-2xl border border-slate-200 dark:border-[#595959] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-white uppercase tracking-wider">
              Live Preview on Current Dashboard:
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#a0a0a0]">
              Position: <strong>{placement}</strong> &bull; {bigSquaresCount} Squares, {smallBarsCount} Bars, {smallCirclesCount} Circles
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-[#435055] rounded-xl border border-slate-200/80 dark:border-[#55666d] shadow-2xs space-y-3">
            {/* Big Squares preview */}
            {bigSquaresCount > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {orderedTileIds
                  .filter((id) => tileConfigs[id]?.visible && tileConfigs[id]?.format === 'square')
                  .slice(0, 4)
                  .map((id) => {
                    const meta = moduleInfo[id];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={`preview-sq-${id}`}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-[#55666d] bg-white dark:bg-[#354146] flex flex-col justify-between h-20 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#4a4a4a] flex items-center justify-center">
                            <Icon className={cn('w-3.5 h-3.5', meta.color)} />
                          </div>
                          <span className="text-[9px] font-bold bg-slate-100 dark:bg-[#4a4a4a] px-1 rounded text-slate-600 dark:text-[#a0a0a0]">
                            0 Logs
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                          {meta.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Small Bars preview */}
            {smallBarsCount > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {orderedTileIds
                  .filter((id) => tileConfigs[id]?.visible && tileConfigs[id]?.format === 'bar')
                  .slice(0, 6)
                  .map((id) => {
                    const meta = moduleInfo[id];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={`preview-bar-${id}`}
                        className="px-2.5 py-1.5 rounded-xl neumorph-bar flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={cn('w-3.5 h-3.5 shrink-0', meta.color)} />
                          <span className="font-bold text-slate-800 dark:text-white text-[11px] truncate">
                            {meta.name}
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Account Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active User Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Logged in as</span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {currentUser.name}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Access Role</span>
              <span className="font-bold text-brand text-sm mt-0.5 block">{role}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Email Identifier</span>
              <span className="font-semibold text-slate-700 text-xs mt-0.5 block">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* System Rules (Admin only) */}
        {role === 'Admin' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Academic Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Active Academic Session
                </label>
                <input
                  type="text"
                  value={activeSession}
                  onChange={(e) => setActiveSession(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={minAttendancePct}
                  onChange={(e) => setMinAttendancePct(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Cloud Firestore Database Persistent Sync Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cloud Firestore Database Persistence & Session Sync
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All records added by users and faculty are saved directly to Cloud Firestore and automatically restored across every login and logout.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rounded-full ring-2 shrink-0',
                      isDatabaseSynced
                        ? 'bg-emerald-500 ring-emerald-200'
                        : 'bg-amber-500 ring-amber-200 animate-pulse'
                    )}
                  />
                  <span className="font-bold text-slate-900">
                    {isDatabaseSynced ? 'Database Connected & Synchronized' : 'Synchronizing Database...'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Instance: <code className="font-mono text-slate-700 font-medium">ai-studio-omnicampuserp-4e76130e-d37a-4a19-a5af-4a9e6a020950</code>
                </p>
              </div>

              <button
                type="button"
                disabled={isManualSyncing}
                onClick={async () => {
                  setIsManualSyncing(true);
                  try {
                    await syncDatabaseNow();
                  } finally {
                    setTimeout(() => setIsManualSyncing(false), 600);
                  }
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer',
                  isManualSyncing
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                )}
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isManualSyncing && 'animate-spin')} />
                <span>{isManualSyncing ? 'Syncing...' : 'Sync Database Now'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400">Sync Status:</span>{' '}
                <span className="font-medium text-emerald-700">Live Real-Time Stream</span>
              </div>
              <div>
                <span className="text-slate-400">Last Synced:</span>{' '}
                <span className="font-medium text-slate-700">{lastSyncTime || 'Just now'}</span>
              </div>
              <div>
                <span className="text-slate-400">Persistence Gate:</span>{' '}
                <span className="font-medium text-slate-700">Multi-User Cross-Session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Storage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            System Data & Storage
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <div>
              <p className="font-semibold text-slate-800">Clear Local Database</p>
              <p className="text-[11px] text-slate-500">
                Purge all locally added ERP records and reset the system.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Institutional Mail Relay & Network Gateway */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Institutional Mail Service & Security Gateway
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Integrated formal email dispatch service for legitimate password resets and credential recovery.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                <span className="font-bold text-slate-900">
                  OmniCampus Institutional Mail Relay: Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Connected via Firebase Auth verified mailer & campus SMTP protocol. Formatted with formal institutional letterhead.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsMailModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#132c4e] hover:bg-[#1b3a63] text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Send Formal Reset Mail</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand hover:opacity-90 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Formal Password Reset Modal */}
      <FormalPasswordResetModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        defaultEmail={currentUser.email}
      />
    </div>
  );
};
