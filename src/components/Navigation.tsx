'use client';

import React from 'react';
import {
  Calendar,
  ListTree,
  FolderGit2,
  Briefcase,
  Share2,
  GraduationCap,
  Bookmark,
  Award,
  BarChart3,
  Settings,
} from 'lucide-react';
import { ActiveTab } from '@/types/tracker';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  dueJobsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  dueJobsCount = 0,
}) => {
  const navItems: { key: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: 'today', label: 'Today', icon: Calendar },
    { key: 'plan', label: 'Curriculum', icon: ListTree },
    { key: 'projects', label: 'Projects', icon: FolderGit2 },
    { key: 'jobs', label: 'Jobs', icon: Briefcase, badge: dueJobsCount },
    { key: 'posts', label: 'Posts', icon: Share2 },
    { key: 'study', label: 'Study', icon: GraduationCap },
    { key: 'resources', label: 'Resources', icon: Bookmark },
    { key: 'scores', label: 'Scores', icon: Award },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Horizontal Navigation Bar */}
      <nav className="hidden md:block border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0c121e]/70 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChangeTab(item.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative whitespace-nowrap cursor-pointer',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={cn(
                      'ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                      isActive ? 'bg-white text-blue-600' : 'bg-amber-500 text-white'
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Sticky Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around overflow-x-auto gap-0.5 no-scrollbar">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChangeTab(item.key)}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg min-w-[56px] transition-all relative cursor-pointer',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-amber-500 text-white rounded-full text-[9px] font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
              </button>
            );
          })}

          {/* More menu button on mobile for items 5..9 */}
          <button
            onClick={() => {
              if (['study', 'resources', 'scores', 'stats', 'settings'].includes(activeTab)) {
                // cycle or go to settings
                onChangeTab('settings');
              } else {
                onChangeTab('study');
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg min-w-[56px] transition-all cursor-pointer',
              ['study', 'resources', 'scores', 'stats', 'settings'].includes(activeTab)
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">
              {['study', 'resources', 'scores', 'stats', 'settings'].includes(activeTab)
                ? navItems.find((n) => n.key === activeTab)?.label
                : 'More'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
