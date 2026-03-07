import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-24 rounded-xl border border-slate-200/80 bg-white/78 px-3.5 py-2.5 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-100/90",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
