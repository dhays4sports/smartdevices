import type { Metadata } from "next";
import { MyPlans } from "@/app/components/MyPlans";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = { title: "My Smart Safety Plans", description: "Return to Smart Safety Plans saved on this device.", robots: { index: false, follow: false } };

export default function MyPlanPage() {
  return <><SiteHeader /><main className="my-plan-page"><MyPlans /></main><SiteFooter /></>;
}
