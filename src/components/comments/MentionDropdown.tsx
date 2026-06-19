"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { useCommentsStore } from "@/store/comments-store";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MentionDropdownProps {
  query: string;
  onSelect: (user: User) => void;
  onClose: () => void;
  /** Position relative to viewport (absolute) */
  top: number;
  left: number;
}

export function MentionDropdown({ query, onSelect, onClose, top, left }: MentionDropdownProps) {
  const users = useCommentsStore((s) => s.users);
  const currentUserId = useCommentsStore((s) => s.currentUserId);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState({ top, left });

  const q = query.toLowerCase().trim();
  const filtered = users.filter(
    (u) =>
      u.id !== currentUserId &&
      (q === "" ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q))
  );

  // Reset highlight when query changes — derive via state keyed on query
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    setHighlightIdx(0);
  }

  // If rendering below the textarea would overflow the viewport,
  // flip to render above instead. Re-check whenever position or filter changes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measured = el.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const overflowsBottom = measured.bottom > viewportH - 8;
    if (overflowsBottom) {
      // Flip: render above the textarea. The textarea is roughly `top - small offset` tall,
      // so we anchor to a position above the previous "below" anchor.
      // We don't know the exact textarea height here, but the parent passes `top` as the
      // textarea bottom + 6. So flipping up means anchoring to roughly `top - (textarea height + 12)`.
      // Use a heuristic: place it at `top - 280` (approx dropdown height + margin).
      setAdjustedPos({ top: Math.max(8, top - 290), left });
    } else {
      setAdjustedPos({ top, left });
    }
  }, [top, left, filtered.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[highlightIdx]) {
        e.preventDefault();
        e.stopPropagation();
        onSelect(filtered[highlightIdx]);
      } else if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [filtered, highlightIdx, onSelect, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx]);

  return (
    <AnimatePresence>
      {filtered.length > 0 && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.97 }}
          transition={{ duration: 0.15 }}
          style={{ top: adjustedPos.top, left: adjustedPos.left }}
          className="fixed z-50 w-72 rounded-xl border border-border bg-popover shadow-xl"
        >
          <div className="border-b border-border px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Mentions
          </div>
          <div ref={listRef} className="scrollbar-thin max-h-60 overflow-y-auto p-1">
            {filtered.map((u, idx) => (
              <button
                key={u.id}
                data-idx={idx}
                onClick={() => onSelect(u)}
                onMouseEnter={() => setHighlightIdx(idx)}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition",
                  idx === highlightIdx ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <Avatar name={u.name} color={u.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {u.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </div>
                </div>
                <RoleBadge role={u.role} />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
