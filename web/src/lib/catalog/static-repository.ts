/**
 * ══════════════════════════════════════════════════════════════
 *   IMPLÉMENTATION STATIQUE DU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Sert les 45 parfums depuis les JSON produits par scripts/migrate-catalog.mjs.
 *
 * En phase 3, une StrapiCatalogRepository implémentera la MÊME interface et
 * remplacera celle-ci dans index.ts. Aucun composant ne changera — c'est tout
 * l'intérêt de la couture.
 *
 * L'interface est asynchrone alors que ces données sont locales : c'est
 * volontaire. Une interface synchrone aujourd'hui obligerait à réécrire tous
 * les appelants le jour où la source devient distante.
 */

import brandsJson from '@/data/brands.json';
import notesJson from '@/data/notes.json';
import productsJson from '@/data/products.json';

import type {
  Brand,
  CatalogRepository,
  Collection,
  FragranceNote,
  Paginated,
  Product,
  ProductNote,
  ProductQuery,
} from './types';
import type { WireBrand, WireNote, WireProduct } from './wire';

const wireProducts = productsJson as WireProduct[];
const wireBrands = brandsJson as WireBrand[];
const wireNotes = notesJson as WireNote[];

// ── Index de résolution ────────────────────────────────────────

const brandBySlug = new Map<string, Brand>(
  wireBrands.map((b) => [b.slug, { ...b } satisfies Brand])
);

const noteBySlug = new Map<string, FragranceNote>(
  wireNotes.map((n) => [n.slug, { ...n } satisfies FragranceNote])
);

/**
 * Hydrate un produit stocké en produit de domaine : les références de marque
 * et de notes deviennent les objets correspondants.
 *
 * Une référence orpheline est ignorée plutôt que de faire échouer la page :
 * une fois les données dans un CMS, une note supprimée ne doit pas mettre
 * toute une fiche produit hors service.
 */
function hydrate(wire: WireProduct): Product {
  const brand = brandBySlug.get(wire.brandSlug);
  if (!brand) {
    throw new Error(
      `Marque introuvable « ${wire.brandSlug} » pour le parfum « ${wire.slug} ». ` +
        `Relancer: node scripts/migrate-catalog.mjs`
    );
  }

  const notes: ProductNote[] = wire.notes.flatMap((ref) => {
    const note = noteBySlug.get(ref.noteSlug);
    if (!note) return [];
    return [{ note, layer: ref.layer, position: ref.position }];
  });

  return {
    ...wire,
    brand,
    notes,
    variants: wire.variants.map((v) => ({
      ...v,
      // Le domaine exige un nombre ; les formats sans contenance lisible
      // (coffrets) sont ramenés à 0 et filtrables comme tels.
      volumeMl: v.volumeMl ?? 0,
    })),
    longevityHours: wire.longevityHours ?? undefined,
  };
}

const allProducts: Product[] = wireProducts.map(hydrate);
const productBySlug = new Map(allProducts.map((p) => [p.slug, p]));

// ── Recherche et tri ───────────────────────────────────────────

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
      return sorted.sort(
        (a, b) => Number(b.newArrival) - Number(a.newArrival)
      );
    default:
      return sorted;
  }
}

// ── Repository ─────────────────────────────────────────────────

export const staticCatalogRepository: CatalogRepository = {
  async listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    let items = allProducts;

    if (query.gender) items = items.filter((p) => p.gender === query.gender);
    if (query.family) {
      items = items.filter(
        (p) =>
          p.family === query.family ||
          p.secondaryFamilies.includes(query.family!)
      );
    }
    if (query.brandSlug) items = items.filter((p) => p.brand.slug === query.brandSlug);
    if (query.featured !== undefined) items = items.filter((p) => p.featured === query.featured);
    if (query.search) items = items.filter((p) => matchesSearch(p, query.search!));

    const total = items.length;
    items = applySort(items, query.sort);

    const offset = query.offset ?? 0;
    const limit = query.limit ?? total;

    return { items: items.slice(offset, offset + limit), total, offset, limit };
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    return productBySlug.get(slug) ?? null;
  },

  async getRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
    const product = productBySlug.get(slug);
    if (!product) return [];

    // Priorité : même famille ET même genre, puis même marque, puis même famille.
    const score = (candidate: Product): number => {
      let value = 0;
      if (candidate.family === product.family) value += 2;
      if (candidate.gender === product.gender) value += 2;
      if (candidate.brand.slug === product.brand.slug) value += 3;
      if (candidate.secondaryFamilies.includes(product.family)) value += 1;
      return value;
    };

    return allProducts
      .filter((p) => p.slug !== slug)
      .map((p) => ({ product: p, score: score(p) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.product);
  },

  async listBrands(): Promise<Brand[]> {
    return [...brandBySlug.values()];
  },

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    return brandBySlug.get(slug) ?? null;
  },

  // Les collections n'existent pas encore comme entité : elles arriveront
  // avec Strapi (phase 3). On renvoie une liste vide plutôt qu'un jeu de
  // données inventé.
  async listCollections(): Promise<Collection[]> {
    return [];
  },

  async getCollectionBySlug(): Promise<Collection | null> {
    return null;
  },
};
