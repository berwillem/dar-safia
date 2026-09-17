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
 * Un bureau, deux côtés. À gauche, ce qu'on se demande AVANT d'écrire (la
 * FAQ, au même niveau que la lettre et non reléguée sous elle). À droite, la
 * lettre — et, sous elle, le message exactement tel qu'il partira dans
 * WhatsApp, qui se compose pendant qu'on tape.
 *
 * La page vit par ce que fait la personne, pas par de la décoration : la
 * lettre se compose, l'onglet bascule, une réponse se fait nette en
 * s'ouvrant. Un seul mouvement ambiant : la lumière derrière le titre.
 *
 * Deux correspondances, nommées par intention et non par segment de
 * clientèle : écrire à la maison, ou lui proposer une collaboration.
 *
 * Rien n'est envoyé côté serveur, rien n'est conservé : le lien wa.me est
 * construit dans le navigateur, la saisie encodée par `whatsappUrl`.
 *
 * La FAQ ne répond QUE ce que le site affirme déjà ailleurs — 7j/7, 58
 * wilayas, paiement à la livraison, authenticité. Aucun délai chiffré : il
 * n'est pas connu, donc il n'est pas écrit.
 */

type Tab = 'personal' | 'collab';

/** Une ligne du message ; `dim` : texte d'exemple, pas encore écrit. */
type Line = { text: string; dim?: boolean };

