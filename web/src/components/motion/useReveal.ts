'use client';

import { useEffect, type RefObject } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   RÉVÉLATION AU DÉFILEMENT
 * ══════════════════════════════════════════════════════════════
 *
 * Un seul mécanisme partagé par les sections de l'accueil, plutôt qu'une
 * timeline réécrite à chaque fois.
 *
 * Deux gestes, et deux seulement :
 *   [data-rise]   — la ligne monte depuis un masque (typographie).
 *   [data-fade]   — le bloc arrive, discrètement (texte courant, liens).
 *
 * Le parti pris de retenue tient à ce que la liste s'arrête là : pas de
 * troisième effet « parce qu'il reste un élément ».
 *
 * Sous prefers-reduced-motion, rien n'est animé et tout est posé à l'état
 * final — la page reste lisible, elle ne reste pas vide.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (disposed || !ref.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const rise = gsap.utils.toArray<HTMLElement>('[data-rise]');
        const fade = gsap.utils.toArray<HTMLElement>('[data-fade]');

        if (reduced) {
          gsap.set([...rise, ...fade], { opacity: 1, yPercent: 0, y: 0 });
          return;
        }

        rise.forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: 110 },
            {
              yPercent: 0,
              duration: 1.15,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
          );
        });

        fade.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              delay: (i % 4) * 0.07,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            }
          );
        });
      }, ref);

      teardown = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
