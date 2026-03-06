import { SectionHeading } from "@/components/marketing/section-heading";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading
        title="About PromptForge"
        description="PromptForge is a practical AI utility built to make prompt engineering accessible.">
      </SectionHeading>
      <div className="prose mt-8 max-w-none">
        <p>
          We are building a disciplined workflow for creating clear prompts. Our goal is to remove guesswork by adding structure,
          explicit constraints, and copy-ready output formats before the prompt reaches any model.
        </p>
        <p>
          PromptForge started as a lightweight local engine so it remains useful even without paid APIs. As we scale,
          we keep extensibility for external model providers at the core of the architecture.
        </p>
      </div>
    </div>
  );
}
