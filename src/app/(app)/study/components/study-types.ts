// Shared types for the Study components. Dates are "YYYY-MM-DD" strings in Asia/Kolkata.

export type Subject = {
  id: string;
  name: string;
};

export type StudyRecord = {
  id: string;
  subjectId: string;
  subjectName: string; // kept in sync on rename, preserved after subject delete
  dateKey: string;
  minutes: number;
};

export type Mood = 'great' | 'good' | 'okay' | 'low' | 'tired';

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function sumHours(records: StudyRecord[]): string {
  const minutes = records.reduce((sum, r) => sum + r.minutes, 0);
  return (minutes / 60).toFixed(1);
}
