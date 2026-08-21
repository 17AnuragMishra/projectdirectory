'use client';

import React, { useState } from 'react';
import {
  Github,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Project, ProjectStatus, ProjectType, UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { TechStackInput } from '@/components/projects/TechStackInput';

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  currentUser: UserProfile;
}

export function SubmitProjectModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
}: SubmitProjectModalProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'manual'>('github');

  // GitHub Scraping
  const [githubUrl, setGithubUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedResult, setScrapedResult] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Abandoned');
  const [type, setType] = useState<ProjectType>('Personal Project');
  const [codebaseUrl, setCodebaseUrl] = useState('');
  const [isCodebasePublic, setIsCodebasePublic] = useState(true);
  const [techStack, setTechStack] = useState<string[]>(['TypeScript', 'React']);
  const [abandonReason, setAbandonReason] = useState('');
  const [adoptionPitch, setAdoptionPitch] = useState('');
  const [lookingForRoles, setLookingForRoles] = useState<string[]>([
    'Maintainer',
    'Contributor',
  ]);

  if (!isOpen) return null;

  const handleScrapeGithub = async () => {
    if (!githubUrl.trim()) {
      setScrapeError('Please enter a valid GitHub repository URL.');
      return;
    }

    setIsScraping(true);
    setScrapeError(null);

    try {
      const res = await fetch('/api/github-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch repository info');
      }

      const scraped = data.scrapedData;
      setScrapedResult(scraped);
      setTitle(scraped.title);
      setTagline(scraped.description.slice(0, 120));
      setDescription(scraped.description);
      setCodebaseUrl(scraped.codebaseUrl);
      setIsCodebasePublic(scraped.isCodebasePublic);
      setTechStack(scraped.techStack || ['TypeScript', 'React']);
      if (scraped.suggestedStatus) {
        setStatus(scraped.suggestedStatus as ProjectStatus);
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Error communicating with GitHub API.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleResetScrape = () => {
    setScrapedResult(null);
    setGithubUrl('');
    setScrapeError(null);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Project Title is required.');
      return;
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'Open-source developer codebase seeking revival.',
      description: description.trim() || 'No description provided.',
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        githubUsername: currentUser.githubUsername,
        role: 'Creator & Maintainer',
      },
      status,
      type,
      codebaseUrl: isCodebasePublic ? codebaseUrl.trim() : undefined,
      isCodebasePublic,
      techStack: techStack.length > 0 ? techStack : ['TypeScript'],
      githubStars: scrapedResult?.githubStars || 0,
      githubForks: scrapedResult?.githubForks || 0,
      githubOpenIssues: scrapedResult?.githubOpenIssues || 0,
      githubLastCommit:
        scrapedResult?.githubLastCommit || new Date().toISOString(),
      upvotesCount: 1,
      weeklyUpvotesCount: 1,
      hasUserUpvoted: true,
      abandonReason: abandonReason.trim() || undefined,
      adoptionPitch: adoptionPitch.trim() || undefined,
      lookingFor: lookingForRoles,
      license: scrapedResult?.license || 'MIT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newProject);
    onClose();
  };

  const isFormVisible =
    activeTab === 'manual' || (activeTab === 'github' && Boolean(scrapedResult));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-[#121316]">
          <DialogTitle className="text-base font-semibold text-zinc-100">
            List a Project
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-0.5">
            Submit an open-source, unfinished, or abandoned codebase to find contributors or new maintainers.
          </DialogDescription>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-800 bg-[#0f1013] px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-indigo-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            GitHub Ingestion
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Manual Entry
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* GitHub URL Scrape Container */}
          {activeTab === 'github' && (
            <div className="space-y-3 p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">
                  GitHub Repository URL
                </label>
                {scrapedResult && (
                  <button
                    type="button"
                    onClick={handleResetScrape}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Change repo
                  </button>
                )}
              </div>

              {!scrapedResult ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleScrapeGithub();
                      }
                    }}
                    placeholder="e.g. facebook/react or https://github.com/owner/repo"
                    className="flex-1 h-8 px-3 text-xs rounded-md bg-zinc-950 border border-zinc-750 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 font-mono"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    loading={isScraping}
                    onClick={handleScrapeGithub}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Fetch Info
                  </Button>
                </div>
              ) : (
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Imported <strong>{scrapedResult.title}</strong> with{' '}
                    <strong>{scrapedResult.githubStars}</strong> stars. You can customize the fields below.
                  </span>
                </div>
              )}

              {scrapeError && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {scrapeError}
                </p>
              )}
            </div>
          )}

          {/* Form Fields */}
          {isFormVisible && (
            <form id="project-form" onSubmit={handleSubmitFinal} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Project Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PulseDB"
                    className="w-full h-8 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Tagline (One-line summary)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. High-performance time-series database"
                    className="w-full h-8 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full h-8 px-2 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="Abandoned">Seeking Adoption (Abandoned)</option>
                    <option value="Open Source">Open Source (Need Contributors)</option>
                    <option value="Freelance">Freelance (Prototype / Selling)</option>
                    <option value="Closed">Closed (Archived)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Project Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProjectType)}
                    className="w-full h-8 px-2 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="Personal Project">Personal Project</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Startup">Startup</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Company Project">Company Project</option>
                  </select>
                </div>
              </div>

              {/* Codebase URL + Public Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300">
                    Repository URL
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCodebasePublic}
                      onChange={(e) => setIsCodebasePublic(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                    />
                    <span>Public codebase</span>
                  </label>
                </div>

                {isCodebasePublic ? (
                  <input
                    type="url"
                    value={codebaseUrl}
                    onChange={(e) => setCodebaseUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                    className="w-full h-8 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
                  />
                ) : (
                  <div className="p-2 rounded bg-zinc-900 text-xs text-zinc-400 border border-zinc-800">
                    Private repository. Potential contributors will use in-app requests to chat with you and request access keys.
                  </div>
                )}
              </div>

              {/* Tech Stack Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Tech Stack Tags
                </label>
                <TechStackInput
                  selectedTags={techStack}
                  onChange={setTechStack}
                  maxTags={15}
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the codebase, architecture, and current status..."
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </div>

              {/* Why Abandoned */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Why was this project paused or abandoned?
                </label>
                <textarea
                  rows={2}
                  value={abandonReason}
                  onChange={(e) => setAbandonReason(e.target.value)}
                  placeholder="e.g. Switched full-time to another venture, lack of maintainers..."
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </div>

              {/* Adoption Pitch */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Adoption & Contribution Pitch
                </label>
                <textarea
                  rows={2}
                  value={adoptionPitch}
                  onChange={(e) => setAdoptionPitch(e.target.value)}
                  placeholder="e.g. Solid foundation ready for v1.0 release. Looking for lead maintainer..."
                  className="w-full p-2.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#121316] flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {isFormVisible && (
            <Button variant="default" size="sm" type="submit" form="project-form">
              Publish Codebase
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
