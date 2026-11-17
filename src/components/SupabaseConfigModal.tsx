'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  Check,
  Code2,
} from 'lucide-react';
import { TrackerState } from '@/types/tracker';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: TrackerState;
  onDataSynced?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onDataSynced,
}) => {
  const [loading, setLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
    tableMissing?: boolean;
    mode: string;
    message: string;
    timestamp?: string;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sqlSnippet = `-- Create devops_tracker table in Supabase
CREATE TABLE IF NOT EXISTS devops_tracker (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and public read/write policy
ALTER TABLE devops_tracker ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write" ON devops_tracker;
CREATE POLICY "Allow public read and write" ON devops_tracker FOR ALL USING (true) WITH CHECK (true);`;

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db/status');
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus({
        configured: false,
        connected: false,
        mode: 'error',
        message: 'Could not contact backend API.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handlePushLocalData = async () => {
    setPushLoading(true);
    try {
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentState }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Local tracker data successfully synced to Supabase!');
        onDataSynced?.();
        fetchStatus();
      } else {
        showToast(`Sync failed: ${data.error || data.message || 'Check table existence'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Push error: ${msg}`);
    } finally {
      setPushLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copySqlSnippet = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Supabase Database Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                rmqerbjqfgldmszzfmns.supabase.co
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Connection Status
            </span>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying Supabase connection...</span>
            </div>
          ) : status?.connected ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Connected & Active in Supabase</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {status.message}
              </p>
            </div>
          ) : status?.tableMissing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Connected to Supabase! Table Setup Needed</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your credentials are valid! To enable syncing, run the 5-line SQL script below in your Supabase SQL Editor.
              </p>
            </div>
          ) : status?.configured ? (
            <div className="space-y-1 text-amber-600 dark:text-amber-400 text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Supabase Configured</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{status.message}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Running in Local Storage</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                All data is safely stored in your browser.
              </p>
            </div>
          )}
        </div>

        {/* SQL Schema helper (if table missing or for reference) */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Supabase SQL Script (devops_tracker table)</span>
            </h3>
            <a
              href="https://supabase.com/dashboard/project/rmqerbjqfgldmszzfmns/sql"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Open SQL Editor <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
            <pre className="text-slate-300 whitespace-pre-wrap">{sqlSnippet}</pre>
            <button
              onClick={copySqlSnippet}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2.5 justify-end">
          <button
            onClick={handlePushLocalData}
            disabled={pushLoading}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${pushLoading ? 'animate-spin' : ''}`} />
            <span>Sync Local Data to Supabase</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Toast notification inside modal */}
        {toastMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-blue-600 text-white text-xs text-center font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
