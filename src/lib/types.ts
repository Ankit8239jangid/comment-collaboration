// Core domain types for the comments collaboration system

export type Role =
  | "Recruiter"
  | "Manager"
  | "Sales"
  | "Admin"
  | "Agency Representative";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Used to render a colored initials avatar */
  color: string;
  /** Optional avatar URL */
  avatarUrl?: string;
}

export interface Agency {
  id: string;
  name: string;
  /** Tailwind gradient classes for the agency avatar */
  gradient: string;
  /** User IDs of participants */
  participantIds: string[];
}

export type AttachmentKind = "image" | "document";

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  url: string;
  size?: string;
  mimeType: string;
  /** Thumbnail for documents (icon) */
  icon?: string;
}

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  /** Raw text — may contain @Name tokens for mentions */
  text: string;
  mentions: string[]; // user IDs mentioned in the comment
  attachments: Attachment[];
  reactions: Reaction[];
  createdAt: string; // ISO string
  editedAt?: string;
  pinged?: boolean;
  replies: Comment[]; // only 1 level of nesting allowed
}

export interface AgencyDiscussion {
  agencyId: string;
  candidateId: string;
  comments: Comment[];
  lastActivity: string; // ISO string
  unreadCount: number;
  lastMessagePreview: string;
}

export type CandidateStatus =
  | "Active"
  | "Pending"
  | "Interview"
  | "Hired"
  | "Rejected";

export interface Candidate {
  id: string;
  name: string;
  color: string;
  status: CandidateStatus;
  agency: string;
  lastActivity: string; // ISO string
  position: string;
  email: string;
  location: string;
  totalComments: number;
}

export interface AppNotification {
  id: string;
  type: "mention" | "reply" | "new-comment" | "ping";
  text: string;
  createdAt: string;
  read: boolean;
  candidateId?: string;
  agencyId?: string;
  commentId?: string;
}

export const ROLE_BADGE_STYLES: Record<Role, string> = {
  Recruiter: "bg-blue-50 text-blue-700 border-blue-200",
  Manager: "bg-purple-50 text-purple-700 border-purple-200",
  Sales: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Admin: "bg-rose-50 text-rose-700 border-rose-200",
  "Agency Representative": "bg-orange-50 text-orange-700 border-orange-200",
};

export const CANDIDATE_STATUS_STYLES: Record<CandidateStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Interview: "bg-blue-50 text-blue-700 border-blue-200",
  Hired: "bg-orange-50 text-orange-700 border-orange-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};
