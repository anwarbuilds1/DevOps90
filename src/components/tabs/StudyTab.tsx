'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Star,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { TrackerState, QuestionItem } from '@/types/tracker';
import { INTERVIEW_TOPICS } from '@/constants/curriculum';
import { uid, cn } from '@/lib/utils';

interface StudyTabProps {
  state: TrackerState;
  onOpenQuestionDrawer: (question: QuestionItem) => void;
  onAddQuestion: (newQuestion: QuestionItem) => void;
}

export const StudyTab: React.FC<StudyTabProps> = ({
  state,
  onOpenQuestionDrawer,
  onAddQuestion,
}) => {
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [weakOnly, setWeakOnly] = useState<boolean>(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<string, boolean>>({});

  const questions = state.col.qs || [];

  const handleAddNew = () => {
    const newQ: QuestionItem = {
      id: uid(),
      q: '',
      topic: 'Kubernetes',
      conf: '3',
      a: '',
      links: [],
      imgs: [],
    };
    onAddQuestion(newQ);
    onOpenQuestionDrawer(newQ);
  };

  const toggleAnswer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterTopic !== 'All' && q.topic !== filterTopic) return false;
    if (weakOnly) {
      const confNum = Number(q.conf);
      if (!confNum || confNum > 2) return false;
    }
    return true;
  });

  const weakCount = questions.filter((q) => {
    const c = Number(q.conf);
    return c && c <= 2;
  }).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span>DevOps Interview Bank</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {questions.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real scenario & architectural interview questions with confidence scoring.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filters & Weak Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Topic Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilterTopic('All')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
              filterTopic === 'All'
                ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            All Topics
          </button>
          {INTERVIEW_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setFilterTopic(topic)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
                filterTopic === topic
                  ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              )}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Weak Only Toggle */}
        <button
          onClick={() => setWeakOnly(!weakOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all self-start sm:self-auto cursor-pointer whitespace-nowrap',
            weakOnly
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Weak Only (Conf ≤ 2): {weakCount}</span>
        </button>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredQuestions.map((q) => {
          const isExpanded = !!expandedAnswers[q.id];
          const confNum = Number(q.conf) || 0;

          return (
            <div
              key={q.id}
              onClick={() => onOpenQuestionDrawer(q)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {q.topic}
                    </span>

                    {/* Confidence Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'w-3 h-3',
                            s <= confNum
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {q.q || 'Untitled Question'}
                  </h3>
                </div>

                {q.a && (
                  <button
                    onClick={(e) => toggleAnswer(q.id, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 self-start cursor-pointer"
                    title={isExpanded ? 'Hide answer' : 'Show answer'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Answer display */}
              {q.a && isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150"
                >
                  {q.a}
                </div>
              )}

              {/* Collapsed peek */}
              {q.a && !isExpanded && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-mono">
                  {q.a}
                </p>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No interview questions found. Click &quot;Add Question&quot; to build your question bank.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
