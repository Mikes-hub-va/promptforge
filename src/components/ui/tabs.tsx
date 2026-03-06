"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface TabsProps {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function Tabs({ items, activeId, onSelect }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            item.id === activeId
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-white/60",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
