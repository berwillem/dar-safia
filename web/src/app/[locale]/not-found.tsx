import Link from 'next/link';
import { locale as getLocale } from 'next/root-params';

import { DEFAULT_LOCALE, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/routing';

/**
 * Page 404.
 *
 * Next fournit une page par défaut sans typographie ni couleurs de la maison :
 * une rupture au milieu du parcours. Celle-ci garde l'univers et propose une
 * sortie. La langue est lue via next/root-params (params n'est pas passé à
 * not-found).
 */
export default async function NotFound() {
  const raw = (await getLocale()) ?? DEFAULT_LOCALE;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
  const nf = dict.notFound;

  return (
    <main
      id="contenu"
      className="mx-auto flex min-h-[70vh] max-w-(--container-site) flex-col items-start justify-center px-5 py-20 md:px-8"
    >
      <p className="text-3xs font-semibold tracking-(--tracking-eyebrow) text-gold uppercase">
        {nf.eyebrow}
      </p>
      <h1 className="mt-5 max-w-2xl font-serif text-display-md text-balance text-ivory">
        {nf.title}
      </h1>
      <p className="mt-5 max-w-md font-body text-xl leading-relaxed text-ivory/65">
        {nf.body}
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href={localePath(locale, '/parfums')}
          className="rounded-sm bg-gold px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light"
        >
          {nf.seeCollection}
        </Link>
        <Link
          href={localePath(locale, '/')}
          className="rounded-sm border border-smoke-2 px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-ivory/75 uppercase transition-colors hover:border-gold/50 hover:text-ivory"
        >
          {nf.backHome}
        </Link>
      </div>
    </main>
  );
}
