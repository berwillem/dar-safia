import type { Metadata } from 'next';
import {
  Cairo,
  Cinzel,
  Cinzel_Decorative,
  Cormorant_Garamond,
  Montserrat,
  Noto_Naskh_Arabic,
} from 'next/font/google';
import { notFound } from 'next/navigation';

import { PlaceholderPhoneBanner } from '@/components/PlaceholderPhoneBanner';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { I18nProvider } from '@/components/i18n/I18nProvider';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { DIRECTION, LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

import '../globals.css';

/**
 * Polices auto-hébergées par next/font (fichiers servis depuis notre domaine,
 * pas de requête Google Fonts, pas de décalage au chargement).
 *
 * Latin : Cinzel Decorative / Cinzel / Cormorant / Montserrat.
 * Arabe : Noto Naskh Arabic (titres, équivalent serif) et Cairo (interface).
 * Les deux jeux sont toujours chargés ; le CSS choisit selon `dir`.
 */
const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-cinzel-decorative',
  display: 'swap',
});
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});
const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic-serif',
  display: 'swap',
});
const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic-sans',
  display: 'swap',
});

const FONT_VARS = [
  cinzelDecorative.variable,
  cinzel.variable,
  cormorant.variable,
  montserrat.variable,
  notoNaskh.variable,
  cairo.variable,
].join(' ');

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: 'Dar Safia — Maison de Haute Parfumerie',
    template: '%s | Dar Safia',
  },
  description:
    "Parfums niche et signatures d'exception, sélectionnés et livrés dans les 58 wilayas.",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const dir = DIRECTION[locale];

  return (
    <html lang={locale} dir={dir} className={FONT_VARS} data-dir={dir}>
      <body className="min-h-screen antialiased">
        {/* L'en-tête part masqué sur l'accueil, le temps que l'intro le fasse
            entrer (cf. SiteHeader). Sans JavaScript, personne ne le
            révélerait : on rend la navigation à ceux qui n'en ont pas. */}
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: '[data-nav-item]{opacity:1!important;transform:none!important}',
            }}
          />
        </noscript>

        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:z-50 focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-noir focus:start-0"
        >
          {dict.nav.skipToContent}
        </a>

        <I18nProvider locale={locale} dict={dict}>
          {/* Le provider n'englobe que du contexte : les pages restent
              des composants serveur. */}
          <CartProvider>
            <SmoothScroll />
            <SiteHeader locale={locale} dict={dict} />
            {children}
            <SiteFooter locale={locale} dict={dict} />
            <CartDrawer />
            <PlaceholderPhoneBanner dict={dict} />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
