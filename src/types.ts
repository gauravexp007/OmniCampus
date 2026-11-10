export type ERPModuleId =
  | 'dashboard'
  | 'profile'
  | 'performance'
  | 'students'
  | 'faculty'
  | 'admissions'
  | 'academics'
  | 'attendance'
  | 'timetable'
  | 'exams'
  | 'results'
  | 'finance'
  | 'library'
  | 'hostel'
  | 'hr'
  | 'documents'
  | 'userfiles'
  | 'reports'
  | 'settings';

export type UserRole = 'Admin' | 'Faculty' | 'Student';

export type ColorThemeId =
  | 'starline'
  | 'hotel'
  | 'indigo'
  | 'emerald'
  | 'sapphire'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'slate';

export interface ColorThemeOption {
  id: ColorThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  previewBg: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  department: string;
  campus: string;
  unreadNotifications: number;
  idNumber?: string;
  phone?: string;
  isPhoneVerified?: boolean;
  alternateEmail?: string;
  designation?: string;
  program?: string;
  semester?: number;
  bloodGroup?: string;
  dob?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bio?: string;
}

export interface Student {
  id: string;
  enrollmentNo: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  program: string;
  semester: number;
  section: string;
  cgpa: number;
  attendancePct: number;
  feeStatus: 'Paid' | 'Partial' | 'Overdue';
  status: 'Active' | 'On Leave' | 'Graduated' | 'Suspended';
  mentor: string;
  phone: string;
  admissionYear: number;
  hostelRoom?: string;
  creditsEarned: number;
}

export interface FacultyMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Department Chair' | 'Adjunct Fellow';
  specialization: string;
  coursesAssigned: string[];
  weeklyHours: number;
  publicationsCount: number;
  rating: number;
  status: 'Active' | 'Sabbatical' | 'Visiting';
  phone: string;
  officeRoom: string;
  joinedYear: number;
}

export interface AdmissionCandidate {
  id: string;
  applicationNo: string;
  candidateName: string;
  email: string;
  programApplied: string;
  department: string;
  entranceScore: number;
  maxScore: number;
  stage: 'Applied' | 'Reviewing' | 'Interview Scheduled' | 'Offered' | 'Enrolled' | 'Rejected';
  category: 'General' | 'Merit Scholar' | 'International' | 'Sports Quota';
  appliedDate: string;
  documentsVerified: boolean;
}

export interface AcademicCourse {
  id: string;
  code: string;
  title: string;
  department: string;
  level: 'Undergraduate' | 'Postgraduate' | 'Doctoral';
  credits: number;
  instructor: string;
  enrolledStudents: number;
  capacity: number;
  status: 'Active' | 'Elective' | 'Archived';
  syllabusProgressPct: number;
  prerequisites?: string[];
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  facultyId?: string;
  date: string;
  timeSlot: string;
  hallNo: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  status: 'Completed' | 'In-Progress' | 'Scheduled' | 'Cancelled';
  topicCovered: string;
  department?: string;
}

export interface FacultyAttendanceRecord {
  id: string;
  facultyId: string;
  facultyName: string;
  employeeId: string;
  avatar: string;
  department: string;
  designation: string;
  date: string;
  status: 'Present' | 'In Lecture' | 'On Leave' | 'Late' | 'Absent';
  checkInTime?: string;
  checkOutTime?: string;
  assignedLecture?: string;
  lectureRoom?: string;
  leaveReason?: string;
}

export interface StudentAttendanceRecord {
  id: string;
  studentId?: string;
  studentName: string;
  enrollmentNo: string;
  avatar?: string;
  department: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  timeSlot?: string;
  status: 'Present' | 'Absent' | 'Late';
  markedBy: 'Student' | 'Faculty';
  facultyName?: string;
  facultyId?: string;
  remarks?: string;
  timestamp?: number;
}

export interface AppNotification {
  id: string;
  recipientRole?: UserRole | 'All';
  recipientId?: string;
  title: string;
  desc: string;
  time: string;
  timestamp: number;
  read: boolean;
  type?: 'attendance' | 'academic' | 'exam' | 'fee' | 'general';
  metadata?: {
    courseCode?: string;
    courseTitle?: string;
    date?: string;
    status?: 'Present' | 'Absent' | 'Late';
    markedBy?: string;
    studentName?: string;
  };
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  courseCode: string;
  courseTitle: string;
  instructor: string;
  facultyId?: string; // Unique Faculty ID e.g. "FAC-2024-084"
  facultyEmail?: string;
  room: string;
  batch: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar' | 'Break';
  startTime?: string; // 24-hr format like "09:00"
  endTime?: string;   // 24-hr format like "10:30"
  durationMinutes?: number;
  colorTheme?: string; // e.g. 'pastel-blue', 'pastel-yellow', 'pastel-peach', 'pastel-teal', 'pastel-pink', 'pastel-purple', 'pastel-amber', 'pastel-slate'
  notes?: string;
}

