'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';

import { useReveal } from '@/components/motion/useReveal';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { interpolate } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';
import { whatsappUrl } from '@/lib/whatsapp';

/**
 * ══════════════════════════════════════════════════════════════
 *   CONTACT — LE BUREAU DE CORRESPONDANCE
 * ══════════════════════════════════════════════════════════════
 *
 * Pas un formulaire dans une carte : une feuille sur laquelle on écrit un
 * mot à la maison. Le message se compose en grand, en serif, comme une
 * lettre ; « Envoyer » l'ouvre dans WhatsApp — le seul canal réellement
 * tenu par la conciergerie. Rien n'est envoyé côté serveur, rien n'est
 * conservé : le lien wa.me est construit dans le navigateur, la saisie
 * encodée par `whatsappUrl`.
 *
 * Un seul mouvement, à l'ouverture (useReveal : le titre monte d'un masque,
 * le reste se pose). La zone de texte grandit sous la frappe — ça répond à
 * un geste, donc c'est permis. Sous prefers-reduced-motion, tout est posé.
 */
export function ContactExperience({
  locale,
  dict,
  phoneDisplay,
}: {
  locale: Locale;
  dict: Dictionary;
  phoneDisplay: string;
}) {
  const c = dict.contact;
  const rootRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useReveal(rootRef);

  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  const href = useMemo(() => {
    const body = message.trim() || c.messagePlaceholder;
    const who =
      name.trim() && city.trim()
        ? interpolate(c.signature, { name: name.trim(), city: city.trim() })
        : name.trim()
          ? interpolate(c.signatureNameOnly, { name: name.trim() })
          : city.trim()
            ? interpolate(c.signatureCityOnly, { city: city.trim() })
            : '';

    const lines = [dict.common.orderGreeting, '', body];
    if (who) lines.push('', who);
    return whatsappUrl(lines.join('\n'));
  }, [message, name, city, c, dict.common.orderGreeting]);

  const titleLines = c.title.split('\n');

  /** La zone épouse son contenu : elle ne défile jamais sur elle-même. */
  const grow = () => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${area.scrollHeight}px`;
  };

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl">
      <h1 className="font-body font-light text-ivory">
        {titleLines.map((line) => (
          <span key={line} className="block overflow-hidden">
            <span
              data-rise
              className="block text-[clamp(2.6rem,7vw,5rem)] leading-[1.04] tracking-[-0.02em]"
            >
              {line}
            </span>
          </span>
        ))}
      </h1>

      <p
        data-fade
        className="mt-8 max-w-[46ch] font-body text-[clamp(1.15rem,1.7vw,1.4rem)] leading-[1.6] text-ivory/65"
      >
        {c.lead}
      </p>

      {href ? (
        <>
          <div
            data-fade
            className="mt-14 border border-gold/25 bg-noir-2/60 p-6 md:p-9"
          >
            <label htmlFor="contact-message" className="sr-only">
              {c.messageLabel}
            </label>
            <textarea
              id="contact-message"
              ref={areaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                grow();
              }}
              rows={3}
              placeholder={c.messagePlaceholder}
              className="block w-full resize-none bg-transparent font-body text-[1.2rem] leading-[1.6] text-ivory placeholder:text-ivory/30 focus:outline-none"
            />

            <div className="my-7 h-px bg-smoke-2" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-body text-md text-ivory/45"
                >
                  {c.nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border-b border-smoke-2 bg-transparent pb-1.5 font-body text-lg text-ivory transition-colors focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="contact-city"
                  className="block font-body text-md text-ivory/45"
                >
                  {c.cityLabel}
                </label>
                <input
                  id="contact-city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 block w-full border-b border-smoke-2 bg-transparent pb-1.5 font-body text-lg text-ivory transition-colors focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 flex w-full justify-center rounded-sm bg-gold px-7 py-3.5 font-ui text-2xs font-semibold tracking-(--tracking-label) whitespace-nowrap text-noir uppercase transition-colors hover:bg-gold-light sm:inline-flex sm:w-auto"
            >
              {c.send}
            </a>
            <p className="mt-3 max-w-sm font-ui text-3xs leading-relaxed text-ivory/35">
              {c.sendHint}
            </p>
          </div>

          {phoneDisplay && (
            <p
              data-fade
              className="mt-6 font-ui text-2xs tracking-[0.1em] text-ivory/45"
            >
              <span className="sr-only">{c.phoneLabel} : </span>
              <span dir="ltr">{phoneDisplay}</span>
            </p>
          )}
        </>
      ) : (
        <p data-fade className="mt-14 font-body text-lg text-ivory/60">
          {c.unavailable}
        </p>
      )}

      <ul
        data-fade
        className="mt-16 grid gap-x-8 gap-y-4 sm:grid-cols-3"
      >
        {[c.facts.hours, c.facts.delivery, c.facts.payment].map((fact) => (
          <li
            key={fact}
            className="border-t border-gold/20 pt-4 font-ui text-2xs leading-relaxed tracking-[0.06em] text-ivory/50"
          >
            {fact}
          </li>
        ))}
      </ul>

      <p data-fade className="mt-16 font-body text-lg text-ivory/50">
        {c.undecidedText}{' '}
        <Link
          href={localePath(locale, '/trouver')}
          className="text-ivory/80 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold"
        >
          {c.undecidedLink}
        </Link>
      </p>
    </div>
  );
}
