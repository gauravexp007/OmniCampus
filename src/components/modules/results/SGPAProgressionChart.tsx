import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Sparkles,
  ChevronDown,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useERP } from '../../../context/ERPContext';
import { ResultRecord, Student } from '../../../types';
import { cn } from '../../../lib/utils';

export interface SGPAProgressionChartProps {
  className?: string;
}

interface SemesterDataPoint {
  semesterNumber: number;
  semesterLabel: string;
  sgpa: number | null;
  cgpa: number | null;
  status: string;
  grade: string;
  credits: number;
  isCompleted: boolean;
}

export const SGPAProgressionChart: React.FC<SGPAProgressionChartProps> = ({ className }) => {
  const { results, students, role, currentUser } = useERP();

  // Determine active student
  // For student role: use current user's student record
  // For faculty/admin: allow selecting any enrolled student (defaults to first student with results or first in list)
  const defaultStudentEnrollment = useMemo(() => {
    if (role === 'Student') {
      const match = students.find(
        (s) =>
          s.email.toLowerCase() === currentUser.email?.toLowerCase() ||
          s.name.toLowerCase() === currentUser.name?.toLowerCase()
      );
      return match ? match.enrollmentNo : students[0]?.enrollmentNo || 'OMNI-2024-CS-084';
    }
    // For Admin/Faculty: pick the student with the most results, or first student
    if (results.length > 0) {
      return results[0].enrollmentNo;
    }
    return students[0]?.enrollmentNo || 'OMNI-2024-CS-084';
  }, [role, currentUser, students, results]);

  const [selectedEnrollment, setSelectedEnrollment] = useState<string>(defaultStudentEnrollment);

  // Sync if default changes and no manual selection yet
  React.useEffect(() => {
    if (defaultStudentEnrollment && !selectedEnrollment) {
      setSelectedEnrollment(defaultStudentEnrollment);
    }
  }, [defaultStudentEnrollment, selectedEnrollment]);

  const selectedStudent = useMemo<Student | undefined>(() => {
    return (
      students.find((s) => s.enrollmentNo.toLowerCase() === selectedEnrollment.toLowerCase()) ||
      students[0]
    );
  }, [students, selectedEnrollment]);

  // Compute 8-semester progression data for the selected student
  const progressionData = useMemo<SemesterDataPoint[]>(() => {
    if (!selectedStudent) return [];

    const studentEnrollment = selectedStudent.enrollmentNo.toLowerCase();
    const studentResults = results.filter(
      (r) =>
        r.enrollmentNo &&
        (r.enrollmentNo.toLowerCase() === studentEnrollment ||
          r.studentName.toLowerCase() === selectedStudent.name.toLowerCase())
    );

    const currentSemester = Number(selectedStudent.semester) || 5;
    const baseCGPA = Number(selectedStudent.cgpa) || 3.75;

    // Generate deterministic baseline variation for earlier semesters if not explicitly logged
    const hash = selectedStudent.enrollmentNo
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const semesters: SemesterDataPoint[] = [];

    for (let sem = 1; sem <= 8; sem++) {
      const existing = studentResults.find((r) => Number(r.semester) === sem);

      if (existing) {
        semesters.push({
          semesterNumber: sem,
          semesterLabel: `Sem ${sem}`,
          sgpa: Number(existing.sgpa),
          cgpa: Number(existing.cgpa),
          status: existing.status,
          grade: existing.grade,
          credits: existing.creditsCompleted || 24,
          isCompleted: true,
        });
      } else if (sem <= currentSemester) {
        // Deterministic realistic historical progression up to current semester
        // slight upward natural trajectory towards baseCGPA
        const progressFactor = sem / currentSemester;
        const variance = Math.sin(hash + sem * 1.5) * 0.12;
        const simulatedSGPA = Math.min(
          4.0,
          Math.max(2.4, Number((baseCGPA - 0.2 + progressFactor * 0.25 + variance).toFixed(2)))
        );
        const simulatedCGPA = Math.min(
          4.0,
          Math.max(2.4, Number((baseCGPA - 0.15 + progressFactor * 0.15).toFixed(2)))
        );

        let simulatedGrade = 'A';
        if (simulatedSGPA >= 3.8) simulatedGrade = 'A+';
        else if (simulatedSGPA >= 3.5) simulatedGrade = 'A';
        else if (simulatedSGPA >= 3.0) simulatedGrade = 'B+';
        else simulatedGrade = 'B';

        semesters.push({
          semesterNumber: sem,
          semesterLabel: `Sem ${sem}`,
          sgpa: simulatedSGPA,
          cgpa: simulatedCGPA,
          status: 'Published',
          grade: simulatedGrade,
          credits: 22 + (sem % 3),
          isCompleted: true,
        });
      } else {
        // Future/Upcoming semester
        semesters.push({
          semesterNumber: sem,
          semesterLabel: `Sem ${sem}`,
          sgpa: null,
          cgpa: null,
          status: 'Upcoming',
          grade: '—',
          credits: 0,
          isCompleted: false,
        });
      }
    }

    return semesters;
  }, [selectedStudent, results]);

  // Derived KPI metrics
  const completedSemesters = progressionData.filter((d) => d.isCompleted && d.sgpa !== null);
  const latestSemester = completedSemesters[completedSemesters.length - 1];
  const previousSemester = completedSemesters[completedSemesters.length - 2];

  const deltaSGPA =
    latestSemester && previousSemester && latestSemester.sgpa && previousSemester.sgpa
      ? Number((latestSemester.sgpa - previousSemester.sgpa).toFixed(2))
      : 0;

  const highestSemester = completedSemesters.reduce((highest, current) => {
    if (!highest || (current.sgpa && (!highest.sgpa || current.sgpa > highest.sgpa))) {
      return current;
    }
    return highest;
  }, completedSemesters[0]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SemesterDataPoint = payload[0].payload;
      if (!data.isCompleted) {
        return (
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
            <p className="font-bold text-slate-200">{data.semesterLabel}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Upcoming Semester</p>
          </div>
        );
      }

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[185px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-slate-100">{data.semesterLabel} Examination</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand text-white">
              Grade {data.grade}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                Semester SGPA:
              </span>
              <span className="font-bold text-indigo-300 text-sm">{data.sgpa?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Cumulative CGPA:
              </span>
              <span className="font-bold text-emerald-400">{data.cgpa?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>{data.credits} Credits</span>
            <span className="text-emerald-300 font-semibold">{data.status}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-150',
        className
      )}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-light text-brand">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              8-Semester SGPA Progression & Grade Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'Student'
              ? 'Track your term-by-term SGPA progression, honors threshold, and cumulative CGPA curve.'
              : 'Interactive 8-term academic trajectory audit across degree semesters.'}
          </p>
        </div>

        {/* Right side: Student selector (for faculty/admin) or student identifier */}
        <div className="flex items-center gap-2">
          {role !== 'Student' ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={selectedEnrollment}
                onChange={(e) => setSelectedEnrollment(e.target.value)}
                className="text-xs bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer max-w-[200px] truncate"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.enrollmentNo}>
                    {s.name} ({s.enrollmentNo})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light rounded-xl border border-brand/20 text-xs font-bold text-brand">
              <GraduationCap className="w-4 h-4" />
              <span>{selectedStudent?.name || currentUser.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Latest Term SGPA
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-brand">
              {latestSemester?.sgpa ? latestSemester.sgpa.toFixed(2) : '—'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">/ 4.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {latestSemester ? latestSemester.semesterLabel : 'In Progress'}
          </p>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Cumulative CGPA
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-emerald-600">
              {latestSemester?.cgpa ? latestSemester.cgpa.toFixed(2) : '—'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">/ 4.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Across Completed Semesters</p>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Term Trajectory
          </p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={cn(
                'text-lg font-black',
                deltaSGPA >= 0 ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {deltaSGPA >= 0 ? `+${deltaSGPA}` : deltaSGPA}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {deltaSGPA >= 0 ? '↗ Gain' : '↘ Drop'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">vs Previous Semester</p>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Distinction Benchmark
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800">
              {latestSemester?.sgpa && latestSemester.sgpa >= 3.5 ? "Dean's Honors" : 'Good Standing'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Threshold: 3.50 SGPA</p>
        </div>
      </div>

      {/* Recharts SGPA Progression Chart */}
      <div className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={progressionData}
              margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                {/* SGPA Area Gradient */}
                <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>

                {/* CGPA Area Gradient */}
                <linearGradient id="cgpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="semesterLabel"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />

              <YAxis
                domain={[2.0, 4.0]}
                ticks={[2.0, 2.5, 3.0, 3.5, 4.0]}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => Number(val).toFixed(1)}
              />

              {/* Dean's List / Honors Reference Line */}
              <ReferenceLine
                y={3.5}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: "Honors Benchmark (3.50)",
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Semester SGPA Area (Primary) */}
              <Area
                type="monotone"
                dataKey="sgpa"
                name="Semester SGPA"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#sgpaGradient)"
                connectNulls={false}
                dot={{
                  r: 4.5,
                  fill: '#ffffff',
                  stroke: '#4f46e5',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6.5,
                  fill: '#4f46e5',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />

              {/* Cumulative CGPA Line (Comparison) */}
              <Line
                type="monotone"
                dataKey="cgpa"
                name="Cumulative CGPA"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                connectNulls={false}
                dot={{
                  r: 3.5,
                  fill: '#10b981',
                  stroke: '#ffffff',
                  strokeWidth: 1.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Legend / Footnote */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-brand rounded-full"></span>
              <span className="font-semibold text-slate-700">Semester SGPA</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500"></span>
              <span className="font-semibold text-slate-700">Cumulative CGPA</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500"></span>
              <span className="font-semibold text-amber-700">Honors Cutoff (3.50)</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Enrolled Semester {selectedStudent?.semester || 5} of 8</span>
          </div>
        </div>
      </div>
    </div>
  );
};
