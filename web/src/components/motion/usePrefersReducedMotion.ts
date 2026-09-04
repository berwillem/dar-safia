'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
const noSubscribe = () => () => {};

/**
 * Lecture stable de `prefers-reduced-motion`, partagée par les composants qui
 * doivent choisir leur mécanisme (animé vs. posé) AVANT de monter leur
 * timeline — `HeroFilm`, `SignatureStage`, `FilterSidebar`. Un `matchMedia`
 * direct dans un effet forcerait un rendu supplémentaire ; `useSyncExternalStore`
 * donne un instantané serveur cohérent (false) sans cascade.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
