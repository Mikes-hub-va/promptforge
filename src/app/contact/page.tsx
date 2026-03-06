import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Contact"
        description="Questions about PromptForge, architecture, or roadmap plans?"
      />
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <p>Email: hello@promptforge.app</p>
        <p className="mt-2">Or reach out via our GitHub Discussions and feature requests are always welcome.</p>
        <Link href="mailto:hello@promptforge.app" className="mt-4 inline-block text-sm underline">Send email</Link>
      </div>
    </div>
  );
}
