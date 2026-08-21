'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { HeaderNav, NavView } from '@/components/layout/HeaderNav';
import { ObservatoryHero } from '@/components/home/ObservatoryHero';
import { RevivalStories } from '@/components/home/RevivalStories';
import { ProjectDirectory } from '@/components/projects/ProjectDirectory';
import { ProjectDetailsDrawer } from '@/components/projects/ProjectDetailsDrawer';
import { SubmitProjectModal } from '@/components/projects/SubmitProjectModal';
import { CodebaseRequestModal } from '@/components/projects/CodebaseRequestModal';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { RequestsInboxView } from '@/components/requests/RequestsInboxView';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { GlobalSearchDialog } from '@/components/ui/GlobalSearchDialog';
import { Button } from '@/components/ui/Button';
import {
  Project,
  CodebaseRequest,
  UserProfile,
  CodebaseRequestStatus,
} from '@/types';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<CodebaseRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<NavView>('explore');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Modals & Drawers state
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);
  const [selectedProjectForRequest, setSelectedProjectForRequest] = useState<Project | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // 1. Fetch Current User Session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    }
  }, []);

  // 2. Fetch Projects from Database
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Projects fetch error:', err);
      toast.error('Failed to load codebases.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Fetch Requests from Database
  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Requests fetch error:', err);
    }
  }, []);

  useEffect(() => {
    Promise.allSettled([fetchSession(), fetchProjects(), fetchRequests()]);

    // Check for OAuth callback parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_success') === 'true') {
        toast.success('Signed in with GitHub');
        window.history.replaceState({}, '', window.location.pathname);
      }
      if (urlParams.get('auth_error')) {
        toast.error('GitHub authentication failed', {
          description: urlParams.get('auth_error') || 'Unknown error occurred.',
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [fetchSession, fetchProjects, fetchRequests]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to directory handler
  const handleScrollToDirectory = () => {
    const el = document.getElementById('directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler: Atomic Upvoting (1 vote per user in PostgreSQL)
  const handleToggleUpvote = async (projectId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      toast.info('Sign in required to upvote codebases.');
      return;
    }

    try {
      // Optimistic update
      setProjects((prev) =>
        prev.map((proj) => {
          if (proj.id === projectId) {
            const currentlyUpvoted = !!proj.hasUserUpvoted;
            return {
              ...proj,
              upvotesCount: currentlyUpvoted ? proj.upvotesCount - 1 : proj.upvotesCount + 1,
              weeklyUpvotesCount: currentlyUpvoted
                ? Math.max(0, proj.weeklyUpvotesCount - 1)
                : proj.weeklyUpvotesCount + 1,
              hasUserUpvoted: !currentlyUpvoted,
            };
          }
          return proj;
        })
      );

      const res = await fetch('/api/upvotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process upvote.');
      }

      // Re-synchronize with exact database counts
      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                upvotesCount: data.upvotesCount,
                weeklyUpvotesCount: data.weeklyUpvotesCount,
                hasUserUpvoted: data.hasUserUpvoted,
              }
            : proj
        )
      );

      if (data.hasUserUpvoted) {
        toast.success('Upvoted!');
      } else {
        toast.info('Upvote removed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upvote error');
      fetchProjects();
    }
  };

  // Handler: Submit new project to PostgreSQL
  const handleCreateProject = async (newProjectData: Project) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjectData.title,
          tagline: newProjectData.tagline,
          description: newProjectData.description,
          status: newProjectData.status,
          type: newProjectData.type,
          codebaseUrl: newProjectData.codebaseUrl,
          isCodebasePublic: newProjectData.isCodebasePublic,
          techStack: newProjectData.techStack,
          abandonReason: newProjectData.abandonReason,
          adoptionPitch: newProjectData.adoptionPitch,
          lookingFor: newProjectData.lookingFor,
          license: newProjectData.license,
          demoUrl: newProjectData.demoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish project.');
      }

      toast.success(`Published "${data.project.title}"`);
      fetchProjects();
      fetchSession();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit project');
    }
  };

  // Handler: Submit Codebase Request
  const handleSubmitCodebaseRequest = async (newRequest: CodebaseRequest) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newRequest.projectId,
          roleProposed: newRequest.roleProposed,
          initialMessage: newRequest.initialMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send request.');
      }

      toast.success('Codebase request sent');
      fetchRequests();
      setCurrentView('requests');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    }
  };

  // Handler: Send Chat Message
  const handleSendMessage = async (requestId: string, content: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message.');
      }

      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Message delivery failed');
    }
  };

  // Handler: Update Request Status
  const handleUpdateStatus = async (
    requestId: string,
    newStatus: CodebaseRequestStatus,
    accessLink?: string
  ) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          repoAccessGrantLink: accessLink,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status.');
      }

      toast.success(data.message || `Request marked as ${newStatus}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  // Handler: Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      if (currentView === 'requests') {
        setCurrentView('explore');
      }
      fetchRequests();
      toast.info('Signed out.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const userProjects = currentUser
    ? projects.filter((p) => p.owner.id === currentUser.id)
    : [];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-200">
      {/* Restrained Top Navigation */}
      <HeaderNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenSubmitModal={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsSubmitModalOpen(true);
        }}
        onOpenProfileModal={() => {
          if (!currentUser) setIsAuthModalOpen(true);
          else setIsProfileModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        requests={requests}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'explore' && (
          <div className="flex flex-col">
            {/* 1. Observatory Editorial Hero */}
            <ObservatoryHero
              projects={projects}
              onSelectProject={(proj) => setSelectedProjectForDetails(proj)}
              onOpenSubmitModal={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setIsSubmitModalOpen(true);
              }}
              onScrollToDirectory={handleScrollToDirectory}
            />

            {/* 2. Editorial Stories: "Projects worth reviving" */}
            <RevivalStories
              projects={projects}
              onSelectProject={(proj) => setSelectedProjectForDetails(proj)}
              onRequestCodebase={(proj) => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  toast.info('Sign in required to request codebase access.');
                } else {
                  setSelectedProjectForRequest(proj);
                }
              }}
              onToggleUpvote={handleToggleUpvote}
            />

            {/* 3. Power-User Directory Table */}
            <ProjectDirectory
              projects={projects}
              isLoading={isLoading}
              onSelectProject={(proj) => setSelectedProjectForDetails(proj)}
              onRequestCodebase={(proj) => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  toast.info('Sign in required to request codebase access.');
                } else {
                  setSelectedProjectForRequest(proj);
                }
              }}
              onToggleUpvote={handleToggleUpvote}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {currentView === 'spotlight' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <LeaderboardView
              projects={projects}
              onSelectProject={(proj) => setSelectedProjectForDetails(proj)}
              onRequestCodebase={(proj) => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                  toast.info('Sign in required to request codebase access.');
                } else {
                  setSelectedProjectForRequest(proj);
                }
              }}
              onToggleUpvote={handleToggleUpvote}
              onOpenSubmitModal={() => {
                if (!currentUser) setIsAuthModalOpen(true);
                else setIsSubmitModalOpen(true);
              }}
            />
          </div>
        )}

        {currentView === 'requests' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div>
              <h1 className="text-xl font-bold text-stone-100">
                Codebase Negotiation Inbox
              </h1>
              <p className="text-xs text-stone-400">
                Private handovers, contributor proposals, and repository invitation links.
              </p>
            </div>

            {currentUser ? (
              <RequestsInboxView
                requests={requests}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
              />
            ) : (
              <div className="p-12 text-center rounded-lg bg-[#14110f] border border-stone-800 space-y-3">
                <h3 className="text-sm font-semibold text-stone-200">
                  Sign in to view your requests
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Connect with your verified GitHub account to read proposals and chat with authors.
                </p>
                <Button
                  variant="default"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                >
                  Sign In with GitHub
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Command Palette (⌘K) */}
      <GlobalSearchDialog
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        projects={projects}
        onSelectProject={(proj) => setSelectedProjectForDetails(proj)}
      />

      {/* Modals & Decision Drawers */}
      <ProjectDetailsDrawer
        project={selectedProjectForDetails}
        onClose={() => setSelectedProjectForDetails(null)}
        onRequestCodebase={(proj) => {
          setSelectedProjectForDetails(null);
          if (!currentUser) {
            setIsAuthModalOpen(true);
            toast.info('Sign in required to request codebase access.');
          } else {
            setSelectedProjectForRequest(proj);
          }
        }}
        onToggleUpvote={handleToggleUpvote}
      />

      {currentUser && (
        <SubmitProjectModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleCreateProject}
          currentUser={currentUser}
        />
      )}

      {currentUser && (
        <CodebaseRequestModal
          project={selectedProjectForRequest}
          isOpen={Boolean(selectedProjectForRequest)}
          onClose={() => setSelectedProjectForRequest(null)}
          currentUser={currentUser}
          onSubmitRequest={handleSubmitCodebaseRequest}
        />
      )}

      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          userProjects={userProjects}
          onSelectProject={(p) => setSelectedProjectForDetails(p)}
          onLogout={handleLogout}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
