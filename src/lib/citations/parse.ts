import type { Citation } from "./types";

// Matches [lease_XXX], [lease_XXX#clause_YYY], [lease_XXX#clause_YYY@step_N]
export const CITATION_RE = /\[(lease_\d+)(?:#(clause_\d+))?(?:@(step_\d+))?\]/g;

export function splitOnCitations(text: string): (string | Citation)[] {
  const parts: (string | Citation)[] = [];
  let last = 0;
  CITATION_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CITATION_RE.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ leaseId: m[1], clauseId: m[2], stepId: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
