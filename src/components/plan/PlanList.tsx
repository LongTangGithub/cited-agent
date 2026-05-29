"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { PlanCard } from "./PlanCard";
import type { PlanStep, PlanStepStatus } from "@/lib/plan-types";

type Props = {
  steps: PlanStep[];
};

export function PlanList({ steps }: Props) {
  const [items, setItems] = useState<PlanStep[]>(steps);

  useEffect(() => {
    setItems(steps);
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleStatusChange(id: string, status: PlanStepStatus) {
    setItems((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No plan generated yet. Real agent wiring lands on Day 4.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((step) => (
            <PlanCard
              key={step.id}
              step={step}
              onEdit={() => {}}
              onDelete={() => handleDelete(step.id)}
              onStatusChange={(status) => handleStatusChange(step.id, status)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
