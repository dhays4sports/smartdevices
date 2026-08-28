"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/devices", label: "Devices" },
  { href: "/insurance", label: "Insurance guidance" },
  { href: "/plans/demo?domain=home&concern=water&items=moen-flo-shutoff,ting-sensor-service", label: "Example plan" },
  { href: "/pro", label: "For agents" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="SmartDevices.com home">
        <span className="brand-mark" aria-hidden="true">SD</span>
        <span>SmartDevices.com</span>
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
        <Link className="nav-pro" href="/pro/workspace" onClick={() => setOpen(false)}>Open Pro</Link>
      </nav>
    </header>
  );
}
