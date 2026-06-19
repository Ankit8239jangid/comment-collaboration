"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCommentsStore } from "@/store/comments-store";

export function ImageLightbox() {
  const image = useCommentsStore((s) => s.lightboxImage);
  const setImage = useCommentsStore((s) => s.setLightboxImage);
  const [zoom, setZoom] = useState(1);
  const [lastImage, setLastImage] = useState(image);
  if (image !== lastImage) {
    setLastImage(image);
    setZoom(1);
  }

  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setImage(null);
      }
    };
    // Use capture phase so we get the event before the drawer's handler
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [setImage, image]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          onClick={() => setImage(null)}
        >
          {/* Top bar */}
          <div
            className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-white backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="rounded-full p-2 hover:bg-white/20"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-1 text-xs tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-white/20"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <a
              href={image.url}
              download={image.name}
              className="rounded-full p-2 hover:bg-white/20"
              title="Download"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              type="button"
              className="rounded-full p-2 hover:bg-white/20"
              onClick={() => setImage(null)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <motion.div
            key={image.url}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.name}
              style={{ transform: `scale(${zoom})` }}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl transition-transform duration-200"
            />
            <div className="mt-3 text-center text-xs text-white/70">
              {image.name}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
