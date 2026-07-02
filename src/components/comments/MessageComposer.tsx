"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign,
  Image as ImageIcon,
  Paperclip,
  Send,
  Smile,
  X,
  Bell,
} from "lucide-react";
import { useCommentsStore } from "@/store/comments-store";
import { MentionDropdown } from "./MentionDropdown";
import { EmojiPicker } from "./EmojiPicker";
import { AttachmentPreview } from "./AttachmentPreview";
import { Avatar } from "./Avatar";
import type { Attachment, User } from "@/lib/types";
import {
  cn,
  formatFileSize,
  getActiveMentionQuery,
  uid,
} from "@/lib/utils";

interface MessageComposerProps {
  discussionKey: string;
  /** When replying in a thread, pass the parent comment id */
  parentCommentId?: string | null;
  placeholder?: string;
  variant?: "sticky" | "inline";
  onSent?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function MessageComposer({
  discussionKey,
  parentCommentId,
  placeholder = "Write a comment...",
  variant = "sticky",
  onSent,
  onCancel,
  autoFocus = false,
}: MessageComposerProps) {
  const currentUser = useCommentsStore((s) => s.userMap[s.currentUserId]);
  const addComment = useCommentsStore((s) => s.addComment);
  const addReply = useCommentsStore((s) => s.addReply);
  const pushNotification = useCommentsStore((s) => s.pushNotification);
  const userMap = useCommentsStore((s) => s.userMap);

  const [text, setText] = useState("");
  const [mentions, setMentions] = useState<string[]>([]); // user ids
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [mentionQuery, setMentionQuery] = useState<{
    query: string;
    start: number;
  } | null>(null);
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [ping, setPing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileImageRef = useRef<HTMLInputElement>(null);
  const fileDocRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isInline = variant === "inline";

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Check for active mention query — reads live textarea state
  const updateMention = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const liveText = el.value;
    const caret = el.selectionStart ?? liveText.length;
    const result = getActiveMentionQuery(liveText, caret);
    if (result) {
      const rect = el.getBoundingClientRect();
      // Render BELOW the textarea (was previously above, which broke layout)
      setMentionPos({
        top: rect.bottom + 6,
        left: rect.left + Math.min(40, rect.width / 4),
      });
      setMentionQuery(result);
    } else {
      setMentionQuery(null);
    }
  }, []);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Compute mention query synchronously — caret is already updated by the time onChange fires
    const liveText = e.target.value;
    const caret = e.target.selectionStart ?? liveText.length;
    const result = getActiveMentionQuery(liveText, caret);
    if (result) {
      const rect = e.target.getBoundingClientRect();
      // Render BELOW the textarea
      setMentionPos({
        top: rect.bottom + 6,
        left: rect.left + Math.min(40, rect.width / 4),
      });
      setMentionQuery(result);
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (user: User) => {
    // Recompute the active mention from the LIVE textarea state to avoid race conditions
    const el = textareaRef.current;
    const liveText = el?.value ?? text;
    const caret = el?.selectionStart ?? liveText.length;
    const result = getActiveMentionQuery(liveText, caret);
    if (!result) {
      setMentionQuery(null);
      return;
    }
    const before = liveText.slice(0, result.start);
    const after = liveText.slice(result.start + 1 + result.query.length);
    const insert = `@${user.name} `;
    const newText = `${before}${insert}${after}`;
    setText(newText);
    setMentions((prev) => (prev.includes(user.id) ? prev : [...prev, user.id]));
    setMentionQuery(null);
    // Refocus and place caret after the inserted mention
    requestAnimationFrame(() => {
      const el2 = textareaRef.current;
      if (!el2) return;
      const pos = (before + insert).length;
      el2.focus();
      el2.setSelectionRange(pos, pos);
    });
  };

  const handleFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isAllowedImage = ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
      file.type
    );
    const isAllowedDoc = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
    ].includes(file.type);
    if (isImage && !isAllowedImage) return;
    if (!isImage && !isAllowedDoc) return;
    if (file.size > 10 * 1024 * 1024) return;

    const url = URL.createObjectURL(file);
    const att: Attachment = {
      id: uid("att"),
      kind: isImage ? "image" : "document",
      name: file.name,
      url,
      size: formatFileSize(file.size),
      mimeType: file.type,
    };
    setAttachments((prev) => [...prev, att]);
  };

  // Keep latest handleFile in a ref so listeners added once can call it
  const handleFileRef = useRef(handleFile);
  useEffect(() => {
    handleFileRef.current = handleFile;
  });

  // Paste image
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.kind === "file") {
          const file = it.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileRef.current(file);
          }
        }
      }
    };
    el.addEventListener("paste", onPaste);
    return () => el.removeEventListener("paste", onPaste);
  }, []);

  // Drag and drop
  useEffect(() => {
    const zone = dropZoneRef.current;
    if (!zone) return;
    const onOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };
    const onLeave = () => setIsDragging(false);
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer?.files;
      if (!files) return;
      Array.from(files).forEach((f) => handleFileRef.current(f));
    };
    zone.addEventListener("dragover", onOver);
    zone.addEventListener("dragleave", onLeave);
    zone.addEventListener("drop", onDrop);
    return () => {
      zone.removeEventListener("dragover", onOver);
      zone.removeEventListener("dragleave", onLeave);
      zone.removeEventListener("drop", onDrop);
    };
  }, []);

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? text.length;
    const newText = text.slice(0, pos) + emoji + text.slice(pos);
    setText(newText);
    requestAnimationFrame(() => {
      el.focus();
      const p = pos + emoji.length;
      el.setSelectionRange(p, p);
    });
  };

  const canSend = text.trim().length > 0 || attachments.length > 0;

  const handleSend = () => {
    if (!canSend) return;
    // Clean mentions: only keep those whose name appears in the text
    const validMentions = mentions.filter((id) => {
      const u = userMap[id];
      return u && text.includes(`@${u.name}`);
    });

    if (parentCommentId) {
      addReply(discussionKey, parentCommentId, text.trim(), validMentions, attachments);
    } else {
      addComment(discussionKey, text.trim(), validMentions, attachments);
    }

    if (ping && validMentions.length > 0) {
      validMentions.forEach((id) => {
        const u = userMap[id];
        if (u) {
          pushNotification({
            type: "ping",
            text: `You pinged ${u.name} in a comment.`,
          });
        }
      });
    }

    setText("");
    setMentions([]);
    setAttachments([]);
    setPing(false);
    setMentionQuery(null);
    onSent?.();
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el && !isInline) el.focus();
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery) return; // MentionDropdown handles Enter / arrows
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Escape" && isInline) {
      onCancel?.();
    }
  };

  const insertAt = () => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? text.length;
    const newText = text.slice(0, pos) + "@" + text.slice(pos);
    setText(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos + 1, pos + 1);
      updateMention();
    });
  };

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        "relative",
        isInline ? "rounded-xl border border-primary/30 bg-orange-50/30 p-2" : "border-t border-border bg-background p-3"
      )}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-orange-50/90"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Paperclip className="h-4 w-4" />
              Drop files to attach
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mention dropdown */}
      {mentionQuery && (
        <MentionDropdown
          query={mentionQuery.query}
          top={mentionPos.top}
          left={mentionPos.left}
          onSelect={handleSelectMention}
          onClose={() => setMentionQuery(null)}
        />
      )}

      {/* Attachment preview area (before send) */}
      {attachments.length > 0 && (
        <div className="mb-2 rounded-xl border border-border bg-muted/30 p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {attachments.length} file{attachments.length > 1 ? "s" : ""} attached
            </span>
            <button
              type="button"
              onClick={() => setAttachments([])}
              className="text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <AttachmentPreview
            attachments={attachments}
            removable
            onRemove={removeAttachment}
          />
        </div>
      )}

      {/* Composer row */}
      <div className="flex items-end gap-2">
        {!isInline && (
          <Avatar name={currentUser.name} color={currentUser.color} size="sm" />
        )}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onKeyUp={updateMention}
            onClick={updateMention}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "scrollbar-thin w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30",
              isInline
                ? "border-border focus-visible:border-primary/40"
                : "border-border focus-visible:border-primary/40"
            )}
          />
        </div>
      </div>

      {/* Action bar */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <ComposerButton
            onClick={insertAt}
            title="Mention someone"
            active={!!mentionQuery}
          >
            <AtSign className="h-4 w-4" />
          </ComposerButton>
          <ComposerButton
            onClick={() => fileImageRef.current?.click()}
            title="Upload image"
          >
            <ImageIcon className="h-4 w-4" />
          </ComposerButton>
          <ComposerButton
            onClick={() => fileDocRef.current?.click()}
            title="Upload document"
          >
            <Paperclip className="h-4 w-4" />
          </ComposerButton>
          <EmojiPicker onPick={insertEmoji} align="start">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Insert emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
          </EmojiPicker>
          <ComposerButton
            onClick={() => setPing((p) => !p)}
            title="Ping mentioned users"
            active={ping}
          >
            <Bell className="h-4 w-4" />
          </ComposerButton>
        </div>

        <div className="flex items-center gap-2">
          {isInline && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition",
              canSend
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            Send
          </button>
        </div>
      </div>

      <input
        ref={fileImageRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          Array.from(files).forEach(handleFile);
          e.target.value = "";
        }}
      />
      <input
        ref={fileDocRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.txt,.zip"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files) return;
          Array.from(files).forEach(handleFile);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ComposerButton({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition",
        active
          ? "bg-orange-100 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
