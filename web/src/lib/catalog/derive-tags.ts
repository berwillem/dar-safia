/**
 * ══════════════════════════════════════════════════════════════
 *   ÉTIQUETTES DE FILTRE — CALCUL, PAS SAISIE
 * ══════════════════════════════════════════════════════════════
 *
 * Les cinq axes de `filter-taxonomy.ts` ne sont saisis à la main pour aucun
 * des 45 parfums : ils sont calculés ici depuis les champs RÉELS du produit
 * (pyramide de notes, famille, sillage, saisons, badges éditoriaux déjà
 * présents dans le catalogue).
 *
 * Comme `scripts/migrate-catalog.mjs` le fait déjà pour `seasons`/
 * `occasions` (« déduit, non factuel — à revoir manuellement ») : ce sont
 * des étiquettes DÉDUITES pour la découverte et le filtrage, pas des
 * informations publiées par les maisons. `deriveMoods` en particulier est
 * une heuristique éditoriale, documentée règle par règle ci-dessous.
 */

import type {
  IntensityTag,
  MoodTag,
  NoteTag,
  OlfactoryFamilyTag,
  SeasonTag,
} from './filter-taxonomy';
import { lowestPrice } from './query';
import type { Product, Season } from './types';

/** Sans accents, minuscules — même normalisation que `query.ts`. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// ── Famille olfactive détaillée ──────────────────────────────────
//
// Classification par mot-clé sur le NOM de la matière (connaissance de
// parfumerie standard : la bergamote est hespéridée, le santal est boisé…),
// appliquée aux 254 notes réelles du catalogue plutôt que saisie parfum par
// parfum. Une matière peut relever de plusieurs familles à la fois.
const FAMILY_KEYWORDS: Record<OlfactoryFamilyTag, string[]> = {
  Floral: [
    'rose', 'jasmin', 'fleur', 'muguet', 'iris', 'violette', 'pivoine',
    'freesia', 'glycine', 'magnolia', 'tubereuse', 'ylang', 'osmanthus',
    'narcisse', 'lys', 'geranium', 'orchidee', 'neroli', 'cyclamen',
    'pois de senteur', 'eglantine',
  ],
  'Hespéridé / Citronné': [
    'bergamote', 'citron', 'orange', 'mandarine', 'pamplemousse', 'neroli',
    'zestes',
  ],
  Fruité: [
    'peche', 'poire', 'pomme', 'mangue', 'litchi', 'figue', 'kiwi',
    'pasteque', 'grenade', 'fruits rouges', 'cassis', 'prune', 'coing',
    'ananas',
  ],
  Gourmand: [
    'vanille', 'caramel', 'praline', 'chocolat', 'cafe', 'miel', 'tonka',
    'panna cotta', 'meringue', 'marron glace',
  ],
  Aromatique: ['lavande', 'sauge', 'basilic', 'the', 'eucalyptus', 'menthe'],
  Épicé: [
    'poivre', 'cardamome', 'cannelle', 'muscade', 'girofle', 'gingembre',
    'cumin', 'piment', 'safran',
  ],
  Boisé: ['santal', 'cedre', 'bois', 'vetiver', 'gaiac', 'cypres'],
  Ambré: ['ambre', 'ambrofix', 'ambroxan', 'benjoin', 'styrax', 'resine', 'labdanum', 'ciste'],
  Aquatique: ['marin', 'aquatique', 'iode', 'silex', 'calypso'],
  Chypré: ['mousse de chene', 'cuir', 'tabac', 'patchouli'],
  Musqué: ['musc'],
  Oriental: ['encens', 'oliban', 'myrrhe', 'cachemire'],
};

/**
 * Un mot-clé matche en tant que mot entier, singulier ou pluriel simple
 * (`s?` final) : sans borne, « musc » matcherait « muscade » (une épice —
 * la noix de muscade — pas une matière musquée) ; sans le pluriel toléré,
 * « musc » ne matcherait pas « Muscs Blancs ».
 */
function matchesKeyword(haystack: string, keyword: string): boolean {
  return new RegExp(`\\b${keyword}s?\\b`).test(haystack);
}

function classifyNoteName(name: string): OlfactoryFamilyTag[] {
  const n = normalize(name);
  const families: OlfactoryFamilyTag[] = [];
  for (const [family, keywords] of Object.entries(FAMILY_KEYWORDS) as [
    OlfactoryFamilyTag,
    string[],
  ][]) {
    if (keywords.some((kw) => matchesKeyword(n, kw))) families.push(family);
  }
  return families;
}

