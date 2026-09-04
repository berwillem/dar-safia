import type {
  Gender,
  IntensityTag,
  MoodTag,
  NoteTag,
  OlfactoryFamilyTag,
  SeasonTag,
} from '@/lib/catalog';

import type { ShopProduct } from './shop-product';

export type FilterCategory = 'gender' | 'family' | 'notes' | 'intensity' | 'season' | 'mood';

/** Sélection courante par axe. Un axe vide = aucun filtre sur cet axe. */
export interface ShopFilters {
  gender: Gender[];
  family: OlfactoryFamilyTag[];
  notes: NoteTag[];
  intensity: IntensityTag[];
  season: SeasonTag[];
  mood: MoodTag[];
}

export const EMPTY_FILTERS: ShopFilters = {
  gender: [],
  family: [],
  notes: [],
  intensity: [],
  season: [],
  mood: [],
};

export function hasActiveFilters(filters: ShopFilters): boolean {
  return Object.values(filters).some((values) => values.length > 0);
}

/**
 * ET entre les axes, OU à l'intérieur d'un axe : cocher « Boisé » et
 * « Ambré » élargit, cocher Genre ET Famille restreint.
 */
export function matchesFilters(product: ShopProduct, filters: ShopFilters): boolean {
  const { gender, family, notes, intensity, season, mood } = filters;

  if (gender.length > 0 && !gender.includes(product.gender)) return false;
  if (family.length > 0 && !family.some((f) => product.olfactoryFamilies.includes(f))) {
    return false;
  }
  if (notes.length > 0 && !notes.some((n) => product.noteTags.includes(n))) return false;
  if (
    intensity.length > 0 &&
    (product.intensity === undefined || !intensity.includes(product.intensity))
  ) {
    return false;
  }
  if (season.length > 0 && !season.some((s) => product.seasons.includes(s))) return false;
  if (mood.length > 0 && !mood.some((m) => product.moods.includes(m))) return false;

  return true;
}

export function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
