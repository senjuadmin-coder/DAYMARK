import React, { useEffect, useState } from 'react';
import { X, Flag } from 'lucide-react';
import { AgendaAnchor, FolioProject, TaskCategory, TaskItem, TaskPriority } from '../types';

interface QuickCaptureModalProps {
  isOpen: boolean;
  defaultDate: string;
  folios: FolioProject[];
  onClose: () => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt' | 'focusSessions' | 'subtasks'>) => void;
  onAddAnchor: (anchor: Omit<AgendaAnchor, 'id'>) => void;
}

const CATEGORIES: TaskCategory[] = [
  'Editorial',
  'Studio',
  'Research',
  'Correspondence',
  'Personal',
];

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  defaultDate,
  folios,
  onClose,
  onAddTask,
  onAddAnchor,
}) => {
  const [entryType, setEntryType] = useState<'task' | 'anchor'>('task');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [priority, setPriority] = useState<TaskPriority>('standard');
  const [category, setCategory] = useState<TaskCategory>('Editorial');
  const [folioId, setFolioId] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [notes, setNotes] = useState('');
  const [anchorTime, setAnchorTime] = useState('14:00');
  const [anchorLocation, setAnchorLocation] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(defaultDate);
    }
  }, [isOpen, defaultDate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (entryType === 'task') {
      onAddTask({
        title: title.trim(),
        completed: false,
        date,
        priority,
        category,
        folioId: folioId || undefined,
        estimatedMinutes,
        notes: notes.trim(),
      });
    } else {
      onAddAnchor({
        date,
        time: anchorTime,
        title: title.trim(),
        location: anchorLocation.trim() || undefined,
        completed: false,
      });
    }

    setTitle('');
    setNotes('');
    setAnchorLocation('');
    setPriority('standard');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#181715]/25"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Entry Sheet"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] bg-[#FAF8F5] border border-[#E5E1D8] rounded-sm overflow-hidden"
        style={{ boxShadow: 'rgba(24, 23, 21, 0.04) 0px 4px 20px' }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F8F6F0] border-b border-[#E5E1D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-[20px] font-semibold text-[#181715]">
              New Broadsheet Entry
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#5E5A54] hover:text-[#181715] hover:bg-[#EFECE4] rounded-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm">
            <button
              type="button"
              onClick={() => setEntryType('task')}
              className={`py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer ${
                entryType === 'task'
                  ? 'bg-[#181715] text-[#FAF8F5]'
                  : 'text-[#5E5A54] hover:text-[#181715]'
              }`}
            >
              Ledger Commitment
            </button>
            <button
              type="button"
              onClick={() => setEntryType('anchor')}
              className={`py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer ${
                entryType === 'anchor'
                  ? 'bg-[#181715] text-[#FAF8F5]'
                  : 'text-[#5E5A54] hover:text-[#181715]'
              }`}
            >
              Agenda Anchor
            </button>
          </div>

          <div>
            <label
              htmlFor="quick-capture-title"
              className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1.5"
            >
              {entryType === 'task' ? 'Commitment Description' : 'Anchor Title'}
            </label>
            <input
              id="quick-capture-title"
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                entryType === 'task'
                  ? 'e.g. Proof final galley pages for Autumn Broadsheet'
                  : 'e.g. Studio critique with editorial team'
              }
              className="w-full px-3.5 py-2.5 text-[15px] bg-[#FFFFFF] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
            />
          </div>

          {entryType === 'task' ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                    Discipline
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-2.5 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                    Estimate
                  </label>
                  <select
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                  >
                    <option value={15}>15m</option>
                    <option value={25}>25m</option>
                    <option value={30}>30m</option>
                    <option value={45}>45m</option>
                    <option value={60}>1h</option>
                    <option value={90}>1h 30m</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                    Associate with Folio
                  </label>
                  <select
                    value={folioId}
                    onChange={(e) => setFolioId(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715]"
                  >
                    <option value="">Standalone Ledger Entry</option>
                    {folios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.indexLabel} — {f.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                    Priority
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setPriority((p) => (p === 'primary' ? 'standard' : 'primary'))
                    }
                    className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-sm border text-[13px] font-semibold transition-colors cursor-pointer ${
                      priority === 'primary'
                        ? 'bg-[#C85A32] text-[#FAF8F5] border-[#C85A32]'
                        : 'bg-[#F8F6F0] text-[#5E5A54] border-[#E5E1D8] hover:text-[#181715]'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {priority === 'primary' ? 'Primary Commitment' : 'Standard Commitment'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                  Marginalia / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reference details or opening steps..."
                  className="w-full px-3.5 py-2 text-[14px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={anchorTime}
                  onChange={(e) => setAnchorTime(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54] mb-1">
                  Room / Medium
                </label>
                <input
                  type="text"
                  value={anchorLocation}
                  onChange={(e) => setAnchorLocation(e.target.value)}
                  placeholder="Drafting Room"
                  className="w-full px-3 py-2 text-[13px] bg-[#F8F6F0] border border-[#E5E1D8] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E5E1D8] flex items-center justify-between">
            <span className="text-[11px] text-[#9C968B]">
              Press Esc to dismiss
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] text-[#181715] rounded-sm text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#181715] text-[#FAF8F5] hover:bg-[#C85A32] rounded-sm text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Record Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
