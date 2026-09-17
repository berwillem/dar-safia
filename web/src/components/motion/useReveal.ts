'use client';

import { useEffect, type RefObject } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   RÉVÉLATION AU DÉFILEMENT
 * ══════════════════════════════════════════════════════════════
 *
 * Un seul mécanisme partagé par toutes les sections, plutôt qu'une timeline
 * réécrite à chaque fois. Deux gestes, et deux seulement :
 *   [data-rise]   — une ligne de titre qui se POSE : elle monte à peine et
 *                   passe du flou au net, comme une mise au point.
 *   [data-fade]   — un bloc qui arrive, discrètement (texte courant, liens).
 *
 * ── Pourquoi ce n'est plus une tween minutée ──
 * L'ancienne version lançait, au franchissement d'un seuil, une animation de
 * durée fixe (1,15 s, `power3.out`) depuis un masque à 110 %. `power3.out`
 * dépense l'essentiel du trajet dans les premiers instants : quelle que soit la
 * douceur du geste, la ligne JAILLISSAIT. Le mouvement ne répondait pas à la
 * main, il la devançait.
 *
 * Désormais, ce qui entre par le bas est ADOSSÉ au défilement (`scrub`) : la
 * ligne progresse exactement au rythme où l'on descend, et s'arrête si l'on
 * s'arrête. Lenis lisse déjà la position ; le `scrub` numérique ajoute un
 * léger retard qui adoucit les à-coups de molette.
 *
 * Ce qui est DÉJÀ visible au chargement ne peut pas être adossé au
 * défilement — il resterait à moitié révélé tant qu'on ne bouge pas. Il reçoit
 * donc une entrée minutée, mais longue et régulière (`power1.out`), lignes
 * légèrement décalées.
 *
 * Le flou est réservé aux titres : sur des paragraphes entiers, animer
 * `filter` coûte cher pour un gain imperceptible.
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
          gsap.set([...rise, ...fade], { opacity: 1, y: 0, yPercent: 0, filter: 'none' });
          return;
        }

        /** Déjà dans la fenêtre au montage ? Alors pas de scrub possible. */
        const inView = (el: HTMLElement) => el.getBoundingClientRect().top < window.innerHeight * 0.92;

        // Les lignes de titre vivent dans un masque `overflow-hidden` hérité de
        // l'ancien geste. Il rognerait le flou et les jambages pendant la mise
        // au point : on le libère.
        rise.forEach((el) => {
          const mask = el.parentElement;
          if (mask && getComputedStyle(mask).overflow === 'hidden') {
            gsap.set(mask, { overflow: 'visible' });
          }
        });

        // Cadence des lignes d'un même titre : la deuxième suit la première,
        // elles ne partent pas ensemble comme un bloc.
        const lineIndex = (el: HTMLElement) => {
          const heading = el.closest('h1, h2, h3');
          return heading ? Math.max(0, gsap.utils.toArray('[data-rise]', heading).indexOf(el)) : 0;
        };

        rise.forEach((el) => {
          const from = { opacity: 0, y: 26, filter: 'blur(10px)' };
          const to = { opacity: 1, y: 0, filter: 'blur(0px)' };
          if (inView(el)) {
            gsap.fromTo(el, from, {
              ...to,
              duration: 1.9,
              delay: 0.15 + lineIndex(el) * 0.14,
              ease: 'power1.out',
              clearProps: 'filter',
            });
          } else {
            gsap.fromTo(el, from, {
              ...to,
              ease: 'power1.out',
              scrollTrigger: {
                trigger: el,
                start: `top ${96 - lineIndex(el) * 3}%`,
                end: 'top 66%',
                scrub: 0.8,
              },
            });
          }
        });

        fade.forEach((el, i) => {
          const from = { opacity: 0, y: 22 };
          const to = { opacity: 1, y: 0 };
          if (inView(el)) {
            gsap.fromTo(el, from, {
              ...to,
              duration: 1.6,
              delay: 0.45 + (i % 4) * 0.1,
              ease: 'power1.out',
            });
          } else {
            gsap.fromTo(el, from, {
              ...to,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 74%', scrub: 0.8 },
            });
          }
        });
      }, ref);

      // Onglet ouvert en arrière-plan : `requestAnimationFrame` est gelé et les
      // positions de défilement mesurées au montage peuvent être fausses. Au
      // retour sur l'onglet — ou à la restauration depuis le cache historique —
      // on recalcule.
      const onShow = () => {
        if (!document.hidden) ScrollTrigger.refresh();
      };
      document.addEventListener('visibilitychange', onShow);
      window.addEventListener('pageshow', onShow);

      teardown = () => {
        document.removeEventListener('visibilitychange', onShow);
        window.removeEventListener('pageshow', onShow);
        ctx.revert();
      };
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
