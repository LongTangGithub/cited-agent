import type { PlanStep } from "@/lib/plan-types";

export const SCENARIO_1_PROMPT =
  "Find every lease expiring in Q1 2026 with missing COIs and draft tenant outreach.";

export const SCENARIO_2_PROMPT =
  "Compare escalation terms across all Whole Foods-anchored leases.";

export const SCENARIO_3_PROMPT =
  "Identify co-tenancy clauses at risk of triggering and summarize exposure.";

export const SCENARIO_1_PLAN: PlanStep[] = [
  {
    id: "step_1",
    stepNumber: 1,
    toolName: "searchLeases",
    description: "Filter leases with expiration between 2026-01-01 and 2026-03-31",
    args: {
      "term.expiration.gte": "2026-01-01",
      "term.expiration.lte": "2026-03-31",
    },
    expectedOutput: "List of leases expiring in Q1 2026",
    status: "proposed",
  },
  {
    id: "step_2",
    stepNumber: 2,
    toolName: "searchLeases",
    description: "Narrow results to leases where coi.onFile is false",
    args: {
      "coi.onFile": false,
      "term.expiration.gte": "2026-01-01",
      "term.expiration.lte": "2026-03-31",
    },
    expectedOutput: "Leases in Q1 2026 missing a certificate of insurance",
    status: "proposed",
  },
  {
    id: "step_3",
    stepNumber: 3,
    toolName: "extractClause",
    description: "Pull notice provisions from each filtered lease",
    args: {
      clauseHeading: "Notices",
      leaseIds: "from step 2",
    },
    expectedOutput: "Notice provision text and required delivery method per lease",
    status: "proposed",
  },
  {
    id: "step_4",
    stepNumber: 4,
    toolName: "draftEmail",
    description: "Generate outreach email per tenant using notice terms",
    args: {
      template: "coi_missing_outreach",
      includeFields: "tenant.name, term.expiration, coi.requiredCoverage",
    },
    expectedOutput: "Draft outreach email per tenant, ready for review",
    status: "proposed",
  },
];
