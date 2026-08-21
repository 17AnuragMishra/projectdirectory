'use client';

import React from 'react';
import {
  User,
  ShieldCheck,
  Award,
  FolderGit2,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { UserProfile, Project } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  userProjects: Project[];
  onSelectProject: (p: Project) => void;
  onLogout?: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  userProjects,
  onSelectProject,
  onLogout,
}: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#14110f] border-stone-800">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-[#171411]">
          <DialogTitle className="text-base font-semibold text-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-400" />
            Developer Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-stone-400 mt-0.5">
            Verified contributor credentials and listed codebases
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* User Bio Card */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-stone-950/70 border border-stone-800">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-1 ring-stone-700 shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-stone-100 truncate">
                  {currentUser.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                </span>
              </div>
              <span className="text-xs text-stone-400 truncate">
                @{currentUser.username} • {currentUser.email}
              </span>
              {currentUser.bio && (
                <p className="text-xs text-stone-300 mt-1 leading-relaxed line-clamp-2">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-3 rounded-lg bg-stone-950/50 border border-stone-800">
              <span className="text-[10px] uppercase text-stone-500 font-medium flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber-400" /> Reputation
              </span>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                ★ {currentUser.reputation}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950/50 border border-stone-800">
              <span className="text-[10px] uppercase text-stone-500 font-medium flex items-center justify-center gap-1">
                <FolderGit2 className="w-3 h-3 text-orange-400" /> Listed
              </span>
              <div className="text-base font-bold text-stone-200 mt-0.5">
                {currentUser.projectsCreated}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950/50 border border-stone-800">
              <span className="text-[10px] uppercase text-stone-500 font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Adoptions
              </span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {currentUser.contributions}
              </div>
            </div>
          </div>

          {/* User's Created Projects */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Your Listed Codebases
            </h3>
            {userProjects.length > 0 ? (
              <div className="space-y-1.5">
                {userProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onClose();
                      onSelectProject(proj);
                    }}
                    className="p-3 rounded-lg bg-stone-950/60 border border-stone-800 hover:border-stone-700 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-stone-200 truncate">
                        {proj.title}
                      </span>
                      <span className="text-[11px] text-stone-500 truncate">
                        {proj.tagline}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 shrink-0 ml-2">
                      {proj.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-stone-500 bg-stone-950/30 rounded-lg border border-stone-800">
                You have not listed any codebases yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer with Sign Out and Close */}
        <div className="p-4 border-t border-stone-800 bg-[#171411] flex items-center justify-between">
          {onLogout ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <div />
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
