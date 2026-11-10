import {
  Student,
  StudentAttendanceRecord,
  ResultRecord,
  AcademicCourse,
  StudentAssignment,
  StudentSubjectPerformance,
  PerformanceAlertItem,
  SemesterProgressDataPoint,
} from '../types';
import { calculateMonthAttendanceBreakdown } from './attendanceCalculator';

export interface ComprehensiveStudentPerformance {
  student: Student;
  // KPI Metrics
  overallAttendancePct: number;
  attendedSessions: number;
  totalWorkingSessions: number;
  isAttendanceEligible: boolean; // >= 75%
  
  averageScorePct: number;
  cgpa: number;
  latestSgpa: number;
  letterGrade: string;
  rank: number;
  totalStudentsInCohort: number;

  highestScoreSubject: {
    subjectCode: string;
    subjectTitle: string;
    score: number;
  };

  assignmentsSummary: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRatePct: number;
    averageScorePct: number;
  };

  growthDelta: {
    sgpaChange: number;
    attendanceChange: number;
    trend: 'improved' | 'declined' | 'stable';
    description: string;
  };

  // Detailed Collections
  subjectPerformances: StudentSubjectPerformance[];
  weakSubjects: StudentSubjectPerformance[];
  topSubjects: StudentSubjectPerformance[];
  assignments: StudentAssignment[];
  semesterProgression: SemesterProgressDataPoint[];
  alerts: PerformanceAlertItem[];
  monthlyProgress: Array<{
    monthKey: string;
    monthName: string;
    attendancePct: number;
    averageMarks: number;
    sessionsRecorded: number;
    assignmentsCompleted: number;
  }>;
  yearlyProgress: Array<{
    academicYear: string;
    cgpa: number;
    attendancePct: number;
    creditsEarned: number;
  }>;
}

export interface CohortAnalyticsSummary {
  department: string;
  semester: number;
  totalStudents: number;
  averageAttendancePct: number;
  averageCgpa: number;
  averageMarksPct: number;
  atRiskCount: number; // attendance < 75% or CGPA < 2.5
  honorsCount: number; // CGPA >= 3.75
  subjectAverages: Array<{
    courseCode: string;
    courseTitle: string;
    averageMarks: number;
    passRatePct: number;
  }>;
  attendanceDistribution: {
    high: number;    // >= 85%
    adequate: number;// 75% - 84%
    atRisk: number;  // < 75%
  };
  gradeDistribution: {
    aPlus: number;
    a: number;
    bPlus: number;
    b: number;
    c: number;
    f: number;
  };
}

