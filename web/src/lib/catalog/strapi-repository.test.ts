import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resetStrapiCache, strapiCatalogRepository } from './strapi-repository';
import type { StrapiProduct } from './strapi-types';

/**
 * Teste le repository Strapi avec `fetch` mocké. On vérifie que :
 *  - une réponse Strapi bien formée devient des produits de domaine ;
 *  - le filtrage/tri/recherche (délégués à query.ts) se comportent comme
 *    pour l'implémentation statique ;
 *  - une panne réseau ou une réponse HS ne fait pas planter le rendu.
 */

function strapiProduct(overrides: Partial<StrapiProduct>): StrapiProduct {
  return {
    documentId: overrides.slug,
    name: overrides.slug,
    slug: overrides.slug,
    brand: { documentId: 'b', name: 'Marque', slug: 'marque' },
    description: '',
    gender: 'unisexe',
    family: 'floral',
    secondaryFamilies: [],
    notes: [{ layer: 'top', position: 0, note: { name: 'Rose', slug: 'rose' } }],
    variants: [{ volumeMl: 100, price: { amount: 10000, currency: 'DZD' }, stock: 0 }],
    images: [],
    ...overrides,
  };
}

function mockStrapi(products: StrapiProduct[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/api/products')) {
        return new Response(JSON.stringify({ data: products, meta: {} }), { status: 200 });
      }
      if (url.includes('/api/collections')) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      return new Response('not found', { status: 404 });
    })
  );
}

beforeEach(() => {
  resetStrapiCache();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetStrapiCache();
});

describe('strapiCatalogRepository', () => {
  it('mappe une réponse Strapi en produits de domaine', async () => {
    mockStrapi([
      strapiProduct({ slug: 'un', name: 'Un', family: 'woody' }),
      strapiProduct({ slug: 'deux', name: 'Deux', gender: 'femme' }),
    ]);

    const { items, total } = await strapiCatalogRepository.listProducts();
    expect(total).toBe(2);
    expect(items[0].brand.name).toBe('Marque');
    expect(items.find((p) => p.slug === 'un')?.family).toBe('woody');
  });

  it('applique les filtres comme l’implémentation statique', async () => {
    mockStrapi([
      strapiProduct({ slug: 'f1', gender: 'femme', family: 'floral' }),
      strapiProduct({ slug: 'h1', gender: 'homme', family: 'woody' }),
      strapiProduct({ slug: 'h2', gender: 'homme', family: 'fresh' }),
    ]);

    const femmes = await strapiCatalogRepository.listProducts({ gender: 'femme' });
    expect(femmes.items.map((p) => p.slug)).toEqual(['f1']);

    const woody = await strapiCatalogRepository.listProducts({ family: 'woody' });
    expect(woody.items.map((p) => p.slug)).toEqual(['h1']);
  });

  it('déduit les marques depuis les produits', async () => {
    mockStrapi([
      { ...strapiProduct({ slug: 'a' }), brand: { name: 'Dior', slug: 'dior' } },
      { ...strapiProduct({ slug: 'b' }), brand: { name: 'Chanel', slug: 'chanel' } },
      { ...strapiProduct({ slug: 'c' }), brand: { name: 'Dior', slug: 'dior' } },
    ]);

    const brands = await strapiCatalogRepository.listBrands();
    expect(brands.map((b) => b.slug).sort()).toEqual(['chanel', 'dior']);
  });

  it('retourne un catalogue vide (sans planter) si Strapi est injoignable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      })
    );

    const { items, total } = await strapiCatalogRepository.listProducts();
    expect(items).toEqual([]);
    expect(total).toBe(0);
  });

  it('retourne un catalogue vide si Strapi répond en erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('boom', { status: 500 }))
    );

    const { total } = await strapiCatalogRepository.listProducts();
    expect(total).toBe(0);
  });

  it('trouve un parfum par slug', async () => {
    mockStrapi([strapiProduct({ slug: 'cible', name: 'Cible' })]);
    const product = await strapiCatalogRepository.getProductBySlug('cible');
    expect(product?.name).toBe('Cible');
    expect(await strapiCatalogRepository.getProductBySlug('absent')).toBeNull();
  });
});
