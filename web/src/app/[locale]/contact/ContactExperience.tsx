'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

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
 * Pas un formulaire dans une carte : une feuille sur laquelle on écrit un mot
 * à la maison. Le message se compose en grand, en serif, comme une lettre.
 *
 * DEUX correspondances, pas deux pages : on écrit à la maison, ou on lui
 * propose une collaboration. Elles ne sont pas nommées par segment de
 * clientèle — on nomme l'intention, pas la case. Le basculement est le seul
 * endroit de la page où un geste change la forme : il mérite donc d'être vu
 * (le filet or glisse, le panneau se repose).
 *
 * Rien n'est envoyé côté serveur, rien n'est conservé : le lien wa.me est
 * construit dans le navigateur et la saisie encodée par `whatsappUrl`.
 *
 * La FAQ ne répond QUE ce que le site affirme déjà ailleurs — 7j/7, 58
 * wilayas, paiement à la livraison, authenticité. Aucun délai chiffré n'y
 * figure : il n'est pas connu, donc il n'est pas écrit.
 */

type Tab = 'personal' | 'collab';

/** La zone épouse son contenu : elle ne défile jamais sur elle-même. */
function grow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

/** Champ sur filet — la même ligne partout, qui s'allume au focus. */
function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-body text-md text-ivory/45">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border-b border-smoke-2 bg-transparent pb-1.5 font-body text-lg text-ivory transition-colors hover:border-gold/45 focus:border-gold focus:outline-none"
      />
    </div>
  );
}

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
  useReveal(rootRef);

  const [tab, setTab] = useState<Tab>('personal');

  // ── Écrire à la maison ──
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  // ── Proposer une collaboration ──
  const [house, setHouse] = useState('');
  const [role, setRole] = useState('');
  const [collabCity, setCollabCity] = useState('');
  const [subject, setSubject] = useState(c.collab.subjects[0]);
  const [proposal, setProposal] = useState('');

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const personalHref = useMemo(() => {
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

  const collabHref = useMemo(() => {
    const k = c.collab;
    const lines = [dict.common.orderGreeting, '', k.intro];
    if (house.trim()) lines.push(interpolate(k.lineHouse, { house: house.trim() }));
    if (role.trim()) lines.push(interpolate(k.lineRole, { role: role.trim() }));
    if (collabCity.trim()) lines.push(interpolate(k.lineCity, { city: collabCity.trim() }));
    lines.push(interpolate(k.lineSubject, { subject }));
    lines.push('', proposal.trim() || k.messagePlaceholder);
    return whatsappUrl(lines.join('\n'));
  }, [house, role, collabCity, subject, proposal, c.collab, dict.common.orderGreeting]);

  const reachable = personalHref !== null;

  // ── Le basculement ──
  // Les panneaux ne portent pas de `data-fade` : ils sont montés APRÈS la
  // révélation d'ouverture, et un ScrollTrigger `once` déjà consommé les
  // laisserait à opacité nulle. Ils ont donc leur propre entrée.
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    void import('gsap').then(({ gsap }) => {
      if (cancelled || !panelRef.current) return;
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  // Tabulation itinérante : au clavier, la sélection emporte le focus.
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    personal: null,
    collab: null,
  });
  const byKeyboard = useRef(false);
  useEffect(() => {
    if (!byKeyboard.current) return;
    byKeyboard.current = false;
    tabRefs.current[tab]?.focus();
  }, [tab]);

  const onTabKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    byKeyboard.current = true;
    setTab((t) => (t === 'personal' ? 'collab' : 'personal'));
  };

  const titleLines = c.title.split('\n');
  const tabs: { key: Tab; label: string; hint: string }[] = [
    { key: 'personal', label: c.tabs.personal.label, hint: c.tabs.personal.hint },
    { key: 'collab', label: c.tabs.collab.label, hint: c.tabs.collab.hint },
  ];

  return (
    <div ref={rootRef} className="mx-auto max-w-2xl">
      <p
        data-fade
        className="font-ui text-2xs tracking-(--tracking-eyebrow) text-gold uppercase"
      >
        {c.eyebrow}
      </p>

      <h1 className="mt-5 font-body font-light text-ivory">
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

      {reachable ? (
        <>
          {/* ── Les deux correspondances ── */}
          <div data-fade className="mt-16">
            <div
              role="tablist"
              aria-label={c.eyebrow}
              onKeyDown={onTabKeys}
              className="relative grid grid-cols-2 gap-6 border-b border-smoke-2"
            >
              {tabs.map(({ key, label, hint }) => (
                <button
                  key={key}
                  ref={(el) => {
                    tabRefs.current[key] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`onglet-${key}`}
                  aria-selected={tab === key}
                  aria-controls="panneau-correspondance"
                  tabIndex={tab === key ? 0 : -1}
                  onClick={() => setTab(key)}
                  className="group flex flex-col gap-1 pb-4 text-start"
                >
                  <span className="ds-text-lift font-ui text-2xs tracking-[0.16em] text-ivory/50 uppercase group-aria-selected:text-gold">
                    {label}
                  </span>
                  <span className="font-body text-md leading-snug text-ivory/35">
                    {hint}
                  </span>
                </button>
              ))}

              {/* Le filet glisse d'un onglet à l'autre. `inset-inline-start`
                  plutôt qu'un `translateX` : en arabe il part tout seul dans
                  l'autre sens, sans condition sur la direction de lecture. */}
              <span
                aria-hidden="true"
                className="absolute -bottom-px h-px w-[calc(50%-0.75rem)] bg-gold transition-[inset-inline-start] duration-500 ease-(--ease-lux)"
                style={{ insetInlineStart: tab === 'collab' ? 'calc(50% + 0.75rem)' : '0' }}
              />
            </div>

            <div
              ref={panelRef}
              role="tabpanel"
              id="panneau-correspondance"
              aria-labelledby={`onglet-${tab}`}
              tabIndex={0}
              className="mt-10 border border-gold/25 bg-noir-2/60 p-6 focus-visible:outline-none md:p-9"
            >
              {tab === 'personal' ? (
                <>
                  <label htmlFor="contact-message" className="sr-only">
                    {c.messageLabel}
                  </label>
                  <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      grow(e.target);
                    }}
                    rows={3}
                    placeholder={c.messagePlaceholder}
                    className="block w-full resize-none bg-transparent font-body text-[1.2rem] leading-[1.6] text-ivory placeholder:text-ivory/30 focus:outline-none"
                  />

                  <div className="my-7 h-px bg-smoke-2" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      id="contact-name"
                      label={c.nameLabel}
                      value={name}
                      onChange={setName}
                      autoComplete="given-name"
                    />
                    <Field
                      id="contact-city"
                      label={c.cityLabel}
                      value={city}
                      onChange={setCity}
                      autoComplete="address-level2"
                    />
                  </div>

                  <a
                    href={personalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-btn mt-9 flex w-full justify-center rounded-sm bg-gold px-7 py-3.5 font-ui text-2xs font-semibold tracking-(--tracking-label) whitespace-nowrap text-noir uppercase transition-colors hover:bg-gold-light sm:inline-flex sm:w-auto"
                  >
                    {c.send}
                  </a>
                  <p className="mt-3 max-w-sm font-ui text-3xs leading-relaxed text-ivory/35">
                    {c.sendHint}
                  </p>
                </>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field
                      id="collab-house"
                      label={c.collab.houseLabel}
                      value={house}
                      onChange={setHouse}
                      autoComplete="organization"
                    />
                    <Field
                      id="collab-role"
                      label={c.collab.roleLabel}
                      value={role}
                      onChange={setRole}
                      autoComplete="organization-title"
                    />
                    <Field
                      id="collab-city"
                      label={c.collab.cityLabel}
                      value={collabCity}
                      onChange={setCollabCity}
                      autoComplete="address-level2"
                    />
                  </div>

                  {/* L'objet : quatre pastilles plutôt qu'un menu déroulant.
                      Le choix est visible d'un coup d'œil, et il se touche. */}
                  <fieldset className="mt-8">
                    <legend className="font-body text-md text-ivory/45">
                      {c.collab.subjectLabel}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      {c.collab.subjects.map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={subject === s}
                          onClick={() => setSubject(s)}
                          className="ds-btn-ghost rounded-sm border border-smoke-2 px-4 py-2 font-ui text-2xs tracking-[0.1em] text-ivory/70 uppercase transition-colors hover:border-gold hover:text-noir aria-pressed:border-gold aria-pressed:text-gold"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="my-7 h-px bg-smoke-2" />

                  <label htmlFor="collab-message" className="sr-only">
                    {c.collab.messageLabel}
                  </label>
                  <textarea
                    id="collab-message"
                    value={proposal}
                    onChange={(e) => {
                      setProposal(e.target.value);
                      grow(e.target);
                    }}
                    rows={3}
                    placeholder={c.collab.messagePlaceholder}
                    className="block w-full resize-none bg-transparent font-body text-[1.2rem] leading-[1.6] text-ivory placeholder:text-ivory/30 focus:outline-none"
                  />

                  <a
                    href={collabHref ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-btn mt-9 flex w-full justify-center rounded-sm bg-gold px-7 py-3.5 font-ui text-2xs font-semibold tracking-(--tracking-label) whitespace-nowrap text-noir uppercase transition-colors hover:bg-gold-light sm:inline-flex sm:w-auto"
                  >
                    {c.collab.send}
                  </a>
                  <p className="mt-3 max-w-sm font-ui text-3xs leading-relaxed text-ivory/35">
                    {c.collab.hint}
                  </p>
                </>
              )}
            </div>
          </div>

          {phoneDisplay && (
            <p data-fade className="mt-6 font-ui text-2xs tracking-[0.1em] text-ivory/45">
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

      <ul data-fade className="mt-16 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {[c.facts.hours, c.facts.delivery, c.facts.payment].map((fact) => (
          <li
            key={fact}
            className="border-t border-gold/20 pt-4 font-ui text-2xs leading-relaxed tracking-[0.06em] text-ivory/50"
          >
            {fact}
          </li>
        ))}
      </ul>

      {/* ── Questions fréquentes ── */}
      <section aria-labelledby="faq-titre" className="mt-24 md:mt-32">
        <h2 id="faq-titre" className="font-body font-light text-ivory">
          <span className="block overflow-hidden">
            <span
              data-rise
              className="block text-[clamp(1.75rem,4vw,2.6rem)] leading-[1.1] tracking-[-0.015em]"
            >
              {c.faqTitle}
            </span>
          </span>
        </h2>

        <ul className="mt-10">
          {c.faq.map((item, i) => {
            const open = openFaq === i;
            return (
              <li key={item.q} data-fade className="border-t border-gold/20 last:border-b">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-r-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-start"
                  >
                    <span className="ds-text-lift font-body text-[clamp(1.15rem,2vw,1.45rem)] leading-snug text-ivory">
                      {item.q}
                    </span>

                    {/* Une croix qui devient un trait : le signe DIT l'état,
                        il ne se contente pas de tourner. */}
                    <span
                      aria-hidden="true"
                      className="relative mt-2 block h-3 w-3 shrink-0"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gold" />
                      <span
                        className="absolute inset-y-0 start-1/2 w-px bg-gold transition-transform duration-500 ease-(--ease-lux)"
                        style={{
                          transform: `translateX(-50%) scaleY(${open ? 0 : 1})`,
                        }}
                      />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-r-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className="ds-panel"
                  data-open={open || undefined}
                >
                  <div>
                    <p className="max-w-[58ch] pb-7 font-body text-lg leading-[1.65] text-ivory/60">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p data-fade className="mt-8 font-ui text-3xs leading-relaxed text-ivory/35">
          {c.faqFootnote}
        </p>
      </section>

      <p data-fade className="mt-20 font-body text-lg text-ivory/50">
        {c.undecidedText}{' '}
        <Link href={localePath(locale, '/trouver')} className="ds-inklink text-ivory/80">
          {c.undecidedLink}
        </Link>
      </p>
    </div>
  );
}
