import type { Metadata } from 'next';
import { Cinzel, Cinzel_Decorative, Cormorant_Garamond, Montserrat } from 'next/font/google';

import { PlaceholderPhoneBanner } from '@/components/PlaceholderPhoneBanner';
import { SiteHeader } from '@/components/SiteHeader';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';

import './globals.css';

/**
 * Polices de la maison, servies par next/font : les fichiers sont
 * auto-hébergés au build, ce qui supprime la requête vers Google Fonts et le
 * décalage de mise en page au chargement (l'ancien site chargeait quatre
 * familles depuis le CDN Google).
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

export const metadata: Metadata = {
  title: {
    default: 'Dar Safia — Maison de Haute Parfumerie',
    template: '%s | Dar Safia',
  },
  description:
    "Parfums niche et signatures d'exception, sélectionnés et livrés dans les 58 wilayas.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${cinzelDecorative.variable} ${cinzel.variable} ${cormorant.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Accessibilité : permet de sauter la navigation au clavier. */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-noir"
        >
          Aller au contenu principal
        </a>

        {/* Le provider n'englobe que le contexte : les pages qu'il reçoit en
            children restent des composants serveur. */}
        <CartProvider>
          <SiteHeader />
          {children}
          <CartDrawer />
          <PlaceholderPhoneBanner />
        </CartProvider>
      </body>
    </html>
  );
}
