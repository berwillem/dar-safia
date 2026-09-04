import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

import { ScentFinder } from './ScentFinder';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/trouver'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.scentFinder.title, description: dict.scentFinder.intro };
}

/**
 * Page « Trouver votre parfum ». Coquille serveur : elle pose le décor et
 * monte le composant client du diagnostic. Le score tourne dans une Server
 * Action.
 */
export default async function ScentFinderPage({
  params,
}: PageProps<'/[locale]/trouver'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const sf = dict.scentFinder;

  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-5 pt-28 pb-14 md:px-8 md:pt-36 md:pb-20"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        {sf.eyebrow}
      </p>
      <h1 className="mt-4 font-serif text-display-md text-balance text-ivory">
        {sf.title}
      </h1>
      <p className="mt-4 max-w-md font-body text-xl leading-relaxed text-ivory/65">
        {sf.intro}
      </p>

      <div className="mt-12">
        <ScentFinder />
      </div>
    </main>
  );
}
