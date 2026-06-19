"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Smile, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCommentsStore } from "@/store/comments-store";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "@/lib/utils";
import type { Reaction } from "@/lib/types";

interface ReactionsBarProps {
  discussionKey: string;
  commentId: string;
  reactions: Reaction[];
  isReply?: boolean;
  parentId?: string;
  /** If true, the bar is always visible (e.g. inside hover actions). */
  compact?: boolean;
}

export function ReactionsBar({
  discussionKey,
  commentId,
  reactions,
  isReply = false,
  parentId,
}: ReactionsBarProps) {
  const toggleReaction = useCommentsStore((s) => s.toggleReaction);
  const currentUserId = useCommentsStore((s) => s.currentUserId);
  const userMap = useCommentsStore((s) => s.userMap);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <AnimatePresence initial={false}>
        {reactions.map((r) => {
          const mine = r.userIds.includes(currentUserId);
          const names = r.userIds
            .map((id) => userMap[id]?.name)
            .filter(Boolean)
            .join(", ");
          return (
            <motion.button
              key={r.emoji}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              type="button"
              onClick={() =>
                toggleReaction(discussionKey, commentId, r.emoji, isReply, parentId)
              }
              onMouseEnter={() => setHoveredEmoji(r.emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              className={cn(
                "group relative inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition",
                mine
                  ? "border-primary/40 bg-orange-50 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-orange-50"
              )}
              title={names}
            >
              <span className="text-sm leading-none">{r.emoji}</span>
              <span className="tabular-nums">{r.userIds.length}</span>
              {hoveredEmoji === r.emoji && names && (
                <div className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] text-background shadow-lg">
                  {names}
                </div>
              )}
            </motion.button>
          );
        })}
      </AnimatePresence>

      <EmojiPicker
        onPick={(emoji) =>
          toggleReaction(discussionKey, commentId, emoji, isReply, parentId)
        }
        align="start"
      >
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition hover:border-primary/40 hover:bg-orange-50 hover:text-primary"
          title="Add reaction"
        >
          <Smile className="h-3.5 w-3.5" />
        </button>
      </EmojiPicker>
    </div>
  );
}
