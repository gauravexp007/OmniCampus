import { TimetableSlot } from '../../types';

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const TIMETABLE_DAYS: TimetableDay[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export interface PastelPalette {
  id: string;
  name: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  badgeBgLight: string;
  bgDark: string;
  borderDark: string;
  textDark: string;
  badgeBgDark: string;
  previewColor: string;
  darkMatchingColor: string;
  darkMatchingColorSecondary: string;
}

export const PASTEL_PALETTES: Record<string, PastelPalette> = {
  'pastel-blue': {
    id: 'pastel-blue',
    name: 'Soft Baby Blue',
    bgLight: 'bg-[#CBE4F9]',
    borderLight: 'border-[#91c5ef]',
    textLight: 'text-[#172554]',
    badgeBgLight: 'bg-[#172554]/10',
    bgDark: 'dark:bg-[#CBE4F9]',
    borderDark: 'dark:border-[#91c5ef]',
    textDark: 'dark:text-[#172554]',
    badgeBgDark: 'dark:bg-[#172554]/12',
    previewColor: '#CBE4F9',
    darkMatchingColor: '#172554', // Dark blue / navy
    darkMatchingColorSecondary: '#1e3a8a',
  },
  'pastel-yellow': {
    id: 'pastel-yellow',
    name: 'Soft Buttercup',
    bgLight: 'bg-[#FFF0B8]',
    borderLight: 'border-[#f5dc8a]',
    textLight: 'text-[#713f12]',
    badgeBgLight: 'bg-[#713f12]/10',
    bgDark: 'dark:bg-[#FFF0B8]',
    borderDark: 'dark:border-[#f5dc8a]',
    textDark: 'dark:text-[#713f12]',
    badgeBgDark: 'dark:bg-[#713f12]/12',
    previewColor: '#FFF0B8',
    darkMatchingColor: '#713f12', // Dark yellow / golden brown
    darkMatchingColorSecondary: '#854d0e',
  },
  'pastel-peach': {
    id: 'pastel-peach',
    name: 'Warm Peach',
    bgLight: 'bg-[#FAD7B5]',
    borderLight: 'border-[#f5be98]',
    textLight: 'text-[#7c2d12]',
    badgeBgLight: 'bg-[#7c2d12]/10',
    bgDark: 'dark:bg-[#FAD7B5]',
    borderDark: 'dark:border-[#f5be98]',
    textDark: 'dark:text-[#7c2d12]',
    badgeBgDark: 'dark:bg-[#7c2d12]/12',
    previewColor: '#FAD7B5',
    darkMatchingColor: '#7c2d12', // Dark peach / warm rust
    darkMatchingColorSecondary: '#9a3412',
  },
  'pastel-teal': {
    id: 'pastel-teal',
    name: 'Soft Seafoam',
    bgLight: 'bg-[#BFEBE6]',
    borderLight: 'border-[#8ad6cc]',
    textLight: 'text-[#064e3b]',
    badgeBgLight: 'bg-[#064e3b]/10',
    bgDark: 'dark:bg-[#BFEBE6]',
    borderDark: 'dark:border-[#8ad6cc]',
    textDark: 'dark:text-[#064e3b]',
    badgeBgDark: 'dark:bg-[#064e3b]/12',
    previewColor: '#BFEBE6',
    darkMatchingColor: '#064e3b', // Dark green / deep teal
    darkMatchingColorSecondary: '#065f46',
  },
  'pastel-pink': {
    id: 'pastel-pink',
    name: 'Blush Rose',
    bgLight: 'bg-[#F9C6D9]',
    borderLight: 'border-[#f0a1c0]',
    textLight: 'text-[#831843]',
    badgeBgLight: 'bg-[#831843]/10',
    bgDark: 'dark:bg-[#F9C6D9]',
    borderDark: 'dark:border-[#f0a1c0]',
    textDark: 'dark:text-[#831843]',
    badgeBgDark: 'dark:bg-[#831843]/12',
    previewColor: '#F9C6D9',
    darkMatchingColor: '#831843', // Dark rose / crimson
    darkMatchingColorSecondary: '#881337',
  },
  'pastel-purple': {
    id: 'pastel-purple',
    name: 'Lavender Lilac',
    bgLight: 'bg-[#E3D4F8]',
    borderLight: 'border-[#c5acf0]',
    textLight: 'text-[#3b0764]',
    badgeBgLight: 'bg-[#3b0764]/10',
    bgDark: 'dark:bg-[#E3D4F8]',
    borderDark: 'dark:border-[#c5acf0]',
    textDark: 'dark:text-[#3b0764]',
    badgeBgDark: 'dark:bg-[#3b0764]/12',
    previewColor: '#E3D4F8',
    darkMatchingColor: '#3b0764', // Dark violet / royal purple
    darkMatchingColorSecondary: '#4c1d95',
  },
  'pastel-amber': {
    id: 'pastel-amber',
    name: 'Apricot Honey',
    bgLight: 'bg-[#FEE5C6]',
    borderLight: 'border-[#f7ca97]',
    textLight: 'text-[#78350f]',
    badgeBgLight: 'bg-[#78350f]/10',
    bgDark: 'dark:bg-[#FEE5C6]',
    borderDark: 'dark:border-[#f7ca97]',
    textDark: 'dark:text-[#78350f]',
    badgeBgDark: 'dark:bg-[#78350f]/12',
    previewColor: '#FEE5C6',
    darkMatchingColor: '#78350f', // Dark amber / honey
    darkMatchingColorSecondary: '#92400e',
  },
  'pastel-slate': {
    id: 'pastel-slate',
    name: 'Cool Pearl Gray',
    bgLight: 'bg-[#E2E8F0]',
    borderLight: 'border-[#c5d0de]',
    textLight: 'text-[#0f172a]',
    badgeBgLight: 'bg-[#0f172a]/10',
    bgDark: 'dark:bg-[#E2E8F0]',
    borderDark: 'dark:border-[#c5d0de]',
    textDark: 'dark:text-[#0f172a]',
    badgeBgDark: 'dark:bg-[#0f172a]/12',
    previewColor: '#E2E8F0',
    darkMatchingColor: '#0f172a', // Dark slate / charcoal
    darkMatchingColorSecondary: '#1e293b',
  },
};

export interface TimetableCategory {
  type: TimetableSlot['type'];
  label: string;
  paletteKey: string;
}

export const TIMETABLE_CATEGORIES: TimetableCategory[] = [
  { type: 'Lecture', label: 'Core Lecture', paletteKey: 'pastel-blue' },
  { type: 'Lab', label: 'Laboratory Practical', paletteKey: 'pastel-teal' },
  { type: 'Seminar', label: 'Colloquium & Seminar', paletteKey: 'pastel-pink' },
  { type: 'Tutorial', label: 'Problem Tutorial', paletteKey: 'pastel-amber' },
  { type: 'Break', label: 'Lunch & Campus Recess', paletteKey: 'pastel-peach' },
];

// Utility: Generate half-hour time slots from 08:00 to 17:30
export interface TimeSlotConfig {
  startHour: number; // e.g. 8 for 08:00 AM
  endHour: number;   // e.g. 17 for 05:00 PM
  intervalMinutes: number; // 30 or 60
}

export interface SlotTime {
  timeStr24: string; // "08:30"
  timeDisplay: string; // "08:30 AM" or "8:30"
  hour: number;
  minute: number;
  totalMinutes: number; // e.g. 8 * 60 + 30 = 510
}

export function generateTimeSlots(
  startHour: number = 8,
  endHour: number = 17,
  intervalMinutes: number = 30
): SlotTime[] {
  const slots: SlotTime[] = [];
  const startTotal = startHour * 60;
  const endTotal = endHour * 60;

  for (let min = startTotal; min <= endTotal; min += intervalMinutes) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    const h24Str = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const mStr = String(m).padStart(2, '0');
    const timeDisplay = `${h12}:${mStr} ${period}`;

    slots.push({
      timeStr24: h24Str,
      timeDisplay,
      hour: h,
      minute: m,
      totalMinutes: min,
    });
  }
  return slots;
}

