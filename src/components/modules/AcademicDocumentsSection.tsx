import React, { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Trash2,
  X,
  Upload,
  FileText,
  Filter,
  Paperclip,
  AlertCircle,
  BookOpen,
  UserCheck,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AcademicDocumentFieldType, DocumentRecord } from '../../types';

export const CORE_ACADEMIC_FIELD_TYPES: readonly AcademicDocumentFieldType[] = [
  'Assignment',
  'Syllabus',
  'Notes',
  'Sessional',
  'Year Plan',
] as const;

export const MORE_ACADEMIC_FIELD_TYPES: readonly AcademicDocumentFieldType[] = [
  'Lab Manual',
  'Question Bank',
  'Reference Material',
] as const;

export const ACADEMIC_FIELD_TYPES: readonly AcademicDocumentFieldType[] = [
  ...CORE_ACADEMIC_FIELD_TYPES,
  ...MORE_ACADEMIC_FIELD_TYPES,
] as const;

export type FacultyFieldSelection = 'All' | AcademicDocumentFieldType | 'More';

interface FieldBoxConfig {
  fieldType: AcademicDocumentFieldType;
  boxLabel: string;
  group: 'core' | 'more';
  lightCardClass: string;
  textClass: string;
  dotClass: string;
  placeholderTitle: string;
}

const FIELD_BOX_CONFIGS: FieldBoxConfig[] = [
  {
    fieldType: 'Assignment',
    boxLabel: 'Add assignment',
    group: 'core',
    lightCardClass:
      'bg-[#FEFCE8] hover:bg-[#FEF9C3]/80 border-amber-200/90 hover:border-amber-300 dark:bg-amber-950/20 dark:hover:bg-amber-950/35 dark:border-amber-800/50 dark:hover:border-amber-700/70',
    textClass: 'text-amber-900 dark:text-amber-200',
    dotClass: 'bg-amber-500',
    placeholderTitle: 'e.g. Data Structures Assignment 02',
  },
  {
    fieldType: 'Syllabus',
    boxLabel: 'Add syllabus',
    group: 'core',
    lightCardClass:
      'bg-[#F0F9FF] hover:bg-[#E0F2FE]/80 border-sky-200/90 hover:border-sky-300 dark:bg-sky-950/20 dark:hover:bg-sky-950/35 dark:border-sky-800/50 dark:hover:border-sky-700/70',
    textClass: 'text-sky-900 dark:text-sky-200',
    dotClass: 'bg-sky-500',
    placeholderTitle: 'e.g. CS-301 Operating Systems Syllabus',
  },
  {
    fieldType: 'Notes',
    boxLabel: 'Add notes',
    group: 'core',
    lightCardClass:
      'bg-[#ECFDF5] hover:bg-[#D1FAE5]/75 border-emerald-200/90 hover:border-emerald-300 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35 dark:border-emerald-800/50 dark:hover:border-emerald-700/70',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    dotClass: 'bg-emerald-500',
    placeholderTitle: 'e.g. Unit 3 Neural Networks Lecture Notes',
  },
  {
    fieldType: 'Sessional',
    boxLabel: 'Add sessional',
    group: 'core',
    lightCardClass:
      'bg-[#F5F3FF] hover:bg-[#EDE9FE]/80 border-violet-200/90 hover:border-violet-300 dark:bg-violet-950/20 dark:hover:bg-violet-950/35 dark:border-violet-800/50 dark:hover:border-violet-700/70',
    textClass: 'text-violet-900 dark:text-violet-200',
    dotClass: 'bg-violet-500',
    placeholderTitle: 'e.g. Mid-Term Sessional Question Bank',
  },
  {
    fieldType: 'Year Plan',
    boxLabel: 'Add year plan',
    group: 'core',
    lightCardClass:
      'bg-[#FFF7ED] hover:bg-[#FFEDD5]/80 border-orange-200/90 hover:border-orange-300 dark:bg-orange-950/20 dark:hover:bg-orange-950/35 dark:border-orange-800/50 dark:hover:border-orange-700/70',
    textClass: 'text-orange-900 dark:text-orange-200',
    dotClass: 'bg-orange-500',
    placeholderTitle: 'e.g. 2026-27 Academic Calendar & Year Plan',
  },
  {
    fieldType: 'Lab Manual',
    boxLabel: 'Add lab manual',
    group: 'more',
    lightCardClass:
      'bg-[#F0FDFA] hover:bg-[#CCFBF1]/70 border-teal-200/90 hover:border-teal-300 dark:bg-teal-950/20 dark:hover:bg-teal-950/35 dark:border-teal-800/50 dark:hover:border-teal-700/70',
    textClass: 'text-teal-900 dark:text-teal-200',
    dotClass: 'bg-teal-500',
    placeholderTitle: 'e.g. DBMS SQL & Indexing Lab Manual',
  },
  {
    fieldType: 'Question Bank',
    boxLabel: 'Add question bank',
    group: 'more',
    lightCardClass:
      'bg-[#FFF1F2] hover:bg-[#FFE4E6]/80 border-rose-200/90 hover:border-rose-300 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 dark:border-rose-800/50 dark:hover:border-rose-700/70',
    textClass: 'text-rose-900 dark:text-rose-200',
    dotClass: 'bg-rose-500',
    placeholderTitle: 'e.g. End-Semester Previous Question Bank',
  },
  {
    fieldType: 'Reference Material',
    boxLabel: 'Add reference material',
    group: 'more',
    lightCardClass:
      'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-slate-200 hover:border-slate-300 dark:bg-slate-800/40 dark:hover:bg-slate-800/65 dark:border-slate-700 dark:hover:border-slate-600',
    textClass: 'text-slate-800 dark:text-slate-200',
    dotClass: 'bg-slate-500',
    placeholderTitle: 'e.g. Recommended Reference Textbook Chapters',
  },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Computer Science & AI',
  'Electronics & Robotics',
  'Mechanical & Aerospace',
  'Biomedical Engineering',
  'School of Management',
  'General Academics',
];

