import { getCategoryGuide } from "@/app/lib/category-guidance";
import type { CarrierCategory } from "@/app/lib/carrier";

export function CarrierClassGuide({ category }: { category: CarrierCategory }) {
  const guide = getCategoryGuide(category);
  return <section className="carrier-class-guide" aria-labelledby={`class-guide-${category}`}><div><p className="eyebrow">Capability guide · class level</p><h2 id={`class-guide-${category}`}>{guide.title}</h2><p>{guide.summary}</p></div><div className="carrier-guide-grid"><article><h3>Do not treat these as equivalent</h3><ul>{guide.distinctions.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>Questions that change the answer</h3><ul>{guide.questions.map((item) => <li key={item}>{item}</li>)}</ul></article><article><h3>Safety and evidence boundaries</h3><ul>{guide.boundaries.map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>;
}
