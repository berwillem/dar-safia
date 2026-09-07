import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { catalog } from '@/lib/catalog';
import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

import { AboutExperience } from './AboutExperience';

/** Périmètre de livraison de la maison, affiché partout sur le site. */
const WILAYAS_DESSERVIES = 58;

/**
 * « La maison ». Coquille serveur : métadonnées, données structurées et les
 * chiffres réels du catalogue (jamais de statistique inventée), puis
 * l'expérience client (hero 3D + sections éditoriales).
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/la-maison'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.nav.about, description: dict.about.metaDescription };
}

export default async function AboutPage({
  params,
}: PageProps<'/[locale]/la-maison'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, products, brands] = await Promise.all([
    getDictionary(locale),
    catalog.listProducts(),
    catalog.listBrands(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: dict.nav.about,
    inLanguage: locale,
    description: dict.about.metaDescription,
    about: {
      '@type': 'Organization',
      name: dict.common.brandName,
      description: dict.footer.blurb,
      areaServed: 'DZ',
    },
  };

  return (
    <main id="contenu" tabIndex={-1}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutExperience
        locale={locale}
        dict={dict}
        figures={{
          creations: products.total,
          houses: brands.length,
          wilayas: WILAYAS_DESSERVIES,
        }}
      />
    </main>
  );
}
