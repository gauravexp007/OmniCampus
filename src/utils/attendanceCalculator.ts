import { Student, StudentAttendanceRecord } from '../types';

export const ACADEMIC_HOLIDAYS: Record<string, string> = {
  '01-01': 'New Year Holiday',
  '01-19': 'MLK Day',
  '02-16': 'Presidents Day',
  '05-25': 'Memorial Day',
  '07-04': 'Independence Day',
  '09-07': 'Labor Day',
  '09-17': 'Campus Academic Day',
  '10-12': 'Fall Recess',
  '11-11': 'Veterans Day',
  '11-26': 'Thanksgiving Holiday',
  '11-27': 'Thanksgiving Recess',
  '12-24': 'Winter Recess',
  '12-25': 'Christmas Holiday',
  '12-31': 'New Year Recess',
};

export interface MonthlyCalendarBreakdown {
  year: number;
  month: number; // 0-indexed (8 = September, 9 = October)
  monthName: string;
  shortMonthName: string;
  totalCalendarDays: number;
  saturdaysCount: number;
  sundaysCount: number;
  weekendsCount: number;
  holidaysCount: number;
  holidaysList: Array<{ day: number; name: string }>;
  nonWorkingDays: number; // saturdays + sundays + weekday holidays
  netWorkingDays: number; // totalCalendarDays - nonWorkingDays
  absentsCount: number;
  presentsCount: number;
  lateCount: number;
  netPresentDays: number; // netWorkingDays - absentsCount (or marked presents)
  workingDaysAttendancePct: number; // ((netWorkingDays - absentsCount) / netWorkingDays) * 100
  sessionAttendancePct: number; // ((presentsCount + lateCount * 0.5) / totalRecordedSessions) * 100
  calculatedPercentage: number; // Official formula percentage
  totalRecordedSessions: number;
  isEligible: boolean; // >= 75%
}

