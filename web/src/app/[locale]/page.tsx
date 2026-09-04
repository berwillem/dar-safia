import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/ProductCard';
import { catalog } from '@/lib/catalog';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/routing';

/**
 * Accueil. Composant serveur : les données passent par `catalog`, jamais par
 * products.json en direct.
 *
 * Parti pris : éditorial et retenu. Un seul mouvement, à l'ouverture.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, featured, all, brands] = await Promise.all([
    getDictionary(locale),
    catalog.listProducts({ featured: true, limit: 8, sort: 'price-desc' }),
    catalog.listProducts(),
    catalog.listBrands(),
  ]);

  const h = dict.home;
  const pillars = [h.pillars.authentic, h.pillars.sillage, h.pillars.concierge];

  return (
    <main id="contenu" tabIndex={-1}>
      {/* ── Ouverture ── */}
      <section className="mx-auto max-w-(--container-site) px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="ds-rise-stagger max-w-3xl">
          <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
            {h.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-display-lg leading-[1.05] text-balance text-ivory">
            {dict.common.brandName}
          </h1>
          <p className="mt-6 max-w-xl font-body text-xl leading-relaxed text-ivory/70">
            {h.tagline}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, '/parfums')}
              className="rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
            >
              {h.explore}
            </Link>
            <Link
              href={localePath(locale, '/trouver')}
              className="rounded-sm border border-smoke-2 px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-ivory/80 uppercase transition-colors hover:border-gold hover:text-gold"
            >
              {h.findYours}
            </Link>
          </div>
        </div>

        <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-smoke-2 pt-8">
          {[
            { label: h.stats.creations, value: all.total },
            { label: h.stats.houses, value: brands.length },
            { label: h.stats.wilayas, value: 58 },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-3xs tracking-(--tracking-label) text-ivory/45 uppercase">
                {label}
              </dt>
              <dd className="mt-1 font-serif text-2xl text-gold-light tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── La maison ── */}
      <section aria-labelledby="maison" className="border-y border-smoke-2 bg-noir-2">
        <div className="mx-auto max-w-(--container-site) px-5 py-16 md:px-8 md:py-20">
          <span className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
            {h.houseEyebrow}
          </span>
          <h2
            id="maison"
            className="mt-4 max-w-2xl font-serif text-display-md text-balance text-ivory"
          >
            {h.houseTitle}
          </h2>
          <p className="mt-5 max-w-2xl font-body text-xl leading-relaxed text-ivory/65">
            {h.houseBody}
          </p>

          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="border-t border-gold/30 pt-4">
                <h3 className="font-serif text-lg text-ivory">{pillar.title}</h3>
                <p className="mt-2 text-md leading-relaxed text-ivory/55">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Sélection ── */}
      <section
        aria-labelledby="selection"
        className="mx-auto max-w-(--container-site) px-5 py-16 md:px-8 md:py-20"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-smoke-2 pb-4">
          <h2 id="selection" className="font-serif text-xl text-ivory">
            {h.selectionTitle}
          </h2>
          <Link
            href={localePath(locale, '/parfums')}
            className="text-3xs tracking-(--tracking-label) text-gold uppercase transition-colors hover:text-gold-light"
          >
            {h.seeAll}
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featured.items.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} dict={dict} />
          ))}
        </div>
      </section>

      {/* ── Diagnostic ── */}
      <section className="border-t border-smoke-2 bg-noir-2">
        <div className="mx-auto flex max-w-(--container-site) flex-col items-start gap-5 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8 md:py-20">
          <div className="max-w-lg">
            <span className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
              {h.quizBandEyebrow}
            </span>
            <h2 className="mt-3 font-serif text-display-sm text-balance text-ivory">
              {h.quizBandTitle}
            </h2>
          </div>
          <Link
            href={localePath(locale, '/trouver')}
            className="shrink-0 rounded-sm bg-gold px-7 py-3.5 text-sm font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
          >
            {h.quizBandCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
