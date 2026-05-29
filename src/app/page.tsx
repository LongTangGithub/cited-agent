"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PromptInput } from "@/components/plan/PromptInput";
import { ActionBar } from "@/components/plan/ActionBar";
import { useAgent } from "@/lib/agent-client";
import {
  SCENARIO_1_PROMPT,
  SCENARIO_2_PROMPT,
  SCENARIO_3_PROMPT,
} from "@/data/mock-plan";

const PlanList = dynamic(
  () => import("@/components/plan/PlanList").then((m) => ({ default: m.PlanList })),
  { ssr: false }
);

const SCENARIOS = [
  { label: "Q1 expirations + missing COIs", prompt: SCENARIO_1_PROMPT },
  { label: "Whole Foods escalation comparison", prompt: SCENARIO_2_PROMPT },
  { label: "Co-tenancy clauses at risk", prompt: SCENARIO_3_PROMPT },
];

export default function Home() {
  const agent = useAgent();
  const [prompt, setPrompt] = useState(SCENARIO_1_PROMPT);
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [planKey, setPlanKey] = useState(0);

  // Reset PlanList when a new plan arrives
  useEffect(() => {
    if (agent.state === "ready") {
      setPlanKey((k) => k + 1);
    }
  }, [agent.state]);

  function handleScenarioSelect(index: number, scenarioPrompt: string) {
    setPrompt(scenarioPrompt);
    setActiveScenario(index);
    agent.runPlan(scenarioPrompt);
  }

  function handlePromptChange(value: string) {
    setPrompt(value);
    setActiveScenario(null);
  }

  const isPlanning = agent.state === "planning";
  const canApprove = agent.state === "ready" && agent.steps.length > 0;

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

        {/* Planning indicator */}
        {isPlanning && (
          <p className="mt-6 text-sm text-muted-foreground animate-pulse">
            Planning…
          </p>
        )}

        {/* Plan cards */}
        {!isPlanning && (
          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Proposed plan
            </p>
            <PlanList key={planKey} steps={agent.steps} />
          </div>
        )}

        {/* Summary */}
        {agent.summary && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground whitespace-pre-wrap">
            {agent.summary}
          </div>
        )}

        {/* Error */}
        {agent.error && (
          <p className="mt-4 text-sm text-destructive">{agent.error}</p>
        )}
      </div>

      <ActionBar
        stepCount={agent.steps.length}
        editMode={editMode}
        onEditToggle={() => setEditMode((v) => !v)}
        canApprove={canApprove}
        onApprove={agent.executePlan}
      />
    </main>
  );
}
