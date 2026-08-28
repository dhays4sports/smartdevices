import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="footer-kicker">The Future Has An Address.</p>
        <p className="footer-domain">SmartDevices.com</p>
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