const toText = (lines: Line[]) => lines.map((l) => l.text).join('\n');

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
    <div className="group">
      <label htmlFor={id} className="block font-body text-md text-ivory/45">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="peer mt-1 block w-full border-b border-smoke-2 bg-transparent pb-1.5 font-body text-lg text-ivory transition-colors group-hover:border-gold/40 focus:outline-none focus-visible:outline-none"
        />
        {/* Le filet d'encre pousse depuis le bord d'attaque au focus. Il
            REMPLACE le cadre de focus global — un rectangle autour d'un champ
            « sur filet » contredisait sa forme — sans rien retirer à la
            visibilité : 2 px d'or plein, sur toute la largeur. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-500 ease-(--ease-lux) peer-focus:scale-x-100 rtl:origin-right"
        />
      </div>
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
  const greeting = dict.common.orderGreeting;
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

  const personalLines = useMemo<Line[]>(() => {
    const who =
      name.trim() && city.trim()
        ? interpolate(c.signature, { name: name.trim(), city: city.trim() })
        : name.trim()
          ? interpolate(c.signatureNameOnly, { name: name.trim() })
          : city.trim()
            ? interpolate(c.signatureCityOnly, { city: city.trim() })
            : '';
    const lines: Line[] = [
      { text: greeting },
      { text: '' },
      message.trim() ? { text: message.trim() } : { text: c.messagePlaceholder, dim: true },
    ];
    if (who) lines.push({ text: '' }, { text: who });
    return lines;
  }, [message, name, city, c, greeting]);

  const collabLines = useMemo<Line[]>(() => {
    const k = c.collab;
    const lines: Line[] = [{ text: greeting }, { text: '' }, { text: k.intro }];
    if (house.trim()) lines.push({ text: interpolate(k.lineHouse, { house: house.trim() }) });
    if (role.trim()) lines.push({ text: interpolate(k.lineRole, { role: role.trim() }) });
    if (collabCity.trim()) {
      lines.push({ text: interpolate(k.lineCity, { city: collabCity.trim() }) });
    }
    lines.push({ text: interpolate(k.lineSubject, { subject }) }, { text: '' });
    lines.push(
      proposal.trim() ? { text: proposal.trim() } : { text: k.messagePlaceholder, dim: true }
    );
    return lines;
  }, [house, role, collabCity, subject, proposal, c.collab, greeting]);

  const lines = tab === 'personal' ? personalLines : collabLines;
  const href = whatsappUrl(toText(lines));
  const reachable = href !== null;

  // ── Le basculement ──
  // Le panneau ne porte pas de `data-fade` : il est remonté APRÈS la
  // révélation d'ouverture, et un déclencheur déjà consommé le laisserait
  // invisible. Il a donc sa propre entrée — une mise au point, comme le reste.
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
        { opacity: 0, y: 14, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power2.out',
          clearProps: 'filter',
        }
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

  const sendLabel = tab === 'personal' ? c.send : c.collab.send;
  const sendHint = tab === 'personal' ? c.sendHint : c.collab.hint;

  return (
    // La lumière d'ambiance reste DANS la largeur du conteneur : débordante
    // puis rognée, elle laissait une arête franche au bord de la colonne.
    // `overflow-x-clip` (et non `overflow-hidden`) ne sert plus qu'à absorber
    // le flou — un vrai conteneur de défilement décollerait la colonne FAQ.
    <div ref={rootRef} className="relative mx-auto max-w-(--container-site) overflow-x-clip">
      <div
        aria-hidden="true"
        className="ds-ambient pointer-events-none absolute inset-x-0 -top-40 h-[36rem]"
      />

      {/* ── Le titre, et sa phrase posée sur la même ligne de base ── */}
      <header className="relative grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
        <h1 className="font-body font-light text-ivory lg:col-span-7">
          {titleLines.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <span
                data-rise
                className="block text-[clamp(2.8rem,7.5vw,6rem)] leading-[1] tracking-[-0.025em]"
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          data-fade
          className="max-w-[40ch] font-body text-[clamp(1.15rem,1.5vw,1.35rem)] leading-[1.6] text-ivory/60 lg:col-span-4 lg:col-start-9 lg:pb-3"
        >
          {c.lead}
        </p>
      </header>

      <div className="relative mt-20 grid gap-20 lg:mt-28 lg:grid-cols-12 lg:gap-12">
        {/* ── Avant de nous écrire ── */}
        <section
          aria-labelledby="faq-titre"
          className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
        >
          <h2 id="faq-titre" className="font-body font-light text-ivory">
            <span className="block overflow-hidden">
              <span
                data-rise
                className="block text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.15] tracking-[-0.015em]"
              >
                {c.faqTitle}
              </span>
            </span>
          </h2>

          <ul className="mt-8">
            {c.faq.map((item, i) => {
              const open = openFaq === i;
              return (
                <li key={item.q} data-fade className="border-t border-gold/15 last:border-b">
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={open}
                      aria-controls={`faq-r-${i}`}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="group flex w-full items-start justify-between gap-6 py-5 text-start"
                    >
                      <span
                        className={`ds-text-lift font-body text-[clamp(1.1rem,1.4vw,1.28rem)] leading-snug transition-colors ${
                          open ? 'text-ivory' : 'text-ivory/70'
                        }`}
                      >
                        {item.q}
                      </span>

                      {/* Une croix qui devient un trait : le signe DIT l'état. */}
                      <span aria-hidden="true" className="relative mt-2 block h-3 w-3 shrink-0">
                        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gold" />
                        <span
                          className="absolute inset-y-0 start-1/2 w-px bg-gold transition-transform duration-500 ease-(--ease-lux)"
                          style={{ transform: `translateX(-50%) scaleY(${open ? 0 : 1})` }}
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
                      <p className="max-w-[52ch] pb-6 font-body text-lg leading-[1.65] text-ivory/55">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <p data-fade className="mt-6 max-w-[40ch] font-body text-md leading-relaxed text-ivory/40">
            {c.faqFootnote}
          </p>
        </section>

        {/* ── La lettre ── */}
        <div className="lg:col-span-7">
          {reachable ? (
            <div data-fade>
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
                    className="group flex flex-col gap-1.5 pb-5 text-start"
                  >
                    <span className="font-body text-[clamp(1.2rem,1.8vw,1.5rem)] leading-tight text-ivory/40 transition-colors duration-500 group-hover:text-ivory/75 group-aria-selected:text-ivory">
                      {label}
                    </span>
                    <span className="font-body text-md leading-snug text-ivory/30 transition-colors duration-500 group-aria-selected:text-gold-light/70">
                      {hint}
                    </span>
                  </button>
                ))}

                {/* Le filet glisse d'un onglet à l'autre. `inset-inline-start`
                    plutôt qu'un `translateX` : en arabe il part tout seul dans
                    l'autre sens. */}
                <span
                  aria-hidden="true"
                  className="ds-shine-x absolute -bottom-px h-px w-[calc(50%-0.75rem)] transition-[inset-inline-start] duration-700 ease-(--ease-lux)"
                  style={{ insetInlineStart: tab === 'collab' ? 'calc(50% + 0.75rem)' : '0' }}
                />
              </div>

              <div
                ref={panelRef}
                role="tabpanel"
                id="panneau-correspondance"
                aria-labelledby={`onglet-${tab}`}
                tabIndex={0}
                className="mt-10 focus-visible:outline-none"
              >
                <div className="border border-gold/20 bg-noir-2/55 p-6 transition-colors duration-500 focus-within:border-gold/45 md:p-9">
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
                        className="block w-full resize-none bg-transparent font-body text-[1.25rem] leading-[1.6] text-ivory placeholder:text-ivory/30 focus:outline-none"
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

                      {/* L'objet : des pastilles plutôt qu'un menu déroulant —
                          le choix se voit d'un coup d'œil, et il se touche. */}
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
                              className="ds-btn-ghost rounded-full border border-smoke-2 px-4 py-1.5 font-body text-md text-ivory/65 transition-colors hover:border-gold hover:text-noir aria-pressed:border-gold aria-pressed:bg-gold/10 aria-pressed:text-gold-light"
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
                        className="block w-full resize-none bg-transparent font-body text-[1.25rem] leading-[1.6] text-ivory placeholder:text-ivory/30 focus:outline-none"
                      />
                    </>
                  )}
                </div>

                {/* ── Le message, tel qu'il partira ──
                    Ce n'est pas une décoration : c'est la promesse « rien
                    n'est envoyé sans relecture » rendue visible. */}
                <figure className="mt-10">
                  <figcaption className="font-body text-md text-ivory/40">
                    {c.previewLabel}
                  </figcaption>
                  <blockquote className="mt-4 border-s border-gold/45 ps-6 font-body text-[1.1rem] leading-[1.7] text-ivory/80">
                    {lines.map((line, i) =>
                      line.text ? (
                        <span
                          key={i}
                          className={`block whitespace-pre-line transition-colors duration-500 ${
                            line.dim ? 'text-ivory/30 italic' : ''
                          }`}
                        >
                          {line.text}
                        </span>
                      ) : (
                        <span key={i} aria-hidden="true" className="block h-[0.9em]" />
                      )
                    )}
                  </blockquote>
                </figure>

                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn mt-10 flex w-full justify-center rounded-sm bg-gold px-8 py-4 font-ui text-2xs font-semibold tracking-(--tracking-label) whitespace-nowrap text-noir uppercase transition-colors hover:bg-gold-light sm:inline-flex sm:w-auto"
                >
                  {sendLabel}
                </a>
                <p className="mt-3 max-w-md font-body text-md leading-relaxed text-ivory/40">
                  {sendHint}
                </p>

                {phoneDisplay && (
                  <p className="mt-5 font-ui text-2xs tracking-[0.1em] text-ivory/40">
                    <span className="sr-only">{c.phoneLabel} : </span>
                    <span dir="ltr">{phoneDisplay}</span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p data-fade className="font-body text-lg text-ivory/60">
              {c.unavailable}
            </p>
          )}
        </div>
      </div>

      {/* ── Ce qui tient en trois mots ── */}
      <div className="relative mt-28 grid gap-10 border-t border-gold/15 pt-10 lg:mt-36 lg:grid-cols-12 lg:gap-12">
        <ul data-fade className="grid gap-x-10 gap-y-3 sm:grid-cols-3 lg:col-span-7">
          {[c.facts.hours, c.facts.delivery, c.facts.payment].map((fact) => (
            <li key={fact} className="font-body text-lg leading-snug text-ivory/60">
              {fact}
            </li>
          ))}
        </ul>
        <p
          data-fade
          className="font-body text-lg text-ivory/50 lg:col-span-4 lg:col-start-9 lg:text-end"
        >
          {c.undecidedText}{' '}
          <Link href={localePath(locale, '/trouver')} className="ds-inklink text-ivory/85">
            {c.undecidedLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
