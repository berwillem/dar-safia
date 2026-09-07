'use client';

import { useSyncExternalStore } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   INTRO — MINUTAGE + ÉTAT « ça joue ? »
 * ══════════════════════════════════════════════════════════════
 *
 * Regroupé ici plutôt qu'éparpillé dans `HeroFilm` : la question « l'intro
 * joue-t-elle cette session ? » (sessionStorage + prefers-reduced-motion) et
 * les durées de la timeline d'ouverture. Un seul endroit à ajuster.
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
// Compteur 000→100, tenue, rideau qui s'écarte, PLAN SEUL, typographie, nav.
export const COUNTER_DURATION = 2.8;
export const COUNTER_HOLD = 0.4;
export const CURTAIN_DURATION = 1.6;

/** Instant où le rideau est entièrement ouvert. */
export const CURTAIN_DONE = COUNTER_DURATION + COUNTER_HOLD + CURTAIN_DURATION;

/**
 * Le temps où le film reste SEUL à l'écran, rideau ouvert, avant que quoi
 * que ce soit d'autre n'arrive. C'est ce silence qui fait la différence
 * entre « une animation » et un plan de cinéma : on laisse voir le flacon
 * avant de parler par-dessus. Raccourci de 0,2 s par rapport à la version
 * précédente — la pause se sentait un peu longue une fois le compteur
 * lui-même allongé.
 */
export const FILM_ALONE = 0.7;

/** Instant où la typographie du hero entre. */
export const TYPE_START = CURTAIN_DONE + FILM_ALONE;

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
