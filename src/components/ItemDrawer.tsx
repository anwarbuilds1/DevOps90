'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Star,
  FileCheck2,
} from 'lucide-react';
import {
  DayData,
  PostItem,
  ProjectItem,
  JobItem,
  QuestionItem,
  ResourceItem,
  ScoreItem,
  LinkItem,
  ImageItem,
} from '@/types/tracker';
import {
  DAILY_TOPICS,
  JOB_STATUSES,
  INTERVIEW_TOPICS,
  PROJECT_CHECKLIST_ITEMS,
} from '@/constants/curriculum';
import {
  getTasksForDay,
  formatDayDate,
  getWeekIndex,
  shrinkImage,
  cn,
} from '@/lib/utils';

export type DrawerTarget =
  | { type: 'day'; dayNum: number }
  | { type: 'posts'; item: PostItem }
  | { type: 'projects'; item: ProjectItem }
  | { type: 'jobs'; item: JobItem }
  | { type: 'qs'; item: QuestionItem }
  | { type: 'res'; item: ResourceItem }
  | { type: 'scores'; item: ScoreItem };

interface ItemDrawerProps {
  target: DrawerTarget | null;
  startDate: string;
  dayData?: DayData;
  onClose: () => void;
  onUpdateDay?: (dayNum: number, data: Partial<DayData>) => void;
  onUpdateCollectionItem?: (
    colKey: 'posts' | 'projects' | 'jobs' | 'qs' | 'res' | 'scores',
    item: PostItem | ProjectItem | JobItem | QuestionItem | ResourceItem | ScoreItem
  ) => void;
  onDeleteCollectionItem?: (
    colKey: 'posts' | 'projects' | 'jobs' | 'qs' | 'res' | 'scores',
    id: string
  ) => void;
  onOpenLightbox?: (image: ImageItem) => void;
}

