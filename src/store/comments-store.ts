"use client";

import { create } from "zustand";
import {
  AGENCIES,
  AGENCY_MAP,
  CANDIDATES,
  CANDIDATE_MAP,
  CURRENT_USER_ID,
  DISCUSSIONS,
  INITIAL_NOTIFICATIONS,
  USER_MAP,
  USERS,
} from "@/lib/dummy-data";
import type {
  Agency,
  AgencyDiscussion,
  AppNotification,
  Attachment,
  Candidate,
  Comment,
  User,
} from "@/lib/types";
import { uid } from "@/lib/utils";

interface CommentsState {
  // ---- master data ----
  users: User[];
  userMap: Record<string, User>;
  agencies: Agency[];
  agencyMap: Record<string, Agency>;
  candidates: Candidate[];
  candidateMap: Record<string, Candidate>;
  currentUserId: string;

  // ---- discussion store keyed by `candidateId:agencyId` ----
  discussions: Record<string, AgencyDiscussion>;

  // ---- ui state ----
  drawerOpen: boolean;
  activeCandidateId: string | null;
  /** View stack inside the drawer: 'agencies' → 'discussion' → 'thread' */
  view: "agencies" | "discussion" | "thread";
  activeAgencyId: string | null;
  activeThreadId: string | null; // parent comment id when in thread view

  // ---- composer state ----
  /** Inline reply composer attached to a specific comment id (in discussion view) */
  inlineReplyCommentId: string | null;
  typingUsers: Record<string, string[]>;

  // ---- search ----
  discussionSearch: string;

  // ---- notifications ----
  notifications: AppNotification[];
  notificationsOpen: boolean;

  // ---- lightbox ----
  lightboxImage: { url: string; name: string } | null;

  // ---- actions ----
  openDrawer: (candidateId: string) => void;
  closeDrawer: () => void;
  goBack: () => void;
  openAgencyDiscussion: (agencyId: string) => void;
  openThread: (commentId: string) => void;

  setInlineReply: (commentId: string | null) => void;
  setDiscussionSearch: (q: string) => void;
  toggleNotifications: () => void;
  setNotificationsOpen: (open: boolean) => void;
  markNotificationsRead: () => void;

  setLightboxImage: (img: { url: string; name: string } | null) => void;

  addComment: (
    discussionKey: string,
    text: string,
    mentions: string[],
    attachments: Attachment[]
  ) => string;
  addReply: (
    discussionKey: string,
    parentCommentId: string,
    text: string,
    mentions: string[],
    attachments: Attachment[]
  ) => string;
  editComment: (
    discussionKey: string,
    commentId: string,
    text: string,
    mentions: string[]
  ) => void;
  deleteComment: (discussionKey: string, commentId: string) => void;
  toggleReaction: (
    discussionKey: string,
    commentId: string,
    emoji: string,
    isReply?: boolean,
    parentId?: string
  ) => void;
  pingComment: (
    discussionKey: string,
    commentId: string,
    isReply?: boolean,
    parentId?: string
  ) => void;

  markDiscussionRead: (discussionKey: string) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;

  setTyping: (discussionKey: string, userIds: string[]) => void;
}

const key = (candidateId: string, agencyId: string) =>
  `${candidateId}:${agencyId}`;

