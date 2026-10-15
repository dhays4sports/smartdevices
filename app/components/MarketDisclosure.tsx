import type { CommercialDisclosure } from "../lib/market/contract";

export function MarketDisclosure({ disclosure }: { disclosure: CommercialDisclosure }) {
  return (
    <aside className="market-disclosure" aria-label="Sponsored provider disclosure">
      <strong>Sponsored provider</strong>
      <p>{disclosure.message}</p>
    </aside>
  );
}
