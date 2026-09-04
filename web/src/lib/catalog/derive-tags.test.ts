import { describe, expect, it } from 'vitest';

import type { Product } from '@/lib/catalog';
import {
  deriveIntensity,
  deriveMoods,
  deriveNoteTags,
  deriveOlfactoryFamilies,
  deriveSeasons,
} from './derive-tags';

/** Même fabrique minimale que `quiz/engine.test.ts`. */
function makeProduct(overrides: Partial<Product> & { slug: string }): Product {
  return {
    id: overrides.slug,
    name: overrides.slug,
    brand: { id: 'b', slug: 'b', name: 'Marque' },
    description: '',
    gender: 'unisexe',
    family: 'floral',
    secondaryFamilies: [],
    notes: [],
    variants: [
      {
        id: `${overrides.slug}-v`,
        volumeMl: 100,
        price: { amount: 10000, currency: 'DZD' },
        stock: 0,
      },
    ],
    images: [],
    seasons: [],
    occasions: [],
    featured: false,
    newArrival: false,
    bestseller: false,
    sillage: 3,
    ...overrides,
  };
}

function note(name: string, layer: 'top' | 'heart' | 'base' = 'heart') {
  return {
    note: { id: name, slug: name, name },
    layer,
    position: 0,
  };
}

describe('deriveOlfactoryFamilies', () => {
  it('classe une matière connue dans sa famille détaillée', () => {
    const p = makeProduct({ slug: 'p', notes: [note('Bergamote Italienne', 'top')] });
    expect(deriveOlfactoryFamilies(p)).toContain('Hespéridé / Citronné');
  });

  it("n'invente rien pour une matière au vocabulaire proche mais différente", () => {
    // La noix de muscade est une épice, pas une matière musquée : le
    // mot-clé « musc » ne doit pas matcher « muscade ».
    const p = makeProduct({ slug: 'p', notes: [note('Noix de Muscade', 'top')] });
    const families = deriveOlfactoryFamilies(p);
    expect(families).toContain('Épicé');
    expect(families).not.toContain('Musqué');
  });

  it('tolère un pluriel simple', () => {
    const p = makeProduct({ slug: 'p', notes: [note('Muscs Blancs', 'base')] });
    expect(deriveOlfactoryFamilies(p)).toContain('Musqué');
  });

  it('additionne les familles de toute la pyramide, sans doublon', () => {
    const p = makeProduct({
      slug: 'p',
      notes: [note('Bergamote', 'top'), note('Bois de Santal', 'base'), note('Cèdre', 'base')],
    });
    const families = deriveOlfactoryFamilies(p);
    expect(families).toContain('Hespéridé / Citronné');
    expect(families).toContain('Boisé');
    expect(families.filter((f) => f === 'Boisé')).toHaveLength(1);
  });
});

describe('deriveNoteTags', () => {
  it('retient une matière phare réellement présente', () => {
    const p = makeProduct({ slug: 'p', notes: [note('Vanille Bourbon', 'base')] });
    expect(deriveNoteTags(p)).toEqual(['Vanille']);
  });

  it("ne retient rien qui ne soit pas dans la liste des dix-huit matières", () => {
    const p = makeProduct({ slug: 'p', notes: [note('Pomme Granny Smith', 'top')] });
    expect(deriveNoteTags(p)).toEqual([]);
  });

  it('ne fait pas correspondre un mot inclus dans un autre mot', () => {
    // « Ambrette » ne doit pas être compté comme « Ambre ».
    const p = makeProduct({ slug: 'p', notes: [note('Ambrette d’Équateur', 'top')] });
    expect(deriveNoteTags(p)).not.toContain('Ambre');
  });
});

describe('deriveIntensity / deriveSeasons', () => {
  it('reprend sillage tel quel', () => {
    expect(deriveIntensity(makeProduct({ slug: 'p', sillage: 4 }))).toBe(4);
    expect(deriveIntensity(makeProduct({ slug: 'p', sillage: undefined }))).toBeUndefined();
  });

  it('met en forme les saisons existantes', () => {
    const p = makeProduct({ slug: 'p', seasons: ['ete', 'toutes'] });
    expect(deriveSeasons(p)).toEqual(['Été', 'Toute l’année']);
  });
});

describe('deriveMoods', () => {
  it('signale un sillage affirmé comme « Très puissant »', () => {
    expect(deriveMoods(makeProduct({ slug: 'p', sillage: 5 }))).toContain('Très puissant');
    expect(deriveMoods(makeProduct({ slug: 'p', sillage: 2 }))).not.toContain('Très puissant');
  });

  it('reprend les signaux existants pour « Luxe / chic » (prix réel ou mise en avant)', () => {
    expect(deriveMoods(makeProduct({ slug: 'p', bestseller: true }))).toContain('Luxe / chic');
    expect(
      deriveMoods(
        makeProduct({
          slug: 'p',
          variants: [
            { id: 'v', volumeMl: 100, price: { amount: 30_000, currency: 'DZD' }, stock: 0 },
          ],
        })
      )
    ).toContain('Luxe / chic');
    // `badge` seul ne suffit pas : les 45 produits réels en portent tous un,
    // ce texte libre décrit la formule plutôt qu'une pièce d'exception.
    expect(deriveMoods(makeProduct({ slug: 'p', badge: 'Intense' }))).not.toContain('Luxe / chic');
  });

  it('dérive « Sucré » de la famille gourmande', () => {
    expect(deriveMoods(makeProduct({ slug: 'p', family: 'gourmand' }))).toContain('Sucré');
  });
});
