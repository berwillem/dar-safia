/**
 * ══════════════════════════════════════════════════════════════
 *   POINT D'ACCÈS UNIQUE AU CATALOGUE
 * ══════════════════════════════════════════════════════════════
 *
 * Les composants importent `catalog` d'ici, et RIEN D'AUTRE. Ils ne doivent
 * jamais importer products.json, ni un client Strapi, ni une implémentation
 * concrète.
 *
 * Phase 3 : remplacer la ligne d'export ci-dessous par la version Strapi.
 * C'est le seul fichier à modifier.
 */

import { staticCatalogRepository } from './static-repository';
import type { CatalogRepository } from './types';

export const catalog: CatalogRepository = staticCatalogRepository;

export { lowestPrice } from './static-repository';
export type * from './types';
