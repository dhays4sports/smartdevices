import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://smartdevices.com"),
  title: {
    default: "SmartDevices.com — Protection, made intelligent",
    template: "%s · SmartDevices.com",
  },
  description:
    "Independent, insurance-aware intelligence for choosing smart devices for homes, vehicles, families, and businesses.",
  openGraph: {
    title: "SmartDevices.com — Protection, made intelligent",
    description: "Explore risks, compare verified device facts, and build a practical Smart Safety Plan.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "SmartDevices.com protection intelligence" }],
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
      <body>{children}</body>
    </html>
  );
}
