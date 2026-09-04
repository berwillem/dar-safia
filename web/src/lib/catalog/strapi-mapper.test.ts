import { describe, expect, it } from 'vitest';

import { mapBrand, mapCollection, mapNote, mapProduct } from './strapi-mapper';
import type { StrapiProduct } from './strapi-types';

const BASE = 'http://cms.example';

/** Parfum Strapi complet et bien formé, sur lequel les tests dérivent. */
function fullProduct(): StrapiProduct {
  return {
    id: 1,
    documentId: 'doc-1',
    name: "Terre d'Hermès Intense",
    slug: 'hermes-terre-d-hermes-intense',
    brand: { id: 2, documentId: 'b-2', name: 'Hermès', slug: 'hermes' },
    description: 'La force minérale et tellurique.',
    story: 'Une terre fertile et chaude.',
    gender: 'homme',
    family: 'woody',
    secondaryFamilies: ['fresh', 'inconnu'],
    notes: [
      {
        layer: 'top',
        position: 0,
        note: { name: 'Bergamote', slug: 'bergamote' },
      },
      {
        layer: 'base',
        position: 1,
        note: { name: 'Vétiver', slug: 'vetiver' },
      },
    ],
    variants: [
      {
        volumeMl: 100,
        price: { amount: 18800, currency: 'DZD' },
        stock: 4,
        sku: 'HTH-100',
      },
    ],
    images: [
      {
        url: '/uploads/hth.webp',
        alternativeText: 'Flacon',
        width: 800,
        height: 1000,
        formats: {
          small: { url: '/uploads/small_hth.webp', width: 400 },
          medium: { url: '/uploads/medium_hth.webp', width: 750 },
        },
      },
    ],
    concentration: 'Eau Intense',
    longevityHours: 48,
    sillage: 3,
    seasons: ['printemps', 'ete'],
    occasions: ['soir'],
    badge: 'Légende',
    featured: true,
  };
}

describe('mapProduct', () => {
  it('convertit un parfum bien formé', () => {
    const product = mapProduct(fullProduct(), BASE)!;

    expect(product.slug).toBe('hermes-terre-d-hermes-intense');
    expect(product.brand.name).toBe('Hermès');
    expect(product.gender).toBe('homme');
    expect(product.family).toBe('woody');
    expect(product.variants[0].price.amount).toBe(18800);
    expect(product.notes).toHaveLength(2);
    expect(product.notes[0].note.name).toBe('Bergamote');
  });

  it('résout les URL de média (relatives -> absolues) et le srcset', () => {
    const product = mapProduct(fullProduct(), BASE)!;
    expect(product.images[0].url).toBe(`${BASE}/uploads/hth.webp`);
    expect(product.images[0].srcset).toContain(`${BASE}/uploads/small_hth.webp 400w`);
    expect(product.images[0].srcset).toContain(`${BASE}/uploads/medium_hth.webp 750w`);
  });

  it('laisse une URL de média déjà absolue intacte', () => {
    const strapi = fullProduct();
    strapi.images![0].url = 'https://cdn.somewhere/hth.webp';
    strapi.images![0].formats = null;
    const product = mapProduct(strapi, BASE)!;
    expect(product.images[0].url).toBe('https://cdn.somewhere/hth.webp');
    expect(product.images[0].srcset).toBeNull();
  });

  it('écarte les familles secondaires hors vocabulaire et la famille principale', () => {
    const strapi = fullProduct();
    strapi.secondaryFamilies = ['fresh', 'woody', 'inconnu', 42];
    const product = mapProduct(strapi, BASE)!;
    expect(product.secondaryFamilies).toEqual(['fresh']);
  });

  it('n’expose jamais de note agrégée (pas d’avis réels)', () => {
    const product = mapProduct(fullProduct(), BASE)!;
    expect(product.rating).toBeUndefined();
  });

  it('retombe sur des valeurs neutres pour un genre / une famille inconnus', () => {
    const strapi = fullProduct();
    strapi.gender = 'autre';
    strapi.family = 'inexistante';
    const product = mapProduct(strapi, BASE)!;
    expect(product.gender).toBe('unisexe');
    expect(product.family).toBe('floral');
  });

  it('ignore une note dont la référence est cassée', () => {
    const strapi = fullProduct();
    strapi.notes = [
      { layer: 'top', position: 0, note: null },
      { layer: 'heart', position: 1, note: { name: 'Iris', slug: 'iris' } },
    ];
    const product = mapProduct(strapi, BASE)!;
    expect(product.notes).toHaveLength(1);
    expect(product.notes[0].note.slug).toBe('iris');
  });

  it('rejette un parfum sans slug', () => {
    const strapi = fullProduct();
    strapi.slug = undefined;
    expect(mapProduct(strapi, BASE)).toBeNull();
  });

  it('rejette un parfum sans marque exploitable', () => {
    const strapi = fullProduct();
    strapi.brand = { name: 'Hermès' }; // pas de slug
    expect(mapProduct(strapi, BASE)).toBeNull();
  });

  it('rejette un parfum sans format valorisé', () => {
    const strapi = fullProduct();
    strapi.variants = [{ volumeMl: 100, price: null, stock: 0 }];
    expect(mapProduct(strapi, BASE)).toBeNull();
  });

  it('ramène une contenance absente à 0 (coffret)', () => {
    const strapi = fullProduct();
    strapi.variants = [
      { volumeMl: null, price: { amount: 30000, currency: 'DZD' }, stock: 0 },
    ];
    const product = mapProduct(strapi, BASE)!;
    expect(product.variants[0].volumeMl).toBe(0);
  });

  it('borne le sillage à [1, 5] et ignore les valeurs hors plage', () => {
    const strapi = fullProduct();
    strapi.sillage = 9;
    expect(mapProduct(strapi, BASE)!.sillage).toBeUndefined();
  });
});

describe('mapBrand / mapNote', () => {
  it('mappe une marque', () => {
    const brand = mapBrand(
      { documentId: 'b1', name: 'Dior', slug: 'dior', country: 'France' },
      BASE
    )!;
    expect(brand).toMatchObject({ id: 'b1', name: 'Dior', slug: 'dior', country: 'France' });
  });

  it('rejette une marque ou une note sans slug', () => {
    expect(mapBrand({ name: 'Dior' }, BASE)).toBeNull();
    expect(mapNote({ name: 'Rose' }, BASE)).toBeNull();
  });
});

describe('mapCollection', () => {
  it('mappe une collection et ne garde un thème que s’il est valide', () => {
    const ok = mapCollection(
      { documentId: 'c1', name: 'Niche', slug: 'niche', theme: 'woody' },
      BASE
    )!;
    expect(ok.theme).toBe('woody');

    const bad = mapCollection(
      { documentId: 'c2', name: 'X', slug: 'x', theme: 'nope' },
      BASE
    )!;
    expect(bad.theme).toBeUndefined();
  });
});
