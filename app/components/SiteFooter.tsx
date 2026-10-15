import Link from "next/link";
import { SmartDevicesLogo } from "./SmartDevicesLogo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">The Future Has An Address.</p>
        <Link className="footer-brand" href="/" aria-label="SmartDevices.com home">
          <SmartDevicesLogo className="brand-lockup-footer" />
        </Link>
      </div>
      <div className="footer-links" aria-label="Footer navigation">
        <Link href="/index">Index</Link>
        <Link href="/research">Research</Link>
        <Link href="/partners">Partners</Link>
        <Link href="/disclosures">Disclosures</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/accessibility">Accessibility</Link>
      </div>
      <p className="footer-legal">Independent device education. Not insurance, safety, legal, or medical advice. Product and program details can change.</p>
    </footer>
  );
}
