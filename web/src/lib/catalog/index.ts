/**
 * ══════════════════════════════════════════════════════════════
 *   POINT D'ACCÈS UNIQUE AU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Les composants importent `catalog` d'ici, et RIEN D'AUTRE. Ils ne doivent
 * jamais importer products.json, ni un client Strapi, ni une implémentation
 * concrète.
 *
 * Source pilotée par l'environnement :
 *   CATALOG_SOURCE=strapi  -> Strapi (nécessite STRAPI_URL, STRAPI_API_TOKEN)
 *   sinon                  -> données statiques (web/src/data/*.json)
 *
 * Les deux implémentations respectent le même contrat et, comme elles
 * délèguent au même moteur de requête (query.ts), se comportent à l'identique.
 * Basculer de l'une à l'autre ne demande aucun changement de composant.
 */

import { staticCatalogRepository } from './static-repository';
import { strapiCatalogRepository } from './strapi-repository';
import type { CatalogRepository } from './types';

const source = process.env.CATALOG_SOURCE ?? 'static';

export const catalog: CatalogRepository =
  source === 'strapi' ? strapiCatalogRepository : staticCatalogRepository;

export { lowestPrice } from './query';
export type * from './types';

export {
  deriveIntensity,
  deriveMoods,
  deriveNoteTags,
  deriveOlfactoryFamilies,
  deriveSeasons,
} from './derive-tags';
export {
  INTENSITY_TAGS,
  MOOD_TAGS,
  NOTE_TAGS,
  OLFACTORY_FAMILY_TAGS,
  SEASON_TAGS,
} from './filter-taxonomy';
export type {
  IntensityTag,
  MoodTag,
  NoteTag,
  OlfactoryFamilyTag,
  SeasonTag,
} from './filter-taxonomy';
