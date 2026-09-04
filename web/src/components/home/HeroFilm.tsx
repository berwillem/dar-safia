'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

/**
 * ══════════════════════════════════════════════════════════════
 *   HERO — LE FILM
 * ══════════════════════════════════════════════════════════════
 *
 * Parti pris : l'intro cinématique N'EST PAS une animation séparée posée
 * devant le hero. Le film s'ouvre déjà sur le noir et monte vers la lumière ;
 * on utilise donc ses propres premières secondes comme introduction. Un voile
 * noir se lève pendant que la lumière arrive, la typographie sort de
 * l'obscurité à sa place définitive, et rien ne « saute » entre l'intro et le
 * hero. Un seul plan, continu.
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
const INTRO_SESSION_KEY = 'darsafia.intro.seen';

/**
 * « L'intro doit-elle jouer ? » est une lecture du navigateur (sessionStorage
 * + prefers-reduced-motion), pas un état React : on l'expose donc via
 * useSyncExternalStore. Cela évite un setState dans un effet — que React 19
 * signale comme provoquant des rendus en cascade — et donne un instantané
 * serveur cohérent (false : pas d'intro au rendu statique).
 *
 * La valeur ne change jamais après le montage ; l'abonnement est donc vide.
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

  const wantsIntro = useSyncExternalStore(noSubscribe, readIntroPlays, () => false);
  // Permet de couper l'intro en cours (bouton « passer »).
  const [skipped, setSkipped] = useState(false);
  const introPlays = wantsIntro && !skipped;

  // Rebouclage sur le point de raccord plutôt que sur zéro.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      video.currentTime = LOOP_POINT;
      void video.play();
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

  // Orchestration : voile qui se lève, typographie qui émerge, parallaxe.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (disposed || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduced) {
          gsap.set(['[data-veil]', '[data-hero-line]', '[data-hero-tail]'], {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0 0 0)',
          });
          gsap.set('[data-veil]', { opacity: 0 });
          return;
        }

        // ── Ouverture ──
        const open = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (introPlays) {
          // Le voile part opaque : le film joue dessous, encore dans le noir.
          open
            .fromTo('[data-veil]', { opacity: 1 }, { opacity: 0, duration: 1.6, delay: 0.5 })
            // La typographie sort de l'obscurité PENDANT que la lumière monte.
            .fromTo(
              '[data-hero-line]',
              { yPercent: 108 },
              { yPercent: 0, duration: 1.5, stagger: 0.12 },
              0.55
            )
            .fromTo(
              '[data-hero-tail]',
              { opacity: 0, y: 18 },
              { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 },
              1.35
            );
        } else {
          gsap.set('[data-veil]', { opacity: 0 });
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

  const dismissIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      /* stockage indisponible : sans conséquence */
    }
  }, []);

  // Marque la session comme vue dès le montage : un rechargement pendant
  // l'intro ne doit pas la rejouer. Écriture dans un système externe —
  // usage légitime d'un effet.
  useEffect(() => {
    if (wantsIntro) dismissIntro();
  }, [wantsIntro, dismissIntro]);

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

        {/* ── Voile d'ouverture ── */}
        <div data-veil aria-hidden="true" className="pointer-events-none absolute inset-0 bg-noir" />
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

      {/* Sortie clavier immédiate tant que le voile est là. */}
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
