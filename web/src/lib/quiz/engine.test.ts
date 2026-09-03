import { describe, expect, it } from 'vitest';

import type { Product } from '@/lib/catalog';
import { rankScentMatches } from './engine';
import type { QuizAnswers } from './types';

/**
 * Fabrique un produit minimal pour les tests. Seuls les champs lus par le
 * moteur sont renseignés ; le reste tient des valeurs neutres.
 */
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
    longevityHours: 36,
    sillage: 3,
    ...overrides,
  };
}

const ANSWERS: QuizAnswers = {
  recipient: 'homme',
  moment: 'nuit',
  family: 'woody',
  intensity: 'intense',
};

describe('rankScentMatches', () => {
  it('place en tête le produit qui coche tous les critères', () => {
    const perfectMatch = makeProduct({
      slug: 'parfait',
      gender: 'homme',
      family: 'woody',
      occasions: ['soir'],
      longevityHours: 72,
      concentration: 'Elixir Concentré',
    });
    const poorMatch = makeProduct({
      slug: 'mediocre',
      gender: 'femme',
      family: 'floral',
      occasions: ['jour'],
      longevityHours: 24,
      concentration: 'Eau de Toilette',
    });

    const ranked = rankScentMatches([poorMatch, perfectMatch], ANSWERS);

    expect(ranked[0].product.slug).toBe('parfait');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it('donne 100 % de compatibilité quand tous les maxima sont atteints', () => {
    const perfectMatch = makeProduct({
      slug: 'parfait',
      gender: 'homme',
      family: 'woody',
      occasions: ['soir'],
      longevityHours: 72,
    });

    const [top] = rankScentMatches([perfectMatch], ANSWERS);
    expect(top.compatibility).toBe(100);
  });

  it('ne dépasse jamais 100 % ni ne descend sous 0 %', () => {
    const products = [
      makeProduct({ slug: 'a', gender: 'femme', family: 'fresh' }),
      makeProduct({ slug: 'b', gender: 'homme', family: 'woody', occasions: ['soir'] }),
    ];
    for (const match of rankScentMatches(products, ANSWERS)) {
      expect(match.compatibility).toBeGreaterThanOrEqual(0);
      expect(match.compatibility).toBeLessThanOrEqual(100);
    }
  });

  it('à score égal, départage par le prix le plus bas', () => {
    const base = {
      gender: 'homme',
      family: 'woody',
      occasions: ['soir'],
      longevityHours: 72,
    } satisfies Partial<Product>;
    const cher = makeProduct({
      slug: 'cher',
      ...base,
      variants: [
        { id: 'c-v', volumeMl: 100, price: { amount: 30000, currency: 'DZD' }, stock: 0 },
      ],
    });
    const abordable = makeProduct({
      slug: 'abordable',
      ...base,
      variants: [
        { id: 'a-v', volumeMl: 100, price: { amount: 12000, currency: 'DZD' }, stock: 0 },
      ],
    });

    const ranked = rankScentMatches([cher, abordable], ANSWERS);
    expect(ranked[0].score).toBe(ranked[1].score);
    expect(ranked[0].product.slug).toBe('abordable');
  });

  it('« cadeau » privilégie les best-sellers', () => {
    const answers: QuizAnswers = { ...ANSWERS, recipient: 'cadeau' };
    const bestseller = makeProduct({ slug: 'star', bestseller: true });
    const ordinaire = makeProduct({ slug: 'quelconque' });

    const ranked = rankScentMatches([ordinaire, bestseller], answers);
    expect(ranked[0].product.slug).toBe('star');
  });

  it('une famille secondaire compte, mais moins qu’une famille principale', () => {
    const primary = makeProduct({ slug: 'principal', family: 'woody' });
    const secondary = makeProduct({
      slug: 'secondaire',
      family: 'amber',
      secondaryFamilies: ['woody'],
    });

    const ranked = rankScentMatches([secondary, primary], {
      ...ANSWERS,
      recipient: 'unisexe',
      moment: 'prestige',
      intensity: 'equilibre',
    });
    const primScore = ranked.find((r) => r.product.slug === 'principal')!.score;
    const secScore = ranked.find((r) => r.product.slug === 'secondaire')!.score;
    expect(primScore).toBeGreaterThan(secScore);
  });

  it('renvoie tous les produits, à l’appelant de trancher', () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ slug: `p${i}` })
    );
    expect(rankScentMatches(products, ANSWERS)).toHaveLength(10);
  });
});
