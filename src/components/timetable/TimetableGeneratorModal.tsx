import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  Layers,
  Clock,
  Coffee,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TimetableSlot, FacultyMember } from '../../types';
import { TimetableDay } from './TimetableTypes';

interface TimetableGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (slots: TimetableSlot[], mode: 'replace' | 'merge') => void;
  existingCount: number;
  facultyList: FacultyMember[];
}

interface CurriculaTemplate {
  id: string;
  department: string;
  program: string;
  semester: number;
  batch: string;
  subjects: {
    code: string;
    title: string;
    preferredFacultyIndex: number;
    room: string;
    type: TimetableSlot['type'];
    durationMinutes: number;
    colorTheme: string;
    weeklySessions: number;
  }[];
}

const CURRICULA_TEMPLATES: CurriculaTemplate[] = [
  {
    id: 'cs-ai-sem6',
    department: 'Computer Science & AI',
    program: 'Computer Science (Sem 6)',
    semester: 6,
    batch: 'Class CS-A',
    subjects: [
      {
        code: 'CS-601',
        title: 'Deep Learning',
        preferredFacultyIndex: 0,
        room: 'Auditorium Alpha',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-blue',
        weeklySessions: 3,
      },
      {
        code: 'CS-301',
        title: 'Database Systems',
        preferredFacultyIndex: 1,
        room: 'Turing Hall 301',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-purple',
        weeklySessions: 3,
      },
      {
        code: 'CS-301L',
        title: 'Database Practical Lab',
        preferredFacultyIndex: 1,
        room: 'Computing Lab 02',
        type: 'Lab',
        durationMinutes: 120,
        colorTheme: 'pastel-teal',
        weeklySessions: 2,
      },
      {
        code: 'CS-405',
        title: 'Network Security',
        preferredFacultyIndex: 0,
        room: 'Hall 204',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-peach',
        weeklySessions: 2,
      },
      {
        code: 'AI-701',
        title: 'Robotics Workshop',
        preferredFacultyIndex: 2,
        room: 'Robotics Bay',
        type: 'Tutorial',
        durationMinutes: 120,
        colorTheme: 'pastel-yellow',
        weeklySessions: 2,
      },
    ],
  },
  {
    id: 'ec-robotics-sem4',
    department: 'Electronics & Robotics',
    program: 'Electronics Engineering (Sem 4)',
    semester: 4,
    batch: 'Class EC-A',
    subjects: [
      {
        code: 'EC-401',
        title: 'Embedded Systems',
        preferredFacultyIndex: 2,
        room: 'Tesla Wing 204',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-yellow',
        weeklySessions: 3,
      },
      {
        code: 'EC-401L',
        title: 'Hardware & PCB Lab',
        preferredFacultyIndex: 2,
        room: 'Hardware Lab 03',
        type: 'Lab',
        durationMinutes: 120,
        colorTheme: 'pastel-teal',
        weeklySessions: 2,
      },
      {
        code: 'EC-406',
        title: 'Signal Processing',
        preferredFacultyIndex: 0,
        room: 'Faraday Hall 102',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-blue',
        weeklySessions: 3,
      },
      {
        code: 'ROB-302',
        title: 'Kinematics',
        preferredFacultyIndex: 1,
        room: 'Robotics Bay 02',
        type: 'Tutorial',
        durationMinutes: 90,
        colorTheme: 'pastel-amber',
        weeklySessions: 2,
      },
    ],
  },
  {
    id: 'me-aero-sem4',
    department: 'Mechanical & Aerospace',
    program: 'Aerospace Engineering (Sem 4)',
    semester: 4,
    batch: 'Class ME-A',
    subjects: [
      {
        code: 'ME-401',
        title: 'Fluid Dynamics',
        preferredFacultyIndex: 1,
        room: 'Aerospace Wing 302',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-blue',
        weeklySessions: 3,
      },
      {
        code: 'ME-405L',
        title: 'Aerodynamics Lab',
        preferredFacultyIndex: 1,
        room: 'Wind Tunnel Lab',
        type: 'Lab',
        durationMinutes: 120,
        colorTheme: 'pastel-teal',
        weeklySessions: 2,
      },
      {
        code: 'ME-408',
        title: 'Structural Mechanics',
        preferredFacultyIndex: 0,
        room: 'Newton Hall 201',
        type: 'Lecture',
        durationMinutes: 90,
        colorTheme: 'pastel-peach',
        weeklySessions: 3,
      },
    ],
  },
];

