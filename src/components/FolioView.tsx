import React, { useState } from 'react';
import { Plus, ArrowLeft, Check } from 'lucide-react';
import { FolioProject, TaskCategory, TaskItem, TimerState } from '../types';
import { TaskRow } from './TaskRow';

interface FolioViewProps {
  folios: FolioProject[];
  tasks: TaskItem[];
  todayIso: string;
  onAddFolio: (folio: Omit<FolioProject, 'id' | 'indexLabel' | 'updatedAt'>) => void;
  onUpdateFolio: (id: string, patch: Partial<FolioProject>) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'focusSessions' | 'subtasks'>) => void;
  onToggleComplete: (taskId: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  timer: TimerState;
  onBindFocusTask: (taskId: string) => void;
}

const CATEGORIES: Array<'All' | TaskCategory> = [
  'All',
  'Editorial',
  'Studio',
  'Research',
  'Correspondence',
  'Personal',
];

export const FolioView: React.FC<FolioViewProps> = ({
  folios,
  tasks,
  todayIso,
  onAddFolio,
  onUpdateFolio,
  onAddTask,
  onToggleComplete,
  selectedTaskId,
  onSelectTask,
  timer,
  onBindFocusTask,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [activeFolioId, setActiveFolioId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New Folio Form State
  const [newFolioTitle, setNewFolioTitle] = useState('');
  const [newFolioSubtitle, setNewFolioSubtitle] = useState('');
  const [newFolioCategory, setNewFolioCategory] = useState<TaskCategory>('Editorial');
  const [newFolioBrief, setNewFolioBrief] = useState('');

  // Quick-add task inside Folio Detail
  const [folioTaskTitle, setFolioTaskTitle] = useState('');

  const activeFolio = folios.find((f) => f.id === activeFolioId) || null;

  const filteredFolios =
    categoryFilter === 'All'
      ? folios
      : folios.filter((f) => f.category === categoryFilter);

  const handleCreateFolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolioTitle.trim()) return;
    onAddFolio({
      title: newFolioTitle.trim(),
      subtitle: newFolioSubtitle.trim() || 'Working monograph & task ledger',
      category: newFolioCategory,
      brief:
        newFolioBrief.trim() ||
        'Document scope, editorial standards, and milestone commitments.',
      status: 'Active',
    });
    setNewFolioTitle('');
    setNewFolioSubtitle('');
    setNewFolioBrief('');
    setIsCreating(false);
  };

  const handleAddFolioTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFolio || !folioTaskTitle.trim()) return;
    onAddTask({
      title: folioTaskTitle.trim(),
      completed: false,
      date: todayIso,
      priority: 'standard',
      category: activeFolio.category,
      folioId: activeFolio.id,
      estimatedMinutes: 30,
      notes: '',
    });
    setFolioTaskTitle('');
  };

  if (activeFolio) {
    const folioTasks = tasks
      .filter((t) => t.folioId === activeFolio.id)
      .sort((a, b) => Number(a.completed) - Number(b.completed));
    const completed = folioTasks.filter((t) => t.completed).length;
    const pct = folioTasks.length > 0 ? Math.round((completed / folioTasks.length) * 100) : 0;

    return (
      <div className="space-y-8">
        <div>
          <button
            type="button"
            onClick={() => setActiveFolioId(null)}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5E5A54] hover:text-[#181715] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to All Folios</span>
          </button>
        </div>

        <article className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-6 sm:p-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 border-b border-[#E5E1D8]">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
              <span>{activeFolio.indexLabel}</span>
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
              <span className="text-[#6B7F6E]">{activeFolio.category}</span>
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
              <span>{activeFolio.status}</span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] border border-[#E5E1D8] rounded-sm">
              {(['Active', 'In Review', 'Archived'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateFolio(activeFolio.id, { status })}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer ${
                    activeFolio.status === status
                      ? 'bg-[#181715] text-[#FAF8F5]'
                      : 'text-[#5E5A54] hover:text-[#181715]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <h1 className="mt-5 font-serif text-[34px] sm:text-[42px] leading-[46px] font-semibold tracking-[-0.02em] text-[#181715]">
            {activeFolio.title}
          </h1>
          <p className="mt-2 font-serif italic text-[18px] text-[#5E5A54]">
            {activeFolio.subtitle}
          </p>

          {/* Editable Monograph Brief */}
          <div className="mt-6 pt-6 border-t border-[#E5E1D8]">
            <label
              htmlFor="folio-brief-editor"
              className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-2"
            >
              Monograph Brief &amp; Scope
            </label>
            <textarea
              id="folio-brief-editor"
              rows={3}
              value={activeFolio.brief}
              onChange={(e) => onUpdateFolio(activeFolio.id, { brief: e.target.value })}
              className="w-full px-4 py-3 text-[15px] leading-[24px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715]"
            />
          </div>

          {/* Progress Rule */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-[3px] bg-[#E5E1D8]">
              <div
                className="h-full bg-[#6B7F6E] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[12px] font-semibold text-[#5E5A54] tabular-nums shrink-0">
              {completed} of {folioTasks.length} commitments ({pct}%)
            </span>
          </div>
        </article>

        {/* Folio Task Ledger */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[#E5E1D8]">
            <h2 className="font-serif text-[24px] font-medium text-[#181715]">
              Associated Commitments
            </h2>
            <span className="text-[12px] text-[#5E5A54] tabular-nums">
              {folioTasks.length} total
            </span>
          </div>

          <form onSubmit={handleAddFolioTask} className="flex gap-2">
            <input
              type="text"
              value={folioTaskTitle}
              onChange={(e) => setFolioTaskTitle(e.target.value)}
              placeholder={`Add a commitment to ${activeFolio.indexLabel}...`}
              className="flex-1 px-3.5 py-2 text-[15px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[13px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add to Folio</span>
            </button>
          </form>

          <div className="border-t border-[#E5E1D8]">
            {folioTasks.length === 0 ? (
              <p className="py-10 text-center font-serif italic text-[17px] text-[#5E5A54] border-b border-[#E5E1D8]">
                No commitments linked to this folio yet.
              </p>
            ) : (
              folioTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  folio={activeFolio}
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-[#E5E1D8] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
            Monographs &amp; Ongoing Bodies of Work
          </span>
          <h1 className="mt-2 font-serif text-[34px] sm:text-[42px] leading-[44px] font-semibold tracking-[-0.02em] text-[#181715]">
            Studio Folios
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[13px] font-semibold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{isCreating ? 'Close Form' : 'New Folio'}</span>
        </button>
      </header>

      {/* New Folio Creator */}
      {isCreating && (
        <form
          onSubmit={handleCreateFolio}
          className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-6 space-y-4"
        >
          <div className="flex items-baseline justify-between pb-3 border-b border-[#E5E1D8]">
            <h2 className="font-serif text-[20px] font-semibold text-[#181715]">
              Open a New Monograph Folio
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9C968B] tabular-nums">
              Folio {String(folios.length + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                Folio Title
              </label>
              <input
                type="text"
                required
                value={newFolioTitle}
                onChange={(e) => setNewFolioTitle(e.target.value)}
                placeholder="e.g. Winter Exhibition Catalogue"
                className="w-full px-3.5 py-2 text-[15px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                Discipline
              </label>
              <select
                value={newFolioCategory}
                onChange={(e) => setNewFolioCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-[14px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={newFolioSubtitle}
              onChange={(e) => setNewFolioSubtitle(e.target.value)}
              placeholder="Concise editorial descriptor..."
              className="w-full px-3.5 py-2 text-[14px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
              Working Brief
            </label>
            <textarea
              rows={2}
              value={newFolioBrief}
              onChange={(e) => setNewFolioBrief(e.target.value)}
              placeholder="Key deliverables, references, and creative boundaries..."
              className="w-full px-3.5 py-2 text-[14px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 bg-[#FAF8F5] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#181715] rounded-sm text-[13px] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[13px] font-semibold cursor-pointer"
            >
              Create Folio
            </button>
          </div>
        </form>
      )}

      {/* Discipline Filter */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm w-fit">
        {CATEGORIES.map((cat) => {
          const active = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#181715] text-[#FAF8F5]'
                  : 'text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Monograph Folio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFolios.map((folio) => {
          const folioTasks = tasks.filter((t) => t.folioId === folio.id);
          const done = folioTasks.filter((t) => t.completed).length;
          const total = folioTasks.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <button
              key={folio.id}
              type="button"
              onClick={() => setActiveFolioId(folio.id)}
              className="group text-left bg-[#F8F6F0] hover:bg-[#FAF8F5] border border-[#E8E4DA] hover:border-[#181715]/40 rounded-sm p-6 transition-colors duration-150 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Header: Serif title + right-aligned folio index */}
                <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-[#E5E1D8]">
                  <div className="flex items-center gap-2 text-[12px] text-[#5E5A54]">
                    <span className="font-semibold text-[#6B7F6E]">{folio.category}</span>
                    <span aria-hidden="true" className="text-[#9C968B]">·</span>
                    <span>{folio.status}</span>
                  </div>
                  <span className="text-[12px] font-medium text-[#9C968B] tabular-nums shrink-0">
                    {folio.indexLabel}
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-[24px] leading-[32px] font-semibold text-[#181715] group-hover:text-[#C85A32] transition-colors">
                  {folio.title}
                </h2>
                <p className="mt-1 font-serif italic text-[15px] text-[#5E5A54]">
                  {folio.subtitle}
                </p>

                <p className="mt-4 text-[14px] leading-[22px] text-[#5E5A54] line-clamp-3">
                  {folio.brief}
                </p>
              </div>

              {/* Footer Progress */}
              <div className="mt-6 pt-4 border-t border-[#E5E1D8]">
                <div className="flex items-center justify-between text-[12px] text-[#5E5A54] tabular-nums mb-2">
                  <span>
                    {done} of {total} commitments complete
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#181715]">
                    {pct === 100 && total > 0 && (
                      <Check className="w-3.5 h-3.5 text-[#6B7F6E]" aria-hidden="true" />
                    )}
                    {pct}%
                  </span>
                </div>
                <div className="h-[2px] w-full bg-[#E5E1D8]">
                  <div
                    className="h-full bg-[#6B7F6E] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
