import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Promptify about product questions, sales, support, or feedback.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="Contact"
        description="Reach the Promptify team for support, billing, onboarding, or partnership conversations."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Support",
            body: "Product questions, account help, and runtime issues.",
          },
          {
            title: "Sales",
            body: "Pro and Studio onboarding, rollout planning, and procurement.",
          },
          {
            title: "Partnerships",
            body: "Integrations, distribution, and strategic collaborations.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Promptify inbox</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">hello@usepromptify.org</p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Use one inbox for support, billing, and team onboarding. Include the account email or workspace URL when you want a faster response.
        </p>
        <a
          href="mailto:hello@usepromptify.org"
          className="mt-5 inline-flex items-center rounded-xl border border-orange-300/60 bg-[linear-gradient(135deg,#ff6b35_0%,#ff8a48_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_-24px_rgba(249,115,22,0.6)]"
        >
          Email Promptify
        </a>
      </div>
    </div>
  );
}
