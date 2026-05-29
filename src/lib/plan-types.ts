export type PlanStepStatus = "proposed" | "approved";

export type PlanStepArgs = Record<string, string | number | boolean>;

export type PlanStep = {
  id: string;
  stepNumber: number;
  toolName: string;
  description: string;
  args: PlanStepArgs;
  expectedOutput: string;
  status: PlanStepStatus;
};
