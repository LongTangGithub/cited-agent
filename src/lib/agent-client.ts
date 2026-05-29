"use client";

import { useState, useCallback, useRef } from "react";
import type { AgentEvent, AgentState } from "./agent-types";
import type { PlanStep } from "./plan-types";

async function consumeSSE(
  res: Response,
  onEvent: (event: AgentEvent) => void,
): Promise<void> {
  if (!res.body) throw new Error("No response body");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const chunk of events) {
      const line = chunk.trim();
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      onEvent(JSON.parse(json) as AgentEvent);
    }
  }
}

export function useAgent() {
  const [state, setState] = useState<AgentState>("idle");
  const [steps, setSteps] = useState<PlanStep[]>([]);
  const [stepResults, setStepResults] = useState<Record<number, unknown>>({});
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stepsRef = useRef<PlanStep[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  function updateStepStatus(stepNumber: number, status: PlanStep["status"], extra?: Partial<PlanStep>) {
    setSteps((prev) => {
      const next = prev.map((s) =>
        s.stepNumber === stepNumber ? { ...s, status, ...extra } : s,
      );
      stepsRef.current = next;
      return next;
    });
  }

  const runPlan = useCallback(async (prompt: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("planning");
    setSteps([]);
    setSummary(null);
    setError(null);
    stepsRef.current = [];

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "plan", prompt }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await consumeSSE(res, (event) => {
        if (event.type === "plan_step_added") {
          setSteps((prev) => {
            const next = [...prev, event.step];
            stepsRef.current = next;
            return next;
          });
        } else if (event.type === "plan_complete") {
          // Defensive: replace with authoritative full list in case any step_added was missed
          setSteps(event.steps);
          stepsRef.current = event.steps;
          setState("ready");
        } else if (event.type === "error") {
          setError(event.message);
          setState("failed");
        }
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setState("failed");
    }
  }, []);

  const executePlan = useCallback(async () => {
    if (stepsRef.current.length === 0) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState("executing");
    setSummary(null);
    setError(null);
    setStepResults({});

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "execute", plan: stepsRef.current }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await consumeSSE(res, (event) => {
        if (event.type === "step_start") {
          updateStepStatus(event.stepNumber, "running");
        } else if (event.type === "step_done") {
          updateStepStatus(event.stepNumber, "done");
          setStepResults((prev) => ({ ...prev, [event.stepNumber]: event.result }));
        } else if (event.type === "step_failed") {
          updateStepStatus(event.stepNumber, "failed");
        } else if (event.type === "execution_complete") {
          setSummary(event.summary);
          setState("done");
        } else if (event.type === "error") {
          setError(event.message);
          setState("failed");
        }
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setState("failed");
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState("idle");
    setSteps([]);
    setStepResults({});
    setSummary(null);
    setError(null);
    stepsRef.current = [];
  }, []);

  return { state, steps, stepResults, summary, error, runPlan, executePlan, reset };
}
