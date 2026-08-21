'use client';

import React, { useState } from 'react';
import {
  MessageSquareCode,
  Send,
  CheckCircle2,
  XCircle,
  KeyRound,
  ExternalLink,
  Clock,
  Check,
  FolderGit2,
  X,
} from 'lucide-react';
import { CodebaseRequest, UserProfile, CodebaseRequestStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { formatDate, cn } from '@/lib/utils';

interface RequestsInboxViewProps {
  requests: CodebaseRequest[];
  currentUser: UserProfile;
  onSendMessage: (requestId: string, content: string) => void;
  onUpdateStatus: (requestId: string, status: CodebaseRequestStatus, accessLink?: string) => void;
}

export function RequestsInboxView({
  requests,
  currentUser,
  onSendMessage,
  onUpdateStatus,
}: RequestsInboxViewProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string>(
    requests[0]?.id || ''
  );
  const [inputMessage, setInputMessage] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantRepoUrl, setGrantRepoUrl] = useState('');

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedRequestId) return;
    onSendMessage(selectedRequestId, inputMessage.trim());
    setInputMessage('');
  };

  const getStatusBadge = (status: CodebaseRequestStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Accepted
          </span>
        );
      case 'ACCESS_GRANTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-mono font-medium">
            <KeyRound className="w-3 h-3 text-indigo-400" /> Access Granted
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 font-medium">
            <XCircle className="w-3 h-3 text-rose-400" /> Declined
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 font-medium">
            <Clock className="w-3 h-3 text-amber-400" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col md:flex-row rounded-lg border border-zinc-800 bg-[#0e0f12] overflow-hidden">
      {/* Left Pane: Requests Thread List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-[#111215] flex flex-col shrink-0">
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-semibold text-zinc-200">
              Codebase Inbox
            </h2>
          </div>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
            {requests.length} threads
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
          {requests.map((req) => {
            const isSelected = req.id === selectedRequestId;
            const lastMsg = req.messages[req.messages.length - 1];

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequestId(req.id)}
                className={cn(
                  'p-3 flex flex-col gap-1.5 cursor-pointer transition-colors text-xs',
                  isSelected
                    ? 'bg-zinc-800/80 border-l-2 border-indigo-500'
                    : 'hover:bg-zinc-850/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-zinc-100 truncate max-w-[170px]">
                    {req.projectTitle}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatDate(req.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <img
                    src={req.requester.avatarUrl}
                    alt={req.requester.name}
                    className="w-4 h-4 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <span className="text-[11px] text-zinc-300 truncate">
                    {req.requester.name}
                  </span>
                  <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                    {req.roleProposed}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  {lastMsg ? lastMsg.content : req.initialMessage}
                </p>

                <div className="pt-0.5">
                  {getStatusBadge(req.status)}
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No codebase requests found.
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Live Chat / Negotiation Room */}
      {selectedRequest ? (
        <div className="flex-1 flex flex-col bg-[#0c0d10] overflow-hidden">
          {/* Room Header */}
          <div className="p-3.5 px-5 border-b border-zinc-800 bg-[#121316] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={selectedRequest.requester.avatarUrl}
                alt={selectedRequest.requester.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-zinc-100">
                    {selectedRequest.requester.name}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    (@{selectedRequest.requester.username})
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Project: <strong className="text-zinc-200 font-medium">{selectedRequest.projectTitle}</strong> • Role: <strong className="text-indigo-300 font-medium">{selectedRequest.roleProposed}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
              {getStatusBadge(selectedRequest.status)}

              {selectedRequest.status === 'PENDING' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(selectedRequest.id, 'ACCEPTED')}
                    className="text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/40"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(selectedRequest.id, 'DECLINED')}
                    className="text-rose-400 border-rose-800/60 hover:bg-rose-950/40"
                  >
                    Decline
                  </Button>
                </>
              )}

              {selectedRequest.status === 'ACCEPTED' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowGrantModal(true)}
                >
                  <KeyRound className="w-3 h-3" /> Grant Access Key
                </Button>
              )}
            </div>
          </div>

          {/* Access Grant Link Banner */}
          {selectedRequest.repoAccessGrantLink && (
            <div className="p-2.5 px-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Access invitation link:</span>
                <a
                  href={selectedRequest.repoAccessGrantLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-indigo-300 underline hover:text-indigo-200 flex items-center gap-1"
                >
                  {selectedRequest.repoAccessGrantLink}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {selectedRequest.messages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-start gap-2.5 max-w-[80%]',
                    isCurrentUser ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700 shrink-0 mt-0.5"
                  />
                  <div className="flex flex-col gap-0.5">
                    <div
                      className={cn(
                        'flex items-center gap-2 text-[10px] text-zinc-500',
                        isCurrentUser ? 'justify-end' : ''
                      )}
                    >
                      <span className="font-medium text-zinc-400">{msg.senderName}</span>
                      <span>{formatDate(msg.timestamp)}</span>
                    </div>

                    <div
                      className={cn(
                        'p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line',
                        isCurrentUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-850 text-zinc-200 border border-zinc-750'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-zinc-800 bg-[#111215] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${selectedRequest.requester.name}...`}
              className="flex-1 h-8 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 font-sans"
            />
            <Button variant="default" size="sm" type="submit" disabled={!inputMessage.trim()}>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
          <MessageSquareCode className="w-8 h-8 mb-2 text-zinc-600" />
          <h3 className="text-xs font-semibold text-zinc-300">Select a Thread</h3>
          <p className="text-[11px] max-w-xs mt-1">
            Choose a codebase request thread on the left to review proposals and manage access.
          </p>
        </div>
      )}

      {/* Grant Access Modal */}
      {showGrantModal && selectedRequest && (
        <Dialog open={showGrantModal} onOpenChange={setShowGrantModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" /> Grant Codebase Access
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Provide a GitHub repository invitation link or access URL to deliver to <strong>{selectedRequest.requester.name}</strong>:
              </p>
              <input
                type="url"
                value={grantRepoUrl}
                onChange={(e) => setGrantRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo/invitations"
                className="w-full h-8 px-3 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="sm" onClick={() => setShowGrantModal(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (!grantRepoUrl.trim()) return;
                  onUpdateStatus(selectedRequest.id, 'ACCESS_GRANTED', grantRepoUrl.trim());
                  setShowGrantModal(false);
                  setGrantRepoUrl('');
                }}
              >
                Send Access Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
