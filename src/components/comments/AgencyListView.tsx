"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { useCommentsStore, discussionKey } from "@/store/comments-store";
import { getDiscussionsForCandidate } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";


function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
}
