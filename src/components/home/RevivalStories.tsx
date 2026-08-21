'use client';

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Star,
  GitBranch,
  AlertCircle,
  Clock,
  Heart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { TechBadge, StatusBadge } from '@/components/ui/Badge';
import { formatNumber, formatDate, cn } from '@/lib/utils';

interface RevivalStoriesProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onRequestCodebase: (project: Project) => void;
  onToggleUpvote: (projectId: string) => void;
}

export function RevivalStories({
  projects,
  onSelectProject,
  onRequestCodebase,
  onToggleUpvote,
}: RevivalStoriesProps) {
  // Select 3 standout projects with real varied profiles
  const stories = React.useMemo(() => {
    if (projects.length === 0) return [];
    
    // Pick:
    // 1. A project seeking adoption with high traction/potential
    const adoptionProject = projects.find((p) => p.status === 'Abandoned') || projects[0];
    // 2. An open source project with significant stars/community
    const openSourceStar = projects.find((p) => (p.githubStars || 0) > 1000 && p.id !== adoptionProject?.id) || projects[1];
    // 3. A high-potential tool or prototype
    const toolProject = projects.find((p) => p.id !== adoptionProject?.id && p.id !== openSourceStar?.id) || projects[2];

    return [
      {
        project: adoptionProject,
        headline: 'Seeking Lead Maintainer to continue momentum',
        whyWorthReviving:
          adoptionProject.adoptionPitch ||
          'Strong foundational architecture with validated user interest and real community forks ready for active leadership.',
        conditionSummary:
          adoptionProject.abandonReason ||
          'Dormant for several months. Codebase is clean, dependencies require routine update.',
        neededHelp: ['Lead Maintainer', 'Feature Roadmap', 'Issue Triage'],
        revivalDifficulty: 'Full Takeover',
        difficultyColor: 'text-orange-400 border-orange-800/50 bg-orange-950/40',
        healthScore: 78,
      },
      {
        project: openSourceStar,
        headline: 'Production-grade open source scaling community',
        whyWorthReviving:
          openSourceStar.adoptionPitch ||
          'High community validation and active stargazers. Perfect for contributors looking for high-impact open source credit.',
        conditionSummary:
          openSourceStar.abandonReason ||
          'Active foundation looking for specialized contributors to build out integrations and triage open issues.',
        neededHelp: ['Plugin Contributors', 'Docs & Testing', 'Core Reviewers'],
        revivalDifficulty: 'Light to Moderate',
        difficultyColor: 'text-cyan-400 border-cyan-800/50 bg-cyan-950/40',
        healthScore: 92,
      },
      {
        project: toolProject,
        headline: 'Developer tool with proven architecture',
        whyWorthReviving:
          toolProject.adoptionPitch ||
          'Practical developer utility with solid TypeScript/modern stack implementation. Ready for a v2 release.',
        conditionSummary:
          toolProject.abandonReason ||
          'Clean codebase requiring focused maintainer attention to close open milestones.',
        neededHelp: ['Maintainers', 'UI Polish', 'Release Management'],
        revivalDifficulty: 'Moderate',
        difficultyColor: 'text-amber-400 border-amber-800/50 bg-amber-950/40',
        healthScore: 84,
      },
    ].filter((item) => item.project !== undefined);
  }, [projects]);

  if (stories.length === 0) return null;

  return (
    <section className="w-full py-14 border-b border-stone-800/60 bg-[#0d0b0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-medium uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Opportunities
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-100">
              Projects worth reviving
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-xl leading-relaxed">
              In-depth signals on verified repositories seeking new owners, contributors, or major architectural iterations.
            </p>
          </div>
        </div>

        {/* 3 Editorial Story Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {stories.map(({ project, headline, whyWorthReviving, conditionSummary, neededHelp, revivalDifficulty, difficultyColor, healthScore }, idx) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="rounded-xl border border-stone-800/90 bg-[#14110f] hover:border-orange-500/40 hover:bg-[#181412] p-5 flex flex-col justify-between gap-5 transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
              {/* Top Meta Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={project.status} />
                  <span className={cn('text-[10px] font-mono font-medium px-2 py-0.5 rounded border', difficultyColor)}>
                    {revivalDifficulty}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-100 group-hover:text-orange-300 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {project.tagline}
                  </p>
                </div>

                {/* Editorial Why Worth Reviving */}
                <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-1.5 text-xs text-stone-300">
                  <span className="text-[10px] font-mono uppercase text-orange-400/90 font-semibold block">
                    Why Revive This:
                  </span>
                  <p className="line-clamp-2 leading-relaxed">
                    {whyWorthReviving}
                  </p>
                </div>

                {/* Condition & Health Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>Repository Vitality Score</span>
                    <span className="text-stone-200 font-semibold">{healthScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-stone-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Condition telemetry badges */}
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 rounded bg-stone-950/50 border border-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Stars</span>
                    <span className="text-xs font-semibold text-stone-200">{formatNumber(project.githubStars || 0)}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-950/50 border border-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Forks</span>
                    <span className="text-xs font-semibold text-stone-200">{formatNumber(project.githubForks || 0)}</span>
                  </div>
                  <div className="p-2 rounded bg-stone-950/50 border border-stone-800/60">
                    <span className="text-[10px] text-stone-500 block">Issues</span>
                    <span className="text-xs font-semibold text-stone-200">{project.githubOpenIssues || 0}</span>
                  </div>
                </div>

                {/* Needed Roles */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono uppercase text-stone-500">Needed Help:</span>
                  <div className="flex flex-wrap gap-1">
                    {neededHelp.map((role) => (
                      <span key={role} className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Tech Stack + Direct Action */}
              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1 max-w-[170px]">
                  {project.techStack.slice(0, 2).map((t) => (
                    <TechBadge key={t} name={t} />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUpvote(project.id);
                    }}
                    className={cn(
                      'p-1.5 rounded-md border text-xs font-mono flex items-center gap-1 transition-colors',
                      project.hasUserUpvoted
                        ? 'bg-orange-950/50 text-orange-300 border-orange-800'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-orange-300'
                    )}
                  >
                    <Heart className={cn('w-3.5 h-3.5', project.hasUserUpvoted && 'fill-orange-500 text-orange-500')} />
                    <span>{project.upvotesCount}</span>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="h-7 text-[11px] px-2.5 border-stone-800 hover:border-stone-700"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
