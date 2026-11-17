import { TrackerState } from '@/types/tracker';
import { getDefaultState } from '@/constants/curriculum';

export type SyncStatus = 'checking' | 'synced' | 'saving' | 'error';

export function normalizeState(raw: unknown): TrackerState {
  const defaults = getDefaultState();
  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const obj = raw as Partial<TrackerState>;

  return {
    start: typeof obj.start === 'string' && obj.start ? obj.start : defaults.start,
    theme: obj.theme || defaults.theme,
    days: obj.days && typeof obj.days === 'object' ? obj.days : {},
    ts: typeof obj.ts === 'number' ? obj.ts : Date.now(),
    col: {
      posts: Array.isArray(obj.col?.posts) ? obj.col.posts : [],
      projects:
        Array.isArray(obj.col?.projects) && obj.col.projects.length > 0
          ? obj.col.projects
          : defaults.col.projects,
      jobs: Array.isArray(obj.col?.jobs) ? obj.col.jobs : [],
      qs: Array.isArray(obj.col?.qs) ? obj.col.qs : defaults.col.qs,
      res: Array.isArray(obj.col?.res) ? obj.col.res : defaults.col.res,
      scores: Array.isArray(obj.col?.scores) ? obj.col.scores : [],
    },
  };
}
