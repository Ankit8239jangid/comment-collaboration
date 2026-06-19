"use client";

import { useEffect } from "react";
import { useCommentsStore } from "@/store/comments-store";

/**
 * Syncs the theme from the store to the <html data-theme="..."> attribute.
 * Rendered once at the root layout. The initial server-render uses
 * `data-theme="gray"` set directly on <html> in layout.tsx so first paint
 * matches the store default.
 */
export function ThemeBootstrap() {
  const theme = useCommentsStore((s) => s.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
