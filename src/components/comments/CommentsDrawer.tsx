"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCommentsStore } from "@/store/comments-store";
import { AgencyListView } from "./AgencyListView";
import { DiscussionView } from "./DiscussionView";
import { ThreadView } from "./ThreadView";
import { ImageLightbox } from "./ImageLightbox";
import { useEffect } from "react";

export function CommentsDrawer() {
  const drawerOpen = useCommentsStore((s) => s.drawerOpen);
  const closeDrawer = useCommentsStore((s) => s.closeDrawer);
  const view = useCommentsStore((s) => s.view);

  // Lock body scroll when open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-background shadow-2xl sm:w-[620px] md:w-[720px]"
            >
              {/* Drawer top-right close (always visible) */}
              <button
                type="button"
                onClick={closeDrawer}
                className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* View router */}
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {view === "agencies" && (
                    <motion.div
                      key="agencies"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="absolute inset-0"
                    >
                      <AgencyListView />
                    </motion.div>
                  )}
                  {view === "discussion" && (
                    <motion.div
                      key="discussion"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <DiscussionView />
                    </motion.div>
                  )}
                  {view === "thread" && (
                    <motion.div
                      key="thread"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <ThreadView />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImageLightbox />
    </>
  );
}
