'use client';

import React, { useState } from 'react';
import { Bookmark, Plus, ExternalLink } from 'lucide-react';
import { TrackerState, ResourceItem } from '@/types/tracker';
import { uid, cn } from '@/lib/utils';

interface ResourcesTabProps {
  state: TrackerState;
  onOpenResourceDrawer: (resource: ResourceItem) => void;
  onAddResource: (newResource: ResourceItem) => void;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  state,
  onOpenResourceDrawer,
  onAddResource,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const resources = state.col.res || [];

  const handleAddNew = () => {
    const newRes: ResourceItem = {
      id: uid(),
      title: '',
      url: '',
      tag: 'Kubernetes',
      notes: '',
      links: [],
      imgs: [],
    };
    onAddResource(newRes);
    onOpenResourceDrawer(newRes);
  };

  // Collect all unique tags
  const tags = Array.from(
    new Set(resources.map((r) => r.tag).filter(Boolean) as string[])
  );

  const filteredResources =
    selectedTag === 'All'
      ? resources
      : resources.filter((r) => r.tag === selectedTag);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-500" />
            <span>DevOps Knowledge Bookmarks</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {resources.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curate top documentation, architecture patterns, and tools.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedTag('All')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
              selectedTag === 'All'
                ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            All Tags
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
                selectedTag === tag
                  ? 'bg-emerald-600 border-emerald-600 text-white font-semibold'
                  : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            onClick={() => onOpenResourceDrawer(res)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {res.title || 'Untitled Resource'}
                </h3>
                {res.tag && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    {res.tag}
                  </span>
                )}
              </div>

              {res.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {res.notes}
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              {res.url ? (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{res.url.replace(/^https?:\/\//, '')}</span>
                </a>
              ) : (
                <span />
              )}

              <span className="text-[11px] text-slate-400">Click to edit</span>
            </div>
          </div>
        ))}

        {filteredResources.length === 0 && (
          <div className="sm:col-span-2 p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No bookmarks found. Click &quot;Add Resource&quot; to save cheatsheets and docs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
