"use client";

import { useState } from "react";
import { GripVertical, MoreHorizontal, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PlanStep, PlanStepStatus } from "@/lib/plan-types";

type Props = {
  step: PlanStep;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: PlanStepStatus) => void;
};

export function PlanCard({ step, onEdit, onDelete, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const transformStr = transform
    ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
    : undefined;

  const style = {
    transform: transformStr,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isApproved = step.status === "approved";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-card px-3 py-3 text-sm transition-colors",
        isApproved ? "border-primary/40" : "border-border"
      )}
    >
      {/* Drag handle */}
      <button
        {...listeners}
        className="mt-0.5 cursor-grab touch-none text-muted-foreground opacity-40 hover:opacity-100 active:cursor-grabbing"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      {/* Main content — click to expand */}
      <button
        className="flex min-w-0 flex-1 flex-col gap-1 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Compact row */}
        <div className="flex items-center gap-2">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-foreground/70">
            {step.stepNumber}
          </span>
          <span className="shrink-0 font-mono text-xs text-primary">{step.toolName}</span>
          <span className="flex-1 min-w-0 truncate text-muted-foreground">{step.description}</span>
        </div>

        {/* Expanded detail */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            expanded ? "max-h-40 opacity-100 pt-2" : "max-h-0 opacity-0"
          )}
        >
          <dl className="space-y-1">
            {Object.entries(step.args).map(([k, v]) => (
              <div key={k} className="flex gap-2 font-mono text-xs text-muted-foreground">
                <dt className="shrink-0 text-muted-foreground/60">{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs italic text-muted-foreground">
            → {step.expectedOutput}
          </p>
        </div>
      </button>

      {/* Status badge */}
      {isApproved && (
        <Badge variant="secondary" className="mt-0.5 shrink-0 gap-1">
          <Check className="size-3" />
          Approved
        </Badge>
      )}

      {/* Kebab menu */}
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 size-6 shrink-0 text-muted-foreground"
            aria-label="Step options"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="end">
          <button
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            onClick={() => {
              onStatusChange(isApproved ? "proposed" : "approved");
              setMenuOpen(false);
            }}
          >
            {isApproved ? "Revert" : "Approve"}
          </button>
          <button
            className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
            onClick={() => { onEdit(); setMenuOpen(false); }}
          >
            Edit
          </button>
          <button
            className="w-full rounded px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
            onClick={() => { onDelete(); setMenuOpen(false); }}
          >
            Delete
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