// Deterministic seed helper so mock data remains stable across renders
function getStudentSeed(student: Student): number {
  return (student.enrollmentNo || student.id)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

/**
 * Computes deep comprehensive performance data for an individual student
 * connected directly to saved attendance and exam results.
 */
export function computeStudentComprehensivePerformance(
  student: Student,
  allAttendanceRecords: StudentAttendanceRecord[],
  allResults: ResultRecord[],
  allCourses: AcademicCourse[]
): ComprehensiveStudentPerformance {
  const seed = getStudentSeed(student);
  const sEnrollment = (student.enrollmentNo || '').toLowerCase();
  const sId = (student.id || '').toLowerCase();
  const sName = (student.name || '').toLowerCase();

  // 1. Filter student-specific attendance records
  const studentAtt = allAttendanceRecords.filter((r) => {
    const matchEnroll = r.enrollmentNo && r.enrollmentNo.toLowerCase() === sEnrollment;
    const matchId = r.studentId && r.studentId.toLowerCase() === sId;
    const matchName = r.studentName && r.studentName.toLowerCase() === sName;
    return Boolean(matchEnroll || matchId || matchName);
  });

  // Calculate actual attendance using statutory reduction formula
  // Combine September and October (Months 8 and 9 of 2026)
  const sepRecords = studentAtt.filter((r) => (r.date || '').startsWith('2026-09'));
  const octRecords = studentAtt.filter((r) => (r.date || '').startsWith('2026-10'));

  const sepBreakdown = calculateMonthAttendanceBreakdown(2026, 8, sepRecords);
  const octBreakdown = calculateMonthAttendanceBreakdown(2026, 9, octRecords);

  const totalWorkingDays = sepBreakdown.netWorkingDays + (octRecords.length > 0 ? octBreakdown.netWorkingDays : 0);
  const totalPresents = sepBreakdown.presentsCount + (octRecords.length > 0 ? octBreakdown.presentsCount : 0);
  const totalAbsents = sepBreakdown.absentsCount + (octRecords.length > 0 ? octBreakdown.absentsCount : 0);

  let calculatedAttendancePct = Number(student.attendancePct) || 88.0;
  if (studentAtt.length > 0 && totalWorkingDays > 0) {
    // If recorded in system, use statutory net present percentage
    const netPresentPct = Math.round(((totalWorkingDays - totalAbsents) / totalWorkingDays) * 1000) / 10;
    calculatedAttendancePct = Math.max(45, Math.min(100, netPresentPct));
  }

  // 2. Filter student result record
  const studentResult = allResults.find((r) => {
    const matchEnroll = r.enrollmentNo && r.enrollmentNo.toLowerCase() === sEnrollment;
    const matchName = r.studentName && r.studentName.toLowerCase() === sName;
    return Boolean(matchEnroll || matchName);
  });

  const baseCgpa = studentResult?.cgpa || Number(student.cgpa) || 3.82;
  const latestSgpa = studentResult?.sgpa || Math.min(4.0, Math.round((baseCgpa + ((seed % 15) - 7) * 0.02) * 100) / 100);
  const rank = studentResult?.rank || (seed % 8) + 1;

  // 3. Department curriculum subjects
  const deptCourses = allCourses.filter(
    (c) => c.department.toLowerCase() === student.department.toLowerCase()
  );
  const fallbackCourses: AcademicCourse[] = deptCourses.length > 0
    ? deptCourses
    : allCourses.slice(0, 5);

  // 4. Generate Subject-wise performance metrics
  const subjectPerformances: StudentSubjectPerformance[] = fallbackCourses.map((c, index) => {
    const subSeed = (seed + index * 17) % 100;
    // Base marks derived from student CGPA
    const baseSubjectMarks = Math.min(
      98,
      Math.max(48, Math.round(baseCgpa * 23.5 + ((subSeed % 18) - 9)))
    );

    // Subject attendance
    const subjectSessions = studentAtt.filter((r) => r.courseCode === c.code);
    const subPresents = subjectSessions.filter((r) => r.status === 'Present').length;
    const subAttPct = subjectSessions.length > 0
      ? Math.round((subPresents / subjectSessions.length) * 100)
      : Math.min(100, Math.max(65, Math.round(calculatedAttendancePct + ((subSeed % 10) - 5))));

    const internal = Math.min(30, Math.round((baseSubjectMarks / 100) * 30 + ((subSeed % 4) - 2)));
    const midTerm = Math.min(30, Math.round((baseSubjectMarks / 100) * 30 + ((subSeed % 4) - 2)));
    const endTerm = Math.min(40, baseSubjectMarks - internal - midTerm);
    const totalScore = internal + midTerm + endTerm;

    const classAverage = Math.round(76 + ((index * 3) % 9));
    const highestScore = Math.min(100, Math.max(totalScore, 92 + (index % 6)));

    let grade: StudentSubjectPerformance['grade'] = 'B+';
    let gpaEquiv = 3.3;
    if (totalScore >= 90) { grade = 'A+'; gpaEquiv = 4.0; }
    else if (totalScore >= 80) { grade = 'A'; gpaEquiv = 3.7; }
    else if (totalScore >= 70) { grade = 'B+'; gpaEquiv = 3.3; }
    else if (totalScore >= 60) { grade = 'B'; gpaEquiv = 3.0; }
    else if (totalScore >= 50) { grade = 'C'; gpaEquiv = 2.0; }
    else { grade = 'F'; gpaEquiv = 0.0; }

    const isWeak = totalScore < 65 || subAttPct < 75;
    let improvementSuggestion: string | undefined = undefined;
    if (totalScore < 65) {
      improvementSuggestion = `Revise ${c.code} core theory assignments and attend professor office hours to improve end-term standing.`;
    } else if (subAttPct < 75) {
      improvementSuggestion = `Lecture attendance is currently ${subAttPct}%. Attend the next 3 scheduled classes to regain examination eligibility.`;
    }

    return {
      courseCode: c.code,
      courseTitle: c.title,
      credits: c.credits || 4,
      instructor: c.instructor || 'Senior Faculty',
      internalMarks: internal,
      midTermMarks: midTerm,
      endTermMarks: endTerm,
      totalScore,
      classAverage,
      highestScore,
      grade,
      gpaEquivalent: gpaEquiv,
      attendancePct: subAttPct,
      isWeakSubject: isWeak,
      improvementSuggestion,
    };
  });

  const weakSubjects = subjectPerformances.filter((s) => s.isWeakSubject);
  const topSubjects = [...subjectPerformances].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);

  // Highest subject score
  const highestSubject = topSubjects[0] || {
    courseCode: 'CS-601',
    courseTitle: 'Deep Learning',
    totalScore: 94,
  };

  // 5. Generate Assignments data
  const assignments: StudentAssignment[] = [
    {
      id: `asg-${student.id}-1`,
      courseCode: subjectPerformances[0]?.courseCode || 'CS-601',
      courseTitle: subjectPerformances[0]?.courseTitle || 'Deep Learning & Foundation Architectures',
      title: 'Transformer Attention & Transformer Backpropagation Lab',
      dueDate: '2026-10-15',
      submittedDate: '2026-10-14',
      status: 'Graded',
      score: 95,
      maxScore: 100,
      feedback: 'Flawless matrix dimension proofs and clean PyTorch visualization.',
      weightagePct: 15,
    },
    {
      id: `asg-${student.id}-2`,
      courseCode: subjectPerformances[1]?.courseCode || 'CS-301',
      courseTitle: subjectPerformances[1]?.courseTitle || 'Distributed Database Systems',
      title: 'Raft Consensus Protocol & Distributed Vector Sharding',
      dueDate: '2026-10-18',
      submittedDate: '2026-10-17',
      status: 'Graded',
      score: 88,
      maxScore: 100,
      feedback: 'Good partition tolerance analysis. Benchmark write latencies.',
      weightagePct: 15,
    },
    {
      id: `asg-${student.id}-3`,
      courseCode: subjectPerformances[2]?.courseCode || 'EC-401',
      courseTitle: subjectPerformances[2]?.courseTitle || 'Embedded System Architecture',
      title: 'FreeRTOS Task Scheduler & Semaphore Priority Inversion',
      dueDate: '2026-10-22',
      submittedDate: '2026-10-21',
      status: 'Submitted',
      maxScore: 100,
      feedback: 'Under evaluation by Teaching Assistant.',
      weightagePct: 10,
    },
    {
      id: `asg-${student.id}-4`,
      courseCode: subjectPerformances[0]?.courseCode || 'CS-601',
      courseTitle: subjectPerformances[0]?.courseTitle || 'Deep Learning & Foundation Architectures',
      title: 'Diffusion Model Sampling & Cross-Attention Conditioning',
      dueDate: '2026-10-28',
      status: 'Pending',
      maxScore: 100,
      weightagePct: 20,
    },
    {
      id: `asg-${student.id}-5`,
      courseCode: subjectPerformances[1]?.courseCode || 'CS-301',
      courseTitle: subjectPerformances[1]?.courseTitle || 'Distributed Database Systems',
      title: 'ACID Transactions & Two-Phase Commit Simulation',
      dueDate: '2026-11-04',
      status: 'Pending',
      maxScore: 100,
      weightagePct: 15,
    },
  ];

  const completedAssignments = assignments.filter((a) => a.status === 'Graded' || a.status === 'Submitted').length;
  const pendingAssignments = assignments.filter((a) => a.status === 'Pending').length;
  const overdueAssignments = assignments.filter((a) => a.status === 'Overdue').length;
  const gradedAssignments = assignments.filter((a) => a.score !== undefined);
  const avgAssignmentScore = gradedAssignments.length > 0
    ? Math.round(gradedAssignments.reduce((acc, curr) => acc + (curr.score || 0), 0) / gradedAssignments.length)
    : 90;

  // 6. Semester Progression (Sem 1 to Sem 8)
  const currentSemesterNum = Number(student.semester) || 6;
  const semesterProgression: SemesterProgressDataPoint[] = [];

  for (let s = 1; s <= 8; s++) {
    const isCompleted = s < currentSemesterNum;
    const isCurrent = s === currentSemesterNum;

    if (isCompleted || isCurrent) {
      // Deterministic realistic SGPA curve
      const delta = Math.sin((s + seed) * 1.2) * 0.18;
      const semSgpa = Math.min(4.0, Math.max(3.2, Math.round((baseCgpa + delta) * 100) / 100));
      const runningCgpa = Math.min(4.0, Math.max(3.3, Math.round((baseCgpa + delta * 0.5) * 100) / 100));
      const semAtt = Math.min(100, Math.max(76, Math.round(calculatedAttendancePct + Math.cos(s * 0.9) * 4)));

      semesterProgression.push({
        semesterNumber: s,
        semesterLabel: `Sem ${s}`,
        sgpa: isCurrent ? latestSgpa : semSgpa,
        cgpa: runningCgpa,
        creditsEarned: s * 22,
        attendancePct: semAtt,
        totalMarksPct: Math.round(runningCgpa * 23.8),
        rank: Math.max(1, (seed % 6) + (s % 3)),
        status: isCurrent ? 'Current' : 'Completed',
      });
    } else {
      semesterProgression.push({
        semesterNumber: s,
        semesterLabel: `Sem ${s}`,
        sgpa: 0,
        cgpa: 0,
        creditsEarned: s * 22,
        attendancePct: 0,
        totalMarksPct: 0,
        rank: 0,
        status: 'Upcoming',
      });
    }
  }

  // 7. Performance growth delta
  const previousSem = semesterProgression[currentSemesterNum - 2];
  const currentSem = semesterProgression[currentSemesterNum - 1];
  const sgpaDelta = currentSem && previousSem ? Math.round((currentSem.sgpa - previousSem.sgpa) * 100) / 100 : 0.08;
  const attDelta = currentSem && previousSem ? Math.round((currentSem.attendancePct - previousSem.attendancePct) * 10) / 10 : 1.2;

  // 8. Alerts generation
  const alerts: PerformanceAlertItem[] = [];

  if (calculatedAttendancePct < 75) {
    alerts.push({
      id: `alert-att-${student.id}`,
      type: 'low_attendance',
      severity: 'critical',
      title: 'Statutory Attendance Warning (<75%)',
      message: `${student.name}'s attendance is currently ${calculatedAttendancePct}%, which falls below the mandatory 75% university eligibility requirement.`,
      metricLabel: 'Current Turnout',
      metricValue: `${calculatedAttendancePct}%`,
      recommendation: 'Must attend at least 6 consecutive lectures to restore examination hall ticket clearance.',
      date: '2026-10-12',
    });
  }

  if (sgpaDelta < -0.25) {
    alerts.push({
      id: `alert-declining-${student.id}`,
      type: 'declining_grades',
      severity: 'warning',
      title: 'Declining Semester SGPA Trajectory',
      message: `Performance dropped by ${Math.abs(sgpaDelta)} SGPA points compared to Semester ${currentSemesterNum - 1}.`,
      metricLabel: 'SGPA Trend',
      metricValue: `${sgpaDelta} pts`,
      recommendation: 'Schedule an academic counseling session with department mentor Dr. Marcus Vance.',
      date: '2026-10-10',
    });
  }

  if (weakSubjects.length > 0) {
    weakSubjects.forEach((ws) => {
      alerts.push({
        id: `alert-weak-${ws.courseCode}`,
        type: 'weak_subject',
        severity: 'warning',
        title: `Academic Focus Needed: ${ws.courseCode} (${ws.courseTitle})`,
        message: `Current score stands at ${ws.totalScore}% with ${ws.attendancePct}% attendance.`,
        metricLabel: 'Subject Score',
        metricValue: `${ws.totalScore}% (${ws.grade})`,
        recommendation: ws.improvementSuggestion || 'Attend remedial tutorial sessions and submit overdue lab exercises.',
        date: '2026-10-08',
      });
    });
  }

  if (baseCgpa >= 3.8 && calculatedAttendancePct >= 75) {
    alerts.push({
      id: `alert-excellence-${student.id}`,
      type: 'academic_excellence',
      severity: 'success',
      title: "Dean's List Academic Distinction",
      message: `${student.name} ranks in the top cohort percentile with a CGPA of ${baseCgpa.toFixed(2)} and exemplary attendance compliance.`,
      metricLabel: 'Cumulative CGPA',
      metricValue: `${baseCgpa.toFixed(2)} / 4.00`,
      recommendation: 'Eligible for President’s Merit Fellowship and accelerated research mentorship.',
      date: '2026-10-01',
    });
  }

  // 9. Monthly Progress (September & October 2026)
  const monthlyProgress = [
    {
      monthKey: '2026-08',
      monthName: 'August 2026',
      attendancePct: Math.min(100, Math.round(calculatedAttendancePct - 1.5)),
      averageMarks: Math.round(baseCgpa * 23.0),
      sessionsRecorded: 22,
      assignmentsCompleted: 4,
    },
    {
      monthKey: '2026-09',
      monthName: 'September 2026',
      attendancePct: sepBreakdown.calculatedPercentage,
      averageMarks: Math.round(baseCgpa * 23.4),
      sessionsRecorded: sepBreakdown.netWorkingDays,
      assignmentsCompleted: 6,
    },
    {
      monthKey: '2026-10',
      monthName: 'October 2026',
      attendancePct: octBreakdown.calculatedPercentage,
      averageMarks: Math.round(baseCgpa * 23.9),
      sessionsRecorded: octBreakdown.netWorkingDays,
      assignmentsCompleted: 5,
    },
  ];

  // 10. Yearly Progress
  const yearlyProgress = [
    {
      academicYear: '2023-2024 (Year 1)',
      cgpa: Math.min(4.0, Math.round((baseCgpa - 0.12) * 100) / 100),
      attendancePct: 91.5,
      creditsEarned: 44,
    },
    {
      academicYear: '2024-2025 (Year 2)',
      cgpa: Math.min(4.0, Math.round((baseCgpa - 0.05) * 100) / 100),
      attendancePct: 93.0,
      creditsEarned: 88,
    },
    {
      academicYear: '2025-2026 (Year 3)',
      cgpa: baseCgpa,
      attendancePct: calculatedAttendancePct,
      creditsEarned: student.creditsEarned || 112,
    },
  ];

  const avgMarksPct = Math.round(
    subjectPerformances.reduce((acc, curr) => acc + curr.totalScore, 0) / subjectPerformances.length
  );

  return {
    student,
    overallAttendancePct: calculatedAttendancePct,
    attendedSessions: totalPresents,
    totalWorkingSessions: totalWorkingDays,
    isAttendanceEligible: calculatedAttendancePct >= 75,
    averageScorePct: avgMarksPct,
    cgpa: baseCgpa,
    latestSgpa,
    letterGrade: studentResult?.grade || 'A',
    rank,
    totalStudentsInCohort: Math.max(60, deptCourses[0]?.enrolledStudents || 120),
    highestScoreSubject: {
      subjectCode: highestSubject.courseCode,
      subjectTitle: highestSubject.courseTitle,
      score: highestSubject.totalScore,
    },
    assignmentsSummary: {
      total: assignments.length,
      completed: completedAssignments,
      pending: pendingAssignments,
      overdue: overdueAssignments,
      completionRatePct: Math.round((completedAssignments / assignments.length) * 100),
      averageScorePct: avgAssignmentScore,
    },
    growthDelta: {
      sgpaChange: sgpaDelta,
      attendanceChange: attDelta,
      trend: sgpaDelta > 0 ? 'improved' : sgpaDelta < 0 ? 'declined' : 'stable',
      description: sgpaDelta >= 0
        ? `+${sgpaDelta} SGPA growth vs last semester`
        : `${sgpaDelta} SGPA decline vs last semester`,
    },
    subjectPerformances,
    weakSubjects,
    topSubjects,
    assignments,
    semesterProgression,
    alerts,
    monthlyProgress,
    yearlyProgress,
  };
}

