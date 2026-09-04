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

/**
 * Une seule courbe pour toute l'intro — le cubic-bezier demandé par la
 * maison. Compteur, rideau et typographie la partagent : c'est ce qui fait
 * lire la séquence comme UN geste et non comme trois animations collées.
 */
export const LUXE_EASE_ID = 'darsafia-luxe';
export const LUXE_EASE_CURVE = '0.76, 0, 0.24, 1';

// ── Timeline « l'intro joue » (première visite de la session) ──
// Compteur 0→100, tenue, rideau qui s'écarte, PLAN SEUL, puis typographie.
export const COUNTER_DURATION = 1.6;
export const COUNTER_HOLD = 0.25;
export const CURTAIN_DURATION = 1.35;

/** Instant où le rideau est entièrement ouvert. */
export const CURTAIN_DONE = COUNTER_DURATION + COUNTER_HOLD + CURTAIN_DURATION;

/**
 * Le temps où le film reste SEUL à l'écran, rideau ouvert, avant que quoi
 * que ce soit d'autre n'arrive. C'est ce silence qui fait la différence
 * entre « une animation » et un plan de cinéma : on laisse voir le flacon
 * avant de parler par-dessus.
 */
export const FILM_ALONE = 0.9;

/** Instant où la typographie du hero — et la nav — entrent, ensemble. */
export const TYPE_START = CURTAIN_DONE + FILM_ALONE;

// ── Timeline « rejoue vite » (déjà vue cette session) ──
// Pas de compteur ni de rideau : la typographie part quasi immédiatement.
export const REPEAT_TYPE_START = 0.15;

/** Instant (secondes) où la nav de `SiteHeader` doit commencer son stagger. */
export const NAV_STAGGER_START = { intro: TYPE_START, repeat: REPEAT_TYPE_START };

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
