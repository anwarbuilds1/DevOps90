'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';
import { ItemDrawer, DrawerTarget } from '@/components/ItemDrawer';
import { LightboxModal } from '@/components/LightboxModal';
import { SupabaseConfigModal } from '@/components/SupabaseConfigModal';

import { TodayTab } from '@/components/tabs/TodayTab';
import { PlanTab } from '@/components/tabs/PlanTab';
import { ProjectsTab } from '@/components/tabs/ProjectsTab';
import { JobsTab } from '@/components/tabs/JobsTab';
import { PostsTab } from '@/components/tabs/PostsTab';
import { StudyTab } from '@/components/tabs/StudyTab';
import { ResourcesTab } from '@/components/tabs/ResourcesTab';
import { ScoresTab } from '@/components/tabs/ScoresTab';
import { StatsTab } from '@/components/tabs/StatsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';

import {
  TrackerState,
  ActiveTab,
  DayData,
  PostItem,
  ProjectItem,
  JobItem,
  QuestionItem,
  ResourceItem,
  ScoreItem,
  ImageItem,
} from '@/types/tracker';
import {
  loadLocalState,
  saveLocalState,
  normalizeState,
  SyncStatus,
} from '@/lib/storage';
import {
  getDayNumberFromDate,
  calculateStreak,
  getIsoDate,
} from '@/lib/utils';
import { getDefaultState } from '@/constants/curriculum';

