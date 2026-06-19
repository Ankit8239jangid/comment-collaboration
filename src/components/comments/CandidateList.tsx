"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Clock,
  MessageSquare,
  Search,
  Sun,
  Moon,
  Monitor,
  Users,
} from "lucide-react";
import { useCommentsStore } from "@/store/comments-store";
import { CANDIDATE_STATUS_STYLES } from "@/lib/types";
import { Avatar } from "./Avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { NotificationPanel } from "./NotificationPanel";

export function CandidateList() {
  const candidates = useCommentsStore((s) => s.candidates);
  const openDrawer = useCommentsStore((s) => s.openDrawer);
  const notificationsOpen = useCommentsStore((s) => s.toggleNotifications);
  const notifications = useCommentsStore((s) => s.notifications);
  const theme = useCommentsStore((s) => s.theme);
  const setTheme = useCommentsStore((s) => s.setTheme);
  const [query, setQuery] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (!query.trim()) return candidates;
    const q = query.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.agency.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  return (
    <div className="app-bg min-h-screen">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-sm">
              SH
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">SeekHelpers</h1>
              <p className="text-[10px] text-muted-foreground">BackOffice</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {["Candidates", "Pipelines", "Reports", "Settings"].map((item, idx) => (
              <button
                key={item}
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  idx === 0
                    ? "bg-orange-50 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme switcher — segmented control */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Light theme"
                className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                  theme === "light"
                    ? "bg-background text-amber-600 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("gray")}
                title="Gray theme (default — easier on the eyes)"
                className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                  theme === "gray"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-primary/40"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Dark theme"
                className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
                  theme === "dark"
                    ? "bg-background text-slate-300 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={notificationsOpen}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel />
            </div>
            <Avatar name="John Recruiter" color="#F76711" size="sm" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Candidates
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click <span className="font-medium text-primary">Comments</span> on any candidate row to open the collaboration drawer.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {candidates.length} total
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {candidates.filter((c) => c.status === "Active").length} active
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates by name, position, or ID..."
            className="h-10 border-border bg-background pl-10"
          />
        </div>

        {/* Candidate list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          {/* Header row */}
          <div className="hidden border-b border-border bg-muted/30 px-4 py-2.5 md:grid md:grid-cols-[2fr_1fr_1.2fr_0.8fr_0.6fr] md:items-center md:gap-3 md:px-5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Candidate
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Agency
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Last Activity
            </span>
            <span className="text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Comments
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <h3 className="text-sm font-semibold text-foreground">
                  No candidates found
                </h3>
                <p className="text-xs text-muted-foreground">
                  Try a different search term.
                </p>
              </div>
            ) : (
              filtered.map((c, idx) => (
                <motion.button
                  key={c.id}
                  type="button"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  whileHover={{ backgroundColor: "rgb(255 243 234 / 0.4)" }}
                  onClick={() => openDrawer(c.id)}
                  className="grid w-full grid-cols-1 items-center gap-3 px-5 py-3 text-left transition md:grid-cols-[2fr_1fr_1.2fr_0.8fr_0.6fr]"
                >
                  {/* Candidate */}
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} color={c.color} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {c.name}
                        </span>
                        <span className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                          {c.id.toUpperCase()}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.position}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${CANDIDATE_STATUS_STYLES[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Agency */}
                  <div className="hidden md:block">
                    <span className="truncate text-xs text-foreground">{c.agency}</span>
                  </div>

                  {/* Last activity */}
                  <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(c.lastActivity)}
                  </div>

                  {/* Comments button */}
                  <div className="flex items-center justify-end">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-orange-100">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {c.totalComments}
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
