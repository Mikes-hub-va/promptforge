"use client";

import {
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Network,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { ChangeEvent, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { ProviderRuntimeConfig } from "@/lib/prompt-engine/types";
import { ProviderKind } from "@/types";
import { PROVIDER_MODELS, PROVIDER_OPTIONS } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ProviderControlsProps = {
  provider: ProviderRuntimeConfig;
  compareModels: string[];
  compareEnabled: boolean;
  onProviderChange: (next: ProviderRuntimeConfig) => void;
  onCompareModelsChange: (next: string[]) => void;
  onCompareEnabledChange: (next: boolean) => void;
};

function safeModels(provider: ProviderKind) {
  return PROVIDER_MODELS[provider] ?? [];
}

function toggleCompareModel(model: string, compareModels: string[], onChange: (next: string[]) => void) {
  if (compareModels.includes(model)) {
    onChange(compareModels.filter((item) => item !== model));
    return;
  }

  if (compareModels.length >= 3) {
    return;
  }

  onChange([...compareModels, model]);
}

function baseKeyPrefix(provider: ProviderKind) {
  if (provider === "openai") {
    return "sk-or-v1-";
  }
  if (provider === "anthropic") {
    return "sk-ant-";
  }
  return "AIza";
}

function sanitizeBaseUrl(input: string) {
  return input.trim().replace(/\s+/g, "");
}

export function ProviderControls({
  provider,
  compareModels,
  compareEnabled,
  onProviderChange,
  onCompareModelsChange,
  onCompareEnabledChange,
}: ProviderControlsProps) {
  const { user } = useAuth();
  const availableModels = safeModels(provider.provider);
  const supportsAdvanced = availableModels.length > 1;
  const requiresLiveKey = provider.provider !== "local";
  const supportsBackendCompare = provider.provider !== "local";
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const hasKey = Boolean((provider.apiKey ?? "").trim());
  const hasManagedAccess = user?.planTier === "pro";
  const keyMask = hasKey ? `${"*".repeat(12)}${baseKeyPrefix(provider.provider)}` : "";

  const handleProviderChange = (value: ProviderKind) => {
    onCompareModelsChange([]);
    onCompareEnabledChange(false);
    onProviderChange({
      provider: value,
      model: safeModels(value)[0] ?? "gpt-4o-mini",
      apiKey: value === "local" ? "" : provider.apiKey,
      baseUrl: value === "openai" ? provider.baseUrl : "",
    });
  };

  const handleModelChange = (model: string) => {
    onProviderChange({
      ...provider,
      model,
    });
  };

  const handleKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    onProviderChange({
      ...provider,
      apiKey: event.target.value,
    });
  };

  const handleClearApiKey = () => {
    onProviderChange({
      ...provider,
      apiKey: "",
    });
  };

  const handleBaseUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    onProviderChange({
      ...provider,
      baseUrl: sanitizeBaseUrl(event.target.value),
    });
  };

  return (
    <Card className="pf-gradient-border">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-4 w-4 text-sky-600" /> Runtime and provider access
            </CardTitle>
            <CardDescription>
              Use the local engine for zero-cost refinement, or attach your own provider for premium prompt generation and model comparisons.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              BYOK-ready
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Session-only keys
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select id="provider" value={provider.provider} onChange={(event) => handleProviderChange(event.target.value as ProviderKind)}>
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="providerModel">Model</Label>
            <div className="relative">
              <Select id="providerModel" value={provider.model} onChange={(event) => handleModelChange(event.target.value)}>
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-slate-500" />
            </div>
          </div>
        </div>

        {requiresLiveKey ? (
          <div>
            <Label htmlFor="providerApiKey">API key (session only)</Label>
            <div className="relative">
              <Input
                id="providerApiKey"
                type={isKeyVisible ? "text" : "password"}
                autoComplete="off"
                placeholder={keyMask || `${baseKeyPrefix(provider.provider)}...`}
                value={provider.apiKey ?? ""}
                onChange={handleKeyChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-16 top-2.5 rounded-lg bg-transparent text-slate-500 hover:bg-sky-50 hover:text-slate-700"
                aria-label={isKeyVisible ? "Hide API key" : "Show API key"}
                onClick={() => setIsKeyVisible((state) => !state)}
                title={isKeyVisible ? "Hide API key" : "Show API key"}
              >
                {isKeyVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              {hasKey ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-9 top-2.5 rounded-lg bg-transparent text-slate-400 transition hover:bg-sky-50 hover:text-slate-700"
                  aria-label="Clear API key"
                  onClick={handleClearApiKey}
                  title="Clear API key"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
              <KeyRound className="pointer-events-none absolute right-3 top-2.5 size-4 text-slate-400" />
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Your key is never persisted and is only forwarded during the active session.
            </p>
            {!hasKey ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                No session key added. {hasManagedAccess
                  ? "Your Pro account can use the managed cloud key when it is configured on the server."
                  : "Free mode falls back to local output unless you bring your own key or upgrade to Pro for managed runs."}
              </p>
            ) : null}
          </div>
        ) : null}

        {provider.provider === "openai" ? (
          <div>
            <Label htmlFor="providerBaseUrl">OpenAI-compatible base URL (optional)</Label>
            <Input
              id="providerBaseUrl"
              placeholder="https://api.openai.com"
              value={provider.baseUrl ?? ""}
              onChange={handleBaseUrlChange}
            />
            <p className="mt-1 text-xs text-slate-500">
              Promptify normalizes compatible hosts automatically. Only public HTTPS OpenAI-compatible endpoints are accepted.
            </p>
          </div>
        ) : null}

        <div className="pf-soft-panel rounded-[24px] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Model comparison lab</p>
              <p className="text-xs text-slate-600">
                {supportsBackendCompare
                  ? "Generate up to 3 additional model-specific prompt packages for side-by-side evaluation."
                  : "Comparison is available once a live provider is selected."}
              </p>
            </div>
            <Button
              size="sm"
              variant={compareEnabled ? "default" : "outline"}
              onClick={() => {
                if (compareEnabled) {
                  onCompareModelsChange([]);
                  onCompareEnabledChange(false);
                  return;
                }

                onCompareEnabledChange(true);
              }}
              type="button"
              disabled={!supportsBackendCompare}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {compareEnabled ? "Comparing" : "Enable"}
            </Button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {supportsAdvanced ? (
              safeModels(provider.provider).map((model) => (
                <label
                  key={model}
                  className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                    compareEnabled
                      ? "border-slate-200/80 bg-white/80 hover:border-sky-200"
                      : "border-slate-200/70 bg-white/55 opacity-70"
                  }`}
                >
                  <Checkbox
                    checked={compareModels.includes(model)}
                    onChange={() => toggleCompareModel(model, compareModels, onCompareModelsChange)}
                    disabled={!compareEnabled}
                  />
                  <span className="space-y-1">
                    <span className="block font-semibold text-slate-900">{model}</span>
                    <span className="block text-xs leading-5 text-slate-500">
                      Additional model framing with separate tabs and estimated run cost.
                    </span>
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-slate-600">No alternate models are available for this provider yet.</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-[11px] font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              No stored provider secrets
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-[11px] font-medium text-slate-600">
              Limit 3 compare models
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {requiresLiveKey
              ? "Security-first: keys are forwarded only when the provider request runs."
              : "Local mode keeps refinement inside the app until you opt into provider mode."}
          </p>
          {requiresLiveKey ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs text-slate-600">
              <Fingerprint className="h-3.5 w-3.5" />
              Compatible with OpenAI-style endpoints and proxy layers.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
