import { describe, expect, it } from 'vitest';

import { catalog, lowestPrice } from './index';

/**
 * Teste l'implémentation statique contre les données réellement migrées
 * (web/src/data/*.json). Fait aussi office de garde-fou sur la sortie du
 * script de migration : un slug cassé ou une référence orpheline échouerait
 * ici plutôt qu'en production.
 */

describe('listProducts', () => {
  it('renvoie les 45 parfums du catalogue', async () => {
    const { items, total } = await catalog.listProducts();
    expect(total).toBe(45);
    expect(items).toHaveLength(45);
  });

  it('hydrate chaque produit : marque résolue, au moins une note, un format', async () => {
    const { items } = await catalog.listProducts();
    for (const product of items) {
      expect(product.brand.name).toBeTruthy();
      expect(product.notes.length).toBeGreaterThan(0);
      expect(product.notes[0].note.name).toBeTruthy();
      expect(product.variants.length).toBeGreaterThan(0);
    }
  });

  it('tous les slugs sont uniques et compatibles URL', async () => {
    const { items } = await catalog.listProducts();
    const slugs = items.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('filtre par genre', async () => {
    const { items } = await catalog.listProducts({ gender: 'femme' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.gender === 'femme')).toBe(true);
  });

  it('le filtre par famille inclut les familles secondaires', async () => {
    const { items } = await catalog.listProducts({ family: 'woody' });
    expect(
      items.every(
        (p) => p.family === 'woody' || p.secondaryFamilies.includes('woody')
      )
    ).toBe(true);
  });

  it('la recherche exige tous les mots', async () => {
    const { items } = await catalog.listProducts({ search: 'dior sauvage' });
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.every((p) =>
        `${p.name} ${p.brand.name}`.toLowerCase().includes('sauvage')
      )
    ).toBe(true);
  });

  it('tri par prix croissant', async () => {
    const { items } = await catalog.listProducts({ sort: 'price-asc' });
    const prices = items.map(lowestPrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('pagine via offset / limit sans changer le total', async () => {
    const page = await catalog.listProducts({ offset: 10, limit: 5 });
    expect(page.items).toHaveLength(5);
    expect(page.total).toBe(45);
  });

  it('aucun produit ne porte de note agrégée (aucun avis réel)', async () => {
    const { items } = await catalog.listProducts();
    expect(items.every((p) => p.rating === undefined)).toBe(true);
  });
});

describe('getProductBySlug', () => {
  it('trouve un parfum connu', async () => {
    const product = await catalog.getProductBySlug('prada-paradoxe');
    expect(product?.name).toBe('Prada Paradoxe');
  });

  it('renvoie null pour un slug inconnu', async () => {
    expect(await catalog.getProductBySlug('nexiste-pas')).toBeNull();
  });
});

describe('getRelatedProducts', () => {
  it('exclut le parfum lui-même et respecte la limite', async () => {
    const related = await catalog.getRelatedProducts('prada-paradoxe', 3);
    expect(related).toHaveLength(3);
    expect(related.every((p) => p.slug !== 'prada-paradoxe')).toBe(true);
  });

  it('privilégie la même famille ou la même marque', async () => {
    const base = await catalog.getProductBySlug('prada-paradoxe');
    const related = await catalog.getRelatedProducts('prada-paradoxe', 3);
    expect(
      related.some(
        (p) =>
          p.family === base!.family || p.brand.slug === base!.brand.slug
      )
    ).toBe(true);
  });
});

describe('collections', () => {
  it('renvoie une liste vide tant que Strapi n’existe pas', async () => {
    expect(await catalog.listCollections()).toEqual([]);
    expect(await catalog.getCollectionBySlug('x')).toBeNull();
  });
});
