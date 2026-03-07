"use client";

import { CheckCircle2, Loader2, Network, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Scene = {
  actor: string;
  raw: string;
  output: string;
  notes: string[];
  quality: number;
};

const scenes: Scene[] = [
  {
    actor: "Product lead",
    raw: "Draft a launch email for a fintech product. Keep it concise, trustworthy, and ready for internal review.",
    output:
      "Objective: craft a concise fintech launch message with release scope and impact statements.\nAudience: founders, support, clients.\nTone: professional, neutral, evidence-first.\nOutput format: markdown with objective, changes, impact, and action block.\nConstraints: 180 words max; no unsupported claims; include rollback note.",
    notes: [
      "Goal was rewritten into a measurable communication contract.",
      "Audience, success metric, and rollout conditions were made explicit.",
      "Output became review-safe with consistent structure and constraints.",
    ],
    quality: 84,
  },
  {
    actor: "Senior engineer",
    raw: "Need auth prompts for a React app with accessibility and session security checks.",
    output:
      "Objective: generate implementation-ready authentication instructions with explicit security guardrails.\nContext: React + TypeScript SPA.\nRequirements: session lifecycle checks, token handling, validation checklist, fallback behavior.\nOutput format: markdown with architecture, acceptance criteria, and QA test map.",
    notes: [
      "Raw constraints were translated into explicit implementation sections.",
      "Security and accessibility requirements were made testable.",
      "Added acceptance criteria and rollback guardrails for deterministic execution.",
    ],
    quality: 90,
  },
  {
    actor: "Growth lead",
    raw: "Create campaign prompts for social launch posts with stronger hooks.",
    output:
      "Objective: produce platform-specific social post prompts.\nDeliverables: 3 variants for LinkedIn, X, Instagram.\nAudience: founders and growth teams.\nConstraints: concise style, non-hype voice, clear CTA, measurable test ideas.",
    notes: [
      "Prompt now contains channel-specific branches, not one-size-fits-all wording.",
      "Added explicit audience + CTA constraints so outputs stay on-brand.",
      "Included test hooks for short-cycle campaign validation.",
    ],
    quality: 88,
  },
];

type Phase = "input" | "forge" | "output";

export function PromptifyPreview() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("input");
  const [typedRaw, setTypedRaw] = useState("");
  const [typedOutput, setTypedOutput] = useState("");
  const [canReplay, setCanReplay] = useState(false);

  const scene = scenes[index];

  const resetScene = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
    setTypedRaw("");
    setTypedOutput("");
    setCanReplay(false);
    setPhase("input");
  }, []);

  const advanceScene = useCallback(() => {
    resetScene((index + 1) % scenes.length);
  }, [index, resetScene]);

  useEffect(() => {
    let inputCursor = 0;
    let outputCursor = 0;
    let inputInterval: ReturnType<typeof setInterval> | undefined;
    let outputInterval: ReturnType<typeof setInterval> | undefined;
    let holdTimeout: ReturnType<typeof setTimeout> | undefined;

    if (phase === "input") {
      inputInterval = setInterval(() => {
        inputCursor += 1;
        setTypedRaw(scene.raw.slice(0, inputCursor));

        if (inputCursor >= scene.raw.length) {
          clearInterval(inputInterval);
          setPhase("forge");
        }
      }, 20);
    }

    if (phase === "forge") {
      outputInterval = setInterval(() => {
        outputCursor += 2;
        setTypedOutput(scene.output.slice(0, outputCursor));

        if (outputCursor >= scene.output.length) {
          clearInterval(outputInterval);
          setPhase("output");
        }
      }, 14);
    }

    if (phase === "output") {
      holdTimeout = setTimeout(() => {
        setCanReplay(true);
        holdTimeout = setTimeout(() => {
          advanceScene();
        }, 1700);
      }, 500);
    }

    return () => {
      if (inputInterval) {
        clearInterval(inputInterval);
      }
      if (outputInterval) {
        clearInterval(outputInterval);
      }
      if (holdTimeout) {
        clearTimeout(holdTimeout);
      }
    };
  }, [advanceScene, index, phase, scene.output, scene.raw]);

  const progress = useMemo(() => {
    if (phase === "input") return 30;
    if (phase === "forge") return 68;
    return 100;
  }, [phase]);

  const status = useMemo(() => {
    if (phase === "input") return "Capturing raw intent";
    if (phase === "forge") return "Adding structure and constraints";
    return "Output stabilized";
  }, [phase]);

  return (
    <Card className="group relative overflow-hidden border-slate-200/80 bg-white/95 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_-10%,rgba(255,107,53,0.12),transparent_45%),radial-gradient(circle_at_0%_110%,rgba(14,165,233,0.08),transparent_45%),radial-gradient(circle_at_50%_50%,rgba(255,184,77,0.08),transparent_40%)]" />

      <CardHeader className="relative border-b border-slate-200/70 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-slate-900">Promptify live reel</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Watch a rough operator brief become a structured prompt pack with clear tradeoffs.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs text-slate-600">
            <Network className="h-3.5 w-3.5 text-orange-600" />
            Local + managed cloud
          </span>
        </div>

        <div className="mt-3 h-1.5 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="relative p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Loader2
              className={`h-3.5 w-3.5 ${phase !== "output" ? "animate-spin text-orange-600" : "text-emerald-600"}`}
            />
            {status}
          </span>
          <span>
            Frame {index + 1}/{scenes.length}
          </span>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Raw Input ({scene.actor})</p>
              <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">Typing</span>
            </div>
            <pre className="min-h-48 max-h-52 overflow-hidden rounded-xl bg-white p-3 font-mono text-xs leading-6 text-slate-700">
              {typedRaw}
              {phase === "input" ? <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-orange-400" /> : null}
            </pre>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Forged Output</p>
              <span className="inline-flex rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">Quality {scene.quality}</span>
            </div>
            <pre className="min-h-48 max-h-52 overflow-hidden rounded-xl bg-white p-3 font-mono text-xs leading-6 text-slate-700">
              {typedOutput}
              {phase === "forge" ? <span className="ml-1 animate-pulse text-slate-400">▌</span> : null}
            </pre>
          </article>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200/80 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Workflow className="h-4 w-4 text-orange-600" />
                Why the pack improved
              </p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Deterministic + provider-aware
              </p>
            </div>
          <ul className="space-y-1 text-xs text-slate-700 sm:text-sm">
            {scene.notes.map((note) => (
              <li key={note} className="inline-flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            if (canReplay) {
              resetScene(index);
              return;
            }
            resetScene(index);
          }}
        >
          Replay scenario
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
