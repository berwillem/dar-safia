/**
 * ══════════════════════════════════════════════════════════════
 *   MATIÈRES ET SIGNATURES DE LA MAISON — DÉRIVÉES DU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Rien n'est écrit à la main ici : ni une liste d'ingrédients « emblématiques »,
 * ni une sélection de parfums « à la une » différente de `featured`. Tout est
 * calculé sur le catalogue réel, via `catalog` — donc valable aussi bien sur
 * les données statiques que sur Strapi.
 */

import { catalog, lowestPrice, type FragranceFamily } from '@/lib/catalog';

/** Une matière et le nombre de créations qui la portent. */
export interface SignatureNote {
  slug: string;
  name: string;
  count: number;
}

/** Un parfum tel qu'affiché dans la séquence des signatures (forme réduite). */
export interface SignatureProduct {
  slug: string;
  name: string;
  brand: string;
  family: FragranceFamily;
  image: { url: string; srcset: string | null; alt: string } | null;
  priceFrom: number;
}

/**
 * Les matières qui reviennent le plus souvent dans la pyramide des parfums.
 * Une note n'est comptée qu'une fois par parfum, quel que soit son étage.
 */
export async function getSignatureNotes(limit = 12): Promise<SignatureNote[]> {
  const { items } = await catalog.listProducts();

  const freq = new Map<string, { name: string; count: number }>();
  for (const product of items) {
    const counted = new Set<string>();
    for (const { note } of product.notes) {
      if (counted.has(note.slug)) continue;
      counted.add(note.slug);
      const current = freq.get(note.slug);
      if (current) current.count += 1;
      else freq.set(note.slug, { name: note.name, count: 1 });
    }
  }

  return [...freq.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
    .slice(0, limit);
}

/**
 * Les parfums mis en avant, réduits à ce dont la séquence a besoin.
 * L'ordre suit `sort` (prix décroissant : on ouvre sur la pièce la plus rare).
 */
export async function getSignatureProducts(): Promise<SignatureProduct[]> {
  const { items } = await catalog.listProducts({
    featured: true,
    sort: 'price-desc',
  });

  return items.map((product) => {
    const image = product.images[0] ?? null;
    return {
      slug: product.slug,
      name: product.name,
      brand: product.brand.name,
      family: product.family,
      image: image
        ? { url: image.url, srcset: image.srcset, alt: image.alt }
        : null,
      priceFrom: lowestPrice(product),
    };
  });
}
