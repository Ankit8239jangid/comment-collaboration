"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { useCommentsStore, discussionKey } from "@/store/comments-store";
import { getDiscussionsForCandidate } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";


export function AgencyListView() {
  const candidateId = useCommentsStore((s) => s.activeCandidateId);
  const candidateMap = useCommentsStore((s) => s.candidateMap);
  const agencyMap = useCommentsStore((s) => s.agencyMap);
  const discussions = useCommentsStore((s) => s.discussions);
  const openAgencyDiscussion = useCommentsStore((s) => s.openAgencyDiscussion);
  const [query] = useState("");

  const candidate = candidateId ? candidateMap[candidateId] : null;
  const list = useMemo(() => {
    if (!candidateId) return [];
    return getDiscussionsForCandidate(candidateId).map((d) => ({
      discussion: d,
      agency: agencyMap[d.agencyId],
    }));
  }, [candidateId, discussions, agencyMap]);

  const filtered = list.filter(({ agency, discussion }) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      agency?.name.toLowerCase().includes(q) ||
      discussion.lastMessagePreview.toLowerCase().includes(q) ||
      agency?.participantIds.some((pid) =>
        useCommentsStore.getState().userMap[pid]?.name.toLowerCase().includes(q)
      )
    );
  });

  if (!candidate) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-5 pb-4 pt-5">
        <div className="flex items-start gap-3">
          <Avatar name={candidate.name} color={candidate.color} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-foreground">
              {candidate.name}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {candidate.position} • {candidate.email}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-medium text-foreground">
                {candidate.id.toUpperCase()}
              </span>
              <span className="rounded-full bg-orange-50 px-2 py-0.5 font-medium text-primary">
                {candidate.status}
              </span>
              <span className="text-muted-foreground">{candidate.location}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Discussion list */}
      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {filtered.length} discussion{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-muted-foreground/60" />}
            title="No discussions available"
            description="No agencies have commented on this candidate yet."
          />
        ) : (
          <div className="space-y-1">
            {filtered.map(({ discussion, agency }) => {
              const dKey = discussionKey(candidate.id, agency.id);
              const lastUser =
                useCommentsStore.getState().userMap[
                  discussion.comments[discussion.comments.length - 1]?.authorId
                ];
              const totalReplies = discussion.comments.reduce(
                (sum, c) => sum + c.replies.length,
                0
              );
              const totalComments = discussion.comments.length + totalReplies;
              return (
                <motion.button
                  key={dKey}
                  layout
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => openAgencyDiscussion(agency.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-border hover:bg-accent/50"
                  type="button"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${agency.gradient} text-sm font-bold text-white shadow-sm`}
                  >
                    {agency.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {agency.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(discussion.lastActivity)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {lastUser && (
                        <Avatar name={lastUser.name} color={lastUser.color} size="xs" />
                      )}
                      <p className="truncate text-xs text-muted-foreground">
                        {discussion.lastMessagePreview}
                      </p>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {totalComments} comments
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {agency.participantIds.length} participants
                      </span>
                    </div>
                  </div>
                  {discussion.unreadCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {discussion.unreadCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

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
