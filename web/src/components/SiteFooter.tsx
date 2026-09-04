import Link from 'next/link';

import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { interpolate } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';
import { whatsappUrl } from '@/lib/whatsapp';

/**
 * Pied de page. Composant serveur. Volontairement sobre : liens, une entrée
 * conciergerie, mention légale. Les coordonnées physiques et l'e-mail ne sont
 * pas repris tant qu'ils ne sont pas confirmés.
 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const conciergeUrl = whatsappUrl(dict.common.conciergeMessage);

  const columns = [
    {
      title: dict.footer.collection,
      links: [
        { href: '/parfums', label: dict.footer.allPerfumes },
        { href: '/parfums?genre=femme', label: dict.footer.forHer },
        { href: '/parfums?genre=homme', label: dict.footer.forHim },
        { href: '/trouver', label: dict.footer.findYours },
      ],
    },
    {
      title: dict.footer.families,
      links: [
        { href: '/parfums?famille=floral', label: dict.family.floral },
        { href: '/parfums?famille=woody', label: dict.family.woody },
        { href: '/parfums?famille=amber', label: dict.family.amber },
        { href: '/parfums?famille=fresh', label: dict.family.fresh },
      ],
    },
  ];

  return (
    <footer className="border-t border-smoke-2 bg-noir-2">
      <div className="mx-auto max-w-(--container-site) px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))] md:gap-8">
          <div>
            <p className="font-display text-lg text-ivory">{dict.common.brandName}</p>
            <p className="mt-3 max-w-xs font-body text-md leading-relaxed text-ivory/55">
              {dict.footer.blurb}
            </p>
            {conciergeUrl && (
              <a
                href={conciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block text-2xs tracking-(--tracking-label) text-gold uppercase transition-colors hover:text-gold-light"
              >
                {dict.footer.concierge}
              </a>
            )}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="text-3xs tracking-(--tracking-label) text-ivory/40 uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={localePath(locale, link.href)}
                      className="text-md text-ivory/65 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-smoke-2 pt-6">
          <p className="text-3xs text-ivory/40">
            {interpolate(dict.footer.rights, { year: new Date().getFullYear() })}
          </p>
          <p className="text-3xs text-ivory/40">{dict.footer.guarantee}</p>
        </div>
      </div>
    </footer>
  );
}
