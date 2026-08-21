'use client';

import React from 'react';
import {
  Search,
  Plus,
  Compass,
  Trophy,
  MessageSquareCode,
  ShieldCheck,
  Github,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/DropdownMenu';
import { UserProfile, CodebaseRequest } from '@/types';
import { cn } from '@/lib/utils';

export type NavView = 'explore' | 'spotlight' | 'requests';

interface HeaderNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenSubmitModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  onOpenGlobalSearch: () => void;
  onLogout: () => void;
  currentUser: UserProfile | null;
  requests: CodebaseRequest[];
}

export function HeaderNav({
  currentView,
  onSelectView,
  onOpenSubmitModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenGlobalSearch,
  onLogout,
  currentUser,
  requests,
}: HeaderNavProps) {
  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-[#0d0b0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity & Left Nav */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => onSelectView('explore')}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            {/* Custom Graphic Symbol */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-stone-900 border border-stone-800 group-hover:border-orange-500/50 transition-colors">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none" className="shrink-0">
                <path d="M 9 7 L 9 25" stroke="#a8a29e" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 9 19 C 9 14 14 12 19 12" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="9" cy="8" r="2.5" fill="#1c1917" stroke="#d6d3d1" strokeWidth="2" />
                <circle cx="9" cy="24" r="2.5" fill="#1c1917" stroke="#d6d3d1" strokeWidth="2" />
                <circle cx="19.5" cy="12" r="3.2" fill="#f97316" />
                <circle cx="19.5" cy="12" r="1.5" fill="#fffbeb" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-stone-100 group-hover:text-white transition-colors">
                ProjectRevive
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-orange-400/90 font-medium">
                Observatory
              </span>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onSelectView('explore')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                currentView === 'explore'
                  ? 'bg-stone-800/80 text-stone-100 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              )}
            >
              <Compass className="w-3.5 h-3.5 text-stone-400" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => onSelectView('spotlight')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                currentView === 'spotlight'
                  ? 'bg-stone-800/80 text-stone-100 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              )}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Spotlight</span>
            </button>

            {currentUser && (
              <button
                onClick={() => onSelectView('requests')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer relative',
                  currentView === 'requests'
                    ? 'bg-stone-800/80 text-stone-100 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                )}
              >
                <MessageSquareCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inbox</span>
                {pendingRequestsCount > 0 && (
                  <span className="ml-0.5 px-1 py-0.2 rounded bg-orange-600 text-[10px] font-mono text-white font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions: Command Search + List Project + Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Global Command Search Trigger */}
          <button
            onClick={onOpenGlobalSearch}
            className="flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-md bg-stone-900/80 hover:bg-stone-850 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 transition-all text-xs cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300" />
            <span className="hidden sm:inline">Search repositories...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 border border-stone-700">
              ⌘K
            </kbd>
          </button>

          {/* List a Project CTA */}
          <Button
            variant="default"
            size="sm"
            onClick={onOpenSubmitModal}
            className="bg-orange-600 hover:bg-orange-500 text-white font-medium shadow-sm border border-orange-500/30 gap-1.5 text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List a Project</span>
            <span className="sm:hidden">List</span>
          </Button>

          {/* User Profile / Auth with Dropdown */}
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-orange-500/40 transition-all cursor-pointer focus:outline-none">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-700"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 space-y-1">
                <div className="px-2.5 py-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-stone-100 truncate">
                    <span>{currentUser.name}</span>
                    <span className="inline-flex items-center text-[9px] px-1 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 truncate">
                    @{currentUser.username}
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onOpenProfileModal}>
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Developer Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={onOpenSubmitModal}>
                  <Plus className="w-3.5 h-3.5 text-orange-400" />
                  <span>List a Repository</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-red-400 focus:text-red-300 focus:bg-red-950/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAuthModal}
              className="h-8 text-xs border-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-850"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
