'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  ListTree,
} from 'lucide-react';
import { TrackerState } from '@/types/tracker';
import { WEEKS_DATA, DAILY_TOPICS } from '@/constants/curriculum';
import {
  isDayComplete,
  getTasksForDay,
  formatDayDate,
  cn,
} from '@/lib/utils';

interface PlanTabProps {
  state: TrackerState;
  onOpenDayDrawer: (dayNum: number) => void;
}

export const PlanTab: React.FC<PlanTabProps> = ({ state, onOpenDayDrawer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({
    0: true, // open week 1 by default
  });

  const toggleWeek = (weekIdx: number) => {
    setOpenWeeks((prev) => ({
      ...prev,
      [weekIdx]: !prev[weekIdx],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    WEEKS_DATA.forEach((_, idx) => (all[idx] = true));
    setOpenWeeks(all);
  };

  const collapseAll = () => {
    setOpenWeeks({});
  };

  const query = searchQuery.trim().toLowerCase();

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListTree className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>90-Day DevOps Curriculum</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            13 structured weeks from Linux fundamentals to EKS, GitOps, and Interview mastery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter curriculum by topic (e.g. Docker, Terraform, Prometheus, EKS)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* 13 Weeks Accordion List */}
      <div className="space-y-3">
        {WEEKS_DATA.map((week, weekIdx) => {
          const weekTitle = week[0];
          const daysInWeek: number[] = [];
          for (let j = 0; j < 7; j++) {
            const dayNum = weekIdx * 7 + j;
            if (dayNum <= 90) {
              daysInWeek.push(dayNum);
            }
          }

          // Filter by search query
          const filteredDays = daysInWeek.filter((dayNum) => {
            if (!query) return true;
            const topic = DAILY_TOPICS[dayNum]?.toLowerCase() || '';
            const weekT = weekTitle.toLowerCase();
            return topic.includes(query) || weekT.includes(query);
          });

          // If searching and this week has no matching days, hide it
          if (query && filteredDays.length === 0) {
            return null;
          }

          const completedCount = daysInWeek.filter((d) =>
            isDayComplete(d, state.days[d])
          ).length;
          const isWeekComplete = completedCount === daysInWeek.length;
          const isOpen = query ? true : !!openWeeks[weekIdx];

          return (
            <div
              key={weekIdx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden transition-all shadow-2xs"
            >
              {/* Week Summary Header */}
              <button
                onClick={() => toggleWeek(weekIdx)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-slate-400">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Week {weekIdx + 1}
                      </span>
                      {isWeekComplete && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {weekTitle}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {completedCount}/{daysInWeek.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">days</span>
                  </div>
                  <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden xs:block">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(completedCount / daysInWeek.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </button>

              {/* Day List */}
              {isOpen && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                  {filteredDays.map((dayNum) => {
                    const dayData = state.days[dayNum] || {};
                    const isDone = isDayComplete(dayNum, dayData);
                    const tasks = getTasksForDay(dayNum);
                    const hasNotes = Boolean(dayData.note);
                    const hasLinks = (dayData.links || []).length > 0;
                    const hasImgs = (dayData.imgs || []).length > 0;

                    return (
                      <div
                        key={dayNum}
                        onClick={() => onOpenDayDrawer(dayNum)}
                        className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        {/* Day Number and Title */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-xs font-bold text-slate-400 w-8 flex-shrink-0">
                            D{dayNum}
                          </span>
                          <div className="truncate">
                            <span
                              className={cn(
                                'text-xs font-medium text-slate-900 dark:text-slate-200 truncate',
                                isDone && 'line-through text-slate-400 dark:text-slate-500'
                              )}
                            >
                              {DAILY_TOPICS[dayNum]}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                              {formatDayDate(state.start, dayNum)}
                            </span>
                          </div>

                          {/* Indicators for attachments */}
                          <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                            {hasNotes && (
                              <span title="Has notes">
                                <FileText className="w-3 h-3 text-blue-500" />
                              </span>
                            )}
                            {hasLinks && (
                              <span title="Has links">
                                <LinkIcon className="w-3 h-3 text-purple-500" />
                              </span>
                            )}
                            {hasImgs && (
                              <span title="Has diagrams/images">
                                <ImageIcon className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Task Completion Badges (L, B, P) */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {tasks.map((task) => {
                            const isTaskChecked = !!dayData[task.key];
                            return (
                              <span
                                key={task.key}
                                className={cn(
                                  'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors',
                                  isTaskChecked
                                    ? 'bg-emerald-500 text-white border-emerald-500'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                )}
                                title={`${task.label}: ${isTaskChecked ? 'Done' : 'Pending'}`}
                              >
                                {task.label[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
