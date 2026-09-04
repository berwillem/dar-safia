'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { useI18n } from '@/components/i18n/I18nProvider';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionary';
import { localePath } from '@/lib/i18n/routing';
import { QUIZ_STEPS, type QuizAnswers, type QuizStepKey } from '@/lib/quiz/types';
import { whatsappUrl } from '@/lib/whatsapp';

import { diagnoseScent, type ScentDiagnosis } from './actions';

/**
 * Diagnostic olfactif — parcours en quatre étapes.
 *
 * Seul l'enchaînement des questions est client. Le score tourne côté serveur
 * (diagnoseScent), le catalogue n'est jamais envoyé au navigateur. Rien n'est
 * persisté.
 */
type Phase =
  | { name: 'question'; step: number }
  | { name: 'loading' }
  | { name: 'result'; diagnosis: ScentDiagnosis }
  | { name: 'error' };

const primaryButton =
  'rounded-sm bg-gold px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-noir uppercase transition-colors hover:bg-gold-light';
const secondaryButton =
  'mt-2 inline-block rounded-sm border border-smoke-2 px-6 py-3 text-2xs font-semibold tracking-(--tracking-label) text-ivory/75 uppercase transition-colors hover:border-gold hover:text-gold';

export function ScentFinder() {
  const { locale, dict, fill } = useI18n();
  const sf = dict.scentFinder;

  const [phase, setPhase] = useState<Phase>({ name: 'question', step: 0 });
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [, startTransition] = useTransition();

  function choose<K extends QuizStepKey>(key: K, value: QuizAnswers[K]) {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    const stepIndex = QUIZ_STEPS.findIndex((s) => s.key === key);
    if (stepIndex < QUIZ_STEPS.length - 1) {
      setPhase({ name: 'question', step: stepIndex + 1 });
      return;
    }

    setPhase({ name: 'loading' });
    startTransition(async () => {
      const diagnosis = await diagnoseScent(next, locale);
      setPhase(diagnosis ? { name: 'result', diagnosis } : { name: 'error' });
    });
  }

  function restart() {
    setAnswers({});
    setPhase({ name: 'question', step: 0 });
  }

  if (phase.name === 'loading') {
    return (
      <p className="py-20 text-center font-body text-xl text-ivory/60" aria-live="polite">
        {sf.loading}
      </p>
    );
  }

  if (phase.name === 'error') {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-xl text-ivory/70">{sf.error}</p>
        <button type="button" onClick={restart} className={secondaryButton}>
          {sf.restart}
        </button>
      </div>
    );
  }

  if (phase.name === 'result') {
    return (
      <ScentResultView
        diagnosis={phase.diagnosis}
        onRestart={restart}
        locale={locale}
        dict={dict}
        fill={fill}
      />
    );
  }

  const step = QUIZ_STEPS[phase.step];
  const question = (sf.questions as Record<string, string>)[step.key];
  const options = sf.options as Record<string, { label: string; hint: string }>;
  const pct = Math.round((phase.step / QUIZ_STEPS.length) * 100);

  return (
    <div>
      <span className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
        {fill(sf.stepLabel, { current: phase.step + 1, total: QUIZ_STEPS.length })}
      </span>
      <div className="mt-2 h-px w-full bg-smoke-2" role="presentation">
        <div
          className="h-px bg-gold transition-[width] duration-500 ease-(--ease-lux)"
          style={{ width: `${pct}%` }}
        />
      </div>

      <fieldset className="mt-8">
        <legend className="font-serif text-display-sm text-balance text-ivory">
          {question}
        </legend>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {step.options.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => choose(step.key, value as never)}
              className="group flex flex-col items-start rounded-md border border-smoke-2 bg-noir-2 p-5 text-start transition-colors hover:border-gold/60"
            >
              <span className="font-serif text-lg text-ivory transition-colors group-hover:text-gold">
                {options[value]?.label ?? value}
              </span>
              <span className="mt-1 text-2xs text-ivory/50">{options[value]?.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {phase.step > 0 && (
        <button
          type="button"
          onClick={() => setPhase({ name: 'question', step: phase.step - 1 })}
          className="mt-6 text-2xs tracking-(--tracking-label) text-ivory/45 uppercase transition-colors hover:text-ivory"
        >
          {sf.previous}
        </button>
      )}
    </div>
  );
}

