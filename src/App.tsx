import { useEffect, useMemo, useState } from 'react';
import {
  AgendaAnchor,
  AppScreen,
  DailyEntry,
  FolioProject,
  TaskItem,
  TimerState,
} from './types';
import { createSeedData } from './data/seedData';
import { toISODate } from './utils/dateUtils';
import { TopBar } from './components/TopBar';
import { ReferenceRail } from './components/ReferenceRail';
import { TodayStudio } from './components/TodayStudio';
import { WeekSpread } from './components/WeekSpread';
import { FolioView } from './components/FolioView';
import { ArchiveView } from './components/ArchiveView';
import { TaskInspectorDrawer } from './components/TaskInspectorDrawer';
import { QuickCaptureModal } from './components/QuickCaptureModal';

const STORAGE_KEY = 'daymark_studio_v1';

interface PersistedState {
  tasks: TaskItem[];
  folios: FolioProject[];
  anchors: AgendaAnchor[];
  dailyEntries: Record<string, DailyEntry>;
}

const TIMER_DURATIONS: Record<'focus' | 'deep' | 'break', number> = {
  focus: 25 * 60,
  deep: 50 * 60,
  break: 15 * 60,
};

function loadInitialState(todayIso: string): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (
        Array.isArray(parsed.tasks) &&
        Array.isArray(parsed.folios) &&
        Array.isArray(parsed.anchors) &&
        parsed.dailyEntries
      ) {
        return parsed;
      }
    }
  } catch {
    // Fall back to fresh seed data if storage is unavailable or malformed
  }
  return createSeedData(todayIso);
}

