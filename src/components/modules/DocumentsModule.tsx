import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileCheck2,
  Search,
  Plus,
  Trash2,
  Download,
  X,
  Upload,
  FileText,
  File,
  Image as ImageIcon,
  Paperclip,
  AlertCircle,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import {
  DocumentRecord,
  FacultyIssuedDocumentType,
  OfficialDocumentType,
  StudentIssuedDocumentType,
  UserUploadedFile,
} from '../../types';
import { ACADEMIC_FIELD_TYPES } from './AcademicDocumentsSection';

const PERSONAL_CATEGORIES = [
  'Photograph',
  'Marksheets & Certificates',
  'ID & Identity Proof',
  'Medical / Leave Document',
  'Other Personal Document',
] as const;

const STUDENT_ISSUED_TYPES: readonly StudentIssuedDocumentType[] = [
  'Admit Card',
  'Registration Form',
  'Official Transcript',
  'Degree Certificate',
  'NOC / Migration',
  'Bonafide Letter',
] as const;

const FACULTY_ISSUED_TYPES: readonly FacultyIssuedDocumentType[] = [
  'Salary Notice',
  'Feedback Form',
  'Empty Registration Form',
  'Complaint Form',
  'Accreditation Dossier',
  'Official Notice / Form',
] as const;

const MAX_ATTACHMENT_BYTES = 700 * 1024; // ~700 KB so Base64 stays below Firestore 1 MB limit

type VaultFilterTab =
  | 'all'
  | 'personal'
  | 'issued'
  | 'issued_by_admin'
  | 'issued_to_students'
  | 'issued_to_faculty';

type TargetAudienceOption =
  | 'All Students'
  | 'Specific Student'
  | 'All Faculty'
  | 'Specific Faculty';

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const normalizeStr = (val?: string) => (val || '').trim().toLowerCase();

