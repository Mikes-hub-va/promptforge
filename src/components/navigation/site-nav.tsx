"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/data/constants";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/client";
import { PromptifyMark } from "@/components/branding/promptify-mark";
import { Button } from "@/components/ui/button";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
          <PromptifyMark />
        </Link>

        <nav className="hidden gap-7 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "border border-orange-100 bg-orange-50 text-orange-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  : "text-slate-700 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/account"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            {user ? user.name.split(" ")[0] : "Sign in"}
          </Link>
          <Link
            href="/workspace"
            className="rounded-lg border border-orange-300/60 bg-[linear-gradient(135deg,#ff6b35_0%,#ff8a48_55%,#ffb84d_100%)] px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-18px_rgba(249,115,22,0.48)]"
          >
            Open Workspace
          </Link>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-lg md:hidden"
          onClick={() => setOpen((state) => !state)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div id="mobile-navigation" className="space-y-2 border-t border-slate-200 bg-white p-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(item.href)
                  ? "border border-orange-100 bg-orange-50 text-orange-800"
                  : "text-slate-700 hover:bg-white/80"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/workspace"
            className="mt-2 block rounded-lg border border-orange-300/60 bg-[linear-gradient(135deg,#ff6b35_0%,#ff8a48_55%,#ffb84d_100%)] px-3 py-2 text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Open Workspace
          </Link>
          <Link
            href="/account"
            className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            onClick={() => setOpen(false)}
          >
            {user ? user.name.split(" ")[0] : "Sign in"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export function ProductMark({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white/88 px-3 py-1 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_-24px_rgba(249,115,22,0.35)]">
      <span className="h-2.5 w-2.5 rounded-full bg-[linear-gradient(135deg,#ff6b35,#0ea5e9)]" />
      {label}
    </span>
  );
}
