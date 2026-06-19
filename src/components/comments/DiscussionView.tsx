"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, X, MessageSquare } from "lucide-react";
import { useCommentsStore, discussionKey } from "@/store/comments-store";
import { CommentCard } from "./CommentCard";
import { MessageComposer } from "./MessageComposer";
import { TypingIndicator } from "./TypingIndicator";
import { Input } from "@/components/ui/input";
import {
  cn,
  formatDateGroup,
  formatTime,
} from "@/lib/utils";
import type { Comment } from "@/lib/types";
import { useState } from "react";

interface GroupedItem {
  type: "date" | "unread" | "comment";
  date?: string;
  comment?: Comment;
  grouped?: boolean;
}

export function DiscussionView() {
  const candidateId = useCommentsStore((s) => s.activeCandidateId);
  const agencyId = useCommentsStore((s) => s.activeAgencyId);
  const candidateMap = useCommentsStore((s) => s.candidateMap);
  const agencyMap = useCommentsStore((s) => s.agencyMap);
  const discussions = useCommentsStore((s) => s.discussions);
  const goBack = useCommentsStore((s) => s.goBack);
  const discussionSearch = useCommentsStore((s) => s.discussionSearch);
  const setDiscussionSearch = useCommentsStore((s) => s.setDiscussionSearch);
  const [showSearch, setShowSearch] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const dKey = candidateId && agencyId ? discussionKey(candidateId, agencyId) : null;
  const discussion = dKey ? discussions[dKey] : null;
  const candidate = candidateId ? candidateMap[candidateId] : null;
  const agency = agencyId ? agencyMap[agencyId] : null;

  // Build flat list of items (date dividers, unread divider, comments)
  const items = useMemo<GroupedItem[]>(() => {
    if (!discussion) return [];
    const items: GroupedItem[] = [];
    let lastDate: string | null = null;
    let lastAuthorId: string | null = null;
    let lastTimestamp: number | null = null;
    let unreadInserted = false;

    const allComments: { c: Comment; grouped: boolean }[] = [];
    for (const c of discussion.comments) {
      // Determine if grouped with previous comment
      const ts = new Date(c.createdAt).getTime();
      const grouped =
        lastAuthorId === c.authorId &&
        lastTimestamp !== null &&
        ts - lastTimestamp < 5 * 60 * 1000; // within 5 min
      allComments.push({ c, grouped });
      lastAuthorId = c.authorId;
      lastTimestamp = ts;
    }

    // Find first unread index (we simulate: any comment authored in the last 2 hours by others)
    // Per PRD — divider above first unread message
    const firstUnreadIdx = discussion.unreadCount > 0
      ? Math.max(0, discussion.comments.length - discussion.unreadCount)
      : -1;

    for (let i = 0; i < allComments.length; i++) {
      const { c, grouped } = allComments[i];
      const dg = formatDateGroup(c.createdAt);
      if (dg !== lastDate) {
        items.push({ type: "date", date: dg });
        lastDate = dg;
        lastAuthorId = null; // reset grouping on new day
      }
      if (!unreadInserted && i === firstUnreadIdx && firstUnreadIdx > 0) {
        items.push({ type: "unread" });
        unreadInserted = true;
        lastAuthorId = null;
      }
      items.push({ type: "comment", comment: c, grouped });
    }
    return items;
  }, [discussion]);

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!discussionSearch.trim()) return items;
    const q = discussionSearch.toLowerCase();
    return items.filter((it) => {
      if (it.type === "comment" && it.comment) {
        const c = it.comment;
        const author = useCommentsStore.getState().userMap[c.authorId];
        return (
          c.text.toLowerCase().includes(q) ||
          c.mentions.some((mId) =>
            useCommentsStore.getState().userMap[mId]?.name.toLowerCase().includes(q)
          ) ||
          author?.name.toLowerCase().includes(q) ||
          c.attachments.some((a) => a.name.toLowerCase().includes(q))
        );
      }
      return true; // keep date dividers
    });
  }, [items, discussionSearch]);

  // Scroll to bottom when new comments added (only if user is already near bottom)
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [discussion?.comments.length]);

  if (!discussion || !candidate || !agency || !dKey) return null;

  const totalReplies = discussion.comments.reduce(
    (sum, c) => sum + c.replies.length,
    0
  );
  const totalComments = discussion.comments.length + totalReplies;

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={goBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${agency.gradient} text-xs font-bold text-white`}
              >
                {agency.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {agency.name}
                </h2>
                <p className="truncate text-[11px] text-muted-foreground">
                  {totalComments} comments • {agency.participantIds.length} participants
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
              showSearch
                ? "bg-orange-100 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative mt-2 overflow-hidden"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={discussionSearch}
              onChange={(e) => setDiscussionSearch(e.target.value)}
              placeholder="Search comments..."
              className="h-8 border-border bg-muted/40 pl-9 pr-9 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setDiscussionSearch("");
                setShowSearch(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Comment feed */}
      <div ref={feedRef} className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No comments yet
            </h3>
            <p className="max-w-xs text-xs text-muted-foreground">
              Start the conversation by writing the first comment below.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredItems.map((it, idx) => {
              if (it.type === "date" && it.date) {
                return (
                  <div
                    key={`d-${idx}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {it.date}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                );
              }
              if (it.type === "unread") {
                return (
                  <div key={`u-${idx}`} className="flex items-center gap-3 py-3">
                    <div className="h-px flex-1 bg-primary/40" />
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      New messages
                    </span>
                    <div className="h-px flex-1 bg-primary/40" />
                  </div>
                );
              }
              if (it.type === "comment" && it.comment) {
                return (
                  <CommentCard
                    key={it.comment.id}
                    comment={it.comment}
                    discussionKey={dKey}
                    grouped={it.grouped}
                    showThreadFooter
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Typing indicator */}
        <TypingIndicator userIds={["u_sarah"]} />
      </div>

      {/* Sticky composer */}
      <MessageComposer
        discussionKey={dKey}
        placeholder={`Reply to ${agency.name}...`}
      />
    </div>
  );
}
