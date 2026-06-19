"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CornerDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Link2,
  Bell,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { CommentContent } from "./CommentContent";
import { AttachmentPreview } from "./AttachmentPreview";
import { ReactionsBar } from "./ReactionsBar";
import { MessageComposer } from "./MessageComposer";
import { EmojiPicker } from "./EmojiPicker";
import { useCommentsStore } from "@/store/comments-store";
import type { Comment } from "@/lib/types";
import {
  cn,
  formatTime,
  formatRelativeTime,
} from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CommentCardProps {
  comment: Comment;
  discussionKey: string;
  /** Render as a reply (smaller avatar, indented) */
  asReply?: boolean;
  parentId?: string;
  /** Hide the avatar + name row (used for grouped consecutive messages) */
  grouped?: boolean;
  /** Force-show hover actions (touch devices) */
  forceActions?: boolean;
  /** Show thread summary footer (only for top-level comments in discussion view) */
  showThreadFooter?: boolean;
}

export function CommentCard({
  comment,
  discussionKey,
  asReply = false,
  parentId,
  grouped = false,
  showThreadFooter = false,
}: CommentCardProps) {
  const userMap = useCommentsStore((s) => s.userMap);
  const currentUserId = useCommentsStore((s) => s.currentUserId);
  const inlineReplyCommentId = useCommentsStore((s) => s.inlineReplyCommentId);
  const setInlineReply = useCommentsStore((s) => s.setInlineReply);
  const openThread = useCommentsStore((s) => s.openThread);
  const view = useCommentsStore((s) => s.view);
  const editComment = useCommentsStore((s) => s.editComment);
  const deleteComment = useCommentsStore((s) => s.deleteComment);
  const pingComment = useCommentsStore((s) => s.pingComment);
  const { toast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [editMentions, setEditMentions] = useState<string[]>(comment.mentions);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const author = userMap[comment.authorId];
  const isMine = comment.authorId === currentUserId;
  const showInlineReply = inlineReplyCommentId === comment.id;
  const isHighlighted = comment.pinged;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?comment=${comment.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setMenuOpen(false);
    toast({ title: "Link copied", description: "Comment link copied to clipboard." });
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePing = () => {
    pingComment(discussionKey, comment.id, asReply, parentId);
    setMenuOpen(false);
    toast({
      title: "Comment pinged",
      description: "Participants have been notified about this comment.",
    });
  };

  const handleDelete = () => {
    deleteComment(discussionKey, comment.id);
    setMenuOpen(false);
    toast({
      title: "Comment deleted",
      description: "The comment has been removed.",
    });
  };

  const handleSaveEdit = () => {
    const validMentions = editMentions.filter((id) => {
      const u = userMap[id];
      return u && editText.includes(`@${u.name}`);
    });
    editComment(discussionKey, comment.id, editText.trim(), validMentions);
    setIsEditing(false);
    toast({ title: "Comment updated" });
  };

  if (!author) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex gap-3 rounded-xl px-2 py-2 transition",
        isHighlighted && "bg-orange-50/60 ring-1 ring-orange-200",
        !isHighlighted && "hover:bg-muted/50",
        grouped && "py-0.5"
      )}
    >
      {/* Avatar (hidden when grouped) */}
      {!grouped && (
        <div className="shrink-0">
          <Avatar name={author.name} color={author.color} size={asReply ? "sm" : "md"} />
        </div>
      )}
      {grouped && <div className="w-10 shrink-0" aria-hidden />}

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        {!grouped && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-foreground">
              {author.name}
            </span>
            <RoleBadge role={author.role} />
            <span className="text-xs text-muted-foreground" title={new Date(comment.createdAt).toLocaleString()}>
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.editedAt && (
              <span className="text-[10px] text-muted-foreground">(edited)</span>
            )}
            {comment.pinged && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                <Bell className="h-2.5 w-2.5" />
                Pinged
              </span>
            )}
          </div>
        )}

        {/* Editing or display */}
        {isEditing ? (
          <div className="mt-1 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="scrollbar-thin w-full resize-none rounded-lg border border-primary/40 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              rows={3}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-3 w-3" /> Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.text);
                  setEditMentions(comment.mentions);
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-0.5">
            <CommentContent text={comment.text} mentions={comment.mentions} />
          </div>
        )}

        {/* Attachments */}
        {comment.attachments.length > 0 && (
          <div className="mt-2">
            <AttachmentPreview attachments={comment.attachments} />
          </div>
        )}

        {/* Reactions */}
        {comment.reactions.length > 0 && (
          <div className="mt-2">
            <ReactionsBar
              discussionKey={discussionKey}
              commentId={comment.id}
              reactions={comment.reactions}
              isReply={asReply}
              parentId={parentId}
            />
          </div>
        )}

        {/* Inline reply composer */}
        <AnimatePresence>
          {showInlineReply && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden"
            >
              <MessageComposer
                discussionKey={discussionKey}
                parentCommentId={parentId ?? comment.id}
                variant="inline"
                placeholder={`Reply to ${author.name.split(" ")[0]}...`}
                autoFocus
                onSent={() => setInlineReply(null)}
                onCancel={() => setInlineReply(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer actions */}
        {!grouped && (
          <div className="mt-1.5 flex items-center gap-1 text-xs">
            {/* Reply */}
            {view !== "thread" && (
              <button
                type="button"
                onClick={() => {
                  if (asReply) {
                    // Replies in discussion view open inline composer
                    setInlineReply(showInlineReply ? null : comment.id);
                  } else if (showThreadFooter) {
                    openThread(comment.id);
                  } else {
                    setInlineReply(showInlineReply ? null : comment.id);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                <CornerDownRight className="h-3 w-3" />
                Reply
              </button>
            )}

            {/* Thread footer (top-level comments in discussion view) */}
            {showThreadFooter && comment.replies.length > 0 && view !== "thread" && (
              <button
                type="button"
                onClick={() => openThread(comment.id)}
                className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 font-medium text-primary transition hover:bg-orange-100"
              >
                <MessageSquare className="h-3 w-3" />
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover actions */}
      {!isEditing && !grouped && (
        <div
          ref={menuRef}
          className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100"
        >
          <EmojiPicker
            onPick={(emoji) =>
              useCommentsStore
                .getState()
                .toggleReaction(discussionKey, comment.id, emoji, asReply, parentId)
            }
            align="end"
          >
            <button
              type="button"
              title="React"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <span className="text-sm">😀</span>
            </button>
          </EmojiPicker>

          <button
            type="button"
            title="More actions"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-xl"
              >
                <MenuItem onClick={() => { setInlineReply(showInlineReply ? null : comment.id); setMenuOpen(false); }}>
                  <CornerDownRight className="h-3.5 w-3.5" /> Reply
                </MenuItem>
                <MenuItem onClick={handlePing}>
                  <Bell className="h-3.5 w-3.5" /> Ping
                </MenuItem>
                {isMine && (
                  <MenuItem
                    onClick={() => {
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </MenuItem>
                )}
                <MenuItem onClick={handleCopyLink}>
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" /> Copy link
                    </>
                  )}
                </MenuItem>
                {isMine && (
                  <MenuItem onClick={handleDelete} danger>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </MenuItem>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-foreground hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
}
