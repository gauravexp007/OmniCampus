import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCheck2,
  Trash2,
  Download,
  Search,
  X,
  File,
  HardDrive,
  AlertCircle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';

const MAX_ATTACHMENT_BYTES = 700 * 1024; // ~700 KB so Base64 stays below Firestore 1 MB limit

export const UserFilesModule: React.FC = () => {
  const { userFiles, uploadUserFile, deleteUserFile, currentUser, firebaseUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [category, setCategory] = useState('Photograph');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = [
    'Photograph',
    'Marksheets & Certificates',
    'ID & Identity Proof',
    'Medical / Leave Document',
    'Other Personal Document',
  ];

  // Strict owner-only filter in UI matching Firestore rules
  const myFiles = useMemo(() => {
    const uid = firebaseUser?.uid;
    const email = (currentUser.email || '').trim().toLowerCase();
    return userFiles.filter((f) => {
      if (f.uploadedByUid && uid) {
        return f.uploadedByUid === uid;
      }
      if (!f.uploadedByUid && email && f.uploaderEmail) {
        return f.uploaderEmail.trim().toLowerCase() === email;
      }
      return false;
    });
  }, [userFiles, firebaseUser?.uid, currentUser.email]);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError('File size exceeds 700 KB limit. Please choose a smaller file.');
      setSelectedFile(null);
      setFileBase64(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadError(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setUploadError('File size exceeds 700 KB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !fileBase64) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await uploadUserFile({
        name: selectedFile.name,
        title: title.trim() || selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        sizeBytes: selectedFile.size,
        dataUrl: fileBase64,
        category,
      });

      setIsUploadModalOpen(false);
      setTitle('');
      setSelectedFile(null);
      setFileBase64(null);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = myFiles.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      f.name.toLowerCase().includes(q) ||
      (f.title && f.title.toLowerCase().includes(q)) ||
      f.category.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    if (fileType.includes('sheet') || fileType.includes('csv') || fileType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    return <File className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Personal Cloud Storage
          </h2>
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-light text-brand tabular-nums">
            {myFiles.length} {myFiles.length === 1 ? 'File' : 'Files'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start lg:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Personal File</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row lg:flex-wrap items-stretch lg:items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search personal files by title, file name, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer',
                selectedCategory === cat
                  ? 'bg-brand text-white font-semibold shadow-2xs'
                  : 'bg-slate-50 dark:bg-[#16191f] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFiles.map((file) => {
            const isImage = file.fileType.startsWith('image/');
            return (
              <div
                key={file.id}
                className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-xs flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-[#16191f] border border-slate-100 dark:border-slate-700/70 shrink-0 flex items-center justify-center overflow-hidden">
                        {isImage && file.dataUrl ? (
                          <img
                            src={file.dataUrl}
                            alt={file.title || file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getFileIcon(file.fileType)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate"
                          title={file.title || file.name}
                        >
                          {file.title || file.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium block truncate">
                          {formatFileSize(file.sizeBytes)} · {file.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#16191f] rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400">File Name:</span>
                      <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Upload Date:</span>
                      <span className="tabular-nums">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={file.dataUrl}
                    download={file.name}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:opacity-80 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>

                  <div className="flex items-center gap-1">
                    {confirmDeleteId === file.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            deleteUserFile(file.id);
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
                        onClick={() => setConfirmDeleteId(file.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete uploaded file"
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
        /* Empty State */
        <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <HardDrive className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            No Personal Files Uploaded Yet
          </h3>
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setIsUploadModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First File</span>
          </button>
        </div>
      )}

      {/* Upload File Right-Side Portal Modal */}
      {typeof document !== 'undefined' &&
        isUploadModalOpen &&
        createPortal(
          <div
            onClick={() => setIsUploadModalOpen(false)}
            className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-end p-3 sm:p-5 md:pl-[270px]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-y-auto p-5 space-y-4 animate-in fade-in slide-in-from-right-4 duration-150"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-light text-brand">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Upload Personal File
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Passport Photo / Semester Marksheet"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drag & Drop Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Choose File (Max 700 KB)
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50 dark:bg-[#16191f] hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      selectedFile
                        ? 'border-brand bg-brand-light/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                    onClick={() => document.getElementById('user-file-input')?.click()}
                  >
                    <input
                      type="file"
                      id="user-file-input"
                      className="hidden"
                      onChange={handleFileSelection}
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Upload
                        className={cn(
                          'w-6 h-6',
                          selectedFile ? 'text-brand' : 'text-slate-400'
                        )}
                      />
                      {selectedFile ? (
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            Click to browse or drag and drop
                          </p>
                          <p className="text-[11px] text-slate-400">
                            PDF, PNG, JPG, DOCX up to 700 KB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isUploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'Uploading...' : 'Save Personal File'}</span>
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
