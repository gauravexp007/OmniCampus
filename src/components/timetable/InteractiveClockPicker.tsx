import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { formatMinutesToTime } from './TimetableTypes';

interface InteractiveClockPickerProps {
  startTimeMinutes: number;
  durationMinutes: number;
  onChangeStartTime: (minutes: number) => void;
  onChangeDuration: (minutes: number) => void;
}

export const InteractiveClockPicker: React.FC<InteractiveClockPickerProps> = ({
  startTimeMinutes,
  durationMinutes,
  onChangeStartTime,
  onChangeDuration,
}) => {
  const currentHour24 = Math.floor(startTimeMinutes / 60);
  const currentMinute = startTimeMinutes % 60;
  const isPM = currentHour24 >= 12;
  const currentHour12 = currentHour24 % 12 === 0 ? 12 : currentHour24 % 12;

  // Standard university lecture slots (1-click instantaneous setup)
  const quickClassSlots = [
    { label: '08:30 AM - 10:00 AM', startMin: 8 * 60 + 30, dur: 90 },
    { label: '09:00 AM - 10:30 AM', startMin: 9 * 60, dur: 90 },
    { label: '10:45 AM - 12:15 PM', startMin: 10 * 60 + 45, dur: 90 },
    { label: '11:00 AM - 12:30 PM', startMin: 11 * 60, dur: 90 },
    { label: '01:30 PM - 03:00 PM', startMin: 13 * 60 + 30, dur: 90 },
    { label: '02:00 PM - 03:30 PM', startMin: 14 * 60, dur: 90 },
    { label: '03:30 PM - 05:00 PM', startMin: 15 * 60 + 30, dur: 90 },
  ];

  // Standard lecture starting hours
  const lectureHours = [
    { h12: 8, isPM: false, label: '8:00 AM' },
    { h12: 9, isPM: false, label: '9:00 AM' },
    { h12: 10, isPM: false, label: '10:00 AM' },
    { h12: 11, isPM: false, label: '11:00 AM' },
    { h12: 12, isPM: true, label: '12:00 PM' },
    { h12: 1, isPM: true, label: '1:00 PM' },
    { h12: 2, isPM: true, label: '2:00 PM' },
    { h12: 3, isPM: true, label: '3:00 PM' },
    { h12: 4, isPM: true, label: '4:00 PM' },
  ];

  const handleSelectHour = (h12: number, pm: boolean) => {
    let new24 = h12;
    if (pm) {
      new24 = h12 === 12 ? 12 : h12 + 12;
    } else {
      new24 = h12 === 12 ? 0 : h12;
    }
    onChangeStartTime(new24 * 60 + currentMinute);
  };

  const handleToggleAMPM = (targetPM: boolean) => {
    if (targetPM === isPM) return;
    let new24 = currentHour24;
    if (targetPM) {
      new24 = currentHour24 < 12 ? currentHour24 + 12 : currentHour24;
    } else {
      new24 = currentHour24 >= 12 ? currentHour24 - 12 : currentHour24;
    }
    onChangeStartTime(new24 * 60 + currentMinute);
  };

  const handleSelectMinute = (m: number) => {
    onChangeStartTime(currentHour24 * 60 + m);
  };

  // Clock hand angle calculations
  const hourAngle = ((currentHour12 % 12) + currentMinute / 60) * 30;
  const minuteAngle = currentMinute * 6;
  const endTimeMinutes = startTimeMinutes + durationMinutes;

  return (
    <div className="bg-slate-50 dark:bg-[#303030] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-[#4d4d4d] space-y-4 shadow-xs">
      {/* 1. Header: Clear Current Time Period & Duration Span */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#444444]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xs shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scheduled Class Period
              </span>
              <span className="font-mono text-[10px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-md">
                {durationMinutes} mins
              </span>
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono flex items-center gap-1.5 mt-0.5">
              <span>{formatMinutesToTime(startTimeMinutes)}</span>
              <span className="text-slate-400 dark:text-slate-500">→</span>
              <span>{formatMinutesToTime(endTimeMinutes)}</span>
            </div>
          </div>
        </div>

        {/* Slot Duration Chips */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#252525] p-1 rounded-2xl border border-slate-200 dark:border-[#525252] shrink-0">
          {[45, 60, 90, 120, 150].map((dur) => (
            <button
              key={dur}
              type="button"
              onClick={() => onChangeDuration(dur)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                durationMinutes === dur
                  ? 'bg-brand text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {dur}m
            </button>
          ))}
        </div>
      </div>

      {/* 2. One-Click Standard Lecture Slot Presets */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick 1-Click Class Time Slots
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {quickClassSlots.map((slot) => {
            const isMatch = startTimeMinutes === slot.startMin && durationMinutes === slot.dur;
            return (
              <button
                key={slot.label}
                type="button"
                onClick={() => {
                  onChangeStartTime(slot.startMin);
                  onChangeDuration(slot.dur);
                }}
                className={`py-2 px-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border text-center ${
                  isMatch
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs font-black'
                    : 'bg-white dark:bg-[#282828] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#525252] hover:border-brand hover:text-brand'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Simple Visual Clock Dial & Direct Time Adjuster */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-200/80 dark:border-[#444444]">
        {/* Left: Interactive Analog Clock Dial */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 rounded-full bg-white dark:bg-[#252525] border-4 border-slate-200 dark:border-[#525252] shadow-inner flex items-center justify-center select-none">
            {/* Clock Numbers 1 to 12 */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
              const rad = ((num * 30 - 90) * Math.PI) / 180;
              const radius = 64;
              const x = Math.round(radius * Math.cos(rad));
              const y = Math.round(radius * Math.sin(rad));
              const isSelected = currentHour12 === num;

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    // Intelligently infer AM/PM for academic classes if hour is 1-6 (PM), 8-11 (AM), 12 (PM)
                    const autoPM = num >= 1 && num <= 6 ? true : num === 12 ? true : false;
                    handleSelectHour(num, autoPM);
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand text-white shadow-sm scale-110 z-10 ring-2 ring-brand/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-brand/10 hover:text-brand'
                  }`}
                  title={`Set hour to ${num}:00`}
                >
                  {num}
                </button>
              );
            })}

            {/* Hour hand */}
            <div
              style={{ transform: `rotate(${hourAngle}deg)` }}
              className="absolute w-1.5 h-12 bg-slate-900 dark:bg-white origin-bottom rounded-full -translate-y-6 pointer-events-none transition-transform duration-200 shadow-xs"
            />

            {/* Minute hand */}
            <div
              style={{ transform: `rotate(${minuteAngle}deg)` }}
              className="absolute w-1 h-16 bg-brand origin-bottom rounded-full -translate-y-8 pointer-events-none transition-transform duration-200 shadow-xs"
            />

            {/* Center Cap */}
            <div className="w-3 h-3 rounded-full bg-brand ring-2 ring-white dark:ring-[#252525] z-10" />
          </div>

          {/* AM / PM Selector */}
          <div className="flex items-center gap-1.5 mt-3 bg-white dark:bg-[#252525] p-1 rounded-xl border border-slate-200 dark:border-[#525252]">
            <button
              type="button"
              onClick={() => handleToggleAMPM(false)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                !isPM
                  ? 'bg-brand text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handleToggleAMPM(true)}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                isPM
                  ? 'bg-brand text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Right: Quick Hour and Minute Buttons */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Starting Hour Buttons */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              1. Select Starting Hour
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {lectureHours.map((item) => {
                const isSelected = currentHour12 === item.h12 && isPM === item.isPM;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectHour(item.h12, item.isPM)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-brand text-white border-brand shadow-xs font-black scale-102'
                        : 'bg-white dark:bg-[#282828] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#525252] hover:border-brand hover:text-brand'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minute Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              2. Select Minute Offset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 15, 30, 45].map((m) => {
                const isSelected = currentMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMinute(m)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border text-center ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs font-black scale-102'
                        : 'bg-white dark:bg-[#282828] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#525252] hover:border-slate-400'
                    }`}
                  >
                    :{String(m).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
