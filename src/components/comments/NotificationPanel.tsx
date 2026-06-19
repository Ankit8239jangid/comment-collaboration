"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AtSign, MessageSquare, Reply } from "lucide-react";
import { useCommentsStore } from "@/store/comments-store";
import { formatRelativeTime } from "@/lib/utils";

const ICONS = {
  mention: AtSign,
  reply: Reply,
  "new-comment": MessageSquare,
  ping: Bell,
};

const COLORS = {
  mention: "bg-orange-100 text-primary",
  reply: "bg-blue-100 text-blue-700",
  "new-comment": "bg-emerald-100 text-emerald-700",
  ping: "bg-rose-100 text-rose-700",
};

export function NotificationPanel() {
  const open = useCommentsStore((s) => s.notificationsOpen);
  const setOpen = useCommentsStore((s) => s.setNotificationsOpen);
  const notifications = useCommentsStore((s) => s.notifications);
  const markRead = useCommentsStore((s) => s.markNotificationsRead);
  const openDrawer = useCommentsStore((s) => s.openDrawer);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markRead}
                    className="rounded-md px-2 py-1 text-[10px] font-medium text-primary hover:bg-orange-50"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="scrollbar-thin max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = ICONS[n.type];
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          if (n.candidateId && n.agencyId) {
                            openDrawer(n.candidateId);
                            setOpen(false);
                          }
                        }}
                        className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition hover:bg-accent/50"
                      >
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${COLORS[n.type]}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground">
                            {n.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
