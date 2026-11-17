import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DayData } from '@/types/tracker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uid = (): string => Math.random().toString(36).slice(2, 10);

export const isSunday = (dayNum: number): boolean => dayNum % 7 === 6;

// Days with Posting duty: Monday (1), Wednesday (3), Friday (5)
export const isPostDay = (dayNum: number): boolean => [1, 3, 5].includes(dayNum % 7);

export const getWeekIndex = (dayNum: number): number => Math.floor(dayNum / 7);

export interface TaskDefinition {
  key: 'l' | 'b' | 'p';
  label: string;
}

export const getTasksForDay = (dayNum: number): TaskDefinition[] => {
  if (isSunday(dayNum)) {
    return [{ key: 'l', label: 'Reviewed' }];
  }
  const tasks: TaskDefinition[] = [
    { key: 'l', label: 'Learn' },
    { key: 'b', label: 'Build' },
  ];
  if (isPostDay(dayNum)) {
    tasks.push({ key: 'p', label: 'Post' });
  }
  return tasks;
};

export const isDayComplete = (dayNum: number, dayData?: DayData): boolean => {
  if (!dayData) return false;
  const tasks = getTasksForDay(dayNum);
  return tasks.every(task => !!dayData[task.key]);
};

export const hasAnyDayProgress = (dayNum: number, dayData?: DayData): boolean => {
  if (!dayData) return false;
  const tasks = getTasksForDay(dayNum);
  return tasks.some(task => !!dayData[task.key]);
};

export const getStartDateObj = (startDateStr: string): Date => {
  return new Date(startDateStr + 'T00:00:00');
};

export const getDayNumberFromDate = (startDateStr: string, targetDate: Date = new Date()): number => {
  const start = getStartDateObj(startDateStr).getTime();
  const current = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const diffDays = Math.floor((current - start) / (24 * 60 * 60 * 1000));
  return diffDays;
};

export const formatDayDate = (startDateStr: string, dayNum: number): string => {
  const start = getStartDateObj(startDateStr).getTime();
  const target = new Date(start + dayNum * 86400000);
  return target.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const getIsoDate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateStreak = (startDateStr: string, days: Record<number, DayData>): number => {
  const currentDayNum = getDayNumberFromDate(startDateStr);
  let streak = 0;
  let pointer = Math.min(Math.max(0, currentDayNum), 90);

  // If today has no progress yet, look backwards from yesterday to not break streak early in the day
  if (!hasAnyDayProgress(pointer, days[pointer]) && pointer > 0) {
    pointer--;
  }

  while (pointer >= 0) {
    // If it's a Sunday with no progress, we can skip or consider it kept
    if (isSunday(pointer) && !hasAnyDayProgress(pointer, days[pointer])) {
      pointer--;
      continue;
    }
    if (!hasAnyDayProgress(pointer, days[pointer])) {
      break;
    }
    streak++;
    pointer--;
  }

  return streak;
};

export const getStatusBadgeStyle = (status: string): string => {
  switch (status) {
    case 'Offer':
    case 'Published':
    case 'Done':
    case 'Public':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'Interview':
    case 'Screening':
    case 'Building':
    case 'Scheduled':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'Rejected':
    case 'Ghosted':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'Applied':
    case 'Draft':
    case 'Planned':
    case 'Wishlist':
    default:
      return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
  }
};

export async function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
