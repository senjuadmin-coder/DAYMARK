import React from 'react';
import { Check, Play, Pause } from 'lucide-react';
import { FolioProject, TaskItem } from '../types';
import { formatMinutesHuman } from '../utils/dateUtils';

interface TaskRowProps {
  task: TaskItem;
  folio?: FolioProject;
  isSelected: boolean;
  isFocusedTimer: boolean;
  isTimerRunning: boolean;
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onBindFocusTask: (taskId: string) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  folio,
  isSelected,
  isFocusedTimer,
  isTimerRunning,
  onToggleComplete,
  onSelectTask,
  onBindFocusTask,
}) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const isPrimary = task.priority === 'primary';

  return (
    <div
      className={`group relative flex items-start gap-3.5 py-3.5 px-3 border-b border-[#E5E1D8] transition-colors duration-150 ${
        isSelected
          ? 'bg-[#F3EFE6]'
          : 'hover:bg-[#F8F6F0]'
      }`}
    >
      {/* Understated left hairline notch in burnt vermilion for primary commits */}
      {isPrimary && !task.completed && (
        <span
          aria-label="Primary commitment"
          className="absolute left-0 top-3.5 bottom-3.5 w-[2px] bg-[#C85A32]"
        />
      )}

      {/* 18px geometric wireframe circle check-indicator */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task.id);
        }}
        aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
        className={`mt-0.5 w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center transition-colors duration-150 cursor-pointer ${
          task.completed
            ? 'bg-[#6B7F6E] border border-[#6B7F6E] text-[#FAF8F5]'
            : 'border-[1.5px] border-[#5E5A54] hover:border-[#C85A32] bg-transparent'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />}
      </button>

      {/* Main Task Body */}
      <button
        type="button"
        onClick={() => onSelectTask(task.id)}
        className="flex-1 min-w-0 text-left cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
          <span
            className={`text-[15px] leading-[22px] transition-colors duration-150 ${
              task.completed
                ? 'text-[#9C968B] line-through decoration-[#9C968B]/70'
                : 'text-[#181715] font-medium'
            }`}
          >
            {task.title}
          </span>

          {/* Right-aligned quiet tabular metadata */}
          <div className="flex items-center gap-2 text-[12px] text-[#5E5A54] tabular-nums shrink-0">
            {task.scheduledTime && (
              <span>{task.scheduledTime}</span>
            )}
            {task.scheduledTime && task.estimatedMinutes > 0 && (
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
            )}
            {task.estimatedMinutes > 0 && (
              <span className="text-[#9C968B]">{formatMinutesHuman(task.estimatedMinutes)}</span>
            )}
          </div>
        </div>

        {/* Clean unboxed secondary metadata line */}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-[#5E5A54]">
          <span
            className={
              isPrimary && !task.completed
                ? 'text-[#C85A32] font-medium'
                : task.completed
                ? 'text-[#9C968B]'
                : 'text-[#6B7F6E] font-medium'
            }
          >
            {task.category}
          </span>

          {folio && (
            <>
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
              <span className="text-[#5E5A54] truncate max-w-[200px]">
                {folio.indexLabel}: {folio.title}
              </span>
            </>
          )}

          {totalSubtasks > 0 && (
            <>
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
              <span className="tabular-nums text-[#5E5A54]">
                {completedSubtasks}/{totalSubtasks} steps
              </span>
            </>
          )}

          {task.focusSessions > 0 && (
            <>
              <span aria-hidden="true" className="text-[#9C968B]">·</span>
              <span className="tabular-nums text-[#9C968B]">
                {task.focusSessions} {task.focusSessions === 1 ? 'session' : 'sessions'}
              </span>
            </>
          )}
        </div>
      </button>

      {/* Focus trigger affordance */}
      {!task.completed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBindFocusTask(task.id);
          }}
          aria-label={
            isFocusedTimer && isTimerRunning
              ? `Pause focus timer on ${task.title}`
              : `Focus timer on ${task.title}`
          }
          title="Set as active focus task"
          className={`mt-0.5 px-2 py-1 rounded-sm border text-[11px] font-semibold tracking-[0.03em] uppercase transition-all duration-150 shrink-0 flex items-center gap-1 cursor-pointer ${
            isFocusedTimer
              ? 'bg-[#C85A32] text-[#FAF8F5] border-[#C85A32] opacity-100'
              : 'bg-[#FAF8F5] text-[#5E5A54] border-[#E5E1D8] hover:border-[#181715] hover:text-[#181715] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100'
          }`}
        >
          {isFocusedTimer && isTimerRunning ? (
            <>
              <Pause className="w-2.5 h-2.5" aria-hidden="true" />
              <span>Active</span>
            </>
          ) : (
            <>
              <Play className="w-2.5 h-2.5" aria-hidden="true" />
              <span>Focus</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
