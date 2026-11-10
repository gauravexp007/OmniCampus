import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Trash2,
  X,
  Eye,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AdmissionCandidate } from '../../types';

export const AdmissionsModule: React.FC = () => {
  const { admissions, addAdmission, updateAdmissionStage, deleteAdmission, role } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState<AdmissionCandidate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New applicant form state
  const [newApplicant, setNewApplicant] = useState({
    candidateName: '',
    email: '',
    phone: '',
    programApplied: 'B.Tech in Artificial Intelligence',
    stage: 'Applied' as AdmissionCandidate['stage'],
    entranceScore: 92,
  });

  const stages: AdmissionCandidate['stage'][] = [
    'Applied',
    'Reviewing',
    'Interview Scheduled',
    'Offered',
    'Enrolled',
  ];

  const filteredCandidates = admissions.filter((c) => {
    const matchesQuery =
      c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.programApplied.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = selectedStage === 'All' || c.stage === selectedStage;
    return matchesQuery && matchesStage;
  });

  const handleAddApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.candidateName.trim()) return;

    addAdmission({
      applicationNo: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateName: newApplicant.candidateName.trim(),
      email:
        newApplicant.email.trim() ||
        `${newApplicant.candidateName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      phone: newApplicant.phone.trim() || '+1 (555) 234-5678',
      programApplied: newApplicant.programApplied,
      appliedDate: new Date().toISOString().split('T')[0],
      stage: newApplicant.stage,
      entranceScore: Number(newApplicant.entranceScore) || 90,
      documentsVerified: false,
      assignedCounselor: 'Admissions Office',
    });

    setIsAddModalOpen(false);
    setNewApplicant({
      candidateName: '',
      email: '',
      phone: '',
      programApplied: 'B.Tech in Artificial Intelligence',
      stage: 'Applied',
      entranceScore: 92,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Admissions Pipeline</h2>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {admissions.length} {admissions.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track prospective student applications, interviews, entrance scores, and offer letters.
          </p>
        </div>

        {role === 'Admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by candidate name, application ID, or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            aria-label="Filter by stage"
            className="w-full sm:w-48 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-700"
          >
            <option value="All">All Stages</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applicants List / Table */}
      {filteredCandidates.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">App ID</th>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Program Applied</th>
                  <th className="px-4 py-3">Entrance Score</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Applied Date</th>
                  {role === 'Admin' && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-indigo-600">
                      {cand.applicationNo}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{cand.candidateName}</p>
                      <p className="text-[10px] text-slate-400">{cand.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{cand.programApplied}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{cand.entranceScore}%</td>
                    <td className="px-4 py-3">
                      {role === 'Admin' ? (
                        <select
                          value={cand.stage}
                          onChange={(e) =>
                            updateAdmissionStage(
                              cand.id,
                              e.target.value as AdmissionCandidate['stage']
                            )
                          }
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-800"
                        >
                          {stages.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {cand.stage}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{cand.appliedDate}</td>
                    {role === 'Admin' && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAdmission(cand.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Applicant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Clean Minimalist Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Admission Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || selectedStage !== 'All'
              ? 'No applicants match your active search criteria.'
              : 'There are currently no admission applications in the pipeline.'}
          </p>
          {role === 'Admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Application</span>
            </button>
          )}
        </div>
      )}

      {/* Add Applicant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">New Admission Application</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddApplicant} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Applicant Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={newApplicant.candidateName}
                    onChange={(e) =>
                      setNewApplicant({ ...newApplicant, candidateName: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="applicant@email.com"
                    value={newApplicant.email}
                    onChange={(e) =>
                      setNewApplicant({ ...newApplicant, email: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Program Applied
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Tech in Artificial Intelligence"
                    value={newApplicant.programApplied}
                    onChange={(e) =>
                      setNewApplicant({ ...newApplicant, programApplied: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Entrance / Test Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newApplicant.entranceScore}
                    onChange={(e) =>
                      setNewApplicant({
                        ...newApplicant,
                        entranceScore: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pipeline Stage
                  </label>
                  <select
                    value={newApplicant.stage}
                    onChange={(e) =>
                      setNewApplicant({
                        ...newApplicant,
                        stage: e.target.value as AdmissionCandidate['stage'],
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  >
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Application File</h3>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-mono text-indigo-600 font-bold text-xs">
                  {selectedCandidate.applicationNo}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  {selectedCandidate.candidateName}
                </h4>
                <p className="text-slate-500">{selectedCandidate.programApplied}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedCandidate.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedCandidate.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Entrance Score:</span>
                  <span className="font-bold text-slate-800">
                    {selectedCandidate.entranceScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stage:</span>
                  <span className="font-semibold text-indigo-600">{selectedCandidate.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Submission Date:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCandidate.appliedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
