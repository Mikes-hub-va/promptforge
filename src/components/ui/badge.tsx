import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "accent" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-medium",
        variant === "default" && "bg-slate-900 text-white",
        variant === "accent" && "bg-emerald-100 text-emerald-800",
        variant === "outline" && "border border-slate-200 text-slate-700",
        className,
      )}
      {...props}
    />
  );
}