export default function App() {
  const todayIso = useMemo(() => toISODate(new Date()), []);
  const [state, setState] = useState<PersistedState>(() => loadInitialState(todayIso));

  const [activeScreen, setActiveScreen] = useState<AppScreen>('today');
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [weekAnchorDate, setWeekAnchorDate] = useState<string>(todayIso);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);

  const [timer, setTimer] = useState<TimerState>(() => ({
    mode: 'focus',
    secondsRemaining: TIMER_DURATIONS.focus,
    totalSeconds: TIMER_DURATIONS.focus,
    isRunning: false,
    boundTaskId: state.tasks.find((t) => !t.completed)?.id ?? null,
  }));

  // Persist workspace data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // Global Cmd+K / Ctrl+K shortcut for Quick Capture
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickCaptureOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Live focus timer countdown
  useEffect(() => {
    if (!timer.isRunning) return;
    const interval = window.setInterval(() => {
      setTimer((prev) => {
        if (prev.secondsRemaining <= 1) {
          // Record completed focus session on bound task
          if (prev.mode !== 'break' && prev.boundTaskId) {
            setState((s) => ({
              ...s,
              tasks: s.tasks.map((t) =>
                t.id === prev.boundTaskId
                  ? { ...t, focusSessions: t.focusSessions + 1 }
                  : t
              ),
            }));
          }
          return {
            ...prev,
            secondsRemaining: prev.totalSeconds,
            isRunning: false,
          };
        }
        return {
          ...prev,
          secondsRemaining: prev.secondsRemaining - 1,
        };
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer.isRunning]);

  // Task Handlers
  const handleAddTask = (
    draft: Omit<TaskItem, 'id' | 'createdAt' | 'focusSessions' | 'subtasks'>
  ) => {
    const newTask: TaskItem = {
      ...draft,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subtasks: [],
      focusSessions: 0,
      createdAt: todayIso,
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
  };

  const handleToggleComplete = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      ),
    }));
  };

  const handleUpdateTask = (taskId: string, patch: Partial<TaskItem>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    setTimer((prev) =>
      prev.boundTaskId === taskId ? { ...prev, boundTaskId: null } : prev
    );
  };

  // Anchor Handlers
  const handleAddAnchor = (draft: Omit<AgendaAnchor, 'id'>) => {
    const newAnchor: AgendaAnchor = {
      ...draft,
      id: `anc-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      anchors: [...prev.anchors, newAnchor],
    }));
  };

  const handleToggleAnchor = (id: string) => {
    setState((prev) => ({
      ...prev,
      anchors: prev.anchors.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      ),
    }));
  };

  const handleDeleteAnchor = (id: string) => {
    setState((prev) => ({
      ...prev,
      anchors: prev.anchors.filter((a) => a.id !== id),
    }));
  };

  // Daily Entry Handlers
  const currentDailyEntry: DailyEntry = state.dailyEntries[selectedDate] || {
    date: selectedDate,
    intention: '',
    reflection: '',
    promptIndex: 0,
  };

  const handleUpdateDailyEntry = (date: string, patch: Partial<DailyEntry>) => {
    setState((prev) => {
      const existing: DailyEntry = prev.dailyEntries[date] || {
        date,
        intention: '',
        reflection: '',
        promptIndex: 0,
      };
      return {
        ...prev,
        dailyEntries: {
          ...prev.dailyEntries,
          [date]: { ...existing, ...patch },
        },
      };
    });
  };

  // Folio Handlers
  const handleAddFolio = (
    draft: Omit<FolioProject, 'id' | 'indexLabel' | 'updatedAt'>
  ) => {
    const nextNum = String(state.folios.length + 1).padStart(2, '0');
    const newFolio: FolioProject = {
      ...draft,
      id: `folio-${Date.now()}`,
      indexLabel: `Folio ${nextNum}`,
      updatedAt: todayIso,
    };
    setState((prev) => ({
      ...prev,
      folios: [...prev.folios, newFolio],
    }));
  };

  const handleUpdateFolio = (id: string, patch: Partial<FolioProject>) => {
    setState((prev) => ({
      ...prev,
      folios: prev.folios.map((f) =>
        f.id === id ? { ...f, ...patch, updatedAt: todayIso } : f
      ),
    }));
  };

  // Timer Handlers
  const handleToggleTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleResetTimer = () => {
    setTimer((prev) => ({
      ...prev,
      secondsRemaining: prev.totalSeconds,
      isRunning: false,
    }));
  };

  const handleChangeTimerMode = (mode: 'focus' | 'deep' | 'break') => {
    const duration = TIMER_DURATIONS[mode];
    setTimer((prev) => ({
      ...prev,
      mode,
      totalSeconds: duration,
      secondsRemaining: duration,
      isRunning: false,
    }));
  };

  const handleBindFocusTask = (taskId: string) => {
    setTimer((prev) => {
      if (prev.boundTaskId === taskId) {
        return { ...prev, isRunning: !prev.isRunning };
      }
      const focusDuration = TIMER_DURATIONS.focus;
      return {
        mode: prev.mode === 'break' ? 'focus' : prev.mode,
        totalSeconds: prev.mode === 'break' ? focusDuration : prev.totalSeconds,
        secondsRemaining: prev.mode === 'break' ? focusDuration : prev.totalSeconds,
        isRunning: true,
        boundTaskId: taskId,
      };
    });
  };

  // Derived collections
  const tasksForSelectedDate = state.tasks.filter((t) => t.date === selectedDate);
  const anchorsForSelectedDate = state.anchors.filter((a) => a.date === selectedDate);

  const tasksByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of state.tasks) {
      if (!t.completed) {
        map[t.date] = (map[t.date] || 0) + 1;
      }
    }
    return map;
  }, [state.tasks]);

  const selectedTask = state.tasks.find((t) => t.id === selectedTaskId) || null;
  const boundTask = state.tasks.find((t) => t.id === timer.boundTaskId);

  const handleOpenDay = (iso: string) => {
    setSelectedDate(iso);
    setActiveScreen('today');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#181715]">
      <TopBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
      />

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-5 sm:px-10 py-8 sm:py-10">
        {activeScreen === 'today' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* 3-Column Reference Rail */}
            <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
              <ReferenceRail
                selectedDate={selectedDate}
                todayIso={todayIso}
                onSelectDate={setSelectedDate}
                tasksByDate={tasksByDate}
                anchors={anchorsForSelectedDate}
                onAddAnchor={handleAddAnchor}
                onToggleAnchor={handleToggleAnchor}
                onDeleteAnchor={handleDeleteAnchor}
                timer={timer}
                boundTask={boundTask}
                onToggleTimer={handleToggleTimer}
                onResetTimer={handleResetTimer}
                onChangeTimerMode={handleChangeTimerMode}
              />
            </div>

            {/* 9-Column Work Studio */}
            <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2">
              <TodayStudio
                selectedDate={selectedDate}
                todayIso={todayIso}
                onSelectDate={setSelectedDate}
                tasks={tasksForSelectedDate}
                folios={state.folios}
                dailyEntry={currentDailyEntry}
                onUpdateDailyEntry={handleUpdateDailyEntry}
                onAddTask={handleAddTask}
                onToggleComplete={handleToggleComplete}
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
                timer={timer}
                onBindFocusTask={handleBindFocusTask}
              />
            </div>
          </div>
        )}

        {activeScreen === 'week' && (
          <WeekSpread
            anchorDate={weekAnchorDate}
            todayIso={todayIso}
            tasks={state.tasks}
            anchors={state.anchors}
            folios={state.folios}
            dailyEntries={state.dailyEntries}
            onShiftWeek={setWeekAnchorDate}
            onOpenDay={handleOpenDay}
            onToggleComplete={handleToggleComplete}
            onSelectTask={setSelectedTaskId}
            onAddTask={handleAddTask}
          />
        )}

        {activeScreen === 'folio' && (
          <FolioView
            folios={state.folios}
            tasks={state.tasks}
            todayIso={todayIso}
            onAddFolio={handleAddFolio}
            onUpdateFolio={handleUpdateFolio}
            onAddTask={handleAddTask}
            onToggleComplete={handleToggleComplete}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            timer={timer}
            onBindFocusTask={handleBindFocusTask}
          />
        )}

        {activeScreen === 'archive' && (
          <ArchiveView
            tasks={state.tasks}
            folios={state.folios}
            dailyEntries={state.dailyEntries}
            onRestoreTask={handleToggleComplete}
            onOpenDay={handleOpenDay}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E5E1D8] bg-[#FAF8F5]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#9C968B]">
          <span className="font-serif italic text-[#5E5A54]">
            Daymark — Quiet studio ledger &amp; daily broadsheet
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(true)}
              className="hover:text-[#181715] transition-colors cursor-pointer"
            >
              Quick Capture (⌘K)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveScreen('archive')}
              className="hover:text-[#181715] transition-colors cursor-pointer"
            >
              Archival Digest
            </button>
          </div>
        </div>
      </footer>

      {/* Task Inspector Drawer */}
      <TaskInspectorDrawer
        task={selectedTask}
        folios={state.folios}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onBindFocusTask={handleBindFocusTask}
      />

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        defaultDate={selectedDate}
        folios={state.folios}
        onClose={() => setIsQuickCaptureOpen(false)}
        onAddTask={handleAddTask}
        onAddAnchor={handleAddAnchor}
      />
    </div>
  );
}
