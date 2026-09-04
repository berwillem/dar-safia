'use client';

import { useEffect } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   DÉFILEMENT FLUIDE (Lenis) + SYNCHRO ScrollTrigger
 * ══════════════════════════════════════════════════════════════
 *
 * Lenis interpole le défilement ; ScrollTrigger doit donc lire SA position
 * plutôt que celle du navigateur, sinon les deux dérivent et les animations
 * se déclenchent au mauvais moment.
 *
 * Sous `prefers-reduced-motion`, Lenis n'est pas monté du tout : le
 * défilement natif reste le plus prévisible, et c'est ce que demande la
 * préférence.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        // Assez long pour paraître cinématique, assez court pour ne pas
        // donner l'impression que la page résiste.
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        // Le tactile garde une inertie proche du natif : la surcharger donne
        // toujours une sensation de flottement sur mobile.
        touchMultiplier: 1.6,
      });

      lenis.on('scroll', ScrollTrigger.update);

      // Une seule boucle d'animation : GSAP pilote Lenis, plutôt que deux
      // rAF concurrents qui se disputeraient la frame.
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      teardown = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, []);

  return null;
}
