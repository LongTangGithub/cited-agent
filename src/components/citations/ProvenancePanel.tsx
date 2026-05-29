"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Citation } from "@/lib/citations/types";
import type { Lease } from "@/lib/leases";
import type { PlanStep } from "@/lib/plan-types";

type Props = {
  citation: Citation;
  steps: PlanStep[];
  stepResults: Record<number, unknown>;
};

function SourceSection({ lease, citation }: { lease: Lease; citation: Citation }) {
  if (citation.clauseId) {
    const doc = lease.documents.find((d) =>
      d.clauses.some((c) => c.id === citation.clauseId)
    );
    const clause = doc?.clauses.find((c) => c.id === citation.clauseId);
    if (!clause || !doc) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
          <span className="text-xs text-muted-foreground truncate">{doc.title}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {clause.section} · {clause.heading}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {clause.text}
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60 italic">
          Day 6: Jump to document →
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{lease.tenant.name}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>{lease.property.name}</p>
        <p>Expires {lease.term.expiration}</p>
        {lease.property.anchorTenant && <p>Anchor: {lease.property.anchorTenant}</p>}
        <p>COI on file: {lease.coi.onFile ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}

function ReasoningSection({
  citation,
  steps,
  stepResults,
}: {
  citation: Citation;
  steps: PlanStep[];
  stepResults: Record<number, unknown>;
}) {
  if (citation.stepId) {
    const n = parseInt(citation.stepId.replace("step_", ""), 10);
    const step = steps.find((s) => s.stepNumber === n);
    const result = stepResults[n];
    if (!step) return <p className="text-xs text-muted-foreground">Step not found.</p>;

    const resultItems = Array.isArray(result)
      ? (result as { id?: string; leaseId?: string }[]).slice(0, 3)
      : null;

    return (
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Produced by step {n}
          </p>
          <p className="text-sm">{step.description}</p>
        </div>
        <dl className="space-y-1">
          <div className="flex gap-2 font-mono text-xs">
            <dt className="text-muted-foreground/60 shrink-0">tool</dt>
            <dd className="text-primary">{step.toolName}</dd>
          </div>
          {Object.entries(step.args).map(([k, v]) => (
            <div key={k} className="flex gap-2 font-mono text-xs">
              <dt className="text-muted-foreground/60 shrink-0">{k}</dt>
              <dd className="text-muted-foreground truncate">{String(v)}</dd>
            </div>
          ))}
        </dl>
        {result !== undefined && (
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">
              {Array.isArray(result) ? `Returned ${(result as unknown[]).length} result(s)` : "Result:"}
            </p>
            {resultItems?.map((item, i) => (
              <p key={i} className="font-mono text-[11px]">
                {item.leaseId ?? item.id ?? JSON.stringify(item).slice(0, 40)}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Referenced across the execution:</p>
      {steps.map((s) => (
        <p key={s.id} className="text-xs font-mono text-muted-foreground/70">
          step {s.stepNumber} · {s.toolName}
        </p>
      ))}
    </div>
  );
}

export function ProvenancePanel({ citation, steps, stepResults }: Props) {
  const [lease, setLease] = useState<Lease | null>(null);

  useEffect(() => {
    setLease(null);
    fetch(`/api/leases/${citation.leaseId}`)
      .then((r) => r.json())
      .then(setLease)
      .catch(() => {});
  }, [citation.leaseId]);

  if (!lease) {
    return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="p-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Source
        </p>
        <SourceSection lease={lease} citation={citation} />
      </div>
      <Separator />
      <div className="p-5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Reasoning
        </p>
        <ReasoningSection citation={citation} steps={steps} stepResults={stepResults} />
      </div>
    </div>
  );
}
