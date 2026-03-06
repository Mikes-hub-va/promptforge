import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <span
          className={cn(
            "inline-flex h-4.5 w-4.5 items-center justify-center rounded-md border border-slate-300",
            props.checked ? "border-emerald-500 bg-emerald-500 text-white" : "bg-white",
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
