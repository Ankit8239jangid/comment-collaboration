"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Bell } from "lucide-react";
import { useCommentsStore, discussionKey } from "@/store/comments-store";
import { CommentCard } from "./CommentCard";
import { MessageComposer } from "./MessageComposer";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { CommentContent } from "./CommentContent";
import { AttachmentPreview } from "./AttachmentPreview";
import { ReactionsBar } from "./ReactionsBar";
import { formatDateGroup, formatRelativeTime } from "@/lib/utils";

export function ThreadView() {
  const candidateId = useCommentsStore((s) => s.activeCandidateId);
  const agencyId = useCommentsStore((s) => s.activeAgencyId);
  const activeThreadId = useCommentsStore((s) => s.activeThreadId);
  const discussions = useCommentsStore((s) => s.discussions);
  const userMap = useCommentsStore((s) => s.userMap);
  const goBack = useCommentsStore((s) => s.goBack);
  const repliesRef = useRef<HTMLDivElement>(null);

  const dKey = candidateId && agencyId ? discussionKey(candidateId, agencyId) : null;
  const discussion = dKey ? discussions[dKey] : null;
  const parent = useMemo(
    () => discussion?.comments.find((c) => c.id === activeThreadId) ?? null,
    [discussion, activeThreadId]
  );

  useEffect(() => {
    const el = repliesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [parent?.replies.length]);

  if (!discussion || !parent || !dKey) return null;

  const author = userMap[parent.authorId];
  const replies = parent.replies;

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="truncate text-sm font-semibold text-foreground">
              Thread
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky parent comment */}
      <div className="border-b border-border bg-gradient-to-b from-orange-50/40 to-transparent px-3 py-3">
        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Parent comment
        </div>
        <div className="flex gap-3">
          <Avatar name={author?.name ?? "?"} color={author?.color ?? "#999"} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-foreground">
                {author?.name}
              </span>
              <RoleBadge role={author?.role ?? "Recruiter"} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(parent.createdAt)}
              </span>
              {parent.pinged && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Bell className="h-2.5 w-2.5" />
                  Pinged
                </span>
              )}
            </div>
            <div className="mt-0.5">
              <CommentContent text={parent.text} mentions={parent.mentions} />
            </div>
            {parent.attachments.length > 0 && (
              <div className="mt-2">
                <AttachmentPreview attachments={parent.attachments} />
              </div>
            )}
            {parent.reactions.length > 0 && (
              <div className="mt-2">
                <ReactionsBar
                  discussionKey={dKey}
                  commentId={parent.id}
                  reactions={parent.reactions}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies feed — with vertical connector line */}
      <div ref={repliesRef} className="scrollbar-thin relative flex-1 overflow-y-auto px-3 py-3">
        {replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No replies yet</h3>
            <p className="max-w-xs text-xs text-muted-foreground">
              Start the discussion by writing the first reply below.
            </p>
          </div>
        ) : (
          <div className="relative ml-5">
            {/* Vertical connector line */}
            <div className="absolute left-0 top-0 bottom-6 w-0.5 bg-gradient-to-b from-primary/40 via-border to-transparent" />

            <div className="space-y-1">
              {replies.map((r, idx) => {
                const replyAuthor = userMap[r.authorId];
                const prevAuthor = idx > 0 ? userMap[replies[idx - 1].authorId] : null;
                const prevTs = idx > 0 ? new Date(replies[idx - 1].createdAt).getTime() : 0;
                const thisTs = new Date(r.createdAt).getTime();
                const grouped =
                  prevAuthor?.id === replyAuthor?.id && thisTs - prevTs < 5 * 60 * 1000;

                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="relative"
                  >
                    {/* Horizontal connector to parent line */}
                    {!grouped && (
                      <div className="absolute -left-5 top-5 h-0.5 w-5 bg-border" />
                    )}
                    <CommentCard
                      comment={r}
                      discussionKey={dKey}
                      asReply
                      parentId={parent.id}
                      grouped={grouped}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky reply composer */}
      <MessageComposer
        discussionKey={dKey}
        parentCommentId={parent.id}
        placeholder={`Reply to ${author?.name?.split(" ")[0] ?? "thread"}...`}
      />
    </div>
  );
}
