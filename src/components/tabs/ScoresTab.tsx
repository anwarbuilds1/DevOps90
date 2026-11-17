'use client';

import React from 'react';
import { Award, Plus, Calendar } from 'lucide-react';
import { TrackerState, ScoreItem } from '@/types/tracker';
import { uid, getIsoDate, cn } from '@/lib/utils';

interface ScoresTabProps {
  state: TrackerState;
  onOpenScoreDrawer: (score: ScoreItem) => void;
  onAddScore: (newScore: ScoreItem) => void;
}

export const ScoresTab: React.FC<ScoresTabProps> = ({
  state,
  onOpenScoreDrawer,
  onAddScore,
}) => {
  const scores = state.col.scores || [];

  const handleAddNew = () => {
    const todayIso = getIsoDate(new Date());
    const newScore: ScoreItem = {
      id: uid(),
      name: '',
      date: todayIso,
      score: 80,
      notes: '',
      links: [],
      imgs: [],
    };
    onAddScore(newScore);
    onOpenScoreDrawer(newScore);
  };

  const validScores = scores
    .map((s) => Number(s.score))
    .filter((s) => !isNaN(s) && s > 0);

  const averageScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

  const highestScore =
    validScores.length > 0 ? Math.max(...validScores) : 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Practice Exam & Certification Scores</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {scores.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track results for AWS Solutions Architect (SAA), CKA, mock exams, and technical quizzes.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Score</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Tests Logged
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {scores.length}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Average Score
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {averageScore}%
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Highest Score
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {highestScore}%
          </span>
        </div>
      </div>

      {/* Scores List */}
      <div className="grid grid-cols-1 gap-3">
        {scores.map((sc) => {
          const scoreNum = Number(sc.score);
          const isPassing = scoreNum >= 72; // typical SAA passing mark is 72%

          return (
            <div
              key={sc.id}
              onClick={() => onOpenScoreDrawer(sc)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all cursor-pointer shadow-2xs group flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {sc.name || 'Untitled Exam'}
                </h3>
                {sc.date && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Calendar className="w-3 h-3" />
                    {sc.date}
                  </span>
                )}
                {sc.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mt-1">
                    {sc.notes}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span
                  className={cn(
                    'text-xl font-black block',
                    isPassing
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {sc.score !== '' && sc.score != null ? `${sc.score}%` : '—'}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 border',
                    isPassing
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  )}
                >
                  {isPassing ? 'Passing' : 'Needs Review'}
                </span>
              </div>
            </div>
          );
        })}

        {scores.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No test scores recorded yet. Tap &quot;Add Score&quot; to log your practice tests.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
