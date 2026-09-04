'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

import { LocaleSwitcher } from './i18n/LocaleSwitcher';
import { CartButton } from './cart/CartButton';

/**
 * En-tête du site.
 *
 * Sur une page qui s'ouvre sur un plan plein écran, une barre opaque coupe
 * l'image dès la première seconde. L'en-tête reste donc transparent tant
 * qu'on est en haut, et ne prend son fond qu'une fois le film dépassé.
 * Le seuil vient de la hauteur de fenêtre, pas d'une valeur magique.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Le menu retient la page où il a été ouvert. Changer de page le referme
  // donc PENDANT le rendu, sans effet ni setState en cascade.
  const [menu, setMenu] = useState({ open: false, at: pathname });
  const menuOpen = menu.open && menu.at === pathname;
  const setMenuOpen = (open: boolean) => setMenu({ open, at: pathname });

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // setMenu est stable ; setMenuOpen serait recréé à chaque rendu.
      if (e.key === 'Escape') setMenu({ open: false, at: pathname });
    };
    document.addEventListener('keydown', onKey);
    // Le fond ne défile pas derrière le menu ouvert.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('a')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen, pathname]);

  const nav = [
    { href: '/parfums', label: dict.nav.perfumes },
    { href: '/trouver', label: dict.nav.scentFinder },
    { href: '/parfums?genre=femme', label: dict.nav.forHer },
    { href: '/parfums?genre=homme', label: dict.nav.forHim },
    { href: '/contact', label: dict.nav.contact },
  ];

  return (
    <header
      data-lifted={lifted || menuOpen || undefined}
      className="fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ease-(--ease-lux) data-lifted:border-b data-lifted:border-smoke-2 data-lifted:bg-noir/88 data-lifted:backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-(--container-site) items-center gap-4 px-5 py-4 md:px-8">
        <Link
          href={localePath(locale, '/')}
          className="shrink-0 font-serif text-lg whitespace-nowrap tracking-[0.08em] text-ivory transition-colors hover:text-gold"
        >
          {dict.common.brandName}
        </Link>

        <nav aria-label={dict.nav.perfumes} className="ms-auto hidden lg:block">
          <ul className="flex items-center gap-8">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={localePath(locale, href)}
                  className="font-ui text-3xs whitespace-nowrap tracking-[0.16em] text-ivory/75 uppercase transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-0">
          <LocaleSwitcher current={locale} label={dict.nav.language} />
          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            className="rounded-xs p-2 text-ivory/80 transition-colors hover:text-gold lg:hidden"
          >
            {/* Deux traits qui se croisent : le geste dit ce qu'il fait. */}
            <span aria-hidden="true" className="relative block h-3.5 w-5">
              <span
                className="absolute inset-x-0 top-0.5 h-px bg-current transition-transform duration-300 ease-(--ease-lux)"
                style={menuOpen ? { transform: 'translateY(6px) rotate(45deg)' } : undefined}
              />
              <span
                className="absolute inset-x-0 bottom-0.5 h-px bg-current transition-transform duration-300 ease-(--ease-lux)"
                style={menuOpen ? { transform: 'translateY(-6px) rotate(-45deg)' } : undefined}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ── Menu mobile ── */}
      <div
        id="menu-principal"
        ref={panelRef}
        hidden={!menuOpen}
        className="border-t border-smoke-2 bg-noir/97 backdrop-blur-md lg:hidden"
      >
        <nav aria-label={dict.nav.perfumes}>
          <ul className="flex flex-col px-5 py-4 md:px-8">
            {nav.map(({ href, label }) => (
              <li key={href} className="border-b border-smoke-2 last:border-b-0">
                <Link
                  href={localePath(locale, href)}
                  className="block py-4 font-body text-2xl text-ivory transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
