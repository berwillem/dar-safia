/**
 * ══════════════════════════════════════════════════════════════
 *   FORME DE STOCKAGE (WIRE)
 * ══════════════════════════════════════════════════════════════
 *
 * Ce que contiennent products.json / brands.json / notes.json — et ce que
 * Strapi renverra en phase 3 : des données NORMALISÉES, où les relations
 * sont des références (`brandSlug`, `noteSlug`) et non des objets imbriqués.
 *
 * Le domaine (types.ts) est la forme RÉSOLUE que consomment les composants.
 * Le repository fait la jointure entre les deux — c'est précisément son
 * rôle, et la raison pour laquelle remplacer la source de données ne touche
 * aucun composant.
 */

import type {
  FragranceFamily,
  Gender,
  Media,
  Money,
  NoteLayer,
  Occasion,
  Season,
  SeoMetadata,
} from './types';

export interface WireBrand {
  id: string;
  slug: string;
  name: string;
  description?: string;
  country?: string;
}

export interface WireNote {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface WireProductNote {
  noteSlug: string;
  layer: NoteLayer;
  position: number;
}

export interface WireVariant {
  id: string;
  /** null quand la contenance n'était pas lisible (ex. « Coffret Prestige »). */
  volumeMl: number | null;
  price: Money;
  compareAtPrice?: Money;
  stock: number;
  sku?: string;
}

export interface WireProduct {
  id: string;
  slug: string;
  name: string;
  /** Référence, pas un objet imbriqué. */
  brandSlug: string;

  description: string;
  story?: string;

  gender: Gender;
  family: FragranceFamily;
  secondaryFamilies: FragranceFamily[];

  notes: WireProductNote[];
  variants: WireVariant[];
  images: Media[];

  concentration?: string;
  longevityHours: number | null;
  sillage: 1 | 2 | 3 | 4 | 5;

  seasons: Season[];
  occasions: Occasion[];

  badge?: string;
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;

  seo?: SeoMetadata;
}
