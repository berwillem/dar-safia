import { beforeEach, describe, expect, it } from 'vitest';

import * as store from './store';
import { CART_STORAGE_KEY, MAX_QUANTITY, type CartLine } from './types';

/**
 * Le magasin garde son état en portée module et ne relit le stockage
 * qu'une fois (latch `loaded`). Chaque test le réinitialise via le hook
 * dédié, puis force le chargement par un premier getSnapshot().
 */
function makeLine(
  overrides: Partial<Omit<CartLine, 'quantity'>> = {}
): Omit<CartLine, 'quantity'> {
  return {
    productSlug: 'terre-hermes',
    variantId: 'v1',
    name: "Terre d'Hermès",
    brandName: 'Hermès',
    imageUrl: '/img/x.webp',
    volumeMl: 100,
    unitPrice: 18800,
    currency: 'DZD',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  store.__resetForTests();
});

describe('addLine', () => {
  it('ajoute une ligne et la persiste', () => {
    store.addLine(makeLine());
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].quantity).toBe(1);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toContain('terre-hermes');
  });

  it('fusionne les quantités pour un même produit + format', () => {
    store.addLine(makeLine(), 2);
    store.addLine(makeLine(), 3);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].quantity).toBe(5);
  });

  it('distingue deux formats du même parfum', () => {
    store.addLine(makeLine({ variantId: 'v1' }));
    store.addLine(makeLine({ variantId: 'v2' }));
    expect(store.getSnapshot()).toHaveLength(2);
  });

  it('plafonne la quantité à MAX_QUANTITY', () => {
    store.addLine(makeLine(), MAX_QUANTITY + 50);
    expect(store.getSnapshot()[0].quantity).toBe(MAX_QUANTITY);
  });
});

describe('changeQuantity', () => {
  it('applique un écart relatif à la valeur courante', () => {
    store.addLine(makeLine(), 2);
    store.changeQuantity('terre-hermes', 'v1', 1);
    store.changeQuantity('terre-hermes', 'v1', 1);
    expect(store.getSnapshot()[0].quantity).toBe(4);
  });

  it('retire la ligne quand la quantité tombe à zéro', () => {
    store.addLine(makeLine(), 1);
    store.changeQuantity('terre-hermes', 'v1', -1);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  it('ignore une ligne absente', () => {
    store.changeQuantity('inexistant', 'v', 1);
    expect(store.getSnapshot()).toHaveLength(0);
  });
});

describe('référence stable de l’instantané', () => {
  it('getSnapshot renvoie la même référence tant que rien ne change', () => {
    store.addLine(makeLine());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('une mutation produit une nouvelle référence', () => {
    store.addLine(makeLine());
    const before = store.getSnapshot();
    store.addLine(makeLine({ variantId: 'v2' }));
    expect(store.getSnapshot()).not.toBe(before);
  });
});

describe('résilience du stockage', () => {
  it('repart vide si le contenu stocké n’est pas un tableau', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{"pas":"un tableau"}');
    store.__resetForTests();
    expect(store.getSnapshot()).toEqual([]);
  });

  it('repart vide si le JSON est invalide', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{{{');
    store.__resetForTests();
    expect(store.getSnapshot()).toEqual([]);
  });

  it('filtre les lignes trafiquées (prix négatif, quantité non entière)', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { ...makeLine(), unitPrice: -999, quantity: 1 },
        { ...makeLine({ variantId: 'v2' }), quantity: 1.5 },
        { ...makeLine({ variantId: 'v3' }), quantity: 2 },
      ])
    );
    store.__resetForTests();
    const lines = store.getSnapshot();
    expect(lines).toHaveLength(1);
    expect(lines[0].variantId).toBe('v3');
  });

  it('replafonne une quantité stockée supérieure au maximum', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ ...makeLine(), quantity: 9999 }])
    );
    store.__resetForTests();
    expect(store.getSnapshot()[0].quantity).toBe(MAX_QUANTITY);
  });
});

describe('getServerSnapshot', () => {
  it('renvoie toujours un panier vide (hydratation cohérente)', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ ...makeLine(), quantity: 1 }])
    );
    expect(store.getServerSnapshot()).toEqual([]);
  });
});
