# Progress

Source of truth for what's built, in flight, and next. Read before touching code, update as you work.

---

## Current Focus

**Day 2** — Generate 50-lease fake CRE dataset (JSON in `/data`) supporting three demo scenarios:
- Q1 2026 expirations + missing COIs
- Whole Foods-anchored portfolio comparison
- Co-tenancy clauses at risk

---

## In Progress

| Started | Item | Notes |
|---------|------|-------|

---

## Completed

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
| 3 | Plan-card UI — agent's 5-step plan as inspectable/reorderable cards (dnd-kit) |
| 4 | Anthropic API tool use — `searchLeases`, `extractClause`, `compareTerms`, `draftEmail`. Streaming. |
| 5 | Citation system — dual citations (source doc + reasoning step) with hover previews |
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

---

## Milestones

- [x] **M1 — Foundation (Day 1)** — 2026-05-29 ✅
- [ ] **M2 — Agent loop + citations (Day 7)** — target 2026-06-04
- [ ] **M3 — Demo + writeup + outreach (Day 14)** — target 2026-06-11
