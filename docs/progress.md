# Progress

Source of truth for what's built, in flight, and next. Read before touching code, update as you work.

---

## Current Focus

**Day 5** — Citation system: inline citation chips, hover previews, dual-provenance side panel.

---

## In Progress

| Started | Item | Notes |
|---------|------|-------|

---

## Completed

### 2026-05-29 — Day 4

- **Day 5 — Citation system.** `src/lib/citations/types.ts` (Citation type), `src/lib/citations/parse.ts` (splitOnCitations regex), `src/components/citations/CitationChip.tsx` (inline chip + HoverCard preview), `src/components/citations/ProvenancePanel.tsx` (Source + Reasoning dual-section, 156 lines), `src/components/citations/SidePanel.tsx` (controlled Sheet, no remount on citation swap), `src/components/markdown/SummaryMarkdown.tsx` (react-markdown + citation injection), `/api/leases/[id]` GET route. Updated route.ts (citation instruction after cached block), agent-client.ts (stepResults store), page.tsx (activeCitation state, SidePanel, SummaryMarkdown). Branch: `day-5-citations`. `tsc --noEmit` clean, build passes. Citation compliance: 7 citations in Q1 scenario summary (all 6 leases cited, lease_014 appears twice). Browser verification needed: hover preview, side panel toggle, swap-without-remount animation.
- **Day 4 polish.** AbortController in useAgent (abort on chip switch + reset); staged `plan_step_added` events replace raw `plan_delta` (80ms stagger, cards appear one at a time, "Approve & run" gated until `plan_complete`). Cache confirmed: call 1 `creation=37552 read=0`; call 2 `creation=41 read=37552`; calls 3-4 `creation=0 read=37552+`. `tsc --noEmit` clean.
- **Day 4 — Anthropic API tool-use loop.** `src/lib/agent-types.ts` (AgentEvent + AgentState), `src/lib/tools/index.ts` (searchLeases, extractClause, compareTerms, draftEmail + Anthropic schemas), `src/app/api/agent/route.ts` (SSE route, Phase 1 streaming plan, Phase 2 agentic execution loop), `src/lib/agent-client.ts` (useAgent hook), updated PlanCard (running/done/failed states), ActionBar (Approve & run enabled), page.tsx (mock replaced with useAgent). `tsc --noEmit` clean, build passes. Verified via curl: Phase 1 streams plan_delta tokens and emits plan_complete; Phase 2 emits step_start/step_done per tool call and execution_complete with summary; step_failed fires correctly on tool error. Prompt cache: `cache_control: {type: "ephemeral"}` on lease dataset block. Decision: `plan_delta.partial` typed as `string` (raw JSON accumulation) rather than `Partial<PlanStep>[]` — avoids streaming JSON parser dep; client shows spinner during planning.

### 2026-05-29 — Day 3

- **Day 3 — Plan-card UI.** `src/lib/plan-types.ts` (PlanStep types), `src/data/mock-plan.ts` (4-step hardcoded plan + 3 scenario prompts), `src/components/plan/PlanCard.tsx` (compact/expand, drag handle, kebab menu, status badge), `src/components/plan/PlanList.tsx` (dnd-kit sortable), `src/components/plan/PromptInput.tsx` (auto-grow textarea + chips), `src/components/plan/ActionBar.tsx` (sticky footer). `page.tsx` replaced with full demo. `tsc --noEmit` clean, production build passes.
- **Day 3 polish.** Fixed truncation (description gets `flex-1 min-w-0`, tool name gets `shrink-0`). Step circle: `text-foreground/70`. Textarea: `bg-card`, `border-border/60`, border-emphasis focus (no ring). Chips: active uses `bg-accent`. Empty state in PlanList for scenarios 2/3. Popover z-index confirmed OK (portal already in place). `tsc --noEmit` clean.

### 2026-05-29 — Day 2

