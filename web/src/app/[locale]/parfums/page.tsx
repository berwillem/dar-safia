import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/components/ProductCard';
import { catalog, type FragranceFamily, type Gender } from '@/lib/catalog';
import { formatFamily, formatGender } from '@/lib/format';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary, interpolate } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/routing';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/parfums'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.catalog.title };
}

const GENDERS: Gender[] = ['femme', 'homme', 'unisexe'];
const FAMILIES: FragranceFamily[] = [
  'floral', 'amber', 'woody', 'fresh', 'gourmand', 'spicy',
];

/** URL de filtre préservant l'autre critère, préfixée par la langue. */
function filterHref(
  locale: Locale,
  current: { genre?: string; famille?: string },
  key: 'genre' | 'famille',
  value: string | null
): string {
  const next = { ...current, [key]: value ?? undefined };
  const query = new URLSearchParams();
  if (next.genre) query.set('genre', next.genre);
  if (next.famille) query.set('famille', next.famille);
  const suffix = query.toString();
  return localePath(locale, suffix ? `/parfums?${suffix}` : '/parfums');
}

export default async function CatalogPage({
  params,
  searchParams,
}: PageProps<'/[locale]/parfums'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, filters] = await Promise.all([getDictionary(locale), searchParams]);
  const c = dict.catalog;

  const genreParam = typeof filters.genre === 'string' ? filters.genre : undefined;
  const familleParam = typeof filters.famille === 'string' ? filters.famille : undefined;

  const gender = GENDERS.includes(genreParam as Gender)
    ? (genreParam as Gender)
    : undefined;
  const family = FAMILIES.includes(familleParam as FragranceFamily)
    ? (familleParam as FragranceFamily)
    : undefined;

  const { items, total } = await catalog.listProducts({ gender, family, sort: 'name' });
  const active = { genre: gender, famille: family };

  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="mx-auto max-w-(--container-site) px-5 py-14 md:px-8"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        {c.eyebrow}
      </p>
      <h1 className="mt-4 font-serif text-display-md text-balance text-ivory">{c.title}</h1>

      <div className="mt-10 flex flex-col gap-4 border-y border-smoke-2 py-5">
        <FilterRow
          legend={c.filterGender}
          allLabel={c.all}
          options={GENDERS.map((g) => ({ value: g, label: formatGender(g, dict) }))}
          activeValue={gender}
          hrefFor={(value) => filterHref(locale, active, 'genre', value)}
        />
        <FilterRow
          legend={c.filterFamily}
          allLabel={c.all}
          options={FAMILIES.map((f) => ({ value: f, label: formatFamily(f, dict) }))}
          activeValue={family}
          hrefFor={(value) => filterHref(locale, active, 'famille', value)}
        />
      </div>

      <p className="mt-6 text-2xs text-ivory/45" aria-live="polite">
        {interpolate(c.count, { count: total })}
      </p>

      {items.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} locale={locale} dict={dict} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-md border border-smoke-2 bg-noir-2 px-6 py-14 text-center">
          <p className="font-serif text-lg text-ivory">{c.empty}</p>
          <p className="mt-2 text-2xs text-ivory/50">{c.emptyHint}</p>
          <Link
            href={localePath(locale, '/parfums')}
            className="mt-6 inline-block rounded-sm border border-gold px-5 py-2.5 text-2xs font-semibold tracking-(--tracking-label) text-gold uppercase transition-colors hover:bg-gold hover:text-noir"
          >
            {c.emptyCta}
          </Link>
        </div>
      )}
    </main>
  );
}

function FilterRow({
  legend,
  allLabel,
  options,
  activeValue,
  hrefFor,
}: {
  legend: string;
  allLabel: string;
  options: { value: string; label: string }[];
  activeValue: string | undefined;
  hrefFor: (value: string | null) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-3xs tracking-(--tracking-label) text-ivory/40 uppercase">
        {legend}
      </span>

      <Link
        href={hrefFor(null)}
        aria-current={activeValue === undefined ? 'true' : undefined}
        className={chip(activeValue === undefined)}
      >
        {allLabel}
      </Link>

      {options.map(({ value, label }) => (
        <Link
          key={value}
          href={hrefFor(value)}
          aria-current={activeValue === value ? 'true' : undefined}
          className={chip(activeValue === value)}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

/** L'état actif n'est pas signalé par la seule couleur : le fond change aussi. */
function chip(isActive: boolean): string {
  return [
    'rounded-xs border px-3 py-1.5 text-2xs tracking-(--tracking-label) uppercase transition-colors',
    isActive
      ? 'border-gold bg-gold text-noir font-semibold'
      : 'border-smoke-2 text-ivory/65 hover:border-gold/50 hover:text-ivory',
  ].join(' ');
}