export const useCommentsStore = create<CommentsState>((set, get) => ({
  users: USERS,
  userMap: USER_MAP,
  agencies: AGENCIES,
  agencyMap: AGENCY_MAP,
  candidates: CANDIDATES,
  candidateMap: CANDIDATE_MAP,
  currentUserId: CURRENT_USER_ID,

  discussions: DISCUSSIONS,

  drawerOpen: false,
  activeCandidateId: null,
  view: "agencies",
  activeAgencyId: null,
  activeThreadId: null,
  inlineReplyCommentId: null,
  typingUsers: {},
  discussionSearch: "",
  notifications: INITIAL_NOTIFICATIONS,
  notificationsOpen: false,
  lightboxImage: null,

  openDrawer: (candidateId) => {
    set({
      drawerOpen: true,
      activeCandidateId: candidateId,
      view: "agencies",
      activeAgencyId: null,
      activeThreadId: null,
      inlineReplyCommentId: null,
      discussionSearch: "",
    });
  },

  closeDrawer: () => {
    set({
      drawerOpen: false,
      view: "agencies",
      activeAgencyId: null,
      activeThreadId: null,
      inlineReplyCommentId: null,
    });
  },

  goBack: () => {
    const { view } = get();
    if (view === "thread") {
      set({ view: "discussion", activeThreadId: null, inlineReplyCommentId: null });
    } else if (view === "discussion") {
      set({ view: "agencies", activeAgencyId: null, inlineReplyCommentId: null, discussionSearch: "" });
    }
  },

  openAgencyDiscussion: (agencyId) => {
    const { activeCandidateId } = get();
    if (!activeCandidateId) return;
    const k = key(activeCandidateId, agencyId);
    set((s) => ({
      view: "discussion",
      activeAgencyId: agencyId,
      discussionSearch: "",
      discussions: s.discussions[k]
        ? {
            ...s.discussions,
            [k]: { ...s.discussions[k], unreadCount: 0 },
          }
        : s.discussions,
    }));
  },

  openThread: (commentId) => {
    set({ view: "thread", activeThreadId: commentId, inlineReplyCommentId: null });
  },

  setInlineReply: (commentId) => set({ inlineReplyCommentId: commentId }),
  setDiscussionSearch: (q) => set({ discussionSearch: q }),
  toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  markNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  setLightboxImage: (img) => set({ lightboxImage: img }),

  addComment: (k, text, mentions, attachments) => {
    const id = uid("cm");
    const userId = get().currentUserId;
    const newComment: Comment = {
      id,
      authorId: userId,
      text,
      mentions,
      attachments,
      reactions: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const updated: AgencyDiscussion = {
        ...disc,
        comments: [...disc.comments, newComment],
        lastActivity: newComment.createdAt,
        lastMessagePreview: text.slice(0, 80),
      };
      return { discussions: { ...s.discussions, [k]: updated } };
    });
    return id;
  },

  addReply: (k, parentCommentId, text, mentions, attachments) => {
    const id = uid("rp");
    const userId = get().currentUserId;
    const newReply: Comment = {
      id,
      authorId: userId,
      text,
      mentions,
      attachments,
      reactions: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const comments = disc.comments.map((c) =>
        c.id === parentCommentId
          ? { ...c, replies: [...c.replies, newReply] }
          : c
      );
      const updated: AgencyDiscussion = {
        ...disc,
        comments,
        lastActivity: newReply.createdAt,
        lastMessagePreview: text.slice(0, 80),
      };
      return { discussions: { ...s.discussions, [k]: updated } };
    });
    return id;
  },

  editComment: (k, commentId, text, mentions) => {
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const comments = disc.comments.map((c) => {
        if (c.id === commentId) {
          return { ...c, text, mentions, editedAt: new Date().toISOString() };
        }
        const replies = c.replies.map((r) =>
          r.id === commentId
            ? { ...r, text, mentions, editedAt: new Date().toISOString() }
            : r
        );
        return { ...c, replies };
      });
      return {
        discussions: { ...s.discussions, [k]: { ...disc, comments } },
      };
    });
  },

  deleteComment: (k, commentId) => {
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const asTop = disc.comments.filter((c) => c.id !== commentId);
      if (asTop.length !== disc.comments.length) {
        return {
          discussions: { ...s.discussions, [k]: { ...disc, comments: asTop } },
        };
      }
      const comments = disc.comments.map((c) => ({
        ...c,
        replies: c.replies.filter((r) => r.id !== commentId),
      }));
      return { discussions: { ...s.discussions, [k]: { ...disc, comments } } };
    });
  },

  toggleReaction: (k, commentId, emoji, isReply, parentId) => {
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const me = s.currentUserId;
      const toggle = (c: Comment): Comment => {
        if (c.id !== commentId) return c;
        const existing = c.reactions.find((r) => r.emoji === emoji);
        let reactions: typeof c.reactions;
        if (existing) {
          const has = existing.userIds.includes(me);
          reactions = has
            ? c.reactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, userIds: r.userIds.filter((u) => u !== me) }
                    : r
                )
                .filter((r) => r.userIds.length > 0)
            : c.reactions.map((r) =>
                r.emoji === emoji ? { ...r, userIds: [...r.userIds, me] } : r
              );
        } else {
          reactions = [...c.reactions, { emoji, userIds: [me] }];
        }
        return { ...c, reactions };
      };
      const comments = disc.comments.map((c) => {
        if (isReply && parentId === c.id) {
          return { ...c, replies: c.replies.map(toggle) };
        }
        return toggle(c);
      });
      return { discussions: { ...s.discussions, [k]: { ...disc, comments } } };
    });
  },

  pingComment: (k, commentId, isReply, parentId) => {
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      const mark = (c: Comment): Comment =>
        c.id === commentId ? { ...c, pinged: true } : c;
      const comments = disc.comments.map((c) => {
        if (isReply && parentId === c.id) {
          return { ...c, replies: c.replies.map(mark) };
        }
        return mark(c);
      });
      return { discussions: { ...s.discussions, [k]: { ...disc, comments } } };
    });
    const state = get();
    const disc = state.discussions[k];
    if (disc) {
      const agencyName = state.agencyMap[disc.agencyId]?.name ?? "discussion";
      const candidateName = state.candidateMap[disc.candidateId]?.name ?? "";
      state.pushNotification({
        type: "ping",
        text: `You pinged a comment in ${agencyName} for ${candidateName}.`,
        candidateId: disc.candidateId,
        agencyId: disc.agencyId,
        commentId,
      });
    }
  },

  markDiscussionRead: (k) =>
    set((s) => {
      const disc = s.discussions[k];
      if (!disc) return s;
      return {
        discussions: {
          ...s.discussions,
          [k]: { ...disc, unreadCount: 0 },
        },
      };
    }),

  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: uid("n"),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...s.notifications,
      ],
    })),

  setTyping: (k, userIds) =>
    set((s) => ({ typingUsers: { ...s.typingUsers, [k]: userIds } })),
}));

// Selector helper
export function useDiscussionKey(): string | null {
  const candidateId = useCommentsStore((s) => s.activeCandidateId);
  const agencyId = useCommentsStore((s) => s.activeAgencyId);
  if (!candidateId || !agencyId) return null;
  return key(candidateId, agencyId);
}

export { key as discussionKey };
