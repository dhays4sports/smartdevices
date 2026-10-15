import type { Metadata } from "next";
import { DeviceBuilder } from "@/app/components/DeviceBuilder";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getPublishedEvidenceBundle } from "@/app/lib/evidence-store";
import type { DeviceProject } from "@/app/lib/builder-contract";

export const metadata: Metadata = {
  title: "Build an intelligent physical device | SmartDevices",
  description: "Turn a physical-device idea into an intelligent-device architecture, prototype plan, module-first BOM, firmware scaffold, enclosure source, validation report and portable Build Pack — from standalone devices to Mesh-ready physical nodes.",
  alternates: { canonical: "/build" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function BuildPage({ searchParams }: Props) {
  const params = await searchParams;
  const sourceContext: DeviceProject["sourceContext"] = params.source === "farmers" ? "farmers" : params.source === "protection" ? "protection" : "direct";
  const bundle = await getPublishedEvidenceBundle();
  return <><SiteHeader /><main><DeviceBuilder publishedDevices={bundle.catalog} sourceContext={sourceContext} /></main><SiteFooter /></>;
}
