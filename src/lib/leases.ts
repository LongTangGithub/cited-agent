import leasesData from "@/data/leases.json";

export type EscalationType = "fixed" | "cpi" | "stepped" | "none";
export type CotenancyStatus = "satisfied" | "at_risk" | "violated";
export type DocumentType = "lease" | "amendment" | "rea" | "coi";
export type AnchorTenant = "Whole Foods" | "Target" | "CVS" | null;

export type Clause = {
  id: string;
  section: string;
  heading: string;
  text: string;
};

export type LeaseDocument = {
  id: string;
  type: DocumentType;
  title: string;
  pageCount: number;
  clauses: Clause[];
};

export type Lease = {
  id: string;
  property: {
    name: string;
    address: string;
    anchorTenant: AnchorTenant;
  };
  tenant: {
    name: string;
    industry: string;
    creditRating?: string;
  };
  term: {
    commencement: string;
    expiration: string;
    renewalOptions: number;
  };
  rent: {
    baseRentPsf: number;
    escalationType: EscalationType;
    escalationRate?: number;
  };
  cotenancy: {
    hasCotenancy: boolean;
    requiredTenants: string[];
    status: CotenancyStatus;
  };
  coi: {
    onFile: boolean;
    expirationDate: string | null;
    requiredCoverage: number;
  };
  documents: LeaseDocument[];
};

export function getLeases(): Lease[] {
  return leasesData as Lease[];
}
