/**
 * ══════════════════════════════════════════════════════════════
 *   CATALOGUE — LOGIQUE DE REQUÊTE PARTAGÉE
 * ══════════════════════════════════════════════════════════════
 *
 * Filtrage, recherche, tri, pagination et suggestions : fonctions pures sur
 * une liste de `Product` déjà en mémoire.
 *
 * Les deux implémentations du repository (statique et Strapi) chargent la
 * totalité du catalogue — 45 parfums, une requête — puis délèguent ici. Cela
 * garantit un comportement STRICTEMENT identique entre les deux : les tests
 * écrits contre l'implémentation statique valident donc aussi celle de Strapi.
 */

import type { Paginated, Product, ProductQuery } from './types';

/** Prix du format le moins cher — base de tri et d'affichage « à partir de ». */
export function lowestPrice(product: Product): number {
  return Math.min(...product.variants.map((v) => v.price.amount));
}

/** Normalise pour la recherche : minuscules, sans accents. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function matchesSearch(product: Product, term: string): boolean {
  const haystack = normalize(
    [
      product.name,
      product.brand.name,
      product.description,
      product.story ?? '',
      ...product.notes.map((n) => n.note.name),
    ].join(' ')
  );
  // Chaque mot doit apparaître : « dior bois » ne doit pas ramener tout Dior.
  return normalize(term)
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function applySort(products: Product[], sort: ProductQuery['sort']): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => lowestPrice(a) - lowestPrice(b));
    case 'price-desc':
      return sorted.sort((a, b) => lowestPrice(b) - lowestPrice(a));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    case 'rating':
      // Les produits sans avis passent en dernier — jamais devant, faute de note.
      return sorted.sort(
        (a, b) => (b.rating?.average ?? -1) - (a.rating?.average ?? -1)
      );
    case 'newest':
      return sorted.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
    default:
      return sorted;
  }
}

/** Applique une requête complète à la liste fournie. */
export function queryProducts(
  all: Product[],
  query: ProductQuery = {}
): Paginated<Product> {
  let items = all;

  if (query.gender) items = items.filter((p) => p.gender === query.gender);
  if (query.family) {
    items = items.filter(
      (p) =>
        p.family === query.family ||
        p.secondaryFamilies.includes(query.family!)
    );
  }
  if (query.brandSlug) items = items.filter((p) => p.brand.slug === query.brandSlug);
  // `collectionSlug` n'est PAS traité ici : le lien produit -> collection
  // n'est pas porté par le domaine `Product`. Chaque repository le résout
  // lui-même (pré-filtre la liste) avant de déléguer.
  if (query.featured !== undefined) {
    items = items.filter((p) => p.featured === query.featured);
  }
  if (query.search) items = items.filter((p) => matchesSearch(p, query.search!));

  const total = items.length;
  items = applySort(items, query.sort);

  const offset = query.offset ?? 0;
  const limit = query.limit ?? total;

  return { items: items.slice(offset, offset + limit), total, offset, limit };
}

/**
 * Parfums proches d'un parfum donné : même famille, même genre, même marque.
 * Un score pondère chaque critère ; on retourne les mieux classés.
 */
export function relatedProducts(
  all: Product[],
  slug: string,
  limit = 3
): Product[] {
  const product = all.find((p) => p.slug === slug);
  if (!product) return [];

  const score = (candidate: Product): number => {
    let value = 0;
    if (candidate.family === product.family) value += 2;
    if (candidate.gender === product.gender) value += 2;
    if (candidate.brand.slug === product.brand.slug) value += 3;
    if (candidate.secondaryFamilies.includes(product.family)) value += 1;
    return value;
  };

  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({ product: p, score: score(p) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}