export default function TrackerApp() {
  const [state, setState] = useState<TrackerState>(getDefaultState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ImageItem | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingWithDbRef = useRef<boolean>(false);

  // Apply theme to <html> element
  const applyTheme = useCallback((themeMode: string) => {
    if (typeof document === 'undefined') return;
    if (themeMode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (themeMode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // Save to DB (debounced)
  const pushToDatabase = useCallback((trackerData: TrackerState) => {
    if (!isSyncingWithDbRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSyncStatus('saving');

    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: trackerData }),
        });
        const json = await res.json();
        if (json.success) {
          setSyncStatus('synced');
        } else {
          setSyncStatus('local_only');
        }
      } catch (err) {
        console.error('Failed to sync to database:', err);
        setSyncStatus('error');
      }
    }, 800);
  }, []);

  // Master state update wrapper
  const updateState = useCallback(
    (updater: (prev: TrackerState) => TrackerState) => {
      setState((prev) => {
        const next = updater(prev);
        saveLocalState(next);
        pushToDatabase(next);
        return next;
      });
    },
    [pushToDatabase]
  );

  // Initial load & remote sync check
  useEffect(() => {
    const local = loadLocalState();
    setState(local);
    applyTheme(local.theme);
    setIsLoaded(true);

    const checkDbSync = async () => {
      try {
        const statusRes = await fetch('/api/db/status');
        const statusJson = await statusRes.json();

        if (statusJson.configured && statusJson.connected) {
          isSyncingWithDbRef.current = true;
          // Fetch remote data
          const dataRes = await fetch('/api/tracker');
          const dataJson = await dataRes.json();

          if (dataJson.data) {
            const remote = normalizeState(dataJson.data);
            if ((remote.ts || 0) > (local.ts || 0)) {
              // Remote is newer, adopt remote
              setState(remote);
              saveLocalState(remote);
              applyTheme(remote.theme);
            } else if ((local.ts || 0) > (remote.ts || 0)) {
              // Local is newer, push to remote
              fetch('/api/tracker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: local }),
              }).catch(() => {});
            }
          } else {
            // Remote has no data yet, push initial local data
            fetch('/api/tracker', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: local }),
            }).catch(() => {});
          }

          setSyncStatus('synced');
        } else {
          isSyncingWithDbRef.current = false;
          setSyncStatus('local_only');
        }
      } catch (err) {
        console.warn('Could not contact backend for db check:', err);
        isSyncingWithDbRef.current = false;
        setSyncStatus('local_only');
      }
    };

    checkDbSync();
  }, [applyTheme]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    updateState((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      return {
        ...prev,
        theme: nextTheme,
      };
    });
  };

  // Day update handler
  const handleUpdateDay = (dayNum: number, data: Partial<DayData>) => {
    updateState((prev) => {
      const existing = prev.days[dayNum] || {};
      return {
        ...prev,
        days: {
          ...prev.days,
          [dayNum]: {
            ...existing,
            ...data,
          },
        },
      };
    });
  };

  // Generic collection update handler
  const handleUpdateCollectionItem = (
    colKey: 'posts' | 'projects' | 'jobs' | 'qs' | 'res' | 'scores',
    item: PostItem | ProjectItem | JobItem | QuestionItem | ResourceItem | ScoreItem
  ) => {
    updateState((prev) => {
      switch (colKey) {
        case 'posts': {
          const p = item as PostItem;
          const list = [...prev.col.posts];
          const idx = list.findIndex((x) => x.id === p.id);
          if (idx >= 0) list[idx] = p; else list.unshift(p);
          return { ...prev, col: { ...prev.col, posts: list } };
        }
        case 'projects': {
          const p = item as ProjectItem;
          const list = [...prev.col.projects];
          const idx = list.findIndex((x) => x.id === p.id);
          if (idx >= 0) list[idx] = p; else list.unshift(p);
          return { ...prev, col: { ...prev.col, projects: list } };
        }
        case 'jobs': {
          const j = item as JobItem;
          const list = [...prev.col.jobs];
          const idx = list.findIndex((x) => x.id === j.id);
          if (idx >= 0) list[idx] = j; else list.unshift(j);
          return { ...prev, col: { ...prev.col, jobs: list } };
        }
        case 'qs': {
          const q = item as QuestionItem;
          const list = [...prev.col.qs];
          const idx = list.findIndex((x) => x.id === q.id);
          if (idx >= 0) list[idx] = q; else list.unshift(q);
          return { ...prev, col: { ...prev.col, qs: list } };
        }
        case 'res': {
          const r = item as ResourceItem;
          const list = [...prev.col.res];
          const idx = list.findIndex((x) => x.id === r.id);
          if (idx >= 0) list[idx] = r; else list.unshift(r);
          return { ...prev, col: { ...prev.col, res: list } };
        }
        case 'scores': {
          const s = item as ScoreItem;
          const list = [...prev.col.scores];
          const idx = list.findIndex((x) => x.id === s.id);
          if (idx >= 0) list[idx] = s; else list.unshift(s);
          return { ...prev, col: { ...prev.col, scores: list } };
        }
      }
    });

    // Update drawer target item in-place so changes reflect live
    setDrawerTarget((prevTarget) => {
      if (prevTarget && prevTarget.type === colKey) {
        return { type: colKey, item } as DrawerTarget;
      }
      return prevTarget;
    });
  };

  // Generic collection delete handler
  const handleDeleteCollectionItem = (
    colKey: 'posts' | 'projects' | 'jobs' | 'qs' | 'res' | 'scores',
    id: string
  ) => {
    updateState((prev) => {
      switch (colKey) {
        case 'posts':
          return { ...prev, col: { ...prev.col, posts: prev.col.posts.filter((x) => x.id !== id) } };
        case 'projects':
          return { ...prev, col: { ...prev.col, projects: prev.col.projects.filter((x) => x.id !== id) } };
        case 'jobs':
          return { ...prev, col: { ...prev.col, jobs: prev.col.jobs.filter((x) => x.id !== id) } };
        case 'qs':
          return { ...prev, col: { ...prev.col, qs: prev.col.qs.filter((x) => x.id !== id) } };
        case 'res':
          return { ...prev, col: { ...prev.col, res: prev.col.res.filter((x) => x.id !== id) } };
        case 'scores':
          return { ...prev, col: { ...prev.col, scores: prev.col.scores.filter((x) => x.id !== id) } };
      }
    });
  };

  // Add handlers for new items
  const handleAddPost = (p: PostItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, posts: [p, ...prev.col.posts] } }));
  const handleAddProject = (p: ProjectItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, projects: [p, ...prev.col.projects] } }));
  const handleAddJob = (j: JobItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, jobs: [j, ...prev.col.jobs] } }));
  const handleAddQuestion = (q: QuestionItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, qs: [q, ...prev.col.qs] } }));
  const handleAddResource = (r: ResourceItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, res: [r, ...prev.col.res] } }));
  const handleAddScore = (s: ScoreItem) => updateState((prev) => ({ ...prev, col: { ...prev.col, scores: [s, ...prev.col.scores] } }));

  // Derived metrics for UI
  const currentDayNum = getDayNumberFromDate(state.start);
  const streak = calculateStreak(state.start, state.days);

  const todayIso = getIsoDate(new Date());
  const dueJobsCount = (state.col.jobs || []).filter(
    (j) =>
      j.follow &&
      j.follow <= todayIso &&
      ['Applied', 'Screening', 'Interview'].includes(j.status)
  ).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#090d16] text-slate-500 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Initializing DevOps 90 Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors pb-24 md:pb-12">
      {/* Top Header */}
      <Header
        currentDay={currentDayNum}
        streak={streak}
        syncStatus={syncStatus}
        theme={state.theme}
        onThemeToggle={handleThemeToggle}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        dueJobsCount={dueJobsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5">
        {activeTab === 'today' && (
          <TodayTab
            state={state}
            onUpdateDay={handleUpdateDay}
            onOpenDayDrawer={(dayNum) => setDrawerTarget({ type: 'day', dayNum })}
            onOpenJobDrawer={(job) => setDrawerTarget({ type: 'jobs', item: job })}
          />
        )}

        {activeTab === 'plan' && (
          <PlanTab
            state={state}
            onOpenDayDrawer={(dayNum) => setDrawerTarget({ type: 'day', dayNum })}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            state={state}
            onOpenProjectDrawer={(project) =>
              setDrawerTarget({ type: 'projects', item: project })
            }
            onAddProject={handleAddProject}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsTab
            state={state}
            onOpenJobDrawer={(job) => setDrawerTarget({ type: 'jobs', item: job })}
            onAddJob={handleAddJob}
          />
        )}

        {activeTab === 'posts' && (
          <PostsTab
            state={state}
            onOpenPostDrawer={(post) => setDrawerTarget({ type: 'posts', item: post })}
            onAddPost={handleAddPost}
          />
        )}

        {activeTab === 'study' && (
          <StudyTab
            state={state}
            onOpenQuestionDrawer={(q) => setDrawerTarget({ type: 'qs', item: q })}
            onAddQuestion={handleAddQuestion}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesTab
            state={state}
            onOpenResourceDrawer={(res) => setDrawerTarget({ type: 'res', item: res })}
            onAddResource={handleAddResource}
          />
        )}

        {activeTab === 'scores' && (
          <ScoresTab
            state={state}
            onOpenScoreDrawer={(score) =>
              setDrawerTarget({ type: 'scores', item: score })
            }
            onAddScore={handleAddScore}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab
            state={state}
            onOpenDayDrawer={(dayNum) => setDrawerTarget({ type: 'day', dayNum })}
            onOpenQuestionDrawer={(q) => setDrawerTarget({ type: 'qs', item: q })}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            state={state}
            syncStatus={syncStatus}
            onUpdateState={(newState) => {
              setState(newState);
              saveLocalState(newState);
              pushToDatabase(newState);
              applyTheme(newState.theme);
            }}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        )}
      </main>

      {/* Item Detail Sheet / Drawer */}
      <ItemDrawer
        target={drawerTarget}
        startDate={state.start}
        dayData={drawerTarget?.type === 'day' ? state.days[drawerTarget.dayNum] : undefined}
        onClose={() => setDrawerTarget(null)}
        onUpdateDay={handleUpdateDay}
        onUpdateCollectionItem={handleUpdateCollectionItem}
        onDeleteCollectionItem={handleDeleteCollectionItem}
        onOpenLightbox={(img) => setLightboxImage(img)}
      />

      {/* Full-screen Lightbox for diagrams / images */}
      <LightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Supabase Connection & Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        currentState={state}
        onDataSynced={() => setSyncStatus('synced')}
      />
    </div>
  );
}
