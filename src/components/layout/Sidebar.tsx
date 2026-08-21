'use client';

import React from 'react';
import {
  Compass,
  Trophy,
  Plus,
  MessageSquareCode,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProfile, CodebaseRequest } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';

export type NavTab = 'explore' | 'leaderboard' | 'requests';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSubmitModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UserProfile | null;
  requests: CodebaseRequest[];
}

export function Sidebar({
  currentTab,
  onSelectTab,
  onOpenSubmitModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  requests,
}: SidebarProps) {
  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'PENDING' || r.status === 'ACCEPTED'
  ).length;

  const navItems = [
    {
      id: 'explore' as NavTab,
      label: 'Explore Projects',
      icon: Compass,
      badge: null,
    },
    {
      id: 'leaderboard' as NavTab,
      label: 'Weekly Spotlight',
      icon: Trophy,
      badge: (
        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40">
          Rankings
        </span>
      ),
    },
    ...(currentUser
      ? [
          {
            id: 'requests' as NavTab,
            label: 'Codebase Requests',
            icon: MessageSquareCode,
            badge:
              pendingRequestsCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono font-semibold">
                  {pendingRequestsCount}
                </span>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'relative flex flex-col justify-between h-screen bg-[#151311] border-r border-stone-800/90 transition-all duration-200 ease-in-out shrink-0 z-30 select-none',
          isCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Brand Header & Navigation */}
        <div className="flex flex-col">
          {/* Brand Row */}
          <div className="flex items-center justify-between h-16 px-3.5 border-b border-stone-800/80">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-orange-950/70 text-orange-100 border border-orange-800/70 shrink-0">
                <FolderGit2 className="w-4 h-4 text-orange-300" />
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-stone-100">
                    GitRevive
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Primary Action Button: List a Project */}
          <div className="p-3">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={() => {
                      if (!currentUser) onOpenAuthModal();
                      else onOpenSubmitModal();
                    }}
                    className="w-full h-8"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">List a Project</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (!currentUser) onOpenAuthModal();
                  else onOpenSubmitModal();
                }}
                className="w-full justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>List a Project</span>
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-2 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              if (isCollapsed) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectTab(item.id)}
                        className={cn(
                          'flex items-center justify-center w-full h-9 rounded-md transition-colors cursor-pointer',
                          isActive
                            ? 'bg-orange-950/55 text-orange-100'
                            : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/50'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    'flex items-center justify-between w-full h-9 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left',
                    isActive
                      ? 'bg-orange-950/55 text-orange-100'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isActive ? 'text-orange-300' : 'text-stone-500'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Authentication Dock */}
        <div className="p-2.5 border-t border-stone-800/80 flex flex-col gap-1.5 bg-[#12100f]">
          {currentUser ? (
            <>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onOpenProfileModal}
                      className="flex items-center justify-center w-full h-9 rounded-md hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {currentUser.name} (@{currentUser.username})
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div
                  onClick={onOpenProfileModal}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-zinc-800/70 border border-transparent hover:border-zinc-700/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate">
                        @{currentUser.username}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1 py-0.2 rounded shrink-0">
                    ★ {currentUser.reputation}
                  </span>
                </div>
              )}

              {!isCollapsed && (
                <div className="flex items-center justify-between px-1.5 pt-0.5 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    Verified
                  </span>
                  <button
                    onClick={onLogout}
                    className="hover:text-zinc-300 flex items-center gap-1 cursor-pointer transition-colors text-[10px]"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onOpenAuthModal}
                      className="w-full h-8"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign In with GitHub</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenAuthModal}
                  className="w-full justify-center"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              )}
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
