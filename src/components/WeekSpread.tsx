import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Plus, ArrowUpRight } from 'lucide-react';
import { AgendaAnchor, DailyEntry, FolioProject, TaskItem } from '../types';
import {
  addDays,
  formatMinutesHuman,
  formatShortDate,
  formatWeekdayShort,
  getWeekDates,
  parseISODate,
} from '../utils/dateUtils';

interface WeekSpreadProps {
  anchorDate: string;
  todayIso: string;
  tasks: TaskItem[];
  anchors: AgendaAnchor[];
  folios: FolioProject[];
  dailyEntries: Record<string, DailyEntry>;
  onShiftWeek: (nextAnchor: string) => void;
  onOpenDay: (iso: string) => void;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'focusSessions' | 'subtasks'>) => void;
}

export const WeekSpread: React.FC<WeekSpreadProps> = ({
  anchorDate,
  todayIso,
  tasks,
  anchors,
  folios,
  dailyEntries,
  onShiftWeek,
  onOpenDay,
  onToggleComplete,
  onSelectTask,
  onAddTask,
}) => {
  const weekDates = getWeekDates(anchorDate);
  const [quickAddDay, setQuickAddDay] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const folioMap = new Map(folios.map((f) => [f.id, f]));

  const weekTasks = tasks.filter((t) => weekDates.includes(t.date));
  const completedCount = weekTasks.filter((t) => t.completed).length;
  const totalMinutes = weekTasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);

  const rangeLabel = `${formatShortDate(weekDates[0])} – ${formatShortDate(
    weekDates[6]
  )}, ${parseISODate(weekDates[0]).getFullYear()}`;

  const handleDayQuickAdd = (e: React.FormEvent, iso: string) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onAddTask({
      title: quickTitle.trim(),
      completed: false,
      date: iso,
      priority: 'standard',
      category: 'Editorial',
      estimatedMinutes: 30,
      notes: '',
    });
    setQuickTitle('');
    setQuickAddDay(null);
  };

  return (
    <div className="space-y-8">
      {/* Week Broadsheet Header */}
      <header className="pb-6 border-b border-[#E5E1D8] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
            Weekly Broadsheet Spread
          </span>
          <h1 className="mt-2 font-serif text-[34px] sm:text-[42px] leading-[44px] font-semibold tracking-[-0.02em] text-[#181715]">
            {rangeLabel}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#5E5A54] tabular-nums">
            <span>{weekTasks.length} scheduled commitments</span>
            <span aria-hidden="true" className="text-[#9C968B]">·</span>
            <span className="text-[#6B7F6E] font-medium">{completedCount} completed</span>
            <span aria-hidden="true" className="text-[#9C968B]">·</span>
            <span>{formatMinutesHuman(totalMinutes)} allocated</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onShiftWeek(addDays(anchorDate, -7))}
            aria-label="Previous week"
            className="p-2 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#5E5A54] hover:text-[#181715] rounded-sm transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(todayIso)}
            className="px-3.5 py-2 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[12px] font-semibold text-[#181715] rounded-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            Current Week
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(addDays(anchorDate, 7))}
            aria-label="Next week"
            className="p-2 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#5E5A54] hover:text-[#181715] rounded-sm transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* 7-Column Architectural Week Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 border border-[#E5E1D8] bg-[#F8F6F0] divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8] rounded-sm overflow-hidden">
        {weekDates.map((iso) => {
          const isToday = iso === todayIso;
          const dayTasks = tasks
            .filter((t) => t.date === iso)
            .sort((a, b) => Number(a.completed) - Number(b.completed));
          const dayAnchors = anchors.filter((a) => a.date === iso);
          const entry = dailyEntries[iso];

          return (
            <div
              key={iso}
              className={`flex flex-col min-h-[340px] ${
                isToday ? 'bg-[#FAF8F5]' : 'bg-[#F8F6F0]'
              }`}
            >
              {/* Day Column Header */}
              <div className="p-4 border-b border-[#E5E1D8] flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.06em] ${
                        isToday ? 'text-[#C85A32]' : 'text-[#5E5A54]'
                      }`}
                    >
                      {formatWeekdayShort(iso)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#C85A32]">
                        · Today
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-serif text-[20px] font-semibold text-[#181715] tabular-nums">
                    {formatShortDate(iso)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDay(iso)}
                  title={`Open ${formatShortDate(iso)} in Today studio`}
                  aria-label={`Open ${formatShortDate(iso)} studio`}
                  className="p-1 text-[#9C968B] hover:text-[#C85A32] transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {/* Intention Excerpt */}
              {entry?.intention && (
                <div className="px-4 py-2.5 border-b border-[#E5E1D8] bg-[#FAF8F5]/60">
                  <p className="font-serif italic text-[12px] leading-[17px] text-[#5E5A54] line-clamp-2">
                    “{entry.intention}”
                  </p>
                </div>
              )}

              {/* Day Tasks */}
              <div className="flex-1 p-3 space-y-2">
                {dayTasks.length === 0 && dayAnchors.length === 0 ? (
                  <p className="py-4 px-1 text-[12px] italic font-serif text-[#9C968B]">
                    Open slate
                  </p>
                ) : (
                  <>
                    {dayAnchors.map((anc) => (
                      <div
                        key={anc.id}
                        className="px-2 py-1.5 bg-[#EFECE4]/70 border border-[#E5E1D8] rounded-sm text-[11px]"
                      >
                        <span className="font-mono tabular-nums text-[#5E5A54] mr-1.5">
                          {anc.time}
                        </span>
                        <span className="text-[#181715] font-medium">{anc.title}</span>
                      </div>
                    ))}

                    {dayTasks.map((task) => {
                      const folio = task.folioId ? folioMap.get(task.folioId) : undefined;
                      return (
                        <div
                          key={task.id}
                          className="group relative flex items-start gap-2 py-1.5 px-1.5 hover:bg-[#EFECE4]/70 rounded-sm transition-colors"
                        >
                          {task.priority === 'primary' && !task.completed && (
                            <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#C85A32]" />
                          )}
                          <button
                            type="button"
                            onClick={() => onToggleComplete(task.id)}
                            aria-label={`Toggle ${task.title}`}
                            className={`mt-0.5 w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                              task.completed
                                ? 'bg-[#6B7F6E] border border-[#6B7F6E] text-[#FAF8F5]'
                                : 'border-[1.5px] border-[#5E5A54] hover:border-[#C85A32]'
                            }`}
                          >
                            {task.completed && (
                              <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectTask(task.id)}
                            className="flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div
                              className={`text-[12.5px] leading-[17px] ${
                                task.completed
                                  ? 'text-[#9C968B] line-through'
                                  : 'text-[#181715] font-medium'
                              }`}
                            >
                              {task.title}
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#9C968B] truncate">
                              {task.category}
                              {folio ? ` · ${folio.indexLabel}` : ''}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Quick Add Trigger */}
              <div className="p-3 border-t border-[#E5E1D8]">
                {quickAddDay === iso ? (
                  <form onSubmit={(e) => handleDayQuickAdd(e, iso)} className="space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      placeholder="Task title..."
                      className="w-full px-2 py-1 text-[12px] bg-[#FAF8F5] border border-[#C85A32] rounded-sm text-[#181715]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickAddDay(null);
                          setQuickTitle('');
                        }}
                        className="px-2 py-0.5 text-[11px] text-[#5E5A54] hover:text-[#181715] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 bg-[#181715] text-[#FAF8F5] text-[11px] font-semibold rounded-sm cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddDay(iso);
                      setQuickTitle('');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1 py-1 text-[11px] font-semibold text-[#5E5A54] hover:text-[#C85A32] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    <span>Add Entry</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
