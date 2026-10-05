import { observationsForProduct } from '@/app/lib/editorial-observations';

export function EditorialObservations({ productId }: { productId: string }) {
  const observations = observationsForProduct(productId);
  if (!observations.length) return null;
  return <section className="detail-grid" aria-label="Reviewed product observations">
    {observations.map(o => <article key={o.id}>
      <h2>{o.title}</h2>
      <p>{o.status === 'active' ? o.value : o.status === 'conflict' ? 'Conflicting source statements. Confirm the requirement with the provider; SmartDevices has not selected a definitive value.' : 'A current supported statement is unavailable. This observation is withheld.'}</p>
      {o.status === 'conflict' && o.alternatives ? <ul>{o.alternatives.map(a => <li key={a}>{a}</li>)}</ul> : null}
      <ul>{o.limitations.map(l => <li key={l}>{l}</li>)}</ul>
      <p>Observed {o.observedOn} · Review due {o.reviewDueDate} · {o.status}</p>
      <ul>{o.sources.filter(s => /^https:\/\//.test(s.url)).map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul>
    </article>)}
  </section>;
}
