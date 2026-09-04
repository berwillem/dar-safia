import { notFound } from 'next/navigation';

import { ClosingCall } from '@/components/home/ClosingCall';
import { HeroFilm } from '@/components/home/HeroFilm';
import { HouseFigures } from '@/components/home/HouseFigures';
import { Manifesto } from '@/components/home/Manifesto';
import { ScentWorld } from '@/components/home/ScentWorld';
import { SignatureStage } from '@/components/home/SignatureStage';
import { Voices } from '@/components/home/Voices';
import { catalog } from '@/lib/catalog';
import { getSignatureNotes, getSignatureProducts } from '@/lib/home/signatures';
import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/routing';

/** Périmètre de livraison de la maison, affiché partout sur le site. */
const WILAYAS_DESSERVIES = 58;

/**
 * Accueil. Composant serveur : toutes les données passent par `catalog` et par
 * les dérivations de `lib/home`, jamais par products.json en direct.
 *
 * Parti pris (cf. CLAUDE.md) : campagne éditoriale, pas vitrine ecommerce.
 * Un seul mouvement par section ; un seul moment « wow », la séquence des
 * signatures, où la couleur de la page bascule vers l'univers de chaque
 * flacon. Tout le reste se tient.
 */
export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dict, notes, signatures, allProducts, brands] = await Promise.all([
    getDictionary(locale),
    getSignatureNotes(11),
    getSignatureProducts(),
    catalog.listProducts(),
    catalog.listBrands(),
  ]);

  return (
    <main id="contenu" tabIndex={-1}>
      <HeroFilm
        tagline={dict.hero.tagline}
        statement={dict.hero.statement}
        cta={dict.hero.cta}
        ctaHref={localePath(locale, '/parfums')}
        scrollLabel={dict.hero.scroll}
        videoLabel={dict.hero.videoLabel}
        skipLabel={dict.hero.skipIntro}
      />

      <Manifesto dict={dict} />

      <ScentWorld
        notes={notes}
        productCount={allProducts.total}
        locale={locale}
        dict={dict}
      />

      <SignatureStage products={signatures} locale={locale} dict={dict} />

      <HouseFigures
        creations={allProducts.total}
        houses={brands.length}
        wilayas={WILAYAS_DESSERVIES}
        locale={locale}
        dict={dict}
      />

      <Voices dict={dict} />

      <ClosingCall locale={locale} dict={dict} />
    </main>
  );
}
