import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALES, isLocale } from '@/lib/i18n/config';

/**
 * ══════════════════════════════════════════════════════════════
 *   PROXY — ROUTAGE PAR LANGUE
 * ══════════════════════════════════════════════════════════════
 *
 * (Next 16 : le fichier `middleware` a été renommé `proxy`.)
 *
 * Toute route vit sous /<locale>/… . Ce proxy :
 *   - laisse passer les requêtes qui portent déjà une langue valide ;
 *   - redirige les autres vers la langue préférée du navigateur
 *     (en-tête Accept-Language), à défaut vers le français.
 *
 * Un cookie `locale` mémorise le dernier choix explicite de l'utilisateur
 * (posé par le sélecteur de langue) et prime sur Accept-Language.
 */

const COOKIE = 'locale';

function preferredLocale(request: NextRequest): string {
  const fromCookie = request.cookies.get(COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  const header = request.headers.get('accept-language') ?? '';
  // "fr-FR,fr;q=0.9,en;q=0.8" -> ["fr", "fr", "en"]
  const wanted = header
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase())
    .filter(Boolean);

  return wanted.find((code) => isLocale(code)) ?? DEFAULT_LOCALE;
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = preferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Tout sauf les fichiers internes de Next, l'API et les assets statiques.
  matcher: ['/((?!_next|api|.*\\.[\\w]+$).*)'],
};
