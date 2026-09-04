/**
 * Type du dictionnaire + interpolation. SANS `server-only` : importable aussi
 * bien depuis un composant serveur que client.
 *
 * Le chargement effectif des fichiers de langue (`getDictionary`) vit dans
 * dictionaries.ts, lui marqué server-only.
 */

import fr from './dictionaries/fr.json';

/** Le français est la source : sa forme définit le contrat. */
export type Dictionary = typeof fr;

/** Interpolation `{clé}` -> valeur. Une clé absente est laissée telle quelle. */
export function interpolate(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in params ? String(params[key]) : `{${key}}`
  );
}
