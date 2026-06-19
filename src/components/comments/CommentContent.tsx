"use client";

import { Fragment } from "react";
import { useCommentsStore } from "@/store/comments-store";
import { cn } from "@/lib/utils";

interface CommentContentProps {
  text: string;
  mentions: string[];
  className?: string;
}

/**
 * Renders comment text with @Name mention pills.
 * Mentions are detected by matching user names found in the `mentions` array.
 */
export function CommentContent({ text, mentions, className }: CommentContentProps) {
  const userMap = useCommentsStore((s) => s.userMap);
  const currentUserId = useCommentsStore((s) => s.currentUserId);

  // Build a list of mention display names that should be highlighted
  const mentionNames = mentions
    .map((id) => userMap[id]?.name)
    .filter(Boolean) as string[];

  if (mentionNames.length === 0) {
    return <p className={cn("text-sm leading-6 text-foreground", className)}>{text}</p>;
  }

  // Build a regex that matches any @Name
  // Sort by length desc so longer names match first
  const sorted = [...mentionNames].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`@(${escaped.join("|")})\\b`, "g");

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<Fragment key={`t-${i}`}>{text.slice(lastIdx, m.index)}</Fragment>);
    }
    const matchedName = m[1];
    const userId = Object.values(userMap).find((u) => u.name === matchedName)?.id;
    const isMe = userId === currentUserId;
    parts.push(
      <span
        key={`m-${i}`}
        className={cn("mention-pill", isMe && "mention-pill-current")}
      >
        @{matchedName}
      </span>
    );
    lastIdx = m.index + m[0].length;
    i++;
  }
  if (lastIdx < text.length) {
    parts.push(<Fragment key={`t-end`}>{text.slice(lastIdx)}</Fragment>);
  }

  return (
    <p className={cn("text-sm leading-6 text-foreground", className)}>
      {parts}
    </p>
  );
}
