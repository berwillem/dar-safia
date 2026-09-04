import {
  deriveIntensity,
  deriveMoods,
  deriveNoteTags,
  deriveOlfactoryFamilies,
  deriveSeasons,
  type FragranceFamily,
  type Gender,
  type IntensityTag,
  type Media,
  type MoodTag,
  type NoteTag,
  type OlfactoryFamilyTag,
  type Product,
  type SeasonTag,
} from '@/lib/catalog';

/**
 * ══════════════════════════════════════════════════════════════
 *   FORME RÉDUITE ENVOYÉE AU CLIENT
 * ══════════════════════════════════════════════════════════════
 *
 * `ShopExperience` filtre en mémoire, côté client : il lui faut donc les 45
 * produits dans le bundle, mais pas la description longue, le récit, la
 * pyramide complète ou les variantes détaillées — juste de quoi filtrer et
 * afficher la fiche (`ProductCardData`). Les étiquettes de filtre sont
 * calculées ICI, côté serveur, via `derive-tags.ts` : le client ne reçoit
 * que leur résultat, jamais la logique de calcul ni la pyramide complète.
 */
export interface ShopProduct {
  slug: string;
  name: string;
  brand: { name: string };
  gender: Gender;
  family: FragranceFamily;
  badge?: string;
  image: Media | undefined;
  headlineNote: string | undefined;
  priceFrom: number;
  volumeMl: number;

  olfactoryFamilies: OlfactoryFamilyTag[];
  noteTags: NoteTag[];
  intensity: IntensityTag | undefined;
  seasons: SeasonTag[];
  moods: MoodTag[];
}

export const GENDERS: Gender[] = ['femme', 'homme', 'unisexe'];

export function toShopProduct(product: Product): ShopProduct {
  return {
    slug: product.slug,
    name: product.name,
    brand: { name: product.brand.name },
    gender: product.gender,
    family: product.family,
    badge: product.badge,
    image: product.images[0],
    headlineNote: product.notes[0]?.note.name,
    priceFrom: Math.min(...product.variants.map((v) => v.price.amount)),
    volumeMl: product.variants[0]?.volumeMl ?? 0,

    olfactoryFamilies: deriveOlfactoryFamilies(product),
    noteTags: deriveNoteTags(product),
    intensity: deriveIntensity(product),
    seasons: deriveSeasons(product),
    moods: deriveMoods(product),
  };
}
