"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Scenario = {
  label: string;
  prompt: string;
};

type Props = {
  value: string;
  onChange: (prompt: string) => void;
  scenarios: Scenario[];
  activeScenario: number | null;
  onScenarioSelect: (index: number, prompt: string) => void;
};

export function PromptInput({
  value,
  onChange,
  scenarios,
  activeScenario,
  onScenarioSelect,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder="Describe what the agent should do…"
        className={cn(
          "w-full resize-none overflow-hidden rounded-lg border border-border/60 bg-card px-4 py-3",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:border-ring/40",
          "transition-colors"
        )}
      />

      {/* Scenario chips */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => onScenarioSelect(i, s.prompt)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activeScenario === i
                ? "border-accent bg-accent text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
