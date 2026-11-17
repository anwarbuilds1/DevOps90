'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Copy,
  Download,
  Upload,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TrackerState, ThemeMode } from '@/types/tracker';
import { SyncStatus, normalizeState } from '@/lib/storage';
import { getDefaultState } from '@/constants/curriculum';

interface SettingsTabProps {
  state: TrackerState;
  syncStatus: SyncStatus;
  onUpdateState: (newState: TrackerState) => void;
  onOpenDbModal: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  state,
  syncStatus,
  onUpdateState,
  onOpenDbModal,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [copiedExport, setCopiedExport] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  const showFeedback = (text: string, type: 'ok' | 'err' = 'ok') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleStartDateChange = (val: string) => {
    if (!val) return;
    onUpdateState({
      ...state,
      start: val,
    });
    showFeedback('Day 0 start date updated!');
  };

  const handleThemeChange = (val: ThemeMode) => {
    onUpdateState({
      ...state,
      theme: val,
    });
    showFeedback(`Theme changed to ${val}`);
  };

  const handleCopyExport = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedExport(true);
    showFeedback('Full tracker data copied to clipboard!');
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleDownloadExport = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `devops-90-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback('Backup file downloaded!');
  };

  const handleImportJson = () => {
    const text = importJsonText.trim();
    if (!text) {
      showFeedback('Please paste JSON text first', 'err');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      const normalized = normalizeState(parsed);
      onUpdateState(normalized);
      setImportJsonText('');
      showFeedback('Tracker data imported and replaced successfully!');
    } catch {
      showFeedback('Invalid JSON format. Please check the backup string.', 'err');
    }
  };

  const handleResetEverything = () => {
    if (resetConfirm) {
      const def = getDefaultState();
      onUpdateState(def);
      setResetConfirm(false);
      showFeedback('All tracker data reset to defaults.');
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <span>Tracker Settings & Data Backup</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure start schedule, theme preferences, Supabase database, and JSON backups.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150 ${
            feedbackMsg.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {feedbackMsg.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Preferences Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Day 0 Roadmap Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={state.start}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Changing this shifts the day number (Day 0..90) relative to current calendar date.
            </p>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Theme Mode
            </label>
            <select
              value={state.theme}
              onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="system">Auto / System Default</option>
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              High-contrast dark mode is optimized for dev environments.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Database Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Supabase Cloud Database
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {syncStatus === 'synced'
                  ? 'Active and synchronizing with your Supabase database.'
                  : 'Currently storing data locally in your browser.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDbModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Database className="w-4 h-4" />
            <span>Configure Supabase / View Status</span>
          </button>
        </div>
      </div>

      {/* Data Export Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Export Data Backup
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedExport ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownloadExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        <textarea
          rows={3}
          readOnly
          value={JSON.stringify(state)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono select-all"
        />
      </div>

      {/* Data Import Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Import & Restore Backup
          </h3>
          <button
            onClick={handleImportJson}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import & Replace</span>
          </button>
        </div>

        <textarea
          rows={3}
          placeholder="Paste exported JSON string here..."
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
        />
      </div>

      {/* Reset Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Reset Everything
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Erases all logged days, custom projects, jobs, questions, and restores default curriculum.
          </p>
        </div>

        <button
          onClick={handleResetEverything}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto ${
            resetConfirm
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{resetConfirm ? 'Tap again to erase all data' : 'Reset Everything'}</span>
        </button>
      </div>
    </div>
  );
};
