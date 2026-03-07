import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-xl border border-slate-200/80 bg-white/78 px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none backdrop-blur-sm transition-all hover:border-slate-300 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-100/90",
            error && "border-rose-400 ring-1 ring-rose-400",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-slate-500" />
      </div>
    );
  },
);
Select.displayName = "Select";
