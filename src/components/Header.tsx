'use client';

import React from 'react';
import { Flame, Database, Sun, Moon, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SyncStatus } from '@/lib/storage';
import { ThemeMode } from '@/types/tracker';

interface HeaderProps {
  currentDay: number;
  streak: number;
  syncStatus: SyncStatus;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenDbModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  streak,
  syncStatus,
  theme,
  onThemeToggle,
  onOpenDbModal,
}) => {
  const boundedDay = Math.max(0, Math.min(90, currentDay));
  const currentWeek = Math.floor(boundedDay / 7) + 1;

  const renderSyncBadge = () => {
    switch (syncStatus) {
      case 'synced':
        return (
          <button
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="Supabase Database Connected & Synced"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase</span>
            <span>Synced</span>
          </button>
        );
      case 'saving':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'error':
        return (
          <button
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
            title="Database Connection Error. Click to inspect."
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>DB Error</span>
          </button>
        );
      case 'local_only':
      default:
        return (
          <button
            onClick={onOpenDbModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
            title="Running in Local Storage. Click to connect Supabase."
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Local Storage</span>
            <span className="sm:hidden">Local</span>
          </button>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-[#090d16]/80 border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* App Title & Current Day Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
              D90
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                DevOps 90
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
                Day {boundedDay} · Week {currentWeek}
              </p>
            </div>
          </div>

          {/* Day Streak Counter */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            title={`${streak} day streak`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500" />
            <span>{streak}d</span>
          </div>
        </div>

        {/* Right side controls: DB sync status & theme toggle */}
        <div className="flex items-center gap-2">
          {renderSyncBadge()}

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={`Toggle Theme (Current: ${theme})`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
