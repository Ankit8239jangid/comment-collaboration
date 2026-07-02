"use client";

import { motion } from "framer-motion";
import { Avatar } from "./Avatar";
import { useCommentsStore } from "@/store/comments-store";

interface TypingIndicatorProps {
  userIds: string[];
}

export function TypingIndicator({ userIds }: TypingIndicatorProps) {
  const userMap = useCommentsStore((s) => s.userMap);
  if (userIds.length === 0) return null;

  const names = userIds
    .map((id) => userMap[id]?.name?.split(" ")[0])
    .filter(Boolean);
  const text =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names.length} people are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground"
    >
      <div className="flex -space-x-1.5">
        {userIds.slice(0, 3).map((id) => (
          <Avatar
            key={id}
            name={userMap[id]?.name ?? "?"}
            color={userMap[id]?.color ?? "#999"}
            size="xs"
            ring
          />
        ))}
      </div>
      <span className="font-medium">{text}</span>
      <span className="ml-0.5 inline-flex items-center gap-0.5">
        <span className="animate-typing h-1 w-1 rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
        <span className="animate-typing h-1 w-1 rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
        <span className="animate-typing h-1 w-1 rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
      </span>
    </motion.div>
  );
}
