import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Flag, RefreshCw } from 'lucide-react';
import {
  DailyEntry,
  FolioProject,
  TaskCategory,
  TaskItem,
  TaskPriority,
  TimerState,
} from '../types';
import {
  addDays,
  formatLongDate,
  formatMinutesHuman,
  getGreeting,
  getVolumeLabel,
} from '../utils/dateUtils';
import { REFLECTION_PROMPTS } from '../data/seedData';
import { TaskRow } from './TaskRow';

interface TodayStudioProps {
  selectedDate: string;
  todayIso: string;
  onSelectDate: (iso: string) => void;
  tasks: TaskItem[];
  folios: FolioProject[];
  dailyEntry: DailyEntry;
  onUpdateDailyEntry: (date: string, patch: Partial<DailyEntry>) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'focusSessions' | 'subtasks'>) => void;
  onToggleComplete: (taskId: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  timer: TimerState;
  onBindFocusTask: (taskId: string) => void;
}

type TaskFilter = 'all' | 'active' | 'primary' | 'completed';

const CATEGORIES: TaskCategory[] = [
  'Editorial',
  'Studio',
  'Research',
  'Correspondence',
  'Personal',
];

export const TodayStudio: React.FC<TodayStudioProps> = ({
  selectedDate,
  todayIso,
  onSelectDate,
  tasks,
  folios,
  dailyEntry,
  onUpdateDailyEntry,
  onAddTask,
  onToggleComplete,
  selectedTaskId,
  onSelectTask,
  timer,
  onBindFocusTask,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Editorial');
  const [newPriority, setNewPriority] = useState<TaskPriority>('standard');
  const [newMinutes, setNewMinutes] = useState<number>(30);
  const [newFolioId, setNewFolioId] = useState<string>('');
  const [isEditingIntention, setIsEditingIntention] = useState(false);

  const folioMap = new Map(folios.map((f) => [f.id, f]));

  // Sort: primary incomplete first, then standard incomplete, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (!a.completed && a.priority !== b.priority) {
      return a.priority === 'primary' ? -1 : 1;
    }
    return (a.scheduledTime || '99:99').localeCompare(b.scheduledTime || '99:99');
  });

  const filteredTasks = sortedTasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'primary') return t.priority === 'primary' && !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      completed: false,
      date: selectedDate,
      priority: newPriority,
      category: newCategory,
      folioId: newFolioId || undefined,
      estimatedMinutes: newMinutes,
      notes: '',
    });
    setNewTitle('');
    setNewPriority('standard');
  };

  const currentPrompt =
    REFLECTION_PROMPTS[dailyEntry.promptIndex % REFLECTION_PROMPTS.length];

  const isToday = selectedDate === todayIso;

  return (
    <div className="space-y-10">
      {/* Editorial Masthead & Focal Intention */}
      <header className="pb-8 border-b border-[#E5E1D8]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
            <span>{isToday ? 'Today’s Broadsheet' : 'Daily Folio'}</span>
            <span aria-hidden="true" className="text-[#9C968B]">·</span>
            <span className="tabular-nums">{formatLongDate(selectedDate)}</span>
            <span aria-hidden="true" className="text-[#9C968B] hidden sm:inline">·</span>
            <span className="hidden sm:inline tabular-nums text-[#9C968B]">
              {getVolumeLabel(selectedDate)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectDate(addDays(selectedDate, -1))}
              aria-label="Previous day"
              className="p-1.5 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#5E5A54] hover:text-[#181715] rounded-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(addDays(selectedDate, 1))}
              aria-label="Next day"
              className="p-1.5 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#5E5A54] hover:text-[#181715] rounded-sm transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <h1 className="mt-4 font-serif text-[36px] sm:text-[52px] leading-[44px] sm:leading-[60px] font-semibold tracking-[-0.02em] text-[#181715] [text-wrap:balance]">
          {isToday ? getGreeting() : formatLongDate(selectedDate).split(',')[0]}
        </h1>

        {/* Daily Focal Intention */}
        <div className="mt-4 max-w-2xl">
          {isEditingIntention ? (
            <div className="space-y-2">
              <textarea
                rows={2}
                autoFocus
                value={dailyEntry.intention}
                onChange={(e) =>
                  onUpdateDailyEntry(selectedDate, { intention: e.target.value })
                }
                onBlur={() => setIsEditingIntention(false)}
                placeholder="Set a quiet focal intention for the day..."
                aria-label="Daily focal intention"
                className="w-full font-serif italic text-[19px] leading-[28px] text-[#181715] bg-[#FFFFFF] border-[1.5px] border-[#C85A32] rounded-sm px-3 py-2 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsEditingIntention(false);
                  }}
                  className="px-3 py-1 bg-[#181715] text-[#FAF8F5] text-[12px] font-semibold rounded-sm cursor-pointer"
                >
                  Save Intention
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingIntention(true)}
              className="group text-left cursor-pointer"
              title="Click to edit daily focal intention"
            >
              <p className="font-serif italic text-[19px] sm:text-[21px] leading-[29px] text-[#5E5A54] group-hover:text-[#181715] transition-colors">
                {dailyEntry.intention
                  ? `“${dailyEntry.intention}”`
                  : 'Click to inscribe today’s focal intention...'}
              </p>
              <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-[0.05em] text-[#9C968B] group-hover:text-[#C85A32] transition-colors">
                Edit Focal Intention
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Task Ledger Section */}
      <section aria-labelledby="ledger-heading">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#E5E1D8]">
          <div className="flex items-baseline gap-3">
            <h2
              id="ledger-heading"
              className="font-serif text-[26px] leading-[34px] font-medium tracking-[-0.01em] text-[#181715]"
            >
              Daily Ledger
            </h2>
            <span className="text-[13px] text-[#5E5A54] tabular-nums">
              {completedCount} of {tasks.length} completed
              {remainingMinutes > 0 && ` · ${formatMinutesHuman(remainingMinutes)} remaining`}
            </span>
          </div>

          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm self-start sm:self-auto">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'active', label: 'Active' },
                { id: 'primary', label: 'Primary' },
                { id: 'completed', label: 'Completed' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1 text-[12px] font-semibold rounded-sm transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#181715] text-[#FAF8F5]'
                      : 'text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inline Quick-Add Bar */}
        <form
          onSubmit={handleQuickAdd}
          className="mt-4 mb-2 p-3 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm"
        >
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Record a new commitment for this ledger..."
              aria-label="New task title"
              className="flex-1 min-w-0 px-3.5 py-2 text-[15px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B] transition-colors"
            />
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewPriority((p) => (p === 'primary' ? 'standard' : 'primary'))
                }
                aria-pressed={newPriority === 'primary'}
                title="Mark as primary commitment"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-sm border text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  newPriority === 'primary'
                    ? 'bg-[#C85A32] text-[#FAF8F5] border-[#C85A32]'
                    : 'bg-[#FAF8F5] text-[#5E5A54] border-[#E5E1D8] hover:text-[#181715]'
                }`}
              >
                <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Primary</span>
              </button>

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                aria-label="Task category"
                className="px-2.5 py-2 text-[12px] font-medium bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={newFolioId}
                onChange={(e) => setNewFolioId(e.target.value)}
                aria-label="Assign to folio"
                className="px-2.5 py-2 text-[12px] font-medium bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] max-w-[130px]"
              >
                <option value="">No Folio</option>
                {folios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.indexLabel}
                  </option>
                ))}
              </select>

              <select
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                aria-label="Estimated duration"
                className="px-2.5 py-2 text-[12px] font-medium bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
              >
                <option value={15}>15m</option>
                <option value={25}>25m</option>
                <option value={30}>30m</option>
                <option value={45}>45m</option>
                <option value={60}>1h</option>
                <option value={90}>1h 30m</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>

        {/* Ledger Rows */}
        <div className="border-t border-[#E5E1D8]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 px-4 text-center border-b border-[#E5E1D8]">
              <p className="font-serif italic text-[18px] text-[#5E5A54]">
                {filter === 'all'
                  ? 'The ledger for this day is uninscribed.'
                  : `No ${filter} entries on this date.`}
              </p>
              {filter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="mt-3 px-4 py-1.5 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[12px] font-semibold text-[#181715] rounded-sm transition-colors cursor-pointer"
                >
                  Show All Entries
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                folio={task.folioId ? folioMap.get(task.folioId) : undefined}
                isSelected={selectedTaskId === task.id}
                isFocusedTimer={timer.boundTaskId === task.id}
                isTimerRunning={timer.isRunning}
                onToggleComplete={onToggleComplete}
                onSelectTask={onSelectTask}
                onBindFocusTask={onBindFocusTask}
              />
            ))
          )}
        </div>
      </section>

      {/* Evening Reflection & Marginalia Card */}
      <section className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#E5E1D8]">
          <div>
            <h2 className="font-serif text-[20px] leading-[28px] font-semibold text-[#181715]">
              Evening Marginalia
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9C968B]">
              Ref. {selectedDate}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdateDailyEntry(selectedDate, {
                  promptIndex: (dailyEntry.promptIndex + 1) % REFLECTION_PROMPTS.length,
                })
              }
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5E5A54] hover:text-[#C85A32] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Rotate Prompt</span>
            </button>
          </div>
        </div>

        <p className="mt-4 font-serif italic text-[17px] leading-[26px] text-[#5E5A54]">
          “{currentPrompt}”
        </p>

        <textarea
          rows={4}
          value={dailyEntry.reflection}
          onChange={(e) =>
            onUpdateDailyEntry(selectedDate, { reflection: e.target.value })
          }
          placeholder="Write quietly about what shifted today, observations worth keeping, or tomorrow’s opening priority..."
          aria-label="Evening reflection notes"
          className="mt-4 w-full px-4 py-3 text-[15px] leading-[24px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B] transition-colors"
        />
      </section>
    </div>
  );
};
