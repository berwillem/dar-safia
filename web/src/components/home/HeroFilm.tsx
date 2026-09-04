'use client';

import { useEffect, useRef, useState } from 'react';

import { CURTAIN_DONE, CURTAIN_DURATION, COUNTER_DURATION, COUNTER_HOLD, dismissIntro, useIntroPlays } from './intro-timing';

/**
 * ══════════════════════════════════════════════════════════════
 *   HERO — LE FILM
 * ══════════════════════════════════════════════════════════════
 *
 * L'intro cinématique n'est toujours pas une animation séparée POSÉE devant
 * le hero : le compte à rebours et le rideau jouent devant le film, déjà en
 * train de charger et de tourner (muet) dessous, puis s'écartent pour le
 * révéler — un seul plan continu, jamais un saut entre deux mises en scène.
 *
 * Composition analysée image par image (grille de luminance 4×3, six
 * instants) :
 *   - produit au CENTRE, bougie et bokeh en HAUT À DROITE (jusqu'à 148/255) :
 *     zones interdites au texte ;
 *   - bande BASSE jamais au-dessus de 53/255 sur tout le plan : seule zone
 *     réellement sûre. La typographie y est donc ancrée, alignée à gauche.
 *
 * Bouclage : le plan ne boucle pas (fin lumineuse, début noir). La frame la
 * plus proche de la fin est à 3,5 s — on reboucle donc là plutôt qu'à zéro.
 */

const LOOP_POINT = 3.5;
const CURTAIN_EASE_ID = 'darsafia-curtain';

