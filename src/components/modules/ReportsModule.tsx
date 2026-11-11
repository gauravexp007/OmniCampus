import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Layers,
  Award,
  BookOpen,
  Users,
  DollarSign,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StudentPerformanceAnalyticsDashboard } from './performance/StudentPerformanceAnalyticsDashboard';
import { FluidTabs, SpotlightCard, AnimatedCounter } from '../common/DribbbleAnimations';

export const ReportsModule: React.FC = () => {
  const { students, faculty, courses, transactions, admissions, exams, role } = useERP();
  const [activeTab, setActiveTab] = useState<'performance' | 'institutional'>('performance');
  const [downloading, setDownloading] = useState(false);

  const totalRevenue = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeStudents = students.filter((s) => s.status === 'Active').length;

  const handleExportComprehensiveReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);

      const reportData = [
        ['University ERP - Institutional Summary Report'],
        [`Generated On: ${new Date().toLocaleString()}`],
        [''],
        ['Metric', 'Current Count / Value'],
        ['Total Registered Students', students.length],
        ['Active Students', activeStudents],
        ['Faculty Members', faculty.length],
        ['Academic Courses Offered', courses.length],
        ['Admission Applications', admissions.length],
        ['Scheduled Examinations', exams.length],
        ['Total Realized Revenue ($)', totalRevenue],
      ]
        .map((row) => row.join(','))
        .join('\n');

      const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + reportData);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'Institutional_Summary_Report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 500);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Section Nav Tabs with Dribbble Fluid Sliding Pill */}
      <div className="flex items-center justify-between gap-3">
        <FluidTabs<'performance' | 'institutional'>
          tabs={[
            { id: 'performance', label: 'Student Performance Analytics', icon: TrendingUp },
            { id: 'institutional', label: 'Institutional Summary & Ledger', icon: BarChart3 },
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          layoutId="reportsModuleActiveTab"
          size="md"
        />
      </div>

      {activeTab === 'performance' ? (
        <StudentPerformanceAnalyticsDashboard />
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Institutional Analytics & Reports</h2>
              </div>
            </div>

            <button
              onClick={handleExportComprehensiveReport}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Compiling...' : 'Export Report'}</span>
            </button>
          </div>

      {/* Summary KPI Cards Grid with Dribbble Spotlight & Numeric Rollup */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.18)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={students.length} />
          </p>
          <span className="text-[10px] text-slate-400">{activeStudents} active</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.18)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Faculty Members</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={faculty.length} />
          </p>
          <span className="text-[10px] text-slate-400">Teaching staff</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Curriculum Courses</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={courses.length} />
          </p>
          <span className="text-[10px] text-slate-400">Active subjects</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Admissions</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={admissions.length} />
          </p>
          <span className="text-[10px] text-slate-400">Applicants</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(139, 92, 246, 0.18)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Scheduled Exams</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            <AnimatedCounter value={exams.length} />
          </p>
          <span className="text-[10px] text-slate-400">Sessions</span>
        </SpotlightCard>

        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.22)"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Realized Revenue</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            <AnimatedCounter value={totalRevenue} prefix="$" />
          </p>
          <span className="text-[10px] text-slate-400">Ledger balance</span>
        </SpotlightCard>
      </div>

      {/* Institutional Metric Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Institutional Summary Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Student-to-Faculty Ratio</p>
              <p className="text-[11px] text-slate-500">Based on active enrollment & faculty</p>
            </div>
            <span className="font-bold text-indigo-600 text-sm">
              {faculty.length > 0
                ? `${(students.length / faculty.length).toFixed(1)} : 1`
                : 'N/A'}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Average Fee Realization</p>
              <p className="text-[11px] text-slate-500">Total collected / student</p>
            </div>
            <span className="font-bold text-slate-900 text-sm">
              {students.length > 0
                ? `$${Math.round(totalRevenue / students.length).toLocaleString()}`
                : '$0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
};
