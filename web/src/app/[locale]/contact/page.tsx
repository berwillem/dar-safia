import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { formatWhatsappPhone, whatsappPhone } from '@/lib/whatsapp';

import { ContactExperience } from './ContactExperience';

/**
 * Page contact. Coquille serveur : métadonnées, données structurées, puis
 * l'expérience client (composition du message + lien WhatsApp).
 *
 * Aucune coordonnée n'est inventée : la maison n'expose pour l'instant que
 * sa conciergerie WhatsApp (numéro public, réel). E-mail et adresse
 * physique restent absents tant qu'ils ne sont pas confirmés.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return { title: dict.nav.contact, description: dict.contact.lead };
}

export default async function ContactPage({
  params,
}: PageProps<'/[locale]/contact'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: dict.nav.contact,
    inLanguage: locale,
    about: {
      '@type': 'Organization',
      name: dict.common.brandName,
      areaServed: 'DZ',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        ...(whatsappPhone ? { telephone: `+${whatsappPhone}` } : {}),
        availableLanguage: ['French', 'Arabic', 'English'],
      },
    },
  };

  return (
    <main
      id="contenu"
      tabIndex={-1}
      className="px-6 pt-32 pb-24 md:px-10 md:pt-40 md:pb-32"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactExperience
        locale={locale}
        dict={dict}
        phoneDisplay={formatWhatsappPhone()}
      />
    </main>
  );
}
