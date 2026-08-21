'use client';

import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  UserCheck,
} from 'lucide-react';
import { Project, CodebaseRequest, UserProfile } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

interface CodebaseRequestModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmitRequest: (request: CodebaseRequest) => void;
}

export function CodebaseRequestModal({
  project,
  isOpen,
  onClose,
  currentUser,
  onSubmitRequest,
}: CodebaseRequestModalProps) {
  const [proposalMessage, setProposalMessage] = useState('');
  const [roleProposed, setRoleProposed] = useState<
    'Maintainer' | 'Co-Founder' | 'Contributor' | 'Buyer' | 'Explorer'
  >('Maintainer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!proposalMessage.trim()) {
      alert('Please write a brief proposal message.');
      return;
    }

    setIsSubmitting(true);

    const newRequest: CodebaseRequest = {
      id: `req_${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      projectOwnerId: project.owner.id,
      projectOwnerName: project.owner.name,
      requester: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
        githubUsername: currentUser.githubUsername,
      },
      status: 'PENDING',
      initialMessage: proposalMessage.trim(),
      roleProposed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          requestId: `req_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatarUrl,
          content: proposalMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitRequest(newRequest);
      onClose();
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-indigo-400" />
            Request Codebase Access
          </DialogTitle>
          <DialogDescription>
            Reach out to @{project.owner.username} to discuss adoption, contributing, or repository access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Target Project Card */}
          <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-zinc-100 truncate">{project.title}</span>
              <span className="text-[11px] text-zinc-400 truncate">{project.tagline}</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono shrink-0 ml-2">
              {project.status}
            </span>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Proposed Role
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Maintainer', 'Co-Founder', 'Contributor', 'Buyer', 'Explorer'] as const).map(
                (role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleProposed(role)}
                    className={`py-1.5 px-2 rounded text-xs font-medium border transition-colors cursor-pointer ${
                      roleProposed === role
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {role}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Proposal Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Proposal Message
            </label>
            <textarea
              required
              rows={4}
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              placeholder={`Hi @${project.owner.username}, I'm interested in reviving ${project.title}. I have experience with ${project.techStack.slice(0, 2).join(', ')}...`}
              className="w-full p-2.5 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
            />
          </div>

          {/* Verification note */}
          <div className="p-2.5 rounded-md bg-zinc-900/50 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Your verified GitHub handle (<strong>{currentUser.githubUsername}</strong>) will be attached. A private thread will open in your Codebase Requests tab.
            </span>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" type="submit" loading={isSubmitting}>
              <Send className="w-3.5 h-3.5" />
              <span>Send Request</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
