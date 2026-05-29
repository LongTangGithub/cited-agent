import type Anthropic from "@anthropic-ai/sdk";
import { getLeases } from "@/lib/leases";

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc, key) => {
    if (acc !== null && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// ── Tool implementations ──────────────────────────────────────────────────────

export function searchLeases(input: { filter: Record<string, unknown> }) {
  const { filter } = input;
  return getLeases()
    .filter((lease) => {
      if (filter["term.expiration.gte"]) {
        if (new Date(lease.term.expiration) < new Date(filter["term.expiration.gte"] as string))
          return false;
      }
      if (filter["term.expiration.lte"]) {
        if (new Date(lease.term.expiration) > new Date(filter["term.expiration.lte"] as string))
          return false;
      }
      if (filter["coi.onFile"] !== undefined) {
        if (lease.coi.onFile !== filter["coi.onFile"]) return false;
      }
      if (filter["property.anchorTenant"]) {
        if (lease.property.anchorTenant !== filter["property.anchorTenant"]) return false;
      }
      if (filter["cotenancy.status"]) {
        if (lease.cotenancy.status !== filter["cotenancy.status"]) return false;
      }
      return true;
    })
    .map((l) => ({
      id: l.id,
      tenantName: l.tenant.name,
      propertyName: l.property.name,
      expiration: l.term.expiration,
      coiOnFile: l.coi.onFile,
      anchorTenant: l.property.anchorTenant,
    }));
}

export function extractClause(input: { leaseIds: string[]; clauseHeading: string }) {
  const { leaseIds, clauseHeading } = input;
  const heading = clauseHeading.toLowerCase();
  const results: {
    leaseId: string;
    docId: string;
    clauseId: string;
    section: string;
    heading: string;
    text: string;
  }[] = [];

  for (const leaseId of leaseIds) {
    const lease = getLeases().find((l) => l.id === leaseId);
    if (!lease) continue;
    for (const doc of lease.documents) {
      for (const clause of doc.clauses) {
        if (clause.heading.toLowerCase().includes(heading)) {
          results.push({
            leaseId,
            docId: doc.id,
            clauseId: clause.id,
            section: clause.section,
            heading: clause.heading,
            text: clause.text,
          });
        }
      }
    }
  }
  return results;
}

export function compareTerms(input: { leaseIds: string[]; field: string }) {
  const { leaseIds, field } = input;
  return leaseIds.map((leaseId) => {
    const lease = getLeases().find((l) => l.id === leaseId);
    return {
      leaseId,
      tenantName: lease?.tenant.name ?? "Unknown",
      fieldValue: lease ? resolvePath(lease, field) : null,
    };
  });
}

export function draftEmail(input: { leaseId: string; template: string }) {
  const { leaseId, template } = input;
  const lease = getLeases().find((l) => l.id === leaseId);
  if (!lease) throw new Error(`Lease ${leaseId} not found`);

  const t = lease.tenant.name;
  const p = lease.property.name;
  const exp = lease.term.expiration;
  const cov = lease.coi.requiredCoverage.toLocaleString();

  const templates: Record<string, { subject: string; body: string }> = {
    coi_missing_outreach: {
      subject: `Certificate of Insurance Required — ${p}`,
      body: `Dear ${t},\n\nOur records indicate that the Certificate of Insurance required under your lease at ${p} (expiring ${exp}) is missing or expired.\n\nPlease provide an updated COI showing minimum coverage of $${cov} naming the landlord as additional insured, no later than 30 days from this notice.\n\nBest regards,\n[Landlord Representative]`,
    },
    renewal_inquiry: {
      subject: `Lease Renewal Notice — ${p}`,
      body: `Dear ${t},\n\nYour lease at ${p} expires on ${exp}. You have ${lease.term.renewalOptions} renewal option(s) remaining under the current terms. Please advise of your intentions no later than 180 days prior to expiration.\n\nBest regards,\n[Landlord Representative]`,
    },
    cotenancy_risk_notice: {
      subject: `Co-Tenancy Condition Notice — ${p}`,
      body: `Dear ${t},\n\nPursuant to Section 7 of your lease at ${p}, we are notifying you of a potential change in the co-tenancy condition at the Shopping Center. We will keep you informed of any material changes as required under the lease.\n\nBest regards,\n[Landlord Representative]`,
    },
  };

  const tmpl = templates[template];
  if (!tmpl) throw new Error(`Unknown template: ${template}`);
  return { leaseId, subject: tmpl.subject, body: tmpl.body };
}

export function executeTool(name: string, input: unknown): unknown {
  switch (name) {
    case "searchLeases":
      return searchLeases(input as { filter: Record<string, unknown> });
    case "extractClause":
      return extractClause(input as { leaseIds: string[]; clauseHeading: string });
    case "compareTerms":
      return compareTerms(input as { leaseIds: string[]; field: string });
    case "draftEmail":
      return draftEmail(input as { leaseId: string; template: string });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── Tool definitions for Anthropic API ───────────────────────────────────────

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "searchLeases",
    description: "Search leases by filter criteria. Returns compact lease summaries.",
    input_schema: {
      type: "object",
      properties: {
        filter: {
          type: "object",
          description: "Dotted-path filter fields",
          properties: {
            "term.expiration.gte": { type: "string", description: "ISO date lower bound (inclusive)" },
            "term.expiration.lte": { type: "string", description: "ISO date upper bound (inclusive)" },
            "coi.onFile": { type: "boolean" },
            "property.anchorTenant": { type: "string", enum: ["Whole Foods", "Target", "CVS"] },
            "cotenancy.status": { type: "string", enum: ["satisfied", "at_risk", "violated"] },
          },
        },
      },
      required: ["filter"],
    },
  },
  {
    name: "extractClause",
    description: "Extract clause text from lease documents by heading (case-insensitive partial match). Returns docId and clauseId for citations.",
    input_schema: {
      type: "object",
      properties: {
        leaseIds: { type: "array", items: { type: "string" } },
        clauseHeading: { type: "string", description: "Heading to match, e.g. 'Notices', 'Base Rent'" },
      },
      required: ["leaseIds", "clauseHeading"],
    },
  },
  {
    name: "compareTerms",
    description: "Compare a specific field across multiple leases using dotted path (e.g. rent.escalationType).",
    input_schema: {
      type: "object",
      properties: {
        leaseIds: { type: "array", items: { type: "string" } },
        field: { type: "string", description: "Dotted path into lease object, e.g. rent.escalationType" },
      },
      required: ["leaseIds", "field"],
    },
  },
  {
    name: "draftEmail",
    description: "Generate a tenant outreach email using a deterministic template.",
    input_schema: {
      type: "object",
      properties: {
        leaseId: { type: "string" },
        template: {
          type: "string",
          enum: ["coi_missing_outreach", "renewal_inquiry", "cotenancy_risk_notice"],
        },
      },
      required: ["leaseId", "template"],
    },
  },
];
