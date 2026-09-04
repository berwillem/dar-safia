import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { catalog } from '@/lib/catalog';
import { isLocale, LOCALES } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

import { ShopExperience } from './ShopExperience';
import { toShopProduct } from './shop-product';

/**
 * Boutique. Coquille serveur : le catalogue complet est chargé une fois,
 * réduit à ce que le filtrage et la fiche ont besoin (`toShopProduct`, qui
 * calcule aussi les étiquettes de filtre — voir `lib/catalog/derive-tags.ts`),
 * puis confié à `ShopExperience` qui filtre en mémoire côté client.
 *
 * Plus de `searchParams` à lire : la page redevient statique (SSG, comme
 * avant l'ajout des filtres par URL).
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/parfums'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.catalog.title };
}

export default async function CatalogPage({ params }: PageProps<'/[locale]/parfums'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, { items }] = await Promise.all([getDictionary(locale), catalog.listProducts()]);
  const c = dict.catalog;
  const products = items.map(toShopProduct);

  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="mx-auto max-w-(--container-site) px-5 pt-28 pb-14 md:px-8 md:pt-32"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        {c.eyebrow}
      </p>
      <h1 className="mt-4 font-serif text-display-md text-balance text-ivory">{c.title}</h1>

      <ShopExperience products={products} locale={locale} dict={dict} />
    </main>
  );
}
