import React, { useState } from 'react';
import { Download, RotateCcw, Search, Check } from 'lucide-react';
import { DailyEntry, FolioProject, TaskItem } from '../types';
import { formatLongDate, formatMinutesHuman, getVolumeLabel } from '../utils/dateUtils';

interface ArchiveViewProps {
  tasks: TaskItem[];
  folios: FolioProject[];
  dailyEntries: Record<string, DailyEntry>;
  onRestoreTask: (taskId: string) => void;
  onOpenDay: (iso: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  tasks,
  folios,
  dailyEntries,
  onRestoreTask,
  onOpenDay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'ledger' | 'reflections'>('ledger');

  const folioMap = new Map(folios.map((f) => [f.id, f]));

  const completedTasks = tasks
    .filter((t) => t.completed)
    .filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const groupedByDate = completedTasks.reduce<Record<string, TaskItem[]>>((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const reflectionDates = Object.keys(dailyEntries)
    .filter((d) => dailyEntries[d].reflection.trim() || dailyEntries[d].intention.trim())
    .filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        dailyEntries[d].reflection.toLowerCase().includes(q) ||
        dailyEntries[d].intention.toLowerCase().includes(q) ||
        d.includes(q)
      );
    })
    .sort((a, b) => b.localeCompare(a));

  const totalFocusSessions = completedTasks.reduce((s, t) => s + t.focusSessions, 0);
  const totalArchivedMinutes = completedTasks.reduce(
    (s, t) => s + (t.estimatedMinutes || 0),
    0
  );

  const handleExportMarkdown = () => {
    const lines: string[] = [
      '# Daymark Archival Digest',
      '',
      `Exported: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      '',
      '## Completed Commitments',
      '',
    ];

    for (const date of sortedDates) {
      lines.push(`### ${formatLongDate(date)} (${getVolumeLabel(date)})`);
      for (const t of groupedByDate[date]) {
        const folio = t.folioId ? folioMap.get(t.folioId) : undefined;
        lines.push(
          `- [x] ${t.title} — *${t.category}*${
            folio ? ` (${folio.indexLabel}: ${folio.title})` : ''
          }`
        );
      }
      lines.push('');
    }

    lines.push('## Daily Intentions & Marginalia', '');
    for (const date of reflectionDates) {
      const e = dailyEntries[date];
      lines.push(`### ${formatLongDate(date)}`);
      if (e.intention) lines.push(`> "${e.intention}"`);
      if (e.reflection) lines.push('', e.reflection);
      lines.push('');
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daymark-archive-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-[#E5E1D8] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5E5A54]">
            Chronological Record &amp; Marginalia
          </span>
          <h1 className="mt-2 font-serif text-[34px] sm:text-[42px] leading-[44px] font-semibold tracking-[-0.02em] text-[#181715]">
            Archival Ledger
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[#5E5A54] tabular-nums">
            <span>{completedTasks.length} completed entries</span>
            <span aria-hidden="true" className="text-[#9C968B]">·</span>
            <span>{formatMinutesHuman(totalArchivedMinutes)} logged</span>
            <span aria-hidden="true" className="text-[#9C968B]">·</span>
            <span>{totalFocusSessions} focus sessions</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8F6F0] border border-[#E5E1D8] hover:bg-[#EFECE4] hover:border-[#181715] text-[#181715] rounded-sm text-[13px] font-semibold transition-colors self-start md:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export Digest (.md)</span>
        </button>
      </header>

      {/* Search & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#F8F6F0] border border-[#E5E1D8] rounded-sm w-fit">
          <button
            type="button"
            onClick={() => setTab('ledger')}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer ${
              tab === 'ledger'
                ? 'bg-[#181715] text-[#FAF8F5]'
                : 'text-[#5E5A54] hover:text-[#181715]'
            }`}
          >
            Completed Commitments
          </button>
          <button
            type="button"
            onClick={() => setTab('reflections')}
            className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-sm transition-colors cursor-pointer ${
              tab === 'reflections'
                ? 'bg-[#181715] text-[#FAF8F5]'
                : 'text-[#5E5A54] hover:text-[#181715]'
            }`}
          >
            Intentions &amp; Reflections
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-[#9C968B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archive..."
            aria-label="Search archive"
            className="w-full pl-9 pr-3.5 py-2 text-[14px] bg-[#FAF8F5] border border-[#E5E1D8] focus:border-[1.5px] focus:border-[#C85A32] rounded-sm text-[#181715] placeholder:text-[#9C968B]"
          />
        </div>
      </div>

      {/* Tab Content */}
      {tab === 'ledger' ? (
        sortedDates.length === 0 ? (
          <div className="py-16 text-center bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm">
            <p className="font-serif italic text-[18px] text-[#5E5A54]">
              No completed entries match this archival filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <section key={date} className="space-y-2">
                <div className="flex items-baseline justify-between pb-2 border-b border-[#E5E1D8]">
                  <button
                    type="button"
                    onClick={() => onOpenDay(date)}
                    className="font-serif text-[20px] font-semibold text-[#181715] hover:text-[#C85A32] transition-colors cursor-pointer"
                  >
                    {formatLongDate(date)}
                  </button>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9C968B] tabular-nums">
                    {getVolumeLabel(date)}
                  </span>
                </div>

                <div className="divide-y divide-[#E5E1D8] border-b border-[#E5E1D8]">
                  {groupedByDate[date].map((task) => {
                    const folio = task.folioId ? folioMap.get(task.folioId) : undefined;
                    return (
                      <div
                        key={task.id}
                        className="py-3 px-2 flex items-start justify-between gap-4 hover:bg-[#F8F6F0] transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-1 w-4 h-4 rounded-full bg-[#6B7F6E] text-[#FAF8F5] flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <div className="text-[15px] text-[#5E5A54] line-through decoration-[#9C968B]/60">
                              {task.title}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[#9C968B]">
                              <span className="text-[#6B7F6E] font-medium">
                                {task.category}
                              </span>
                              {folio && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {folio.indexLabel}: {folio.title}
                                  </span>
                                </>
                              )}
                              {task.estimatedMinutes > 0 && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="tabular-nums">
                                    {formatMinutesHuman(task.estimatedMinutes)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRestoreTask(task.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E1D8] hover:border-[#181715] text-[11px] font-semibold text-[#5E5A54] hover:text-[#181715] rounded-sm transition-colors shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" aria-hidden="true" />
                          <span>Restore</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )
      ) : reflectionDates.length === 0 ? (
        <div className="py-16 text-center bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm">
          <p className="font-serif italic text-[18px] text-[#5E5A54]">
            No daily reflections recorded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reflectionDates.map((date) => {
            const entry = dailyEntries[date];
            return (
              <article
                key={date}
                className="bg-[#F8F6F0] border border-[#E8E4DA] rounded-sm p-6"
              >
                <div className="flex items-baseline justify-between pb-3 border-b border-[#E5E1D8]">
                  <button
                    type="button"
                    onClick={() => onOpenDay(date)}
                    className="font-serif text-[20px] font-semibold text-[#181715] hover:text-[#C85A32] transition-colors cursor-pointer"
                  >
                    {formatLongDate(date)}
                  </button>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9C968B] tabular-nums">
                    {getVolumeLabel(date)}
                  </span>
                </div>

                {entry.intention && (
                  <p className="mt-4 font-serif italic text-[18px] leading-[26px] text-[#181715]">
                    “{entry.intention}”
                  </p>
                )}

                {entry.reflection && (
                  <p className="mt-3 text-[15px] leading-[24px] text-[#5E5A54] max-w-3xl">
                    {entry.reflection}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
