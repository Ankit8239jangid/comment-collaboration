"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image as ImageIcon, X, Download, Eye } from "lucide-react";
import { useCommentsStore } from "@/store/comments-store";
import type { Attachment } from "@/lib/types";
import { cn, formatFileSize } from "@/lib/utils";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  removable?: boolean;
  compact?: boolean;
  className?: string;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  return FileText;
}

export function AttachmentPreview({
  attachments,
  onRemove,
  removable = false,
  compact = false,
  className,
}: AttachmentPreviewProps) {
  const setLightboxImage = useCommentsStore((s) => s.setLightboxImage);

  if (attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <AnimatePresence initial={false}>
        {attachments.map((a) => {
          const Icon = fileIcon(a.mimeType);
          if (a.kind === "image" && !compact) {
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted"
              >
                <button
                  type="button"
                  onClick={() => setLightboxImage({ url: a.url, name: a.name })}
                  className="block"
                >
                  <img
                    src={a.url}
                    alt={a.name}
                    className="h-28 w-28 cursor-zoom-in object-cover transition group-hover:brightness-90"
                    loading="lazy"
                  />
                </button>
                {removable && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(a.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] text-white">
                  <span className="truncate">{a.name}</span>
                  {a.size && <span className="ml-1 opacity-80">{a.size}</span>}
                </div>
              </motion.div>
            );
          }
          // Document or compact image -> card
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2",
                compact ? "min-w-[180px]" : "min-w-[200px]"
              )}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-foreground">
                  {a.name}
                </div>
                {a.size && (
                  <div className="text-[10px] text-muted-foreground">{a.size}</div>
                )}
              </div>
              {!removable && (
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    title="Preview"
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => {
                      if (a.kind === "image")
                        setLightboxImage({ url: a.url, name: a.name });
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={a.url}
                    download={a.name}
                    title="Download"
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              {removable && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(a.id)}
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
