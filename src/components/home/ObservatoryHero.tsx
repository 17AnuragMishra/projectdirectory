'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { TechBadge, StatusBadge } from '@/components/ui/Badge';
import { formatNumber, formatDate, cn } from '@/lib/utils';

interface ObservatoryHeroProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenSubmitModal: () => void;
  onScrollToDirectory: () => void;
}

export function ObservatoryHero({
  projects,
  onSelectProject,
  onOpenSubmitModal,
  onScrollToDirectory,
}: ObservatoryHeroProps) {
  // Pick 3 representative real projects to showcase in the Observatory
  const observatoryCandidates = React.useMemo(() => {
    if (projects.length === 0) return [];
    // Prioritize distinctive projects: 1 adoption, 1 high-star open source, 1 prototype
    const adoption = projects.find((p) => p.status === 'Abandoned') || projects[0];
    const highStar = projects.find((p) => (p.githubStars || 0) > 5000 && p.id !== adoption?.id) || projects[1];
    const devTool = projects.find((p) => p.id !== adoption?.id && p.id !== highStar?.id) || projects[2];
    return [adoption, highStar, devTool].filter(Boolean) as Project[];
  }, [projects]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeProject = observatoryCandidates[activeIndex] || projects[0];

  // Calculate revival effort based on dormancy & issues
  const getRevivalEffort = (proj?: Project) => {
    if (!proj) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' };
    if (proj.status === 'Abandoned') {
      return { label: 'Full Takeover', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40' };
    }
    if ((proj.githubOpenIssues || 0) > 50) {
      return { label: 'Moderate Effort', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' };
    }
    return { label: 'Light Maintenance', color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' };
  };

  const effort = getRevivalEffort(activeProject);

  return (
    <section className="relative w-full pt-10 pb-16 overflow-hidden border-b border-stone-800/60 bg-gradient-to-b from-[#0d0b0a] via-[#120f0d] to-[#0d0b0a]">
      {/* Subtle background ambient grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a17_1px,transparent_1px),linear-gradient(to_bottom,#1f1a17_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Heading & Value Proposition */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-stone-900/90 border border-stone-800 text-[11px] text-stone-300 font-mono">
            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>Repository Observatory • {projects.length} codebases detected</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-100 leading-[1.1]">
            Good code shouldn’t{' '}
            <span className="italic font-serif font-normal text-orange-400 underline decoration-orange-500/40 underline-offset-8">
              disappear.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-400 max-w-2xl leading-relaxed">
            Discover promising open-source projects waiting for their next maintainer, contributor, or chapter. Inspect repository telemetry, claim ownership, or submit dormant tools.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={onScrollToDirectory}
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium shadow-md gap-2"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onOpenSubmitModal}
              className="border-stone-800 bg-stone-900/60 text-stone-300 hover:text-white hover:bg-stone-850 hover:border-stone-700"
            >
              <span>List a Repository</span>
            </Button>
          </div>
        </div>

        {/* Interactive "Repository Observatory" Composition */}
        {activeProject && (
          <div className="mt-12 rounded-xl border border-stone-800 bg-[#14110f]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-sm relative overflow-hidden">
            {/* Top Bar: Live Node Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-semibold text-stone-200 tracking-wide uppercase font-mono">
                  Live Observatory Target
                </span>
              </div>

              {/* Node Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stone-950/80 border border-stone-800 overflow-x-auto max-w-full">
                {observatoryCandidates.map((proj, idx) => (
                  <button
                    key={proj.id}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      'px-3 py-1 rounded text-xs font-mono transition-all whitespace-nowrap cursor-pointer',
                      activeIndex === idx
                        ? 'bg-stone-800 text-orange-300 font-semibold border border-stone-700'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    )}
                  >
                    {proj.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Observatory Canvas: Left Telemetry HUD + Right Interactive Commit Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
              {/* Left Column: Repository Telemetry & Health Signals (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
                        {activeProject.title}
                      </h2>
                      <StatusBadge status={activeProject.status} />
                      <span className={cn('text-[11px] font-mono px-2 py-0.5 rounded border', effort.bg, effort.color)}>
                        {effort.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
                      {activeProject.tagline}
                    </p>
                  </div>
                </div>

                {/* Telemetry Stats Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-stone-500 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400/80" /> Stars
                    </span>
                    <div className="text-sm font-bold font-mono text-stone-200">
                      {formatNumber(activeProject.githubStars || 0)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-stone-500 flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-cyan-400" /> Forks
                    </span>
                    <div className="text-sm font-bold font-mono text-stone-200">
                      {formatNumber(activeProject.githubForks || 0)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" /> Last Commit
                    </span>
                    <div className="text-xs font-mono font-medium text-stone-300 truncate">
                      {formatDate(activeProject.githubLastCommit || activeProject.updatedAt)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/80 space-y-0.5 col-span-3 sm:col-span-1">
                    <span className="text-[10px] uppercase font-mono text-stone-500 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> Upvotes
                    </span>
                    <div className="text-sm font-bold font-mono text-orange-300">
                      {activeProject.upvotesCount}
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-stone-400 mr-1 font-mono">Stack:</span>
                  {activeProject.techStack.map((tech) => (
                    <TechBadge key={tech} name={tech} />
                  ))}
                </div>

                {/* Pitch / Note callout */}
                {activeProject.abandonReason && (
                  <div className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 text-xs text-stone-300 leading-relaxed">
                    <strong className="text-orange-300 font-medium font-mono">Dormancy note: </strong>
                    {activeProject.abandonReason}
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSelectProject(activeProject)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-medium gap-1.5"
                  >
                    <span>Inspect Codebase</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>

                  {activeProject.codebaseUrl && activeProject.isCodebasePublic && (
                    <a
                      href={activeProject.codebaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-stone-400 hover:text-stone-200 transition-colors"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Animated SVG Commit Graph & Revival Pulse (5 cols) */}
              <div className="lg:col-span-5 flex flex-col justify-center rounded-lg bg-stone-950/80 border border-stone-800/80 p-4 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800/60 text-[11px] font-mono text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-orange-400" />
                    Commit Revival Pulse
                  </span>
                  <span className="text-cyan-400 font-medium">Node ID: {activeProject.id.slice(0, 8)}</span>
                </div>

                {/* SVG Visual Graph */}
                <div className="h-52 w-full flex items-center justify-center relative my-2">
                  <svg className="w-full h-full" viewBox="0 0 320 180" fill="none">
                    {/* Background Grid Lines */}
                    <line x1="20" y1="90" x2="300" y2="90" stroke="#2b2521" strokeDasharray="3 3" />
                    <line x1="160" y1="20" x2="160" y2="160" stroke="#2b2521" strokeDasharray="3 3" />

                    {/* Main Trunk Line (Past -> Stalled) */}
                    <path
                      d="M 30 130 L 90 130 C 120 130 140 90 170 90"
                      stroke="#57534e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Revival Branch Arch (Stalled -> Revived Active Chapter) */}
                    <path
                      d="M 170 90 C 200 90 220 45 270 45"
                      stroke="url(#heroRevivalGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Continuous Pulse Beam Animation */}
                    <circle cx="0" cy="0" r="3.5" fill="#f97316" className="animate-revival-pulse">
                      <animateMotion
                        path="M 30 130 L 90 130 C 120 130 140 90 170 90 C 200 90 220 45 270 45"
                        dur="4s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Past Inactive Commit Nodes */}
                    <circle cx="30" cy="130" r="4.5" fill="#1c1917" stroke="#78716c" strokeWidth="2" />
                    <circle cx="90" cy="130" r="4.5" fill="#1c1917" stroke="#78716c" strokeWidth="2" />

                    {/* Dormancy Junction Node */}
                    <circle cx="170" cy="90" r="6" fill="#292524" stroke="#f97316" strokeWidth="2" />
                    <circle cx="170" cy="90" r="2.5" fill="#f97316" />

                    {/* Illuminated Revival Head Node */}
                    <circle cx="270" cy="45" r="8" fill="#f97316" fillOpacity="0.25" className="animate-ping" />
                    <circle cx="270" cy="45" r="6.5" fill="#ea580c" stroke="#fed7aa" strokeWidth="2" />
                    <circle cx="270" cy="45" r="2.5" fill="#ffffff" />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="heroRevivalGrad" x1="170" y1="90" x2="270" y2="45" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-800/60">
                  <span>origin/main (dormant)</span>
                  <span className="text-orange-400 font-medium">revival/v2 (illuminated)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
