import { FAQ_ITEMS } from "@/data/constants";
import { Accordion } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/marketing/section-heading";

export const metadata = {
  title: "FAQ | PromptForge",
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <SectionHeading title="Frequently Asked Questions" description="Everything you need to get started with PromptForge." />
      <div className="mt-8">
        <Accordion
          items={FAQ_ITEMS.map((item) => ({
            question: item.question,
            answer: <p>{item.answer}</p>,
          }))}
        />
      </div>
    </div>
  );
}
