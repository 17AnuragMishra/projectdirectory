'use client';

import * as React from 'react';
import { Search, Star, CornerDownLeft, FolderGit2, Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Project } from '@/types';
import { StatusBadge, TechBadge } from '@/components/ui/Badge';
import { formatNumber, cn } from '@/lib/utils';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export function GlobalSearchDialog({
  isOpen,
  onClose,
  projects,
  onSelectProject,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchMode, setSearchMode] = React.useState<'semantic' | 'local-vector-fallback' | 'local' | 'empty'>('empty');
  const [semanticResults, setSemanticResults] = React.useState<Project[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !query.trim()) {
      setSemanticResults([]);
      setSearchMode('empty');
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Search failed');
        const projectById = new Map(projects.map((project) => [project.id, project]));
        setSemanticResults(
          (data.results || [])
            .map((result: { id: string }) => projectById.get(result.id))
            .filter((project: Project | undefined): project is Project => Boolean(project))
        );
        setSearchMode(data.mode || 'local-vector-fallback');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          const q = query.toLowerCase().trim();
          setSemanticResults(
            projects
              .filter((project) =>
                [project.title, project.tagline, project.description, project.owner.name, project.owner.username, ...project.techStack]
                  .some((value) => value.toLowerCase().includes(q))
              )
              .slice(0, 8)
          );
          setSearchMode('local');
        }
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isOpen, projects, query]);

  const filteredProjects = React.useMemo(() => {
    if (!query.trim()) return projects.slice(0, 8);
    return semanticResults;
  }, [projects, query, semanticResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredProjects.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredProjects.length) % Math.max(1, filteredProjects.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProjects[selectedIndex]) {
        onSelectProject(filteredProjects[selectedIndex]);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideClose className="p-0 gap-0 max-w-xl bg-[#171412] border-stone-800 overflow-hidden shadow-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800 bg-[#1d1917]">
          {isSearching ? <Loader2 className="w-4 h-4 text-orange-300 animate-spin shrink-0" /> : <Sparkles className="w-4 h-4 text-orange-300 shrink-0" />}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe the project you want to revive..."
            className="flex-1 bg-transparent text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none font-sans"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-800/80 border border-stone-700/60 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {query.trim() && !isSearching && filteredProjects.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-stone-500">
              <Sparkles className="w-3 h-3 text-orange-300" />
              {searchMode === 'semantic' ? 'Semantic matches' : searchMode === 'local-vector-fallback' ? 'Vector matches' : 'Keyword matches'}
            </div>
          )}
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={project.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectProject(project);
                    onClose();
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-orange-950/35 text-white'
                      : 'text-stone-300 hover:bg-stone-800/70'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-7 h-7 rounded bg-stone-900 border border-stone-800 text-stone-400 shrink-0">
                      <FolderGit2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-100 truncate">
                          {project.title}
                        </span>
                        <StatusBadge status={project.status} />
                        {project.githubStars && project.githubStars > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-400/90">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            {formatNumber(project.githubStars)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-stone-400 truncate">
                        {project.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1">
                      {project.techStack.slice(0, 2).map((t) => (
                        <TechBadge key={t} name={t} />
                      ))}
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-3 h-3 text-orange-300 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-stone-500">
              No close matches yet. Try a stack, role, or project goal.
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-stone-800 bg-[#151311] text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-[10px]">↵</kbd> Open
            </span>
          </div>
          <span>Showing {filteredProjects.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
