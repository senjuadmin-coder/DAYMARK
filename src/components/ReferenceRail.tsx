import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Plus, X, Check } from 'lucide-react';
import { AgendaAnchor, TaskItem, TimerState } from '../types';
import {
  formatMonthYear,
  formatTimerMMSS,
  getMonthCalendarCells,
  getVolumeLabel,
  parseISODate,
} from '../utils/dateUtils';

interface ReferenceRailProps {
  selectedDate: string;
  todayIso: string;
  onSelectDate: (iso: string) => void;
  tasksByDate: Record<string, number>;
  anchors: AgendaAnchor[];
  onAddAnchor: (anchor: Omit<AgendaAnchor, 'id'>) => void;
  onToggleAnchor: (id: string) => void;
  onDeleteAnchor: (id: string) => void;
  timer: TimerState;
  boundTask?: TaskItem;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onChangeTimerMode: (mode: 'focus' | 'deep' | 'break') => void;
}

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const ReferenceRail: React.FC<ReferenceRailProps> = ({
  selectedDate,
  todayIso,
  onSelectDate,
  tasksByDate,
  anchors,
  onAddAnchor,
  onToggleAnchor,
  onDeleteAnchor,
  timer,
  boundTask,
  onToggleTimer,
  onResetTimer,
  onChangeTimerMode,
}) => {
  const parsedSelected = parseISODate(selectedDate);
  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>({
    year: parsedSelected.getFullYear(),
    month: parsedSelected.getMonth(),
  });

  const [isAddingAnchor, setIsAddingAnchor] = useState(false);
  const [anchorTime, setAnchorTime] = useState('15:00');
  const [anchorTitle, setAnchorTitle] = useState('');
  const [anchorLocation, setAnchorLocation] = useState('');

  const calendarCells = getMonthCalendarCells(calendarMonth.year, calendarMonth.month);
  const displayMonthDate = new Date(calendarMonth.year, calendarMonth.month, 1);

  const shiftMonth = (delta: number) => {
    const next = new Date(calendarMonth.year, calendarMonth.month + delta, 1);
    setCalendarMonth({ year: next.getFullYear(), month: next.getMonth() });
  };

  const handleAnchorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anchorTitle.trim()) return;
    onAddAnchor({
      date: selectedDate,
      time: anchorTime || '09:00',
      title: anchorTitle.trim(),
      location: anchorLocation.trim() || undefined,
      completed: false,
    });
    setAnchorTitle('');
    setAnchorLocation('');
    setIsAddingAnchor(false);
  };

  const sortedAnchors = [...anchors].sort((a, b) => a.time.localeCompare(b.time));
  const timerProgress =
    timer.totalSeconds > 0
      ? ((timer.totalSeconds - timer.secondsRemaining) / timer.totalSeconds) * 100
      : 0;

  return (
    <aside className="space-y-8">
      {/* 1. Date & Volume Index + Mini Calendar */}
      <section className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D8]">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] tabular-nums">
            {getVolumeLabel(selectedDate)}
          </span>
          {selectedDate !== todayIso && (
            <button
              type="button"
              onClick={() => {
                onSelectDate(todayIso);
                const t = parseISODate(todayIso);
                setCalendarMonth({ year: t.getFullYear(), month: t.getMonth() });
              }}
              className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#C85A32] hover:text-[#9F3C16] cursor-pointer"
            >
              Return to Today
            </button>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <h2 className="font-serif text-[17px] font-semibold text-[#181715]">
            {formatMonthYear(displayMonthDate)}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="p-1.5 text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4] rounded-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="p-1.5 text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4] rounded-sm transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {WEEKDAY_HEADERS.map((d, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold text-[#9C968B] py-1"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarCells.map((cell) => {
            const isSelected = cell.iso === selectedDate;
            const isToday = cell.iso === todayIso;
            const hasTasks = (tasksByDate[cell.iso] || 0) > 0;

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onSelectDate(cell.iso)}
                className={`relative h-8 flex flex-col items-center justify-center text-[12px] tabular-nums rounded-sm transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#181715] text-[#FAF8F5] font-semibold'
                    : isToday
                    ? 'border border-[#C85A32] text-[#C85A32] font-semibold hover:bg-[#EFECE4]'
                    : cell.inMonth
                    ? 'text-[#181715] hover:bg-[#EFECE4]'
                    : 'text-[#9C968B]/60 hover:bg-[#EFECE4]'
                }`}
              >
                <span>{cell.day}</span>
                {hasTasks && !isSelected && (
                  <span
                    aria-hidden="true"
                    className="w-1 h-1 bg-[#C85A32] rounded-full mt-0.5"
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Ambient Focus Timer */}
      <section className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-5">
        <div className="flex items-baseline justify-between pb-3 border-b border-[#E5E1D8]">
          <h2 className="font-serif text-[18px] font-semibold text-[#181715]">
            Focus Instrument
          </h2>
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9C968B]">
            {timer.mode === 'focus'
              ? '25m Cadence'
              : timer.mode === 'deep'
              ? '50m Deep'
              : '15m Rest'}
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-1 mt-3 p-1 bg-[#FAF8F5] border border-[#E5E1D8] rounded-sm">
          {(
            [
              { id: 'focus', label: '25m' },
              { id: 'deep', label: '50m' },
              { id: 'break', label: '15m' },
            ] as const
          ).map((preset) => {
            const active = timer.mode === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeTimerMode(preset.id)}
                className={`py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#181715] text-[#FAF8F5]'
                    : 'text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Countdown Display */}
        <div className="mt-5 mb-4 text-center">
          <div className="font-mono text-[38px] leading-none font-medium tracking-[-0.02em] text-[#181715] tabular-nums">
            {formatTimerMMSS(timer.secondsRemaining)}
          </div>
          <div className="mt-3 h-[2px] w-full bg-[#E5E1D8] overflow-hidden">
            <div
              className="h-full bg-[#C85A32] transition-all duration-300"
              style={{ width: `${timerProgress}%` }}
            />
          </div>
        </div>

        {/* Bound Task Note */}
        <div className="mb-4 px-3 py-2 bg-[#FAF8F5] border border-[#E5E1D8] rounded-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#9C968B]">
            Bound Commitment
          </div>
          <p className="mt-0.5 text-[13px] text-[#181715] truncate">
            {boundTask ? boundTask.title : 'Select any task to focus'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTimer}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-sm text-[13px] font-semibold transition-colors duration-150 cursor-pointer ${
              timer.isRunning
                ? 'bg-[#C85A32] text-[#FAF8F5] hover:bg-[#9F3C16]'
                : 'bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32]'
            }`}
          >
            {timer.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Start Session</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onResetTimer}
            aria-label="Reset timer"
            className="p-2 bg-[#FAF8F5] border border-[#E5E1D8] text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4] rounded-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 3. Agenda Anchors */}
      <section className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-5">
        <div className="flex items-baseline justify-between pb-3 border-b border-[#E5E1D8]">
          <h2 className="font-serif text-[18px] font-semibold text-[#181715]">
            Agenda Anchors
          </h2>
          <button
            type="button"
            onClick={() => setIsAddingAnchor((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5E5A54] hover:text-[#C85A32] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isAddingAnchor ? 'Close' : 'Add'}</span>
          </button>
        </div>

        {isAddingAnchor && (
          <form onSubmit={handleAnchorSubmit} className="mt-3 pb-3 border-b border-[#E5E1D8] space-y-2">
            <div className="flex gap-2">
              <input
                type="time"
                value={anchorTime}
                onChange={(e) => setAnchorTime(e.target.value)}
                aria-label="Anchor time"
                className="w-24 px-2 py-1.5 text-[12px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm tabular-nums text-[#181715]"
              />
              <input
                type="text"
                value={anchorTitle}
                onChange={(e) => setAnchorTitle(e.target.value)}
                placeholder="Appointment or milestone..."
                aria-label="Anchor title"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={anchorLocation}
                onChange={(e) => setAnchorLocation(e.target.value)}
                placeholder="Room or medium (optional)"
                aria-label="Anchor location"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-[12px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        )}

        <div className="mt-2 divide-y divide-[#E5E1D8]">
          {sortedAnchors.length === 0 ? (
            <p className="py-4 text-[13px] italic font-serif text-[#5E5A54]">
              Unscheduled day — open hours for deep studio work.
            </p>
          ) : (
            sortedAnchors.map((anchor) => (
              <div
                key={anchor.id}
                className="group py-2.5 flex items-start gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => onToggleAnchor(anchor.id)}
                  aria-label={`Toggle anchor ${anchor.title}`}
                  className={`mt-1 w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    anchor.completed
                      ? 'bg-[#6B7F6E] border border-[#6B7F6E] text-[#FAF8F5]'
                      : 'border border-[#5E5A54] hover:border-[#C85A32]'
                  }`}
                >
                  {anchor.completed && <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[12px] font-mono tabular-nums text-[#5E5A54] shrink-0">
                      {anchor.time}
                    </span>
                    <span
                      className={`text-[13px] leading-[18px] ${
                        anchor.completed
                          ? 'text-[#9C968B] line-through'
                          : 'text-[#181715] font-medium'
                      }`}
                    >
                      {anchor.title}
                    </span>
                  </div>
                  {anchor.location && (
                    <div className="mt-0.5 text-[11px] text-[#9C968B]">
                      {anchor.location}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteAnchor(anchor.id)}
                  aria-label={`Remove ${anchor.title}`}
                  className="p-1 text-[#9C968B] hover:text-[#BA1A1A] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
  );
};
