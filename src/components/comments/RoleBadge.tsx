"use client";

import { ROLE_BADGE_STYLES, type Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        ROLE_BADGE_STYLES[role],
        className
      )}
    >
      {role === "Agency Representative" ? "Agency" : role}
    </span>
  );
}