const SUGGESTED_SUBJECTS: { code: string; name: string }[] = [
  { code: 'CS-301', name: 'Data Structures & Algorithms' },
  { code: 'CS-302', name: 'Database Management Systems' },
  { code: 'CS-401', name: 'Operating Systems' },
  { code: 'CS-501', name: 'Computer Networks' },
  { code: 'CS-601', name: 'Deep Learning & AI' },
  { code: 'EC-401', name: 'Embedded Systems' },
  { code: 'MA-201', name: 'Engineering Mathematics' },
];

const MAX_ATTACHMENT_BYTES = 700 * 1024; // ~700KB so Base64 stays below Firestore's 1MB doc limit

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const isFacultyUploadedDocument = (docItem: DocumentRecord): boolean => {
  if (docItem.uploadedByRole === 'Faculty') return true;
  if (docItem.uploadedByRole === 'Admin' || docItem.uploadedByRole === 'Student') return false;
  return Boolean(docItem.facultyId) || (docItem.verifiedBy || '').startsWith('Faculty');
};

const getDocumentSubjectKey = (docItem: DocumentRecord): string => {
  const code = (docItem.subjectCode || '').trim().toUpperCase();
  const name = (docItem.subjectName || '').trim();
  if (code && name) return `${code}::${name.toLowerCase()}`;
  if (name) return `NAME::${name.toLowerCase()}`;
  if (code) return `CODE::${code}`;
  return 'UNASSIGNED';
};

const getDocumentSubjectLabel = (docItem: DocumentRecord): string => {
  const code = (docItem.subjectCode || '').trim().toUpperCase();
  const name = (docItem.subjectName || '').trim();
  if (code && name) return `${code} · ${name}`;
  if (name) return name;
  if (code) return code;
  return 'General Subject';
};

