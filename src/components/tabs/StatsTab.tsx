'use client';

import React from 'react';
import {
  BarChart3,
  Clock,
  Briefcase,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { TrackerState, QuestionItem } from '@/types/tracker';
import { DAILY_TOPICS, JOB_STATUSES } from '@/constants/curriculum';
import { getDayNumberFromDate, cn } from '@/lib/utils';

interface StatsTabProps {
  state: TrackerState;
  onOpenDayDrawer: (dayNum: number) => void;
  onOpenQuestionDrawer: (question: QuestionItem) => void;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  state,
  onOpenDayDrawer,
  onOpenQuestionDrawer,
}) => {
  const currentDayNum = Math.min(Math.max(0, getDayNumberFromDate(state.start)), 90);

  // 14 days hours array
  const last14Days: { dayNum: number; hours: number }[] = [];
  for (let i = currentDayNum - 13; i <= currentDayNum; i++) {
    const hours = i >= 0 && state.days[i] ? Number(state.days[i].h) || 0 : 0;
    last14Days.push({ dayNum: i, hours });
  }

  const maxHoursInWindow = Math.max(1, ...last14Days.map((d) => d.hours));

  // Total hours across all days
  const totalHours = Object.values(state.days).reduce(
    (sum, d) => sum + (Number(d.h) || 0),
    0
  );

  // Jobs funnel
  const jobs = state.col.jobs || [];
  const totalJobs = jobs.length;

  // Revisit days (confidence <= 2)
  const revisitDays = Object.keys(state.days)
    .map(Number)
    .filter((d) => {
      const c = Number(state.days[d]?.c);
      return c && c <= 2;
    })
    .sort((a, b) => a - b);

  // Weak interview questions (confidence <= 2)
  const weakQuestions = (state.col.qs || []).filter((q) => {
    const c = Number(q.conf);
    return c && c <= 2;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span>Progress & Analytics</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visualize your dedication, application pipeline conversion, and weak domains.
        </p>
      </div>

      {/* 14-Day Study Hours Histogram */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Daily Study Hours (Last 14 Days)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total <strong>{totalHours} hours</strong> logged across all 90 days
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Peak: {maxHoursInWindow}h
          </span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="h-32 flex items-end gap-1.5 sm:gap-2 pt-4 px-1 border-b border-slate-200 dark:border-slate-800">
          {last14Days.map((item, idx) => {
            const heightPercent = Math.max(6, (item.hours / maxHoursInWindow) * 100);
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onClick={() => {
                  if (item.dayNum >= 0) onOpenDayDrawer(item.dayNum);
                }}
              >
                <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono mb-1">
                  {item.hours}h
                </div>
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all',
                    item.hours > 0
                      ? 'bg-blue-600 dark:bg-blue-500 group-hover:bg-blue-700 dark:group-hover:bg-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800'
                  )}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] text-slate-400 mt-1 font-mono">
                  {item.dayNum >= 0 ? `D${item.dayNum}` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Application Funnel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span>Job Funnel Conversion</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {totalJobs} total positions tracked
          </span>
        </div>

        <div className="space-y-2.5">
          {JOB_STATUSES.map((status) => {
            const count = jobs.filter((j) => j.status === status).length;
            const pct = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {status}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      status === 'Offer'
                        ? 'bg-emerald-500'
                        : ['Interview', 'Screening'].includes(status)
                        ? 'bg-amber-500'
                        : ['Rejected', 'Ghosted'].includes(status)
                        ? 'bg-rose-500'
                        : 'bg-purple-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Areas Grid: Revisit Days & Weak Interview Questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Revisit Days */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Revisit These Days (Confidence ≤ 2)
            </h3>
          </div>

          {revisitDays.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {revisitDays.map((dayNum) => (
                <div
                  key={dayNum}
                  onClick={() => onOpenDayDrawer(dayNum)}
                  className="py-2 flex items-center justify-between text-xs hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                >
                  <span className="font-mono font-bold text-slate-500 w-8">
                    D{dayNum}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-200 truncate flex-1 px-2">
                    {DAILY_TOPICS[dayNum]}
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold px-1.5 py-0.5 rounded bg-amber-500/10">
                    Conf: {state.days[dayNum]?.c}/5
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No days rated with low confidence yet. Rate a day 1 or 2 for confidence in its detail view to flag it for review.
            </p>
          )}
        </div>

        {/* Weak Interview Questions */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Weak Interview Questions (Confidence ≤ 2)
            </h3>
          </div>

          {weakQuestions.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {weakQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => onOpenQuestionDrawer(q)}
                  className="py-2 flex items-center justify-between text-xs hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  <span className="font-medium text-slate-900 dark:text-slate-200 truncate flex-1 pr-2">
                    {q.q}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 whitespace-nowrap">
                    {q.topic}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No weak interview questions flagged. Rate a question 1 or 2 stars to practice it here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
