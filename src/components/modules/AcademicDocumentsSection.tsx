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
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AcademicDocumentFieldType, DocumentRecord } from '../../types';

export const ACADEMIC_FIELD_TYPES: readonly AcademicDocumentFieldType[] = [
  'Assignment',
  'Syllabus',
  'Notes',
  'Sessional',
  'Year Plan',
] as const;

interface FieldBoxConfig {
  fieldType: AcademicDocumentFieldType;
  boxLabel: string;
  lightCardClass: string;
  textClass: string;
  dotClass: string;
  placeholderTitle: string;
}

const FIELD_BOX_CONFIGS: FieldBoxConfig[] = [
  {
    fieldType: 'Assignment',
    boxLabel: 'Add assignment',
    lightCardClass:
      'bg-[#FEFCE8] hover:bg-[#FEF9C3]/80 border-amber-200/90 hover:border-amber-300 dark:bg-amber-950/20 dark:hover:bg-amber-950/35 dark:border-amber-800/50 dark:hover:border-amber-700/70',
    textClass: 'text-amber-900 dark:text-amber-200',
    dotClass: 'bg-amber-500',
    placeholderTitle: 'e.g. Data Structures Assignment 02',
  },
  {
    fieldType: 'Syllabus',
    boxLabel: 'Add syllabus',
    lightCardClass:
      'bg-[#F0F9FF] hover:bg-[#E0F2FE]/80 border-sky-200/90 hover:border-sky-300 dark:bg-sky-950/20 dark:hover:bg-sky-950/35 dark:border-sky-800/50 dark:hover:border-sky-700/70',
    textClass: 'text-sky-900 dark:text-sky-200',
    dotClass: 'bg-sky-500',
    placeholderTitle: 'e.g. CS-301 Operating Systems Syllabus',
  },
  {
    fieldType: 'Notes',
    boxLabel: 'Add notes',
    lightCardClass:
      'bg-[#ECFDF5] hover:bg-[#D1FAE5]/75 border-emerald-200/90 hover:border-emerald-300 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/35 dark:border-emerald-800/50 dark:hover:border-emerald-700/70',
    textClass: 'text-emerald-900 dark:text-emerald-200',
    dotClass: 'bg-emerald-500',
    placeholderTitle: 'e.g. Unit 3 Neural Networks Lecture Notes',
  },
  {
    fieldType: 'Sessional',
    boxLabel: 'Add sessional',
    lightCardClass:
      'bg-[#F5F3FF] hover:bg-[#EDE9FE]/80 border-violet-200/90 hover:border-violet-300 dark:bg-violet-950/20 dark:hover:bg-violet-950/35 dark:border-violet-800/50 dark:hover:border-violet-700/70',
    textClass: 'text-violet-900 dark:text-violet-200',
    dotClass: 'bg-violet-500',
    placeholderTitle: 'e.g. Mid-Term Sessional Question Bank',
  },
  {
    fieldType: 'Year Plan',
    boxLabel: 'Add year plan',
    lightCardClass:
      'bg-[#FFF7ED] hover:bg-[#FFEDD5]/80 border-orange-200/90 hover:border-orange-300 dark:bg-orange-950/20 dark:hover:bg-orange-950/35 dark:border-orange-800/50 dark:hover:border-orange-700/70',
    textClass: 'text-orange-900 dark:text-orange-200',
    dotClass: 'bg-orange-500',
    placeholderTitle: 'e.g. 2026-27 Academic Calendar & Year Plan',
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

const MAX_ATTACHMENT_BYTES = 700 * 1024; // ~700KB so Base64 stays comfortably below Firestore's 1MB limit

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const AcademicDocumentsSection: React.FC = () => {
  const { documents, addDocument, deleteDocument, currentUser, role, firebaseUser } = useERP();

  const [selectedFieldType, setSelectedFieldType] = useState<'All' | AcademicDocumentFieldType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<{
    fieldType: AcademicDocumentFieldType;
    title: string;
    subjectCode: string;
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
    subjectCode: '',
    department: currentUser.department || 'Computer Science & Engineering',
    semester: 'Semester 1',
    dueDate: '',
    academicYear: '2026-27',
    description: '',
  });

  const academicDocuments = useMemo(() => {
    return documents.filter(
      (docItem) =>
        docItem.categoryGroup === 'academic' ||
        (ACADEMIC_FIELD_TYPES as readonly string[]).includes(docItem.type)
    );
  }, [documents]);

  const countsByType = useMemo(() => {
    const counts: Record<'All' | AcademicDocumentFieldType, number> = {
      All: academicDocuments.length,
      Assignment: 0,
      Syllabus: 0,
      Notes: 0,
      Sessional: 0,
      'Year Plan': 0,
    };
    for (const item of academicDocuments) {
      if ((ACADEMIC_FIELD_TYPES as readonly string[]).includes(item.type)) {
        counts[item.type as AcademicDocumentFieldType] += 1;
      }
    }
    return counts;
  }, [academicDocuments]);

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return academicDocuments.filter((docItem) => {
      const matchesType = selectedFieldType === 'All' || docItem.type === selectedFieldType;
      if (!matchesType) return false;
      if (!q) return true;
      return (
        docItem.title.toLowerCase().includes(q) ||
        docItem.type.toLowerCase().includes(q) ||
        docItem.requester.toLowerCase().includes(q) ||
        (docItem.subjectCode || '').toLowerCase().includes(q) ||
        (docItem.department || '').toLowerCase().includes(q) ||
        (docItem.description || '').toLowerCase().includes(q)
      );
    });
  }, [academicDocuments, selectedFieldType, searchQuery]);

  const openModalForField = (fieldType: AcademicDocumentFieldType) => {
    setFormError(null);
    setFormState({
      fieldType,
      title: '',
      subjectCode: '',
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
        requester: currentUser.name || 'Campus Member',
        issuedDate: new Date().toISOString().split('T')[0],
        verifiedBy: `${currentUser.role} · ${formState.department}`,
        digitalSealHash: `ACD-${hashSeed}`,
        status: 'Published',
        subjectCode: formState.subjectCode.trim().toUpperCase() || undefined,
        department: formState.department || undefined,
        semester: formState.semester.trim() || undefined,
        dueDate: formState.dueDate.trim() || undefined,
        academicYear: formState.academicYear.trim() || undefined,
        description: formState.description.trim() || undefined,
        fileName: formState.fileName,
        fileType: formState.fileType,
        fileSizeBytes: formState.fileSizeBytes,
        fileDataUrl: formState.fileDataUrl,
      });

      setIsModalOpen(false);
    } catch {
      setFormError('Unable to save academic document right now. Please verify your connection and try again.');
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
      `Subject Code: ${docItem.subjectCode || 'N/A'}`,
      `Department: ${docItem.department || 'N/A'}`,
      `Semester: ${docItem.semester || 'N/A'}`,
      `Academic Year: ${docItem.academicYear || 'N/A'}`,
      `Due Date: ${docItem.dueDate || 'N/A'}`,
      `Added By: ${docItem.requester}`,
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
    if (role === 'Admin' || role === 'Faculty') return true;
    return Boolean(firebaseUser?.uid && docItem.uploadedByUid === firebaseUser.uid);
  };

  return (
    <div className="space-y-4">
      {/* Five Rectangular Light-Shade Add Boxes */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Document Academics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a category box below to upload or add an assignment, syllabus, notes, sessional, or year plan.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
            {academicDocuments.length} {academicDocuments.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FIELD_BOX_CONFIGS.map((box) => {
            const isActiveFilter = selectedFieldType === box.fieldType;
            return (
              <button
                key={box.fieldType}
                type="button"
                onClick={() => openModalForField(box.fieldType)}
                className={`group relative rounded-2xl border px-4 py-5 min-h-[120px] flex flex-col items-center justify-center gap-2.5 text-center transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand ${box.lightCardClass} ${
                  isActiveFilter ? 'ring-2 ring-brand/50 shadow-sm' : ''
                }`}
              >
                <span className={`text-sm font-semibold tracking-tight ${box.textClass}`}>
                  {box.boxLabel}
                </span>
                <Plus
                  className="w-7 h-7 text-slate-800 dark:text-slate-100 transition-transform duration-150 group-hover:scale-110"
                  strokeWidth={1.75}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Field Type Filter & Search Bar */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search academic documents by title, subject code, department, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Synchronized Field Type Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              aria-label="Filter by academic field type"
              value={selectedFieldType}
              onChange={(e) =>
                setSelectedFieldType(e.target.value as 'All' | AcademicDocumentFieldType)
              }
              className="w-full md:w-48 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="All">All Field Types ({countsByType.All})</option>
              {ACADEMIC_FIELD_TYPES.map((fieldType) => (
                <option key={fieldType} value={fieldType}>
                  {fieldType} ({countsByType[fieldType]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Field Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          {(['All', ...ACADEMIC_FIELD_TYPES] as const).map((fieldOption) => {
            const active = selectedFieldType === fieldOption;
            return (
              <button
                key={fieldOption}
                type="button"
                onClick={() => setSelectedFieldType(fieldOption)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer tabular-nums ${
                  active
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {fieldOption} ({countsByType[fieldOption]})
              </button>
            );
          })}
        </div>
      </div>

      {/* Academic Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocuments.map((docItem) => {
            const config = FIELD_BOX_CONFIGS.find((c) => c.fieldType === docItem.type);
            const metadataParts = [
              docItem.subjectCode,
              docItem.semester,
              docItem.department,
            ].filter(Boolean);

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

                  {metadataParts.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {metadataParts.join(' · ')}
                    </p>
                  )}

                  {docItem.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {docItem.description}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                    <div>Added by: {docItem.requester}</div>
                    {docItem.dueDate && (
                      <div className="tabular-nums">Due Date: {docItem.dueDate}</div>
                    )}
                    {docItem.academicYear && (
                      <div className="tabular-nums">Academic Year: {docItem.academicYear}</div>
                    )}
                    {docItem.fileName && (
                      <div className="flex items-center gap-1 text-brand font-medium pt-0.5 truncate">
                        <Paperclip className="w-3 h-3 shrink-0" />
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
            {selectedFieldType === 'All'
              ? 'No Academic Documents Found'
              : `No ${selectedFieldType} Documents Yet`}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'Try adjusting your search query or switching the selected field type filter.'
              : 'Use any of the five category boxes above or click below to upload a new academic record.'}
          </p>
          <button
            type="button"
            onClick={() =>
              openModalForField(selectedFieldType === 'All' ? 'Assignment' : selectedFieldType)
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              Add {selectedFieldType === 'All' ? 'assignment' : selectedFieldType.toLowerCase()}
            </span>
          </button>
        </div>
      )}

      {/* Add Academic Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-lg w-full p-5 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeBoxConfig.dotClass}`} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Add {formState.fieldType}
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
                  Field Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ACADEMIC_FIELD_TYPES.map((typeOption) => {
                    const selected = formState.fieldType === typeOption;
                    return (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() =>
                          setFormState((prev) => ({ ...prev, fieldType: typeOption }))
                        }
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
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
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Title *
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
                    Subject / Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-301"
                    value={formState.subjectCode}
                    onChange={(e) => setFormState({ ...formState, subjectCode: e.target.value })}
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

                <div>
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
                    Description / Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add brief instructions, unit coverage, or submission guidelines..."
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
                  {isSubmitting ? 'Saving...' : `Save ${formState.fieldType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
