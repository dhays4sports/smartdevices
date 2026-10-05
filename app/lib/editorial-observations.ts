import content from '@/content/editorial-observations.json';

export type EditorialObservation = {
  id: string;
  productId: string;
  context: 'retail' | 'farmers-bundle' | 'subscription' | 'accessory-safety';
  status: 'active' | 'conflict' | 'unresolved' | 'suppressed';
  title: string;
  value: string | null;
  alternatives?: string[];
  observedOn: string;
  reviewDueDate: string;
  limitations: string[];
  sources: Array<{ title: string; url: string }>;
};

export function observationsForProduct(productId: string, today = new Date().toISOString().slice(0, 10)): EditorialObservation[] {
  return (content.observations as EditorialObservation[]).filter(o => o.productId === productId).map((o): EditorialObservation => {
    if (o.status === 'active' && (o.reviewDueDate < today || o.observedOn > today)) return { ...o, status: 'suppressed', value: null };
    if (o.status !== 'active') return { ...o, value: null };
    return o;
  });
}
