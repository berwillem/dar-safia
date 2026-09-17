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

import { INTRO_SESSION_KEY } from '@/lib/intro-guard';

export { INTRO_SESSION_KEY };

declare global {
  interface Window {
    /** Posé par le script de garde du <head> ; voir `lib/intro-guard.ts`. */
    __dsIntro?: number;
  }
}

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

/**
 * Même lecture que `useIntroPlays`, mais impérative : à appeler dans un effet,
 * quand la réponse doit être FIGÉE au montage.
 *
 * Le hook relit `sessionStorage` à chaque rendu. Dès que `HeroFilm` a marqué
 * la session comme vue, il bascule donc à `false` — ce qui est juste pour
 * « faut-il jouer l'intro ? », mais faux pour qui pilote une séquence DÉJÀ
 * commencée : la dépendance change en cours de route et l'effet est démonté.
 */
export function introWillPlay(): boolean {
  return readIntroPlays();
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

/**
 * Instant où l'en-tête revient. La nav n'existe pas tant que le film ne s'est
 * pas présenté : elle arrive APRÈS la typographie, une fois le plan installé.
 *
 * Ce voile ne concerne QUE l'intro de la première visite, sur l'accueil.
 * Partout ailleurs — et à toute visite suivante — l'en-tête est là au premier
 * rendu : une nav qui s'absente se lit comme une nav manquante.
 */
export const NAV_REVEAL = TYPE_START + 1.15;

/**
 * Émis quand l'intro se termine autrement que par la montre : bouton
 * « passer ». L'en-tête l'écoute pour ne pas rester voilé alors que le film
 * est déjà parti.
 */
export const INTRO_DONE_EVENT = 'darsafia:intro-done';

export function announceIntroDone(): void {
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}
