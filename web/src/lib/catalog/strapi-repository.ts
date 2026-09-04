/**
 * ══════════════════════════════════════════════════════════════
 *   IMPLÉMENTATION STRAPI DU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Même interface que l'implémentation statique. On bascule dans index.ts via
 * CATALOG_SOURCE=strapi.
 *
 * Stratégie : charger TOUT le catalogue en une requête (populate profond),
 * mapper vers le domaine, puis déléguer le filtrage/tri/recherche à la
 * logique partagée (query.ts). Le comportement est donc identique à celui de
 * l'implémentation statique — les mêmes tests valident les deux.
 *
 * 45 parfums : un seul appel HTTP, mis en cache par Next (revalidate). Pas de
 * pagination Strapi à gérer, pas de N+1.
 */

import qs from 'qs';

import { queryProducts, relatedProducts } from './query';
import { mapCollection, mapProduct } from './strapi-mapper';
import type {
  StrapiCollection,
  StrapiProduct,
  StrapiResponse,
} from './strapi-types';
import type {
  Brand,
  CatalogRepository,
  Collection,
  Paginated,
  Product,
  ProductQuery,
} from './types';

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

/** Durée de cache Next, en secondes. Surchargée par STRAPI_REVALIDATE. */
const REVALIDATE = Number(process.env.STRAPI_REVALIDATE ?? 300);

/** Populate profond des parfums. */
const PRODUCT_POPULATE = {
  brand: { populate: ['logo'] },
  notes: { populate: { note: { populate: ['image'] } } },
  variants: { populate: ['price', 'compareAtPrice'] },
  images: true,
  video: true,
  seo: { populate: ['ogImage'] },
} as const;

const COLLECTION_POPULATE = {
  heroMedia: true,
  seo: { populate: ['ogImage'] },
} as const;

function buildQuery(params: Record<string, unknown>): string {
  return qs.stringify(params, { encodeValuesOnly: true });
}

async function strapiFetch<T>(path: string): Promise<T | null> {
  const url = `${STRAPI_URL.replace(/\/$/, '')}/api/${path}`;
  try {
    const res = await fetch(url, {
      headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
      next: { revalidate: REVALIDATE, tags: ['catalog'] },
    });
    if (!res.ok) {
      console.error(`[Strapi] ${res.status} ${res.statusText} sur ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[Strapi] échec de la requête ${path}`, error);
    return null;
  }
}

// ── Cache mémoire par rendu ────────────────────────────────────
// Next met déjà `fetch` en cache ; ce cache-ci évite en plus de re-mapper les
// 45 produits à chaque méthode appelée dans un même rendu.

let productsPromise: Promise<Product[]> | null = null;

function loadProducts(): Promise<Product[]> {
  if (!productsPromise) {
    const query = buildQuery({
      pagination: { pageSize: 100 },
      populate: PRODUCT_POPULATE,
    });
    productsPromise = strapiFetch<StrapiResponse<StrapiProduct[]>>(
      `products?${query}`
    ).then((response) => {
      if (!response?.data) return [];
      return response.data
        .map((entry) => mapProduct(entry, STRAPI_URL))
        .filter((p): p is Product => p !== null);
    });
  }
  return productsPromise;
}

/** À appeler après une revalidation pour forcer un rechargement. */
export function resetStrapiCache(): void {
  productsPromise = null;
}

/** Slugs des parfums membres d'une collection donnée. */
async function collectionProductSlugs(slug: string): Promise<Set<string>> {
  const query = buildQuery({
    filters: { slug: { $eq: slug } },
    populate: { products: { fields: ['slug'] } },
  });
  const response = await strapiFetch<StrapiResponse<StrapiCollection[]>>(
    `collections?${query}`
  );
  const products = response?.data?.[0]?.products ?? [];
  return new Set(
    products.map((p) => p.slug).filter((s): s is string => typeof s === 'string')
  );
}

// ── Repository ─────────────────────────────────────────────────

export const strapiCatalogRepository: CatalogRepository = {
  async listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const all = await loadProducts();

    if (query.collectionSlug) {
      const slugs = await collectionProductSlugs(query.collectionSlug);
      const { collectionSlug: _drop, ...rest } = query;
      void _drop;
      return queryProducts(all.filter((p) => slugs.has(p.slug)), rest);
    }

    return queryProducts(all, query);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await loadProducts();
    return all.find((p) => p.slug === slug) ?? null;
  },

  async getRelatedProducts(slug: string, limit = 3): Promise<Product[]> {
    const all = await loadProducts();
    return relatedProducts(all, slug, limit);
  },

  async listBrands(): Promise<Brand[]> {
    const all = await loadProducts();
    const bySlug = new Map<string, Brand>();
    for (const product of all) {
      if (!bySlug.has(product.brand.slug)) {
        bySlug.set(product.brand.slug, product.brand);
      }
    }
    return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  },

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    const brands = await this.listBrands();
    return brands.find((b) => b.slug === slug) ?? null;
  },

  async listCollections(): Promise<Collection[]> {
    const query = buildQuery({ populate: COLLECTION_POPULATE });
    const response = await strapiFetch<StrapiResponse<StrapiCollection[]>>(
      `collections?${query}`
    );
    if (!response?.data) return [];
    return response.data
      .map((entry) => mapCollection(entry, STRAPI_URL))
      .filter((c): c is Collection => c !== null);
  },

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    const query = buildQuery({
      filters: { slug: { $eq: slug } },
      populate: COLLECTION_POPULATE,
    });
    const response = await strapiFetch<StrapiResponse<StrapiCollection[]>>(
      `collections?${query}`
    );
    const entry = response?.data?.[0];
    return entry ? mapCollection(entry, STRAPI_URL) : null;
  },
};
