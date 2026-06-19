"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EMOJI_CATEGORIES, QUICK_EMOJIS } from "@/lib/dummy-data";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function EmojiPicker({ onPick, children, align = "center" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        side="top"
        className="w-72 p-0"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.18 }}
        >
          {/* Quick reactions row */}
          <div className="border-b border-border p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Quick reactions
            </div>
            <div className="flex flex-wrap gap-1">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    onPick(e);
                    setOpen(false);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-lg transition hover:scale-125 hover:bg-accent"
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {EMOJI_CATEGORIES.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => setCategory(idx)}
                className={cn(
                  "flex-1 px-2 py-1.5 text-xs font-medium transition",
                  category === idx
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                type="button"
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="scrollbar-thin max-h-48 overflow-y-auto p-2">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[category].emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    onPick(e);
                    setOpen(false);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition hover:scale-125 hover:bg-accent"
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
