"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USE_CASE_LABELS } from "@/data/constants";
import { PRESET_LIBRARY } from "@/data/presets";
import { TemplatePreset, UseCaseCategory } from "@/types";
import { TemplateCard } from "@/components/workspace/template-card";

const categories = Object.entries(USE_CASE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function TemplateLibrary() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<UseCaseCategory | "all">("all");

  const presets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PRESET_LIBRARY.filter((preset: TemplatePreset) => {
      const matchesCategory =
        category === "all" || preset.category === category;
      const matchesText =
        !normalized ||
        preset.title.toLowerCase().includes(normalized) ||
        preset.description.toLowerCase().includes(normalized) ||
        preset.exampleInputs.goal.toLowerCase().includes(normalized) ||
        preset.outputStyle.toLowerCase().includes(normalized);
      return matchesCategory && matchesText;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [query, category]);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates by title, output style, or goal"
          className="md:max-w-lg"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => setCategory("all")}
            size="sm"
            variant={category === "all" ? "default" : "outline"}
          >
            All
          </Button>
          {categories.map((item) => (
            <Button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value as UseCaseCategory)}
              size="sm"
              variant={category === item.value ? "default" : "outline"}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {presets.map((preset) => (
          <TemplateCard
            key={preset.id}
            preset={preset}
            onUse={() => router.push(`/workspace?preset=${preset.slug}`)}
          />
        ))}
      </div>
      {!presets.length ? (
        <p className="text-sm text-slate-500">No templates match this search. Try another keyword or category.</p>
      ) : null}
    </section>
  );
}
