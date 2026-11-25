export type AppScreen = 'today' | 'week' | 'folio' | 'archive';

export type TaskCategory = 'Editorial' | 'Studio' | 'Research' | 'Personal' | 'Correspondence';

export type TaskPriority = 'primary' | 'standard';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  date: string; // YYYY-MM-DD
  priority: TaskPriority;
  category: TaskCategory;
  folioId?: string;
  estimatedMinutes: number;
  scheduledTime?: string; // e.g., "09:30"
  notes: string;
  subtasks: SubTask[];
  focusSessions: number;
  createdAt: string;
}

export interface AgendaAnchor {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "09:00"
  endTime?: string;
  title: string;
  location?: string;
  completed?: boolean;
}

export interface FolioProject {
  id: string;
  indexLabel: string; // e.g., "Folio 01"
  title: string;
  subtitle: string;
  category: TaskCategory;
  brief: string;
  status: 'Active' | 'In Review' | 'Archived';
  updatedAt: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  intention: string;
  reflection: string;
  promptIndex: number;
}

export interface TimerState {
  mode: 'focus' | 'deep' | 'break';
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  boundTaskId: string | null;
}