/**
 * Computes cohort-wide performance analytics across a class / department
 * for Faculty and Admin view.
 */
export function computeCohortAnalytics(
  students: Student[],
  allAttendanceRecords: StudentAttendanceRecord[],
  allResults: ResultRecord[],
  courses: AcademicCourse[],
  filterDept?: string,
  filterSem?: number
): CohortAnalyticsSummary {
  let filteredStudents = students;
  if (filterDept && filterDept !== 'all') {
    filteredStudents = filteredStudents.filter((s) => s.department === filterDept);
  }
  if (filterSem && filterSem > 0) {
    filteredStudents = filteredStudents.filter((s) => s.semester === filterSem);
  }

  const total = filteredStudents.length || 1;
  const avgAtt = Math.round(
    filteredStudents.reduce((acc, s) => acc + (Number(s.attendancePct) || 85), 0) / total
  );
  const avgCgpa = Math.round(
    (filteredStudents.reduce((acc, s) => acc + (Number(s.cgpa) || 3.5), 0) / total) * 100
  ) / 100;

  const atRiskCount = filteredStudents.filter(
    (s) => Number(s.attendancePct) < 75 || Number(s.cgpa) < 2.5
  ).length;

  const honorsCount = filteredStudents.filter(
    (s) => Number(s.cgpa) >= 3.75 && Number(s.attendancePct) >= 75
  ).length;

  const attDist = {
    high: filteredStudents.filter((s) => Number(s.attendancePct) >= 85).length,
    adequate: filteredStudents.filter((s) => Number(s.attendancePct) >= 75 && Number(s.attendancePct) < 85).length,
    atRisk: filteredStudents.filter((s) => Number(s.attendancePct) < 75).length,
  };

  const gradeDist = {
    aPlus: filteredStudents.filter((s) => Number(s.cgpa) >= 3.9).length,
    a: filteredStudents.filter((s) => Number(s.cgpa) >= 3.7 && Number(s.cgpa) < 3.9).length,
    bPlus: filteredStudents.filter((s) => Number(s.cgpa) >= 3.3 && Number(s.cgpa) < 3.7).length,
    b: filteredStudents.filter((s) => Number(s.cgpa) >= 3.0 && Number(s.cgpa) < 3.3).length,
    c: filteredStudents.filter((s) => Number(s.cgpa) >= 2.0 && Number(s.cgpa) < 3.0).length,
    f: filteredStudents.filter((s) => Number(s.cgpa) < 2.0).length,
  };

  const subjectAverages = courses.slice(0, 5).map((c, i) => ({
    courseCode: c.code,
    courseTitle: c.title,
    averageMarks: Math.round(76 + ((i * 4) % 12)),
    passRatePct: Math.round(92 + (i % 6)),
  }));

  return {
    department: filterDept || 'All Departments',
    semester: filterSem || 0,
    totalStudents: filteredStudents.length,
    averageAttendancePct: avgAtt,
    averageCgpa: avgCgpa,
    averageMarksPct: Math.round(avgCgpa * 23.6),
    atRiskCount,
    honorsCount,
    subjectAverages,
    attendanceDistribution: attDist,
    gradeDistribution: gradeDist,
  };
}
