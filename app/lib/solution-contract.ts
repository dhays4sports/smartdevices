export type SolutionType =
  | "commercial"
  | "carrier-required"
  | "carrier-compatible"
  | "diy"
  | "smartdevices-build"
  | "professional-install";

export type InsuranceStatus =
  | "required"
  | "qualifying"
  | "potentially-qualifying"
  | "informational-only"
  | "not-applicable"
  | "needs-verification";

export type SolutionBoundary = {
  solutionType: SolutionType;
  insuranceStatus: InsuranceStatus;
  source: "catalog" | "carrier-program" | "builder" | "professional";
  note: string;
};

export const customBuildBoundary: SolutionBoundary = {
  solutionType: "smartdevices-build",
  insuranceStatus: "informational-only",
  source: "builder",
  note: "A custom SmartDevices build is a technical prototype path. It does not establish insurer acceptance, eligibility, a discount, or compliance with a carrier requirement.",
};
