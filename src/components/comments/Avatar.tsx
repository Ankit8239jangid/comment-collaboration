"use client";

import { initials as toInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  color: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
};

/** A colored initials avatar. */
export function Avatar({ name, color, size = "md", className, ring }: AvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-sm",
        SIZES[size],
        ring && "ring-2 ring-white",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      }}
      title={name}
    >
      {toInitials(name)}
    </div>
  );
}
