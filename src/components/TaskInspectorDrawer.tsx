import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Play } from 'lucide-react';
import { FolioProject, TaskCategory, TaskItem, TaskPriority } from '../types';

interface TaskInspectorDrawerProps {
  task: TaskItem | null;
  folios: FolioProject[];
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
  onBindFocusTask: (taskId: string) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Editorial',
  'Studio',
  'Research',
  'Correspondence',
  'Personal',
];

export const TaskInspectorDrawer: React.FC<TaskInspectorDrawerProps> = ({
  task,
  folios,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onBindFocusTask,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!task) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const next = [
      ...task.subtasks,
      {
        id: `st-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ];
    onUpdateTask(task.id, { subtasks: next });
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subId: string) => {
    const next = task.subtasks.map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask(task.id, { subtasks: next });
  };

  const removeSubtask = (subId: string) => {
    const next = task.subtasks.filter((s) => s.id !== subId);
    onUpdateTask(task.id, { subtasks: next });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-[#181715]/20"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-label="Task Inspector"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] h-full bg-[#FAF8F5] border-l border-[#E5E1D8] flex flex-col overflow-hidden"
        style={{ boxShadow: 'rgba(24, 23, 21, 0.04) 0px 4px 20px' }}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#F8F6F0] border-b border-[#E5E1D8] flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
            Entry Inspector
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBindFocusTask(task.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[12px] font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3" aria-hidden="true" />
              <span>Focus Now</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="p-1.5 text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4] rounded-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title + Complete Toggle */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() =>
                onUpdateTask(task.id, {
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date().toISOString() : undefined,
                })
              }
              aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              className={`mt-1.5 w-[20px] h-[20px] rounded-full shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                task.completed
                  ? 'bg-[#6B7F6E] border border-[#6B7F6E] text-[#FAF8F5]'
                  : 'border-[1.5px] border-[#5E5A54] hover:border-[#C85A32]'
              }`}
            >
              {task.completed && <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />}
            </button>
            <textarea
              rows={2}
              value={task.title}
              onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
              aria-label="Task title"
              className={`w-full resize-none font-serif text-[22px] leading-[30px] font-medium bg-transparent border border-transparent focus:border-[#C85A32] focus:bg-[#FFFFFF] rounded-sm px-2 py-1 -mx-2 -my-1 transition-colors ${
                task.completed ? 'text-[#9C968B] line-through' : 'text-[#181715]'
              }`}
            />
          </div>

          {/* Metadata Fields Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E1D8]">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5">
                Priority Tier
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm">
                {(['primary', 'standard'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onUpdateTask(task.id, { priority: p })}
                    className={`py-1.5 text-[12px] font-semibold rounded-sm capitalize transition-colors cursor-pointer ${
                      task.priority === p
                        ? p === 'primary'
                          ? 'bg-[#C85A32] text-[#FAF8F5]'
                          : 'bg-[#181715] text-[#FAF8F5]'
                        : 'text-[#5E5A54] hover:text-[#181715]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="inspector-category"
                className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
              >
                Discipline
              </label>
              <select
                id="inspector-category"
                value={task.category}
                onChange={(e) =>
                  onUpdateTask(task.id, { category: e.target.value as TaskCategory })
                }
                className="w-full px-3 py-2 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="inspector-date"
                className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
              >
                Scheduled Date
              </label>
              <input
                id="inspector-date"
                type="date"
                value={task.date}
                onChange={(e) => onUpdateTask(task.id, { date: e.target.value })}
                className="w-full px-3 py-1.5 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="inspector-time"
                  className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
                >
                  Time
                </label>
                <input
                  id="inspector-time"
                  type="time"
                  value={task.scheduledTime || ''}
                  onChange={(e) =>
                    onUpdateTask(task.id, { scheduledTime: e.target.value || undefined })
                  }
                  className="w-full px-2 py-1.5 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                />
              </div>
              <div>
                <label
                  htmlFor="inspector-duration"
                  className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
                >
                  Est. Min
                </label>
                <input
                  id="inspector-duration"
                  type="number"
                  min={5}
                  max={480}
                  step={5}
                  value={task.estimatedMinutes}
                  onChange={(e) =>
                    onUpdateTask(task.id, {
                      estimatedMinutes: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className="w-full px-2 py-1.5 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label
                htmlFor="inspector-folio"
                className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
              >
                Associated Folio
              </label>
              <select
                id="inspector-folio"
                value={task.folioId || ''}
                onChange={(e) =>
                  onUpdateTask(task.id, { folioId: e.target.value || undefined })
                }
                className="w-full px-3 py-2 text-[13px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
              >
                <option value="">Standalone Ledger Entry</option>
                {folios.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.indexLabel} — {f.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="pt-4 border-t border-[#E5E1D8]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
                Intermediate Steps
              </h3>
              <span className="text-[12px] text-[#9C968B] tabular-nums">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </span>
            </div>

            <div className="divide-y divide-[#E5E1D8] border-t border-b border-[#E5E1D8]">
              {task.subtasks.map((sub) => (
                <div key={sub.id} className="group flex items-center gap-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => toggleSubtask(sub.id)}
                    aria-label={`Toggle step ${sub.title}`}
                    className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                      sub.completed
                        ? 'bg-[#6B7F6E] border border-[#6B7F6E] text-[#FAF8F5]'
                        : 'border border-[#5E5A54] hover:border-[#C85A32]'
                    }`}
                  >
                    {sub.completed && <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />}
                  </button>
                  <span
                    className={`flex-1 text-[13px] ${
                      sub.completed ? 'text-[#9C968B] line-through' : 'text-[#181715]'
                    }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    aria-label={`Remove step ${sub.title}`}
                    className="p-1 text-[#9C968B] hover:text-[#BA1A1A] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add an intermediate step..."
                aria-label="New intermediate step"
                className="flex-1 px-3 py-1.5 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] focus:bg-[#FAF8F5] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#181715] rounded-sm text-[12px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Editorial Notes */}
          <div className="pt-4 border-t border-[#E5E1D8]">
            <label
              htmlFor="inspector-notes"
              className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-2"
            >
              Desk Notes &amp; Context
            </label>
            <textarea
              id="inspector-notes"
              rows={5}
              value={task.notes}
              onChange={(e) => onUpdateTask(task.id, { notes: e.target.value })}
              placeholder="Record specifications, measurements, or context for this commitment..."
              className="w-full px-3.5 py-2.5 text-[14px] leading-[22px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] focus:bg-[#FAF8F5] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3.5 bg-[#F8F6F0] border-t border-[#E5E1D8] flex items-center justify-between">
          <span className="text-[12px] text-[#5E5A54] tabular-nums">
            {task.focusSessions} focus {task.focusSessions === 1 ? 'session' : 'sessions'} logged
          </span>
          <button
            type="button"
            onClick={() => {
              onDeleteTask(task.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6]/40 rounded-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Delete Entry</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
