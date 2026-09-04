/**
 * ══════════════════════════════════════════════════════════════
 *   VOCABULAIRE DE FILTRAGE — BOUTIQUE
 * ══════════════════════════════════════════════════════════════
 *
 * Cinq axes de filtrage supplémentaires pour `/parfums`, distincts du
 * vocabulaire de DOMAINE (`Gender`, `FragranceFamily` dans `types.ts`, qui
 * pilote aussi les univers visuels CSS et le diagnostic olfactif).
 *
 * Ce ne sont PAS de nouveaux champs sur `Product` : ce sont des étiquettes
 * de présentation, calculées à la volée depuis les champs réels du produit
 * par `derive-tags.ts`. Rien ici n'est saisi à la main par produit — voir
 * l'en-tête de `derive-tags.ts` pour le détail du calcul et son statut
 * (déduit, pas publié par la marque).
 */

/** Famille olfactive détaillée (12 valeurs) — plus fine que `FragranceFamily`. */
export type OlfactoryFamilyTag =
  | 'Floral'
  | 'Hespéridé / Citronné'
  | 'Fruité'
  | 'Gourmand'
  | 'Aromatique'
  | 'Épicé'
  | 'Boisé'
  | 'Ambré'
  | 'Aquatique'
  | 'Chypré'
  | 'Musqué'
  | 'Oriental';

export const OLFACTORY_FAMILY_TAGS: OlfactoryFamilyTag[] = [
  'Floral',
  'Hespéridé / Citronné',
  'Fruité',
  'Gourmand',
  'Aromatique',
  'Épicé',
  'Boisé',
  'Ambré',
  'Aquatique',
  'Chypré',
  'Musqué',
  'Oriental',
];

/** Matières phares, pour filtrer sans parcourir les 254 notes du catalogue. */
export type NoteTag =
  | 'Vanille'
  | 'Rose'
  | 'Jasmin'
  | 'Fleur d’oranger'
  | 'Bergamote'
  | 'Citron'
  | 'Poire'
  | 'Pêche'
  | 'Mangue'
  | 'Musc'
  | 'Ambre'
  | 'Santal'
  | 'Cèdre'
  | 'Patchouli'
  | 'Encens'
  | 'Tonka'
  | 'Benjoin'
  | 'Iris';

export const NOTE_TAGS: NoteTag[] = [
  'Vanille',
  'Rose',
  'Jasmin',
  'Fleur d’oranger',
  'Bergamote',
  'Citron',
  'Poire',
  'Pêche',
  'Mangue',
  'Musc',
  'Ambre',
  'Santal',
  'Cèdre',
  'Patchouli',
  'Encens',
  'Tonka',
  'Benjoin',
  'Iris',
];

/** Alias d'affichage de `Product['sillage']` — même échelle, même sens. */
export type IntensityTag = 1 | 2 | 3 | 4 | 5;

export const INTENSITY_TAGS: IntensityTag[] = [1, 2, 3, 4, 5];

/** Casse d'affichage de `Product['seasons']` (`Season`, dans `types.ts`). */
export type SeasonTag = 'Printemps' | 'Été' | 'Automne' | 'Hiver' | 'Toute l’année';

export const SEASON_TAGS: SeasonTag[] = ['Printemps', 'Été', 'Automne', 'Hiver', 'Toute l’année'];

/**
 * « Je recherche » — filtre d'intention plutôt que de composition. Calculé,
 * jamais saisi : voir `deriveMoods` dans `derive-tags.ts`.
 */
export type MoodTag =
  | 'Sucré'
  | 'Fleuri'
  | 'Frais'
  | 'Épicé'
  | 'Boisé'
  | 'Frais & aquatique'
  | 'Très puissant'
  | 'Séducteur'
  | 'Luxe / chic';

export const MOOD_TAGS: MoodTag[] = [
  'Sucré',
  'Fleuri',
  'Frais',
  'Épicé',
  'Boisé',
  'Frais & aquatique',
  'Très puissant',
  'Séducteur',
  'Luxe / chic',
];