export const AcademicDocumentsSection: React.FC = () => {
  const { documents, courses, addDocument, deleteDocument, currentUser, role, firebaseUser } =
    useERP();

  const isStudent = role === 'Student';

  const [selectedFieldOption, setSelectedFieldOption] = useState<FacultyFieldSelection>('All');
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableSubjectChoices = useMemo(() => {
    const map = new Map<string, { key: string; code: string; name: string; label: string }>();

    for (const c of courses) {
      const code = c.code.trim().toUpperCase();
      const name = c.title.trim();
      const key = code && name ? `${code}::${name.toLowerCase()}` : `CODE::${code}`;
      map.set(key, {
        key,
        code,
        name,
        label: code && name ? `${code} · ${name}` : name || code,
      });
    }

    for (const s of SUGGESTED_SUBJECTS) {
      const key = `${s.code}::${s.name.toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          code: s.code,
          name: s.name,
          label: `${s.code} · ${s.name}`,
        });
      }
    }

    return Array.from(map.values());
  }, [courses]);

  const [formState, setFormState] = useState<{
    fieldType: AcademicDocumentFieldType;
    title: string;
    selectedSubjectChoice: string;
    subjectCode: string;
    subjectName: string;
    department: string;
    semester: string;
    dueDate: string;
    academicYear: string;
    description: string;
    fileName?: string;
    fileType?: string;
    fileSizeBytes?: number;
    fileDataUrl?: string;
  }>({
    fieldType: 'Assignment',
    title: '',
    selectedSubjectChoice: '',
    subjectCode: '',
    subjectName: '',
    department: currentUser.department || 'Computer Science & Engineering',
    semester: 'Semester 1',
    dueDate: '',
    academicYear: '2026-27',
    description: '',
  });

  // Base academic documents (Student ONLY sees Faculty-uploaded documents)
  const academicDocuments = useMemo(() => {
    return documents.filter((docItem) => {
      const isAcademic =
        docItem.categoryGroup === 'academic' ||
        (ACADEMIC_FIELD_TYPES as readonly string[]).includes(docItem.type);
      if (!isAcademic) return false;
      if (isStudent) {
        return isFacultyUploadedDocument(docItem);
      }
      return true;
    });
  }, [documents, isStudent]);

  // Subject dropdown options for Student (and Faculty filtering)
  const subjectFilterOptions = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; count: number; code?: string; name?: string }
    >();

    // Populate with subjects that have documents
    for (const docItem of academicDocuments) {
      const key = getDocumentSubjectKey(docItem);
      const label = getDocumentSubjectLabel(docItem);
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          key,
          label,
          count: 1,
          code: docItem.subjectCode,
          name: docItem.subjectName,
        });
      }
    }

    // Also include registered courses in dropdown so students can browse subjects even before docs exist
    for (const course of courses) {
      const code = course.code.trim().toUpperCase();
      const name = course.title.trim();
      const key = code && name ? `${code}::${name.toLowerCase()}` : `CODE::${code}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: code && name ? `${code} · ${name}` : name || code,
          count: 0,
          code,
          name,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [academicDocuments, courses]);

  const countsByType = useMemo(() => {
    const counts: Record<FacultyFieldSelection, number> = {
      All: academicDocuments.length,
      Assignment: 0,
      Syllabus: 0,
      Notes: 0,
      Sessional: 0,
      'Year Plan': 0,
      'Lab Manual': 0,
      'Question Bank': 0,
      'Reference Material': 0,
      More: 0,
    };
    for (const item of academicDocuments) {
      if ((ACADEMIC_FIELD_TYPES as readonly string[]).includes(item.type)) {
        const t = item.type as AcademicDocumentFieldType;
        counts[t] += 1;
        if ((MORE_ACADEMIC_FIELD_TYPES as readonly string[]).includes(t)) {
          counts.More += 1;
        }
      }
    }
    return counts;
  }, [academicDocuments]);

  // Visible rectangular boxes based on Faculty's field selection
  const visibleFieldBoxes = useMemo(() => {
    if (selectedFieldOption === 'All') {
      return FIELD_BOX_CONFIGS;
    }
    if (selectedFieldOption === 'More') {
      return FIELD_BOX_CONFIGS.filter((box) => box.group === 'more');
    }
    return FIELD_BOX_CONFIGS.filter((box) => box.fieldType === selectedFieldOption);
  }, [selectedFieldOption]);

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return academicDocuments.filter((docItem) => {
      // Field type filter
      if (selectedFieldOption === 'More') {
        if (!(MORE_ACADEMIC_FIELD_TYPES as readonly string[]).includes(docItem.type)) {
          return false;
        }
      } else if (selectedFieldOption !== 'All' && docItem.type !== selectedFieldOption) {
        return false;
      }

      // Subject filter (exact subject key OR matching subjectCode/subjectName fallback)
      if (selectedSubjectKey !== 'All') {
        const docKey = getDocumentSubjectKey(docItem);
        const matchesExactKey = docKey === selectedSubjectKey;
        const selectedOption = subjectFilterOptions.find((o) => o.key === selectedSubjectKey);
        const matchesCodeOrName =
          selectedOption &&
          ((selectedOption.code &&
            (docItem.subjectCode || '').trim().toUpperCase() === selectedOption.code) ||
            (selectedOption.name &&
              (docItem.subjectName || '').trim().toLowerCase() ===
                selectedOption.name.toLowerCase()));
        if (!matchesExactKey && !matchesCodeOrName) {
          return false;
        }
      }

      if (!q) return true;
      return (
        docItem.title.toLowerCase().includes(q) ||
        docItem.type.toLowerCase().includes(q) ||
        docItem.requester.toLowerCase().includes(q) ||
        (docItem.facultyName || '').toLowerCase().includes(q) ||
        (docItem.subjectCode || '').toLowerCase().includes(q) ||
        (docItem.subjectName || '').toLowerCase().includes(q) ||
        (docItem.department || '').toLowerCase().includes(q) ||
        (docItem.description || '').toLowerCase().includes(q)
      );
    });
  }, [academicDocuments, selectedFieldOption, selectedSubjectKey, subjectFilterOptions, searchQuery]);

  const openModalForField = (fieldType: AcademicDocumentFieldType) => {
    if (isStudent) return;
    setFormError(null);
    const defaultSubject = availableSubjectChoices[0];
    setFormState({
      fieldType,
      title: '',
      selectedSubjectChoice: defaultSubject ? defaultSubject.key : 'custom',
      subjectCode: defaultSubject ? defaultSubject.code : '',
      subjectName: defaultSubject ? defaultSubject.name : '',
      department: currentUser.department || 'Computer Science & Engineering',
      semester: currentUser.semester ? `Semester ${currentUser.semester}` : 'Semester 1',
      dueDate: '',
      academicYear: '2026-27',
      description: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  const handleSubjectChoiceChange = (choiceKey: string) => {
    if (choiceKey === 'custom') {
      setFormState((prev) => ({
        ...prev,
        selectedSubjectChoice: 'custom',
        subjectCode: '',
        subjectName: '',
      }));
      return;
    }
    const found = availableSubjectChoices.find((s) => s.key === choiceKey);
    if (found) {
      setFormState((prev) => ({
        ...prev,
        selectedSubjectChoice: choiceKey,
        subjectCode: found.code,
        subjectName: found.name,
      }));
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setFormError(
        `Selected file (${formatBytes(file.size)}) exceeds the 700 KB cloud attachment limit. Please choose a smaller file.`
      );
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setFormState((prev) => ({
        ...prev,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        fileDataUrl: dataUrl,
      }));
    };
    reader.onerror = () => {
      setFormError('Could not read the selected file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const clearAttachedFile = () => {
    setFormState((prev) => ({
      ...prev,
      fileName: undefined,
      fileType: undefined,
      fileSizeBytes: undefined,
      fileDataUrl: undefined,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      setFormError('Please enter a document title.');
      return;
    }
    if (!formState.subjectName.trim() && !formState.subjectCode.trim()) {
      setFormError('Please select or enter a subject for students.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const hashSeed = `${Math.random().toString(16).substring(2, 10)}${Math.random()
        .toString(16)
        .substring(2, 6)}`.toUpperCase();

      await addDocument({
        title: formState.title.trim(),
        type: formState.fieldType,
        categoryGroup: 'academic',
        requester: currentUser.name || 'Faculty Member',
        issuedDate: new Date().toISOString().split('T')[0],
        verifiedBy: `${currentUser.role} · ${formState.department}`,
        digitalSealHash: `ACD-${hashSeed}`,
        status: 'Published',
        subjectCode: formState.subjectCode.trim().toUpperCase() || undefined,
        subjectName: formState.subjectName.trim() || undefined,
        department: formState.department || undefined,
        semester: formState.semester.trim() || undefined,
        dueDate: formState.dueDate.trim() || undefined,
        academicYear: formState.academicYear.trim() || undefined,
        description: formState.description.trim() || undefined,
        fileName: formState.fileName,
        fileType: formState.fileType,
        fileSizeBytes: formState.fileSizeBytes,
        fileDataUrl: formState.fileDataUrl,
        uploadedByRole: role,
        facultyName: currentUser.name || undefined,
        facultyId: role === 'Faculty' ? currentUser.idNumber || undefined : undefined,
      });

      setIsModalOpen(false);
    } catch {
      setFormError(
        'Unable to save academic document right now. Please verify your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (docItem: DocumentRecord) => {
    if (docItem.fileDataUrl) {
      const link = document.createElement('a');
      link.href = docItem.fileDataUrl;
      link.download = docItem.fileName || `${docItem.title.replace(/[^a-z0-9-_]+/gi, '_')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const summaryLines = [
      `Title: ${docItem.title}`,
      `Field Type: ${docItem.type}`,
      `Subject: ${getDocumentSubjectLabel(docItem)}`,
      `Department: ${docItem.department || 'N/A'}`,
      `Semester: ${docItem.semester || 'N/A'}`,
      `Academic Year: ${docItem.academicYear || 'N/A'}`,
      `Due Date: ${docItem.dueDate || 'N/A'}`,
      `Uploaded By: ${docItem.facultyName || docItem.requester}${
        docItem.facultyId ? ` (${docItem.facultyId})` : ''
      }`,
      `Date Added: ${docItem.issuedDate}`,
      `Reference ID: ${docItem.digitalSealHash}`,
      '',
      'Description / Notes:',
      docItem.description || 'No description provided.',
    ];
    const blob = new Blob([summaryLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docItem.title.replace(/[^a-z0-9-_]+/gi, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeBoxConfig =
    FIELD_BOX_CONFIGS.find((c) => c.fieldType === formState.fieldType) || FIELD_BOX_CONFIGS[0];

  const canDeleteDocument = (docItem: DocumentRecord) => {
    if (isStudent) return false;
    if (role === 'Admin' || role === 'Faculty') return true;
    return Boolean(firebaseUser?.uid && docItem.uploadedByUid === firebaseUser.uid);
  };

  const selectedFieldTitle =
    selectedFieldOption === 'All'
      ? 'All Fields'
      : selectedFieldOption === 'More'
        ? 'More Academic Materials'
        : selectedFieldOption;

  return (
    <div className="space-y-4">
      {/* Faculty / Admin Field Selector & Rectangular Upload Boxes */}
      {!isStudent && (
        <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Upload Academic Documents for Students
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose a document field below and click its rectangular upload box to publish materials by subject.
              </p>
            </div>

            {/* Field Dropdown Selection */}
            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="faculty-field-select"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
              >
                Select Field:
              </label>
              <select
                id="faculty-field-select"
                value={selectedFieldOption}
                onChange={(e) => setSelectedFieldOption(e.target.value as FacultyFieldSelection)}
                className="w-full sm:w-52 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="All">All Fields ({countsByType.All})</option>
                {CORE_ACADEMIC_FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft} ({countsByType[ft]})
                  </option>
                ))}
                <option value="More">More Materials ({countsByType.More})</option>
                {MORE_ACADEMIC_FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft} ({countsByType[ft]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Field Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            {(
              ['All', ...CORE_ACADEMIC_FIELD_TYPES, 'More'] as const
            ).map((fieldOpt) => {
              const active = selectedFieldOption === fieldOpt;
              return (
                <button
                  key={fieldOpt}
                  type="button"
                  onClick={() => setSelectedFieldOption(fieldOpt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                  }`}
                >
                  {fieldOpt === 'All' ? 'All Fields' : fieldOpt} ({countsByType[fieldOpt]})
                </button>
              );
            })}
          </div>

          {/* Rectangular Box Container Placed Inside the Selected Field */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {selectedFieldTitle} Upload {visibleFieldBoxes.length === 1 ? 'Box' : 'Boxes'}
              </span>
              <span className="text-slate-400 dark:text-slate-500 tabular-nums">
                {visibleFieldBoxes.length}{' '}
                {visibleFieldBoxes.length === 1 ? 'field box' : 'field boxes'}
              </span>
            </div>

            <div
              className={`grid gap-3 ${
                visibleFieldBoxes.length === 1
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : visibleFieldBoxes.length <= 3
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {visibleFieldBoxes.map((box) => (
                <button
                  key={box.fieldType}
                  type="button"
                  onClick={() => openModalForField(box.fieldType)}
                  className={`group relative rounded-2xl border px-4 py-5 min-h-[120px] flex flex-col items-center justify-center gap-2.5 text-center transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand ${box.lightCardClass}`}
                >
                  <span className={`text-sm font-semibold tracking-tight ${box.textClass}`}>
                    {box.boxLabel}
                  </span>
                  <Plus
                    className="w-7 h-7 text-slate-800 dark:text-slate-100 transition-transform duration-150 group-hover:scale-110"
                    strokeWidth={1.75}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar (Student: Prominent Subject Dropdown + Faculty Documents; Faculty/Admin: Subject + Field + Search) */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3.5 md:p-4 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
        {isStudent && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Faculty Study Materials & Uploads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a subject from the dropdown list to view documents uploaded by faculty.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
              {academicDocuments.length} faculty{' '}
              {academicDocuments.length === 1 ? 'document' : 'documents'}
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Subject Dropdown List */}
          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor="subject-filter-select"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap"
            >
              Subject:
            </label>
            <select
              id="subject-filter-select"
              aria-label="Select subject to filter faculty documents"
              value={selectedSubjectKey}
              onChange={(e) => setSelectedSubjectKey(e.target.value)}
              className="w-full md:w-64 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="All">All Subjects ({academicDocuments.length})</option>
              {subjectFilterOptions.map((subjectOpt) => (
                <option key={subjectOpt.key} value={subjectOpt.key}>
                  {subjectOpt.label} ({subjectOpt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                isStudent
                  ? 'Search faculty uploads by title, faculty name, or subject...'
                  : 'Search academic documents by title, subject, department, or faculty...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Field Type Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              aria-label="Filter by academic field type"
              value={selectedFieldOption}
              onChange={(e) => setSelectedFieldOption(e.target.value as FacultyFieldSelection)}
              className="w-full md:w-44 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="All">All Fields ({countsByType.All})</option>
              {ACADEMIC_FIELD_TYPES.map((fieldType) => (
                <option key={fieldType} value={fieldType}>
                  {fieldType} ({countsByType[fieldType]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Field Filter Strip for Students (and quick type filtering) */}
        {isStudent && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {(['All', ...CORE_ACADEMIC_FIELD_TYPES, 'More'] as const).map((fieldOpt) => {
              const active = selectedFieldOption === fieldOpt;
              return (
                <button
                  key={fieldOpt}
                  type="button"
                  onClick={() => setSelectedFieldOption(fieldOpt)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer tabular-nums whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-brand text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                  }`}
                >
                  {fieldOpt === 'All' ? 'All Types' : fieldOpt} ({countsByType[fieldOpt]})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocuments.map((docItem) => {
            const config = FIELD_BOX_CONFIGS.find((c) => c.fieldType === docItem.type);
            const subjectDisplay = getDocumentSubjectLabel(docItem);
            const uploaderName = docItem.facultyName || docItem.requester;
            const metaLine = [subjectDisplay, docItem.semester, docItem.department]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={docItem.id}
                className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-xs flex flex-col justify-between transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          config?.dotClass || 'bg-brand'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {docItem.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                      {docItem.issuedDate}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {docItem.title}
                  </h4>

                  <p className="text-xs font-medium text-brand truncate">{metaLine}</p>

                  {docItem.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {docItem.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Uploaded by: {uploaderName}
                        {docItem.facultyId ? ` · ${docItem.facultyId}` : ''}
                      </span>
                    </div>
                    {docItem.dueDate && (
                      <div className="tabular-nums">Due Date: {docItem.dueDate}</div>
                    )}
                    {docItem.academicYear && (
                      <div className="tabular-nums">Academic Year: {docItem.academicYear}</div>
                    )}
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

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDownload(docItem)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{docItem.fileDataUrl ? 'Download File' : 'Download Summary'}</span>
                  </button>

                  {canDeleteDocument(docItem) && (
                    <div className="flex items-center gap-1">
                      {confirmDeleteId === docItem.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              deleteDocument(docItem.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(docItem.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete Academic Document"
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
        <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-10 text-center shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isStudent
              ? selectedSubjectKey !== 'All'
                ? 'No Faculty Documents for Selected Subject'
                : 'No Faculty Documents Uploaded Yet'
              : selectedFieldOption === 'All'
                ? 'No Academic Documents Found'
                : `No ${selectedFieldTitle} Documents Yet`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {isStudent
              ? searchQuery || selectedSubjectKey !== 'All' || selectedFieldOption !== 'All'
                ? 'Try choosing a different subject from the dropdown or clearing your search filters.'
                : 'Documents uploaded by your faculty members will appear here grouped by subject.'
              : searchQuery
                ? 'Try adjusting your search query or switching the selected field filter.'
                : 'Click any rectangular upload box above to publish a document for students.'}
          </p>
          {!isStudent ? (
            <button
              type="button"
              onClick={() =>
                openModalForField(
                  selectedFieldOption === 'All'
                    ? 'Assignment'
                    : selectedFieldOption === 'More'
                      ? 'Lab Manual'
                      : selectedFieldOption
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add{' '}
                {selectedFieldOption === 'All'
                  ? 'assignment'
                  : selectedFieldOption === 'More'
                    ? 'lab manual'
                    : selectedFieldOption.toLowerCase()}
              </span>
            </button>
          ) : (
            (selectedSubjectKey !== 'All' || selectedFieldOption !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubjectKey('All');
                  setSelectedFieldOption('All');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Subject & Field Filters
              </button>
            )
          )}
        </div>
      )}

      {/* Faculty / Admin Upload Modal */}
      {!isStudent && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-lg w-full p-5 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeBoxConfig.dotClass}`} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Upload {formState.fieldType} for Students
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-lg border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Field Type Switcher inside Modal */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Field
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ACADEMIC_FIELD_TYPES.map((typeOption) => {
                    const selected = formState.fieldType === typeOption;
                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, fieldType: typeOption }))
                        }
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer truncate ${
                          selected
                            ? 'bg-brand text-white border-brand'
                            : 'bg-slate-50 dark:bg-[#16191f] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {typeOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Subject Selection Dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={formState.selectedSubjectChoice}
                    onChange={(e) => handleSubjectChoiceChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {availableSubjectChoices.map((subj) => (
                      <option key={subj.key} value={subj.key}>
                        {subj.label}
                      </option>
                    ))}
                    <option value="custom">Other / Enter Custom Subject...</option>
                  </select>
                </div>

                {formState.selectedSubjectChoice === 'custom' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Custom Subject Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CS-301"
                        value={formState.subjectCode}
                        onChange={(e) =>
                          setFormState({ ...formState, subjectCode: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Custom Subject Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Compiler Design"
                        value={formState.subjectName}
                        onChange={(e) =>
                          setFormState({ ...formState, subjectName: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={activeBoxConfig.placeholderTitle}
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={formState.semester}
                    onChange={(e) => setFormState({ ...formState, semester: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={`Semester ${sem}`}>
                        Semester {sem}
                      </option>
                    ))}
                    <option value="All Semesters">All Semesters</option>
                  </select>
                </div>

                {formState.fieldType === 'Assignment' || formState.fieldType === 'Sessional' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Due / Exam Date
                    </label>
                    <input
                      type="date"
                      value={formState.dueDate}
                      onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-27"
                      value={formState.academicYear}
                      onChange={(e) =>
                        setFormState({ ...formState, academicYear: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formState.department}
                    onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add brief instructions, unit coverage, or submission guidelines for students..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>

                {/* File Upload Input */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attachment (Optional, max 700 KB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  {formState.fileName ? (
                    <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#16191f]">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-brand shrink-0" />
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate">
                          {formState.fileName}
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                          {formatBytes(formState.fileSizeBytes)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={clearAttachedFile}
                        className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-[#16191f]/70 hover:bg-slate-100 dark:hover:bg-slate-800/70 text-xs text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-brand" />
                      <span>Click to attach PDF, DOC, PPT, or image</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                >
                  {isSubmitting ? 'Uploading...' : `Upload ${formState.fieldType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