export interface ExamRecord {
  id: string;
  examCode: string;
  courseCode: string;
  courseTitle: string;
  examType: 'Mid-Term Exam' | 'End-Semester Theory' | 'Practical Viva' | 'Supplementary';
  date: string;
  time: string;
  durationMinutes: number;
  venue: string;
  totalRegistered: number;
  chiefInvigilator: string;
  hallTicketStatus: 'Released' | 'Pending Approval' | 'Closed';
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  department: string;
  semester: number;
  sgpa: number;
  cgpa: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  backlogs: number;
  creditsCompleted: number;
  status: 'Published' | 'Under Moderation' | 'Withheld';
  rank: number;
}

export interface FinancialTransaction {
  id: string;
  invoiceNo: string;
  studentName: string;
  enrollmentNo: string;
  category: 'Tuition Fee' | 'Hostel Fee' | 'Laboratory & Library' | 'Examination Fee' | 'Scholarship Grant';
  amount: number;
  paymentMethod: 'Stripe Gateway' | 'Bank Wire' | 'Campus SmartCard' | 'Scholarship Deduction';
  date: string;
  status: 'Settled' | 'Processing' | 'Failed' | 'Refunded';
}

export interface LibraryItem {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: 'Computer Science' | 'Data Science & AI' | 'Electronics' | 'Mathematics' | 'Business & Tech' | 'Journals';
  totalCopies: number;
  availableCopies: number;
  location: string;
  eBookAvailable: boolean;
  timesIssued: number;
}

export interface HostelOccupancy {
  block: string;
  roomNo: string;
  type: 'Single Deluxe' | 'Double Sharing' | 'Triple AC';
  capacity: number;
  occupied: number;
  warden: string;
  maintenanceStatus: 'Clean & Operational' | 'Maintenance Required' | 'Scheduled Painting';
  studentsAssigned: string[];
}

export interface HREmployee {
  id: string;
  empId: string;
  name: string;
  role: string;
  department: string;
  payrollAmount: number;
  leaveBalance: number;
  status: 'On Duty' | 'On Leave' | 'Official Travel';
  performanceRating: number;
  nextReviewDate: string;
}

export interface UserUploadedFile {
  id: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  dataUrl: string;
  uploadedByUid: string;
  uploaderName: string;
  uploaderEmail: string;
  uploadedAt: string;
  category: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: 'Official Transcript' | 'Degree Certificate' | 'NOC / Migration' | 'Bonafide Letter' | 'Accreditation Dossier';
  requester: string;
  issuedDate: string;
  verifiedBy: string;
  digitalSealHash: string;
  status: 'Issued & Blockchain Verified' | 'Pending Dean Signature' | 'Draft';
  fileDataUrl?: string;
  fileName?: string;
  uploadedByUid?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Academic' | 'Administrative' | 'Campus Life' | 'Examination' | 'Placement';
  priority: 'High' | 'Normal' | 'Urgent';
  date: string;
  author: string;
  snippet: string;
  readCount: number;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  changePct: number;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
  iconName: string;
  gradient: string;
}

export interface AcademicInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'alert';
  title: string;
  description: string;
  impactScore: number;
  recommendedAction: string;
  department: string;
  timestamp: string;
}

export interface StudentAssignment {
  id: string;
  courseCode: string;
  courseTitle: string;
  title: string;
  dueDate: string;
  submittedDate?: string;
  status: 'Submitted' | 'Graded' | 'Pending' | 'Overdue';
  score?: number;
  maxScore: number;
  feedback?: string;
  weightagePct: number;
}

export interface StudentSubjectPerformance {
  courseCode: string;
  courseTitle: string;
  credits: number;
  instructor: string;
  internalMarks: number; // out of 30
  midTermMarks: number;  // out of 30
  endTermMarks: number;  // out of 40
  totalScore: number;    // out of 100
  classAverage: number;
  highestScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  gpaEquivalent: number;
  attendancePct: number;
  isWeakSubject: boolean;
  improvementSuggestion?: string;
}

export interface PerformanceAlertItem {
  id: string;
  type: 'low_attendance' | 'declining_grades' | 'weak_subject' | 'academic_excellence';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  metricLabel: string;
  metricValue: string;
  recommendation: string;
  date: string;
}

export interface SemesterProgressDataPoint {
  semesterNumber: number;
  semesterLabel: string;
  sgpa: number;
  cgpa: number;
  creditsEarned: number;
  attendancePct: number;
  totalMarksPct: number;
  rank: number;
  status: 'Completed' | 'Current' | 'Upcoming';
}