export const DocumentsModule: React.FC = () => {
  const {
    documents,
    userFiles,
    students,
    faculty,
    currentUser,
    firebaseUser,
    role,
    addDocument,
    deleteDocument,
    uploadUserFile,
    deleteUserFile,
  } = useERP();

  const [activeFilter, setActiveFilter] = useState<VaultFilterTab>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [personalCategoryFilter, setPersonalCategoryFilter] = useState<string>('All');
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // Personal Upload Modal state
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [personalTitle, setPersonalTitle] = useState('');
  const [personalCategory, setPersonalCategory] = useState<string>(PERSONAL_CATEGORIES[0]);
  const [personalFile, setPersonalFile] = useState<File | null>(null);
  const [personalDataUrl, setPersonalDataUrl] = useState<string | null>(null);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [isUploadingPersonal, setIsUploadingPersonal] = useState(false);
  const personalFileInputRef = useRef<HTMLInputElement>(null);

  // Issue Document Modal state (Admin & Faculty)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const issueFileInputRef = useRef<HTMLInputElement>(null);

  const defaultAudience: TargetAudienceOption =
    role === 'Admin' ? 'All Faculty' : 'All Students';

  const [issueForm, setIssueForm] = useState<{
    title: string;
    targetAudience: TargetAudienceOption;
    type: OfficialDocumentType;
    semester: string;
    selectedRecipientKey: string;
    manualRecipientName: string;
    description: string;
    fileName?: string;
    fileType?: string;
    fileSizeBytes?: number;
    fileDataUrl?: string;
  }>({
    title: '',
    targetAudience: defaultAudience,
    type: role === 'Admin' ? 'Salary Notice' : 'Admit Card',
    semester: 'All Semesters',
    selectedRecipientKey: '',
    manualRecipientName: '',
    description: '',
  });

  // 1. Strictly user-scoped Personal Uploaded Documents
  const myPersonalFiles = useMemo(() => {
    const uid = firebaseUser?.uid;
    const email = normalizeStr(currentUser.email);
    return userFiles.filter((f) => {
      if (f.uploadedByUid && uid) {
        return f.uploadedByUid === uid;
      }
      if (!f.uploadedByUid && email && f.uploaderEmail) {
        return normalizeStr(f.uploaderEmail) === email;
      }
      return false;
    });
  }, [userFiles, firebaseUser?.uid, currentUser.email]);

  // Helper: Check if a document is non-academic vault document
  const nonAcademicDocuments = useMemo(() => {
    return documents.filter(
      (d) =>
        d.categoryGroup !== 'academic' &&
        !(ACADEMIC_FIELD_TYPES as readonly string[]).includes(d.type)
    );
  }, [documents]);

  // Resolve logged-in student's semester from user profile or student master roster
  const resolvedStudentSemester = useMemo(() => {
    if (currentUser.semester) return Number(currentUser.semester);
    const myEmail = normalizeStr(currentUser.email);
    const myId = normalizeStr(currentUser.idNumber);
    const matched = students.find(
      (s) =>
        (myEmail && normalizeStr(s.email) === myEmail) ||
        (myId && normalizeStr(s.enrollmentNo) === myId)
    );
    return matched?.semester;
  }, [currentUser.semester, currentUser.email, currentUser.idNumber, students]);

  // Recipient Matchers
  const matchesStudentRecipient = (docItem: DocumentRecord): boolean => {
    if (docItem.targetAudience === 'All Students') {
      if (docItem.semester && docItem.semester !== 'All Semesters' && resolvedStudentSemester) {
        return normalizeStr(docItem.semester) === `semester ${resolvedStudentSemester}`;
      }
      return true;
    }
    const uid = firebaseUser?.uid;
    const myEmail = normalizeStr(currentUser.email);
    const myId = normalizeStr(currentUser.idNumber);
    const myName = normalizeStr(currentUser.name);

    if (docItem.targetAudience === 'Specific Student') {
      if (uid && docItem.targetRecipientUid === uid) return true;
      if (myEmail && normalizeStr(docItem.targetRecipientEmail) === myEmail) return true;
      if (myId && normalizeStr(docItem.targetRecipientId) === myId) return true;
      if (myName && normalizeStr(docItem.requester) === myName) return true;
      return false;
    }

    // Legacy fallback if targetAudience is not set
    const req = normalizeStr(docItem.requester);
    if (!req || req === 'all students') {
      if (docItem.semester && docItem.semester !== 'All Semesters' && resolvedStudentSemester) {
        return normalizeStr(docItem.semester) === `semester ${resolvedStudentSemester}`;
      }
      return true;
    }
    if (uid && docItem.targetRecipientUid === uid) return true;
    if (myName && req === myName) return true;
    if (myId && req === myId) return true;
    if (myEmail && req === myEmail) return true;
    return false;
  };

  const matchesFacultyRecipient = (docItem: DocumentRecord): boolean => {
    if (docItem.targetAudience === 'All Faculty') return true;
    const uid = firebaseUser?.uid;
    const myEmail = normalizeStr(currentUser.email);
    const myId = normalizeStr(currentUser.idNumber);
    const myName = normalizeStr(currentUser.name);

    if (docItem.targetAudience === 'Specific Faculty') {
      if (uid && docItem.targetRecipientUid === uid) return true;
      if (myEmail && normalizeStr(docItem.targetRecipientEmail) === myEmail) return true;
      if (myId && normalizeStr(docItem.targetRecipientId) === myId) return true;
      if (myName && normalizeStr(docItem.requester) === myName) return true;
      return false;
    }

    // Legacy fallback for Faculty document types without explicit targetAudience
    const req = normalizeStr(docItem.requester);
    if (req === 'all faculty') return true;
    if (myName && req === myName) return true;
    if (myId && req === myId) return true;
    if (myEmail && req === myEmail) return true;
    return false;
  };

  // 2. Role-isolated Issued Document lists
  const studentIssuedDocs = useMemo(() => {
    return nonAcademicDocuments.filter((d) => {
      if (d.targetAudience === 'All Faculty' || d.targetAudience === 'Specific Faculty') {
        return false;
      }
      if ((FACULTY_ISSUED_TYPES as readonly string[]).includes(d.type)) {
        return false;
      }
      const validIssuer =
        d.issuedByRole === 'Admin' || d.issuedByRole === 'Faculty' || !d.issuedByRole;
      if (!validIssuer) return false;
      return matchesStudentRecipient(d);
    });
  }, [
    nonAcademicDocuments,
    firebaseUser?.uid,
    currentUser.email,
    currentUser.idNumber,
    currentUser.name,
    resolvedStudentSemester,
  ]);

  const facultyAdminIssuedDocs = useMemo(() => {
    return nonAcademicDocuments.filter((d) => {
      const issuedByAdmin = d.issuedByRole === 'Admin' || !d.issuedByRole;
      if (!issuedByAdmin) return false;
      const isForFaculty =
        d.targetAudience === 'All Faculty' ||
        d.targetAudience === 'Specific Faculty' ||
        (FACULTY_ISSUED_TYPES as readonly string[]).includes(d.type);
      if (!isForFaculty) return false;
      return matchesFacultyRecipient(d);
    });
  }, [nonAcademicDocuments, firebaseUser?.uid, currentUser.email, currentUser.idNumber, currentUser.name]);

  const facultyIssuedToStudentsDocs = useMemo(() => {
    return nonAcademicDocuments.filter((d) => {
      const isStudentTarget =
        d.targetAudience === 'All Students' ||
        d.targetAudience === 'Specific Student' ||
        (STUDENT_ISSUED_TYPES as readonly string[]).includes(d.type);
      if (!isStudentTarget) return false;
      if (d.targetAudience === 'All Faculty' || d.targetAudience === 'Specific Faculty') {
        return false;
      }
      return d.uploadedByUid === firebaseUser?.uid || d.issuedByRole === 'Faculty';
    });
  }, [nonAcademicDocuments, firebaseUser?.uid]);

  const adminStudentIssuedDocs = useMemo(() => {
    return nonAcademicDocuments.filter(
      (d) =>
        d.targetAudience === 'All Students' ||
        d.targetAudience === 'Specific Student' ||
        (STUDENT_ISSUED_TYPES as readonly string[]).includes(d.type) ||
        (!d.targetAudience && !(FACULTY_ISSUED_TYPES as readonly string[]).includes(d.type))
    );
  }, [nonAcademicDocuments]);

  const adminFacultyIssuedDocs = useMemo(() => {
    return nonAcademicDocuments.filter(
      (d) =>
        d.targetAudience === 'All Faculty' ||
        d.targetAudience === 'Specific Faculty' ||
        (FACULTY_ISSUED_TYPES as readonly string[]).includes(d.type)
    );
  }, [nonAcademicDocuments]);

  // Visible Issued Docs based on active role & filter
  const visibleIssuedDocs = useMemo(() => {
    if (activeFilter === 'personal') return [];

    let list: DocumentRecord[] = [];
    if (role === 'Student') {
      list = studentIssuedDocs;
    } else if (role === 'Faculty') {
      if (activeFilter === 'issued_to_students') {
        list = facultyIssuedToStudentsDocs;
      } else {
        // Default 'all' and 'issued_by_admin' show Admin-issued Faculty documents only
        list = facultyAdminIssuedDocs;
      }
    } else {
      // Admin
      if (activeFilter === 'issued_to_faculty') {
        list = adminFacultyIssuedDocs;
      } else if (activeFilter === 'issued_to_students') {
        list = adminStudentIssuedDocs;
      } else {
        list = nonAcademicDocuments;
      }
    }

    const q = normalizeStr(searchQuery);
    return list.filter((d) => {
      if (semesterFilter !== 'All') {
        const docSem = d.semester || 'All Semesters';
        if (docSem !== semesterFilter) return false;
      }
      if (!q) return true;
      return (
        normalizeStr(d.title).includes(q) ||
        normalizeStr(d.type).includes(q) ||
        normalizeStr(d.requester).includes(q) ||
        normalizeStr(d.issuedByName).includes(q) ||
        normalizeStr(d.semester).includes(q) ||
        normalizeStr(d.description).includes(q)
      );
    });
  }, [
    activeFilter,
    semesterFilter,
    role,
    studentIssuedDocs,
    facultyAdminIssuedDocs,
    facultyIssuedToStudentsDocs,
    adminFacultyIssuedDocs,
    adminStudentIssuedDocs,
    nonAcademicDocuments,
    searchQuery,
  ]);

  // Visible Personal Uploads based on active filter
  const visiblePersonalFiles = useMemo(() => {
    if (
      activeFilter === 'issued' ||
      activeFilter === 'issued_by_admin' ||
      activeFilter === 'issued_to_students' ||
      activeFilter === 'issued_to_faculty'
    ) {
      return [];
    }

    const q = normalizeStr(searchQuery);
    return myPersonalFiles.filter((f) => {
      if (personalCategoryFilter !== 'All' && f.category !== personalCategoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        normalizeStr(f.title).includes(q) ||
        normalizeStr(f.name).includes(q) ||
        normalizeStr(f.category).includes(q)
      );
    });
  }, [activeFilter, myPersonalFiles, personalCategoryFilter, searchQuery]);

  const vaultTotalCount = useMemo(() => {
    if (role === 'Student') return myPersonalFiles.length + studentIssuedDocs.length;
    if (role === 'Faculty') return myPersonalFiles.length + facultyAdminIssuedDocs.length;
    return myPersonalFiles.length + nonAcademicDocuments.length;
  }, [role, myPersonalFiles.length, studentIssuedDocs.length, facultyAdminIssuedDocs.length, nonAcademicDocuments.length]);

  // Personal File Upload handlers
  const handlePersonalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setPersonalError(
        `File (${formatBytes(file.size)}) exceeds the 700 KB cloud vault limit. Please choose a smaller file.`
      );
      e.target.value = '';
      setPersonalFile(null);
      setPersonalDataUrl(null);
      return;
    }

    setPersonalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPersonalDataUrl(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.onerror = () => {
      setPersonalError('Failed to read the selected file.');
    };
    reader.readAsDataURL(file);
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalFile || !personalDataUrl) {
      setPersonalError('Please choose a file to upload.');
      return;
    }

    setIsUploadingPersonal(true);
    setPersonalError(null);
    try {
      await uploadUserFile({
        name: personalFile.name,
        title: personalTitle.trim() || personalFile.name,
        fileType: personalFile.type || 'application/octet-stream',
        sizeBytes: personalFile.size,
        dataUrl: personalDataUrl,
        category: personalCategory,
      });
      setIsPersonalModalOpen(false);
      setPersonalTitle('');
      setPersonalCategory(PERSONAL_CATEGORIES[0]);
      setPersonalFile(null);
      setPersonalDataUrl(null);
      if (personalFileInputRef.current) personalFileInputRef.current.value = '';
    } catch (err: unknown) {
      setPersonalError(err instanceof Error ? err.message : 'Unable to upload personal document.');
    } finally {
      setIsUploadingPersonal(false);
    }
  };

  // Issue Document Modal helpers
  const openIssueModal = () => {
    const initialAudience: TargetAudienceOption =
      role === 'Admin' ? 'All Faculty' : 'All Students';
    const initialType: OfficialDocumentType =
      initialAudience === 'All Faculty' ? FACULTY_ISSUED_TYPES[0] : STUDENT_ISSUED_TYPES[0];
    setIssueError(null);
    setIssueForm({
      title: '',
      targetAudience: initialAudience,
      type: initialType,
      semester: 'All Semesters',
      selectedRecipientKey: '',
      manualRecipientName: '',
      description: '',
    });
    if (issueFileInputRef.current) issueFileInputRef.current.value = '';
    setIsIssueModalOpen(true);
  };

  const handleAudienceChange = (nextAudience: TargetAudienceOption) => {
    const isFacultyTarget =
      nextAudience === 'All Faculty' || nextAudience === 'Specific Faculty';
    const nextTypeList = isFacultyTarget ? FACULTY_ISSUED_TYPES : STUDENT_ISSUED_TYPES;
    const keepType = (nextTypeList as readonly string[]).includes(issueForm.type);
    setIssueForm((prev) => ({
      ...prev,
      targetAudience: nextAudience,
      type: keepType ? prev.type : nextTypeList[0],
      semester: isFacultyTarget ? 'All Semesters' : prev.semester,
      selectedRecipientKey: '',
      manualRecipientName: '',
    }));
  };

  // Students filtered by selected semester inside the Issue Document modal
  const issueModalFilteredStudents = useMemo(() => {
    if (issueForm.semester === 'All Semesters') return students;
    return students.filter((s) => `Semester ${s.semester}` === issueForm.semester);
  }, [students, issueForm.semester]);

  const handleIssueFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssueError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setIssueError(
        `Attachment (${formatBytes(file.size)}) exceeds the 700 KB limit. Please choose a smaller file.`
      );
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIssueForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        fileDataUrl: typeof reader.result === 'string' ? reader.result : undefined,
      }));
    };
    reader.onerror = () => {
      setIssueError('Failed to read the attached file.');
    };
    reader.readAsDataURL(file);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.title.trim()) {
      setIssueError('Please enter a document title.');
      return;
    }

    let requesterLabel =
      issueForm.targetAudience === 'All Faculty' ? 'All Faculty' : 'All Students';
    let targetRecipientId: string | undefined;
    let targetRecipientEmail: string | undefined;

    if (issueForm.targetAudience === 'Specific Student') {
      const foundStudent = students.find((s) => s.id === issueForm.selectedRecipientKey);
      if (foundStudent) {
        requesterLabel = foundStudent.name;
        targetRecipientId = foundStudent.enrollmentNo;
        targetRecipientEmail = foundStudent.email;
      } else if (issueForm.manualRecipientName.trim()) {
        requesterLabel = issueForm.manualRecipientName.trim();
      } else {
        setIssueError('Please select a student or enter the student name/ID.');
        return;
      }
    } else if (issueForm.targetAudience === 'Specific Faculty') {
      const foundFaculty = faculty.find((f) => f.id === issueForm.selectedRecipientKey);
      if (foundFaculty) {
        requesterLabel = foundFaculty.name;
        targetRecipientId = foundFaculty.employeeId;
        targetRecipientEmail = foundFaculty.email;
      } else if (issueForm.manualRecipientName.trim()) {
        requesterLabel = issueForm.manualRecipientName.trim();
      } else {
        setIssueError('Please select a faculty member or enter their name/ID.');
        return;
      }
    }

    setIsSubmittingIssue(true);
    setIssueError(null);
    try {
      const hashSeed = `${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 6)}`.toUpperCase();

      const resolvedSemester =
        issueForm.targetAudience === 'Specific Student'
          ? (() => {
              const found = students.find((s) => s.id === issueForm.selectedRecipientKey);
              return found ? `Semester ${found.semester}` : issueForm.semester;
            })()
          : issueForm.targetAudience === 'All Students'
            ? issueForm.semester
            : undefined;

      await addDocument({
        title: issueForm.title.trim(),
        type: issueForm.type,
        categoryGroup: 'official',
        requester: requesterLabel,
        issuedDate: new Date().toISOString().split('T')[0],
        verifiedBy: role === 'Admin' ? 'Office of Administration' : `Faculty · ${currentUser.name}`,
        digitalSealHash: `0x${hashSeed}`,
        status: 'Issued & Blockchain Verified',
        targetAudience: issueForm.targetAudience,
        targetRecipientId,
        targetRecipientEmail,
        semester: resolvedSemester,
        issuedByRole: role,
        issuedByName: currentUser.name,
        description: issueForm.description.trim() || undefined,
        fileName: issueForm.fileName,
        fileType: issueForm.fileType,
        fileSizeBytes: issueForm.fileSizeBytes,
        fileDataUrl: issueForm.fileDataUrl,
      });

      setIsIssueModalOpen(false);
    } catch (err: unknown) {
      setIssueError(err instanceof Error ? err.message : 'Unable to issue document.');
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleDownloadPersonal = (file: UserUploadedFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadIssued = (docItem: DocumentRecord) => {
    if (docItem.fileDataUrl) {
      const link = document.createElement('a');
      link.href = docItem.fileDataUrl;
      link.download = docItem.fileName || `${docItem.title.replace(/[^a-z0-9-_]+/gi, '_')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const content = [
      `Official Campus Document`,
      `Title: ${docItem.title}`,
      `Document Type: ${docItem.type}`,
      `Target Audience: ${docItem.targetAudience || 'Individual'}`,
      `Issued To: ${docItem.requester}`,
      `Issued By: ${docItem.issuedByName || docItem.verifiedBy}`,
      `Issued Date: ${docItem.issuedDate}`,
      `Status: ${docItem.status}`,
      `Reference Seal: ${docItem.digitalSealHash}`,
      docItem.description ? `\nNotes:\n${docItem.description}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docItem.title.replace(/[^a-z0-9-_]+/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPersonalFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    return <File className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  };

  const canDeleteIssuedDoc = (docItem: DocumentRecord) => {
    if (role === 'Admin') return true;
    if (role === 'Faculty') {
      return (
        docItem.issuedByRole === 'Faculty' &&
        (docItem.uploadedByUid === firebaseUser?.uid ||
          normalizeStr(docItem.issuedByName) === normalizeStr(currentUser.name))
      );
    }
    return false;
  };

  const filterTabs: { id: VaultFilterTab; label: string; count: number }[] = useMemo(() => {
    if (role === 'Student') {
      return [
        { id: 'all', label: 'All Vault', count: myPersonalFiles.length + studentIssuedDocs.length },
        { id: 'personal', label: 'My Uploads', count: myPersonalFiles.length },
        { id: 'issued', label: 'Issued Documents', count: studentIssuedDocs.length },
      ];
    }
    if (role === 'Faculty') {
      return [
        {
          id: 'all',
          label: 'All Vault',
          count: myPersonalFiles.length + facultyAdminIssuedDocs.length,
        },
        { id: 'personal', label: 'My Uploads', count: myPersonalFiles.length },
        { id: 'issued_by_admin', label: 'Issued by Admin', count: facultyAdminIssuedDocs.length },
        {
          id: 'issued_to_students',
          label: 'Issued to Students',
          count: facultyIssuedToStudentsDocs.length,
        },
      ];
    }
    return [
      { id: 'all', label: 'All Vault', count: myPersonalFiles.length + nonAcademicDocuments.length },
      { id: 'personal', label: 'My Uploads', count: myPersonalFiles.length },
      { id: 'issued_to_faculty', label: 'Issued to Faculty', count: adminFacultyIssuedDocs.length },
      { id: 'issued_to_students', label: 'Issued to Students', count: adminStudentIssuedDocs.length },
    ];
  }, [
    role,
    myPersonalFiles.length,
    studentIssuedDocs.length,
    facultyAdminIssuedDocs.length,
    facultyIssuedToStudentsDocs.length,
    nonAcademicDocuments.length,
    adminFacultyIssuedDocs.length,
    adminStudentIssuedDocs.length,
  ]);

  const showPersonalSection =
    activeFilter === 'all' || activeFilter === 'personal';

  const showIssuedSection = activeFilter !== 'personal';

  const activeIssueTypeList =
    issueForm.targetAudience === 'All Faculty' || issueForm.targetAudience === 'Specific Faculty'
      ? FACULTY_ISSUED_TYPES
      : STUDENT_ISSUED_TYPES;

  const isTargetFaculty =
    issueForm.targetAudience === 'All Faculty' || issueForm.targetAudience === 'Specific Faculty';

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Document Vault
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            · {vaultTotalCount} {vaultTotalCount === 1 ? 'Document' : 'Documents'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPersonalError(null);
              setIsPersonalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Personal Document</span>
          </button>

          {role !== 'Student' && (
            <button
              type="button"
              onClick={openIssueModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{role === 'Faculty' ? 'Issue to Student' : 'Issue Document'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 md:p-3.5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap ${
                  active
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#16191f] text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {showIssuedSection && (
            <select
              aria-label="Filter issued documents by semester"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={`Semester ${sem}`}>
                  Semester {sem}
                </option>
              ))}
            </select>
          )}

          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personal or issued documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Personal Uploaded Documents (Strictly User-Scoped) */}
      {showPersonalSection && (
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                My Personal Documents
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                ({visiblePersonalFiles.length})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['All', ...PERSONAL_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPersonalCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    personalCategoryFilter === cat
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-[#1e2229] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {visiblePersonalFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {visiblePersonalFiles.map((file) => {
                const isImage = file.fileType.startsWith('image/');
                const deleteKey = `personal-${file.id}`;
                return (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#16191f] border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-center shrink-0 overflow-hidden">
                            {isImage && file.dataUrl ? (
                              <img
                                src={file.dataUrl}
                                alt={file.title || file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getPersonalFileIcon(file.fileType)
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4
                              className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate"
                              title={file.title || file.name}
                            >
                              {file.title || file.name}
                            </h4>
                            <p className="text-[11px] font-medium text-brand truncate">
                              {file.category}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                          {formatBytes(file.sizeBytes)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                        <div className="truncate">File: {file.name}</div>
                        <div className="tabular-nums">
                          Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleDownloadPersonal(file)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {confirmDeleteKey === deleteKey ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                deleteUserFile(file.id);
                                setConfirmDeleteKey(null);
                              }}
                              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(null)}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteKey(deleteKey)}
                            className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            title="Delete Personal Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-8 text-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                No Personal Documents Uploaded
              </h4>
              <button
                type="button"
                onClick={() => {
                  setPersonalError(null);
                  setIsPersonalModalOpen(true);
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photograph, Marksheet, or ID</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Section 2: Role-Scoped Issued Documents */}
      {showIssuedSection && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {role === 'Student'
                  ? 'Issued Documents (Admit Cards, Forms & Certificates)'
                  : role === 'Faculty'
                    ? activeFilter === 'issued_to_students'
                      ? 'Documents Issued to Students'
                      : 'Admin Issued Documents (Salary Notices, Forms & Notices)'
                    : activeFilter === 'issued_to_faculty'
                      ? 'Documents Issued to Faculty'
                      : activeFilter === 'issued_to_students'
                        ? 'Documents Issued to Students'
                        : 'All Issued Documents'}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                ({visibleIssuedDocs.length})
              </span>
            </div>
          </div>

          {visibleIssuedDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {visibleIssuedDocs.map((docItem) => {
                const deleteKey = `issued-${docItem.id}`;
                return (
                  <div
                    key={docItem.id}
                    className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-brand truncate">{docItem.type}</span>
                        <span className="text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                          {docItem.issuedDate}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                        {docItem.title}
                      </h4>

                      {docItem.description && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                          {docItem.description}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Users className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            Issued to: {docItem.requester}
                            {docItem.targetAudience ? ` (${docItem.targetAudience})` : ''}
                          </span>
                        </div>
                        {docItem.semester && (
                          <div className="font-semibold text-brand truncate">
                            Semester: {docItem.semester}
                          </div>
                        )}
                        <div className="truncate">
                          Issued by: {docItem.issuedByName || docItem.verifiedBy}
                          {docItem.issuedByRole ? ` · ${docItem.issuedByRole}` : ''}
                        </div>
                        {docItem.fileName && (
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium pt-0.5 truncate">
                            <Paperclip className="w-3 h-3 text-brand shrink-0" />
                            <span className="truncate">{docItem.fileName}</span>
                            {docItem.fileSizeBytes ? (
                              <span className="text-slate-400 tabular-nums shrink-0">
                                ({formatBytes(docItem.fileSizeBytes)})
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleDownloadIssued(docItem)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{docItem.fileDataUrl ? 'Download File' : 'Download'}</span>
                      </button>

                      {canDeleteIssuedDoc(docItem) && (
                        <div className="flex items-center gap-1">
                          {confirmDeleteKey === deleteKey ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteDocument(docItem.id);
                                  setConfirmDeleteKey(null);
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKey(null)}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKey(deleteKey)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                              title="Delete Issued Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-8 text-center shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {role === 'Student'
                  ? 'No Issued Documents for Your Profile'
                  : role === 'Faculty' && activeFilter !== 'issued_to_students'
                    ? 'No Faculty Documents Issued by Admin'
                    : 'No Issued Documents Found'}
              </h4>
              {role !== 'Student' && (
                <button
                  type="button"
                  onClick={openIssueModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{role === 'Faculty' ? 'Issue Document to Student' : 'Issue Document'}</span>
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* Modal 1: Upload Personal Document (Right-Side Portal) */}
      {typeof document !== 'undefined' &&
        isPersonalModalOpen &&
        createPortal(
          <div
            onClick={() => setIsPersonalModalOpen(false)}
            className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-end p-3 sm:p-5 md:pl-[270px]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-y-auto p-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upload Personal Document
                </h3>
                <button
                  type="button"
                  onClick={() => setIsPersonalModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {personalError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{personalError}</span>
                </div>
              )}

              <form onSubmit={handlePersonalSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Passport Photograph / Semester 4 Marksheet"
                    value={personalTitle}
                    onChange={(e) => setPersonalTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={personalCategory}
                    onChange={(e) => setPersonalCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {PERSONAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select File * (Max 700 KB)
                  </label>
                  <div
                    onClick={() => personalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand rounded-xl p-4 text-center cursor-pointer bg-slate-50/70 dark:bg-[#16191f] transition-colors"
                  >
                    <input
                      ref={personalFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handlePersonalFileSelect}
                    />
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1.5" />
                    {personalFile ? (
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {personalFile.name} ({formatBytes(personalFile.size)})
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Click to choose JPG, PNG, PDF, or DOCX (max 700 KB)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPersonalModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!personalFile || isUploadingPersonal}
                    className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isUploadingPersonal ? 'Uploading...' : 'Save to My Vault'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 2: Issue Document (Admin -> Faculty/Student, Faculty -> Student Only) */}
      {typeof document !== 'undefined' &&
        isIssueModalOpen &&
        role !== 'Student' &&
        createPortal(
          <div
            onClick={() => setIsIssueModalOpen(false)}
            className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-end p-3 sm:p-5 md:pl-[270px]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-lg w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-y-auto p-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {role === 'Faculty' ? 'Issue Document to Student' : 'Issue Official Document'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {issueError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{issueError}</span>
                </div>
              )}

              <form onSubmit={handleIssueSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Audience
                    </label>
                    <select
                      value={issueForm.targetAudience}
                      onChange={(e) =>
                        handleAudienceChange(e.target.value as TargetAudienceOption)
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                    >
                      {role === 'Admin' && (
                        <>
                          <option value="All Faculty">All Faculty</option>
                          <option value="Specific Faculty">Specific Faculty</option>
                        </>
                      )}
                      <option value="All Students">All Students</option>
                      <option value="Specific Student">Specific Student</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Document Type
                    </label>
                    <select
                      value={issueForm.type}
                      onChange={(e) =>
                        setIssueForm({ ...issueForm, type: e.target.value as OfficialDocumentType })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                    >
                      {activeIssueTypeList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!isTargetFaculty && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Choose Semester {issueForm.targetAudience === 'Specific Student' ? '(filters student list below)' : ''}
                      </label>
                      <select
                        value={issueForm.semester}
                        onChange={(e) =>
                          setIssueForm({
                            ...issueForm,
                            semester: e.target.value,
                            selectedRecipientKey: '',
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 cursor-pointer"
                      >
                        <option value="All Semesters">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={`Semester ${sem}`}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {issueForm.targetAudience === 'Specific Student' && (
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Select Student
                      </label>
                      {issueModalFilteredStudents.length > 0 ? (
                        <select
                          value={issueForm.selectedRecipientKey}
                          onChange={(e) =>
                            setIssueForm({ ...issueForm, selectedRecipientKey: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                        >
                          <option value="">
                            -- Choose registered student ({issueModalFilteredStudents.length}) --
                          </option>
                          {issueModalFilteredStudents.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.enrollmentNo}) · Sem {s.semester}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          No registered students found for {issueForm.semester}. Switch semester or enter student details manually below.
                        </p>
                      )}
                      {!issueForm.selectedRecipientKey && (
                        <input
                          type="text"
                          placeholder="Or enter student name, enrollment no, or email"
                          value={issueForm.manualRecipientName}
                          onChange={(e) =>
                            setIssueForm({ ...issueForm, manualRecipientName: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                        />
                      )}
                    </div>
                  )}

                  {issueForm.targetAudience === 'Specific Faculty' && (
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Select Faculty Member
                      </label>
                      {faculty.length > 0 && (
                        <select
                          value={issueForm.selectedRecipientKey}
                          onChange={(e) =>
                            setIssueForm({ ...issueForm, selectedRecipientKey: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                        >
                          <option value="">-- Choose registered faculty --</option>
                          {faculty.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.employeeId})
                            </option>
                          ))}
                        </select>
                      )}
                      {!issueForm.selectedRecipientKey && (
                        <input
                          type="text"
                          placeholder="Or enter faculty name, employee ID, or email"
                          value={issueForm.manualRecipientName}
                          onChange={(e) =>
                            setIssueForm({ ...issueForm, manualRecipientName: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                        />
                      )}
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        isTargetFaculty
                          ? 'e.g. Monthly Salary Notice - October / Faculty Feedback Form'
                          : 'e.g. End-Semester Admit Card / Registration Form'
                      }
                      value={issueForm.title}
                      onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Optional instructions or circular notes..."
                      value={issueForm.description}
                      onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Attach File (Optional, Max 700 KB)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => issueFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16191f] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span>{issueForm.fileName ? 'Replace Attachment' : 'Choose File'}</span>
                      </button>
                      {issueForm.fileName && (
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                          {issueForm.fileName} ({formatBytes(issueForm.fileSizeBytes)})
                        </span>
                      )}
                      <input
                        ref={issueFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleIssueFileSelect}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingIssue}
                    className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingIssue ? 'Issuing...' : 'Issue Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
