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

/**
 * Pluralisation simple : un gabarit `"singulier|pluriel"` est choisi selon
 * `count` (1 -> singulier, sinon pluriel), puis interpolé.
 *
 * Suffisant pour le français et l'anglais. L'arabe a six formes ; le
 * « singulier » y sert de forme courte et le « pluriel » de forme longue —
 * acceptable pour l'affichage actuel, à affiner avec Intl.PluralRules si le
 * besoin s'en fait sentir.
 */
export function pluralize(
  template: string,
  count: number,
  params: Record<string, string | number> = {}
): string {
  const [one, many = one] = template.split('|');
  return interpolate(count === 1 ? one : many, { count, ...params });
}