export const ItemDrawer: React.FC<ItemDrawerProps> = ({
  target,
  startDate,
  dayData,
  onClose,
  onUpdateDay,
  onUpdateCollectionItem,
  onDeleteCollectionItem,
  onOpenLightbox,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!target) return null;

  // Helpers for links
  const handleAddLink = (
    currentLinks: LinkItem[] = [],
    updateFn: (newLinks: LinkItem[]) => void
  ) => {
    let url = newLinkUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    const title = newLinkTitle.trim() || url;
    updateFn([...currentLinks, { t: title, u: url }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (
    currentLinks: LinkItem[] = [],
    idx: number,
    updateFn: (newLinks: LinkItem[]) => void
  ) => {
    const next = [...currentLinks];
    next.splice(idx, 1);
    updateFn(next);
  };

  // Helpers for images
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    currentImgs: ImageItem[] = [],
    updateFn: (newImgs: ImageItem[]) => void
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImgs: ImageItem[] = [...currentImgs];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await shrinkImage(file);
        newImgs.push({
          u: compressedBase64,
          c: imageCaption.trim() || file.name,
        });
      }
      updateFn(newImgs);
      setImageCaption('');
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const handleRemoveImage = (
    currentImgs: ImageItem[] = [],
    idx: number,
    updateFn: (newImgs: ImageItem[]) => void
  ) => {
    const next = [...currentImgs];
    next.splice(idx, 1);
    updateFn(next);
  };

  // Render attachment section (links and images)
  const renderAttachments = (
    links: LinkItem[] = [],
    imgs: ImageItem[] = [],
    updateLinks: (links: LinkItem[]) => void,
    updateImgs: (imgs: ImageItem[]) => void
  ) => (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      {/* Links Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Links & Documentation
        </h3>
        {links.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {links.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <a
                  href={link.u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{link.t || link.u}</span>
                </a>
                <button
                  onClick={() => handleRemoveLink(links, idx, updateLinks)}
                  className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                  title="Remove link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Label (e.g. AWS VPC Docs)"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <input
            type="url"
            placeholder="https://..."
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => handleAddLink(links, updateLinks)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Images & Diagrams Section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Screenshots & Architecture Diagrams
        </h3>
        {imgs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
            {imgs.map((img, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 aspect-video cursor-pointer"
                onClick={() => onOpenLightbox?.(img)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.u}
                  alt={img.c || 'diagram'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {img.c && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate px-1.5">
                    {img.c}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(imgs, idx, updateImgs);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Caption for next image (optional)"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer whitespace-nowrap">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{uploadingImage ? 'Compressing...' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImage}
              onChange={(e) => handleImageUpload(e, imgs, updateImgs)}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            {target.type === 'day' ? (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Day {target.dayNum} · Week {getWeekIndex(target.dayNum) + 1}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {DAILY_TOPICS[target.dayNum]}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDayDate(startDate, target.dayNum)}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {target.type.toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {target.type === 'posts' && (target.item.topic || 'New Post')}
                  {target.type === 'projects' && (target.item.name || 'New Project')}
                  {target.type === 'jobs' && (target.item.company ? `${target.item.company} - ${target.item.role}` : 'New Job Application')}
                  {target.type === 'qs' && 'Interview Question & Answer'}
                  {target.type === 'res' && (target.item.title || 'New Resource')}
                  {target.type === 'scores' && (target.item.name || 'New Exam Score')}
                </h2>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Based on Target Type */}
        <div className="py-4 space-y-4">
          {/* DAY DETAIL */}
          {target.type === 'day' && (
            <>
              {/* Daily Tasks Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Daily Tasks
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {getTasksForDay(target.dayNum).map((task) => {
                    const isChecked = !!dayData?.[task.key];
                    return (
                      <button
                        key={task.key}
                        type="button"
                        onClick={() =>
                          onUpdateDay?.(target.dayNum, {
                            [task.key]: !isChecked,
                          })
                        }
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-md flex items-center justify-center border text-white',
                            isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-700'
                          )}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{task.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hours & Confidence Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Hours Worked
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2.5"
                    value={dayData?.h ?? ''}
                    onChange={(e) =>
                      onUpdateDay?.(target.dayNum, {
                        h: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Understanding Confidence (1 to 5)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const isSelected = Number(dayData?.c) === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            onUpdateDay?.(target.dayNum, {
                              c: isSelected ? '' : lvl,
                            })
                          }
                          className={cn(
                            'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-0.5',
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <Star className={cn('w-3 h-3', isSelected ? 'fill-white' : 'text-slate-400')} />
                          <span>{lvl}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes, What Broke & What I Learned
                </label>
                <textarea
                  rows={5}
                  placeholder="Record your commands, troubleshooting logs, root causes, concepts understood..."
                  value={dayData?.note || ''}
                  onChange={(e) =>
                    onUpdateDay?.(target.dayNum, { note: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-y"
                />
              </div>

              {renderAttachments(
                dayData?.links || [],
                dayData?.imgs || [],
                (links) => onUpdateDay?.(target.dayNum, { links }),
                (imgs) => onUpdateDay?.(target.dayNum, { imgs })
              )}
            </>
          )}

          {/* POSTS DETAIL */}
          {target.type === 'posts' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Topic / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. How I set up AWS VPC Peering with Terraform"
                  value={target.item.topic}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('posts', {
                      ...target.item,
                      topic: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={target.item.date}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('posts', {
                        ...target.item,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={target.item.status}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('posts', {
                        ...target.item,
                        status: e.target.value as PostItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Post Link (LinkedIn, Twitter, Blog)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/posts/..."
                  value={target.item.url}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('posts', {
                      ...target.item,
                      url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Reactions / Likes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={target.item.likes ?? ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('posts', {
                        ...target.item,
                        likes: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Comments
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={target.item.cmts ?? ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('posts', {
                        ...target.item,
                        cmts: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes & Draft Content
                </label>
                <textarea
                  rows={4}
                  value={target.item.notes || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('posts', {
                      ...target.item,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('posts', { ...target.item, links }),
                (imgs) =>
                  onUpdateCollectionItem?.('posts', { ...target.item, imgs })
              )}
            </>
          )}

          {/* PROJECTS DETAIL */}
          {target.type === 'projects' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={target.item.name}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('projects', {
                      ...target.item,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={target.item.status}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('projects', {
                        ...target.item,
                        status: e.target.value as ProjectItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Building">Building</option>
                    <option value="Done">Done</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={target.item.repo}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('projects', {
                        ...target.item,
                        repo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Demo or Case Study Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={target.item.demo}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('projects', {
                      ...target.item,
                      demo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {/* Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Portfolio Readiness Checklist
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROJECT_CHECKLIST_ITEMS.map((checkItem) => {
                    const isChecked = !!target.item.chk?.[checkItem];
                    return (
                      <button
                        key={checkItem}
                        type="button"
                        onClick={() => {
                          const chk = { ...(target.item.chk || {}) };
                          chk[checkItem] = !isChecked;
                          onUpdateCollectionItem?.('projects', {
                            ...target.item,
                            chk,
                          });
                        }}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer',
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        )}
                      >
                        <FileCheck2 className={cn('w-4 h-4', isChecked ? 'text-emerald-500' : 'text-slate-400')} />
                        <span className="truncate">{checkItem}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Architecture & Tech Stack Notes
                </label>
                <textarea
                  rows={4}
                  value={target.item.notes || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('projects', {
                      ...target.item,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('projects', {
                    ...target.item,
                    links,
                  }),
                (imgs) =>
                  onUpdateCollectionItem?.('projects', {
                    ...target.item,
                    imgs,
                  })
              )}
            </>
          )}

          {/* JOBS DETAIL */}
          {target.type === 'jobs' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={target.item.company}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior DevOps / Platform Engineer"
                    value={target.item.role}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        role: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Application Status
                  </label>
                  <select
                    value={target.item.status}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        status: e.target.value as JobItem['status'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {JOB_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Job Posting Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={target.item.url}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Applied On Date
                  </label>
                  <input
                    type="date"
                    value={target.item.applied || ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        applied: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Follow Up On Date
                  </label>
                  <input
                    type="date"
                    value={target.item.follow || ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        follow: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Contact / Recruiter / Referral
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe (LinkedIn / Email)"
                    value={target.item.contact || ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        contact: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Salary Band
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $130k - $160k"
                    value={target.item.band || ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('jobs', {
                        ...target.item,
                        band: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Interview Notes, Questions Asked & Feedback
                </label>
                <textarea
                  rows={4}
                  value={target.item.notes || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('jobs', {
                      ...target.item,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('jobs', { ...target.item, links }),
                (imgs) =>
                  onUpdateCollectionItem?.('jobs', { ...target.item, imgs })
              )}
            </>
          )}

          {/* INTERVIEW QUESTIONS DETAIL */}
          {target.type === 'qs' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Interview Question
                </label>
                <input
                  type="text"
                  placeholder="e.g. How do you design zero-downtime deployments in Kubernetes?"
                  value={target.item.q}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('qs', {
                      ...target.item,
                      q: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Domain / Topic
                  </label>
                  <select
                    value={target.item.topic}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('qs', {
                        ...target.item,
                        topic: e.target.value as QuestionItem['topic'],
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {INTERVIEW_TOPICS.map((top) => (
                      <option key={top} value={top}>
                        {top}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Confidence (1 to 5)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((lvl) => {
                      const isSelected = String(target.item.conf) === String(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            onUpdateCollectionItem?.('qs', {
                              ...target.item,
                              conf: String(lvl),
                            })
                          }
                          className={cn(
                            'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-0.5',
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          )}
                        >
                          <Star className={cn('w-3 h-3', isSelected ? 'fill-white' : 'text-slate-400')} />
                          <span>{lvl}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  My Answer / Best Explanation
                </label>
                <textarea
                  rows={6}
                  placeholder="Structure your answer using STAR method (Situation, Task, Action, Result) or technical steps..."
                  value={target.item.a || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('qs', {
                      ...target.item,
                      a: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs leading-relaxed"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('qs', { ...target.item, links }),
                (imgs) =>
                  onUpdateCollectionItem?.('qs', { ...target.item, imgs })
              )}
            </>
          )}

          {/* RESOURCES DETAIL */}
          {target.type === 'res' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Terraform Best Practices Guide"
                  value={target.item.title}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('res', {
                      ...target.item,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Resource Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={target.item.url}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('res', {
                        ...target.item,
                        url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tag / Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Terraform, Kubernetes, Security"
                    value={target.item.tag || ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('res', {
                        ...target.item,
                        tag: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Key Takeaways / Notes
                </label>
                <textarea
                  rows={4}
                  value={target.item.notes || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('res', {
                      ...target.item,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('res', { ...target.item, links }),
                (imgs) =>
                  onUpdateCollectionItem?.('res', { ...target.item, imgs })
              )}
            </>
          )}

          {/* SCORES DETAIL */}
          {target.type === 'scores' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Exam or Mock Test Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. AWS SAA-C03 Practice Test 1"
                  value={target.item.name}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('scores', {
                      ...target.item,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={target.item.date}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('scores', {
                        ...target.item,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Score (in %)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="85"
                    value={target.item.score ?? ''}
                    onChange={(e) =>
                      onUpdateCollectionItem?.('scores', {
                        ...target.item,
                        score: e.target.value === '' ? '' : parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Missed Questions & Notes
                </label>
                <textarea
                  rows={4}
                  value={target.item.notes || ''}
                  onChange={(e) =>
                    onUpdateCollectionItem?.('scores', {
                      ...target.item,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {renderAttachments(
                target.item.links || [],
                target.item.imgs || [],
                (links) =>
                  onUpdateCollectionItem?.('scores', { ...target.item, links }),
                (imgs) =>
                  onUpdateCollectionItem?.('scores', { ...target.item, imgs })
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {target.type !== 'day' ? (
            <button
              type="button"
              onClick={() => {
                if (deleteConfirm) {
                  onDeleteCollectionItem?.(target.type, target.item.id);
                  onClose();
                } else {
                  setDeleteConfirm(true);
                  setTimeout(() => setDeleteConfirm(false), 3000);
                }
              }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer',
                deleteConfirm
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              )}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleteConfirm ? 'Tap again to confirm' : 'Delete'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
