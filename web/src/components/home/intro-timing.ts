'use client';

import { useSyncExternalStore } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   INTRO — MINUTAGE PARTAGÉ
 * ══════════════════════════════════════════════════════════════
 *
 * `HeroFilm` (le compte à rebours + rideau) et `SiteHeader` (le stagger de
 * la nav) doivent s'accorder sur DEUX choses sans se parler directement :
 * si l'intro joue cette fois-ci, et combien de temps elle prend. Les
 * dupliquer indépendamment dans chaque composant les ferait dériver au
 * premier ajustement de durée — ce module est donc la seule source des deux.
 *
 * Pas d'event bus, pas de contexte : les durées sont déterministes (deux
 * timelines fixes, « joue » ou « rejoue vite »), donc un simple délai
 * calculé au montage suffit à SiteHeader pour démarrer pile quand HeroFilm
 * l'a prévu.
 */

export const INTRO_SESSION_KEY = 'darsafia.intro.seen';

// ── Timeline « l'intro joue » (première visite de la session) ──
// Compteur 0→100, tenue courte, rideau qui s'écarte, PUIS la typographie.
export const COUNTER_DURATION = 1.3;
export const COUNTER_HOLD = 0.15;
export const CURTAIN_DURATION = 1.1;
/** Instant où le rideau est entièrement ouvert — la typographie embraie ici. */
export const CURTAIN_DONE = COUNTER_DURATION + COUNTER_HOLD + CURTAIN_DURATION;

// ── Timeline « rejoue vite » (déjà vue cette session) ──
// Pas de compteur ni de rideau : la typographie part quasi immédiatement.
export const REPEAT_TYPE_START = 0.1;

/** Instant (secondes) où la nav de `SiteHeader` doit commencer son stagger. */
export const NAV_STAGGER_START = { intro: CURTAIN_DONE, repeat: REPEAT_TYPE_START };

/**
 * « L'intro doit-elle jouer ? » est une lecture du navigateur (sessionStorage
 * + prefers-reduced-motion), pas un état React : `useSyncExternalStore` évite
 * un setState dans un effet et donne un instantané serveur cohérent (false :
 * pas d'intro au rendu statique). La valeur ne change jamais après le
 * montage ; l'abonnement est donc vide.
 */
const noSubscribe = () => () => {};

function readIntroPlays(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) !== '1';
  } catch {
    // Navigation privée : on ne force pas l'intro à chaque page.
    return false;
  }
}

export function useIntroPlays(): boolean {
  return useSyncExternalStore(noSubscribe, readIntroPlays, () => false);
}

export function dismissIntro(): void {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}
