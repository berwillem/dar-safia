import Link from 'next/link';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';

import { LocaleSwitcher } from './i18n/LocaleSwitcher';
import { CartButton } from './cart/CartButton';

/**
 * En-tête du site.
 *
 * Composant serveur : seuls le bouton panier et le sélecteur de langue sont
 * des îlots client. La navigation reste du HTML pur.
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const nav = [
    { href: '/parfums', label: dict.nav.perfumes },
    { href: '/trouver', label: dict.nav.scentFinder },
    { href: '/parfums?genre=femme', label: dict.nav.forHer },
    { href: '/parfums?genre=homme', label: dict.nav.forHim },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-smoke-2 bg-noir/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-(--container-site) items-center gap-4 px-5 py-3.5 md:px-8">
        <Link
          href={localePath(locale, '/')}
          className="font-display text-lg tracking-wide text-ivory transition-colors hover:text-gold"
        >
          {dict.common.brandName}
        </Link>

        <nav aria-label={dict.nav.perfumes} className="ms-auto hidden md:block">
          <ul className="flex items-center gap-7">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={localePath(locale, href)}
                  className="text-2xs tracking-(--tracking-label) text-ivory/70 uppercase transition-colors hover:text-gold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 md:ms-0">
          <LocaleSwitcher current={locale} label={dict.nav.language} />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
