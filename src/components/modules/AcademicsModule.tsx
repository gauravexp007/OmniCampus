import React from 'react';
import { useERP } from '../../context/ERPContext';
import { AcademicDocumentsSection } from './AcademicDocumentsSection';

export const AcademicsModule: React.FC = () => {
  const { role } = useERP();

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-white dark:bg-[#1e2229] rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-700/60 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Academics & Syllabus
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {role === 'Student'
            ? 'Browse and download assignments, syllabi, notes, sessionals, and study materials uploaded by faculty by subject.'
            : 'Select a document field and upload assignments, syllabi, notes, sessionals, and year plans for students.'}
        </p>
      </div>

      <AcademicDocumentsSection />
    </div>
  );
};
