'use client';

import React from 'react';
import {
  Trophy,
  Flame,
  Crown,
  Medal,
  Star,
  ArrowUpRight,
  Heart,
  ExternalLink,
  ChevronRight,
  History,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project } from '@/types';
import { StatusBadge, TypeBadge, TechBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber, cn } from '@/lib/utils';

interface LeaderboardViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onRequestCodebase: (project: Project) => void;
  onToggleUpvote: (projectId: string) => void;
  onOpenSubmitModal: () => void;
}

export function LeaderboardView({
  projects,
  onSelectProject,
  onRequestCodebase,
  onToggleUpvote,
  onOpenSubmitModal,
}: LeaderboardViewProps) {
  const eligibleProjects = projects.filter((p) => !p.isInLeaderboardCooldown);
  const cooldownProjects = projects.filter((p) => p.isInLeaderboardCooldown);

  const sortedEligible = [...eligibleProjects].sort((a, b) => {
    if (b.weeklyUpvotesCount !== a.weeklyUpvotesCount) {
      return b.weeklyUpvotesCount - a.weeklyUpvotesCount;
    }
    if (b.upvotesCount !== a.upvotesCount) {
      return b.upvotesCount - a.upvotesCount;
    }
    return (b.githubStars || 0) - (a.githubStars || 0);
  });

  const top1 = sortedEligible[0] || null;
  const top2 = sortedEligible[1] || null;
  const top3 = sortedEligible[2] || null;
  const remaining = sortedEligible.slice(3);

  const triggerConfetti = () => {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Spotlight Banner */}
      <div className="p-5 sm:p-6 rounded-lg bg-[#0f1013] border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <h1 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Weekly Revival Spotlight
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Community-voted codebases seeking adoption and maintainers. One verified vote per developer.
          </p>
        </div>

        <Button variant="default" size="sm" onClick={onOpenSubmitModal} className="shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nominate a Codebase</span>
        </Button>
      </div>

      {/* Top 3 Podium */}
      {top1 && top2 && top3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* #2 Silver */}
          <div
            onClick={() => onSelectProject(top2)}
            className="order-2 md:order-1 p-4 rounded-lg bg-[#0e0f12] border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-400">
                <Medal className="w-3.5 h-3.5 text-zinc-400" /> #2 Spotlight
              </span>
              <StatusBadge status={top2.status} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-100 hover:text-white transition-colors">
                {top2.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{top2.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {top2.techStack.slice(0, 3).map((t) => (
                <TechBadge key={t} name={t} />
              ))}
            </div>

            <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={top2.owner.avatarUrl}
                  alt={top2.owner.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-zinc-700"
                />
                <span className="text-[11px] text-zinc-400 truncate max-w-[90px]">
                  @{top2.owner.username}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUpvote(top2.id);
                  triggerConfetti();
                }}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer',
                  top2.hasUserUpvoted
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-rose-400'
                )}
              >
                <Heart className={cn('w-3 h-3', top2.hasUserUpvoted && 'fill-rose-500 text-rose-500')} />
                <span>{top2.weeklyUpvotesCount}</span>
              </button>
            </div>
          </div>

          {/* #1 Gold Winner */}
          <div
            onClick={() => onSelectProject(top1)}
            className="order-1 md:order-2 p-4 rounded-lg bg-[#111216] border border-amber-500/40 hover:border-amber-500/60 flex flex-col justify-between gap-3 transition-colors cursor-pointer relative"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> #1 Weekly Leader
              </span>
              <StatusBadge status={top1.status} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-100 hover:text-white transition-colors">
                {top1.title}
              </h3>
              <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                {top1.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              {top1.techStack.map((t) => (
                <TechBadge key={t} name={t} />
              ))}
            </div>

            <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={top1.owner.avatarUrl}
                  alt={top1.owner.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-500/50"
                />
                <span className="text-[11px] text-zinc-300 truncate max-w-[90px]">
                  @{top1.owner.username}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUpvote(top1.id);
                  triggerConfetti();
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold border transition-colors cursor-pointer',
                  top1.hasUserUpvoted
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                    : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:text-rose-400'
                )}
              >
                <Heart className={cn('w-3 h-3', top1.hasUserUpvoted && 'fill-rose-500 text-rose-500')} />
                <span>{top1.weeklyUpvotesCount}</span>
              </button>
            </div>
          </div>

          {/* #3 Bronze */}
          <div
            onClick={() => onSelectProject(top3)}
            className="order-3 p-4 rounded-lg bg-[#0e0f12] border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-600">
                <Medal className="w-3.5 h-3.5 text-amber-600" /> #3 Spotlight
              </span>
              <StatusBadge status={top3.status} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-100 hover:text-white transition-colors">
                {top3.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">{top3.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-1">
              {top3.techStack.slice(0, 3).map((t) => (
                <TechBadge key={t} name={t} />
              ))}
            </div>

            <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <img
                  src={top3.owner.avatarUrl}
                  alt={top3.owner.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-zinc-700"
                />
                <span className="text-[11px] text-zinc-400 truncate max-w-[90px]">
                  @{top3.owner.username}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleUpvote(top3.id);
                  triggerConfetti();
                }}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer',
                  top3.hasUserUpvoted
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-rose-400'
                )}
              >
                <Heart className={cn('w-3 h-3', top3.hasUserUpvoted && 'fill-rose-500 text-rose-500')} />
                <span>{top3.weeklyUpvotesCount}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Contenders Ranked List */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Ranked Contenders (#{top1 && top2 && top3 ? '4' : '1'} - #{sortedEligible.length})
        </h2>

        <div className="divide-y divide-zinc-800/70 rounded-lg border border-zinc-800 bg-[#0e0f12] overflow-hidden">
          {remaining.map((project, idx) => {
            const rank = top1 && top2 && top3 ? idx + 4 : idx + 1;
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="p-3 px-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs text-zinc-500 w-6 text-center font-medium shrink-0">
                    #{rank}
                  </span>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs text-zinc-100 group-hover:text-white transition-colors">
                        {project.title}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{project.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="hidden lg:flex flex-wrap gap-1 max-w-[180px]">
                    {project.techStack.slice(0, 2).map((t) => (
                      <TechBadge key={t} name={t} />
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUpvote(project.id);
                      triggerConfetti();
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium border transition-colors cursor-pointer',
                      project.hasUserUpvoted
                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-rose-400'
                    )}
                  >
                    <Heart className={cn('w-3 h-3', project.hasUserUpvoted && 'fill-rose-500 text-rose-500')} />
                    <span>{project.weeklyUpvotesCount}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {remaining.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No additional contenders found. Submit a project to participate.
            </div>
          )}
        </div>
      </div>

      {/* 3-Month Anti-Monopoly Cooldown Section */}
      {cooldownProjects.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              Past Winners in 90-Day Cooldown ({cooldownProjects.length})
            </h3>
            <span className="text-[10px] text-zinc-500">
              Anti-monopoly: past winners sit out podium rotation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cooldownProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-2 hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-zinc-200 truncate">{p.title}</span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1">{p.tagline}</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                  ★ {p.upvotesCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
