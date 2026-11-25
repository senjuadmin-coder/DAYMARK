export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, delta: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + delta);
  return toISODate(d);
}

export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekdayShort(iso: string): string {
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getVolumeLabel(iso: string): string {
  const d = parseISODate(iso);
  const dayNum = getDayOfYear(d);
  const romanYears: Record<number, string> = {
    2024: 'II',
    2025: 'III',
    2026: 'IV',
    2027: 'V',
  };
  const vol = romanYears[d.getFullYear()] || 'IV';
  return `Vol. ${vol} · No. ${String(dayNum).padStart(3, '0')}`;
}

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getWeekDates(anchorIso: string): string[] {
  const d = parseISODate(anchorIso);
  const day = d.getDay(); // 0 = Sun, 1 = Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    return toISODate(cur);
  });
}

export function getMonthCalendarCells(year: number, month: number): Array<{ iso: string; day: number; inMonth: boolean }> {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const leadingEmpty = startWeekday === 0 ? 6 : startWeekday - 1; // Monday-first grid

  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];
  const startDate = new Date(year, month, 1 - leadingEmpty);

  for (let i = 0; i < 42; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    cells.push({
      iso: toISODate(cur),
      day: cur.getDate(),
      inMonth: cur.getMonth() === month,
    });
  }

  return cells;
}

export function formatMinutesHuman(minutes: number): string {
  if (minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatTimerMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
