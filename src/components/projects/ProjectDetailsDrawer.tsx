'use client';

import React from 'react';
import {
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  Heart,
  MessageSquareCode,
  Code2,
  Users,
  CheckCircle2,
  Share2,
  Github,
  Calendar,
} from 'lucide-react';
import { Project } from '@/types';
import { StatusBadge, TypeBadge, TechBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/Sheet';
import { formatNumber, formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectDetailsDrawerProps {
  project: Project | null;
  onClose: () => void;
  onRequestCodebase: (project: Project) => void;
  onToggleUpvote: (projectId: string) => void;
}

export function ProjectDetailsDrawer({
  project,
  onClose,
  onRequestCodebase,
  onToggleUpvote,
}: ProjectDetailsDrawerProps) {
  if (!project) return null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Project link copied to clipboard');
    }
  };

  return (
    <Sheet open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex flex-col p-0 gap-0 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-800 bg-[#121316] flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={project.status} />
              <TypeBadge type={project.type} />
              {project.license && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                  {project.license}
                </span>
              )}
            </div>

            <button
              onClick={handleShare}
              title="Copy share link"
              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              {project.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Maintainer Info */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={project.owner.avatarUrl}
                alt={project.owner.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-zinc-200 truncate">
                  {project.owner.name}
                </span>
                <span className="text-[11px] text-zinc-400 truncate">
                  @{project.owner.username} • {project.owner.role || 'Maintainer'}
                </span>
              </div>
            </div>

            {project.owner.githubUsername && (
              <a
                href={`https://github.com/${project.owner.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors shrink-0"
              >
                <Github className="w-3 h-3" />
                <span>GitHub</span>
              </a>
            )}
          </div>

          {/* GitHub Repository Health Signals */}
          {project.isCodebasePublic && (
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800 text-center font-mono">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 text-amber-400" /> Stars
                </span>
                <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                  {formatNumber(project.githubStars || 0)}
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                  <GitFork className="w-2.5 h-2.5 text-blue-400" /> Forks
                </span>
                <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                  {formatNumber(project.githubForks || 0)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                  <AlertCircle className="w-2.5 h-2.5 text-emerald-400" /> Issues
                </span>
                <span className="text-xs font-semibold text-zinc-200 mt-0.5">
                  {formatNumber(project.githubOpenIssues || 0)}
                </span>
              </div>
            </div>
          )}

          {/* About / Description */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Overview
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/80">
              {project.description}
            </p>
          </div>

          {/* Abandonment / Status Reason */}
          {project.abandonReason && (
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Why this project was paused / abandoned</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed pl-5">
                {project.abandonReason}
              </p>
            </div>
          )}

          {/* Adoption Pitch */}
          {project.adoptionPitch && (
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
              <div className="text-xs font-medium text-zinc-200">
                Adoption & Contribution Opportunity
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {project.adoptionPitch}
              </p>
            </div>
          )}

          {/* Looking for Roles */}
          {project.lookingFor && project.lookingFor.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3 text-zinc-400" /> Desired Contributor Profiles
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.lookingFor.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-850 text-zinc-300 border border-zinc-750"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Technology Stack
            </h3>
            <div className="flex flex-wrap gap-1">
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-[#121316] flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleUpvote(project.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors cursor-pointer',
              project.hasUserUpvoted
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-rose-400 hover:border-zinc-700'
            )}
          >
            <Heart
              className={cn(
                'w-3.5 h-3.5',
                project.hasUserUpvoted ? 'fill-rose-500 text-rose-500' : 'text-zinc-500'
              )}
            />
            <span>{project.upvotesCount}</span>
          </button>

          <div className="flex items-center gap-2">
            {project.isCodebasePublic && project.codebaseUrl ? (
              <a
                href={project.codebaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors font-mono"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onClose();
                  onRequestCodebase(project);
                }}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Request Codebase Access</span>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
