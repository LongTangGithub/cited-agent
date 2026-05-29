# Learnings

Read at start of every task. Follow every rule.

---

## Workflow

- **(2026-05-29)** After any `shadcn init` (including re-runs), verify `layout.tsx` and `globals.css` weren't reset.
- **(2026-05-29)** Commit after each day: `Day N: <summary>`. Push from Day 1 — repo is part of the artifact.

## Tailwind v4 + Shadcn

- **(2026-05-29)** `globals.css` line 1 must be `@import "tailwindcss";`. Without it, zero utilities generated.
- **(2026-05-29)** `@theme inline { --color-background: var(--background); ... }` is required. Without it, `bg-background` compiles to nothing — Tailwind v4 reads `--color-*` namespace, not raw CSS vars.
- **(2026-05-29)** Use semantic classes only (`bg-background`, `text-foreground`). Never hardcode `bg-white` / `text-black` — bypasses token system.

## Design

- **(2026-05-29)** Warm dark palette needs non-zero chroma on neutral tokens. `oklch(0.22 0.004 110)` reads as deliberate brand; `oklch(0.22 0 0)` reads as Shadcn template.

## Fake Data / Demo Realism

- **(2026-05-29)** When deferring work, state the real reason: does the demo scenario require it? Don't cite implementation disruption (e.g. "disturbs existing IDs") when that's overblown — appending new IDs never disturbs existing ones. The honest question is whether the feature unlocks a scenario or just adds visual variety.
- **(2026-05-29)** Never embed JSON field values as prose in fake documents. "Co-Tenancy status: at_risk" inside a clause text is a meta-leak — a CRE reader will notice. Let narrative carry the status: describe the factual situation (anchor announced closure, no renewal committed) and let the reader infer the implication. Same rule applies to any field that mirrors real-world judgment (credit ratings, risk flags, condition codes).
