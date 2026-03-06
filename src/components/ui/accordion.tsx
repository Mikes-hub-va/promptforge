"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Item {
  question: string;
  answer: React.ReactNode;
}

export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="divide-y rounded-2xl border border-slate-200 bg-white">
      {items.map((item, index) => {
        const isOpen = open === index;

        return (
          <button
            key={item.question}
            type="button"
            className="group block w-full"
            onClick={() => setOpen(isOpen ? null : index)}
            aria-expanded={isOpen}
          >
            <div className="flex items-start justify-between px-5 py-4 text-left">
              <h3 className="text-sm font-semibold text-slate-900">{item.question}</h3>
              <ChevronDown
                className={cn(
                  "mt-0.5 size-4 shrink-0 text-slate-500 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </div>
            <div
              className={cn(
                "overflow-hidden px-5 text-sm leading-6 text-slate-600 transition-all duration-200",
                isOpen ? "max-h-40 pb-4" : "max-h-0",
              )}
            >
              {item.answer}
            </div>
          </button>
        );
      })}
    </div>
  );
}
