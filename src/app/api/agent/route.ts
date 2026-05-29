import Anthropic from "@anthropic-ai/sdk";
import { getLeases } from "@/lib/leases";
import { toolDefinitions, executeTool } from "@/lib/tools";
import type { PlanStep } from "@/lib/plan-types";
import type { AgentEvent } from "@/lib/agent-types";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
const client = new Anthropic();

function buildSystem(): Anthropic.TextBlockParam[] {
  return [
    {
      type: "text",
      text: "You are a CRE lease analyst agent. You help property managers analyze lease portfolios, extract clause information, compare rent terms, and draft tenant communications. Be precise and concise.",
    },
    {
      type: "text",
      text: JSON.stringify(getLeases()),
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: "Use the provided tools to fulfill requests. Use ISO date format (YYYY-MM-DD) for date filters. Tool results are arrays of objects — reference them by leaseId in subsequent steps.",
    },
  ];
}

const submitPlanTool: Anthropic.Tool = {
  name: "submitPlan",
  description: "Submit the proposed plan steps for user review before execution.",
  input_schema: {
    type: "object",
    properties: {
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            stepNumber: { type: "number" },
            toolName: { type: "string", enum: ["searchLeases", "extractClause", "compareTerms", "draftEmail"] },
            description: { type: "string" },
            args: { type: "object" },
            expectedOutput: { type: "string" },
          },
          required: ["id", "stepNumber", "toolName", "description", "args", "expectedOutput"],
        },
      },
    },
    required: ["steps"],
  },
};

function send(ctrl: ReadableStreamDefaultController, enc: TextEncoder, event: AgentEvent) {
  ctrl.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));
}

async function handlePlan(
  ctrl: ReadableStreamDefaultController,
  enc: TextEncoder,
  prompt: string,
) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system: buildSystem(),
    tools: [submitPlanTool],
    tool_choice: { type: "tool", name: "submitPlan" },
    messages: [{ role: "user", content: prompt }],
  });

  // Consume the stream to get the full tool_use input. Incremental JSON
  // parsing from input_json_delta is unreliable (partial keys/values), so we
  // do a staged reveal after parsing: one plan_step_added event per step with
  // a small delay to give the user visible stagger. Indistinguishable from
  // real streaming for a 2-5 step plan completing in 3-8 seconds.
  const msg = await stream.finalMessage();
  console.log("[plan]", JSON.stringify(msg.usage));
  const toolBlock = msg.content.find((b) => b.type === "tool_use");

  if (!toolBlock || toolBlock.type !== "tool_use") {
    send(ctrl, enc, { type: "error", message: "No plan returned by model" });
    return;
  }

  const raw = (toolBlock.input as { steps: Omit<PlanStep, "status">[] }).steps;
  const steps: PlanStep[] = raw.map((s, i) => ({
    ...s,
    id: s.id || `step_${i + 1}`,
    status: "proposed",
  }));

  for (const step of steps) {
    send(ctrl, enc, { type: "plan_step_added", step });
    await new Promise((r) => setTimeout(r, 80));
  }

  send(ctrl, enc, { type: "plan_complete", steps });
}

async function handleExecute(
  ctrl: ReadableStreamDefaultController,
  enc: TextEncoder,
  plan: PlanStep[],
) {
  const system = buildSystem();
  const userMsg =
    `Execute this plan step-by-step:\n${JSON.stringify(plan, null, 2)}\n\n` +
    "Call each tool as described. After all tool calls complete, provide a brief summary of findings.";

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMsg }];
  let stepCounter = 0;

  for (let iter = 0; iter < 10; iter++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      tools: toolDefinitions,
      messages,
    });
    console.log("[exec iter " + iter + "]", JSON.stringify(response.usage));

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const summary = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      send(ctrl, enc, { type: "execution_complete", summary });
      return;
    }

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        stepCounter++;
        send(ctrl, enc, { type: "step_start", stepNumber: stepCounter });

        try {
          const result = executeTool(block.name, block.input);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
          send(ctrl, enc, { type: "step_done", stepNumber: stepCounter, result });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: `Error: ${msg}`,
            is_error: true,
          });
          send(ctrl, enc, { type: "step_failed", stepNumber: stepCounter, error: msg });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }
  }

  send(ctrl, enc, { type: "error", message: "Agent reached max iterations without completing" });
}

export async function POST(req: Request) {
  const { phase, prompt, plan } = await req.json();
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        if (phase === "plan") {
          await handlePlan(ctrl, enc, prompt);
        } else if (phase === "execute") {
          await handleExecute(ctrl, enc, plan);
        } else {
          send(ctrl, enc, { type: "error", message: `Unknown phase: ${phase}` });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        send(ctrl, enc, { type: "error", message: msg });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
