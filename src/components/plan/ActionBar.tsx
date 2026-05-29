"use client";

import { Button } from "@/components/ui/button";

type Props = {
  stepCount: number;
  editMode: boolean;
  onEditToggle: () => void;
  canApprove: boolean;
  onApprove: () => void;
};

export function ActionBar({ stepCount, editMode, onEditToggle, canApprove, onApprove }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {stepCount} step{stepCount !== 1 ? "s" : ""}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditToggle}
            className={editMode ? "text-foreground" : "text-muted-foreground"}
          >
            {editMode ? "Done" : "Edit plan"}
          </Button>

          <Button size="sm" disabled={!canApprove} onClick={onApprove}>
            Approve &amp; run
          </Button>
        </div>
      </div>
    </div>
  );
}
