import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCheck2,
  Trash2,
  Download,
  Search,
  Plus,
  X,
  File,
  HardDrive,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { UserUploadedFile } from '../../types';
import { cn } from '../../lib/utils';

export const UserFilesModule: React.FC = () => {
  const { userFiles, uploadUserFile, deleteUserFile, currentUser, firebaseUser } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [category, setCategory] = useState('Assignments & Coursework');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const categories = [
    'Assignments & Coursework',
    'ID & Identity Verification',
    'Medical & Leave Certificates',
    'Financial Receipts & Challans',
    'Project Source & Reports',
    'Other Documents',
  ];

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 5MB for Firestore document stability
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller file.');
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

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller file.');
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
        fileType: selectedFile.type || 'application/octet-stream',
        sizeBytes: selectedFile.size,
        dataUrl: fileBase64,
        category: category,
      });

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setFileBase64(null);
    } catch (err: unknown) {
      console.error('Upload Error:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = userFiles.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.uploaderName && f.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <FileCheck2 className="w-5 h-5 text-emerald-600" />;
    if (fileType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-600" />;
    if (fileType.includes('sheet') || fileType.includes('csv') || fileType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-teal-600" />;
    return <File className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Cloud Storage & Uploaded Data</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-brand-light text-brand">
              {userFiles.length} {userFiles.length === 1 ? 'File' : 'Files'} Stored
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store documents, assignment submissions, verification certificates, and receipts in Firebase Firestore.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:opacity-90 text-white text-xs font-semibold transition-colors shadow-xs shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File to Cloud</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by file name, category, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', ...categories.slice(0, 3)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                selectedCategory === cat
                  ? 'bg-brand text-white font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
            const isOwner = file.uploadedByUid === firebaseUser?.uid || currentUser.role === 'Admin';
            return (
              <div
                key={file.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatFileSize(file.sizeBytes)} • {file.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Uploaded By:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                        {file.uploaderName || 'User'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Upload Date:</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <a
                    href={file.dataUrl}
                    download={file.name}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:opacity-80 transition-opacity"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>

                  {isOwner && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${file.name}?`)) {
                          deleteUserFile(file.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete uploaded file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <HardDrive className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Files Uploaded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Upload student records, course files, scanned ID cards, or tuition payment receipts to cloud storage.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:opacity-90 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload First File</span>
          </button>
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-light text-brand">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upload to Firebase Firestore</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Choose File (Max 5MB)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer bg-slate-50/50 hover:bg-slate-50',
                    selectedFile ? 'border-brand bg-brand-light/10' : 'border-slate-200 hover:border-slate-300'
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
                    <Upload className={cn('w-6 h-6', selectedFile ? 'text-brand' : 'text-slate-400')} />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-400">PDF, PNG, JPG, DOCX, CSV up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? 'Uploading...' : 'Save to Firestore'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