// Convert "09:00 AM - 10:30 AM" or "09:00" to total minutes from midnight
export function parseTimeToMinutes(timeStr: string): { start: number; end: number } {
  if (!timeStr) return { start: 9 * 60, end: 10 * 60 + 30 };

  const parts = timeStr.split('-');
  if (parts.length >= 2) {
    const startMin = parseSingleTimeString(parts[0].trim());
    const endMin = parseSingleTimeString(parts[1].trim());
    return {
      start: startMin,
      end: endMin > startMin ? endMin : startMin + 90,
    };
  }

  const single = parseSingleTimeString(timeStr);
  return { start: single, end: single + 90 };
}

export function parseSingleTimeString(str: string): number {
  const cleaned = str.trim().toUpperCase();
  const isPM = cleaned.includes('PM');
  const isAM = cleaned.includes('AM');
  const numbersOnly = cleaned.replace(/[^0-9:]/g, '');
  const [hStr, mStr] = numbersOnly.split(':');
  let h = parseInt(hStr || '9', 10);
  const m = parseInt(mStr || '0', 10);

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
}

export function formatMinutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatMinutesTo24H(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface TimetableConflict {
  id: string;
  type: 'room_clash' | 'instructor_clash' | 'batch_clash';
  description: string;
  slotA: TimetableSlot;
  slotB: TimetableSlot;
}

// Clash detection engine: detects overlapping slots on same day sharing room, instructor, or batch
export function detectTimetableConflicts(slots: TimetableSlot[]): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];

      if (a.day !== b.day) continue;

      const timeA = parseTimeToMinutes(a.time);
      const timeB = parseTimeToMinutes(b.time);

      // Check overlap
      const hasOverlap = Math.max(timeA.start, timeB.start) < Math.min(timeA.end, timeB.end);
      if (!hasOverlap) continue;

      // Room conflict
      if (a.room && b.room && a.room.trim().toLowerCase() === b.room.trim().toLowerCase()) {
        conflicts.push({
          id: `room-${a.id}-${b.id}`,
          type: 'room_clash',
          description: `Venue Conflict in ${a.room}: "${a.courseCode}" and "${b.courseCode}" overlap on ${a.day}`,
          slotA: a,
          slotB: b,
        });
      }

      // Instructor conflict
      if (
        a.instructor &&
        b.instructor &&
        a.instructor.trim().toLowerCase() === b.instructor.trim().toLowerCase()
      ) {
        conflicts.push({
          id: `faculty-${a.id}-${b.id}`,
          type: 'instructor_clash',
          description: `Faculty Overload for ${a.instructor}: "${a.courseCode}" and "${b.courseCode}" overlap on ${a.day}`,
          slotA: a,
          slotB: b,
        });
      }

      // Batch conflict
      if (
        a.batch &&
        b.batch &&
        a.batch.trim().toLowerCase() === b.batch.trim().toLowerCase() &&
        a.batch !== 'All Batches'
      ) {
        conflicts.push({
          id: `batch-${a.id}-${b.id}`,
          type: 'batch_clash',
          description: `Student Schedule Clash for ${a.batch}: "${a.courseCode}" and "${b.courseCode}" at same time on ${a.day}`,
          slotA: a,
          slotB: b,
        });
      }
    }
  }

  return conflicts;
}
