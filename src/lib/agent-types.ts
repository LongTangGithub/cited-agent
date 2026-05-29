import type { PlanStep } from "./plan-types";

export type AgentState = "idle" | "planning" | "ready" | "executing" | "done" | "failed";

export type AgentEvent =
  | { type: "plan_step_added"; step: PlanStep }
  | { type: "plan_complete"; steps: PlanStep[] }
  | { type: "step_start"; stepNumber: number }
  | { type: "step_done"; stepNumber: number; result: unknown }
  | { type: "step_failed"; stepNumber: number; error: string }
  | { type: "execution_complete"; summary: string }
  | { type: "error"; message: string };
