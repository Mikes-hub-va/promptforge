import Link from "next/link";
import { APP_DOMAIN } from "@/data/constants";
import { PromptifyMark } from "@/components/branding/promptify-mark";

export default function SiteFooter() {
  const links = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/resources", label: "Resources" },
    { href: "/templates", label: "Templates" },
  ];

  return (
    <footer className="border-t border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,249,244,0.96),rgba(255,255,255,0.94))]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <PromptifyMark labelClassName="text-sm" />
          <p className="text-xs text-slate-500">Prompt systems for people shipping real work. {APP_DOMAIN}</p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 md:grid-cols-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
