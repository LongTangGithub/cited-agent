import leases from "../src/data/leases.json";
import type { Lease } from "../src/lib/leases";

const data = leases as Lease[];

let pass = true;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    pass = false;
  } else {
    console.log(`PASS: ${msg}`);
  }
}

// Scenario 1: Q1 2026 expirations + COI
const q1Leases = data.filter((l) => {
  const exp = new Date(l.term.expiration);
  return exp >= new Date("2026-01-01") && exp <= new Date("2026-03-31");
});

const q1NoCoi = q1Leases.filter((l) => !l.coi.onFile);

assert(data.length === 50, `Total lease count is 50 (got ${data.length})`);
assert(q1Leases.length >= 8, `≥8 Q1 2026 expirations (got ${q1Leases.length})`);
assert(q1NoCoi.length >= 4, `≥4 Q1 2026 expirations with coi.onFile=false (got ${q1NoCoi.length})`);

// Scenario 2: Anchor tenant distribution
const wholeFoods = data.filter((l) => l.property.anchorTenant === "Whole Foods");
const target = data.filter((l) => l.property.anchorTenant === "Target");
const cvs = data.filter((l) => l.property.anchorTenant === "CVS");

assert(wholeFoods.length === 6, `6 Whole Foods anchors (got ${wholeFoods.length})`);
assert(target.length === 4, `4 Target anchors (got ${target.length})`);
assert(cvs.length === 3, `3 CVS anchors (got ${cvs.length})`);

// Whole Foods escalation variety
const wfFixed3 = wholeFoods.filter((l) => l.rent.escalationType === "fixed" && l.rent.escalationRate === 0.03);
const wfFixed25 = wholeFoods.filter((l) => l.rent.escalationType === "fixed" && l.rent.escalationRate === 0.025);
const wfCpi = wholeFoods.filter((l) => l.rent.escalationType === "cpi");
const wfStepped = wholeFoods.filter((l) => l.rent.escalationType === "stepped");
const wfNone = wholeFoods.filter((l) => l.rent.escalationType === "none");

assert(wfFixed3.length === 2, `2 Whole Foods fixed@3% (got ${wfFixed3.length})`);
assert(wfFixed25.length === 1, `1 Whole Foods fixed@2.5% (got ${wfFixed25.length})`);
assert(wfCpi.length === 1, `1 Whole Foods CPI (got ${wfCpi.length})`);
assert(wfStepped.length === 1, `1 Whole Foods stepped (got ${wfStepped.length})`);
assert(wfNone.length === 1, `1 Whole Foods none (got ${wfNone.length})`);

// Scenario 3: Co-tenancy at_risk or violated
const cotenancyRisk = data.filter(
  (l) => l.cotenancy.hasCotenancy && (l.cotenancy.status === "at_risk" || l.cotenancy.status === "violated")
);

assert(
  cotenancyRisk.length >= 5,
  `≥5 leases with co-tenancy at_risk or violated (got ${cotenancyRisk.length})`
);

// Required tenants must appear elsewhere as tenant names or anchor tenants
const allTenantNames = new Set(data.map((l) => l.tenant.name));
const allAnchorNames = new Set<string>(
  data.map((l) => l.property.anchorTenant).filter((a) => a !== null) as string[]
);

for (const lease of cotenancyRisk) {
  for (const req of lease.cotenancy.requiredTenants) {
    const found = allTenantNames.has(req) || allAnchorNames.has(req);
    assert(
      found,
      `Co-tenancy requirement "${req}" in ${lease.id} references a real tenant/anchor in dataset`
    );
  }
}

// Schema sanity: IDs are unique
const ids = data.map((l) => l.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === data.length, `All lease IDs are unique (${uniqueIds.size}/${data.length})`);

const docIds = data.flatMap((l) => l.documents.map((d) => d.id));
const uniqueDocIds = new Set(docIds);
assert(uniqueDocIds.size === docIds.length, `All doc IDs are unique (${uniqueDocIds.size}/${docIds.length})`);

const clauseIds = data.flatMap((l) => l.documents.flatMap((d) => d.clauses.map((c) => c.id)));
const uniqueClauseIds = new Set(clauseIds);
assert(
  uniqueClauseIds.size === clauseIds.length,
  `All clause IDs are unique (${uniqueClauseIds.size}/${clauseIds.length})`
);

console.log(`\n${pass ? "✓ All assertions passed" : "✗ Some assertions FAILED"}`);
process.exit(pass ? 0 : 1);
