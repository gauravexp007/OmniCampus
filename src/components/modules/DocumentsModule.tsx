import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  Trash2,
  Download,
  X,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { DocumentRecord } from '../../types';

export const DocumentsModule: React.FC = () => {
  const { documents, addDocument, deleteDocument, role } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New document state
  const [newDoc, setNewDoc] = useState<{
    title: string;
    type: DocumentRecord['type'];
    requester: string;
    status: DocumentRecord['status'];
  }>({
    title: '',
    type: 'Bonafide Letter',
    requester: '',
    status: 'Issued & Blockchain Verified',
  });

  const docTypes: DocumentRecord['type'][] = [
    'Official Transcript',
    'Degree Certificate',
    'NOC / Migration',
    'Bonafide Letter',
    'Accreditation Dossier',
  ];

  const filteredDocuments = documents.filter((d) => {
    return (
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title.trim() || !newDoc.requester.trim()) return;

    addDocument({
      title: newDoc.title.trim(),
      type: newDoc.type,
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

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              {role === 'Student'
                ? 'My Issued Certificates & Documents'
                : 'Official Document Vault & Seals'}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {documents.length} {documents.length === 1 ? 'Document' : 'Documents'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'Student'
              ? 'Download official certified documents, bonafide letters, and transcripts.'
              : 'Issue digitally signed degree certificates, transcripts, and verified letters.'}
          </p>
        </div>

        {role !== 'Student' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Document</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, student name, or document type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-brand text-slate-800"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-light text-brand">
                    {doc.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    {doc.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs mb-1">{doc.title}</h4>
                <p className="text-[11px] text-slate-600">Issued to: {doc.requester}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-2 truncate">
                  Seal Hash: {doc.digitalSealHash}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Date: {doc.issuedDate}</p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => alert(`Downloading verified copy of ${doc.title}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                {role === 'Admin' && (
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
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
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {role === 'Student'
              ? 'No certificates or documents have been issued to your profile yet.'
              : 'There are no official certificates registered in the vault.'}
          </p>
          {role !== 'Student' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Issue First Document</span>
            </button>
          )}
        </div>
      )}

      {/* Issue Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Issue Official Document</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Bonafide Study Certificate"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={newDoc.type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, type: e.target.value as DocumentRecord['type'] })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {docTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Requester / Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={newDoc.requester}
                    onChange={(e) => setNewDoc({ ...newDoc, requester: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold"
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
