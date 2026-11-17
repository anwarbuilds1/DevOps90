'use client';

import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  CheckSquare,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { TrackerState, ProjectItem } from '@/types/tracker';
import { PROJECT_CHECKLIST_ITEMS } from '@/constants/curriculum';
import { getStatusBadgeStyle, uid, cn } from '@/lib/utils';

interface ProjectsTabProps {
  state: TrackerState;
  onOpenProjectDrawer: (project: ProjectItem) => void;
  onAddProject: (newProject: ProjectItem) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  state,
  onOpenProjectDrawer,
  onAddProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const projects = state.col.projects || [];

  const handleAddNew = () => {
    const newProj: ProjectItem = {
      id: uid(),
      name: '',
      status: 'Planned',
      repo: '',
      demo: '',
      chk: {
        README: false,
        'Architecture Diagram': false,
        'Teardown steps': false,
        'Cost notes': false,
        'Public repo': false,
        'Demo video': false,
      },
      notes: '',
      links: [],
      imgs: [],
    };
    onAddProject(newProj);
    onOpenProjectDrawer(newProj);
  };

  const filteredProjects =
    filterStatus === 'All'
      ? projects
      : projects.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>DevOps Portfolio Projects</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {projects.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Build production-grade projects that demonstrate real-world infrastructure expertise.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Status Filter Segment */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'Planned', 'Building', 'Done', 'Public'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer',
              filterStatus === status
                ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredProjects.map((project) => {
          const checks = Object.values(project.chk || {}).filter(Boolean).length;
          const totalChecks = PROJECT_CHECKLIST_ITEMS.length;
          const percent = Math.round((checks / totalChecks) * 100);
          const imagesCount = (project.imgs || []).length;
          const linksCount = (project.links || []).length;

          return (
            <div
              key={project.id}
              onClick={() => onOpenProjectDrawer(project)}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name || 'Untitled Project'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                      getStatusBadgeStyle(project.status)
                    )}
                  >
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {project.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                  {project.notes}
                </p>
              )}

              {/* Checklist Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    Readiness: {checks} of {totalChecks} requirements checked
                  </span>
                  <span>{percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Meta Links & Images */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {linksCount > 0 && (
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {linksCount} links
                    </span>
                  )}
                  {imagesCount > 0 && (
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {imagesCount} diagrams
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No projects found in this category. Click &quot;Add Project&quot; to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
