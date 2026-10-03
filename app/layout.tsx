import { PrivateNavigationGuard } from "./components/PrivateNavigationGuard";
import type { Metadata } from "next";
import "./globals.css";
import "./components/builder.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  metadataBase: new URL("https://smartdevices.com"),
  title: {
    default: "SmartDevices.com — Protect it. Build it.",
    template: "%s · SmartDevices.com",
  },
  description:
    "Independent intelligence for finding, planning and building smart devices for homes, vehicles, families and businesses.",
  openGraph: {
    title: "SmartDevices.com — Protect it. Build it.",
    description: "Explore protection needs, compare source-linked device facts, or turn a physical-device idea into a prototype Build Pack.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "SmartDevices.com device intelligence platform" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><PrivateNavigationGuard /><aside className="hosting-test-banner"><strong>Isolated persistence test</strong> · Use synthetic project data only. Builder saves are enabled; live devices, payments and external services are disabled.</aside>{children}</body>
    </html>
  );
}
