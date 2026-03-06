"use client";

import Link from "next/link";
import { Flame, Menu, X, Sparkles } from "lucide-react";
import { NAV_ITEMS } from "@/data/constants";
import { useState } from "react";

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Flame className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">PromptForge</span>
        </Link>

        <nav className="hidden gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/workspace"
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white"
          >
            Open Workspace
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-slate-200 p-2 md:hidden"
          onClick={() => setOpen((state) => !state)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="space-y-2 border-t border-slate-200 bg-white p-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/workspace" className="mt-2 block rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            Open Workspace
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export function ProductMark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
      <Sparkles className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
