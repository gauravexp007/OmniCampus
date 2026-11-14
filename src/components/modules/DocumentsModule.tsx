import React, { useMemo, useState } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  Trash2,
  Download,
  X,
  BookOpen,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { DocumentRecord, OfficialDocumentType } from '../../types';
import {
  AcademicDocumentsSection,
  ACADEMIC_FIELD_TYPES,
} from './AcademicDocumentsSection';

export const DocumentsModule: React.FC = () => {
  const { documents, addDocument, deleteDocument, role } = useERP();
  const [activeTab, setActiveTab] = useState<'academic' | 'official'>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New official document state
  const [newDoc, setNewDoc] = useState<{
    title: string;
    type: OfficialDocumentType;
    requester: string;
    status: DocumentRecord['status'];
  }>({
    title: '',
    type: 'Bonafide Letter',
    requester: '',
    status: 'Issued & Blockchain Verified',
  });

  const docTypes: OfficialDocumentType[] = [
    'Official Transcript',
    'Degree Certificate',
    'NOC / Migration',
    'Bonafide Letter',
    'Accreditation Dossier',
  ];

  const officialDocuments = useMemo(() => {
    return documents.filter(
      (d) =>
        d.categoryGroup !== 'academic' &&
        !(ACADEMIC_FIELD_TYPES as readonly string[]).includes(d.type)
    );
  }, [documents]);

  const academicCount = useMemo(() => {
    return documents.filter((d) => {
      const isAcademic =
        d.categoryGroup === 'academic' ||
        (ACADEMIC_FIELD_TYPES as readonly string[]).includes(d.type);
      if (!isAcademic) return false;
      if (role === 'Student') {
        if (d.uploadedByRole === 'Faculty') return true;
        if (d.uploadedByRole === 'Admin' || d.uploadedByRole === 'Student') return false;
        return Boolean(d.facultyId) || (d.verifiedBy || '').startsWith('Faculty');
      }
      return true;
    }).length;
  }, [documents, role]);

  const filteredOfficialDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return officialDocuments.filter((d) => {
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.requester.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    });
  }, [officialDocuments, searchQuery]);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.requester.trim()) return;

    await addDocument({
      title: newDoc.title.trim(),
      type: newDoc.type,
      categoryGroup: 'official',
      requester: newDoc.requester.trim(),
      issuedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Office of Registrar',
      digitalSealHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random()
        .toString(16)
        .substring(2, 10)
        .toUpperCase()}`,
      status: newDoc.status,
    });

    setIsAddModalOpen(false);
    setNewDoc({
      title: '',
      type: 'Bonafide Letter',
      requester: '',
      status: 'Issued & Blockchain Verified',
    });
  };

  const handleDownloadOfficial = (docItem: DocumentRecord) => {
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
      `Official Campus Document Certificate`,
      `Title: ${docItem.title}`,
      `Document Type: ${docItem.type}`,
      `Issued To: ${docItem.requester}`,
      `Issued Date: ${docItem.issuedDate}`,
      `Verified By: ${docItem.verifiedBy}`,
      `Status: ${docItem.status}`,
      `Digital Seal Hash: ${docItem.digitalSealHash}`,
    ].join('\n');

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

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header with Section Switcher */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'academic'
                ? 'Document Academics'
                : role === 'Student'
                  ? 'My Issued Certificates & Documents'
                  : 'Official Document Vault & Seals'}
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              · {activeTab === 'academic' ? academicCount : officialDocuments.length}{' '}
              {(activeTab === 'academic' ? academicCount : officialDocuments.length) === 1
                ? 'Document'
                : 'Documents'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeTab === 'academic'
              ? 'Manage and filter assignments, syllabi, lecture notes, sessionals, and academic year plans.'
              : role === 'Student'
                ? 'Download official certified documents, bonafide letters, and transcripts.'
                : 'Issue digitally signed degree certificates, transcripts, and verified letters.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sub-section Tabs */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-[#16191f] p-1 border border-slate-200/80 dark:border-slate-700/70">
            <button
              type="button"
              onClick={() => setActiveTab('academic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'academic'
                  ? 'bg-white dark:bg-[#272c35] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academic Documents</span>
              <span className="text-[11px] text-slate-400 tabular-nums">({academicCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('official')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'official'
                  ? 'bg-white dark:bg-[#272c35] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Official Vault</span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                ({officialDocuments.length})
              </span>
            </button>
          </div>

          {activeTab === 'official' && role !== 'Student' && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'academic' ? (
        <AcademicDocumentsSection />
      ) : (
        <>
          {/* Search Bar */}
          <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 border border-slate-200 dark:border-slate-700/60 shadow-xs flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, student name, or document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Official Documents Grid */}
          {filteredOfficialDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredOfficialDocuments.map((docItem) => (
                <div
                  key={docItem.id}
                  className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
                      <span className="font-semibold text-brand truncate">{docItem.type}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">
                        {docItem.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">
                      {docItem.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Issued to: {docItem.requester}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-2 truncate">
                      Seal Hash: {docItem.digitalSealHash}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                      Date: {docItem.issuedDate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleDownloadOfficial(docItem)}
                      className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    {role === 'Admin' && (
                      <button
                        type="button"
                        onClick={() => deleteDocument(docItem.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Clean Minimalist Empty State */
            <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700/60 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                No Official Documents Found
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                {role === 'Student'
                  ? 'No certificates or documents have been issued to your profile yet.'
                  : 'There are no official certificates registered in the vault.'}
              </p>
              {role !== 'Student' && (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue First Document</span>
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Issue Official Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e2229] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Issue Official Document
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Bonafide Study Certificate"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={newDoc.type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, type: e.target.value as OfficialDocumentType })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  >
                    {docTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requester / Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={newDoc.requester}
                    onChange={(e) => setNewDoc({ ...newDoc, requester: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold cursor-pointer"
                >
                  Issue Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