export const TimetableGeneratorModal: React.FC<TimetableGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplySchedule,
  existingCount,
  facultyList,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('cs-ai-sem6');
  const [includeLunchBreak, setIncludeLunchBreak] = useState<boolean>(true);
  const [afternoonLabsOnly, setAfternoonLabsOnly] = useState<boolean>(true);
  const [maxLecturesPerDay, setMaxLecturesPerDay] = useState<number>(3);
  const [replaceMode, setReplaceMode] = useState<'replace' | 'merge'>('replace');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);

  const selectedTemplate =
    CURRICULA_TEMPLATES.find((t) => t.id === selectedTemplateId) || CURRICULA_TEMPLATES[0];

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const generatedSlots: TimetableSlot[] = [];
      const days: TimetableDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      // Assign real registered faculties from facultyList
      const subjectPool: {
        code: string;
        title: string;
        instructor: string;
        facultyId: string;
        facultyEmail: string;
        room: string;
        type: TimetableSlot['type'];
        durationMinutes: number;
        colorTheme: string;
      }[] = [];

      selectedTemplate.subjects.forEach((s) => {
        // Pick real registered faculty from facultyList
        const assignedFac =
          facultyList.length > 0
            ? facultyList[s.preferredFacultyIndex % facultyList.length]
            : null;

        const facultyName = assignedFac ? assignedFac.name : 'Faculty Instructor';
        const facultyId = assignedFac ? assignedFac.employeeId : `FAC-2026-${1000 + s.preferredFacultyIndex}`;
        const facultyEmail = assignedFac ? assignedFac.email : '';

        for (let i = 0; i < s.weeklySessions; i++) {
          subjectPool.push({
            code: s.code,
            title: s.title,
            instructor: facultyName,
            facultyId,
            facultyEmail,
            room: s.room,
            type: s.type,
            durationMinutes: s.durationMinutes,
            colorTheme: s.colorTheme,
          });
        }
      });

      const labs = subjectPool.filter((s) => s.type === 'Lab');
      const lectures = subjectPool.filter((s) => s.type === 'Lecture');
      const seminarsAndTuts = subjectPool.filter((s) => s.type !== 'Lab' && s.type !== 'Lecture');

      days.forEach((day, dayIndex) => {
        let lectureCount = 0;

        // Period 1 (08:30 - 10:00 AM)
        if (lectures.length > 0 && lectureCount < maxLecturesPerDay) {
          const item = lectures.shift()!;
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-p1-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '08:30 AM - 10:00 AM',
            startTime: '08:30 AM',
            endTime: '10:00 AM',
            durationMinutes: 90,
            courseCode: item.code,
            courseTitle: item.title,
            instructor: item.instructor,
            facultyId: item.facultyId,
            facultyEmail: item.facultyEmail,
            room: item.room,
            batch: selectedTemplate.batch,
            type: item.type,
            colorTheme: item.colorTheme,
          });
          lectureCount++;
        } else if (seminarsAndTuts.length > 0) {
          const item = seminarsAndTuts.shift()!;
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-p1-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '08:30 AM - 10:00 AM',
            startTime: '08:30 AM',
            endTime: '10:00 AM',
            durationMinutes: 90,
            courseCode: item.code,
            courseTitle: item.title,
            instructor: item.instructor,
            facultyId: item.facultyId,
            facultyEmail: item.facultyEmail,
            room: item.room,
            batch: selectedTemplate.batch,
            type: item.type,
            colorTheme: item.colorTheme,
          });
        }

        // Period 2 (10:30 AM - 12:00 PM)
        if (lectures.length > 0 && lectureCount < maxLecturesPerDay) {
          const item = lectures.shift()!;
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-p2-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '10:30 AM - 12:00 PM',
            startTime: '10:30 AM',
            endTime: '12:00 PM',
            durationMinutes: 90,
            courseCode: item.code,
            courseTitle: item.title,
            instructor: item.instructor,
            facultyId: item.facultyId,
            facultyEmail: item.facultyEmail,
            room: item.room,
            batch: selectedTemplate.batch,
            type: item.type,
            colorTheme: item.colorTheme,
          });
          lectureCount++;
        }

        // Lunch Break
        if (includeLunchBreak && (dayIndex === 0 || dayIndex === 2 || dayIndex === 4)) {
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-lunch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '12:30 PM - 01:30 PM',
            startTime: '12:30 PM',
            endTime: '01:30 PM',
            durationMinutes: 60,
            courseCode: 'RECESS',
            courseTitle: 'Lunch Break',
            instructor: 'Campus Commons',
            facultyId: '',
            facultyEmail: '',
            room: 'Dining Pavilion',
            batch: selectedTemplate.batch,
            type: 'Break',
            colorTheme: 'pastel-peach',
          });
        }

        // Period 3 (Afternoon 01:30 - 03:30 PM)
        if (labs.length > 0 && (afternoonLabsOnly || dayIndex % 2 === 0)) {
          const labItem = labs.shift()!;
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-p3-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '01:30 PM - 03:30 PM',
            startTime: '01:30 PM',
            endTime: '03:30 PM',
            durationMinutes: 120,
            courseCode: labItem.code,
            courseTitle: labItem.title,
            instructor: labItem.instructor,
            facultyId: labItem.facultyId,
            facultyEmail: labItem.facultyEmail,
            room: labItem.room,
            batch: selectedTemplate.batch,
            type: 'Lab',
            colorTheme: labItem.colorTheme,
          });
        } else if (seminarsAndTuts.length > 0) {
          const item = seminarsAndTuts.shift()!;
          generatedSlots.push({
            id: `gen-${day.toLowerCase()}-p3-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            day,
            time: '01:30 PM - 03:00 PM',
            startTime: '01:30 PM',
            endTime: '03:00 PM',
            durationMinutes: 90,
            courseCode: item.code,
            courseTitle: item.title,
            instructor: item.instructor,
            facultyId: item.facultyId,
            facultyEmail: item.facultyEmail,
            room: item.room,
            batch: selectedTemplate.batch,
            type: item.type,
            colorTheme: item.colorTheme,
          });
        }
      });

      setIsGenerating(false);
      setGenerationSuccess(true);

      setTimeout(() => {
        onApplySchedule(generatedSlots, replaceMode);
        setGenerationSuccess(false);
        onClose();
      }, 300);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16 }}
        className="bg-white dark:bg-[#2b2b2b] rounded-3xl border border-slate-200 dark:border-[#525252] shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#404040]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black">Timetable Generator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate weekly schedule assigned to registered faculties (Admin Only)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Program Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Select Program
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CURRICULA_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedTemplateId === tmpl.id
                    ? 'border-brand bg-brand/5 dark:bg-brand/15 ring-2 ring-brand'
                    : 'border-slate-200 dark:border-[#444444] hover:bg-slate-50'
                }`}
              >
                <span className="font-black text-xs block">{tmpl.program}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {tmpl.subjects.length} Subjects · {tmpl.batch}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Options
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#353535] border border-slate-200 dark:border-[#444444] flex items-center justify-between">
              <div>
                <span className="font-bold block">Lunch Break</span>
                <span className="text-[10px] text-slate-400">12:30 PM - 01:30 PM</span>
              </div>
              <input
                type="checkbox"
                checked={includeLunchBreak}
                onChange={(e) => setIncludeLunchBreak(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#353535] border border-slate-200 dark:border-[#444444] flex items-center justify-between">
              <div>
                <span className="font-bold block">Afternoon Labs</span>
                <span className="text-[10px] text-slate-400">2-hour practicals</span>
              </div>
              <input
                type="checkbox"
                checked={afternoonLabsOnly}
                onChange={(e) => setAfternoonLabsOnly(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Overwrite or Merge */}
        {existingCount > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
            <span>{existingCount} periods currently exist.</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setReplaceMode('replace')}
                className={`px-3 py-1 rounded-xl font-bold cursor-pointer ${
                  replaceMode === 'replace'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-[#333333] text-slate-700 dark:text-white border border-amber-300'
                }`}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => setReplaceMode('merge')}
                className={`px-3 py-1 rounded-xl font-bold cursor-pointer ${
                  replaceMode === 'merge'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white dark:bg-[#333333] text-slate-700 dark:text-white border border-amber-300'
                }`}
              >
                Merge
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-[#404040] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#525252] text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : generationSuccess ? 'Generated!' : 'Generate Timetable'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
