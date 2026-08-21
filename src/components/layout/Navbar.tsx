'use client';

import React from 'react';
import { Search, Menu } from 'lucide-react';
import { Project, UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import { NavTab } from '@/components/layout/Sidebar';

interface NavbarProps {
  projects: Project[];
  currentUser: UserProfile | null;
  currentTab: NavTab;
  onOpenSubmitModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  onOpenGlobalSearch: () => void;
  onOpenMobileMenu?: () => void;
}

export function Navbar({
  projects,
  currentUser,
  currentTab,
  onOpenSubmitModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onOpenGlobalSearch,
  onOpenMobileMenu,
}: NavbarProps) {
  return (
    <header className="h-16 border-b border-stone-800/80 bg-[#151311]/95 backdrop-blur-xs sticky top-0 z-20 px-4 sm:px-7 flex items-center justify-between gap-4">
      {/* Left: Mobile menu trigger + Quick Command Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Global Search Command Trigger Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center justify-between w-full h-9 px-3 rounded-md bg-stone-900/80 border border-stone-800 text-xs text-stone-400 hover:text-stone-100 hover:border-stone-700 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-stone-500 group-hover:text-orange-300" />
            <span className="truncate">Search codebases, stacks, authors...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-stone-500 bg-stone-800/80 border border-stone-700/60 rounded">
            Cmd K
          </kbd>
        </button>
      </div>

      {/* Right: User action or profile */}
      <div className="flex items-center gap-2 shrink-0">
        {currentUser ? (
          <div
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1 px-2 rounded-md hover:bg-zinc-850 border border-transparent hover:border-zinc-800 cursor-pointer transition-colors"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
            />
            <span className="text-xs font-medium text-zinc-200 hidden sm:inline">
              {currentUser.name}
            </span>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={onOpenAuthModal}>
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