- **Day 2 — 50-lease fake CRE dataset.** `src/data/leases.json` (50 leases, 58 docs, 183 clauses), `src/lib/leases.ts` (Lease type + getLeases()), `scripts/verify-leases.ts`. All 21 assertions pass: 8 Q1 2026 expirations (6 with coi.onFile=false), 6 Whole Foods / 4 Target / 3 CVS anchors with correct escalation mix, 5 co-tenancy at_risk/violated with real cross-references. `tsc --noEmit` clean.
- **Prose cleanup — co-tenancy clauses.** Removed meta-leaky status declarations ("Co-Tenancy status: at_risk", "classified as: at_risk") from 6 clauses across 5 leases (lease_019–023 + one Whole Foods satisfied clause). Status now implied by narrative only. All 21 verify assertions still pass.

### 2026-05-29

- **Day 1 — Scaffold.** Next.js 15 + TS + Tailwind v4 + Shadcn (Radix, Nova, CSS vars). Warm dark palette (oklch 0.22/0.97, hue 110) in `.dark`. Component baseline: button, card, dialog, popover, hover-card, scroll-area, separator, badge, sheet, tooltip, skeleton, input, textarea. Runtime deps: `@anthropic-ai/sdk`, `lucide-react`, `zod`, `nanoid`. Dark mode verified after debug (see learnings.md).
- **Repo + deploy.** First commit. Vercel linked, staging preview live. Custom domain deferred to Day 13.

---

## Backlog

| Day | Item |
|-----|------|
| ~~2~~ | ~~50-lease JSON dataset~~ — ✅ done |
| ~~3~~ | ~~Plan-card UI~~ — ✅ done |
| ~~4~~ | ~~Anthropic API tool use~~ — ✅ done |
| ~~5~~ | ~~Citation system~~ — ✅ done |
| 5-stretch | Add REA + standalone COI doc types to leases.json for visual variety — not a functional unlock, all 3 demo scenarios work without them |
| 6 | Doc-jump — click citation opens lease at exact clause in side panel, highlighted |
| 7 | Polish citations, hover states, keyboard nav. Buffer day. |
| 8 | Trust budget meter — scope indicator + explicit approval gate on send actions |
| 9 | Diff-style intervention UI for proposed drafts and field updates |
| 10 | Verify 3 demo scenarios end-to-end. Add "Try this" suggestion chips. |
| 11 | Record 90-sec Loom walkthrough |
| 12 | Write ~600-word post: *Extending Prismera's citation pattern to agentic workflows* |
| 13 | Custom domain, OG image, favicon, meta, mobile QA |
| 14 | Outreach — DM founder on LinkedIn, post on X, submit application |

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-29 | Radix as Shadcn primitive | Aligned with primary docs/community; no migration cost for 2-week build |
| 2026-05-29 | Dark mode only, no toggle | Mirrors Prismera's dark-first aesthetic; half the tokens to maintain |
| 2026-05-29 | Real Anthropic API tool use, not mocked | Founder will notice fake streaming. Authenticity is the point. |
| 2026-05-29 | Compact-by-default cards with click-to-expand | Keeps the plan scannable at a glance; args/expected output are detail that don't need to be always visible. Expand is CSS max-height+opacity, no framer-motion. |
| 2026-05-29 | @dnd-kit/utilities not installed (inline CSS.Transform) | Spec said only install core+sortable. Utilities is a separate peer dep; inlined the transform string (`translate3d(x,y,0) scaleX scaleY`) instead. |
| 2026-05-29 | plan_delta.partial typed as string, not Partial<PlanStep>[] | Streaming JSON parsing without a new dep requires complex implementation. Client shows "Planning…" spinner; full cards render on plan_complete. Streaming feel is in Phase 2 card flips. |
| 2026-05-29 | Phase 2 execution uses non-streaming client.messages.create | Each tool-call round-trip is a separate API call. Step-by-step SSE events (step_start/step_done) provide visible streaming feel without streaming the Claude response itself. |

---

## Milestones

- [x] **M1 — Foundation (Day 1)** — 2026-05-29 ✅
- [ ] **M2 — Agent loop + citations (Day 7)** — target 2026-06-04
- [ ] **M3 — Demo + writeup + outreach (Day 14)** — target 2026-06-11
