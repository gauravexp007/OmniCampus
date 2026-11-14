import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  FacultyMember,
  AdmissionCandidate,
  AcademicCourse,
  AttendanceRecord,
  FacultyAttendanceRecord,
  StudentAttendanceRecord,
  AppNotification,
  TimetableSlot,
  ExamRecord,
  ResultRecord,
  FinancialTransaction,
  LibraryItem,
  HostelOccupancy,
  HREmployee,
  DocumentRecord,
  AnnouncementItem,
  UserRole,
  UserProfile,
  ERPModuleId,
  ColorThemeId,
  ColorThemeOption,
  UserUploadedFile,
} from '../types';
import {
  loginProfiles,
  mockStudents,
  mockFaculty,
  mockCourses,
  mockAdmissions,
  mockAttendanceRecords,
  mockFacultyAttendanceRecords,
  mockStudentAttendanceRecords,
  mockTimetableSlots,
  mockExams,
  mockResults,
  mockTransactions,
  mockLibraryItems,
  mockHostels,
  mockHREmployees,
  mockDocuments,
  mockAnnouncements,
} from '../data/mockData';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { getSketchAvatar } from '../utils/sketchAvatars';

export const ADMIN_EMAIL = 'fab.gaurav007@gmail.com';

// Master Set of all mock IDs from mockData.ts
export const ALL_DEMO_IDS = new Set<string>([
  ...mockStudents.map((s) => s.id),
  ...mockFaculty.map((f) => f.id),
  ...mockCourses.map((c) => c.id),
  ...mockAdmissions.map((a) => a.id),
  ...mockAttendanceRecords.map((a) => a.id),
  ...mockFacultyAttendanceRecords.map((f) => f.id),
  ...mockStudentAttendanceRecords.map((s) => s.id),
  ...mockTimetableSlots.map((t) => t.id),
  ...mockExams.map((e) => e.id),
  ...mockResults.map((r) => r.id),
  ...mockTransactions.map((t) => t.id),
  ...mockLibraryItems.map((l) => l.id),
  ...mockHostels.map((h) => `${h.block}_${h.roomNo}`.replace(/[\/\s]/g, '_')),
  ...mockHostels.map((h) => h.roomNo),
  ...mockHREmployees.map((h) => h.id),
  ...mockDocuments.map((d) => d.id),
  ...mockAnnouncements.map((a) => a.id),
  'std-101', 'std-102', 'std-103', 'std-104', 'std-105', 'std-106', 'std-107',
  'fac-01', 'fac-02', 'fac-03', 'fac-04', 'fac-05', 'fac-06',
  'adm-001', 'adm-002', 'adm-003', 'adm-004', 'adm-005',
  'crs-01', 'crs-02', 'crs-03', 'crs-04', 'crs-05',
  'att-201', 'att-202', 'att-203', 'att-204', 'att-205',
  'fac-att-01', 'fac-att-02', 'fac-att-301', 'fac-att-302', 'fac-att-303', 'fac-att-304',
  'stu-att-01', 'stu-att-02', 'stu-att-03', 'stu-att-04',
  'tt-1', 'tt-2', 'tt-3', 'tt-4', 'tt-5', 'tt-6', 'tt-7', 'tt-8',
  'tt-101', 'tt-102', 'tt-103', 'tt-104', 'tt-105', 'tt-106', 'tt-107',
  'ex-01', 'ex-02', 'ex-03', 'exam-101', 'exam-102', 'exam-103',
  'res-01', 'res-02', 'res-03', 'res-04', 'res-05', 'res-101', 'res-102',
  'tx-901', 'tx-902', 'tx-903', 'tx-904', 'tx-905', 'tx-101', 'tx-102',
  'lib-01', 'lib-02', 'lib-03', 'lib-04', 'lib-05', 'lib-101',
  'emp-01', 'emp-02', 'emp-03', 'emp-04', 'hr-101',
  'doc-001', 'doc-002', 'doc-003', 'doc-101', 'doc-102',
  'ann-1', 'ann-2', 'ann-3', 'ann-101', 'ann-102',
  'Block-A_101', 'Block-A_102', 'Block-B_201', 'Block-B_202', 'Block-C_301',
]);

const ALL_DEMO_TITLES = new Set<string>([
  'official transcripts - batch 2024 cs',
  'bonafide scholarship verification certificate',
  'international exchange noc & credit transfer dossier',
  'deep learning & foundation architectures',
  'distributed database systems',
  'distributed database management & vector indexes',
  'embedded system architecture & rtos',
  'embedded rtos hardware lab',
  'biomechanics & physiological signal modeling',
  'enterprise tech commercialization & strategy',
  'deep learning',
  'distributed db',
  'distributed db lab',
  'embedded systems',
  'biomechanics',
  'enterprise tech strategy',
  'autonomous robotics workshop',
  'doctoral colloquium',
  'fall 2026 mid-semester examination schedules & hall ticket portal activated',
  'annual innovation hackathon & global research symposium announced',
  'biometric attendance reconciliation deadline for month of august',
]);

const ALL_DEMO_CODES = new Set<string>([
  'exam-2026-f-01',
  'exam-2026-f-02',
  'exam-2026-f-03',
  'app-2026-cs-9801',
  'app-2026-cs-9844',
  'app-2026-ec-4412',
  'app-2026-me-1029',
  'app-2026-mg-7781',
  'inv-2026-8801',
  'inv-2026-8802',
  'inv-2026-8803',
  'inv-2026-8804',
  'inv-2026-8805',
]);

const ALL_DEMO_ENROLLMENTS = new Set<string>([
  'omni-2024-cs-084',
  'omni-2024-cs-119',
  'omni-2024-ec-042',
  'omni-2024-me-018',
  'omni-2023-mg-005',
  'omni-2024-bm-033',
  'omni-2024-cs-204',
  'omni-2023-cs-001',
  'omni-2023-cs-015',
  '230101010001',
]);

