import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-lg border border-slate-300 bg-white/80 text-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition-all",
            props.checked
              ? "border-sky-500 bg-[linear-gradient(135deg,#0f6fff_0%,#14b8a6_100%)] text-white shadow-[0_10px_20px_-14px_rgba(15,111,255,0.8)]"
              : "hover:border-slate-400",
            className,
          )}
        >
          <input ref={ref} type="checkbox" className="sr-only" {...props} />
          {props.checked ? <Check className="size-3" /> : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
