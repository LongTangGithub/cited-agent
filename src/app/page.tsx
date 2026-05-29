"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PromptInput } from "@/components/plan/PromptInput";
import { ActionBar } from "@/components/plan/ActionBar";

const PlanList = dynamic(
  () => import("@/components/plan/PlanList").then((m) => ({ default: m.PlanList })),
  { ssr: false }
);
import {
  SCENARIO_1_PROMPT,
  SCENARIO_2_PROMPT,
  SCENARIO_3_PROMPT,
  SCENARIO_1_PLAN,
} from "@/data/mock-plan";
import type { PlanStep } from "@/lib/plan-types";

const SCENARIOS = [
  { label: "Q1 expirations + missing COIs", prompt: SCENARIO_1_PROMPT },
  { label: "Whole Foods escalation comparison", prompt: SCENARIO_2_PROMPT },
  { label: "Co-tenancy clauses at risk", prompt: SCENARIO_3_PROMPT },
];

export default function Home() {
  const [prompt, setPrompt] = useState(SCENARIO_1_PROMPT);
  const [steps, setSteps] = useState<PlanStep[]>(SCENARIO_1_PLAN);
  const [activeScenario, setActiveScenario] = useState<number | null>(0);
  const [editMode, setEditMode] = useState(false);
  const [planKey, setPlanKey] = useState(0);

  function handleScenarioSelect(index: number, scenarioPrompt: string) {
    setPrompt(scenarioPrompt);
    setActiveScenario(index);
    if (index === 0) {
      setSteps(SCENARIO_1_PLAN);
    } else {
      setSteps([]);
    }
    setPlanKey((k) => k + 1);
  }

  function handlePromptChange(value: string) {
    setPrompt(value);
    setActiveScenario(null);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight">Cited Agent</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Prismera demo</p>
        </header>

        {/* Prompt + chips */}
        <PromptInput
          value={prompt}
          onChange={handlePromptChange}
          scenarios={SCENARIOS}
          activeScenario={activeScenario}
          onScenarioSelect={handleScenarioSelect}
        />

        {/* Plan cards */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Proposed plan
          </p>
          <PlanList key={planKey} steps={steps} />
        </div>
      </div>

      <ActionBar
        stepCount={steps.length}
        editMode={editMode}
        onEditToggle={() => setEditMode((v) => !v)}
      />
    </main>
  );
}