export const isDemoRecord = (id?: string | null, data?: any): boolean => {
  if (id) {
    const s = String(id).trim();
    if (s.startsWith('manual-')) return false;
    if (ALL_DEMO_IDS.has(s)) return true;
    if (
      s.startsWith('init-') ||
      s.startsWith('demo-') ||
      s.startsWith('att-seed-') ||
      /^tt-[0-9]+$/.test(s) ||
      /^ex-[0-9]+$/.test(s) ||
      /^res-[0-9]+$/.test(s) ||
      /^doc-00[0-9]+$/.test(s) ||
      /^ann-[0-9]+$/.test(s) ||
      /^tx-90[0-9]+$/.test(s) ||
      /^lib-0[0-9]+$/.test(s) ||
      /^fac-0[0-9]+$/.test(s) ||
      /^std-10[0-9]+$/.test(s) ||
      /^adm-00[0-9]+$/.test(s) ||
      /^crs-0[0-9]+$/.test(s) ||
      /^att-20[0-9]+$/.test(s) ||
      /^fac-att-30[0-9]+$/.test(s) ||
      /^emp-0[0-9]+$/.test(s)
    ) {
      return true;
    }
  }
  if (data) {
    if (String(data.id || '').startsWith('manual-')) return false;
    if (data.isDemo || data.isMock) return true;
    const title = String(data.title || data.courseTitle || '').trim().toLowerCase();
    if (title && ALL_DEMO_TITLES.has(title)) return true;
    const code = String(data.examCode || data.applicationNo || data.invoiceNo || '').trim().toLowerCase();
    if (code && ALL_DEMO_CODES.has(code)) return true;
    const enrollment = String(data.enrollmentNo || '').trim().toLowerCase();
    if (enrollment && ALL_DEMO_ENROLLMENTS.has(enrollment)) return true;
    const requester = String(data.requester || '').trim().toLowerCase();
    if (requester && (
      requester.includes('aria chen') ||
      requester.includes('julian montgomery') ||
      requester.includes('zara al-mansoor')
    )) {
      return true;
    }
  }
  return false;
};
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  getDocs,
} from 'firebase/firestore';

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    id: 'starline',
    name: 'Steel Slate',
    subtitle: 'Modern Clean Slate & Cool Charcoal Tone',
    primaryColor: '#6C7D8A',
    accentColor: '#4F606C',
    previewBg: 'from-[#6C7D8A] to-[#4F606C]',
  },
  {
    id: 'hotel',
    name: 'Innap Hotel Teal',
    subtitle: 'Hotel Admin Signature Teal & Gold',
    primaryColor: '#13B497',
    accentColor: '#FEA700',
    previewBg: 'from-[#13B497] to-[#00A389]',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    subtitle: 'Deep Indigo & Clean Slate',
    primaryColor: '#4f46e5',
    accentColor: '#6366f1',
    previewBg: 'from-indigo-600 to-indigo-700',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    subtitle: 'Botanical Emerald & Mint Green',
    primaryColor: '#059669',
    accentColor: '#10b981',
    previewBg: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'sapphire',
    name: 'Ocean Sapphire',
    subtitle: 'Corporate Blue & Tech Cyan',
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    previewBg: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    subtitle: 'Academic Wine & Vibrant Rose',
    primaryColor: '#e11d48',
    accentColor: '#f43f5e',
    previewBg: 'from-rose-600 to-pink-700',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    subtitle: 'Golden Ochre & Sunset Copper',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    previewBg: 'from-amber-600 to-orange-600',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    subtitle: 'Deep Purple & Soft Lavender',
    primaryColor: '#7c3aed',
    accentColor: '#8b5cf6',
    previewBg: 'from-purple-600 to-violet-700',
  },
  {
    id: 'slate',
    name: 'Monochrome Slate',
    subtitle: 'Architectural Charcoal & Neutral Zinc',
    primaryColor: '#334155',
    accentColor: '#475569',
    previewBg: 'from-slate-700 to-slate-900',
  },
];

interface ERPContextType {
  // Theme & Appearance
  theme: ColorThemeId;
  setTheme: (theme: ColorThemeId) => void;
  availableThemes: ColorThemeOption[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;

  // Role & Auth
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  firebaseUser: FirebaseUser | null;
  isAuthLoading: boolean;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // Active Module
  currentModule: ERPModuleId;
  setCurrentModule: (module: ERPModuleId) => void;

  // Collections (All starting empty for newly added data)
  userFiles: UserUploadedFile[];
  students: Student[];
  faculty: FacultyMember[];
  admissions: AdmissionCandidate[];
  courses: AcademicCourse[];
  attendanceRecords: AttendanceRecord[];
  facultyAttendanceRecords: FacultyAttendanceRecord[];
  studentAttendanceRecords: StudentAttendanceRecord[];
  notifications: AppNotification[];
  timetableSlots: TimetableSlot[];
  exams: ExamRecord[];
  results: ResultRecord[];
  transactions: FinancialTransaction[];
  libraryItems: LibraryItem[];
  hostelRooms: HostelOccupancy[];
  employees: HREmployee[];
  documents: DocumentRecord[];
  announcements: AnnouncementItem[];

  // Mutations
  addStudent: (student: Omit<Student, 'id'> & { id?: string }) => void;
  deleteStudent: (id: string) => void;
  updateStudent: (student: Student) => void;

  addFaculty: (faculty: Omit<FacultyMember, 'id'> & { id?: string }) => void;
  deleteFaculty: (id: string) => void;
  updateFaculty: (faculty: FacultyMember) => void;

  addAdmission: (candidate: Omit<AdmissionCandidate, 'id'> & { id?: string }) => void;
  updateAdmissionStage: (id: string, stage: AdmissionCandidate['stage']) => void;
  deleteAdmission: (id: string) => void;

  addCourse: (course: Omit<AcademicCourse, 'id'> & { id?: string }) => void;
  deleteCourse: (id: string) => void;

  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'> & { id?: string }) => void;
  deleteAttendanceRecord: (id: string) => void;

  addFacultyAttendanceRecord: (record: Omit<FacultyAttendanceRecord, 'id'> & { id?: string }) => void;
  deleteFacultyAttendanceRecord: (id: string) => void;

  addStudentAttendanceRecord: (record: Omit<StudentAttendanceRecord, 'id'> & { id?: string }) => void;
  deleteStudentAttendanceRecord: (id: string) => void;

  markStudentAttendanceSingle: (params: {
    student: Student;
    courseCode: string;
    courseTitle: string;
    department: string;
    date: string;
    timeSlot?: string;
    status: 'Present' | 'Absent';
    facultyName: string;
    facultyId?: string;
    venue?: string;
  }) => void;

  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'> & { id?: string }) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  batchSetTimetableSlots: (slots: TimetableSlot[]) => void;

  addExam: (exam: Omit<ExamRecord, 'id'> & { id?: string }) => void;
  toggleExamHallTicket: (id: string) => void;
  deleteExam: (id: string) => void;

  addResult: (result: Omit<ResultRecord, 'id'> & { id?: string }) => void;
  deleteResult: (id: string) => void;

  addTransaction: (transaction: Omit<FinancialTransaction, 'id'> & { id?: string }) => void;
  deleteTransaction: (id: string) => void;

  addLibraryItem: (item: Omit<LibraryItem, 'id'> & { id?: string }) => void;
  deleteLibraryItem: (id: string) => void;

  addHostelRoom: (room: HostelOccupancy) => void;
  deleteHostelRoom: (block: string, roomNo: string) => void;

  addEmployee: (employee: Omit<HREmployee, 'id'> & { id?: string }) => void;
  deleteEmployee: (id: string) => void;

  addDocument: (document: Omit<DocumentRecord, 'id'> & { id?: string }) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  addAnnouncement: (announcement: Omit<AnnouncementItem, 'id'> & { id?: string }) => void;
  deleteAnnouncement: (id: string) => void;

  // Database Sync & Persistence Status
  isDatabaseSynced: boolean;
  lastSyncTime: string;
  syncDatabaseNow: () => Promise<void>;

  // File Uploads & Cloud Storage
  uploadUserFile: (fileData: {
    name: string;
    fileType: string;
    sizeBytes: number;
    dataUrl: string;
    category: string;
  }) => Promise<void>;
  deleteUserFile: (fileId: string) => Promise<void>;

  // Clear data
  clearAllData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'erp_user_role',
  THEME: 'erp_color_theme',
  STUDENTS: 'erp_students',
  FACULTY: 'erp_faculty',
  ADMISSIONS: 'erp_admissions',
  COURSES: 'erp_courses',
  ATTENDANCE: 'erp_attendance',
  FACULTY_ATTENDANCE: 'erp_faculty_attendance',
  STUDENT_ATTENDANCE: 'erp_student_attendance',
  NOTIFICATIONS: 'erp_notifications',
  TIMETABLE: 'erp_timetable',
  EXAMS: 'erp_exams',
  RESULTS: 'erp_results',
  TRANSACTIONS: 'erp_transactions',
  LIBRARY: 'erp_library',
  HOSTEL: 'erp_hostel',
  EMPLOYEES: 'erp_employees',
  DOCUMENTS: 'erp_documents',
  ANNOUNCEMENTS: 'erp_announcements',
};

// Safe localStorage loader starting EMPTY by default
function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error(`Failed to parse stored ERP data for ${key}`, err);
  }
  return defaultValue;
}

