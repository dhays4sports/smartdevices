import type { Metadata } from "next";
import { DeviceConnect } from "@/app/components/DeviceConnect";
import { SiteFooter } from "@/app/components/SiteFooter";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export const metadata: Metadata = {
  title: "Connect a device",
  robots: { index: false, follow: false },
  description: "Register a device and declare normalized capabilities without treating registration as verification or authorization.",
};

export default async function ConnectPage() {
  const user = await getChatGPTUser();
  return <><SiteHeader /><main className="page-main"><header className="page-hero"><p className="eyebrow">Connect</p><h1>Bring an intelligent device into SmartDevices.</h1><p>Start with identity and capability metadata. Live connections, ownership claims, verification, durable identity, permissions and agent operation remain separate steps.</p></header><DeviceConnect authenticated={Boolean(user)} /></main><SiteFooter /></>;
}
