export type ThemeMode = 'light' | 'dark' | 'system';

export type JobStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Ghosted';

export type PostStatus = 'Draft' | 'Scheduled' | 'Published';

export type ProjectStatus = 'Planned' | 'Building' | 'Done' | 'Public';

export type InterviewTopic =
  | 'Linux'
  | 'Networking'
  | 'Docker'
  | 'CI/CD'
  | 'AWS'
  | 'Terraform'
  | 'Kubernetes'
  | 'Observability'
  | 'Security'
  | 'Behavioral'
  | 'Design';

export interface LinkItem {
  t: string; // Title / label
  u: string; // URL
}

export interface ImageItem {
  u: string; // Base64 or URL
  c?: string; // Caption
  id?: string;
}

export interface DayData {
  l?: boolean; // Learn (or Reviewed on Sundays)
  b?: boolean; // Build
  p?: boolean; // Post (Mon, Wed, Fri)
  h?: number | string; // Hours worked
  c?: number | string; // Confidence (1 to 5)
  note?: string; // Daily reflection / notes
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface PostItem {
  id: string;
  topic: string;
  date: string;
  status: PostStatus;
  url: string;
  likes?: number | string;
  cmts?: number | string;
  notes?: string;
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface ProjectItem {
  id: string;
  name: string;
  status: ProjectStatus;
  repo: string;
  demo: string;
  chk?: Record<string, boolean>; // Checklist items (e.g., README, Diagram, etc.)
  notes?: string;
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface JobItem {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  url: string;
  applied?: string;
  follow?: string;
  contact?: string;
  band?: string;
  notes?: string;
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface QuestionItem {
  id: string;
  q: string;
  topic: InterviewTopic;
  conf?: string | number; // 1 to 5
  a?: string; // Answer
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  tag?: string;
  notes?: string;
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface ScoreItem {
  id: string;
  name: string;
  date: string;
  score?: number | string;
  notes?: string;
  links?: LinkItem[];
  imgs?: ImageItem[];
}

export interface TrackerCollections {
  posts: PostItem[];
  projects: ProjectItem[];
  jobs: JobItem[];
  qs: QuestionItem[];
  res: ResourceItem[];
  scores: ScoreItem[];
}

export interface TrackerState {
  start: string; // YYYY-MM-DD
  theme: ThemeMode;
  days: Record<number, DayData>;
  col: TrackerCollections;
  ts: number;
}

export type ActiveTab =
  | 'today'
  | 'plan'
  | 'projects'
  | 'jobs'
  | 'posts'
  | 'study'
  | 'resources'
  | 'scores'
  | 'stats'
  | 'settings';