// Allowed modules per role
export const ROLE_ALLOWED_MODULES: Record<UserRole, ERPModuleId[]> = {
  Student: ['dashboard', 'profile', 'academics', 'timetable', 'exams', 'results', 'attendance', 'documents', 'userfiles'],
  Faculty: ['dashboard', 'profile', 'students', 'academics', 'attendance', 'timetable', 'exams', 'results', 'documents', 'userfiles'],
  Admin: [
    'dashboard',
    'profile',
    'students',
    'faculty',
    'admissions',
    'academics',
    'attendance',
    'timetable',
    'exams',
    'results',
    'finance',
    'library',
    'hostel',
    'hr',
    'documents',
    'userfiles',
    'reports',
    'settings',
  ],
};

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ColorThemeId>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ColorThemeId;
    return savedTheme && COLOR_THEMES.some((t) => t.id === savedTheme) ? savedTheme : 'starline';
  });

  const [isDarkMode, setIsDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('erp_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
    return savedRole && loginProfiles[savedRole] ? savedRole : 'Admin';
  });

  const [currentModule, setCurrentModuleState] = useState<ERPModuleId>('dashboard');

  // Firebase Auth and Profile state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [customProfile, setCustomProfile] = useState<UserProfile | null>(null);

  // User uploaded files collection
  const [userFiles, setUserFiles] = useState<UserUploadedFile[]>([]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userEmail = (user.email || '').trim().toLowerCase();
          const isDesignatedAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            // Strictly enforce: only fab.gaurav007@gmail.com is allowed as Admin
            let userRole: UserRole = 'Student';
            if (isDesignatedAdmin) {
              userRole = 'Admin';
            } else {
              userRole = data.role === 'Faculty' ? 'Faculty' : 'Student';
            }

            // Replace demo/stock unsplash photos with sketch avatars
            const isDemoAvatar = !data.avatar || data.avatar.includes('unsplash.com');
            const cleanAvatar = isDemoAvatar ? getSketchAvatar(userRole) : data.avatar;

            // Silently synchronize Firestore if role or avatar needed normalization
            if (data.role !== userRole || isDemoAvatar) {
              setDoc(userDocRef, { role: userRole, avatar: cleanAvatar }, { merge: true }).catch((err) => {
                console.warn('Silent role/avatar update notice:', err);
              });
            }

            let resolvedIdNumber = data.idNumber || data.employeeId || data.facultyId || '';
            if (userRole === 'Faculty') {
              if (!resolvedIdNumber) {
                resolvedIdNumber = `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                setDoc(
                  userDocRef,
                  { idNumber: resolvedIdNumber, employeeId: resolvedIdNumber, facultyId: resolvedIdNumber },
                  { merge: true }
                ).catch(() => {});
              }

              // Persist to faculty collection so admin and timetables/registers have guaranteed access
              const facRecord: FacultyMember = {
                id: user.uid,
                employeeId: resolvedIdNumber,
                name: data.name || user.displayName || 'Faculty Member',
                email: data.email || user.email || '',
                avatar: cleanAvatar,
                department: data.department || 'Computer Science & AI',
                designation: data.designation || 'Assistant Professor',
                specialization: data.specialization || 'Core Academics',
                coursesAssigned: data.coursesAssigned || [],
                weeklyHours: 14,
                publicationsCount: 0,
                rating: 4.8,
                status: 'Active',
                phone: data.phone || '',
                officeRoom: data.officeRoom || 'Room 302, Academic Block',
                joinedYear: data.joinedYear || new Date().getFullYear(),
              };
              setDoc(doc(db, 'faculty', user.uid), facRecord, { merge: true }).catch(() => {});
              setFaculty((prev) => {
                const filtered = prev.filter((f) => f.id !== user.uid && f.employeeId !== resolvedIdNumber);
                return [facRecord, ...filtered];
              });
            } else if (userRole === 'Admin') {
              // Admin login: discover all registered faculties from users collection and sync them to faculty collection
              getDocs(collection(db, 'users')).then((usersSnap) => {
                const facList: FacultyMember[] = [];
                usersSnap.forEach((uDoc) => {
                  const uData = uDoc.data();
                  if (uData.role === 'Faculty') {
                    const facId = uData.idNumber || uData.employeeId || uData.facultyId || `FAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    if (!uData.idNumber) {
                      setDoc(doc(db, 'users', uDoc.id), { idNumber: facId, employeeId: facId, facultyId: facId }, { merge: true }).catch(() => {});
                    }
                    const facMember: FacultyMember = {
                      id: uDoc.id,
                      employeeId: facId,
                      name: uData.name || 'Faculty Member',
                      email: uData.email || '',
                      avatar: uData.avatar || getSketchAvatar('Faculty'),
                      department: uData.department || 'Computer Science & AI',
                      designation: uData.designation || 'Assistant Professor',
                      specialization: uData.specialization || 'Core Academics',
                      coursesAssigned: uData.coursesAssigned || [],
                      weeklyHours: 14,
                      publicationsCount: 0,
                      rating: 4.8,
                      status: 'Active',
                      phone: uData.phone || '',
                      officeRoom: uData.officeRoom || 'Room 302, Academic Block',
                      joinedYear: uData.joinedYear || new Date().getFullYear(),
                    };
                    setDoc(doc(db, 'faculty', uDoc.id), facMember, { merge: true }).catch(() => {});
                    facList.push(facMember);
                  }
                });
                if (facList.length > 0) {
                  setFaculty((prev) => {
                    const existingMap = new Map(prev.map((f) => [f.id, f]));
                    facList.forEach((f) => existingMap.set(f.id, f));
                    return Array.from(existingMap.values());
                  });
                }
              }).catch((syncErr) => console.warn('Admin faculty sync error:', syncErr));
            }

            setRoleState(userRole);
            setCustomProfile({
              uid: user.uid,
              name: data.name || user.displayName || 'Campus Member',
              role: userRole,
              email: data.email || user.email || '',
              avatar: cleanAvatar,
              department: data.department || 'Computer Science & Engineering',
              campus: data.campus || 'Main Tech Campus',
              unreadNotifications: data.unreadNotifications ?? 3,
              idNumber: resolvedIdNumber,
              phone: data.phone || '',
              isPhoneVerified: Boolean(data.isPhoneVerified),
              alternateEmail: data.alternateEmail || '',
              designation: data.designation || '',
              program: data.program || '',
              semester: data.semester,
              bloodGroup: data.bloodGroup || '',
              dob: data.dob || '',
              address: data.address || '',
              emergencyContactName: data.emergencyContactName || '',
              emergencyContactPhone: data.emergencyContactPhone || '',
              bio: data.bio || '',
            });
          } else {
            // Default profile from auth user
            const userRole: UserRole = isDesignatedAdmin ? 'Admin' : 'Student';
            const cleanAvatar = getSketchAvatar(userRole);
            setRoleState(userRole);
            setCustomProfile({
              uid: user.uid,
              name: user.displayName || 'Campus Member',
              role: userRole,
              email: user.email || '',
              avatar: cleanAvatar,
              department: 'Computer Science & Engineering',
              campus: 'Main Tech Campus',
              unreadNotifications: 2,
              idNumber: '',
              phone: '',
              isPhoneVerified: false,
              alternateEmail: '',
              designation: '',
              program: '',
              bloodGroup: '',
              dob: '',
              address: '',
              emergencyContactName: '',
              emergencyContactPhone: '',
              bio: '',
            });
          }
        } catch (err) {
          console.warn('Notice fetching user profile from Firestore, using auth fallback profile:', err);
          const userEmail = (user.email || '').trim().toLowerCase();
          const isDesignatedAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
          const userRole: UserRole = isDesignatedAdmin ? 'Admin' : 'Student';
          setRoleState(userRole);
          setCustomProfile({
            uid: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Campus Member',
            role: userRole,
            email: user.email || '',
            avatar: getSketchAvatar(userRole),
            department: 'Computer Science & Engineering',
            campus: 'Main Tech Campus',
            unreadNotifications: 2,
            idNumber: '',
            phone: '',
            isPhoneVerified: false,
            alternateEmail: '',
            designation: '',
            program: '',
            bloodGroup: '',
            dob: '',
            address: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            bio: '',
          });
        }
      } else {
        setCustomProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to User Files in Firestore
  useEffect(() => {
    if (!firebaseUser) {
      setUserFiles([]);
      return;
    }

    try {
      const filesQuery = query(collection(db, 'user_files'), orderBy('uploadedAt', 'desc'));
      const unsubscribeFiles = onSnapshot(
        filesQuery,
        (snapshot) => {
          const loaded: UserUploadedFile[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<UserUploadedFile, 'id'>) });
          });
          setUserFiles(loaded);
        },
        (error) => {
          console.warn('Firestore user_files snapshot notice:', error.message);
        }
      );

      return () => unsubscribeFiles();
    } catch (err) {
      console.warn('Error subscribing to user_files:', err);
    }
  }, [firebaseUser]);

  // Log out function
  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setCustomProfile(null);
  };

  // Update user profile in Firestore
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const userEmail = (firebaseUser.email || '').trim().toLowerCase();
    const isDesignatedAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

    // Prevent non-admin accounts from elevating their role to Admin
    if (updates.role === 'Admin' && !isDesignatedAdmin) {
      delete updates.role;
    }

    // Faculty ID is permanent and immutable. Cannot be modified by anyone.
    if (currentUser?.role === 'Faculty') {
      delete updates.idNumber;
      delete (updates as any).employeeId;
      delete (updates as any).facultyId;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });

      // Synchronize faculty collection if user is Faculty
      if (currentUser?.role === 'Faculty') {
        const facId = currentUser.idNumber || currentUser.employeeId;
        const facRef = doc(db, 'faculty', firebaseUser.uid);
        setDoc(
          facRef,
          {
            name: updates.name || currentUser.name,
            department: updates.department || currentUser.department,
            avatar: updates.avatar || currentUser.avatar,
            phone: updates.phone || currentUser.phone,
          },
          { merge: true }
        ).catch(() => {});
        setFaculty((prev) =>
          prev.map((f) =>
            f.id === firebaseUser.uid || f.employeeId === facId
              ? {
                  ...f,
                  name: updates.name || f.name,
                  department: updates.department || f.department,
                  avatar: updates.avatar || f.avatar,
                  phone: updates.phone || f.phone,
                }
              : f
          )
        );
      }
      setCustomProfile((prev) => {
        if (!prev) {
          const defaultRole: UserRole = isDesignatedAdmin ? 'Admin' : 'Student';
          return {
            uid: firebaseUser.uid,
            name: updates.name || firebaseUser.displayName || 'Campus Member',
            role: updates.role || defaultRole,
            email: updates.email || firebaseUser.email || '',
            avatar: updates.avatar || getSketchAvatar(updates.role || defaultRole),
            department: updates.department || 'Computer Science & Engineering',
            campus: updates.campus || 'Main Tech Campus',
            unreadNotifications: 2,
            ...updates,
          };
        }
        return { ...prev, ...updates };
      });
      if (updates.role) {
        setRoleState(updates.role);
      }
    } catch (err) {
      console.error('Error updating user profile in Firestore:', err);
      throw err;
    }
  };

  // Upload user file to Firestore
  const uploadUserFile = async (fileData: {
    name: string;
    fileType: string;
    sizeBytes: number;
    dataUrl: string;
    category: string;
  }) => {
    if (!firebaseUser) throw new Error('Must be signed in to upload files');

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFileDoc = {
      name: fileData.name,
      fileType: fileData.fileType,
      sizeBytes: fileData.sizeBytes,
      dataUrl: fileData.dataUrl,
      category: fileData.category,
      uploadedByUid: firebaseUser.uid,
      uploaderName: currentUser.name,
      uploaderEmail: currentUser.email,
      uploadedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await setDoc(doc(db, 'user_files', fileId), newFileDoc);
  };

  const deleteUserFile = async (fileId: string) => {
    await deleteDoc(doc(db, 'user_files', fileId));
  };

  // Apply theme to DOM document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const setTheme = (newTheme: ColorThemeId) => {
    setThemeState(newTheme);
  };

  // Synchronize dark mode class on root document and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-color-scheme', 'light');
    }
    localStorage.setItem('erp_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkModeState((prev) => !prev);
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
  };

  // Clean any old demo records that might be present in localStorage
  useEffect(() => {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        const raw = localStorage.getItem(key);
        if (raw && raw.startsWith('[')) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((item: any) => !isDemoRecord(item?.id, item));
            if (filtered.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(filtered));
            }
          }
        }
      });
    } catch (_) {}
  }, []);

  // Database sync state
  const [isDatabaseSynced, setIsDatabaseSynced] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Core collections - strictly user/faculty/admin managed records (no pre-seeded demo data)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = loadStorage<Student[]>(STORAGE_KEYS.STUDENTS, []);
    return saved.filter((s) => !isDemoRecord(s?.id, s));
  });
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    const saved = loadStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, []);
    return saved.filter((f) => !isDemoRecord(f?.id, f));
  });
  const [admissions, setAdmissions] = useState<AdmissionCandidate[]>(() => {
    const saved = loadStorage<AdmissionCandidate[]>(STORAGE_KEYS.ADMISSIONS, []);
    return saved.filter((a) => !isDemoRecord(a?.id, a));
  });
  const [courses, setCourses] = useState<AcademicCourse[]>(() => {
    const saved = loadStorage<AcademicCourse[]>(STORAGE_KEYS.COURSES, []);
    return saved.filter((c) => !isDemoRecord(c?.id, c));
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = loadStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
    return saved.filter((a) => !isDemoRecord(a?.id, a));
  });
  const [facultyAttendanceRecords, setFacultyAttendanceRecords] = useState<FacultyAttendanceRecord[]>(() => {
    const saved = loadStorage<FacultyAttendanceRecord[]>(STORAGE_KEYS.FACULTY_ATTENDANCE, []);
    return saved.filter((f) => !isDemoRecord(f?.id, f));
  });
  const [studentAttendanceRecords, setStudentAttendanceRecords] = useState<StudentAttendanceRecord[]>(() => {
    const saved = loadStorage<StudentAttendanceRecord[]>(STORAGE_KEYS.STUDENT_ATTENDANCE, []);
    return saved.filter((s) => !isDemoRecord(s?.id, s));
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  );
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => {
    const saved = loadStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
    return saved.filter((t) => !isDemoRecord(t?.id, t));
  });
  const [exams, setExams] = useState<ExamRecord[]>(() => {
    const saved = loadStorage<ExamRecord[]>(STORAGE_KEYS.EXAMS, []);
    return saved.filter((e) => !isDemoRecord(e?.id, e));
  });
  const [results, setResults] = useState<ResultRecord[]>(() => {
    const saved = loadStorage<ResultRecord[]>(STORAGE_KEYS.RESULTS, []);
    return saved.filter((r) => !isDemoRecord(r?.id, r));
  });
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = loadStorage<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return saved.filter((t) => !isDemoRecord(t?.id, t));
  });
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    const saved = loadStorage<LibraryItem[]>(STORAGE_KEYS.LIBRARY, []);
    return saved.filter((l) => !isDemoRecord(l?.id, l));
  });
  const [hostelRooms, setHostelRooms] = useState<HostelOccupancy[]>(() => {
    const saved = loadStorage<HostelOccupancy[]>(STORAGE_KEYS.HOSTEL, []);
    return saved.filter((h: any) => !isDemoRecord(h?.id || `${h?.block}_${h?.roomNo}`, h));
  });
  const [employees, setEmployees] = useState<HREmployee[]>(() => {
    const saved = loadStorage<HREmployee[]>(STORAGE_KEYS.EMPLOYEES, []);
    return saved.filter((e) => !isDemoRecord(e?.id, e));
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    const saved = loadStorage<DocumentRecord[]>(STORAGE_KEYS.DOCUMENTS, []);
    return saved.filter((d) => !isDemoRecord(d?.id, d));
  });
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    const saved = loadStorage<AnnouncementItem[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    return saved.filter((a) => !isDemoRecord(a?.id, a));
  });

  // Real-time Firestore Database Synchronization:
  // Listens to Firestore collections when logged in. All records added manually by user,
  // faculty, or admin are permanently stored in Firestore and loaded into the UI across logins.
  useEffect(() => {
    if (!firebaseUser) return;

    setIsDatabaseSynced(false);
    const unsubs: (() => void)[] = [];

    // Active Purge of demo records from Firestore database
    const purgeAllDemoDataFromDatabase = async () => {
      const collNames = [
        'students',
        'faculty',
        'courses',
        'student_attendance',
        'faculty_attendance',
        'attendance',
        'timetable',
        'exams',
        'results',
        'admissions',
        'documents',
        'announcements',
        'transactions',
        'library',
        'hostel',
        'employees',
        'notifications',
      ];
      for (const cName of collNames) {
        try {
          const snap = await getDocs(collection(db, cName));
          for (const d of snap.docs) {
            if (isDemoRecord(d.id, d.data())) {
              await deleteDoc(d.ref).catch(() => {});
            }
          }
        } catch (err) {
          console.warn(`Purge error for ${cName}:`, err);
        }
      }
    };
    purgeAllDemoDataFromDatabase();

    const setupSync = <T extends object>(
      collectionName: string,
      setState: React.Dispatch<React.SetStateAction<T[]>>,
      storageKey: string
    ) => {
      try {
        const collRef = collection(db, collectionName);
        const unsub = onSnapshot(
          collRef,
          (snapshot) => {
            const loaded: T[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as any;
              // If an old demo doc exists in the database, delete it so database remains 100% clean
              if (isDemoRecord(d.id, data)) {
                deleteDoc(doc(db, collectionName, d.id)).catch(() => {});
              } else {
                loaded.push({ id: d.id, ...data });
              }
            });
            setState(loaded);
            setIsDatabaseSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          },
          (err) => {
            console.warn(`Firestore onSnapshot ${collectionName} notice:`, err.message);
            setIsDatabaseSynced(true);
          }
        );
        unsubs.push(unsub);
      } catch (err) {
        console.warn(`Failed to set up Firestore sync for ${collectionName}:`, err);
      }
    };

    setupSync('students', setStudents, STORAGE_KEYS.STUDENTS);
    setupSync('faculty', setFaculty, STORAGE_KEYS.FACULTY);
    setupSync('courses', setCourses, STORAGE_KEYS.COURSES);
    setupSync('student_attendance', setStudentAttendanceRecords, STORAGE_KEYS.STUDENT_ATTENDANCE);
    setupSync('faculty_attendance', setFacultyAttendanceRecords, STORAGE_KEYS.FACULTY_ATTENDANCE);
    setupSync('attendance', setAttendanceRecords, STORAGE_KEYS.ATTENDANCE);
    setupSync('timetable', setTimetableSlots, STORAGE_KEYS.TIMETABLE);
    setupSync('exams', setExams, STORAGE_KEYS.EXAMS);
    setupSync('results', setResults, STORAGE_KEYS.RESULTS);
    setupSync('admissions', setAdmissions, STORAGE_KEYS.ADMISSIONS);
    setupSync('documents', setDocuments, STORAGE_KEYS.DOCUMENTS);
    setupSync('announcements', setAnnouncements, STORAGE_KEYS.ANNOUNCEMENTS);
    setupSync('transactions', setTransactions, STORAGE_KEYS.TRANSACTIONS);
    setupSync('library', setLibraryItems, STORAGE_KEYS.LIBRARY);
    setupSync('hostel', setHostelRooms, STORAGE_KEYS.HOSTEL);
    setupSync('employees', setEmployees, STORAGE_KEYS.EMPLOYEES);
    setupSync('notifications', setNotifications, STORAGE_KEYS.NOTIFICATIONS);

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser]);

  // Manual one-click Database Sync
  const syncDatabaseNow = async () => {
    if (!firebaseUser) return;
    setIsDatabaseSynced(false);
    try {
      const collNames = [
        'students',
        'faculty',
        'courses',
        'student_attendance',
        'faculty_attendance',
        'attendance',
        'timetable',
        'exams',
        'results',
        'admissions',
        'documents',
        'announcements',
        'transactions',
        'library',
        'hostel',
        'employees',
        'notifications',
      ];
      await Promise.all(
        collNames.map(async (cName) => {
          const snap = await getDocs(collection(db, cName));
          const docs: any[] = [];
          if (!snap.empty) {
            snap.forEach((d) => {
              const data = d.data();
              if (isDemoRecord(d.id, data)) {
                deleteDoc(doc(db, cName, d.id)).catch(() => {});
              } else {
                docs.push({ id: d.id, ...data });
              }
            });
          }
          if (cName === 'students') setStudents(docs);
          else if (cName === 'faculty') setFaculty(docs);
          else if (cName === 'courses') setCourses(docs);
          else if (cName === 'student_attendance') setStudentAttendanceRecords(docs);
          else if (cName === 'faculty_attendance') setFacultyAttendanceRecords(docs);
          else if (cName === 'attendance') setAttendanceRecords(docs);
          else if (cName === 'timetable') setTimetableSlots(docs);
          else if (cName === 'exams') setExams(docs);
          else if (cName === 'results') setResults(docs);
          else if (cName === 'admissions') setAdmissions(docs);
          else if (cName === 'documents') setDocuments(docs);
          else if (cName === 'announcements') setAnnouncements(docs);
          else if (cName === 'transactions') setTransactions(docs);
          else if (cName === 'library') setLibraryItems(docs);
          else if (cName === 'hostel') setHostelRooms(docs);
          else if (cName === 'employees') setEmployees(docs);
          else if (cName === 'notifications') setNotifications(docs);
        })
      );
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsDatabaseSynced(true);
    } catch (err) {
      console.error('Error during manual database sync:', err);
      setIsDatabaseSynced(true);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTY, JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMISSIONS, JSON.stringify(admissions));
  }, [admissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTY_ATTENDANCE, JSON.stringify(facultyAttendanceRecords));
  }, [facultyAttendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, JSON.stringify(studentAttendanceRecords));
  }, [studentAttendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetableSlots));
  }, [timetableSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(libraryItems));
  }, [libraryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOSTEL, JSON.stringify(hostelRooms));
  }, [hostelRooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  // Set role and enforce module permissions
  const setRole = (newRole: UserRole) => {
    const userEmail = (firebaseUser?.email || currentUser.email || '').trim().toLowerCase();
    const isDesignatedAdmin = userEmail === ADMIN_EMAIL.toLowerCase();
    let validatedRole: UserRole = newRole;
    if (newRole === 'Admin' && !isDesignatedAdmin) {
      validatedRole = 'Student';
    }

    setRoleState(validatedRole);
    const allowed = ROLE_ALLOWED_MODULES[validatedRole];
    if (!allowed.includes(currentModule)) {
      setCurrentModuleState('dashboard');
    }
  };

  const setCurrentModule = (module: ERPModuleId) => {
    const allowed = ROLE_ALLOWED_MODULES[role];
    if (allowed.includes(module)) {
      setCurrentModuleState(module);
    } else {
      setCurrentModuleState('dashboard');
    }
  };

  // Profile
  const currentUser = customProfile || loginProfiles[role] || loginProfiles.Admin;

  // Student Actions (Saved to Cloud Firestore and showed in ERP UI across logins)
  const addStudent = async (studentData: Omit<Student, 'id'> & { id?: string }) => {
    const newStudent: Student = {
      ...studentData,
      id: studentData.id || `manual-std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    try {
      await setDoc(doc(db, 'students', newStudent.id), {
        ...newStudent,
        createdByUid: firebaseUser?.uid || 'user',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving student to Firestore:', err);
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      console.error('Error deleting student from Firestore:', err);
    }
  };

  const updateStudent = async (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    try {
      await setDoc(doc(db, 'students', updated.id), updated, { merge: true });
    } catch (err) {
      console.error('Error updating student in Firestore:', err);
    }
  };

  // Faculty Actions (Saved to Cloud Firestore)
  const addFaculty = async (facultyData: Omit<FacultyMember, 'id'> & { id?: string }) => {
    const facultyYear = new Date().getFullYear();
    const uniqueId =
      facultyData.employeeId && facultyData.employeeId.trim()
        ? facultyData.employeeId.trim()
        : `FAC-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newFaculty: FacultyMember = {
      ...facultyData,
      id: facultyData.id || `manual-fac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employeeId: uniqueId,
    };
    setFaculty((prev) => [newFaculty, ...prev.filter((f) => f.id !== newFaculty.id)]);
    try {
      await setDoc(doc(db, 'faculty', newFaculty.id), {
        ...newFaculty,
        createdByUid: firebaseUser?.uid || 'user',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error saving faculty to Firestore:', err);
    }
  };

  const deleteFaculty = async (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteDoc(doc(db, 'faculty', id));
    } catch (err) {
      console.error('Error deleting faculty from Firestore:', err);
    }
  };

  const updateFaculty = async (updated: FacultyMember) => {
    setFaculty((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    try {
      await setDoc(doc(db, 'faculty', updated.id), updated, { merge: true });
    } catch (err) {
      console.error('Error updating faculty in Firestore:', err);
    }
  };

  // Admissions Actions (Saved to Cloud Firestore)
  const addAdmission = async (candidateData: Omit<AdmissionCandidate, 'id'> & { id?: string }) => {
    const newCandidate: AdmissionCandidate = {
      ...candidateData,
      id: candidateData.id || `manual-adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setAdmissions((prev) => [newCandidate, ...prev.filter((c) => c.id !== newCandidate.id)]);
    try {
      await setDoc(doc(db, 'admissions', newCandidate.id), {
        ...newCandidate,
        createdByUid: firebaseUser?.uid || 'user',
      });
    } catch (err) {
      console.error('Error saving admission candidate to Firestore:', err);
    }
  };

  const updateAdmissionStage = async (id: string, stage: AdmissionCandidate['stage']) => {
    setAdmissions((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    try {
      await setDoc(doc(db, 'admissions', id), { stage }, { merge: true });
    } catch (err) {
      console.error('Error updating admission stage in Firestore:', err);
    }
  };

  const deleteAdmission = async (id: string) => {
    setAdmissions((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'admissions', id));
    } catch (err) {
      console.error('Error deleting admission from Firestore:', err);
    }
  };

  // Course Actions (Saved to Cloud Firestore)
  const addCourse = async (courseData: Omit<AcademicCourse, 'id'> & { id?: string }) => {
    const newCourse: AcademicCourse = {
      ...courseData,
      id: courseData.id || `manual-crs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setCourses((prev) => [newCourse, ...prev.filter((c) => c.id !== newCourse.id)]);
    try {
      await setDoc(doc(db, 'courses', newCourse.id), {
        ...newCourse,
        createdByUid: firebaseUser?.uid || 'user',
      });
    } catch (err) {
      console.error('Error saving course to Firestore:', err);
    }
  };

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      console.error('Error deleting course from Firestore:', err);
    }
  };

  // Attendance Actions (Saved to Cloud Firestore)
  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: recordData.id || `manual-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    try {
      await setDoc(doc(db, 'attendance', newRecord.id), newRecord);
    } catch (err) {
      console.error('Error saving attendance record to Firestore:', err);
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'attendance', id));
    } catch (err) {
      console.error('Error deleting attendance record from Firestore:', err);
    }
  };

  const addFacultyAttendanceRecord = async (recordData: Omit<FacultyAttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: FacultyAttendanceRecord = {
      ...recordData,
      id: recordData.id || `manual-fac-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setFacultyAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    try {
      await setDoc(doc(db, 'faculty_attendance', newRecord.id), newRecord);
    } catch (err) {
      console.error('Error saving faculty attendance to Firestore:', err);
    }
  };

  const deleteFacultyAttendanceRecord = async (id: string) => {
    setFacultyAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'faculty_attendance', id));
    } catch (err) {
      console.error('Error deleting faculty attendance from Firestore:', err);
    }
  };

  const addStudentAttendanceRecord = async (recordData: Omit<StudentAttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: StudentAttendanceRecord = {
      ...recordData,
      id: recordData.id || `manual-stu-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setStudentAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    try {
      await setDoc(doc(db, 'student_attendance', newRecord.id), newRecord);
    } catch (err) {
      console.error('Error saving student attendance to Firestore:', err);
    }
  };

  const deleteStudentAttendanceRecord = async (id: string) => {
    setStudentAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'student_attendance', id));
    } catch (err) {
      console.error('Error deleting student attendance from Firestore:', err);
    }
  };

  const addNotification = async (notifData: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: notifData.id || `manual-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: notifData.timestamp || Date.now(),
      read: notifData.read ?? false,
    };
    setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    try {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } catch (err) {
      console.error('Error saving notification to Firestore:', err);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await setDoc(doc(db, 'notifications', id), { read: true }, { merge: true });
    } catch (err) {
      console.error('Error marking notification read in Firestore:', err);
    }
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      notifications.forEach((n) => {
        deleteDoc(doc(db, 'notifications', n.id)).catch(() => {});
      });
    } catch (err) {
      console.error('Error clearing notifications from Firestore:', err);
    }
  };

  const markStudentAttendanceSingle = async (params: {
    student: Student;
    courseCode: string;
    courseTitle: string;
    department: string;
    date: string;
    timeSlot?: string;
    status: 'Present' | 'Absent';
    facultyName: string;
    facultyId?: string;
    venue?: string;
  }) => {
    const { student, courseCode, courseTitle, department, date, timeSlot, status, facultyName, facultyId, venue } = params;

    const existingIdx = studentAttendanceRecords.findIndex(
      (r) =>
        (r.studentId === student.id || r.enrollmentNo === student.enrollmentNo) &&
        r.courseCode.toLowerCase() === courseCode.toLowerCase() &&
        r.date === date
    );

    const recordId =
      existingIdx >= 0 ? studentAttendanceRecords[existingIdx].id : `manual-stu-att-${Date.now()}-${student.id}`;

    const record: StudentAttendanceRecord = {
      id: recordId,
      studentId: student.id,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      avatar: student.avatar,
      department: department || student.department,
      courseCode,
      courseTitle,
      date,
      timeSlot: timeSlot || '09:00 AM - 10:30 AM',
      status,
      markedBy: 'Faculty',
      facultyName,
      facultyId: facultyId || '',
      remarks: `Marked ${status} by ${facultyName}${venue ? ` at ${venue}` : ''}`,
      timestamp: Date.now(),
    };

    setStudentAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === recordId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    try {
      await setDoc(doc(db, 'student_attendance', recordId), record);
    } catch (err) {
      console.error('Error saving single student attendance to Firestore:', err);
    }

    // Automatically send notification to the student!
    addNotification({
      recipientRole: 'Student',
      recipientId: student.enrollmentNo,
      title: `Attendance Marked: ${courseCode}`,
      desc: `You were marked ${status} in ${courseTitle} by ${facultyName} on ${date}.`,
      time: 'Just now',
      read: false,
      type: 'attendance',
      metadata: {
        courseCode,
        courseTitle,
        date,
        status,
        markedBy: facultyName,
        studentName: student.name,
      },
    });
  };

  // Timetable Actions (Saved to Cloud Firestore)
  const addTimetableSlot = async (slotData: Omit<TimetableSlot, 'id'> & { id?: string }) => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: slotData.id || `manual-tt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setTimetableSlots((prev) => [newSlot, ...prev.filter((s) => s.id !== newSlot.id)]);
    try {
      await setDoc(doc(db, 'timetable', newSlot.id), newSlot);
    } catch (err) {
      console.error('Error saving timetable slot to Firestore:', err);
    }
  };

  const deleteTimetableSlot = async (id: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'timetable', id));
    } catch (err) {
      console.error('Error deleting timetable slot from Firestore:', err);
    }
  };

  const updateTimetableSlot = async (id: string, updates: Partial<TimetableSlot>) => {
    setTimetableSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    try {
      await setDoc(doc(db, 'timetable', id), updates, { merge: true });
    } catch (err) {
      console.error('Error updating timetable slot in Firestore:', err);
    }
  };

  const batchSetTimetableSlots = async (slots: TimetableSlot[]) => {
    setTimetableSlots(slots);
    try {
      for (const slot of slots) {
        await setDoc(doc(db, 'timetable', slot.id), slot);
      }
    } catch (err) {
      console.error('Error batch saving timetable slots to Firestore:', err);
    }
  };

  // Exam Actions (Saved to Cloud Firestore)
  const addExam = async (examData: Omit<ExamRecord, 'id'> & { id?: string }) => {
    const newExam: ExamRecord = {
      ...examData,
      id: examData.id || `manual-exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setExams((prev) => [newExam, ...prev.filter((e) => e.id !== newExam.id)]);
    try {
      await setDoc(doc(db, 'exams', newExam.id), newExam);
    } catch (err) {
      console.error('Error saving exam to Firestore:', err);
    }
  };

  const toggleExamHallTicket = async (id: string) => {
    let nextStatus: ExamRecord['hallTicketStatus'] = 'Released';
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          nextStatus = e.hallTicketStatus === 'Released' ? 'Pending Approval' : 'Released';
          return { ...e, hallTicketStatus: nextStatus };
        }
        return e;
      })
    );
    try {
      await setDoc(doc(db, 'exams', id), { hallTicketStatus: nextStatus }, { merge: true });
    } catch (err) {
      console.error('Error updating exam hall ticket in Firestore:', err);
    }
  };

  const deleteExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'exams', id));
    } catch (err) {
      console.error('Error deleting exam from Firestore:', err);
    }
  };

  // Result Actions (Saved to Cloud Firestore)
  const addResult = async (resultData: Omit<ResultRecord, 'id'> & { id?: string }) => {
    const newResult: ResultRecord = {
      ...resultData,
      id: resultData.id || `manual-res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setResults((prev) => [newResult, ...prev.filter((r) => r.id !== newResult.id)]);
    try {
      await setDoc(doc(db, 'results', newResult.id), newResult);
    } catch (err) {
      console.error('Error saving result to Firestore:', err);
    }

    // Automatically sync student's calculated CGPA into student record
    if (newResult.enrollmentNo && newResult.cgpa) {
      setStudents((prev) =>
        prev.map((st) =>
          st.enrollmentNo &&
          st.enrollmentNo.toLowerCase() === newResult.enrollmentNo.toLowerCase()
            ? { ...st, cgpa: newResult.cgpa }
            : st
        )
      );
      const matchedStudent = students.find(
        (st) =>
          st.enrollmentNo &&
          st.enrollmentNo.toLowerCase() === newResult.enrollmentNo.toLowerCase()
      );
      if (matchedStudent) {
        try {
          await setDoc(
            doc(db, 'students', matchedStudent.id),
            { cgpa: newResult.cgpa },
            { merge: true }
          );
        } catch (e) {
          console.error('Error syncing student cgpa to Firestore:', e);
        }
      }
    }
  };

  const deleteResult = async (id: string) => {
    setResults((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'results', id));
    } catch (err) {
      console.error('Error deleting result from Firestore:', err);
    }
  };

  // Finance Actions (Saved to Cloud Firestore)
  const addTransaction = async (txnData: Omit<FinancialTransaction, 'id'> & { id?: string }) => {
    const newTxn: FinancialTransaction = {
      ...txnData,
      id: txnData.id || `manual-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setTransactions((prev) => [newTxn, ...prev.filter((t) => t.id !== newTxn.id)]);
    try {
      await setDoc(doc(db, 'transactions', newTxn.id), newTxn);
    } catch (err) {
      console.error('Error saving transaction to Firestore:', err);
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (err) {
      console.error('Error deleting transaction from Firestore:', err);
    }
  };

  // Library Actions (Saved to Cloud Firestore)
  const addLibraryItem = async (itemData: Omit<LibraryItem, 'id'> & { id?: string }) => {
    const newItem: LibraryItem = {
      ...itemData,
      id: itemData.id || `manual-lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setLibraryItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    try {
      await setDoc(doc(db, 'library', newItem.id), newItem);
    } catch (err) {
      console.error('Error saving library item to Firestore:', err);
    }
  };

  const deleteLibraryItem = async (id: string) => {
    setLibraryItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteDoc(doc(db, 'library', id));
    } catch (err) {
      console.error('Error deleting library item from Firestore:', err);
    }
  };

  // Hostel Actions (Saved to Cloud Firestore)
  const addHostelRoom = async (room: HostelOccupancy) => {
    const docId = `manual-hostel-${room.block}_${room.roomNo}`.replace(/[\/\s]/g, '_');
    setHostelRooms((prev) => [
      room,
      ...prev.filter((r) => !(r.block === room.block && r.roomNo === room.roomNo)),
    ]);
    try {
      await setDoc(doc(db, 'hostel', docId), room);
    } catch (err) {
      console.error('Error saving hostel room to Firestore:', err);
    }
  };

  const deleteHostelRoom = async (block: string, roomNo: string) => {
    const docId = `manual-hostel-${block}_${roomNo}`.replace(/[\/\s]/g, '_');
    setHostelRooms((prev) => prev.filter((r) => !(r.block === block && r.roomNo === roomNo)));
    try {
      await deleteDoc(doc(db, 'hostel', docId));
    } catch (err) {
      console.error('Error deleting hostel room from Firestore:', err);
    }
  };

  // HR Actions (Saved to Cloud Firestore)
  const addEmployee = async (empData: Omit<HREmployee, 'id'> & { id?: string }) => {
    const newEmp: HREmployee = {
      ...empData,
      id: empData.id || `manual-emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setEmployees((prev) => [newEmp, ...prev.filter((e) => e.id !== newEmp.id)]);
    try {
      await setDoc(doc(db, 'employees', newEmp.id), newEmp);
    } catch (err) {
      console.error('Error saving employee to Firestore:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (err) {
      console.error('Error deleting employee from Firestore:', err);
    }
  };

  // Document Actions (Saved to Cloud Firestore)
  const addDocument = async (docData: Omit<DocumentRecord, 'id'> & { id?: string }) => {
    const rawDoc: DocumentRecord = {
      ...docData,
      id: docData.id || `manual-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      uploadedByUid: firebaseUser?.uid || 'user',
    };
    const newDoc = Object.fromEntries(
      Object.entries(rawDoc).filter(([, value]) => value !== undefined)
    ) as DocumentRecord;

    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    try {
      await setDoc(doc(db, 'documents', newDoc.id), newDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `documents/${newDoc.id}`);
    }
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
    }
  };

  // Announcement Actions (Saved to Cloud Firestore)
  const addAnnouncement = async (annData: Omit<AnnouncementItem, 'id'> & { id?: string }) => {
    const newAnn: AnnouncementItem = {
      ...annData,
      id: annData.id || `manual-ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setAnnouncements((prev) => [newAnn, ...prev.filter((a) => a.id !== newAnn.id)]);
    try {
      await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
    } catch (err) {
      console.error('Error saving announcement to Firestore:', err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.error('Error deleting announcement from Firestore:', err);
    }
  };

  // Clear all data
  const clearAllData = () => {
    setStudents([]);
    setFaculty([]);
    setAdmissions([]);
    setCourses([]);
    setAttendanceRecords([]);
    setTimetableSlots([]);
    setExams([]);
    setResults([]);
    setTransactions([]);
    setLibraryItems([]);
    setHostelRooms([]);
    setEmployees([]);
    setDocuments([]);
    setAnnouncements([]);
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.ROLE) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <ERPContext.Provider
      value={{
        theme,
        setTheme,
        availableThemes: COLOR_THEMES,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        role,
        setRole,
        currentUser,
        firebaseUser,
        isAuthLoading,
        logout,
        updateUserProfile,
        currentModule,
        setCurrentModule,
        isDatabaseSynced,
        lastSyncTime,
        syncDatabaseNow,
        userFiles,
        uploadUserFile,
        deleteUserFile,
        students,
        faculty,
        admissions,
        courses,
        attendanceRecords,
        facultyAttendanceRecords,
        studentAttendanceRecords,
        notifications,
        timetableSlots,
        exams,
        results,
        transactions,
        libraryItems,
        hostelRooms,
        employees,
        documents,
        announcements,
        addStudent,
        deleteStudent,
        updateStudent,
        addFaculty,
        deleteFaculty,
        updateFaculty,
        addAdmission,
        updateAdmissionStage,
        deleteAdmission,
        addCourse,
        deleteCourse,
        addAttendanceRecord,
        deleteAttendanceRecord,
        addFacultyAttendanceRecord,
        deleteFacultyAttendanceRecord,
        addStudentAttendanceRecord,
        deleteStudentAttendanceRecord,
        markStudentAttendanceSingle,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        batchSetTimetableSlots,
        addExam,
        toggleExamHallTicket,
        deleteExam,
        addResult,
        deleteResult,
        addTransaction,
        deleteTransaction,
        addLibraryItem,
        deleteLibraryItem,
        addHostelRoom,
        deleteHostelRoom,
        addEmployee,
        deleteEmployee,
        addDocument,
        deleteDocument,
        addAnnouncement,
        deleteAnnouncement,
        clearAllData,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
