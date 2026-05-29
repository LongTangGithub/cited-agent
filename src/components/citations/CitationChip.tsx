"use client";

import { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { Citation } from "@/lib/citations/types";
import type { Lease } from "@/lib/leases";

type Props = {
  citation: Citation;
  isActive: boolean;
  onClick: (c: Citation) => void;
};

function ChipPreview({ lease, citation }: { lease: Lease; citation: Citation }) {
  if (citation.clauseId) {
    const clause = lease.documents
      .flatMap((d) => d.clauses)
      .find((c) => c.id === citation.clauseId);
    if (clause) {
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium">{clause.heading}</p>
          <p className="text-[11px] text-muted-foreground">
            {clause.section} · {lease.tenant.name}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-3">
            {clause.text.slice(0, 120)}…
          </p>
          <p className="text-[10px] text-muted-foreground/60 italic">
            Click for full provenance
          </p>
        </div>
      );
    }
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium">{lease.tenant.name}</p>
      <p className="text-[11px] text-muted-foreground">{lease.property.name}</p>
      <p className="text-[11px] text-muted-foreground">
        Expires {lease.term.expiration}
        {lease.property.anchorTenant ? ` · ${lease.property.anchorTenant} anchor` : ""}
      </p>
      <p className="text-[10px] text-muted-foreground/60 italic">
        Click for full provenance
      </p>
    </div>
  );
}

export function CitationChip({ citation, isActive, onClick }: Props) {
  const [lease, setLease] = useState<Lease | null>(null);

  useEffect(() => {
    fetch(`/api/leases/${citation.leaseId}`)
      .then((r) => r.json())
      .then(setLease)
      .catch(() => {});
  }, [citation.leaseId]);

  const label = citation.clauseId
    ? `${citation.leaseId}#${citation.clauseId}`
    : citation.leaseId;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={() => onClick(citation)}
          className={cn(
            "inline-flex items-center rounded-full border px-1.5 py-0.5 font-mono text-[11px] leading-none mx-0.5 align-middle transition-colors",
            "bg-muted/40 border-border hover:bg-muted hover:border-border/80",
            isActive && "bg-accent border-accent text-accent-foreground"
          )}
        >
          {label}
          {citation.stepId && (
            <span className="ml-1 font-sans text-[10px] text-muted-foreground">
              @{citation.stepId}
            </span>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-3" align="start">
        {lease ? (
          <ChipPreview lease={lease} citation={citation} />
        ) : (
          <p className="text-xs text-muted-foreground">Loading…</p>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