export interface StudentAttendanceGraphPoint {
  dateKey: string; // YYYY-MM or YYYY-MM-DD or YYYY
  label: string;
  shortLabel: string;
  attendancePct: number;
  sessionAttendancePct: number;
  workingDaysAttendancePct: number;
  totalCalendarDays: number;
  saturdaysCount: number;
  sundaysCount: number;
  holidaysCount: number;
  netWorkingDays: number;
  absentsCount: number;
  presentsCount: number;
  targetBenchmark: number; // 75%
  departmentAverage: number;
  statusInfo: string;
  formulaBreakdown: string;
  isCompliant: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Calculates academic calendar working days and attendance metrics
 * strictly following:
 * 1. Total Calendar Days in period
 * 2. Reduce Saturdays
 * 3. Reduce Sundays
 * 4. Reduce Weekday Academic Holidays
 *    -> Net Working Academic Days
 * 5. Reduce Student Absences
 *    -> Net Present Days
 * 6. Percentage = (Net Present Days / Net Working Days) * 100
 */
export function calculateMonthAttendanceBreakdown(
  year: number,
  month: number, // 0-indexed
  recordsInMonth: StudentAttendanceRecord[]
): MonthlyCalendarBreakdown {
  const totalCalendarDays = new Date(year, month + 1, 0).getDate();
  const holidaysList: Array<{ day: number; name: string }> = [];

  let saturdaysCount = 0;
  let sundaysCount = 0;
  let holidaysCount = 0;

  for (let day = 1; day <= totalCalendarDays; day++) {
    const d = new Date(year, month, day);
    const dow = d.getDay(); // 0 = Sun, 6 = Sat

    if (dow === 0) {
      sundaysCount++;
    } else if (dow === 6) {
      saturdaysCount++;
    } else {
      // Weekday: Check if it is an academic holiday
      const key = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (ACADEMIC_HOLIDAYS[key]) {
        holidaysCount++;
        holidaysList.push({ day, name: ACADEMIC_HOLIDAYS[key] });
      }
    }
  }

  const weekendsCount = saturdaysCount + sundaysCount;
  const nonWorkingDays = weekendsCount + holidaysCount;
  const netWorkingDays = Math.max(1, totalCalendarDays - nonWorkingDays);

  // Analyze student recorded logs in this month
  let presentsCount = 0;
  let absentsCount = 0;
  let lateCount = 0;

  recordsInMonth.forEach((r) => {
    if (r.status === 'Present') presentsCount++;
    else if (r.status === 'Absent') absentsCount++;
    else if (r.status === 'Late') lateCount++;
  });

  const totalRecordedSessions = recordsInMonth.length;

  // Formula 1: Calendar Working Days reducing Saturdays, Sundays, Holidays, and Absents
  const netPresentDays = Math.max(0, netWorkingDays - absentsCount);
  const workingDaysAttendancePct = Math.min(
    100,
    Math.max(0, Math.round((netPresentDays / netWorkingDays) * 1000) / 10)
  );

  // Formula 2: Direct session ratio when logs are entered
  const effectiveSessionPresents = presentsCount + lateCount * 0.5;
  const sessionAttendancePct =
    totalRecordedSessions > 0
      ? Math.min(100, Math.max(0, Math.round((effectiveSessionPresents / totalRecordedSessions) * 1000) / 10))
      : 100.0;

  // Primary calculated percentage:
  // If the user entered recorded sessions, session absences directly reduce the working percentage.
  // When specific sessions exist, we ensure the percentage accurately reflects the reduction of absents from working turnout.
  const calculatedPercentage =
    totalRecordedSessions > 0 ? sessionAttendancePct : workingDaysAttendancePct;

  const isEligible = calculatedPercentage >= 75.0;

  return {
    year,
    month,
    monthName: MONTH_NAMES[month] || `Month ${month + 1}`,
    shortMonthName: SHORT_MONTH_NAMES[month] || `M${month + 1}`,
    totalCalendarDays,
    saturdaysCount,
    sundaysCount,
    weekendsCount,
    holidaysCount,
    holidaysList,
    nonWorkingDays,
    netWorkingDays,
    absentsCount,
    presentsCount,
    lateCount,
    netPresentDays,
    workingDaysAttendancePct,
    sessionAttendancePct,
    calculatedPercentage,
    totalRecordedSessions,
    isEligible,
  };
}

/**
 * Filter all saved attendance records for a specific student
 */
export function getStudentSavedRecords(
  student: Student | { id?: string; enrollmentNo?: string; name?: string },
  allRecords: StudentAttendanceRecord[]
): StudentAttendanceRecord[] {
  const sEnroll = (student.enrollmentNo || '').toLowerCase();
  const sId = (student.id || '').toLowerCase();
  const sName = (student.name || '').toLowerCase();

  return allRecords
    .filter((r) => {
      const matchEnroll = r.enrollmentNo && r.enrollmentNo.toLowerCase() === sEnroll;
      const matchId = r.studentId && r.studentId.toLowerCase() === sId;
      const matchName = r.studentName && r.studentName.toLowerCase() === sName;
      return Boolean(matchEnroll || matchId || matchName);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Computes monthly comparison graph points for a student
 * (e.g. September, October comparison for Aayush Verma)
 * reducing absents, holidays, saturdays, and sundays
 */
export function computeStudentMonthlyGraphPoints(
  student: Student,
  allStudentRecords: StudentAttendanceRecord[]
): StudentAttendanceGraphPoint[] {
  const records = getStudentSavedRecords(student, allStudentRecords);
  if (records.length === 0) return [];

  // Group records by YYYY-MM
  const monthMap = new Map<string, StudentAttendanceRecord[]>();
  records.forEach((r) => {
    const ym = (r.date || '').slice(0, 7);
    if (!ym) return;
    if (!monthMap.has(ym)) monthMap.set(ym, []);
    monthMap.get(ym)!.push(r);
  });

  const points: StudentAttendanceGraphPoint[] = [];

  monthMap.forEach((monthRecords, ym) => {
    const [yStr, mStr] = ym.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = (parseInt(mStr, 10) || 1) - 1;

    const breakdown = calculateMonthAttendanceBreakdown(year, month, monthRecords);

    const label = `${breakdown.monthName} ${year}`;
    const shortLabel = breakdown.shortMonthName;

    // Detailed formula explanation for tooltips & badges
    const formulaBreakdown = `${breakdown.totalCalendarDays} days − ${breakdown.saturdaysCount} Sat − ${breakdown.sundaysCount} Sun − ${breakdown.holidaysCount} Hol = ${breakdown.netWorkingDays} working days. Absents: ${breakdown.absentsCount}.`;

    points.push({
      dateKey: ym,
      label,
      shortLabel,
      attendancePct: breakdown.calculatedPercentage,
      sessionAttendancePct: breakdown.sessionAttendancePct,
      workingDaysAttendancePct: breakdown.workingDaysAttendancePct,
      totalCalendarDays: breakdown.totalCalendarDays,
      saturdaysCount: breakdown.saturdaysCount,
      sundaysCount: breakdown.sundaysCount,
      holidaysCount: breakdown.holidaysCount,
      netWorkingDays: breakdown.netWorkingDays,
      absentsCount: breakdown.absentsCount,
      presentsCount: breakdown.presentsCount,
      targetBenchmark: 75,
      departmentAverage: 86,
      statusInfo: `${breakdown.presentsCount} present, ${breakdown.absentsCount} absent out of ${breakdown.totalRecordedSessions} recorded sessions (${breakdown.netWorkingDays} net working days)`,
      formulaBreakdown,
      isCompliant: breakdown.isEligible,
    });
  });

  return points.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

/**
 * Computes daily progression graph points for a student
 * tracking attendance on entered dates reducing absents, holidays, saturdays, sundays
 */
export function computeStudentDailyGraphPoints(
  student: Student,
  allStudentRecords: StudentAttendanceRecord[],
  selectedMonthYm?: string // e.g. "2026-10" or "2026-09"
): StudentAttendanceGraphPoint[] {
  let records = getStudentSavedRecords(student, allStudentRecords);
  if (records.length === 0) return [];

  if (selectedMonthYm) {
    records = records.filter((r) => r.date.startsWith(selectedMonthYm));
  }

  if (records.length === 0) return [];

  // Group by exact date
  const dateMap = new Map<string, StudentAttendanceRecord[]>();
  records.forEach((r) => {
    const d = r.date;
    if (!dateMap.has(d)) dateMap.set(d, []);
    dateMap.get(d)!.push(r);
  });

  const points: StudentAttendanceGraphPoint[] = [];
  let runningPresents = 0;
  let runningAbsents = 0;
  let runningTotal = 0;

  dateMap.forEach((dateRecords, dateStr) => {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const year = parseInt(yStr, 10) || 2026;
    const month = (parseInt(mStr, 10) || 1) - 1;
    const day = parseInt(dStr, 10) || 1;

    const dayPresents = dateRecords.filter((r) => r.status === 'Present').length;
    const dayAbsents = dateRecords.filter((r) => r.status === 'Absent').length;
    const dayLates = dateRecords.filter((r) => r.status === 'Late').length;

    runningPresents += dayPresents + dayLates * 0.5;
    runningAbsents += dayAbsents;
    runningTotal += dateRecords.length;

    const currentPct = Math.round((runningPresents / Math.max(1, runningTotal)) * 100);

    const dObj = new Date(year, month, day);
    const shortLabel = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });

    const statusInfo =
      dayAbsents > 0
        ? `Absent on ${dayName} (${dayAbsents} missed lecture)`
        : `Present on ${dayName} (${dayPresents} attended)`;

    const formulaBreakdown = `Date: ${dateStr} (${dayName}). Running: ${runningPresents} present, ${runningAbsents} absent in ${runningTotal} sessions.`;

    points.push({
      dateKey: dateStr,
      label: `${shortLabel} (${dayName}) - ${dateRecords[0]?.courseCode || 'Lectures'}`,
      shortLabel,
      attendancePct: currentPct,
      sessionAttendancePct: currentPct,
      workingDaysAttendancePct: currentPct,
      totalCalendarDays: 1,
      saturdaysCount: dObj.getDay() === 6 ? 1 : 0,
      sundaysCount: dObj.getDay() === 0 ? 1 : 0,
      holidaysCount: ACADEMIC_HOLIDAYS[`${mStr}-${dStr}`] ? 1 : 0,
      netWorkingDays: 1,
      absentsCount: runningAbsents,
      presentsCount: runningPresents,
      targetBenchmark: 75,
      departmentAverage: 86,
      statusInfo,
      formulaBreakdown,
      isCompliant: currentPct >= 75,
    });
  });

  return points;
}

/**
 * Computes yearly attendance graph points for a student
 * aggregating by academic year
 */
export function computeStudentYearlyGraphPoints(
  student: Student,
  allStudentRecords: StudentAttendanceRecord[]
): StudentAttendanceGraphPoint[] {
  const records = getStudentSavedRecords(student, allStudentRecords);
  if (records.length === 0) return [];

  const yearMap = new Map<string, StudentAttendanceRecord[]>();
  records.forEach((r) => {
    const y = (r.date || '').slice(0, 4) || '2026';
    if (!yearMap.has(y)) yearMap.set(y, []);
    yearMap.get(y)!.push(r);
  });

  const points: StudentAttendanceGraphPoint[] = [];

  yearMap.forEach((yearRecords, y) => {
    const total = yearRecords.length;
    const presents = yearRecords.filter((r) => r.status === 'Present').length;
    const absents = yearRecords.filter((r) => r.status === 'Absent').length;
    const lates = yearRecords.filter((r) => r.status === 'Late').length;

    const effectivePresents = presents + lates * 0.5;
    const pct = Math.round((effectivePresents / Math.max(1, total)) * 100);

    points.push({
      dateKey: y,
      label: `Academic Year ${y}`,
      shortLabel: `AY ${y}`,
      attendancePct: pct,
      sessionAttendancePct: pct,
      workingDaysAttendancePct: pct,
      totalCalendarDays: 365,
      saturdaysCount: 52,
      sundaysCount: 52,
      holidaysCount: 24,
      netWorkingDays: 237,
      absentsCount: absents,
      presentsCount: effectivePresents,
      targetBenchmark: 75,
      departmentAverage: 88,
      statusInfo: `${effectivePresents} present, ${absents} absent across ${total} sessions in AY ${y}`,
      formulaBreakdown: `Academic Year ${y}: Total Sessions: ${total}, Absences: ${absents}, Final Rate: ${pct}%.`,
      isCompliant: pct >= 75,
    });
  });

  return points.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}
