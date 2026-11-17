'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  ExternalLink,
  DollarSign,
  User,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { TrackerState, JobItem } from '@/types/tracker';
import { JOB_STATUSES } from '@/constants/curriculum';
import { getStatusBadgeStyle, uid, getIsoDate, cn } from '@/lib/utils';

interface JobsTabProps {
  state: TrackerState;
  onOpenJobDrawer: (job: JobItem) => void;
  onAddJob: (newJob: JobItem) => void;
}

export const JobsTab: React.FC<JobsTabProps> = ({
  state,
  onOpenJobDrawer,
  onAddJob,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const jobs = state.col.jobs || [];

  const handleAddNew = () => {
    const todayIso = getIsoDate(new Date());
    const newJob: JobItem = {
      id: uid(),
      company: '',
      role: 'DevOps / Platform Engineer',
      status: 'Applied',
      url: '',
      applied: todayIso,
      follow: '',
      contact: '',
      band: '',
      notes: '',
      links: [],
      imgs: [],
    };
    onAddJob(newJob);
    onOpenJobDrawer(newJob);
  };

  const filteredJobs =
    filterStatus === 'All'
      ? jobs
      : jobs.filter((j) => j.status === filterStatus);

  const totalApplied = jobs.filter((j) => j.status !== 'Wishlist').length;
  const inInterviews = jobs.filter((j) =>
    ['Screening', 'Interview'].includes(j.status)
  ).length;
  const offersCount = jobs.filter((j) => j.status === 'Offer').length;

  const todayIso = getIsoDate(new Date());

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Job Application Pipeline</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {jobs.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track applications, interview rounds, follow-up dates, and offers.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Target & KPI Bar */}
      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-purple-500" />
          <span>
            <strong>Pace Target:</strong> 10 to 20 applications a week starting from Day 47.
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span>Applied: {totalApplied}</span>
          <span>·</span>
          <span>Interviews: {inInterviews}</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400">Offers: {offersCount}</span>
        </div>
      </div>

      {/* Status Filter Segment */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setFilterStatus('All')}
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
            filterStatus === 'All'
              ? 'bg-purple-600 border-purple-600 text-white font-semibold'
              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          )}
        >
          All ({jobs.length})
        </button>
        {JOB_STATUSES.map((status) => {
          const count = jobs.filter((j) => j.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
                filterStatus === status
                  ? 'bg-purple-600 border-purple-600 text-white font-semibold'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              )}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredJobs.map((job) => {
          const isFollowUpDue =
            job.follow &&
            job.follow <= todayIso &&
            ['Applied', 'Screening', 'Interview'].includes(job.status);

          return (
            <div
              key={job.id}
              onClick={() => onOpenJobDrawer(job)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {job.company || 'Unnamed Company'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {job.role}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isFollowUpDue && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Follow-up Due!
                    </span>
                  )}
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                      getStatusBadgeStyle(job.status)
                    )}
                  >
                    {job.status}
                  </span>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 mb-2">
                {job.applied && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Applied: {job.applied}
                  </span>
                )}
                {job.follow && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    Follow-up: {job.follow}
                  </span>
                )}
                {job.contact && (
                  <span className="flex items-center gap-1 truncate max-w-xs">
                    <User className="w-3 h-3" />
                    {job.contact}
                  </span>
                )}
                {job.band && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <DollarSign className="w-3 h-3" />
                    {job.band}
                  </span>
                )}
              </div>

              {job.notes && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                  <p className="line-clamp-2">{job.notes}</p>
                </div>
              )}

              {job.url && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Posting</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No jobs found. Click &quot;Add Application&quot; to log a new opportunity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
