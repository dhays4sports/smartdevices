"use client";

import Link from "next/link";
import { useState } from "react";
import { SmartDevicesLogo } from "./SmartDevicesLogo";

const links = [
  { href: "/devices", label: "Discover" },
  { href: "/connect", label: "Connect" },
  { href: "/build", label: "Create" },
  { href: "/#protection-entry", label: "Protect" },
  { href: "/insurance", label: "Insurance" },
  { href: "/my-plan", label: "My Plan" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SmartDevices.com home">
        <SmartDevicesLogo />
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav id="primary-nav" className={open ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link className="nav-pro" href="/pro" onClick={() => setOpen(false)}>Agent tools</Link>
      </nav>
    </header>
  );
}
