"use client";

import { useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProvenancePanel } from "./ProvenancePanel";
import type { Citation } from "@/lib/citations/types";
import type { PlanStep } from "@/lib/plan-types";

type Props = {
  citation: Citation | null;
  steps: PlanStep[];
  stepResults: Record<number, unknown>;
  onClose: () => void;
};

export function SidePanel({ citation, steps, stepResults, onClose }: Props) {
  // Keep last citation visible during the close animation so content
  // doesn't flash empty while the Sheet slides out.
  const lastRef = useRef<Citation | null>(citation);
  if (citation) lastRef.current = citation;
  const visible = lastRef.current;

  // Escape key is handled natively by Radix Dialog (the Sheet primitive).
  // We just need to propagate the onOpenChange → onClose.

  return (
    <Sheet open={citation !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] overflow-y-auto p-0 flex flex-col"
        showCloseButton
      >
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <SheetTitle className="text-sm">
            {visible
              ? visible.clauseId
                ? `${visible.leaseId} · ${visible.clauseId}`
                : visible.leaseId
              : "Provenance"}
          </SheetTitle>
        </SheetHeader>

        {/* Content swaps without remounting the Sheet — no slide animation replays */}
        {visible && (
          <ProvenancePanel
            key={`${visible.leaseId}-${visible.clauseId ?? ""}-${visible.stepId ?? ""}`}
            citation={visible}
            steps={steps}
            stepResults={stepResults}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
