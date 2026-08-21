'use client';

import React from 'react';
import {
  Activity,
  Heart,
  PlusCircle,
  MessageSquareCode,
  Sparkles,
  KeyRound,
  ArrowUpRight,
} from 'lucide-react';
import { ActivityItem, Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityItem[];
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export function ActivityFeed({
  activities,
  projects,
  onSelectProject,
}: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'revival':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'upvote':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'request':
        return <MessageSquareCode className="w-3.5 h-3.5 text-indigo-400" />;
      case 'access_granted':
        return <KeyRound className="w-3.5 h-3.5 text-cyan-400" />;
      case 'submission':
      default:
        return <PlusCircle className="w-3.5 h-3.5 text-zinc-300" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0e0f12] border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">
            Total Codebases
          </span>
          <div className="text-xl font-bold text-zinc-100 font-mono">
            {projects.length}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e0f12] border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">
            Seeking Adoption
          </span>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {projects.filter((p) => p.status === 'Abandoned').length}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e0f12] border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">
            Open Source
          </span>
          <div className="text-xl font-bold text-cyan-400 font-mono">
            {projects.filter((p) => p.status === 'Open Source' || p.status === 'Open').length}
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0e0f12] border border-zinc-800 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">
            Community Votes
          </span>
          <div className="text-xl font-bold text-rose-400 font-mono">
            {projects.reduce((acc, p) => acc + p.upvotesCount, 0)}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-lg border border-zinc-800 bg-[#0e0f12] p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            Live Activity
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Real-time</span>
        </div>

        <div className="space-y-2">
          {activities.map((act) => {
            const project = projects.find((p) => p.id === act.projectId);

            return (
              <div
                key={act.id}
                onClick={() => project && onSelectProject(project)}
                className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3 hover:bg-zinc-850/60 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1 rounded bg-zinc-800 border border-zinc-700 shrink-0">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-zinc-200">{act.user.name}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 hover:text-indigo-300 truncate">
                      {act.projectTitle}
                    </span>
                    {act.detail && (
                      <span className="text-zinc-500 hidden sm:inline truncate">
                        ({act.detail})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatDate(act.timestamp)}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
