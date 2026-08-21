export type ProjectStatus = 'Open' | 'Abandoned' | 'Open Source' | 'Freelance' | 'Closed';

export type ProjectType = 'Open Source' | 'Freelance' | 'Company Project' | 'Personal Project' | 'Startup';

export interface ProjectOwner {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  githubUsername?: string;
  bio?: string;
  role?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  owner: ProjectOwner;
  status: ProjectStatus;
  type: ProjectType;
  codebaseUrl?: string;
  isCodebasePublic: boolean;
  techStack: string[];
  githubStars?: number;
  githubForks?: number;
  githubOpenIssues?: number;
  githubLastCommit?: string;
  upvotesCount: number;
  weeklyUpvotesCount: number;
  lastLeaderboardFeaturedAt?: string;
  isInLeaderboardCooldown?: boolean;
  hasUserUpvoted?: boolean;
  adoptionPitch?: string;
  abandonReason?: string;
  lookingFor?: string[];
  license?: string;
  demoUrl?: string;
  createdAt: string;
  updatedAt: string;
}


export type CodebaseRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ACCESS_GRANTED';

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isCodeSnippet?: boolean;
}

export interface CodebaseRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  projectOwnerId: string;
  projectOwnerName: string;
  requester: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    githubUsername?: string;
  };
  status: CodebaseRequestStatus;
  initialMessage: string;
  roleProposed: 'Maintainer' | 'Co-Founder' | 'Technical Co-Founder' | 'Contributor' | 'Buyer' | 'Explorer';
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  repoAccessGrantLink?: string;
}

export interface ProjectFilterState {
  search: string;
  statuses: ProjectStatus[];
  types: ProjectType[];
  techStacks: string[];
  sortBy: 'trending' | 'upvotes' | 'stars' | 'newest' | 'abandoned';
  onlyPublicCodebase: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'upvote' | 'submission' | 'request' | 'revival' | 'access_granted';
  user: {
    name: string;
    avatarUrl: string;
  };
  projectTitle: string;
  projectId: string;
  timestamp: string;
  detail?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  email: string;
  githubUsername?: string;
  bio?: string;
  reputation: number;
  projectsCreated: number;
  requestsSent: number;
  contributions: number;
}
