import type { Locale } from './config';

/**
 * Préfixe un chemin interne par la langue courante.
 * localePath('fr', '/parfums') -> '/fr/parfums'
 * localePath('ar', '/')        -> '/ar'
 */
export function localePath(locale: Locale, path: string): string {
  if (path === '/' || path === '') return `/${locale}`;
  return `/${locale}${path.startsWith('/') ? path : `/${path}`}`;
}
