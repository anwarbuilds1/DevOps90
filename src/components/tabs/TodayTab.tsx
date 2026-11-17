'use client';

import React from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Briefcase,
  Share2,
  FolderGit2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Check,
} from 'lucide-react';
import { TrackerState, DayData, JobItem } from '@/types/tracker';
import { DAILY_TOPICS } from '@/constants/curriculum';
import {
  getDayNumberFromDate,
  formatDayDate,
  getWeekIndex,
  getTasksForDay,
  isSunday,
  isDayComplete,
  hasAnyDayProgress,
  getIsoDate,
  cn,
} from '@/lib/utils';

interface TodayTabProps {
  state: TrackerState;
  onUpdateDay: (dayNum: number, data: Partial<DayData>) => void;
  onOpenDayDrawer: (dayNum: number) => void;
  onOpenJobDrawer: (job: JobItem) => void;
}

export const TodayTab: React.FC<TodayTabProps> = ({
  state,
  onUpdateDay,
  onOpenDayDrawer,
  onOpenJobDrawer,
}) => {
  const currentDayNum = getDayNumberFromDate(state.start);
  const boundedDay = Math.max(0, Math.min(90, currentDayNum));
  const weekIdx = getWeekIndex(boundedDay);
  const todayData = state.days[boundedDay] || {};

  // Total completed days
  const completedDaysCount = DAILY_TOPICS.filter((_, idx) =>
    isDayComplete(idx, state.days[idx])
  ).length;

  // Streak
  let streak = 0;
  let p = Math.min(currentDayNum, 90);
  if (!hasAnyDayProgress(p, state.days[p]) && p > 0) p--;
  while (p >= 0) {
    if (isSunday(p) && !hasAnyDayProgress(p, state.days[p])) {
      p--;
      continue;
    }
    if (!hasAnyDayProgress(p, state.days[p])) break;
    streak++;
    p--;
  }

  // Week metrics
  let weekHours = 0;
  let weekPosts = 0;
  let weekDaysDone = 0;
  for (let i = weekIdx * 7; i < weekIdx * 7 + 7 && i <= 90; i++) {
    const d = state.days[i] || {};
    weekHours += Number(d.h) || 0;
    if (d.p) weekPosts++;
    if (isDayComplete(i, d)) weekDaysDone++;
  }

  // Collections metrics
  const jobs = state.col.jobs;
  const appliedJobsCount = jobs.filter((j) => j.status !== 'Wishlist').length;
  const inProcessJobsCount = jobs.filter((j) =>
    ['Screening', 'Interview', 'Offer'].includes(j.status)
  ).length;
  const publishedPostsCount = state.col.posts.filter(
    (p) => p.status === 'Published'
  ).length;
  const doneProjectsCount = state.col.projects.filter((p) =>
    ['Done', 'Public'].includes(p.status)
  ).length;

  // Missed days (up to 3 recent incomplete days)
  const missedDays: number[] = [];
  for (
    let i = boundedDay - 1;
    i >= 0 && missedDays.length < 3 && i > boundedDay - 8;
    i--
  ) {
    if (!isSunday(i) && !isDayComplete(i, state.days[i])) {
      missedDays.push(i);
    }
  }

  // Due follow-ups
  const todayIso = getIsoDate(new Date());
  const dueJobs = jobs.filter(
    (j) =>
      j.follow &&
      j.follow <= todayIso &&
      ['Applied', 'Screening', 'Interview'].includes(j.status)
  );

  const handleTaskToggle = (taskKey: 'l' | 'b' | 'p', currentVal: boolean) => {
    const nextVal = !currentVal;
    const updatedDay: Partial<DayData> = { [taskKey]: nextVal };

    // Check if toggling this makes all tasks complete
    const tasks = getTasksForDay(boundedDay);
    const wouldBeComplete = tasks.every((t) =>
      t.key === taskKey ? nextVal : !!todayData[t.key]
    );

    if (wouldBeComplete && nextVal) {
      // Trigger festive celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // no-op if confetti fails in some environment
      }
    }

    onUpdateDay(boundedDay, updatedDay);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Today's Focus Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white via-white to-slate-50 dark:from-[#111827] dark:via-[#111827] dark:to-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {currentDayNum < 0
                ? `Starts in ${-currentDayNum} days`
                : currentDayNum > 90
                ? '90 Days Completed'
                : 'Today’s Focus'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {formatDayDate(state.start, boundedDay)} · Week {weekIdx + 1}
            </span>
          </div>

          {todayData.note && (
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Notes recorded
            </span>
          )}
        </div>

        {/* Day Title */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Day {boundedDay}: {DAILY_TOPICS[boundedDay]}
        </h2>

        {/* Task Checkboxes */}
        <div className="flex flex-wrap items-center gap-2.5 mb-5">
          {getTasksForDay(boundedDay).map((task) => {
            const isChecked = !!todayData[task.key];
            return (
              <button
                key={task.key}
                onClick={() => handleTaskToggle(task.key, isChecked)}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer',
                  isChecked
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md flex items-center justify-center border text-white transition-colors',
                    isChecked
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 dark:border-slate-700'
                  )}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span>{task.label}</span>
              </button>
            );
          })}
        </div>

        {/* Open Drawer Action */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => onOpenDayDrawer(boundedDay)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
          >
            <span>Open Notes, Links & Diagrams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {todayData.h && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {todayData.h}h logged today
            </span>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Days Complete */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Days Complete</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {completedDaysCount}
            <span className="text-xs font-normal text-slate-400"> / 91</span>
          </div>
        </div>

        {/* Day Streak */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Day Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {streak}
            <span className="text-xs font-normal text-slate-400"> days</span>
          </div>
        </div>

        {/* Hours This Week */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Week Hours</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {weekHours}
            <span className="text-xs font-normal text-slate-400"> hrs</span>
          </div>
        </div>

        {/* Posts This Week */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Week Posts</span>
            <Share2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {weekPosts}
            <span className="text-xs font-normal text-slate-400"> / 3</span>
          </div>
        </div>

        {/* Total Published Posts */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Published</span>
            <Share2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {publishedPostsCount}
          </div>
        </div>

        {/* Applications Sent */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Applications</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {appliedJobsCount}
          </div>
        </div>

        {/* In Process Jobs */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">In Process</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {inProcessJobsCount}
          </div>
        </div>

        {/* Projects Done */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium">Projects Done</span>
            <FolderGit2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {doneProjectsCount}
            <span className="text-xs font-normal text-slate-400">
              {' '}
              / {state.col.projects.length}
            </span>
          </div>
        </div>
      </div>

      {/* Week Progress Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Week {weekIdx + 1} Progress
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {weekDaysDone} of 7 days completed ({Math.round((weekDaysDone / 7) * 100)}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.round((weekDaysDone / 7) * 100)}%` }}
          />
        </div>
      </div>

      {/* Catch Up Section (if any missed recent days) */}
      {missedDays.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-amber-500/30">
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Catch Up On Recent Days
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {missedDays.map((dayNum) => (
              <div
                key={dayNum}
                onClick={() => onOpenDayDrawer(dayNum)}
                className="py-2.5 flex items-center justify-between text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-slate-500">
                    D{dayNum}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {DAILY_TOPICS[dayNum]}
                  </span>
                </div>
                <span className="text-slate-400">
                  {formatDayDate(state.start, dayNum)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups Due Section */}
      {dueJobs.length > 0 && (
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-blue-500/30">
          <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Follow-ups Due Today ({dueJobs.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dueJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onOpenJobDrawer(job)}
                className="py-2.5 flex items-center justify-between text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {job.company}
                  </span>
                  {job.role && (
                    <span className="text-slate-500 dark:text-slate-400 ml-1.5">
                      · {job.role}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                  Due {job.follow}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
