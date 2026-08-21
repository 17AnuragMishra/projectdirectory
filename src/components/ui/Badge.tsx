import * as React from 'react';
import { cn } from '@/lib/utils';
import { ProjectStatus, ProjectType } from '@/types';

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'sm' }: StatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'Open':
        return {
          container: 'bg-emerald-950/35 text-emerald-300 border-emerald-800/40',
          dot: 'bg-emerald-400',
        };
      case 'Abandoned':
        return {
          container: 'bg-amber-950/35 text-amber-300 border-amber-800/40',
          dot: 'bg-amber-400',
        };
      case 'Open Source':
        return {
          container: 'bg-sky-950/35 text-sky-300 border-sky-800/40',
          dot: 'bg-cyan-400',
        };
      case 'Freelance':
        return {
          container: 'bg-orange-950/35 text-orange-300 border-orange-800/40',
          dot: 'bg-violet-400',
        };
      case 'Closed':
      default:
        return {
          container: 'bg-zinc-900 text-zinc-400 border-zinc-800',
          dot: 'bg-zinc-500',
        };
    }
  };

  const { container, dot } = getStyle();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded border tracking-tight shrink-0',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        container,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
      {status === 'Abandoned' ? 'Seeking Adoption' : status}
    </span>
  );
}

interface TypeBadgeProps {
  type: ProjectType;
  className?: string;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, className, size = 'sm' }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-normal rounded border bg-zinc-900/90 text-zinc-300 border-zinc-800 shrink-0',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs',
        className
      )}
    >
      {type}
    </span>
  );
}

interface TechBadgeProps {
  name: string;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function TechBadge({ name, className, onClick, selected }: TechBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center font-mono text-[11px] px-1.5 py-0.5 rounded border transition-colors shrink-0',
          selected
          ? 'bg-orange-950/60 text-orange-200 border-orange-700/60 font-medium'
          : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700',
        onClick && 'cursor-pointer select-none',
        className
      )}
    >
      {name}
    </span>
  );
}
