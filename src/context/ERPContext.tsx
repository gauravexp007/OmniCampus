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
  LecturePlanItem,
} from '../types';
import { loginProfiles } from '../data/mockData';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { getSketchAvatar } from '../utils/sketchAvatars';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDoc,
  getDocs,
} from 'firebase/firestore';

export const ADMIN_EMAIL = 'fab.gaurav007@gmail.com';

// Kept as safe no-op exports for compatibility — never delete or hide real saved Firestore records
export const ALL_DEMO_IDS = new Set<string>();
export const isDemoRecord = (_id?: string | null, _data?: unknown): boolean => false;

// Recursively remove undefined values so Cloud Firestore setDoc/updateDoc never rejects valid payloads
function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        cleaned[key] = stripUndefinedDeep(val);
      }
    }
    return cleaned as T;
  }
  return value;
}

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
    id: 'pink',
    name: 'Light Pink',
    subtitle: 'Soft Blush Pink & Pastel Rose',
    primaryColor: '#ec6ca3',
    accentColor: '#f9a8d4',
    previewBg: 'from-pink-300 to-pink-500',
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
  lecturePlans: LecturePlanItem[];

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

  addLecturePlan: (item: Omit<LecturePlanItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }) => Promise<LecturePlanItem | null>;
  updateLecturePlan: (id: string, updates: Partial<LecturePlanItem>) => Promise<void>;
  deleteLecturePlan: (id: string) => Promise<void>;

  // Database Sync & Persistence Status
  isDatabaseSynced: boolean;
  lastSyncTime: string;
  syncDatabaseNow: () => Promise<void>;

  // File Uploads & Cloud Storage
  uploadUserFile: (fileData: {
    name: string;
    title?: string;
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
  LECTURE_PLANS: 'erp_lecture_plans',
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
  Student: ['dashboard', 'profile', 'academics', 'lectureplan', 'timetable', 'exams', 'results', 'attendance', 'notices', 'performance', 'documents', 'userfiles', 'settings'],
  Faculty: ['dashboard', 'profile', 'students', 'academics', 'lectureplan', 'attendance', 'timetable', 'exams', 'results', 'notices', 'performance', 'library', 'documents', 'userfiles', 'settings'],
  Admin: [
    'dashboard',
    'profile',
    'students',
    'faculty',
    'admissions',
    'academics',
    'lectureplan',
    'attendance',
    'timetable',
    'exams',
    'results',
    'notices',
    'performance',
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

            // Restore saved theme / dark mode preferences from Firestore if present
            if (data.theme && COLOR_THEMES.some((t) => t.id === data.theme)) {
              setThemeState(data.theme as ColorThemeId);
            }
            if (typeof data.isDarkMode === 'boolean') {
              setIsDarkModeState(data.isDarkMode);
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
      const filesQuery = query(
        collection(db, 'user_files'),
        where('uploadedByUid', '==', firebaseUser.uid)
      );
      const unsubscribeFiles = onSnapshot(
        filesQuery,
        (snapshot) => {
          const loaded: UserUploadedFile[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...(d.data() as Omit<UserUploadedFile, 'id'>) });
          });
          loaded.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
          setUserFiles(loaded);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, 'user_files');
          } catch {
            // Structured FirestoreErrorInfo already logged
          }
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
      await setDoc(
        userDocRef,
        stripUndefinedDeep({ ...updates, updatedAt: new Date().toISOString() }),
        { merge: true }
      );

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

  // Upload personal user file to Firestore
  const uploadUserFile = async (fileData: {
    name: string;
    title?: string;
    fileType: string;
    sizeBytes: number;
    dataUrl: string;
    category: string;
  }) => {
    if (!firebaseUser) throw new Error('Must be signed in to upload files');

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const rawFileDoc: Record<string, unknown> = {
      name: fileData.name,
      title: fileData.title?.trim() || undefined,
      fileType: fileData.fileType,
      sizeBytes: fileData.sizeBytes,
      dataUrl: fileData.dataUrl,
      category: fileData.category,
      uploadedByUid: firebaseUser.uid,
      uploaderName: currentUser.name,
      uploaderEmail: currentUser.email,
      uploaderRole: currentUser.role,
      uploadedAt: new Date().toISOString(),
    };
    const newFileDoc = Object.fromEntries(
      Object.entries(rawFileDoc).filter(([, value]) => value !== undefined)
    );

    try {
      await setDoc(doc(db, 'user_files', fileId), newFileDoc);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `user_files/${fileId}`);
    }
  };

  const deleteUserFile = async (fileId: string) => {
    try {
      await deleteDoc(doc(db, 'user_files', fileId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `user_files/${fileId}`);
    }
  };

  // Apply theme to DOM document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const setTheme = (newTheme: ColorThemeId) => {
    setThemeState(newTheme);
    if (firebaseUser) {
      setDoc(doc(db, 'users', firebaseUser.uid), { theme: newTheme }, { merge: true }).catch(() => {});
    }
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
    setIsDarkModeState((prev) => {
      const next = !prev;
      if (firebaseUser) {
        setDoc(doc(db, 'users', firebaseUser.uid), { isDarkMode: next }, { merge: true }).catch(() => {});
      }
      return next;
    });
  };

  const setDarkMode = (dark: boolean) => {
    setIsDarkModeState(dark);
    if (firebaseUser) {
      setDoc(doc(db, 'users', firebaseUser.uid), { isDarkMode: dark }, { merge: true }).catch(() => {});
    }
  };

  // Database sync state
  const [isDatabaseSynced, setIsDatabaseSynced] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Core collections — hydrated from cache immediately and continuously synced live with Cloud Firestore
  const [students, setStudents] = useState<Student[]>(() => loadStorage<Student[]>(STORAGE_KEYS.STUDENTS, []));
  const [faculty, setFaculty] = useState<FacultyMember[]>(() => loadStorage<FacultyMember[]>(STORAGE_KEYS.FACULTY, []));
  const [admissions, setAdmissions] = useState<AdmissionCandidate[]>(() => loadStorage<AdmissionCandidate[]>(STORAGE_KEYS.ADMISSIONS, []));
  const [courses, setCourses] = useState<AcademicCourse[]>(() => loadStorage<AcademicCourse[]>(STORAGE_KEYS.COURSES, []));
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => loadStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []));
  const [facultyAttendanceRecords, setFacultyAttendanceRecords] = useState<FacultyAttendanceRecord[]>(() => loadStorage<FacultyAttendanceRecord[]>(STORAGE_KEYS.FACULTY_ATTENDANCE, []));
  const [studentAttendanceRecords, setStudentAttendanceRecords] = useState<StudentAttendanceRecord[]>(() => loadStorage<StudentAttendanceRecord[]>(STORAGE_KEYS.STUDENT_ATTENDANCE, []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []));
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => loadStorage<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []));
  const [exams, setExams] = useState<ExamRecord[]>(() => loadStorage<ExamRecord[]>(STORAGE_KEYS.EXAMS, []));
  const [results, setResults] = useState<ResultRecord[]>(() => loadStorage<ResultRecord[]>(STORAGE_KEYS.RESULTS, []));
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => loadStorage<FinancialTransaction[]>(STORAGE_KEYS.TRANSACTIONS, []));
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => loadStorage<LibraryItem[]>(STORAGE_KEYS.LIBRARY, []));
  const [hostelRooms, setHostelRooms] = useState<HostelOccupancy[]>(() => loadStorage<HostelOccupancy[]>(STORAGE_KEYS.HOSTEL, []));
  const [employees, setEmployees] = useState<HREmployee[]>(() => loadStorage<HREmployee[]>(STORAGE_KEYS.EMPLOYEES, []));
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => loadStorage<DocumentRecord[]>(STORAGE_KEYS.DOCUMENTS, []));
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => loadStorage<AnnouncementItem[]>(STORAGE_KEYS.ANNOUNCEMENTS, []));
  const [lecturePlans, setLecturePlans] = useState<LecturePlanItem[]>(() => loadStorage<LecturePlanItem[]>(STORAGE_KEYS.LECTURE_PLANS, []));

  // Real-time Firestore Database Synchronization:
  // Streams ALL saved documents from Firebase Firestore and always displays them across reloads & devices.
  useEffect(() => {
    if (!firebaseUser) return;

    setIsDatabaseSynced(false);
    const unsubs: (() => void)[] = [];

    const setupSync = <T extends object>(
      collectionName: string,
      setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      try {
        const collRef = collection(db, collectionName);
        const unsub = onSnapshot(
          collRef,
          (snapshot) => {
            const loaded: T[] = [];
            snapshot.forEach((d) => {
              loaded.push({ id: d.id, ...(d.data() as Record<string, unknown>) } as T);
            });
            setState(loaded);
            setIsDatabaseSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          },
          (err) => {
            setIsDatabaseSynced(true);
            try {
              handleFirestoreError(err, OperationType.LIST, collectionName);
            } catch {
              // Error already logged with full FirestoreErrorInfo context
            }
          }
        );
        unsubs.push(unsub);
      } catch (err) {
        console.error(`Failed to set up Firestore sync for ${collectionName}:`, err);
      }
    };

    setupSync('students', setStudents);
    setupSync('faculty', setFaculty);
    setupSync('courses', setCourses);
    setupSync('student_attendance', setStudentAttendanceRecords);
    setupSync('faculty_attendance', setFacultyAttendanceRecords);
    setupSync('attendance', setAttendanceRecords);
    setupSync('timetable', setTimetableSlots);
    setupSync('exams', setExams);
    setupSync('results', setResults);
    setupSync('admissions', setAdmissions);
    setupSync('documents', setDocuments);
    setupSync('announcements', setAnnouncements);
    setupSync('transactions', setTransactions);
    setupSync('library', setLibraryItems);
    setupSync('hostel', setHostelRooms);
    setupSync('employees', setEmployees);
    setupSync('notifications', setNotifications);
    setupSync('lecture_plans', setLecturePlans);

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser]);

  // Manual one-click Database Sync directly from Firebase Firestore
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
        'lecture_plans',
      ];
      await Promise.all(
        collNames.map(async (cName) => {
          const snap = await getDocs(collection(db, cName));
          const docs: any[] = [];
          snap.forEach((d) => {
            docs.push({ id: d.id, ...d.data() });
          });
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
          else if (cName === 'lecture_plans') setLecturePlans(docs);
        })
      );
      setLastSyncTime(new Date().toLocaleTimeString());
      setIsDatabaseSynced(true);
    } catch (err) {
      setIsDatabaseSynced(true);
      handleFirestoreError(err, OperationType.GET, 'database_sync');
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LECTURE_PLANS, JSON.stringify(lecturePlans));
  }, [lecturePlans]);

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

  // Helper for sanitized Firestore persistence so undefined fields never fail silently
  const persistDoc = async (collectionName: string, docId: string, payload: Record<string, unknown>, merge = false) => {
    const clean = stripUndefinedDeep(payload);
    try {
      await setDoc(doc(db, collectionName, docId), clean, merge ? { merge: true } : {});
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      handleFirestoreError(err, merge ? OperationType.UPDATE : OperationType.WRITE, `${collectionName}/${docId}`);
    }
  };

  const removeDoc = async (collectionName: string, docId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  };

  // Student Actions (Saved to Cloud Firestore and shown in ERP UI across logins)
  const addStudent = async (studentData: Omit<Student, 'id'> & { id?: string }) => {
    const newStudent: Student = stripUndefinedDeep({
      ...studentData,
      id: studentData.id || `manual-std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    await persistDoc('students', newStudent.id, {
      ...newStudent,
      createdByUid: firebaseUser?.uid || 'user',
      createdAt: new Date().toISOString(),
    });
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    await removeDoc('students', id);
  };

  const updateStudent = async (updated: Student) => {
    const clean = stripUndefinedDeep(updated);
    setStudents((prev) => prev.map((s) => (s.id === clean.id ? clean : s)));
    await persistDoc('students', clean.id, clean as unknown as Record<string, unknown>, true);
  };

  // Faculty Actions (Saved to Cloud Firestore)
  const addFaculty = async (facultyData: Omit<FacultyMember, 'id'> & { id?: string }) => {
    const facultyYear = new Date().getFullYear();
    const uniqueId =
      facultyData.employeeId && facultyData.employeeId.trim()
        ? facultyData.employeeId.trim()
        : `FAC-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newFaculty: FacultyMember = stripUndefinedDeep({
      ...facultyData,
      id: facultyData.id || `manual-fac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employeeId: uniqueId,
    });
    setFaculty((prev) => [newFaculty, ...prev.filter((f) => f.id !== newFaculty.id)]);
    await persistDoc('faculty', newFaculty.id, {
      ...newFaculty,
      createdByUid: firebaseUser?.uid || 'user',
      createdAt: new Date().toISOString(),
    });
  };

  const deleteFaculty = async (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    await removeDoc('faculty', id);
  };

  const updateFaculty = async (updated: FacultyMember) => {
    const clean = stripUndefinedDeep(updated);
    setFaculty((prev) => prev.map((f) => (f.id === clean.id ? clean : f)));
    await persistDoc('faculty', clean.id, clean as unknown as Record<string, unknown>, true);
  };

  // Admissions Actions (Saved to Cloud Firestore)
  const addAdmission = async (candidateData: Omit<AdmissionCandidate, 'id'> & { id?: string }) => {
    const newCandidate: AdmissionCandidate = stripUndefinedDeep({
      ...candidateData,
      id: candidateData.id || `manual-adm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setAdmissions((prev) => [newCandidate, ...prev.filter((c) => c.id !== newCandidate.id)]);
    await persistDoc('admissions', newCandidate.id, {
      ...newCandidate,
      createdByUid: firebaseUser?.uid || 'user',
    });
  };

  const updateAdmissionStage = async (id: string, stage: AdmissionCandidate['stage']) => {
    setAdmissions((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
    await persistDoc('admissions', id, { stage }, true);
  };

  const deleteAdmission = async (id: string) => {
    setAdmissions((prev) => prev.filter((c) => c.id !== id));
    await removeDoc('admissions', id);
  };

  // Course Actions (Saved to Cloud Firestore)
  const addCourse = async (courseData: Omit<AcademicCourse, 'id'> & { id?: string }) => {
    const newCourse: AcademicCourse = stripUndefinedDeep({
      ...courseData,
      id: courseData.id || `manual-crs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setCourses((prev) => [newCourse, ...prev.filter((c) => c.id !== newCourse.id)]);
    await persistDoc('courses', newCourse.id, {
      ...newCourse,
      createdByUid: firebaseUser?.uid || 'user',
    });
  };

  const deleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    await removeDoc('courses', id);
  };

  // Attendance Actions (Saved to Cloud Firestore)
  const addAttendanceRecord = async (recordData: Omit<AttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: AttendanceRecord = stripUndefinedDeep({
      ...recordData,
      id: recordData.id || `manual-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    await persistDoc('attendance', newRecord.id, newRecord as unknown as Record<string, unknown>);
  };

  const deleteAttendanceRecord = async (id: string) => {
    setAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    await removeDoc('attendance', id);
  };

  const addFacultyAttendanceRecord = async (recordData: Omit<FacultyAttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: FacultyAttendanceRecord = stripUndefinedDeep({
      ...recordData,
      id: recordData.id || `manual-fac-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setFacultyAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    await persistDoc('faculty_attendance', newRecord.id, newRecord as unknown as Record<string, unknown>);
  };

  const deleteFacultyAttendanceRecord = async (id: string) => {
    setFacultyAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    await removeDoc('faculty_attendance', id);
  };

  const addStudentAttendanceRecord = async (recordData: Omit<StudentAttendanceRecord, 'id'> & { id?: string }) => {
    const newRecord: StudentAttendanceRecord = stripUndefinedDeep({
      ...recordData,
      id: recordData.id || `manual-stu-att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setStudentAttendanceRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    await persistDoc('student_attendance', newRecord.id, newRecord as unknown as Record<string, unknown>);
  };

  const deleteStudentAttendanceRecord = async (id: string) => {
    setStudentAttendanceRecords((prev) => prev.filter((r) => r.id !== id));
    await removeDoc('student_attendance', id);
  };

  const addNotification = async (notifData: Omit<AppNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
    const newNotif: AppNotification = stripUndefinedDeep({
      ...notifData,
      id: notifData.id || `manual-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: notifData.timestamp || Date.now(),
      read: notifData.read ?? false,
    });
    setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    await persistDoc('notifications', newNotif.id, newNotif as unknown as Record<string, unknown>);
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await persistDoc('notifications', id, { read: true }, true);
  };

  const clearNotifications = async () => {
    const toDelete = [...notifications];
    setNotifications([]);
    await Promise.all(toDelete.map((n) => removeDoc('notifications', n.id).catch(() => {})));
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

    const record: StudentAttendanceRecord = stripUndefinedDeep({
      id: recordId,
      studentId: student.id,
      studentName: student.name,
      enrollmentNo: student.enrollmentNo,
      avatar: student.avatar,
      department: department || student.department,
      semester: student.semester,
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
    });

    setStudentAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === recordId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    await persistDoc('student_attendance', recordId, record as unknown as Record<string, unknown>);

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
    const newSlot: TimetableSlot = stripUndefinedDeep({
      ...slotData,
      id: slotData.id || `manual-tt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setTimetableSlots((prev) => [newSlot, ...prev.filter((s) => s.id !== newSlot.id)]);
    await persistDoc('timetable', newSlot.id, newSlot as unknown as Record<string, unknown>);
  };

  const deleteTimetableSlot = async (id: string) => {
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
    await removeDoc('timetable', id);
  };

  const updateTimetableSlot = async (id: string, updates: Partial<TimetableSlot>) => {
    const clean = stripUndefinedDeep(updates);
    setTimetableSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...clean } : s))
    );
    await persistDoc('timetable', id, clean as unknown as Record<string, unknown>, true);
  };

  const batchSetTimetableSlots = async (slots: TimetableSlot[]) => {
    const cleaned = slots.map((s) => stripUndefinedDeep(s));
    setTimetableSlots(cleaned);
    for (const slot of cleaned) {
      await persistDoc('timetable', slot.id, slot as unknown as Record<string, unknown>);
    }
  };

  // Exam Actions (Saved to Cloud Firestore)
  const addExam = async (examData: Omit<ExamRecord, 'id'> & { id?: string }) => {
    const newExam: ExamRecord = stripUndefinedDeep({
      ...examData,
      id: examData.id || `manual-exam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setExams((prev) => [newExam, ...prev.filter((e) => e.id !== newExam.id)]);
    await persistDoc('exams', newExam.id, newExam as unknown as Record<string, unknown>);
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
    await persistDoc('exams', id, { hallTicketStatus: nextStatus }, true);
  };

  const deleteExam = async (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
    await removeDoc('exams', id);
  };

  // Result Actions (Saved to Cloud Firestore)
  const addResult = async (resultData: Omit<ResultRecord, 'id'> & { id?: string }) => {
    const newResult: ResultRecord = stripUndefinedDeep({
      ...resultData,
      id: resultData.id || `manual-res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setResults((prev) => [newResult, ...prev.filter((r) => r.id !== newResult.id)]);
    await persistDoc('results', newResult.id, newResult as unknown as Record<string, unknown>);

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
        await persistDoc('students', matchedStudent.id, { cgpa: newResult.cgpa }, true);
      }
    }
  };

  const deleteResult = async (id: string) => {
    setResults((prev) => prev.filter((s) => s.id !== id));
    await removeDoc('results', id);
  };

  // Finance Actions (Saved to Cloud Firestore)
  const addTransaction = async (txnData: Omit<FinancialTransaction, 'id'> & { id?: string }) => {
    const newTxn: FinancialTransaction = stripUndefinedDeep({
      ...txnData,
      id: txnData.id || `manual-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setTransactions((prev) => [newTxn, ...prev.filter((t) => t.id !== newTxn.id)]);
    await persistDoc('transactions', newTxn.id, newTxn as unknown as Record<string, unknown>);
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await removeDoc('transactions', id);
  };

  // Library Actions (Saved to Cloud Firestore)
  const addLibraryItem = async (itemData: Omit<LibraryItem, 'id'> & { id?: string }) => {
    const newItem: LibraryItem = stripUndefinedDeep({
      ...itemData,
      id: itemData.id || `manual-lib-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setLibraryItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    await persistDoc('library', newItem.id, newItem as unknown as Record<string, unknown>);
  };

  const deleteLibraryItem = async (id: string) => {
    setLibraryItems((prev) => prev.filter((i) => i.id !== id));
    await removeDoc('library', id);
  };

  // Hostel Actions (Saved to Cloud Firestore)
  const addHostelRoom = async (room: HostelOccupancy) => {
    const docId = `manual-hostel-${room.block}_${room.roomNo}`.replace(/[\/\s]/g, '_');
    const cleanRoom = stripUndefinedDeep(room);
    setHostelRooms((prev) => [
      cleanRoom,
      ...prev.filter((r) => !(r.block === cleanRoom.block && r.roomNo === cleanRoom.roomNo)),
    ]);
    await persistDoc('hostel', docId, cleanRoom as unknown as Record<string, unknown>);
  };

  const deleteHostelRoom = async (block: string, roomNo: string) => {
    const existing = hostelRooms.find((r) => r.block === block && r.roomNo === roomNo) as (HostelOccupancy & { id?: string }) | undefined;
    const docId = existing?.id || `manual-hostel-${block}_${roomNo}`.replace(/[\/\s]/g, '_');
    setHostelRooms((prev) => prev.filter((r) => !(r.block === block && r.roomNo === roomNo)));
    await removeDoc('hostel', docId);
  };

  // HR Actions (Saved to Cloud Firestore)
  const addEmployee = async (empData: Omit<HREmployee, 'id'> & { id?: string }) => {
    const newEmp: HREmployee = stripUndefinedDeep({
      ...empData,
      id: empData.id || `manual-emp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setEmployees((prev) => [newEmp, ...prev.filter((e) => e.id !== newEmp.id)]);
    await persistDoc('employees', newEmp.id, newEmp as unknown as Record<string, unknown>);
  };

  const deleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    await removeDoc('employees', id);
  };

  // Document Actions (Saved to Cloud Firestore)
  const addDocument = async (docData: Omit<DocumentRecord, 'id'> & { id?: string }) => {
    const newDoc: DocumentRecord = stripUndefinedDeep({
      ...docData,
      id: docData.id || `manual-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      uploadedByUid: firebaseUser?.uid || 'user',
      issuedByRole: docData.issuedByRole || currentUser.role,
      issuedByName: docData.issuedByName || currentUser.name,
    });
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
    await persistDoc('documents', newDoc.id, newDoc as unknown as Record<string, unknown>);
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await removeDoc('documents', id);
  };

  // Announcement Actions (Saved to Cloud Firestore)
  const addAnnouncement = async (annData: Omit<AnnouncementItem, 'id'> & { id?: string }) => {
    const newAnn: AnnouncementItem = stripUndefinedDeep({
      ...annData,
      id: annData.id || `manual-ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
    setAnnouncements((prev) => [newAnn, ...prev.filter((a) => a.id !== newAnn.id)]);
    await persistDoc('announcements', newAnn.id, newAnn as unknown as Record<string, unknown>);
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await removeDoc('announcements', id);
  };

  // Lecture Plan Actions (Faculty-only create/edit/delete; persisted to Firestore)
  const sanitizeFirestoreDoc = (obj: Record<string, unknown>) => stripUndefinedDeep(obj);

  const addLecturePlan = async (
    itemData: Omit<LecturePlanItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
  ): Promise<LecturePlanItem | null> => {
    if (role !== 'Faculty') return null;

    const nowIso = new Date().toISOString();
    const id = itemData.id || `lp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newItem: LecturePlanItem = {
      id,
      serialNo: itemData.serialNo ?? lecturePlans.length + 1,
      date: itemData.date,
      topicName: itemData.topicName.trim(),
      courseCode: itemData.courseCode?.trim() || undefined,
      courseTitle: itemData.courseTitle?.trim() || undefined,
      semester: itemData.semester,
      department: itemData.department?.trim() || currentUser.department || undefined,
      status: itemData.status || 'pending',
      missedReason: itemData.missedReason?.trim() || undefined,
      missedReportedAt: itemData.missedReportedAt || undefined,
      completedAt: itemData.completedAt || undefined,
      facultyUid: itemData.facultyUid || firebaseUser?.uid || undefined,
      facultyName: itemData.facultyName?.trim() || currentUser.name || 'Faculty Member',
      facultyEmail: itemData.facultyEmail?.trim() || currentUser.email || undefined,
      createdAt: itemData.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const cleanPayload = sanitizeFirestoreDoc(newItem as unknown as Record<string, unknown>) as unknown as LecturePlanItem;
    setLecturePlans((prev) => [...prev.filter((p) => p.id !== cleanPayload.id), cleanPayload]);

    try {
      await setDoc(doc(db, 'lecture_plans', cleanPayload.id), cleanPayload);
      return cleanPayload;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lecture_plans/${cleanPayload.id}`);
      return cleanPayload;
    }
  };

  const updateLecturePlan = async (id: string, updates: Partial<LecturePlanItem>): Promise<void> => {
    if (role !== 'Faculty') return;

    const existing = lecturePlans.find((p) => p.id === id);
    if (!existing) return;

    const merged: LecturePlanItem = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt || new Date().toISOString(),
      facultyName: updates.facultyName || existing.facultyName || currentUser.name || 'Faculty Member',
      updatedAt: new Date().toISOString(),
    };

    // Strip optional empty/undefined fields so Firestore rules remain valid
    if (merged.status !== 'missed') {
      delete merged.missedReason;
      delete merged.missedReportedAt;
    }
    if (merged.status !== 'completed') {
      delete merged.completedAt;
    }
    if (!merged.courseCode) delete merged.courseCode;
    if (!merged.courseTitle) delete merged.courseTitle;
    if (!merged.department) delete merged.department;
    if (!merged.facultyEmail) delete merged.facultyEmail;
    if (!merged.facultyUid) delete merged.facultyUid;

    const cleanPayload = sanitizeFirestoreDoc(merged as unknown as Record<string, unknown>) as unknown as LecturePlanItem;
    setLecturePlans((prev) => prev.map((p) => (p.id === id ? cleanPayload : p)));

    try {
      await setDoc(doc(db, 'lecture_plans', id), cleanPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lecture_plans/${id}`);
    }
  };

  const deleteLecturePlan = async (id: string): Promise<void> => {
    if (role !== 'Faculty') return;

    setLecturePlans((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'lecture_plans', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lecture_plans/${id}`);
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
    setLecturePlans([]);
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
        lecturePlans,
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
        addLecturePlan,
        updateLecturePlan,
        deleteLecturePlan,
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
