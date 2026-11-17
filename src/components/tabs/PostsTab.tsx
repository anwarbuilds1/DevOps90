'use client';

import React, { useState } from 'react';
import {
  Share2,
  Plus,
  Calendar,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { TrackerState, PostItem } from '@/types/tracker';
import { getStatusBadgeStyle, uid, getIsoDate, cn } from '@/lib/utils';

interface PostsTabProps {
  state: TrackerState;
  onOpenPostDrawer: (post: PostItem) => void;
  onAddPost: (newPost: PostItem) => void;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  state,
  onOpenPostDrawer,
  onAddPost,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const posts = state.col.posts || [];

  const handleAddNew = () => {
    const todayIso = getIsoDate(new Date());
    const newPost: PostItem = {
      id: uid(),
      topic: '',
      date: todayIso,
      status: 'Draft',
      url: '',
      likes: '',
      cmts: '',
      notes: '',
      links: [],
      imgs: [],
    };
    onAddPost(newPost);
    onOpenPostDrawer(newPost);
  };

  const filteredPosts =
    filterStatus === 'All'
      ? posts
      : posts.filter((p) => p.status === filterStatus);

  const publishedCount = posts.filter((p) => p.status === 'Published').length;
  const totalLikes = posts.reduce((sum, p) => sum + (Number(p.likes) || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (Number(p.cmts) || 0), 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-sky-500" />
            <span>DevOps Content & Building in Public</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {posts.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share what you learn on LinkedIn/Twitter/Blog to build credibility and attract recruiter DMs.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Post</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Published
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {publishedCount}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Total Likes/Reactions
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {totalLikes}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Total Comments
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {totalComments}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Draft', 'Scheduled', 'Published'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
              filterStatus === status
                ? 'bg-sky-600 border-sky-600 text-white font-semibold'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => onOpenPostDrawer(post)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {post.topic || 'Untitled Post'}
              </h3>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                    getStatusBadgeStyle(post.status)
                  )}
                >
                  {post.status}
                </span>
              </div>
            </div>

            {post.notes && (
              <div className="mb-2 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                <p className="line-clamp-2">{post.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                {post.date && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {post.date}
                  </span>
                )}
                {post.likes !== '' && post.likes != null && (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                    <ThumbsUp className="w-3 h-3" />
                    {post.likes} reactions
                  </span>
                )}
                {post.cmts !== '' && post.cmts != null && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.cmts} comments
                  </span>
                )}
              </div>

              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Post</span>
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No posts found. Tap &quot;Add Post&quot; to draft or track your next publication.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
