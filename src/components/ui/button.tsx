import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-orange-400/30 bg-[linear-gradient(135deg,#ff6b35_0%,#ff8a48_55%,#ffb84d_100%)] text-white shadow-[0_14px_34px_-18px_rgba(249,115,22,0.46)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(249,115,22,0.54)]",
        secondary:
          "bg-white/85 text-slate-900 ring-1 ring-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm hover:bg-white hover:ring-orange-100",
        outline:
          "border border-slate-200/80 bg-white/72 text-slate-800 backdrop-blur-sm hover:border-orange-200 hover:bg-white hover:text-slate-950",
        ghost: "text-slate-700 hover:bg-orange-50/80 hover:text-slate-950",
        destructive: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