/** Union des familles olfactives détaillées portées par la pyramide réelle du produit. */
export function deriveOlfactoryFamilies(product: Product): OlfactoryFamilyTag[] {
  const found = new Set<OlfactoryFamilyTag>();
  for (const { note } of product.notes) {
    for (const family of classifyNoteName(note.name)) found.add(family);
  }
  return [...found];
}

// Bornes de mot : sans elles, « ambre » matcherait « ambrette » et « musc »
// matcherait « muscade ». Les motifs restent des mots simples, sûrs à
// entourer de `\b`.
const NOTE_TAG_KEYWORDS: Record<NoteTag, string> = {
  Vanille: 'vanille',
  Rose: 'rose',
  Jasmin: 'jasmin',
  'Fleur d’oranger': 'fleur d.oranger',
  Bergamote: 'bergamote',
  Citron: 'citron',
  Poire: 'poire',
  Pêche: 'peche',
  Mangue: 'mangue',
  Musc: 'musc',
  Ambre: 'ambre',
  Santal: 'santal',
  Cèdre: 'cedre',
  Patchouli: 'patchouli',
  Encens: 'encens',
  Tonka: 'tonka',
  Benjoin: 'benjoin',
  Iris: 'iris',
};

/** Matières phares réellement présentes dans la pyramide du produit. */
export function deriveNoteTags(product: Product): NoteTag[] {
  const haystack = normalize(product.notes.map((n) => n.note.name).join(' | '));
  return (Object.entries(NOTE_TAG_KEYWORDS) as [NoteTag, string][])
    .filter(([, pattern]) => matchesKeyword(haystack, pattern))
    .map(([tag]) => tag);
}

// ── Intensité ──────────────────────────────────────────────────────
/** Alias direct de `sillage` : même échelle, aucune invention. */
export function deriveIntensity(product: Product): IntensityTag | undefined {
  return product.sillage;
}

// ── Saison ─────────────────────────────────────────────────────────
const SEASON_LABELS: Record<Season, SeasonTag> = {
  printemps: 'Printemps',
  ete: 'Été',
  automne: 'Automne',
  hiver: 'Hiver',
  toutes: 'Toute l’année',
};

export function deriveSeasons(product: Product): SeasonTag[] {
  return product.seasons.map((s) => SEASON_LABELS[s]);
}

// ── « Je recherche » ─────────────────────────────────────────────
//
// Heuristique éditoriale sur des champs réels (famille, sillage, matières,
// badges déjà posés par la maison) — pas un attribut publié par la marque.
// Chaque règle est documentée ; à affiner plutôt qu'à prendre pour un fait.
export function deriveMoods(product: Product): MoodTag[] {
  const olfactory = deriveOlfactoryFamilies(product);
  const notes = deriveNoteTags(product);
  const moods = new Set<MoodTag>();

  // Sucré : famille gourmande, ou vanille/fève tonka au cœur de la pyramide.
  if (product.family === 'gourmand' || notes.includes('Vanille'))
    moods.add('Sucré');

  // Fleuri : famille florale, ou matières florales identifiées.
  if (product.family === 'floral' || olfactory.includes('Floral'))
    moods.add('Fleuri');

  // Frais : famille fraîche.
  if (product.family === 'fresh') moods.add('Frais');

  // Épicé : famille épicée, ou matières épicées identifiées.
  if (product.family === 'spicy' || olfactory.includes('Épicé')) moods.add('Épicé');

  // Boisé : famille boisée, ou matières boisées identifiées.
  if (product.family === 'woody' || olfactory.includes('Boisé')) moods.add('Boisé');

  // Frais & aquatique : fraîcheur ET registre marin/aquatique dans la pyramide.
  if (product.family === 'fresh' && olfactory.includes('Aquatique'))
    moods.add('Frais & aquatique');

  // Très puissant : sillage affirmé (4-5 sur l'échelle réelle du produit).
  if ((product.sillage ?? 0) >= 4) moods.add('Très puissant');

  // Séducteur : registre ambré/oriental avec une présence marquée.
  if (
    (product.family === 'amber' || olfactory.includes('Oriental')) &&
    (product.sillage ?? 0) >= 3
  ) {
    moods.add('Séducteur');
  }

  // Luxe / chic : le haut du panier de prix réel (`badge` est écarté ici —
  // les 45 produits en portent tous un, ce texte libre décrit la formule
  // plutôt que de signaler une pièce d'exception), ou une pièce que la
  // maison a déjà choisi de mettre en avant.
  const LUXE_PRICE_FLOOR = 25_000; // DA — au-dessus du 3ᵉ quartile du catalogue actuel
  if (lowestPrice(product) >= LUXE_PRICE_FLOOR || product.bestseller || product.featured) {
    moods.add('Luxe / chic');
  }

  return [...moods];
}
