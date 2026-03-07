import { cn } from "@/lib/utils/cn";

type PromptifyMarkProps = {
  className?: string;
  labelClassName?: string;
  withLabel?: boolean;
};

export function PromptifyMark({
  className,
  labelClassName,
  withLabel = true,
}: PromptifyMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] border border-orange-200/80 bg-[linear-gradient(140deg,rgba(255,107,53,0.18),rgba(255,164,93,0.22),rgba(14,165,233,0.15))] shadow-[0_14px_30px_-18px_rgba(249,115,22,0.45)]">
        <span className="absolute inset-[6px] rounded-[10px] border border-white/70 bg-white/88" />
        <span className="relative flex items-center gap-1">
          <span className="h-4.5 w-1.5 rounded-full bg-[linear-gradient(180deg,#ff6b35,#fb923c)]" />
          <span className="h-3 w-3 rounded-full bg-[radial-gradient(circle_at_30%_30%,#0ea5e9,#1d4ed8)] shadow-[0_0_0_2px_rgba(255,255,255,0.9)]" />
        </span>
      </span>
      {withLabel ? (
        <span className={cn("text-lg font-semibold tracking-tight text-slate-950", labelClassName)}>
          Promptify
        </span>
      ) : null}
    </span>
  );
}