type Fill = (t: string, p?: Record<string, string | number>) => string;

function ScentResultView({
  diagnosis,
  onRestart,
  locale,
  dict,
  fill,
}: {
  diagnosis: ScentDiagnosis;
  onRestart: () => void;
  locale: Locale;
  dict: Dictionary;
  fill: Fill;
}) {
  const sf = dict.scentFinder;
  const { match, alternatives } = diagnosis;

  const orderUrl = whatsappUrl(
    [
      dict.common.orderGreeting,
      '',
      sf.orderIntro,
      `• ${match.name} (${match.brandName})`,
      `• ${match.priceLabel}`,
      '',
      sf.orderOutro,
    ].join('\n')
  );

  return (
    <div>
      <p className="text-3xs tracking-(--tracking-eyebrow) text-gold uppercase">
        {sf.resultEyebrow}
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-[minmax(0,3fr)_minmax(0,4fr)] sm:items-center">
        <div className="overflow-hidden rounded-md border border-smoke-2 bg-noir-2">
          {match.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={match.imageUrl}
              srcSet={match.imageSrcset ?? undefined}
              sizes="(max-width: 640px) 90vw, 320px"
              alt={`${match.name} — ${match.brandName}`}
              decoding="async"
              className="aspect-4/5 w-full object-cover"
            />
          )}
        </div>

        <div>
          <span className="text-3xs tracking-(--tracking-label) text-gold uppercase">
            {match.brandName}
          </span>
          <h2 className="mt-2 font-serif text-display-sm text-balance text-ivory">
            {match.name}
          </h2>
          <p className="mt-3 text-2xs text-ivory/50">
            {fill(sf.compatibility, { percent: match.compatibility })}
          </p>
          <p className="mt-4 font-serif text-xl text-gold-light tabular-nums">
            {match.priceLabel}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={localePath(locale, `/parfums/${match.slug}`)}
              className={primaryButton}
            >
              {sf.seeProduct}
            </Link>
            {orderUrl && (
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButton}
              >
                {sf.order}
              </a>
            )}
          </div>
        </div>
      </div>

      {alternatives.length > 0 && (
        <div className="mt-14">
          <h3 className="border-b border-smoke-2 pb-3 text-2xs tracking-(--tracking-label) text-ivory/60 uppercase">
            {sf.alsoLike}
          </h3>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {alternatives.map((alt) => (
              <li key={alt.slug}>
                <Link
                  href={localePath(locale, `/parfums/${alt.slug}`)}
                  className="flex gap-3 rounded-md border border-smoke-2 bg-noir-2 p-3 transition-colors hover:border-gold/50"
                >
                  {alt.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={alt.imageUrl}
                      alt=""
                      width={56}
                      height={70}
                      loading="lazy"
                      decoding="async"
                      className="h-[70px] w-14 shrink-0 rounded-xs object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="text-3xs tracking-(--tracking-label) text-gold uppercase">
                      {alt.brandName}
                    </span>
                    <span className="mt-0.5 block truncate font-serif text-md text-ivory">
                      {alt.name}
                    </span>
                    <span className="mt-1 block text-2xs text-ivory/45 tabular-nums">
                      {alt.priceLabel} · {alt.compatibility}%
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onRestart}
        className="mt-10 block text-2xs tracking-(--tracking-label) text-ivory/45 uppercase transition-colors hover:text-ivory"
      >
        {sf.redo}
      </button>
    </div>
  );
}
