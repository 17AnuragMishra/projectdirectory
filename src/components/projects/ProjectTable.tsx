'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import {
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Heart,
  MessageSquareCode,
  SlidersHorizontal,
  Code2,
  X,
  Search,
  ChevronRight,
  FolderGit2,
  Check,
} from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { StatusBadge, TypeBadge, TechBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { formatNumber, formatDate, cn } from '@/lib/utils';

interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
  onSelectProject: (project: Project) => void;
  onRequestCodebase: (project: Project) => void;
  onToggleUpvote: (projectId: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const PRIMARY_STATUS_FILTERS: { label: string; value: ProjectStatus | 'ALL' }[] = [
  { label: 'All Projects', value: 'ALL' },
  { label: 'Seeking Adoption', value: 'Abandoned' },
  { label: 'Open Source', value: 'Open Source' },
  { label: 'Freelance', value: 'Freelance' },
];

const ALL_TYPES: ProjectType[] = [
  'Open Source',
  'Personal Project',
  'Startup',
  'Freelance',
  'Company Project',
];

export function ProjectTable({
  projects,
  isLoading = false,
  onSelectProject,
  onRequestCodebase,
  onToggleUpvote,
  searchQuery,
  onSearchChange,
}: ProjectTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'weeklyUpvotesCount', desc: true },
  ]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([]);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [onlyPublicCodebase, setOnlyPublicCodebase] = useState<boolean>(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState<boolean>(false);

  // All unique tech stacks across projects
  const allUniqueTechStacks = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.techStack.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return projects.filter((project) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = project.title.toLowerCase().includes(q);
        const matchesTagline = project.tagline.toLowerCase().includes(q);
        const matchesOwner =
          project.owner.name.toLowerCase().includes(q) ||
          project.owner.username.toLowerCase().includes(q);
        const matchesStack = project.techStack.some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesTagline && !matchesOwner && !matchesStack) {
          return false;
        }
      }

      // Status tab
      if (selectedStatusTab !== 'ALL') {
        if (selectedStatusTab === 'Open Source') {
          if (project.status !== 'Open Source' && project.status !== 'Open') return false;
        } else if (project.status !== selectedStatusTab) {
          return false;
        }
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(project.type)) {
        return false;
      }

      // Tech Stack filter
      if (selectedTechStack.length > 0) {
        const hasStack = project.techStack.some((t) =>
          selectedTechStack.includes(t)
        );
        if (!hasStack) return false;
      }

      // Public Codebase Only filter
      if (onlyPublicCodebase && !project.isCodebasePublic) {
        return false;
      }

      return true;
    });
  }, [
    projects,
    searchQuery,
    selectedStatusTab,
    selectedTypes,
    selectedTechStack,
    onlyPublicCodebase,
  ]);

  // Columns definition for desktop TanStack Table
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1.5 font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Project
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3 h-3 text-orange-300" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3 h-3 text-orange-300" />
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-40" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className="flex flex-col gap-0.5 py-1 max-w-[280px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-stone-100 group-hover:text-white transition-colors truncate">
                  {project.title}
                </span>
                {project.githubStars && project.githubStars > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400">
                    <Star className="w-2.5 h-2.5 text-amber-400/90 fill-amber-400/90" />
                    {formatNumber(project.githubStars)}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-stone-400 line-clamp-1 leading-normal">
                {project.tagline}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'owner',
        header: 'Maintainer',
        cell: ({ row }) => {
          const owner = row.original.owner;
          return (
            <div className="flex items-center gap-2 py-1">
              <img
                src={owner.avatarUrl}
                alt={owner.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
              />
              <span className="text-xs text-stone-300 truncate max-w-[110px]">
                {owner.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'techStack',
        header: 'Tech Stack',
        cell: ({ row }) => {
          const stack = row.original.techStack;
          const display = stack.slice(0, 2);
          const remaining = stack.slice(2);

          return (
            <div className="flex items-center gap-1 max-w-[200px]">
              {display.map((t) => (
                <TechBadge
                  key={t}
                  name={t}
                  selected={selectedTechStack.includes(t)}
                  onClick={() => {
                    setSelectedTechStack((prev) =>
                      prev.includes(t) ? prev.filter((s) => s !== t) : [...prev, t]
                    );
                  }}
                />
              ))}
              {remaining.length > 0 && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded cursor-help">
                        +{remaining.length}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{remaining.join(', ')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'codebaseUrl',
        header: 'Codebase',
        cell: ({ row }) => {
          const project = row.original;
          if (project.isCodebasePublic && project.codebaseUrl) {
            return (
              <a
                href={project.codebaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-orange-300 hover:underline"
              >
                <Code2 className="w-3 h-3 text-zinc-500" />
                <span className="truncate max-w-[90px]">Repo</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            );
          }

          if (project.status === 'Closed') {
            return <span className="text-zinc-600 font-mono text-[11px]">—</span>;
          }

          return (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRequestCodebase(project);
              }}
              className="text-[11px] h-7 px-2 text-orange-300 border-orange-500/30 hover:bg-orange-950/40"
            >
              <MessageSquareCode className="w-3 h-3" />
              Request Access
            </Button>
          );
        },
      },
      {
        accessorKey: 'weeklyUpvotesCount',
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1 font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Upvotes
              {isSorted === 'asc' ? (
                <ArrowUp className="w-3 h-3 text-orange-300" />
              ) : isSorted === 'desc' ? (
                <ArrowDown className="w-3 h-3 text-orange-300" />
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-40" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const project = row.original;
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleUpvote(project.id);
              }}
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-medium border transition-colors cursor-pointer',
                project.hasUserUpvoted
                  ? 'bg-orange-950/40 text-orange-300 border-orange-800/50'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-orange-300 hover:border-stone-700'
              )}
            >
              <Heart
                className={cn(
                  'w-3 h-3',
                  project.hasUserUpvoted
                    ? 'fill-orange-500 text-orange-500'
                    : 'text-stone-500'
                )}
              />
              <span>{project.upvotesCount}</span>
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end">
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
            </div>
          );
        },
      },
    ],
    [onRequestCodebase, onToggleUpvote, selectedTechStack]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 12 },
    },
  });

  const clearAllFilters = () => {
    setSelectedStatusTab('ALL');
    setSelectedTypes([]);
    setSelectedTechStack([]);
    setOnlyPublicCodebase(false);
    onSearchChange('');
  };

  const activeFiltersCount =
    (selectedStatusTab !== 'ALL' ? 1 : 0) +
    selectedTypes.length +
    selectedTechStack.length +
    (onlyPublicCodebase ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Unified Toolbar */}
      <div className="flex flex-col gap-3 p-3.5 rounded-lg bg-[#1a1715] border border-stone-800/80">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Status Tab Group */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-stone-950/70 border border-stone-800 overflow-x-auto">
            {PRIMARY_STATUS_FILTERS.map((tab) => {
              const isSelected = selectedStatusTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedStatusTab(tab.value)}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer',
                    isSelected
                      ? 'bg-stone-800 text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-100'
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Controls: Search Input + Advanced Filter Popover */}
          <div className="flex items-center gap-2">
            {/* Inline Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter by keyword or stack..."
                className="w-full h-9 pl-8 pr-7 text-xs rounded-md bg-stone-950/60 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-orange-700/70"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Advanced Filters Popover */}
            <Popover open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
                  size="sm"
                  className="h-8 gap-1.5 shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-orange-700 text-[10px] text-white flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-200">
                    Filter Codebases
                  </span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 transition-colors"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Project Types */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-zinc-400">
                    Project Type
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {ALL_TYPES.map((t) => {
                      const isSelected = selectedTypes.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() =>
                            setSelectedTypes((prev) =>
                              isSelected ? prev.filter((x) => x !== t) : [...prev, t]
                            )
                          }
                          className={cn(
                            'px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Public Only Checkbox */}
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={onlyPublicCodebase}
                    onChange={(e) => setOnlyPublicCodebase(e.target.checked)}
                    className="rounded bg-zinc-900 border-zinc-700 text-indigo-600"
                  />
                  <span>Public repository only</span>
                </label>

                {/* Popular Tech Stacks */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-medium text-zinc-400">
                    Tech Stack ({allUniqueTechStacks.length})
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                    {allUniqueTechStacks.map((tech) => (
                      <TechBadge
                        key={tech}
                        name={tech}
                        selected={selectedTechStack.includes(tech)}
                        onClick={() => {
                          setSelectedTechStack((prev) =>
                            prev.includes(tech)
                              ? prev.filter((t) => t !== tech)
                              : [...prev, tech]
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Removable Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-800/60">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">
              Active:
            </span>

            {selectedStatusTab !== 'ALL' && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Status: {selectedStatusTab}
                <button
                  onClick={() => setSelectedStatusTab('ALL')}
                  className="text-zinc-400 hover:text-zinc-100 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                Type: {type}
                <button
                  onClick={() =>
                    setSelectedTypes((prev) => prev.filter((t) => t !== type))
                  }
                  className="text-zinc-400 hover:text-zinc-100 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {selectedTechStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
              >
                {tech}
                <button
                  onClick={() =>
                    setSelectedTechStack((prev) => prev.filter((t) => t !== tech))
                  }
                  className="text-zinc-400 hover:text-zinc-100 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {onlyPublicCodebase && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Public Codebase Only
                <button
                  onClick={() => setOnlyPublicCodebase(false)}
                  className="text-zinc-400 hover:text-zinc-100 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11px] text-zinc-400 hover:text-rose-400 ml-auto transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Desktop Data Table (md and above) */}
      <div className="hidden md:block rounded-lg border border-stone-800/80 bg-[#171412] overflow-x-auto">
        <table className="w-full min-w-[920px] text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-stone-800/90 bg-[#1d1917] text-[11px] font-medium text-stone-400"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="py-2.5 px-3.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-800/60 text-xs">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column, columnIndex) => (
                    <td key={`${index}-${columnIndex}`} className="py-4 px-3.5">
                      <div className={cn('h-3 rounded bg-stone-800/80 animate-pulse', columnIndex === 0 ? 'w-3/4' : 'w-16')} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelectProject(row.original)}
                  className="hover:bg-orange-950/15 transition-colors cursor-pointer group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2.5 px-3.5 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-sm font-semibold text-stone-200">
                      No revival candidates match these filters
                    </span>
                    <p className="text-xs text-stone-500 max-w-sm">
                      Clear a filter or try a broader search to bring more projects back into view.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="mt-2"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-zinc-800 bg-[#111215] text-[11px] text-zinc-400">
          <div>
            Showing <span className="font-semibold text-zinc-200">{filteredData.length}</span> codebases
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-6 text-[11px] px-2"
            >
              Previous
            </Button>
            <span className="font-mono text-[11px] px-1">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-6 text-[11px] px-2"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Card List (< md breakpoint) */}
      <div className="md:hidden flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="h-36 rounded-lg border border-stone-800 bg-[#171412] animate-pulse" />
          ))
        ) : filteredData.length > 0 ? (
          filteredData.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="p-4 rounded-lg border border-stone-800 bg-[#171412] flex flex-col gap-3 cursor-pointer hover:border-orange-800/70 hover:bg-orange-950/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-100">
                      {project.title}
                    </span>
                    {project.githubStars && project.githubStars > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-zinc-400">
                        <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        {formatNumber(project.githubStars)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs leading-5 text-stone-400 line-clamp-2">
                    {project.tagline}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {project.techStack.slice(0, 3).map((t) => (
                  <TechBadge key={t} name={t} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-xs">
                <div className="flex items-center gap-1.5">
                  <img
                    src={project.owner.avatarUrl}
                    alt={project.owner.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <span className="text-[11px] text-stone-400">
                    @{project.owner.username}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUpvote(project.id);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border',
                      project.hasUserUpvoted
                        ? 'bg-orange-950/40 text-orange-300 border-orange-800/50'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    )}
                  >
                    <Heart
                      className={cn(
                        'w-3 h-3',
                        project.hasUserUpvoted
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-stone-500'
                      )}
                    />
                    <span>{project.upvotesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-stone-500 rounded-lg border border-stone-800 bg-[#171412]">
            No revival candidates match your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
