import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata: Metadata = {
  title: "About",
  description: "Learn why Promptify exists and how the product approaches prompt quality, synced accounts, and managed AI.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="About Promptify"
        description="Promptify is a practical prompt-ops product built for people shipping real work."
      />
      <div className="prose mt-8 max-w-none">
        <p>
          Promptify exists because most prompt tools still feel thin: a textbox, a gimmick, and no real operating model behind them.
          We wanted a workspace that could take a messy human brief and turn it into a structured prompt pack with useful constraints, layered outputs,
          and a clean handoff into whatever model or workflow comes next.
        </p>
        <p>
          The product starts with a deterministic local engine because useful work should not require immediate spend. From there, Promptify adds
          account sync, real billing, and a managed cloud path while still keeping BYOK provider flexibility at the core of the architecture.
        </p>
      </div>
    </div>
  );
}
