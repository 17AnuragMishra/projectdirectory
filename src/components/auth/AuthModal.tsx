'use client';

import React, { useState } from 'react';
import {
  Github,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const handleGitHubSignIn = () => {
    setIsRedirecting(true);
    window.location.href = '/api/auth/github';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100">
              <Github className="w-4 h-4" />
            </div>
            <DialogTitle>Sign In with GitHub</DialogTitle>
          </div>
          <DialogDescription>
            Official GitHub OAuth 2.0 developer verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-md bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Developer Identity
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect your GitHub account to upvote codebases, negotiate project adoptions, and list your own repositories.
            </p>
            <div className="pt-1 flex flex-col gap-1 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Zero password storage (100% GitHub OAuth 2.0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>1 verified developer = 1 vote per project</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Synchronizes official GitHub avatar & public profile</span>
              </div>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            onClick={handleGitHubSignIn}
            loading={isRedirecting}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold h-10 text-xs gap-2 cursor-pointer"
          >
            <Github className="w-4 h-4 fill-current" />
            <span>Continue with GitHub</span>
            <ArrowRight className="w-3.5 h-3.5 ml-auto" />
          </Button>

          <p className="text-[11px] text-center text-zinc-500">
            By signing in, you agree to participate as a verified GitHub developer on GitRevive.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