export function HeroFilm({
  tagline,
  statement,
  cta,
  ctaHref,
  scrollLabel,
  videoLabel,
  skipLabel,
}: {
  tagline: string;
  statement: string;
  cta: string;
  ctaHref: string;
  scrollLabel: string;
  videoLabel: string;
  skipLabel: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const wantsIntro = useIntroPlays();
  // Permet de couper l'intro en cours (bouton « passer »).
  const [skipped, setSkipped] = useState(false);
  const introPlays = wantsIntro && !skipped;

  // Rebouclage sur le point de raccord plutôt que sur zéro.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      video.currentTime = LOOP_POINT;
      // L'onglet a pu passer en arrière-plan entre-temps : `play()` est alors
      // rejeté par le navigateur (économie d'énergie) — rejet attendu, pas
      // une erreur à laisser remonter en promesse non gérée.
      void video.play().catch(() => {});
    };
    // Les navigateurs mettent la vidéo en pause quand l'onglet passe en
    // arrière-plan et ne la relancent pas toujours au retour.
    const onVisible = () => {
      if (!document.hidden && video.paused) void video.play().catch(() => {});
    };
    video.addEventListener('ended', onEnded);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // Orchestration : compteur, rideau, typographie qui émerge, parallaxe.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }, { CustomEase }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/CustomEase'),
      ]);
      if (disposed || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      // La demande de la maison : un cubic-bezier feutré, jamais élastique.
      CustomEase.create(CURTAIN_EASE_ID, '0.76, 0, 0.24, 1');

      const ctx = gsap.context(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
          gsap.set(['[data-hero-line]', '[data-hero-tail]'], {
            opacity: 1,
            y: 0,
            yPercent: 0,
          });
          gsap.set(
            ['[data-curtain-left]', '[data-curtain-right]', '[data-counter]', '[data-curtain-seam]'],
            { opacity: 0 }
          );
          return;
        }

        // ── Ouverture ──
        const open = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (introPlays) {
          const counter = { value: 0 };
          open
            // Le compteur tourne pendant que le film, déjà lancé, charge
            // sous le rideau — rien n'est perçu à l'écran avant le rideau.
            .to(
              counter,
              {
                value: 100,
                duration: COUNTER_DURATION,
                ease: 'power1.inOut',
                onUpdate: () => {
                  if (counterRef.current) {
                    counterRef.current.textContent = String(Math.round(counter.value));
                  }
                },
              },
              0
            )
            .to('[data-counter]', { opacity: 0, duration: 0.3 }, COUNTER_DURATION + COUNTER_HOLD - 0.3)
            // Le rideau : deux pans, teintes de la maison, séparés par un
            // filet or — pas de couleur nouvelle.
            .fromTo(
              '[data-curtain-left]',
              { xPercent: 0 },
              { xPercent: -100, duration: CURTAIN_DURATION, ease: CURTAIN_EASE_ID },
              COUNTER_DURATION + COUNTER_HOLD
            )
            .fromTo(
              '[data-curtain-right]',
              { xPercent: 0 },
              { xPercent: 100, duration: CURTAIN_DURATION, ease: CURTAIN_EASE_ID },
              COUNTER_DURATION + COUNTER_HOLD
            )
            // Le filet suit l'écart des deux pans plutôt que de rester figé
            // au centre : il s'efface dès que le rideau commence à s'ouvrir.
            .to(
              '[data-curtain-seam]',
              { opacity: 0, duration: 0.4 },
              COUNTER_DURATION + COUNTER_HOLD
            )
            // La typographie sort de l'obscurité pendant que le rideau finit
            // de s'écarter — pas après : un seul mouvement, pas deux à la file.
            .fromTo(
              '[data-hero-line]',
              { yPercent: 108 },
              { yPercent: 0, duration: 1.5, stagger: 0.12 },
              CURTAIN_DONE - 0.5
            )
            .fromTo(
              '[data-hero-tail]',
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 },
              CURTAIN_DONE + 0.3
            );
        } else {
          gsap.set(
            ['[data-curtain-left]', '[data-curtain-right]', '[data-counter]', '[data-curtain-seam]'],
            { opacity: 0 }
          );
          open
            .fromTo(
              '[data-hero-line]',
              { yPercent: 108 },
              { yPercent: 0, duration: 1.1, stagger: 0.1 }
            )
            .fromTo(
              '[data-hero-tail]',
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
              0.5
            );
        }

        // ── Sortie au défilement ──
        // Le film s'enfonce légèrement et s'assombrit : le hero cède la place
        // au lieu de disparaître d'un coup.
        gsap.to('[data-film]', {
          yPercent: 12,
          scale: 1.06,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
        gsap.to('[data-hero-type]', {
          yPercent: -28,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: '65% top',
            scrub: true,
          },
        });
      }, rootRef);

      teardown = () => ctx.revert();
    })();

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [introPlays]);

  // Marque la session comme vue dès le montage : un rechargement pendant
  // l'intro ne doit pas la rejouer. Écriture dans un système externe —
  // usage légitime d'un effet.
  useEffect(() => {
    if (wantsIntro) dismissIntro();
  }, [wantsIntro]);

  const [first, second] = statement.split('\n');

  return (
    <section ref={rootRef} className="hero-film relative w-full overflow-hidden bg-noir">
      {/* ── La plaque : le film dans son cadrage ── */}
      <div className="hero-film__plate">
        <div data-film className="absolute inset-0 will-change-transform">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/video/hero.mp4"
            autoPlay
            muted
            loop={false}
            playsInline
            preload="auto"
            aria-label={videoLabel}
            // Le plan s'ouvre sur le noir : un fond noir EST le bon poster.
            style={{ backgroundColor: '#1a120f' }}
          />
        </div>

        {/* Dégradé mesuré : renforce la zone déjà sombre, ne voile pas le produit. */}
        <div aria-hidden="true" className="hero-film__scrim" />

        {/* ── Rideau d'ouverture : deux pans + compteur ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
          <div data-curtain-left className="absolute inset-y-0 left-0 w-1/2 bg-noir" />
          <div data-curtain-right className="absolute inset-y-0 right-0 w-1/2 bg-burgundy" />
          {/* Filet or au raccord des deux pans. */}
          <div
            data-curtain-seam
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gold/70"
          />
          <div
            data-counter
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex items-baseline gap-1 font-serif text-3xl tracking-[0.14em] text-ivory tabular-nums">
              <span ref={counterRef}>0</span>
              <span className="text-lg text-gold-light/90">%</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Typographie ── */}
      <div data-hero-type className="hero-film__type px-6 pb-16 md:px-12 md:pb-20 lg:px-20">
        <div className="max-w-[42rem] pt-8">
          <p data-hero-tail className="font-serif text-sm text-gold-light/90 italic">
            {tagline}
          </p>

          <h1 className="mt-4 font-body font-light text-ivory">
            {[first, second].filter(Boolean).map((line) => (
              <span key={line} className="block overflow-hidden">
                <span
                  data-hero-line
                  className="block text-[clamp(1.95rem,4.4vw,3.5rem)] leading-[1.08] tracking-[-0.015em]"
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <div data-hero-tail className="mt-7">
            <a
              href={ctaHref}
              className="group relative inline-flex items-center pb-1 font-ui text-2xs tracking-[0.2em] text-ivory uppercase"
            >
              {cta}
              {/* Le trait se rétracte vers la fin de ligne, il ne glisse pas. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-gold transition-transform duration-500 ease-(--ease-lux) group-hover:scale-x-0"
              />
            </a>
          </div>
        </div>

        {/* ── Indicateur de défilement ──
            Hors flux : dans le flux, il repoussait la typographie vers le
            haut, en plein sur le coffret. */}
        <div
          data-hero-tail
          className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex"
        >
          <span className="flex items-center gap-3 font-ui text-3xs tracking-[0.28em] text-ivory/40 uppercase">
            {scrollLabel}
            <span aria-hidden="true" className="ds-scroll-rule h-8 w-px bg-ivory/25" />
          </span>
        </div>
      </div>

      {/* Sortie clavier immédiate tant que le rideau est là. */}
      {introPlays && (
        <button
          type="button"
          onClick={() => {
            dismissIntro();
            setSkipped(true);
          }}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:rounded-sm focus:bg-gold focus:px-4 focus:py-2 focus:font-ui focus:text-2xs focus:text-noir"
        >
          {skipLabel}
        </button>
      )}
    </section>
  );
}
